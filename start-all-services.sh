#!/bin/bash

echo "Starting AI Waste Sort Application..."
echo ""
echo "This will start all three services:"
echo "1. Python AI Server (Port 8000)"
echo "2. Node.js REST API (Port 3000)"
echo "3. React Frontend (Port 5173)"
echo ""
echo "Make sure you have installed all dependencies first!"
echo ""
read -p "Press Enter to continue..."

echo "Starting Python AI Server..."
gnome-terminal --title="Python AI Server" -- bash -c "cd backend && python start_server.py; exec bash" &

sleep 3

echo "Starting Node.js REST API Server..."
gnome-terminal --title="REST API Server" -- bash -c "cd backend/base_server && node start_rest_server.js; exec bash" &

sleep 3

echo "Starting React Frontend..."
gnome-terminal --title="React Frontend" -- bash -c "cd ai-waste-sort && npm run dev; exec bash" &

echo ""
echo "All services are starting..."
echo "Check the individual terminal windows for status."
echo ""
echo "Frontend will be available at: http://localhost:5173"
echo ""