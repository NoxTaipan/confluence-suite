# Repara Confluence: para el servidor, restaura node_modules desde el respaldo del instalador y lo vuelve a arrancar.
# Tus claves y sesiones (data\) no se tocan.
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
& (Join-Path $PSScriptRoot 'stop.ps1')
$zip = Join-Path $root 'repair\node_modules.zip'
if (Test-Path $zip) {
  $nm = Join-Path $root 'node_modules'
  if (Test-Path $nm) { Remove-Item $nm -Recurse -Force }
  Expand-Archive -Path $zip -DestinationPath $root -Force
} else {
  # Instalacion desde el repositorio (sin respaldo): reinstala con npm.
  $env:PATH = (Join-Path $root 'runtime') + ';' + $env:PATH
  Push-Location $root
  npm install --omit=dev --no-audit --no-fund
  Pop-Location
}
Start-Process wscript.exe -ArgumentList ('"' + (Join-Path $PSScriptRoot 'start-hidden.vbs') + '"')
