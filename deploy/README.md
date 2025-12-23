# 🎵 Word Submit Page - Deployment Package

This folder contains ONLY the word submission page for public deployment.

## 📦 What's Inside
- `index.html` - The word submission page (renamed from word-submit.html)

## 🚀 Quick Deploy to Netlify

### Method 1: Drag & Drop (Easiest)
1. Go to https://app.netlify.com/drop
2. Drag the entire `deploy` folder
3. Done! You'll get a URL like: `https://random-name.netlify.app`

### Method 2: Netlify CLI
```bash
cd deploy
npx netlify-cli deploy --prod
```

## ⚙️ Before Deploying

### 1. Start ngrok
```bash
# In a new terminal
ngrok http 8000
```

You'll get a URL like: `https://abc123.ngrok.io`

### 2. Update API URL in index.html

Open `deploy/index.html` and find line ~318:

```javascript
: 'https://YOUR_NGROK_URL.ngrok.io';
```

Replace with your actual ngrok URL:

```javascript
: 'https://abc123def456.ngrok.io';
```

### 3. Deploy!

Now you can deploy to Netlify.

## 🔗 Complete Setup

### On Your Computer (Localhost):
```bash
# Terminal 1: Backend
cd backend
python main.py

# Terminal 2: ngrok
ngrok http 8000

# Terminal 3: React App (for song generation)
cd frontend
npm run dev

# Terminal 4: HTML Server (for admin dashboard & QR display)
cd frontend
python3 -m http.server 8080
```

### On Netlify (Public):
- `index.html` (word submission page)
- Accessible from anywhere via QR code

## 📱 Usage Flow

1. **Display QR Code**: Open `http://localhost:8080/qr-display-option2.html` on your screen
2. **Participants Scan**: They scan the QR code pointing to your Netlify URL
3. **Submit Words**: They submit words via the Netlify-hosted page
4. **Words Flow**: Netlify → ngrok → localhost:8000 → Your backend
5. **Admin Monitors**: You watch words appear on `http://localhost:8080/admin-dashboard.html`
6. **Generate Song**: Click "Go to Generate Song" → Opens main app with pre-filled prompt

## 🎯 QR Code Setup

Update your QR code to point to your Netlify URL:

**Before deployment:**
```
http://localhost:8080/word-submit.html
```

**After deployment:**
```
https://your-site.netlify.app
```

You can generate a new QR code at: https://qr-code-generator.com

## 🔒 Security Notes

- The page is public, anyone with the link can submit words
- Consider adding rate limiting if needed
- ngrok free tier URLs change on restart
- For permanent URL, use ngrok Pro or deploy backend too

## 📊 Monitoring

- **Check submissions**: Open admin dashboard at `http://localhost:8080/admin-dashboard.html`
- **View backend logs**: Check the terminal running `python main.py`
- **ngrok dashboard**: https://dashboard.ngrok.com (see request logs)

## 🆘 Troubleshooting

### "Failed to submit word"
- Check if backend is running (`python main.py`)
- Check if ngrok is running (`ngrok http 8000`)
- Verify API URL in `index.html` matches your ngrok URL
- Check browser console for CORS errors

### QR Code doesn't work
- Make sure you're using the Netlify URL, not localhost
- Test the URL in a browser first
- Regenerate QR code if needed

## 🎉 You're All Set!

Your participants can now submit words from anywhere, while you keep full control of the admin dashboard and song generation on your local machine!
