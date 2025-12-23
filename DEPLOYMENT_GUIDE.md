# Hosting Word Submit Page - Deployment Guide

## 🎯 Goal
Host the `word-submit.html` page publicly while keeping your backend on localhost.

## 📋 Prerequisites
- Your backend running on `localhost:8000`
- ngrok installed (or similar tunneling tool)

---

## 🚀 Quick Start (3 Steps)

### Step 1: Expose Your Localhost Backend

Install and run ngrok:

```bash
# Install ngrok (Mac)
brew install ngrok

# Or download from: https://ngrok.com/download

# Start ngrok to expose port 8000
ngrok http 8000
```

You'll see output like:
```
Forwarding  https://abc123def456.ngrok.io -> http://localhost:8000
```

**Copy this URL!** (e.g., `https://abc123def456.ngrok.io`)

---

### Step 2: Update word-submit.html

Open `frontend/word-submit.html` and find this line (around line 318):

```javascript
: 'https://YOUR_NGROK_URL.ngrok.io'; // Replace with your actual ngrok URL
```

Replace `YOUR_NGROK_URL.ngrok.io` with your actual ngrok URL:

```javascript
: 'https://abc123def456.ngrok.io'; // Your actual ngrok URL
```

---

### Step 3: Deploy to a Free Hosting Service

Choose one of these options:

#### **Option A: Netlify (Recommended)**

1. Go to https://app.netlify.com/drop
2. Drag and drop the `word-submit.html` file
3. Done! You'll get a URL like: `https://your-site.netlify.app`

#### **Option B: Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### **Option C: GitHub Pages**

1. Create a new GitHub repository
2. Upload `word-submit.html`
3. Enable GitHub Pages in Settings
4. Access at: `https://yourusername.github.io/repo-name/word-submit.html`

---

## 🔗 Complete Flow

```
User's Phone/Device
    ↓
https://your-site.netlify.app/word-submit.html
    ↓
https://abc123.ngrok.io/api/submit-word
    ↓
http://localhost:8000 (Your Computer)
```

---

## ⚙️ Important Notes

### 1. **Keep Backend Running**
Your backend MUST be running on `localhost:8000` for this to work:
```bash
cd backend
python main.py
```

### 2. **Keep ngrok Running**
ngrok MUST be running to maintain the tunnel:
```bash
ngrok http 8000
```

### 3. **ngrok URL Changes**
- Free ngrok URLs change every time you restart ngrok
- For a permanent URL, upgrade to ngrok Pro
- Alternative: Use a different tunneling service like:
  - **localtunnel**: `npx localtunnel --port 8000`
  - **serveo**: `ssh -R 80:localhost:8000 serveo.net`

### 4. **CORS is Already Configured**
Your backend already allows all origins (`"*"`), so CORS won't be an issue.

---

## 🧪 Testing

1. **Start your backend**:
   ```bash
   cd backend
   python main.py
   ```

2. **Start ngrok**:
   ```bash
   ngrok http 8000
   ```

3. **Update word-submit.html** with ngrok URL

4. **Deploy to Netlify** (drag & drop)

5. **Test from your phone**:
   - Open the Netlify URL
   - Submit a word
   - Check your admin dashboard to see if it appears!

---

## 🎉 Alternative: Deploy Everything

If you want to deploy the entire app (not just word-submit):

1. **Backend**: Deploy to Railway, Render, or Fly.io
2. **Frontend**: Deploy to Netlify or Vercel
3. **Update API URLs** in all files to point to your deployed backend

This way, everything is hosted and you don't need ngrok!

---

## 📞 Need Help?

- ngrok docs: https://ngrok.com/docs
- Netlify docs: https://docs.netlify.com
- Vercel docs: https://vercel.com/docs

---

## 🔒 Security Note

For production use:
- Don't use `allow_origins=["*"]` in CORS
- Add authentication to your API
- Use environment variables for sensitive data
- Consider rate limiting on the submit endpoint
