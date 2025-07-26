#!/bin/bash

# LexiLoop Development Server Start Script
# This script starts both frontend and backend development servers

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting LexiLoop Development Servers${NC}"

# Kill any existing processes on our ports
echo -e "${YELLOW}📝 Cleaning up existing processes...${NC}"
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :8000 | xargs kill -9 2>/dev/null || true

# Start backend server
echo -e "${BLUE}🔧 Starting Backend Server (Port 8000)...${NC}"
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo -e "${BLUE}🎨 Starting Frontend Server (Port 3000)...${NC}"
cd ../frontend && npm run dev -- --port 3000 --hostname localhost &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

# Check if servers are running
echo -e "${BLUE}🔍 Checking server status...${NC}"

# Check backend
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend server is running on http://localhost:8000${NC}"
else
    echo -e "${YELLOW}⚠️  Backend server might still be starting...${NC}"
    echo -e "${YELLOW}   Check http://localhost:8000 in a few moments${NC}"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend server is running on http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend server might still be starting...${NC}"
    echo -e "${YELLOW}   Check http://localhost:3000 in a few moments${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Development servers started!${NC}"
echo ""
echo -e "${GREEN}📋 Server URLs:${NC}"
echo -e "${GREEN}  • Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}  • Backend:  http://localhost:8000${NC}"
echo ""
echo -e "${GREEN}📝 Useful pages:${NC}"
echo -e "${GREEN}  • Home:     http://localhost:3000${NC}"
echo -e "${GREEN}  • Admin:    http://localhost:3000/admin${NC}"
echo -e "${GREEN}  • Demo:     http://localhost:3000/demo${NC}"
echo -e "${GREEN}  • Styles:   http://localhost:3000/style-test${NC}"
echo ""
echo -e "${BLUE}📖 To stop servers: kill $FRONTEND_PID $BACKEND_PID${NC}"
echo -e "${BLUE}📊 To view logs: Use the terminal tabs above${NC}"
echo ""

# Keep script running
wait