#!/bin/bash
# 🤖 ROBOT ARMY DEPLOYMENT SCRIPT - Linux/Mac (Bash)
# By PunkClaude & Radwulf - November 13, 2025
# 
# This script:
# 1. Checks prerequisites (Node.js, backend running)
# 2. Installs dependencies
# 3. Runs Robot Army E2E tests
# 4. Generates report

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🤖 ROBOT ARMY - COMPLIANCE MODULE E2E TESTS"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Check Node.js
echo "🔍 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✅ Node.js found: $NODE_VERSION"

# Check if backend is running
echo ""
echo "🔍 Checking backend (Selene GraphQL)..."
BACKEND_URL="http://localhost:4000/graphql"
if curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" | grep -q "200\|400"; then
    echo "✅ Backend is running at $BACKEND_URL"
else
    echo "⚠️  Warning: Cannot connect to backend at $BACKEND_URL"
    echo "   Make sure Selene is running: cd selene && npm run dev"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules found, skipping install"
else
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ npm install failed"
        exit 1
    fi
    echo "✅ Dependencies installed"
fi

# Run tests
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🚀 LAUNCHING ROBOT ARMY..."
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

npm test

if [ $? -eq 0 ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════════"
    echo "🎉 ROBOT ARMY: ALL TESTS PASSED"
    echo "═══════════════════════════════════════════════════════════════════════════════"
    echo ""
    echo "Compliance Module: 🚀 PRODUCTION READY"
    echo "Four-Gate Pattern: ✅ ENFORCED"
    echo "Audit Trail: ✅ FUNCTIONAL"
    echo "Real-Time Polling: ✅ WORKING"
    echo ""
    echo "🔥 FASE 5 + ROBOT ARMY: VICTORIA TOTAL 🔥"
    echo ""
else
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════════"
    echo "❌ ROBOT ARMY: TESTS FAILED"
    echo "═══════════════════════════════════════════════════════════════════════════════"
    echo ""
    echo "Check the logs above for details."
    echo ""
    exit 1
fi
