# Agrega los docks de Confluence (Stream Info y Chat) a OBS sin tocar los que ya tengas.
# Uso: add-obs-docks.ps1 -AppDir "C:\...\Confluence"   (OBS tiene que estar cerrado)
param([Parameter(Mandatory)][string]$AppDir)
$ErrorActionPreference = 'Stop'
$ini = Join-Path $env:APPDATA 'obs-studio\user.ini'
New-Item -ItemType Directory -Force (Split-Path $ini) | Out-Null
if (-not (Test-Path $ini)) { New-Item $ini -ItemType File | Out-Null }
$wait = 'file:///' + ($AppDir -replace '\\', '/').TrimEnd('/') + '/public/wait.html'
$want = @(
  @{ title = 'Confluence Stream Info'; url = "${wait}?to=/" },
  @{ title = 'Confluence Chat';        url = "${wait}?to=/currents.html" }
)
$lines = [System.Collections.Generic.List[string]]::new()
foreach ($l in @(Get-Content $ini -Encoding UTF8)) { $lines.Add([string]$l) }
$bom = [System.IO.File]::ReadAllBytes($ini) | Select-Object -First 3
$hasBom = ($bom.Count -ge 3 -and $bom[0] -eq 0xEF -and $bom[1] -eq 0xBB -and $bom[2] -eq 0xBF)
$sec = $lines.IndexOf('[BasicWindow]')
if ($sec -lt 0) { $lines.Add('[BasicWindow]'); $sec = $lines.Count - 1 }
$key = -1
for ($i = $sec + 1; $i -lt $lines.Count -and $lines[$i] -notmatch '^\['; $i++) {
  if ($lines[$i] -like 'ExtraBrowserDocks=*') { $key = $i; break }
}
$titles = $want | ForEach-Object { $_.title }
$docks = @()
if ($key -ge 0) {
  # Windows PowerShell 5.1 entrega el array de ConvertFrom-Json como un solo objeto: se aplana a mano.
  $parsed = ConvertFrom-Json (($lines[$key] -replace '^ExtraBrowserDocks=', ''))
  foreach ($group in @($parsed)) { foreach ($d in @($group)) { if ($d.title -notin $titles) { $docks += $d } } }
}
foreach ($w in $want) {
  $docks += [pscustomobject]@{ title = $w.title; url = $w.url; uuid = [guid]::NewGuid().ToString('N') }
}
$json = 'ExtraBrowserDocks=' + (ConvertTo-Json -Compress -InputObject @($docks))
if ($key -ge 0) { $lines[$key] = $json } else { $lines.Insert($sec + 1, $json) }
[System.IO.File]::WriteAllLines($ini, $lines, (New-Object System.Text.UTF8Encoding($hasBom)))
