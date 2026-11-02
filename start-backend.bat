@echo off
title Smart Waste Management - Backend Server (Spring Boot)
echo ========================================================
echo   Starting Smart Waste Management Backend (Port 8080)
echo ========================================================
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0run-backend.ps1"
pause
