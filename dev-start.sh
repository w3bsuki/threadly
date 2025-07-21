#!/bin/bash

echo "🚀 Starting Threadly Development Servers..."
echo ""

# Kill any existing processes on our ports
echo "🧹 Cleaning up existing processes..."
# Kill processes on specific ports
lsof -ti:3000,3001,3002,3003,3004,3005,3006,6006 | xargs -r kill -9 2>/dev/null || true
# Kill any lingering next-server processes
pkill -f "next-server" 2>/dev/null || true
# Kill any node processes running in the threadly directory
pkill -f "node.*threadly" 2>/dev/null || true
sleep 2

echo ""
echo "📦 Starting all development servers..."
echo ""
echo "🌐 Web (Public Marketplace): http://localhost:3001"
echo "💼 App (User Dashboard): http://localhost:3000"
echo "🔧 API (Backend Services): http://localhost:3002"
echo "📧 Email Preview: http://localhost:3003"
echo "📚 Documentation: http://localhost:3004"
echo "🗄️  Prisma Studio: http://localhost:3006"
echo "🎨 Storybook: http://localhost:6006"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start the development servers
pnpm dev