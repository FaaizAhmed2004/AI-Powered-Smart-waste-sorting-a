@echo off
echo Starting AI Waste Sort Application...
echo.
echo This will start all three services:
echo 1. Python AI Server (Port 8000)
echo 2. Node.js REST API (Port 3000) 
echo 3. React Frontend (Port 5173)
echo.
echo Make sure you have installed all dependencies first!
echo.
pause

echo Starting Python AI Server...
start "Python AI Server" cmd /k "cd backend && python start_server.py"

timeout /t 3 /nobreak > nul

echo Starting Node.js REST API Server...
start "REST API Server" cmd /k "cd backend\base_server && node start_rest_server.js"

timeout /t 3 /nobreak > nul

echo Starting React Frontend...
start "React Frontend" cmd /k "cd ai-waste-sort && npm run dev"

echo.
echo All services are starting...
echo Check the individual terminal windows for status.
echo.
echo Frontend will be available at: http://localhost:5173
echo.
pause