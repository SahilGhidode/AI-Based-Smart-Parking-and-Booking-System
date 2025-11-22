<#
Launch the full stack in three PowerShell windows:
 - ML API (uvicorn) from `ml_module_`
 - Backend (Node) from `Backend`
 - Frontend (Next.js) from `Frontend`

Usage: run from repo root PowerShell with:
  .\launch_all.ps1

Note: This script runs `npm install` for Backend/Frontend automatically
the first time. Make sure you have Node.js and npm installed.
#>

$root = "C:\Users\RICHA MISHRA\SmartParking"
$venvActivate = Join-Path $root "smart_parking\Scripts\Activate.ps1"

if (-not (Test-Path $venvActivate)) {
    Write-Host "Virtual environment not found at $venvActivate. Run .\setup_env.ps1 first." -ForegroundColor Red
    exit 1
}

Write-Host "Starting ML API (uvicorn) in new window..."
Start-Process powershell -ArgumentList @('-NoExit','-ExecutionPolicy','Bypass','-Command',"cd '$root\\ml_module_'; & '$venvActivate'; uvicorn inference_api:app --host 0.0.0.0 --port 8000 --reload")

Write-Host "Starting Backend (npm) in new window..."
Start-Process powershell -ArgumentList @('-NoExit','-ExecutionPolicy','Bypass','-Command',"cd '$root\\Backend'; npm install; npm run server")

Write-Host "Starting Frontend (npm) in new window..."
Start-Process powershell -ArgumentList @('-NoExit','-ExecutionPolicy','Bypass','-Command',"cd '$root\\Frontend'; npm install; npm run dev")

Write-Host "All processes started in separate PowerShell windows." -ForegroundColor Green