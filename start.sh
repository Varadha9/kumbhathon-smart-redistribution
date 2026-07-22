#!/bin/bash
# KumbhAnna — One-click startup script (Linux/Mac)

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "🪔 Starting KumbhAnna — Kumbh Mela Food Network"
echo ""

# Start Spring Boot backend
echo "▶ Starting Spring Boot backend on port 8080..."
cd "$ROOT/backend" && mvn spring-boot:run &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 20

# Start React frontend
echo "▶ Starting React frontend on port 3000..."
cd "$ROOT/frontend" && npm start &
FRONTEND_PID=$!

echo ""
echo "✅ KumbhAnna is running!"
echo "   Frontend → http://localhost:3000"
echo "   Backend  → http://localhost:8080"
echo "   H2 DB    → http://localhost:8080/h2-console"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
