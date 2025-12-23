# SongCreater Backend

FastAPI backend for interfacing with the Suno AI API.

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in your details:
   ```bash
   cp .env.example .env
   ```
   * `SUNO_BASE_URL`: The URL of the Suno API provider (e.g., specific proxy or official if available).
   * `SUNO_API_KEY`: Your API Key.

## Running

```bash
uvicorn main:app --reload
```
Server will start at `http://localhost:8000`.

## API Endpoints

* `POST /api/generate`: Generate music.
  * Body: `customMode`, `prompt`, `style`, `title`, `instrumental`, `model`.
