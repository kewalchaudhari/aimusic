import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("SUNO_BASE_URL", "https://api.sunoapi.org")
API_KEY = os.getenv("SUNO_API_KEY")

def generate_music(data: dict):
    if not API_KEY:
        raise Exception("SUNO_API_KEY is not set in environment variables.")

    url = f"{BASE_URL}/api/v1/generate"
    
    # For polling approach, we don't need a callback URL
    # But the API requires it, so we'll provide a dummy one
    callback_url = "https://example.com/callback"
    
    # Map our schema fields to the exact fields expected by Suno API
    
    payload = {
        "customMode": data.get("customMode"),
        "instrumental": data.get("instrumental"),
        "prompt": data.get("prompt"),
        "style": data.get("style"),
        "title": data.get("title"),
        "model": data.get("model", "V5"),
        "callBackUrl": callback_url
    }
    
    # Remove None values
    payload = {k: v for k, v in payload.items() if v is not None}

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    try:
        # verify=False is used to bypass SSL errors in some environments
        response = requests.post(url, json=payload, headers=headers, verify=False)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        if e.response is not None:
             raise Exception(f"Upstream API Error: {e.response.text}")
        raise e
    except Exception as e:
        raise e

def get_music_status(task_id: str):
    """Poll the Suno API to get the status of a music generation task"""
    if not API_KEY:
        raise Exception("SUNO_API_KEY is not set in environment variables.")
    
    url = f"{BASE_URL}/api/v1/generate/record-info"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}"
    }
    
    params = {
        "taskId": task_id
    }
    
    try:
        response = requests.get(url, headers=headers, params=params, verify=False)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        if e.response is not None:
            raise Exception(f"Upstream API Error: {e.response.text}")
        raise e
    except Exception as e:
        raise e
