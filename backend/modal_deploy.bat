@echo off
REM Modal Deployment Helper Script for Windows
REM Usage: modal_deploy.bat

echo.
echo ===================================
echo   Modal Deployment Helper
echo ===================================
echo.

REM Check if Modal is installed
modal --version >nul 2>&1
if errorlevel 1 (
    echo [!] Modal CLI not found. Installing...
    pip install modal
    if errorlevel 1 (
        echo [ERROR] Failed to install Modal CLI
        exit /b 1
    )
)

echo [✓] Modal CLI found

REM Check if user is authenticated
modal token check >nul 2>&1
if errorlevel 1 (
    echo [!] Not authenticated with Modal. Running authentication...
    modal token new
    if errorlevel 1 (
        echo [ERROR] Authentication failed
        exit /b 1
    )
)

echo [✓] Modal authentication confirmed

REM Get deployment choice
echo.
echo Select deployment version:
echo 1) Full version (with YOLO model support) - modal_app.py
echo 2) Simple version (mock detection only) - modal_app_simple.py
echo 3) Just test locally
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo [*] Deploying FULL version...
    modal deploy modal_app.py
) else if "%choice%"=="2" (
    echo.
    echo [*] Deploying SIMPLE version...
    modal deploy modal_app_simple.py
) else if "%choice%"=="3" (
    echo.
    echo [*] Testing locally...
    echo Running: modal run modal_app_simple.py
    modal run modal_app_simple.py
) else (
    echo [ERROR] Invalid choice
    exit /b 1
)

echo.
echo [✓] Deployment complete!
echo.
echo Next steps:
echo - Check your deployment at: https://dashboard.modal.com
echo - View logs: modal logs waste-classification-api
echo - Test endpoints with the provided URL
echo.
pause
