#!/bin/bash

# Start HTTP server for collaborative word collection pages
echo "🎵 Starting HTTP server for collaborative word collection..."
echo ""
echo "📱 Access pages at:"
echo "   QR Display Option 1: http://localhost:8080/qr-display-option1.html"
echo "   QR Display Option 2: http://localhost:8080/qr-display-option2.html"
echo "   QR Display Option 3: http://localhost:8080/qr-display-option3.html"
echo "   Word Submit: http://localhost:8080/word-submit.html"
echo "   Admin Dashboard: http://localhost:8080/admin-dashboard.html"
echo ""
echo "🌐 For QR codes, use your local IP:"
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
echo "   http://$LOCAL_IP:8080/word-submit.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd "$(dirname "$0")/frontend"
python3 -m http.server 8080
