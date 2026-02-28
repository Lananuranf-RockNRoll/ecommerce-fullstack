#!/bin/bash
set -e

echo "🚀 Ecommerce Setup Script"
echo "========================="

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker Desktop first."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose not found."
    exit 1
fi

echo "✅ Docker found"

# Copy env file
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
fi

echo ""
echo "🔨 Building and starting services..."
echo "   This may take 2-5 minutes on first run (downloading dependencies)"
echo ""

docker compose up --build -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Health check
echo ""
echo "🔍 Checking services..."
if curl -sf http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Backend is UP  → http://localhost:8080"
else
    echo "⚠️  Backend still starting... check: docker compose logs backend"
fi

echo "✅ Frontend is UP → http://localhost:3000"
echo ""
echo "🎉 Done! Open http://localhost:3000"
echo ""
echo "📋 Demo Credentials:"
echo "   Admin: admin@ecommerce.com / admin123"
echo ""
echo "📌 Useful Commands:"
echo "   docker compose logs -f          # View logs"
echo "   docker compose down             # Stop"
echo "   docker compose down -v          # Stop + delete data"
