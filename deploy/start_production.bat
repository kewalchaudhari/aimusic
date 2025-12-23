@echo off
echo Starting Production Environment...

:: Start Backend
start "Backend Server" cmd /k "cd ..\backend && pip install -r requirements.txt && python main.py"

:: Start Frontend (served statically)
echo Serving Frontend build...
cd ..\frontend
npx serve -s dist

pause
