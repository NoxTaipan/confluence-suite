# Genera installer\Output\ConfluenceSetup-<version>.exe (Inno Setup).
# Uso: powershell -ExecutionPolicy Bypass -File installer\build.ps1 [-PluginDir <ruta a rundir\Release>]
param(
  [string]$PluginDir = (Join-Path $PSScriptRoot '..\obs-plugin\build_x64\rundir\Release'),
  [string]$NodeVersion = '24.22.1'
)
$ErrorActionPreference = 'Stop'
$repo  = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$root  = Join-Path $repo 'server'
$sdDir = Join-Path $repo 'streamdeck'
$stage = Join-Path $PSScriptRoot 'stage'
$iscc  = @("$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe", "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $iscc) { throw 'Falta Inno Setup 6 (winget install JRSoftware.InnoSetup)' }
if (-not (Test-Path (Join-Path $PluginDir 'obs-multi-rtmp.dll'))) { throw "No se encuentra obs-multi-rtmp.dll en $PluginDir" }
$version = (Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json).version

if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
$app = Join-Path $stage 'app'
New-Item -ItemType Directory -Force $app | Out-Null
foreach ($f in 'server.js', 'package.json', 'package-lock.json') { Copy-Item (Join-Path $root $f) $app }
foreach ($f in 'LICENSE', 'README.md', 'README.en.md', 'NOTICE.md') { Copy-Item (Join-Path $repo $f) $app }
Copy-Item (Join-Path $repo 'obs-plugin\LICENSE') (Join-Path $app 'LICENSE-obs-plugin-GPL-2.0.txt')
foreach ($d in 'lib', 'routes', 'public') { Copy-Item (Join-Path $root $d) $app -Recurse }
New-Item -ItemType Directory -Force (Join-Path $app 'scripts') | Out-Null
foreach ($f in 'start-hidden.vbs', 'stop.ps1', 'add-obs-docks.ps1', 'repair.ps1', 'restart.ps1') { Copy-Item (Join-Path $root "scripts\$f") (Join-Path $app 'scripts') }

Push-Location $app
npm ci --omit=dev --no-audit --no-fund
Pop-Location

# Respaldo de node_modules para la opcion Reparar (sin necesidad de internet ni npm).
New-Item -ItemType Directory -Force (Join-Path $app 'repair') | Out-Null
Compress-Archive -Path (Join-Path $app 'node_modules') -DestinationPath (Join-Path $app 'repair\node_modules.zip') -Force

$rt = Join-Path $stage 'runtime'
New-Item -ItemType Directory -Force $rt | Out-Null
Invoke-WebRequest "https://nodejs.org/dist/v$NodeVersion/win-x64/node.exe" -OutFile (Join-Path $rt 'node.exe')

$plug = Join-Path $stage 'plugin'
New-Item -ItemType Directory -Force "$plug\bin\64bit" | Out-Null
Copy-Item (Join-Path $PluginDir 'obs-multi-rtmp.dll') "$plug\bin\64bit"
Copy-Item (Join-Path $PluginDir 'obs-multi-rtmp') "$plug\data" -Recurse

# Plugin de Stream Deck: se compila aqui y se copia tal cual a %APPDATA%\Elgato\StreamDeck\Plugins.
Push-Location $sdDir
npm ci --no-audit --no-fund
npm run build
Pop-Location
$sd = Join-Path $stage 'streamdeck\tv.noxtaipan.confluence.sdPlugin'
New-Item -ItemType Directory -Force $sd | Out-Null
foreach ($f in 'manifest.json', 'imgs', 'ui', 'bin') { Copy-Item (Join-Path $sdDir "tv.noxtaipan.confluence.sdPlugin\$f") $sd -Recurse }

& $iscc "/DAppVersion=$version" (Join-Path $PSScriptRoot 'confluence.iss')
if ($LASTEXITCODE -ne 0) { throw 'ISCC fallo' }
Get-ChildItem (Join-Path $PSScriptRoot 'Output') | Select-Object Name, Length
