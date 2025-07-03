@echo off
echo.
echo ========================================
echo   🕌 Madani Maktab - Starting Server
echo   Islamic School Attendance System
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "backend\simple_server.py" (
    echo ❌ Error: backend\simple_server.py not found!
    echo Make sure this BAT file is in the madani-moktob-3 folder
    echo.
    pause
    exit /b 1
)

echo 🔍 Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python and try again
    echo.
    pause
    exit /b 1
)

echo ✅ Python found!
echo.

echo 📦 Installing required packages...
pip install -r backend\requirements.txt >nul 2>&1

echo 🚀 Starting Madani Maktab server...
echo.
echo 📖 Your Islamic school system will be available at:
echo    👉 http://localhost:5000
echo.
echo 💡 Press Ctrl+C to stop the server
echo ========================================
echo.

REM Change to backend directory and start server
cd backend
python simple_server.py

echo.
echo 👋 Madani Maktab server stopped.
echo JazakAllahu Khairan for using our system!
pause 