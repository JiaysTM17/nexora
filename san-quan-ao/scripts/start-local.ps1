# Script khoi dong toan bo he thong NEXORA tren Localhost
$ErrorActionPreference = "Stop"

Write-Host ">>> [1/4] Khoi dong PostgreSQL & Redis trong WSL..." -ForegroundColor Cyan
wsl -d Ubuntu -- bash -c "bash '/mnt/d/A - Học Tập/Thương Mại Điện Tử/san-quan-ao/scripts/setup-wsl.sh'"

Write-Host ">>> [2/4] Khoi chay Network Socket Relay..." -ForegroundColor Cyan
Start-Process wsl -ArgumentList "-d", "Ubuntu", "--", "python3", "'/mnt/d/A - Học Tập/Thương Mại Điện Tử/san-quan-ao/scripts/relay.py'" -WindowStyle Hidden
Start-Sleep -Seconds 2

Write-Host ">>> [3/4] Khoi dong Backend API NestJS (Port 4000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..'; pnpm --filter @mac/api start"

Write-Host ">>> [4/4] Khoi dong Frontend Next.js Web (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..'; pnpm --filter @mac/web start"

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " HE THONG NEXORA DA KHOI CHAY HOAN TAT!" -ForegroundColor Green
Write-Host " - Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host " - Backend API: http://localhost:4000/api/v1" -ForegroundColor Yellow
Write-Host " - Tai khoan demo:" -ForegroundColor White
Write-Host "   + Admin:  admin@nexora.vn / admin123" -ForegroundColor White
Write-Host "   + Khach:  user@nexora.vn / user123" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
