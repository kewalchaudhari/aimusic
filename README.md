# 🎵 JioAIMusic - Collaborative Song Creator

A full-stack AI music generation platform with collaborative word collection feature for creating songs from collective input.

## 🌟 Features

### Core Features
- **AI Music Generation** - Generate songs using Suno AI API
- **Real-time Polling** - Track song generation progress
- **Genre Selection** - Multiple music genres to choose from
- **Custom Mode** - Advanced controls for experienced users
- **Collaborative Word Collection** - Collect words from multiple participants via QR code

### Collaborative Mode
- **QR Code Display** - Show QR code on projector for participants to scan
- **Word Submission** - Participants submit one word each via mobile
- **Live Updates** - Real-time word count and preview
- **Admin Dashboard** - Manage collected words and generate songs
- **Auto-generation** - Combine all words into a single prompt

## 📁 Project Structure

```
songCreater/
├── backend/                    # FastAPI Backend
│   ├── main.py                # Main API server with endpoints
│   ├── service.py             # Suno API integration
│   ├── schemas.py             # Pydantic models
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables (API keys)
│
├── frontend/                   # React Frontend + HTML Pages
│   ├── src/                   # React app source
│   │   ├── App.jsx           # Main React component
│   │   ├── components/       # React components
│   │   │   ├── GenerationForm.jsx
│   │   │   └── SongResult.jsx
│   │   ├── api.js            # API client
│   │   └── index.css         # Global styles
│   │
│   ├── public/               # Static assets
│   ├── package.json          # Node dependencies
│   │
│   ├── qr-display-option1.html    # QR Display: Minimalist
│   ├── qr-display-option2.html    # QR Display: Dynamic Grid ⭐
│   ├── qr-display-option3.html    # QR Display: Fullscreen
│   ├── word-submit.html           # Word submission form
│   ├── admin-dashboard.html       # Admin control panel
│   └── flow-guide.html            # Visual guide
│
├── COLLABORATIVE_FLOW.md      # Detailed collaborative flow docs
├── README.md                  # This file
└── start-collaborative-server.sh  # Helper script

```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 20+
- Suno API key

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "SUNO_API_KEY=your_api_key_here" > .env

# Start backend server
python main.py
```

Backend runs on: `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 3. HTML Pages Server (For Collaborative Mode)

```bash
# From project root
./start-collaborative-server.sh

# Or manually:
cd frontend
python3 -m http.server 8080
```

HTML pages run on: `http://localhost:8080`

## 🎯 Usage

### Standard Mode (Single User)

1. Open `http://localhost:5173`
2. Enter song description/lyrics
3. Select genre
4. Click "Generate Track"
5. Wait for AI to generate
6. Listen to your song!

### Collaborative Mode (Multiple Participants)

#### Setup Phase
1. Start all three servers (backend, frontend, HTML server)
2. Generate QR code pointing to: `http://YOUR_IP:8080/word-submit.html`
3. Open QR display on projector: `http://localhost:8080/qr-display-option2.html`

#### Collection Phase
1. Participants scan QR code
2. Each submits one word
3. Words appear live on display
4. Admin monitors via dashboard: `http://localhost:8080/admin-dashboard.html`

#### Generation Phase
1. Admin clicks "Generate Song" in dashboard
2. Auto-redirects to main app
3. Song generates with all collected words
4. Play for everyone!

## 🔌 API Endpoints

### Music Generation
- `POST /api/generate` - Generate a new song
- `GET /api/status/{task_id}` - Poll generation status
- `GET /api/job/{job_id}` - Get job status
- `POST /api/callback` - Receive Suno callbacks

### Word Collection
- `POST /api/submit-word` - Submit a word
- `GET /api/words` - Get all collected words
- `GET /api/word-count` - Get word count
- `DELETE /api/words` - Clear all words (admin)

### Health
- `GET /health` - Health check

## 🎨 Design Options

### QR Display Pages

| Option | Best For | Features |
|--------|----------|----------|
| **Option 1** | Professional settings | Minimalist, centered, clean |
| **Option 2** ⭐ | Most presentations | Split screen, live preview, stats |
| **Option 3** | Large venues | Fullscreen, floating QR, dramatic |

### Color Schemes
- **Nebula** (Default) - Purple/Pink gradient
- **Aurora** - Green/Blue gradient  
- **Sunset** - Orange/Red gradient

## 🛠️ Configuration

### Backend (.env)
```env
SUNO_API_KEY=your_suno_api_key_here
```

### Frontend (vite.config.js)
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```

### CORS (backend/main.py)
```python
origins = [
    "http://localhost:5173",  # React app
    "http://localhost:8080",  # HTML pages
    "*"  # Allow all for testing
]
```

## 📱 QR Code Generation

### For Local Testing
1. Find your local IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
2. Generate QR for: `http://YOUR_IP:8080/word-submit.html`

### For Production
1. Deploy to a server
2. Generate QR for: `https://yourdomain.com/word-submit.html`

### Free QR Generators
- https://www.qr-code-generator.com/
- https://qr.io/
- https://www.qrcode-monkey.com/

## 🧪 Testing Locally

### Test Word Collection Flow

1. **Open Admin Dashboard**
   ```
   http://localhost:8080/admin-dashboard.html
   ```

2. **Open Word Submission** (in multiple tabs)
   ```
   http://localhost:8080/word-submit.html
   ```

3. **Submit Test Words**
   - Tab 1: "Innovation"
   - Tab 2: "Future"
   - Tab 3: "Together"
   - Tab 4: "Dream"

4. **Watch Admin Dashboard**
   - Words appear in real-time
   - Stats update automatically
   - Prompt preview shows combined text

5. **Generate Song**
   - Click "Generate Song" button
   - Redirects to main app
   - Song generates with all words

## 🐛 Troubleshooting

### Backend Issues

**404 Not Found on /api/words**
```bash
# Restart backend to load new endpoints
cd backend
python main.py
```

**CORS Errors**
- Check `origins` list in `backend/main.py`
- Ensure `http://localhost:8080` is included
- Restart backend after changes

**Suno API Errors**
- Verify API key in `.env`
- Check Suno API status
- Review backend logs

### Frontend Issues

**Words Not Appearing**
- Check browser console for errors
- Verify backend is running on port 8000
- Refresh the page
- Check network tab for failed requests

**Generation Fails**
- Ensure words are collected
- Check backend logs
- Verify Suno API key
- Try with fewer words

### HTML Pages Issues

**QR Code Not Working**
- Use local IP, not localhost
- Ensure HTTP server is running on 8080
- Check firewall settings
- Test QR with your own phone first

**Real-time Updates Not Working**
- Check if backend is running
- Verify CORS settings
- Look for JavaScript errors in console
- Ensure auto-refresh is not blocked

## 📊 Data Flow

```
┌─────────────┐
│   Participant   │
│   Scans QR      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  word-submit.html │
│  (Mobile Browser) │
└────────┬──────────┘
         │ POST /api/submit-word
         ▼
┌─────────────────┐
│  FastAPI Backend │
│  (Port 8000)     │
│  collected_words[]│
└────────┬──────────┘
         │ GET /api/words (polling)
         ▼
┌─────────────────────────────┐
│  admin-dashboard.html       │
│  qr-display-option2.html    │
│  (Auto-refresh every 2s)    │
└────────┬────────────────────┘
         │ Click "Generate Song"
         ▼
┌─────────────────┐
│  React App      │
│  (Port 5173)    │
│  Shows Result   │
└─────────────────┘
```

## 🔐 Security Notes

### For Production
- Remove `"*"` from CORS origins
- Add authentication to admin endpoints
- Use HTTPS for all connections
- Store API keys securely (environment variables)
- Add rate limiting
- Validate and sanitize all inputs
- Use database instead of in-memory storage

### Current Setup (Development Only)
- CORS allows all origins (`"*"`)
- No authentication required
- HTTP connections
- In-memory storage (data lost on restart)

## 🚀 Deployment

### Backend
```bash
# Using Uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000

# Using Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend
```bash
# Build for production
npm run build

# Serve with static server
npx serve -s dist
```

### HTML Pages
- Deploy to static hosting (Netlify, Vercel, GitHub Pages)
- Or serve alongside React app

## 📝 Environment Variables

### Backend
```env
SUNO_API_KEY=your_api_key_here
PORT=8000
HOST=0.0.0.0
```

### Frontend
```env
VITE_API_URL=http://localhost:8000
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Suno AI** - Music generation API
- **FastAPI** - Backend framework
- **React** - Frontend framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review `COLLABORATIVE_FLOW.md`
3. Open an issue on GitHub
4. Contact the development team

## 🎉 Quick Links

- **Main App**: http://localhost:5173
- **Admin Dashboard**: http://localhost:8080/admin-dashboard.html
- **Word Submit**: http://localhost:8080/word-submit.html
- **QR Display**: http://localhost:8080/qr-display-option2.html
- **Flow Guide**: http://localhost:8080/flow-guide.html
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

Made with ❤️ for collaborative music creation
