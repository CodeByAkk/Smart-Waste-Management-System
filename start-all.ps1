Write-Host "==========================================================" -ForegroundColor Green
Write-Host " SMART WASTE COLLECTION & MANAGEMENT SYSTEM " -ForegroundColor Yellow
Write-Host " Full-Stack Smart City Platform with Core DSA Implementations" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ">>> Step 1: Launching Backend (Spring Boot on Port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -ExecutionPolicy Bypass -Command `"& '$rootDir\run-backend.ps1'`""

Write-Host ">>> Waiting 8 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host ">>> Step 2: Launching Frontend (Vite React on Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -ExecutionPolicy Bypass -Command `"cd '$rootDir\frontend'; npm run dev`""

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Both servers launched in separate windows!" -ForegroundColor Green
Write-Host " Open your browser at: http://localhost:5173" -ForegroundColor Cyan
Write-Host " Backend REST APIs at: http://localhost:8080/api/analytics/dashboard" -ForegroundColor Cyan
Write-Host " H2 Database Console at: http://localhost:8080/h2-console" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

