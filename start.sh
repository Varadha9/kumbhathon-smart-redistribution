#!/bin/bash
# KumbhAnna — One-click startup script (Linux/Mac)

echo "🪔 Starting KumbhAnna — Kumbh Mela Food Network"
echo ""

# Start Spring Boot backend
echo "▶ Starting Spring Boot backend on port 8080..."
cd backend && mvn spring-boot:run &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 15

# Start React frontend
echo "▶ Starting React frontend on port 3000..."
cd frontend && npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ KumbhAnna is running!"
echo "   Frontend → http://localhost:3000"
echo "   Backend  → http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop both servers."

# Wait and cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
