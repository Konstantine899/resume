# Serena MCP Server launcher for Windows PowerShell
# Requires: WSL2 with Ubuntu and uv installed

$ErrorActionPreference = "Stop"

Write-Host "[Serena] Starting Serena MCP Server..." -ForegroundColor Cyan

# Check if WSL is available
try {
    $wslVersion = wsl --version 2>$null
    if (-not $wslVersion) {
        throw "WSL not found"
    }
} catch {
    Write-Host "[Serena] ERROR: WSL2 is not installed or not available" -ForegroundColor Red
    Write-Host "[Serena] Install WSL2: wsl --install" -ForegroundColor Yellow
    exit 1
}

# Check if uv is installed in WSL
$uvCheck = wsl -e bash -c "which uv" 2>$null
if (-not $uvCheck) {
    Write-Host "[Serena] WARNING: uv not found in WSL" -ForegroundColor Yellow
    Write-Host "[Serena] Installing uv in WSL..." -ForegroundColor Cyan
    wsl -e bash -c "curl -LsSf https://astral.sh/uv/install.sh | sh"
    wsl -e bash -c "source `$HOME/.local/bin/env"
}

# Set project directory
$projectDir = Get-Location
Write-Host "[Serena] Project: $projectDir" -ForegroundColor Green

# Start Serena MCP Server
Write-Host "[Serena] Starting Serena MCP Server (context: ide-assistant)..." -ForegroundColor Cyan

try {
    wsl -e bash -c "source `$HOME/.local/bin/env && uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project `"$projectDir`""
} catch {
    Write-Host "[Serena] ERROR: Failed to start Serena MCP Server" -ForegroundColor Red
    Write-Host "[Serena] Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "[Serena] Serena MCP Server started successfully" -ForegroundColor Green
