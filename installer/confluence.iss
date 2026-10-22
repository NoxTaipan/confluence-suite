; Confluence Suite - instalador. Se genera con installer\build.ps1.
#ifndef AppVersion
  #define AppVersion "0.0.0"
#endif

[Setup]
; AppId fijo: instalar encima de una version anterior la actualiza (la carpeta data\ con tus claves no se toca).
AppId={{6C1D5B0E-7B0F-4E43-9A6B-C0FF1AE0C3A1}
AppName=Confluence Suite
AppVersion={#AppVersion}
AppPublisher=NOX TAIPAN
AppPublisherURL=https://github.com/NoxTaipan/confluence-suite
AppSupportURL=https://github.com/NoxTaipan/confluence-suite/issues
DefaultDirName={localappdata}\Confluence
DisableDirPage=auto
DefaultGroupName=Confluence Suite
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=Output
OutputBaseFilename=ConfluenceSetup-{#AppVersion}
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64compatible
ArchitecturesAllowed=x64compatible
UninstallDisplayName=Confluence Suite
CloseApplications=yes
RestartApplications=no

[Languages]
Name: "es"; MessagesFile: "compiler:Languages\Spanish.isl"
Name: "en"; MessagesFile: "compiler:Default.isl"

[CustomMessages]
es.CompStream=Stream Info + Chat + Overlay (panel para OBS)
es.CompMulti=Multistream (plugin de OBS para emitir a varios destinos)
es.CompDeck=Plugin de Stream Deck (Elgato)
es.TypeFull=Instalacion completa
es.TypeCustom=Personalizada (elige que instalar)
es.TaskDocks=Agregar los docks de Stream Info y Chat a OBS
es.TaskOAuth=Abrir las paginas para crear las apps de Twitch, YouTube y Kick
es.RunKofi=Apoyar el proyecto en Ko-fi
es.ObsOpen=OBS esta abierto. Cierralo para continuar la instalacion.
es.ObsRetry=Cierra OBS y pulsa Reintentar, o Cancelar para salir.
es.IcoOpen=Abrir Confluence (Stream Info)
es.IcoRestart=Reiniciar Confluence
es.IcoRepair=Reparar Confluence
es.IcoUninstall=Desinstalar Confluence
es.Maint=Confluence ya esta instalado.%n%nSi = Reparar / actualizar / cambiar componentes%nNo = Desinstalar%nCancelar = Salir
es.KeepData=Quieres conservar tus claves y sesiones de Twitch/YouTube/Kick?
en.CompStream=Stream Info + Chat + Overlay (OBS panel)
en.CompMulti=Multistream (OBS plugin to stream to several destinations)
en.CompDeck=Stream Deck plugin (Elgato)
en.TypeFull=Full installation
en.TypeCustom=Custom (choose what to install)
en.TaskDocks=Add the Stream Info and Chat docks to OBS
en.TaskOAuth=Open the pages to create the Twitch, YouTube and Kick apps
en.RunKofi=Support the project on Ko-fi
en.ObsOpen=OBS is running. Close it to continue the installation.
en.ObsRetry=Close OBS and press Retry, or Cancel to exit.
en.IcoOpen=Open Confluence (Stream Info)
en.IcoRestart=Restart Confluence
en.IcoRepair=Repair Confluence
en.IcoUninstall=Uninstall Confluence
en.Maint=Confluence is already installed.%n%nYes = Repair / update / change components%nNo = Uninstall%nCancel = Exit
en.KeepData=Keep your saved Twitch/YouTube/Kick credentials and sessions?

[Types]
Name: "full"; Description: "{cm:TypeFull}"
Name: "custom"; Description: "{cm:TypeCustom}"; Flags: iscustom

[Components]
Name: "stream"; Description: "{cm:CompStream}"; Types: full
Name: "multi"; Description: "{cm:CompMulti}"; Types: full
Name: "deck"; Description: "{cm:CompDeck}"; Types: full

[Tasks]
Name: "docks"; Description: "{cm:TaskDocks}"; Components: stream
Name: "oauth"; Description: "{cm:TaskOAuth}"; Components: stream; Flags: unchecked

[Files]
Source: "stage\app\*"; DestDir: "{app}"; Components: stream; Flags: recursesubdirs createallsubdirs ignoreversion
Source: "stage\runtime\node.exe"; DestDir: "{app}\runtime"; Components: stream; Flags: ignoreversion
Source: "stage\streamdeck\*"; DestDir: "{userappdata}\Elgato\StreamDeck\Plugins"; Components: deck; Flags: recursesubdirs createallsubdirs ignoreversion
Source: "stage\plugin\*"; DestDir: "{userappdata}\obs-studio\plugins\obs-multi-rtmp"; Components: multi; Flags: recursesubdirs createallsubdirs ignoreversion

[Icons]
Name: "{group}\{cm:IcoOpen}"; Filename: "http://localhost:7773"; Components: stream
Name: "{group}\{cm:IcoRestart}"; Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File ""{app}\scripts\restart.ps1"""; Components: stream
Name: "{group}\{cm:IcoRepair}"; Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File ""{app}\scripts\repair.ps1"""; Components: stream
Name: "{group}\{cm:IcoUninstall}"; Filename: "{uninstallexe}"

[Registry]
Root: HKCU; Subkey: "Software\Confluence"; ValueType: string; ValueName: "InstallDir"; ValueData: "{app}"; Flags: uninsdeletekey

[Run]
Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\scripts\add-obs-docks.ps1"" -AppDir ""{app}"""; Flags: runhidden; Tasks: docks
Filename: "https://dev.twitch.tv/console/apps/create"; Flags: shellexec nowait; Tasks: oauth
Filename: "https://console.cloud.google.com/"; Flags: shellexec nowait; Tasks: oauth
Filename: "https://kick.com/settings/developer"; Flags: shellexec nowait; Tasks: oauth
Filename: "https://ko-fi.com/noxtaipan"; Description: "{cm:RunKofi}"; Flags: shellexec nowait postinstall skipifsilent unchecked

[UninstallDelete]
Type: files; Name: "{app}\scripts\confluence.log"
Type: files; Name: "{app}\scripts\confluence.pid"
Type: dirifempty; Name: "{app}\scripts"
Type: dirifempty; Name: "{app}"

[UninstallRun]
Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\scripts\stop.ps1"""; Flags: runhidden; RunOnceId: "StopConfluence"

[Code]
function ObsRunning: Boolean;
var Code: Integer;
begin
  Result := Exec(ExpandConstant('{cmd}'), '/c tasklist /fi "imagename eq obs64.exe" | find /i "obs64.exe"', '', SW_HIDE, ewWaitUntilTerminated, Code) and (Code = 0);
end;

const
  UninstKey = 'Software\Microsoft\Windows\CurrentVersion\Uninstall\{6C1D5B0E-7B0F-4E43-9A6B-C0FF1AE0C3A1}_is1';

function InitializeSetup: Boolean;
var Uninst: String; Code: Integer;
begin
  Result := True;
  if RegKeyExists(HKCU, UninstKey) and not WizardSilent then
  begin
    case MsgBox(CustomMessage('Maint'), mbConfirmation, MB_YESNOCANCEL) of
      IDNO:
        begin
          if RegQueryStringValue(HKCU, UninstKey, 'UninstallString', Uninst) then
            Exec(RemoveQuotes(Uninst), '', '', SW_SHOWNORMAL, ewNoWait, Code);
          Result := False;
          Exit;
        end;
      IDCANCEL:
        begin
          Result := False;
          Exit;
        end;
    end;
  end;
  while ObsRunning do
    if MsgBox(CustomMessage('ObsOpen') + #13#10 + CustomMessage('ObsRetry'), mbError, MB_RETRYCANCEL) = IDCANCEL then
    begin
      Result := False;
      Exit;
    end;
end;

// En una actualizacion hay que parar el server para poder reemplazar archivos.
function PrepareToInstall(var NeedsRestart: Boolean): String;
var Code: Integer; Stop: String;
begin
  Result := '';
  // Si el plugin de Stream Deck estaba enlazado con `streamdeck link` (una union a una carpeta de
  // desarrollo), se quita solo el enlace: copiar a traves de el pisaria el codigo fuente.
  if WizardIsComponentSelected('deck') then
    Exec('powershell.exe', '-NoProfile -ExecutionPolicy Bypass -Command "$d = Join-Path $env:APPDATA ''Elgato\StreamDeck\Plugins	v.noxtaipan.confluence.sdPlugin''; if ((Test-Path $d) -and (Get-Item $d).LinkType) { (Get-Item $d).Delete() }"', '', SW_HIDE, ewWaitUntilTerminated, Code);
  Stop := ExpandConstant('{app}\scripts\stop.ps1');
  if FileExists(Stop) then
    Exec('powershell.exe', '-NoProfile -ExecutionPolicy Bypass -File "' + Stop + '"', '', SW_HIDE, ewWaitUntilTerminated, Code);
end;

// Algunos equipos arrancan OBS en otro contexto y no ven HKCU ni AppData: el plugin tambien
// mira %PROGRAMDATA%, asi que la ruta se guarda en los tres sitios.
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if (CurStep = ssPostInstall) and WizardIsComponentSelected('stream') then
  begin
    ForceDirectories(ExpandConstant('{userappdata}\Confluence'));
    SaveStringToFile(ExpandConstant('{userappdata}\Confluence\install-dir.txt'), ExpandConstant('{app}'), False);
    ForceDirectories(ExpandConstant('{commonappdata}\Confluence'));
    SaveStringToFile(ExpandConstant('{commonappdata}\Confluence\install-dir.txt'), ExpandConstant('{app}'), False);
  end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usPostUninstall then
  begin
    DeleteFile(ExpandConstant('{userappdata}\Confluence\install-dir.txt'));
    RemoveDir(ExpandConstant('{userappdata}\Confluence'));
    DeleteFile(ExpandConstant('{commonappdata}\Confluence\install-dir.txt'));
    RemoveDir(ExpandConstant('{commonappdata}\Confluence'));
    if (not UninstallSilent) and (MsgBox(CustomMessage('KeepData'), mbConfirmation, MB_YESNO) = IDNO) then
      DelTree(ExpandConstant('{app}'), True, True, True);
  end;
end;
