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
es.DeleteData=Quieres BORRAR tambien tus claves y sesiones de Twitch, YouTube, Kick y Starvios?%n%nNo (recomendado): se conservan, y al reinstalar no tendras que volver a conectarlas.%nSi: se borran. Antes se guarda una copia en Documentos\Confluence-respaldo por si fue un error.
es.RestoreData=Se encontro un respaldo de tus claves y sesiones (%1).%n%nQuieres restaurarlo? Asi no tendras que volver a conectar tus plataformas.
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
en.DeleteData=Do you also want to DELETE your saved Twitch, YouTube, Kick and Starvios credentials and sessions?%n%nNo (recommended): they are kept, and you will not have to reconnect after reinstalling.%nYes: they are deleted. A copy is saved first in Documents\Confluence-respaldo in case it was a mistake.
en.RestoreData=A backup of your credentials and sessions was found (%1).%n%nDo you want to restore it? That way you will not have to reconnect your platforms.

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
Source: "stage\plugin\*"; DestDir: "{commonappdata}\obs-studio\plugins\obs-multi-rtmp"; Components: multi; Flags: recursesubdirs createallsubdirs ignoreversion

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
  // `rmdir` borra una union pero se niega a borrar una carpeta con archivos.
  if WizardIsComponentSelected('deck') then
    Exec(ExpandConstant('{cmd}'), '/c rmdir "' + ExpandConstant('{userappdata}\Elgato\StreamDeck\Plugins\tv.noxtaipan.confluence.sdPlugin') + '"', '', SW_HIDE, ewWaitUntilTerminated, Code);
  Stop := ExpandConstant('{app}\scripts\stop.ps1');
  if FileExists(Stop) then
    Exec('powershell.exe', '-NoProfile -ExecutionPolicy Bypass -File "' + Stop + '"', '', SW_HIDE, ewWaitUntilTerminated, Code);
end;

// Algunos equipos arrancan OBS en otro contexto y no ven HKCU ni AppData: el plugin tambien
// mira %PROGRAMDATA%, asi que la ruta se guarda en los tres sitios.
// Respaldo de claves y sesiones: una copia fuera de la carpeta de instalacion, por si se borran por error.
function BackupRoot: String;
begin
  Result := ExpandConstant('{userdocs}\Confluence-respaldo');
end;

// Devuelve la carpeta de respaldo mas reciente que tenga credentials.json ('' si no hay).
function LatestBackup: String;
var FindRec: TFindRec; Best: String;
begin
  Best := '';
  if FindFirst(BackupRoot + '\*', FindRec) then
  try
    repeat
      if ((FindRec.Attributes and FILE_ATTRIBUTE_DIRECTORY) <> 0) and (FindRec.Name <> '.') and (FindRec.Name <> '..') then
        if FileExists(BackupRoot + '\' + FindRec.Name + '\credentials.json') and (CompareStr(FindRec.Name, Best) > 0) then
          Best := FindRec.Name;
    until not FindNext(FindRec);
  finally
    FindClose(FindRec);
  end;
  Result := Best;
end;

procedure CopyData(Src, Dst: String);
var Code: Integer;
begin
  ForceDirectories(Dst);
  Exec(ExpandConstant('{cmd}'), '/c xcopy "' + Src + '\*" "' + Dst + '\" /E /I /Y /Q', '', SW_HIDE, ewWaitUntilTerminated, Code);
end;

procedure CurStepChanged(CurStep: TSetupStep);
var Dir, Latest: String;
begin
  if (CurStep = ssPostInstall) and WizardIsComponentSelected('stream') then
  begin
    ForceDirectories(ExpandConstant('{userappdata}\Confluence'));
    SaveStringToFile(ExpandConstant('{userappdata}\Confluence\install-dir.txt'), ExpandConstant('{app}'), False);
    ForceDirectories(ExpandConstant('{commonappdata}\Confluence'));
    SaveStringToFile(ExpandConstant('{commonappdata}\Confluence\install-dir.txt'), ExpandConstant('{app}'), False);

    // Si la instalacion no trae claves pero hay un respaldo, se ofrece restaurarlo.
    // En modo silencioso solo se restaura con /RESTOREBACKUP=1.
    Dir := ExpandConstant('{app}\data');
    Latest := LatestBackup;
    Log('Confluence: respaldo mas reciente=[' + Latest + '] raiz=[' + BackupRoot + '] silent=' + IntToStr(Ord(WizardSilent)) + ' param=[' + ExpandConstant('{param:RESTOREBACKUP|0}') + ']');
    if (Latest <> '') and (not FileExists(Dir + '\credentials.json')) then
    begin
      if WizardSilent then
      begin
        if ExpandConstant('{param:RESTOREBACKUP|0}') = '1' then CopyData(BackupRoot + '\' + Latest, Dir);
      end
      else if MsgBox(FmtMessage(CustomMessage('RestoreData'), [Latest]), mbConfirmation, MB_YESNO) = IDYES then
        CopyData(BackupRoot + '\' + Latest, Dir);
    end;
  end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var Data: String; DoDelete: Boolean;
begin
  if CurUninstallStep = usPostUninstall then
  begin
    DeleteFile(ExpandConstant('{userappdata}\Confluence\install-dir.txt'));
    RemoveDir(ExpandConstant('{userappdata}\Confluence'));
    DeleteFile(ExpandConstant('{commonappdata}\Confluence\install-dir.txt'));
    RemoveDir(ExpandConstant('{commonappdata}\Confluence'));
    // Por defecto (y en modo silencioso) las claves se CONSERVAN. Solo se borran si se pide
    // con /DELETEDATA=1 o si se responde Si a una pregunta cuyo boton por defecto es No,
    // y siempre despues de guardar una copia.
    Data := ExpandConstant('{app}\data');
    DoDelete := False;
    if DirExists(Data) then
    begin
      if ExpandConstant('{param:DELETEDATA|0}') = '1' then
        DoDelete := True
      else if not UninstallSilent then
        DoDelete := MsgBox(CustomMessage('DeleteData'), mbConfirmation, MB_YESNO or MB_DEFBUTTON2) = IDYES;
    end;
    if DoDelete then
    begin
      CopyData(Data, BackupRoot + '\' + GetDateTimeString('yyyymmdd_hhnn', #0, #0));
      DelTree(ExpandConstant('{app}'), True, True, True);
    end;
  end;
end;
