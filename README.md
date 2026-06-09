# Mediflow - Multimodal AI Healthcare Assistant

**Mediflow** is an advanced edge-to-cloud Artificial Intelligence healthcare assistant designed to bridge the gap between patient data and clinical intelligence without compromising data privacy. Built upon a modern tech stack (FastAPI, React/Next.js, LangGraph), the project fuses four major domains of modern Data Science and Machine Learning to produce verifiable, explainable medical diagnostics.

## 🎯 Academic Objective & Research Value

To architect, develop, and validate a multimodal, zero-trust AI healthcare assistant that integrates edge-based anonymization, state-driven agentic orchestration, and advanced computer vision to provide secure, explainable, and real-time medical diagnostic support without compromising patient data privacy.

## 🚀 Core Research Features & Solved Gaps

### 1. Zero-Trust Edge PII Scrubbing (Privacy-Preserving NLP)
* **The Research Gap:** Adoption of Large Language Models (LLMs) in telehealth is fiercely bottlenecked by HIPAA/GDPR compliance and the risk of unencrypted PII leaking via API prompts.
* **The Mediflow Solution:** Employs a Hybrid Edge-to-Cloud architecture. Before any text leaves the local machine, a lightweight local Named Entity Recognition (NER) model (SpaCy en_core_web_sm) and Regex heuristic pipeline scrub out Names, DOBs, and SSNs. This guarantees 100% Zero-Trust telemetry while still allowing the system to utilize frontier models (Gemini) for heavy inference.

### 2. Explainable Computer Vision & Segmented Anomaly Maps (XAI)
* **The Research Gap:** "Black Box AI" in Radiology. While VLMs produce accurate textual diagnoses, physicians cannot verify *where* the model is looking, leading to high clinical distrust.
* **The Mediflow Solution:** Runs parallel deterministic Computer Vision algorithms on the device. By applying Contrast Limited Adaptive Histogram Equalization (CLAHE) and OTSU thresholding, Mediflow physically isolates and outlines high-density geometric anomalies (tumors, bone fractures) on X-Rays/MRIs. This forces the AI to visually "show its work," marrying transparent geometric math with LLM semantic reasoning.

### 3. Agentic RAG & Dynamic Web-Referencing (LangGraph + Tavily)
* **The Research Gap:** Static LLMs have "Knowledge Cutoffs," meaning their medical training data might be years out of date. Furthermore, static dialogue trees fail to route effectively during medical crises.
* **The Mediflow Solution:** Utilizes LangGraph state-machines for autonomous routing. When users upload unstructured PDFs, PaddleOCR extracts the data and feeds it to an Agno medical agent. This agent dynamically executes queries via the **Tavily Search API** to cross-reference identified symptoms against live, up-to-date scientific literature and appends clinical citations directly to the patient's output. 

### 4. Longitudinal Biomarker Forecasting (Time-Series ML)
* **The Research Gap:** Standard clinical AI analyzers process single documents statically, fundamentally ignoring the temporal momentum of chronic diseases (like Diabetes) where the trajectory of a biomarker is more predictive than a single daily value.
* **The Mediflow Solution:** Automates the extraction of historical lab reports and injects the data into Meta’s **Prophet Machine Learning Algorithm** to mathematically forecast 90-day future trends for critical biomarkers (e.g., Blood Sugar, Hematocrit), shifting the AI paradigm from reactive diagnosis to proactive prevention.

### 📄 Medical Report Analysis (RAG-Lite)
- **Zero-Trust PII Scrubbing**: Completely anonymizes patient reports (Names, Phone Numbers, SSNs, Ages, Dates) locally on the device using Regex and a lightweight SpaCy NER edge model before any data ever touches the cloud APIs.
- **Chat with your Data**: Upload a report to inject its content into the chat context. Ask "What does this mean?" to get specific answers based on your unique data.
- **Multi-Format Support**: Process PDF, PNG, JPG medical documents.
- **Advanced OCR Pipeline**: 
  - **PaddleOCR** for high-accuracy text extraction
  - **Tesseract** (via pdf2image) for scanned documents
  - **PyPDF2** for PDF metadata extraction
- **Fuzzy Keyword Matching**: Uses RapidFuzz to identify medical terms (medications, dosages, conditions).
- **Patient-Friendly Summaries**: Converts complex medical jargon into simple explanations.
- **Evidence-Based Context (Tavily Search API)**: Automatically searches the web for recent medical literature, clinical guidelines, and standard protocols to cross-reference abnormal lab values found in your PDFs and append cited research links.

### 📈 Longitudinal Health Trend Analysis
- **Time-Series Tracking**: Upload multiple past reports (e.g., Blood Tests from Jan, Mar, Jun) simultaneously.
- **Auto-Extraction**: Gemini AI extracts dates and key biomarkers (Hemoglobin, Sugar, Cholesterol) from unstructured text.
- **Prophet ML Forecasting**: Generates dynamic forecasts using Meta's Prophet Time-Series ML to mathematically predict and plot 90-day future health trends based on historical data points.
- **Insight Generation**: Automatically detects if values are improving (⬇️ Bad Cholesterol) or worsening (⬆️ Blood Sugar).

### 🩺 Medical Imaging (MRI/DICOM/X-Ray Analysis)
- **Multimodal AI**: Accepts MRI, CT, X-Ray, Ultrasound images.
- **DICOM Support**: Native detection and parsing of DICOM files (.dcm) using **Pydicom**.
- **Medical Imaging Agent**: Specialized Agno-powered agent with Gemini 2.5 Flash for radiology interpretation.
- **Deep Edge CV Segmentation**: Custom on-device OpenCV pipeline utilizing CLAHE, Bilateral filtering, and morphological transformations to dynamically segment high-opacity anomalies (tumors, fluid, fractures) and overlay them as heatmap segmentations.
- **Radiologist-Grade Output**: Structured findings with confidence levels and differential diagnoses.

### 5. Intelligent Triage & Spatial Routing
- **Specialist Matching**: Automatically maps disease keywords to relevant specialists (e.g., "diabetes" → endocrinologist).
- **Google Maps Integration**: Calculates radial proximity to rapidly guide patients to physical care within a 5km radius.
- **State-Dependent Safeguards**: LangGraph node orchestration intercepts the prompt flow if self-harm is detected, blocking LLM generation and returning deterministic emergency hotline numbers (112, 911, Lifeline).

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (React-based web interface with Tailwind CSS)
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (High-performance async API with CORS support)
- **Agent Orchestration**: [LangGraph](https://langchain-ai.github.io/langgraph/) (State-machine based agent flow with 'IsEmergency' and 'IsLocation' nodes)
- **LLMs**:
  - [Google Gemini 2.5 Flash](https://ai.google.dev/) (Medical consultation, trend extraction & image analysis)

- **Medical Imaging & OCR**:
  - [Agno Framework](https://github.com/phidatahq/agno) (Specialized medical imaging agent)
  - [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) (High-accuracy text extraction)
  - [Pydicom](https://pydicom.github.io/) (DICOM file parsing)
  - [PyPDF2](https://pypdf.readthedocs.io/) (PDF metadata extraction)
  - [pdf2image](https://github.com/Belval/pdf2image) (PDF to image conversion)
  - [OpenCV](https://opencv.org/) (Image processing)
  - [Pillow](https://python-pillow.org/) (Image manipulation)
- **Fuzzy Matching**: [RapidFuzz](https://github.com/maxbachmann/RapidFuzz) (Medical keyword matching)
- **External APIs**:
  - **Google Maps API** (Geocoding, Places, Specialist search)
  - **Tavily Search API** (Medical literature integration)

## 📂 Project Structure

```
Aimedicalanalyzer/
├── backend/
│   ├── main.py              # FastAPI server with /ask, /analyze_report endpoints
│   ├── aiagent.py           # LangChain agent, tools, SYSTEM_PROMPT, and response parsing
│   ├── tools.py             # Low-level integrations (Gemini queries)
│   ├── config.py            # API keys & configuration (⚠️ REQUIRES SECURITY AUDIT)
│   ├── medical_pipeline.py  # OCR pipeline, DICOM parsing, medical image analysis
│   ├── medical_agent.py     # Agno-based medical imaging agent for MRI/X-Ray analysis
│   └── __pycache__/         # Python cache
├── frontend-web/          # Next.js Frontend (React, Tailwind, Lucide)
├── requirements.txt         # Python dependencies
├── LICENSE                  # MIT License
└── README.md                # This file
```

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.9+
- API Keys:
  - **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/app/apikey))
  - **Google Maps API Key** (Geocoding + Places enabled)
  - **Tavily API Key** (For medical literature search)
- Optional:

  - `poppler-utils` (system package for PDF processing on Windows)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Aimedicalanalyzer
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure API Keys (⚠️ SECURITY CRITICAL)
Edit `backend/config.py` and add your credentials:
```python
GOOGLE_MAPS_API_KEY = "AIzaSy..."
GEMINI_API_KEY = "AIzaSy..."
TAVILY_API_KEY = "tvly-..."
```

**⚠️ IMPORTANT**: Replace hardcoded keys with environment variables:
```bash
# .env or system environment
export GOOGLE_MAPS_API_KEY="..."
export GEMINI_API_KEY="..."
export TAVILY_API_KEY="..."
```



## 🚀 Running the Application

### Prerequisites Check
Before starting, verify:
1. **All API keys configured** in `backend/config.py`
2. **Backend dependencies installed**: `pip install -r requirements.txt`


### Step 1: Start the Backend Server
From the project root:

**Option A - Using Python Module (Recommended):**
```bash
python -m backend.main
```

**Option B - Using Uvicorn CLI:**
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

The backend is now ready at `http://localhost:8000`.

### Step 2: Start the Frontend Interface
1. Navigate to the web frontend directory:
   ```bash
   cd frontend-web
   ```
2. Install dependencies (first time only):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:3000`

## 🔄 API Endpoints

### POST `/ask` - Chat Endpoint
Send a message to the AI assistant with automatic crisis detection.

**Request:**
```json
{
  "message": "I'm feeling depressed and lonely"
}
```

**Response:** Plain text response from Dr. Emily Hartman or immediate hardcoded safe emergency routing.

**Crisis Detection:** Messages containing keywords like "suicide," "kill myself," "self-harm," etc. automatically trigger safe emergency interventions.

**Location Requests:** Queries like "find psychiatrists in Delhi" automatically invoke Google Maps search.

### POST `/analyze_report` - Medical Report Analysis
Upload and analyze medical documents.

**Request:** `multipart/form-data` with file field
- Accepts: PDF, PNG, JPG, JPEG
- File size: Recommended <20MB

**Response:** Extracted medical data, summaries, and key findings

**Example:**
```bash
curl -X POST "http://localhost:8000/analyze_report" \
  -F "file=@medical_report.pdf"
```

## 🧠 Application Flow

1. **User Input** → Message sent via Next.js frontend or `/ask` API
2. **Emergency Detection** → Regex patterns scan for crisis keywords
3. **If Crisis Detected** → Intercepts router and safely provides emergency hotlines (112, 911, Lifeline)
4. **If Location Request** → Google Maps API finds nearby specialists
5. **Default Behavior** → LangChain agent processes request
6. **Tool Selection** → Agent picks best tool:
   - `ask_mental_health_specialist` - For health advice using Gemini
   - `find_nearby_therapists_by_location` - For location-based specialist search
7. **Response Generation** → Final answer returned to frontend

## 💬 Conversation Features

### Mental Health Chat
- Empathetic, persona-driven responses from "Dr. Emily Hartman"
- Supports follow-up questions and multi-turn conversations
- Chat history preserved in session

### Medical File Upload
- Supports PDF, PNG, JPG medical documents
- Automatic OCR extraction using PaddleOCR
- Fuzzy matching for medical keywords
- Summarization in patient-friendly language

### Medical Image Analysis
- Automatic DICOM detection for .dcm files
- MRI, CT, X-Ray analysis using Gemini + Agno framework
- Structured radiology reports with findings and recommendations
- Research context from medical literature

## 🛡️ Disclaimer & Safety Information

⚠️ **CRITICAL: Mediflow is an AI Assistant and does NOT replace professional medical advice.**

### Medical Use Only
- The AI's analysis of medical reports, images, and health conditions is for **informational purposes only**.
- All AI recommendations **must be verified by a certified medical professional** before acting.
- **Do not rely on this application for diagnosis or treatment decisions.**

### Mental Health Crisis
- In case of a **mental health emergency, always contact local emergency services immediately**:
  - **USA**: 911 or National Suicide Prevention Lifeline: 988
  - **India**: Emergency: 112; AASRA: +91-22-2754-6669
  - **UK**: 999 or Samaritans: 116 123
- Mediflow is designed to detect crisis text and intercept the normal chat flow to provide safe emergency numbers. This is **not a substitute for professional crisis intervention**.

### Liability
- The developers are **not liable** for misdiagnosis, delayed treatment, or adverse outcomes from using this application.
- Users assume all responsibility for medical decisions made based on AI analysis.

### Data Privacy
- **Zero-Trust Client Processing**: Medical files are scrubbed locally using edge-based SpaCy NLP before being dispatched. Identifiable markers are hard-replaced with `[REDACTED]` tokens.
- Medical files uploaded are processed on your local instance.
- Ensure compliance with HIPAA, GDPR, and other healthcare regulations when using with patient data.
- Do not upload real patient information without proper anonymization.

## ⚠️ Troubleshooting

### Backend Won't Start
**Error**: `ModuleNotFoundError: No module named 'backend'`
- **Solution**: Run from project root and use `python -m backend.main` instead of direct script execution.

**Error**: `Connection refused on port 8000`
- **Solution**: Check if another service is using port 8000. Use `netstat -ano | findstr :8000` (Windows) or `lsof -i :8000` (macOS/Linux).

### Missing/Invalid API Keys
**Error**: `KeyError: 'GEMINI_API_KEY'` or similar
- **Solution**: Verify all keys are set in `backend/config.py`.
- **Solution**: Check environment variables: `echo %GEMINI_API_KEY%` (Windows) or `echo $GEMINI_API_KEY` (Unix).

**Error**: `401 Unauthorized` from Gemini/Google Maps
- **Solution**: Verify API keys are correct and have appropriate permissions enabled.
- **Solution**: Check API quotas and billing status in respective dashboards.


### PDF Processing Fails
**Error**: `DLL load failed` or `poppler not found` (Windows)
- **Solution**: Install poppler-utils:
  ```bash
  choco install poppler  # via Chocolatey
  # OR manually download from: https://github.com/oschwartz10612/poppler-windows/releases/
  ```
- **Solution**: Set poppler path in code if installed manually.

### Medical Image Analysis Errors
**Error**: `AgnoImage not found` or `agno import error`
- **Solution**: Ensure Agno SDK is installed: `pip install agno`
- **Solution**: Verify Gemini API key is correctly configured for Agno.

### High Memory Usage
- **Issue**: App uses >2GB RAM during PDF processing
- **Solution**: Process smaller files individually; PaddleOCR is memory-intensive.
- **Solution**: Consider using a GPU-enabled environment for faster processing.

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork the repository** and create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** and test thoroughly:
   ```bash
   python -m pytest tests/  # If tests exist
   python -m backend.main   # Manual testing
   cd frontend-web && npm run dev
   ```

3. **Follow code style** and add docstrings.

4. **Submit a pull request** with a clear description of changes.

### Areas for Contribution
- [ ] Database integration for chat history persistence
- [ ] Multi-language support (medical terminology)
- [ ] Enhanced DICOM parsing and 3D visualization
- [ ] Mobile app version (React Native/Flutter)
- [ ] Improved emergency detection with NLP models
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] Performance optimization for large documents

## 📞 Support & Contact

For questions, bug reports, or feature requests:
- Open an [Issue](https://github.com/your-repo/issues)
- Contact: [your-email@example.com](mailto:your-email@example.com)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for accessible, empathetic, and effective healthcare support.**

*Last Updated: March 2026*

