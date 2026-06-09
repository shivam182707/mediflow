
from twilio.rest import Client
try:
    from .config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, EMERGENCY_CONTACT_NUMBER, GROQ_API_KEY, GEMINI_API_KEY
except ImportError:
    from config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, EMERGENCY_CONTACT_NUMBER, GROQ_API_KEY, GEMINI_API_KEY
import google.generativeai as genai

def query_medgemma(prompt: str) -> str:
    system_prompt = (
        "You are Dr. Emily Hartman, a compassionate and knowledgeable AI medical consultant. "
        "Your role is to provide accurate health information while maintaining a warm, supportive tone.\n\n"
        "Guidelines for response:\n"
        "1. **Empathy First**: Start by acknowledging the user's worry or situation nicely.\n"
        "2. **Information Delivery**: Provide clear, structured medical facts (symptoms, treatments, etc.) using bullet points.\n"
        "3. **Safety & Ethics**: Always clarify you are an AI, not a doctor. Do not diagnose. Advise consulting a professional.\n"
        "4. **Tone**: Calm, professional, textual, and reassuring.\n"
        "5. **Structure**: Use paragraphs for empathy, bullet points for lists (like symptoms), and a closing offering further help."
    )

    try:
        # Reverting to stable Gemini model (2.5 does not exist yet). 
        # Using 1.5-pro for better medical reasoning vs flash, or stick to flash if speed is critical.
        # Let's use 1.5-flash for speed as originally requested, or 1.5-pro for quality.
        # User asked for quality/good response -> 1.5 Flash is fine, but prompt was the issue.
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Construct the prompt with system instructions
        full_prompt = f"{system_prompt}\n\nPatient: {prompt}"
        
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        # Instead of returning a string fallback, raise an exception
        raise RuntimeError("MedGemma backend error") from e

def call_emergency_contact():
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    call = client.calls.create(
        to=EMERGENCY_CONTACT_NUMBER,
        from_=TWILIO_FROM_NUMBER,
        url="https://handler.twilio.com/twiml/EH4eb978b2db62632e5207f273238836a3"  # Can customize message
    )

    

