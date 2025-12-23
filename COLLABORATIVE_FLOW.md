# Collaborative Word Collection Flow

## Overview
This system allows leaders to scan a QR code, submit one word each, and then generate a collaborative AI song using all collected words.

## Complete Flow

### 1️⃣ Display QR Code (Admin/Presenter View)
**Files:** 
- `qr-display-option1.html` - Minimalist centered design
- `qr-display-option2.html` - Split screen with live word preview
- `qr-display-option3.html` - Fullscreen immersive with floating QR

**What it does:**
- Displays a QR code for leaders to scan
- Shows real-time count of collected words
- Updates automatically as words come in
- Option 2 & 3 show live word preview

**How to use:**
1. Open one of the QR display pages on a large screen/projector
2. Generate a QR code pointing to: `http://your-server/word-submit.html`
3. Leaders scan the QR code with their phones

---

### 2️⃣ Word Submission (Leader's Phone)
**File:** `word-submit.html`

**What it does:**
- Leaders land here after scanning QR code
- Simple, beautiful form to enter ONE word
- Character limit: 20 characters
- Shows success animation after submission
- Auto-redirects after submission

**Flow:**
1. Leader scans QR code
2. Opens word submission page on their phone
3. Enters one inspiring word
4. Submits
5. Sees success message
6. Word is stored in backend

---

### 3️⃣ Admin Dashboard
**File:** `admin-dashboard.html`

**What it does:**
- View all collected words in real-time
- See statistics (total words, unique words, character count)
- Preview the generated prompt
- Generate song with one click
- Clear all words if needed

**Features:**
- **Live Updates**: Auto-refreshes every 2 seconds
- **Word Management**: View, copy, or clear collected words
- **Prompt Preview**: See exactly what will be sent to AI
- **One-Click Generation**: Generate song directly from dashboard
- **Auto-redirect**: Redirects to main app after generation

---

### 4️⃣ Main Generation App
**File:** Your existing React app at `http://localhost:5173`

**What happens:**
- After clicking "Generate Song" in admin dashboard
- Song generation starts with all collected words
- User is redirected to main app
- Song appears in "Recent Creations" panel
- Can listen to the generated collaborative song

---

## API Endpoints

### POST `/api/submit-word`
Submit a word from a leader
```json
{
  "word": "Innovation"
}
```

### GET `/api/words`
Get all collected words
```json
{
  "words": ["Innovation", "Future", "Together"],
  "count": 3
}
```

### GET `/api/word-count`
Get just the count
```json
{
  "count": 3
}
```

### DELETE `/api/words`
Clear all collected words (admin only)

---

## Setup Instructions

### 1. Backend is Already Running ✓
Your FastAPI backend is running on `http://localhost:8000`

### 2. Frontend is Already Running ✓
Your React app is running on `http://localhost:5173`

### 3. Access the HTML Pages

**Option A: Direct File Access**
Open the HTML files directly in browser:
```
file:///Users/harshvardhan1.p/Downloads/songCreater/frontend/qr-display-option1.html
file:///Users/harshvardhan1.p/Downloads/songCreater/frontend/word-submit.html
file:///Users/harshvardhan1.p/Downloads/songCreater/frontend/admin-dashboard.html
```

**Option B: Serve via HTTP (Recommended for QR codes)**
```bash
cd /Users/harshvardhan1.p/Downloads/songCreater/frontend
python3 -m http.server 8080
```

Then access:
- QR Display: `http://localhost:8080/qr-display-option1.html`
- Word Submit: `http://localhost:8080/word-submit.html`
- Admin Dashboard: `http://localhost:8080/admin-dashboard.html`

---

## QR Code Generation

### For Local Testing:
Generate QR code pointing to:
```
http://YOUR_LOCAL_IP:8080/word-submit.html
```

Find your local IP:
```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Example: 192.168.1.100
```

### For Production:
Deploy and use your actual domain:
```
https://yourdomain.com/word-submit.html
```

### Free QR Code Generators:
- https://www.qr-code-generator.com/
- https://qr.io/
- https://www.qrcode-monkey.com/

---

## Presentation Flow (Recommended)

### Setup Phase (Before Event)
1. ✅ Start backend: `python main.py` (Already running)
2. ✅ Start frontend: `npm run dev` (Already running)
3. Start HTTP server for HTML pages: `python3 -m http.server 8080`
4. Generate QR code pointing to word submission page
5. Test the complete flow yourself

### During Event
1. **Display QR Code**
   - Open `qr-display-option2.html` on projector
   - Shows QR code + live word preview
   
2. **Leaders Scan & Submit**
   - Leaders scan QR with phones
   - Each submits one word
   - Words appear live on screen
   
3. **Generate Song**
   - Open `admin-dashboard.html` on your laptop
   - Review collected words
   - Click "Generate Song"
   - Automatically redirects to main app
   
4. **Show Result**
   - Main app shows generation progress
   - Play the collaborative song for everyone!

---

## Design Options Comparison

### Option 1: Minimalist Elegance
- **Best for:** Clean, professional presentations
- **Features:** Centered QR, word count, simple design
- **Vibe:** Corporate, elegant

### Option 2: Dynamic Grid
- **Best for:** Interactive presentations
- **Features:** Split screen, live word tags, statistics
- **Vibe:** Engaging, informative
- **Recommended:** ⭐ Best for most use cases

### Option 3: Fullscreen Immersive
- **Best for:** Large venues, conferences
- **Features:** Huge QR, floating animation, footer stats
- **Vibe:** Dramatic, impressive

---

## Customization

### Change Colors
All files use CSS variables matching your theme:
```css
--blob-1: #4f46e5;  /* Indigo */
--blob-2: #db2777;  /* Pink */
--blob-3: #005AAC;  /* Jio Blue */
```

### Change Text
Edit the HTML files directly:
- Headings: `<h1>` tags
- Subtitles: `.subtitle` class
- Instructions: `.instruction` class

### Add Your Logo
Replace the SVG icon in each file with your logo image

---

## Troubleshooting

### QR Code Not Working
- Ensure HTTP server is running
- Use local IP address, not localhost
- Check firewall settings
- Test QR code with your own phone first

### Words Not Appearing
- Check browser console for errors
- Verify backend is running on port 8000
- Check CORS settings in backend
- Refresh the page

### Generation Fails
- Ensure you have words collected
- Check API key in backend `.env`
- Verify Suno API is working
- Check backend logs

---

## Next Steps

1. **Test Locally**: Try the complete flow yourself
2. **Generate QR Code**: Create QR pointing to word-submit page
3. **Choose Display Option**: Pick which QR display design you like
4. **Practice**: Run through the presentation flow
5. **Deploy** (Optional): Host on a server for production use

---

## Files Summary

| File | Purpose | When to Use |
|------|---------|-------------|
| `qr-display-option1.html` | Simple QR display | Clean presentations |
| `qr-display-option2.html` | Interactive QR display | Most presentations ⭐ |
| `qr-display-option3.html` | Immersive QR display | Large venues |
| `word-submit.html` | Word submission form | Leaders' phones |
| `admin-dashboard.html` | Admin control panel | Your laptop/tablet |
| Main React App | Song generation UI | Final result display |

---

## Support

If you need any modifications:
- Change word limit (currently 20 chars)
- Add word validation
- Customize styling
- Add authentication
- Store words in database
- Export words to CSV

Just let me know! 🎵
