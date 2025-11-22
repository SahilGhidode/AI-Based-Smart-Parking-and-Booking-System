<#
PowerShell script to create a Python virtual environment named `smart_parking`
and install the core ML dependencies listed in `requirements_ml.txt`.

Usage (PowerShell):
  PS> .\setup_env.ps1

This script will:
- create folder `smart_parking` containing the venv
- activate the venv in the current shell
- upgrade pip and install packages from `requirements_ml.txt`

For heavy GPU packages (PyTorch / ultralytics) follow the README instructions.
#>

$envName = "smart_parking"
Write-Host "Creating virtual environment '$envName'..."
python -m venv $envName

Write-Host "Activating virtual environment..."
& "$PWD\$envName\Scripts\Activate.ps1"

Write-Host "Upgrading pip and installing requirements..."
python -m pip install --upgrade pip
pip install -r requirements_ml.txt

Write-Host "Done. Virtual environment '$envName' created and dependencies installed (core)."
Write-Host "To deactivate: run 'deactivate' in this shell." 

Write-Host "NOTE: Install PyTorch and Ultralytics separately if needed (see README_RUN.md)."