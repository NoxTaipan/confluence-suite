Set objShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
confluenceDir = fso.GetParentFolderName(scriptDir)
' Instalacion con el .exe: Node portable en runtime\. Sin eso, usa el node del PATH.
nodeExe = "node"
If fso.FileExists(confluenceDir & "\runtime\node.exe") Then nodeExe = """" & confluenceDir & "\runtime\node.exe"""
objShell.Run "cmd /c cd /d """ & confluenceDir & """ && " & nodeExe & " server.js >> scripts\confluence.log 2>&1", 0, False
