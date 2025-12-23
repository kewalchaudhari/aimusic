# 🧪 Testing Guide - Collaborative Word Collection

## ✅ System Status

All servers are running:
- ✅ Backend API: `http://localhost:8000`
- ✅ React Frontend: `http://localhost:5173`
- ✅ HTML Pages Server: `http://localhost:8080`

## 🎯 Quick Test (5 Minutes)

### Test 1: Submit Multiple Words

1. **Open Word Submission Page** (in 4 different browser tabs):
   ```
   http://localhost:8080/word-submit.html
   ```

2. **Submit these test words** (one per tab):
   - Tab 1: "Innovation"
   - Tab 2: "Future"
   - Tab 3: "Together"
   - Tab 4: "Dream"

3. **Expected Result**:
   - Each submission shows success animation
   - Form resets after 3 seconds
   - You can submit another word

### Test 2: View Admin Dashboard

1. **Open Admin Dashboard**:
   ```
   http://localhost:8080/admin-dashboard.html
   ```

2. **Expected Result**:
   - See all 4 words as colored tags
   - Stats show: 4 total words, 4 unique words
   - Prompt preview shows: "A song about: Innovation Future Together Dream"
   - Auto-refreshes every 2 seconds

### Test 3: View QR Display

1. **Open QR Display (Option 2)**:
   ```
   http://localhost:8080/qr-display-option2.html
   ```

2. **Expected Result**:
   - Shows word count: 4
   - Shows participant count: 4
   - Displays all words as tags
   - Auto-updates in real-time

### Test 4: Generate Song

1. **In Admin Dashboard**, click **"🎵 Generate Song"**

2. **Expected Result**:
   - Shows "Song generation started!" message
   - Auto-redirects to `http://localhost:5173`
   - Main app shows generation in progress
   - Song appears in "Recent Creations" panel

### Test 5: Clear Words

1. **In Admin Dashboard**, click **"🗑️ Clear All"**

2. **Confirm** the dialog

3. **Expected Result**:
   - All words cleared
   - Stats reset to 0
   - Prompt shows "Waiting for words..."

## 🔍 Verification Commands

### Check Collected Words
```bash
curl http://localhost:8000/api/words
```

Expected output:
```json
{
  "words": ["Innovation", "Future", "Together", "Dream"],
  "count": 4
}
```

### Check Word Count
```bash
curl http://localhost:8000/api/word-count
```

Expected output:
```json
{
  "count": 4
}
```

### Submit Word via Command Line
```bash
curl -X POST http://localhost:8000/api/submit-word \
  -H "Content-Type: application/json" \
  -d '{"word":"Testing"}'
```

Expected output:
```json
{
  "status": "success",
  "message": "Word submitted successfully",
  "total_words": 5
}
```

### Clear All Words
```bash
curl -X DELETE http://localhost:8000/api/words
```

Expected output:
```json
{
  "status": "success",
  "message": "All words cleared"
}
```

## 📱 Mobile Testing (Optional)

### Find Your Local IP
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Example output: `192.168.1.100`

### Access from Phone
1. Connect phone to same WiFi network
2. Open browser on phone
3. Navigate to: `http://YOUR_IP:8080/word-submit.html`
4. Submit a word
5. Check admin dashboard on computer to see it appear

## 🎨 Compare QR Display Options

Open all three options side-by-side:

1. **Option 1 - Minimalist**:
   ```
   http://localhost:8080/qr-display-option1.html
   ```
   - Clean, centered design
   - Shows QR code and word count
   - Best for professional settings

2. **Option 2 - Dynamic Grid** ⭐ RECOMMENDED:
   ```
   http://localhost:8080/qr-display-option2.html
   ```
   - Split screen layout
   - Live word preview
   - Statistics dashboard
   - Most engaging

3. **Option 3 - Fullscreen Immersive**:
   ```
   http://localhost:8080/qr-display-option3.html
   ```
   - Fullscreen design
   - Floating QR code
   - Footer statistics
   - Best for large venues

## 🐛 Troubleshooting

### Words Not Appearing?

1. **Check Backend Logs**:
   - Look for `POST /api/submit-word HTTP/1.1" 200 OK`
   - If you see 404 or 500, backend needs restart

2. **Check Browser Console**:
   - Press F12 in browser
   - Look for errors in Console tab
   - Check Network tab for failed requests

3. **Verify Backend is Running**:
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"ok"}`

### CORS Errors?

1. **Check CORS Settings** in `backend/main.py`:
   ```python
   origins = [
       "http://localhost:5173",
       "http://localhost:8080",
       "*"
   ]
   ```

2. **Restart Backend** after any changes

### Form Submission Fails?

1. **Check API_BASE** in HTML files:
   - Should be: `const API_BASE = 'http://localhost:8000';`

2. **Check Network Tab** in browser:
   - Should show POST to `http://localhost:8000/api/submit-word`
   - Status should be 200 OK

## ✨ Success Criteria

You'll know everything is working when:

- ✅ Words submit successfully with success animation
- ✅ Admin dashboard shows all words in real-time
- ✅ QR display updates automatically
- ✅ Statistics are accurate
- ✅ Generate Song button works
- ✅ Redirects to main app after generation
- ✅ Can clear all words and start fresh

## 📊 Test Data Sets

### Test Set 1: Tech Theme
```
Innovation
Digital
Cloud
AI
Future
```

### Test Set 2: Inspiration Theme
```
Dream
Believe
Achieve
Create
Inspire
```

### Test Set 3: Unity Theme
```
Together
United
Harmony
Peace
Love
```

### Test Set 4: Random Mix
```
Sunshine
Mountain
Ocean
Freedom
Journey
```

## 🎯 Performance Test

1. **Open 10 tabs** of word-submit.html
2. **Submit words rapidly** (one per tab)
3. **Watch admin dashboard** update in real-time
4. **Verify** all words appear correctly

## 🔄 Full Flow Test

1. **Clear all words** (start fresh)
2. **Open QR display** on one screen
3. **Open admin dashboard** on another screen
4. **Submit 5 words** from different tabs
5. **Watch both screens** update in real-time
6. **Click Generate Song** in admin
7. **Verify redirect** to main app
8. **Wait for song** to generate
9. **Play the song**!

## 📝 Notes

- Words are stored in memory (lost on backend restart)
- Auto-refresh happens every 2 seconds
- Maximum word length: 20 characters
- Form resets after 3 seconds on success
- Admin dashboard auto-redirects after generation

## 🚀 Next Steps After Testing

Once everything works locally:

1. ✅ Test complete flow
2. ✅ Verify all pages work
3. ✅ Test on mobile device
4. 📱 Generate QR code for production
5. 🌐 Deploy to server (optional)
6. 🎉 Ready for your event!

---

**Current Status**: All systems operational! ✅

Test away and let me know if you find any issues!
