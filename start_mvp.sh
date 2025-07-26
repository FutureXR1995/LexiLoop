#!/bin/bash

# LexiLoop MVP Startup Script
# This script sets up and starts the complete LexiLoop system

echo "🚀 Starting LexiLoop MVP Development Environment"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_header "🔍 Checking Dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python3 is not installed. Please install Python 3.9+ first."
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Database services may not work."
    fi
    
    print_status "All dependencies checked ✅"
}

# Setup environment variables
setup_environment() {
    print_header "⚙️  Setting up Environment..."
    
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp .env.example .env
        print_warning "Please update .env file with your API keys before continuing"
        echo "Press Enter to continue after updating .env, or Ctrl+C to exit"
        read
    fi
    
    print_status "Environment configured ✅"
}

# Start database services
start_database() {
    print_header "🗄️  Starting Database Services..."
    
    if command -v docker &> /dev/null; then
        print_status "Starting PostgreSQL and Redis with Docker..."
        docker-compose up -d postgres redis
        
        # Wait for database to be ready
        print_status "Waiting for database to be ready..."
        sleep 10
        
        print_status "Database services started ✅"
    else
        print_warning "Docker not available. Please start PostgreSQL and Redis manually."
    fi
}

# Install dependencies
install_dependencies() {
    print_header "📦 Installing Dependencies..."
    
    # Backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    # AI service dependencies
    print_status "Installing AI service dependencies..."
    cd ai-service
    pip3 install -r requirements.txt
    cd ..
    
    print_status "All dependencies installed ✅"
}

# Initialize database
init_database() {
    print_header "🏗️  Initializing Database..."
    
    print_status "Running database migrations..."
    cd backend
    npx prisma generate
    npx prisma db push
    
    print_status "Seeding database with initial data..."
    npm run seed
    cd ..
    
    print_status "Database initialized ✅"
}

# Start all services
start_services() {
    print_header "🌟 Starting All Services..."
    
    # Create logs directory
    mkdir -p logs
    
    print_status "Starting AI Service..."
    cd ai-service
    python3 main.py > ../logs/ai-service.log 2>&1 &
    AI_PID=$!
    cd ..
    
    sleep 3
    
    print_status "Starting Backend API..."
    cd backend
    npm run dev > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    sleep 3
    
    print_status "Starting Frontend..."
    cd frontend
    npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Save PIDs for cleanup
    echo $AI_PID > .ai_pid
    echo $BACKEND_PID > .backend_pid
    echo $FRONTEND_PID > .frontend_pid
    
    print_status "All services started! 🎉"
}

# Display service URLs
show_urls() {
    print_header "🌐 Service URLs:"
    echo ""
    echo "Frontend Application:  http://localhost:3000"
    echo "Backend API:          http://localhost:8000"
    echo "AI Service:           http://localhost:8001"
    echo "API Documentation:    http://localhost:8001/docs"
    echo ""
    print_header "📊 Health Checks:"
    echo "Backend Health:       http://localhost:8000/health"
    echo "AI Service Health:    http://localhost:8001/"
    echo ""
}

# Test services
test_services() {
    print_header "🧪 Testing Services..."
    
    sleep 5
    
    # Test backend
    print_status "Testing backend API..."
    if curl -s http://localhost:8000/health > /dev/null; then
        print_status "Backend API: ✅ Running"
    else
        print_error "Backend API: ❌ Not responding"
    fi
    
    # Test AI service
    print_status "Testing AI service..."
    if curl -s http://localhost:8001/ > /dev/null; then
        print_status "AI Service: ✅ Running"
    else
        print_error "AI Service: ❌ Not responding"
    fi
    
    # Test frontend (just check if port is open)
    print_status "Testing frontend..."
    if curl -s http://localhost:3000 > /dev/null; then
        print_status "Frontend: ✅ Running"
    else
        print_warning "Frontend: ⏳ Still starting up..."
    fi
}

# Cleanup function
cleanup() {
    print_header "🧹 Stopping Services..."
    
    if [ -f .ai_pid ]; then
        kill $(cat .ai_pid) 2>/dev/null
        rm .ai_pid
    fi
    
    if [ -f .backend_pid ]; then
        kill $(cat .backend_pid) 2>/dev/null
        rm .backend_pid
    fi
    
    if [ -f .frontend_pid ]; then
        kill $(cat .frontend_pid) 2>/dev/null
        rm .frontend_pid
    fi
    
    print_status "Services stopped"
    exit 0
}

# Set up trap for cleanup
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    check_dependencies
    setup_environment
    start_database
    install_dependencies
    init_database
    start_services
    show_urls
    test_services
    
    print_header "🎯 LexiLoop MVP is now running!"
    echo ""
    print_status "Press Ctrl+C to stop all services"
    print_status "Check logs in the ./logs/ directory"
    echo ""
    
    # Keep script running
    while true; do
        sleep 1
    done
}

# Parse command line arguments
case "${1:-start}" in
    "start")
        main
        ;;
    "stop")
        cleanup
        ;;
    "test")
        test_services
        ;;
    "logs")
        print_header "📋 Service Logs:"
        echo ""
        echo "AI Service logs:"
        tail -f logs/ai-service.log &
        echo ""
        echo "Backend logs:"
        tail -f logs/backend.log &
        echo ""
        echo "Frontend logs:"
        tail -f logs/frontend.log &
        wait
        ;;
    *)
        echo "Usage: $0 {start|stop|test|logs}"
        echo ""
        echo "Commands:"
        echo "  start  - Start all services (default)"
        echo "  stop   - Stop all services"
        echo "  test   - Test service health"
        echo "  logs   - Show service logs"
        exit 1
        ;;
esac