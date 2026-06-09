import os
import io
import imghdr
import tempfile
import warnings

import pydicom
from PIL import Image

# OCR + PDF imports (your original pipeline)
import cv2
import numpy as np
from paddleocr import PaddleOCR
from pdf2image import convert_from_path
from PyPDF2 import PdfReader
import re
from rapidfuzz import process, fuzz

# LLM
from langchain_groq import ChatGroq
from langchain_groq import ChatGroq
try:
    from .config import GROQ_API_KEY, GEMINI_API_KEY
    from .medical_agent import medical_agent, MRI_PROMPT
except ImportError:
    from config import GROQ_API_KEY, GEMINI_API_KEY
    from medical_agent import medical_agent, MRI_PROMPT

import google.generativeai as genai

genai.configure(api_key=GEMINI_API_KEY)

warnings.filterwarnings("ignore")
os.environ["KMP_WARNINGS"] = "off"

# -------------------------
# ORIGINAL OCR CONFIG
# -------------------------
ocr = PaddleOCR(use_angle_cls=True, lang='en')

MEDICAL_KEYWORDS = [
    "paracetamol", "amoxicillin", "metformin", "insulin", "bp", "sugar",
    "hypertension", "prescription", "tablet", "capsule", "mg", "ml", "ecg",
    "cholesterol", "ultrasound", "ct", "mri", "dose", "diabetes", "report"
]
FUZZY_THRESHOLD = 80


# ============================================================
#                 1️⃣   MRI HANDLING SECTION
# ============================================================

def is_dicom_bytes(b: bytes) -> bool:
    return len(b) > 132 and b[128:132] == b"DICM"


def detect_mri(filename: str, file_bytes: bytes) -> bool:
    """
    Detect DICOM (.dcm) and MRI-like images.
    """
    name = (filename or "").lower()

    # If it's DICOM
    if name.endswith((".dcm", ".dicom")) or is_dicom_bytes(file_bytes):
        return True

    # Regular MRI images (JPG/PNG)
    if name.endswith((".jpg", ".jpeg", ".png")):
        kind = imghdr.what(None, h=file_bytes[:512])
        if kind in ("jpeg", "png"):
            return True

    return False


def dicom_bytes_to_pil(file_bytes: bytes) -> Image.Image:
    ds = pydicom.dcmread(io.BytesIO(file_bytes))
    arr = ds.pixel_array.astype(float)
    arr = (255 * (arr - arr.min()) / (arr.ptp() + 1e-8)).astype("uint8")

    if arr.ndim == 2:
        pil = Image.fromarray(arr).convert("RGB")
    else:
        pil = Image.fromarray(arr[:, :, 0]).convert("RGB")

    return pil


def image_bytes_to_pil(file_bytes: bytes) -> Image.Image:
    return Image.open(io.BytesIO(file_bytes)).convert("RGB")


def pil_to_tempfile(pil_img):
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    pil_img.save(tmp.name, "JPEG")
    tmp.close()
    return tmp.name


def analyze_mri_image(file_bytes: bytes, filename: str) -> str:
    """
    Sends MRI image ONLY to Gemini medical imaging agent.
    """

    # Convert bytes → PIL
    if filename.lower().endswith((".dcm", ".dicom")) or is_dicom_bytes(file_bytes):
        pil = dicom_bytes_to_pil(file_bytes)
    else:
        pil = image_bytes_to_pil(file_bytes)

    temp_path = pil_to_tempfile(pil)

    try:
        from agno.media import Image as AgnoImage
        agno_img = AgnoImage(filepath=temp_path)

        response = medical_agent.run(MRI_PROMPT, images=[agno_img])

        report_text = (
            response if isinstance(response, str)
            else getattr(response, "content", str(response))
        )

        if not report_text.startswith("📋"):
            report_text = "📋 Analysis Report\n\n" + report_text

        return report_text

    except Exception as e:
        return f"⚠️ MRI Analysis Error: {e}"

    finally:
        try:
            os.remove(temp_path)
        except:
            pass


# ============================================================
#                 2️⃣   ORIGINAL OCR SECTION
# ============================================================

def extract_keywords_fuzzy(text):
    found = set()
    lower_text = text.lower()
    for kw in MEDICAL_KEYWORDS:
        if kw in lower_text:
            found.add(kw)

    tokens = re.findall(r"[A-Za-z0-9\/\-]+", lower_text)

    for token in tokens:
        match = process.extractOne(
            token, MEDICAL_KEYWORDS, scorer=fuzz.partial_ratio
        )
        if match and match[1] >= FUZZY_THRESHOLD:
            found.add(match[0])

    return sorted(found)


def extract_text_from_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        text = " ".join(page.extract_text() or "" for page in reader.pages)

        if len(text.strip()) > 20:
            return text

        images = convert_from_path(file_path, dpi=300, fmt="jpeg")
        text_blocks = []

        for img in images:
            tmp_path = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg").name
            img.save(tmp_path, "JPEG")

            result = ocr.ocr(tmp_path)

            for page in result:
                for line in page:
                    if isinstance(line, list) and len(line) >= 2:
                        t = line[1][0]
                        conf = line[1][1]

                        if conf > 0.55:
                            text_blocks.append(t)

            os.remove(tmp_path)

        return (
            " ".join(text_blocks)
            if text_blocks
            else "No text found in PDF."
        )

    except Exception as e:
        return f"PDF extraction error: {e}"


def extract_text_from_image(file_path):
    try:
        # Use Gemini Flash for fast and accurate handwriting recognition (OCR)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Load image properly
        img = Image.open(file_path)
        
        # Prompt for extraction
        response = model.generate_content([
            "Transcribe this medical document text exactly as it appears. If it is handwriting, do your best to transcribe it.", 
            img
        ])
        
        return response.text if response.text else "No text found in image."
    except Exception as e:
        return f"Image OCR error: {e}"


# ============================================================
#                 3️⃣   ORIGINAL LLM SUMMARIZER
# ============================================================

def interpret_report_with_llm(extracted_text):
    system_prompt = (
        "You are a medical report summarizer and analyzer.\n"
        "1. Detect report type\n"
        "2. Extract main findings\n"
        "3. Patient-friendly summary\n"
        "4. If unclear → say 'Invalid or unreadable'"
    )

    llm = ChatGroq(model_name="llama-3.1-8b-instant", api_key=GROQ_API_KEY)

    prompt = f"{system_prompt}\n\nExtracted Text:\n{extracted_text}"

    try:
        response = llm.invoke(prompt)
        return response.content if hasattr(response, "content") else str(response)
    except Exception as e:
        return f"Error interpreting report: {str(e)}"


# ============================================================
#                 4️⃣   MAIN ENTRYPOINT (UNIFIED)
# ============================================================

def analyze_medical_file(file_bytes, filename="upload"):

    # --- NEW: MRI AUTO-DETECTION ---
    if detect_mri(filename, file_bytes):
        return analyze_mri_image(file_bytes, filename)

    # --- ORIGINAL PIPELINE BELOW ---
    signatures = {
        b"%PDF": ".pdf",
        b"\xFF\xD8\xFF": ".jpg",
        b"\x89PNG\r\n\x1a\n": ".png"
    }

    ext = next((ext for sig, ext in signatures.items() if file_bytes.startswith(sig)), None)

    if not ext:
        return "Unsupported file type."

    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(file_bytes)
        path = tmp.name

    try:
        if ext == ".pdf":
            extracted_text = extract_text_from_pdf(path)
        else:
            extracted_text = extract_text_from_image(path)

        if len(extracted_text.strip()) < 10 or "Error" in extracted_text:
            return "Could not extract readable text."

        keywords = extract_keywords_fuzzy(extracted_text)

        if keywords:
            extracted_text += "\n\n[Detected Keywords]: " + ", ".join(keywords)

        return interpret_report_with_llm(extracted_text)

    finally:
        os.remove(path)


# ============================================================
#                 5️⃣   TREND ANALYSIS (NEW)
# ============================================================

def extract_biomarkers_gemini(text: str) -> dict:
    """
    Uses Gemini to extract structured JSON data (Date + Biomarkers) from report text.
    """
    system_prompt = (
        "You are a medical data extractor. Extract the date of the medical report and all quantitative biomarkers (lab results, vitals). "
        "Return the output as a valid JSON object with this exact structure:\\n"
        "{\\n"
        "  \"date\": \"YYYY-MM-DD\" (or null if not found),\\n"
        "  \"metrics\": [\\n"
        "    { \"name\": \"Hemoglobin\", \"value\": 13.5, \"unit\": \"g/dL\" },\\n"
        "    { \"name\": \"Total Cholesterol\", \"value\": 180, \"unit\": \"mg/dL\" }\\n"
        "  ]\\n"
        "}\\n"
        "Rules:\\n"
        "1. Standardize metric names (e.g., 'HbA1c', 'Glucose Fasting', 'Total Cholesterol').\\n"
        "2. Convert all numeric values to floats/ints. Remove '<' or '>' symbols if present.\\n"
        "3. Only include items with numeric values.\\n"
        "4. Output ONLY valid JSON, no markdown formatting."
    )
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content([system_prompt, text])
        
        # Clean response to ensure it's pure JSON
        content = response.text
        content = content.replace("```json", "").replace("```", "").strip()
        
        import json
        return json.loads(content)
    
    except Exception as e:
        print(f"Error extracting biomarkers: {e}")
        return {"date": None, "metrics": []}


def process_trends(files_data: list) -> list:
    """
    Process regular files for trend analysis.
    files_data is a list of tuples: (filename, file_bytes)
    """
    results = []
    
    for filename, file_bytes in files_data:
        # Reuse existing text extraction logic
        # We need to save to temp file because extract_text functions rely on file paths
        ext = ".pdf" if filename.lower().endswith(".pdf") else ".jpg" 
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
            
        try:
            text = ""
            if ext == ".pdf":
                text = extract_text_from_pdf(tmp_path)
            else:
                text = extract_text_from_image(tmp_path)
                
            if len(text) > 10:
                data = extract_biomarkers_gemini(text)
                data["filename"] = filename
                results.append(data)
                
        finally:
            try:
                os.remove(tmp_path)
            except:
                pass
                
    return results
