#!/bin/bash

echo "🚀 Starting Threadly Development Environment"
echo "=========================================="

# Check if DATABASE_URL is set in environment
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL in your environment or .env.local file"
    echo "Example: export DATABASE_URL=\"postgresql://user:password@host:port/db?sslmode=require\""
    exit 1
fi

echo "✅ Database URL configured via environment variable"

# Kill any existing processes on our ports
echo "🧹 Cleaning up old processes..."
fuser -k 3000/tcp 2>/dev/null
fuser -k 3001/tcp 2>/dev/null
fuser -k 3002/tcp 2>/dev/null

echo "✅ Ports cleared"
echo ""

# Start services
echo "📦 Starting services..."
echo "API: http://localhost:3002"
echo "App: http://localhost:3000"
echo "Web: http://localhost:3001"
echo ""

# Start API server
cd apps/api && pnpm dev