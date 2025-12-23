from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from schemas import GenerateRequest, GenerateResponse
from service import generate_music, get_music_status
from pydantic import BaseModel
import os

app = FastAPI(title="SongCreater Backend")

# In-memory storage for job results (in production, use Redis or a database)
job_storage = {}


# Validating API Key loading
from dotenv import load_dotenv
load_dotenv()

@app.on_event("startup")
async def startup_event():
    api_key = os.getenv("SUNO_API_KEY")
    if api_key:
        masked_key = f"{api_key[:5]}...{api_key[-5:]}" if len(api_key) > 10 else "***"
        print(f"[SUCCESS] Loaded API Key from .env: {masked_key}")
    else:
        print("[ERROR] No API Key found in .env!")

# In-memory storage for collected words
collected_words = []

class WordSubmission(BaseModel):
    word: str

# CORS
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",
    "http://localhost:8080",  # HTML pages server
    "https://spiffy-sunflower-7bee1a.netlify.app", # Production Frontend
    "https://jioaimusicbond.netlify.app", # New Production Link
    "*"  # Allow all for testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/callback")
async def receive_callback(request: Request):
    """Receive callbacks from Suno API when generation is complete"""
    try:
        data = await request.json()
        print(f"Received callback: {data}")
        
        # Store the result by job ID or other identifier
        if "id" in data or "task_id" in data:
            job_id = data.get("id") or data.get("task_id")
            job_storage[job_id] = data
        
        return {"status": "received"}
    except Exception as e:
        print(f"Callback error: {e}")
        return {"status": "error", "message": str(e)}

@app.get("/api/status/{task_id}")
def poll_task_status(task_id: str):
    """Poll Suno API for task status"""
    try:
        result = get_music_status(task_id)
        return {"status": "success", "data": result}
    except Exception as e:
        print(f"Error polling status: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/job/{job_id}")
def get_job_status(job_id: str):
    """Get the status of a generation job"""
    if job_id in job_storage:
        return {"status": "success", "data": job_storage[job_id]}
    return {"status": "pending", "message": "Job not yet complete"}

@app.post("/api/submit-word")
async def submit_word(submission: WordSubmission):
    """Submit a word from a leader"""
    try:
        raw_word = submission.word.strip()
        if not raw_word:
            raise HTTPException(status_code=400, detail="Word cannot be empty")
        
        if len(raw_word) > 500:
            raise HTTPException(status_code=400, detail="Submission too long (max 500 characters)")
        
        # Split by comma and add each word separately
        new_words = [w.strip() for w in raw_word.split(',') if w.strip()]
        
        if not new_words:
            raise HTTPException(status_code=400, detail="No valid words found in submission")

        collected_words.extend(new_words)
        
        return {
            "status": "success",
            "message": f"{len(new_words)} words submitted successfully",
            "total_words": len(collected_words)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/words")
def get_words():
    """Get all collected words"""
    return {
        "words": collected_words,
        "count": len(collected_words)
    }

@app.get("/api/word-count")
def get_word_count():
    """Get count of collected words"""
    return {"count": len(collected_words)}

@app.delete("/api/words/{index}")
def remove_word(index: int):
    """Remove a specific word by index"""
    global collected_words
    try:
        if 0 <= index < len(collected_words):
            removed_word = collected_words.pop(index)
            return {"status": "success", "message": f"Removed '{removed_word}'", "remaining": len(collected_words)}
        else:
            raise HTTPException(status_code=404, detail="Word index out of range")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/words")
def clear_words():
    """Clear all collected words (admin function)"""
    global collected_words
    collected_words = []
    return {"status": "success", "message": "All words cleared"}

@app.post("/api/generate", response_model=GenerateResponse)
def generate_song(request: GenerateRequest):
    try:
        # Convert Pydantic model to dict
        data = request.dict()
        result = generate_music(data)
        
        # Store initial job info
        if result and "data" in result:
            job_data = result.get("data")
            if isinstance(job_data, dict) and "id" in job_data:
                job_storage[job_data["id"]] = {"status": "pending", "initial": job_data}
        
        return GenerateResponse(status="success", data=result)
    except Exception as e:
        print(f"Error generating music: {e}")
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
