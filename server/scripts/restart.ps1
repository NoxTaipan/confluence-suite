# Reinicia el servidor de Confluence (para + arranca oculto).
& (Join-Path $PSScriptRoot 'stop.ps1')
Start-Process wscript.exe -ArgumentList ('"' + (Join-Path $PSScriptRoot 'start-hidden.vbs') + '"')
