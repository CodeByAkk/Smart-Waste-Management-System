#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " SMART WASTE COLLECTION & MANAGEMENT SYSTEM"
echo " Starting Full-Stack Application on Unix / macOS / Linux"
echo "=========================================================="

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo ">>> Docker detected. Launching via Docker Compose..."
    cd "$DIR"
    docker compose up --build -d
    echo ">>> System started successfully!"
    echo ">>> Frontend: http://localhost:5173 or http://localhost"
    echo ">>> Backend API: http://localhost:8080/api/analytics/dashboard"
    exit 0
fi

# Fallback to local Java + Node.js
echo ">>> Step 1: Starting Spring Boot Backend on port 8080..."
cd "$DIR/backend"
if command -v mvn &> /dev/null; then
    mvn spring-boot:run &
elif [ -f "./mvnw" ]; then
    ./mvnw spring-boot:run &
else
    echo ">>> Maven not detected. Please install Maven or Docker to run the backend."
fi

echo ">>> Step 2: Starting React Frontend on port 5173..."
cd "$DIR/frontend"
npm install
npm run dev &

echo "=========================================================="
echo " Services are starting up!"
echo " Frontend: http://localhost:5173"
echo " Backend API: http://localhost:8080"
echo "=========================================================="
