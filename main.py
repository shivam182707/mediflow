from fastapi import FastAPI, UploadFile, File
from typing import List
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Import the LangGraph agent
try:
    from .aiagent import graph
    from .medical_pipeline import analyze_medical_file, process_trends
except ImportError:
    # Fallback for direct execution (not recommended but handles legacy run)
    from aiagent import graph
    from medical_pipeline import analyze_medical_file, process_trends

# -----------------------------------------------------------
# App Initialization
# -----------------------------------------------------------
app = FastAPI(title="AI Health Assistant")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------
# Models
# -----------------------------------------------------------
class Query(BaseModel):
    message: str


# -----------------------------------------------------------
# Chat Endpoint (Now powered by LangGraph)
# -----------------------------------------------------------
@app.post("/ask", response_class=PlainTextResponse)
async def ask(query: Query):
    try:
        # The graph handles Safety -> Routing -> Tools -> Response
        result = graph.invoke({"input": query.message})
        return result.get("output", "No response generated.")

    except Exception as e:
        return f"Sorry, something went wrong: {str(e)}"


# -----------------------------------------------------------
# Report Analysis Endpoint (Standalone Pipeline)
# -----------------------------------------------------------
@app.post("/analyze_report", response_class=PlainTextResponse)
async def analyze_report(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        filename = file.filename
        result = analyze_medical_file(file_bytes, filename)
        return result

    except Exception as e:
        return f"Error analyzing report: {str(e)}"


# -----------------------------------------------------------
# Trend Analysis Endpoint (New)
# -----------------------------------------------------------
@app.post("/analyze_trends")
async def analyze_trends(files: List[UploadFile] = File(...)):
    try:
        # Read all files into memory (careful with large files, but okay for MVP)
        files_data = []
        for file in files:
            content = await file.read()
            files_data.append((file.filename, content))
            
        # Process in pipeline
        results = process_trends(files_data)
        return results

    except Exception as e:
        return {"error": str(e)}


# -----------------------------------------------------------
# Run Server
# -----------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
