@echo off
echo Starting Tilt Balance Game Server...
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Python to start server...
    python server.py
) else (
    echo Python not found. Trying alternative methods...
    
    REM Try Node.js
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Using Node.js to start server...
        npx serve . -p 8000
    ) else (
        echo Neither Python nor Node.js found.
        echo Please install Python or Node.js to run a local server.
        echo.
        echo Alternatively, you can:
        echo 1. Install Python from https://python.org
        echo 2. Install Node.js from https://nodejs.org
        echo 3. Or use any other local server tool
        echo.
        pause
    )
)
