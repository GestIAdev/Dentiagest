# 🤖 ROBOT ARMY DEPLOYMENT SCRIPT - Windows (PowerShell)
# By PunkClaude & Radwulf - November 13, 2025
# 
# This script:
# 1. Checks prerequisites (Node.js, backend running)
# 2. Installs dependencies
# 3. Runs Robot Army E2E tests
# 4. Generates report

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🤖 ROBOT ARMY - COMPLIANCE MODULE E2E TESTS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "🔍 Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green

# Check if backend is running
Write-Host ""
Write-Host "🔍 Checking backend (Selene GraphQL)..." -ForegroundColor Yellow
$backendUrl = "http://localhost:4000/graphql"
try {
    $response = Invoke-WebRequest -Uri $backendUrl -Method HEAD -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Backend is running at $backendUrl" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Cannot connect to backend at $backendUrl" -ForegroundColor Yellow
    Write-Host "   Make sure Selene is running: cd selene && npm run dev" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules found, skipping install" -ForegroundColor Green
} else {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

# Run tests
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 LAUNCHING ROBOT ARMY..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

npm test

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "🎉 ROBOT ARMY: ALL TESTS PASSED" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "Compliance Module: 🚀 PRODUCTION READY" -ForegroundColor Green
    Write-Host "Four-Gate Pattern: ✅ ENFORCED" -ForegroundColor Green
    Write-Host "Audit Trail: ✅ FUNCTIONAL" -ForegroundColor Green
    Write-Host "Real-Time Polling: ✅ WORKING" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔥 FASE 5 + ROBOT ARMY: VICTORIA TOTAL 🔥" -ForegroundColor Magenta
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "❌ ROBOT ARMY: TESTS FAILED" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the logs above for details." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
