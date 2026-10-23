[🇬🇧 English](INSTALL.en.md) | 🇪🇸 **Español**

# Guía de instalación de Confluence Suite

Esta guía cubre la instalación con el asistente (recomendada), la creación de las apps de cada plataforma, el uso diario, y cómo compilar todo desde el código fuente. Para una visión general mira el [README](README.md).

## Índice

1. [Instalar con el asistente](#instalar-con-el-asistente)
2. [Crear las apps de cada plataforma](#crear-las-apps-de-cada-plataforma)
3. [Conectar tus cuentas y usar Confluence](#conectar-tus-cuentas-y-usar-confluence)
4. [Overlay Chat en tu escena](#overlay-chat-en-tu-escena)
5. [Multistream](#multistream)
6. [Stream Deck](#stream-deck)
7. [Actualizar, reparar y desinstalar](#actualizar-reparar-y-desinstalar)
8. [Dónde se guarda todo](#dónde-se-guarda-todo)
9. [Compilar desde el código fuente](#compilar-desde-el-código-fuente)
10. [Solución de problemas](#solución-de-problemas)

## Instalar con el asistente

**Requisitos:** Windows 10/11 de 64 bits y OBS Studio 31 o superior. Nada más.

1. Descarga `ConfluenceSetup-<versión>.exe` de [Releases](https://github.com/NoxTaipan/confluence-suite/releases/latest).
2. **Cierra OBS.** El asistente no continúa con OBS abierto y te lo pide.
3. Ejecútalo. No necesita permisos de administrador. Si Windows SmartScreen avisa (el instalador no está firmado), pulsa **Más información → Ejecutar de todas formas**.
4. Elige el idioma y el tipo de instalación:
   - **Instalación completa:** todo lo de abajo.
   - **Personalizada:** marca solo lo que quieras.

   | Componente | Qué instala | Dónde |
   |---|---|---|
   | Stream Info + Chat + Overlay | El servidor, Node portable y los docks | `%LOCALAPPDATA%\Confluence` (puedes elegir otra carpeta) |
   | Multistream | El plugin nativo de OBS | `%PROGRAMDATA%\obs-studio\plugins\obs-multi-rtmp` |
   | Plugin de Stream Deck | Las 9 acciones | `%APPDATA%\Elgato\StreamDeck\Plugins` |

5. Marca o desmarca las opciones adicionales:
   - **Agregar los docks de Stream Info y Chat a OBS** (marcada): añade los dos docks a OBS sin tocar los que ya tengas.
   - **Abrir las páginas para crear las apps de Twitch, YouTube y Kick** (sin marcar).
6. Al terminar puedes abrir la página de [Ko-fi](https://ko-fi.com/noxtaipan) si quieres apoyar el proyecto (opcional).
7. Abre OBS. El servidor arranca solo con OBS y los docks se conectan en cuanto está listo.

Si ya tenías el plugin de Multistream instalado en la carpeta de OBS (`C:\Program Files\obs-studio\obs-plugins\64bit`), bórralo antes de instalar el componente Multistream, o OBS cargará dos copias.

## Crear las apps de cada plataforma

Confluence usa **tus propias** credenciales: no hay una app compartida. Crea una app por cada plataforma que vayas a usar; las demás puedes saltarlas. En todas, la URL de redirección debe ser exactamente la que se indica (si cambias el puerto `7773`, cámbiala también aquí).

### Twitch

1. Entra en [dev.twitch.tv/console/apps/create](https://dev.twitch.tv/console/apps/create) con tu cuenta.
2. **Nombre:** el que quieras. **OAuth Redirect URLs:** `http://localhost:7773/auth/twitch/callback`. **Categoría:** *Application Integration*.
3. Guarda. Copia el **Client ID** y pulsa **New Secret** para generar el **Client Secret** (solo se muestra una vez).

### YouTube (Google Cloud)

1. Entra en [console.cloud.google.com](https://console.cloud.google.com/) y crea un proyecto (o usa uno existente).
2. **APIs y servicios → Biblioteca** → busca **YouTube Data API v3** → **Habilitar**.
3. **APIs y servicios → Pantalla de consentimiento de OAuth:** tipo **Externo**, completa nombre y correo, y añade el scope `https://www.googleapis.com/auth/youtube`. Mientras la app esté en *Testing* (lo normal en uso personal), añádete como **usuario de prueba** con el correo de tu cuenta de YouTube.
4. **Credenciales → Crear credenciales → ID de cliente de OAuth**, tipo **Aplicación web**. **URI de redirección autorizados:** `http://localhost:7773/auth/youtube/callback`.
5. Copia el **ID de cliente** y el **Secreto de cliente**.

### Kick

1. Activa la **verificación en dos pasos** en tu cuenta de Kick; sin ella no deja entrar al panel de desarrollador.
2. Entra en [kick.com/settings/developer](https://kick.com/settings/developer) y crea una app nueva.
3. **Redirect URL:** `http://localhost:7773/auth/kick/callback`.
4. Copia el **Client ID** y el **Client Secret**.

## Conectar tus cuentas y usar Confluence

1. En el dock **Confluence Stream Info**, toca la pastilla de una plataforma (por ejemplo *Twitch*).
2. La primera vez se abre una pantalla para pegar tu **Client ID** y **Client Secret**. Se guardan en tu PC y Confluence se reinicia solo.
3. Vuelve a tocar la pastilla: se abre la ventana de inicio de sesión de la plataforma. Autoriza y la ventana se cierra sola. La pastilla pasa a *desconectar*.
4. Repite con las otras plataformas.

**Publicar título, tags y categoría:** escribe el título y los tags (sepáralos con coma), busca la categoría de Twitch y Kick (con autocompletado), elige la de YouTube, y pulsa **Publicar a las 3**, o los botones de una sola plataforma. El botón de **clip** crea un clip de Twitch (solo con el canal en vivo) y abre su editor.

**Chat:** el dock **Confluence Chat** mezcla los tres chats en cuanto hay cuentas conectadas. Los chips de arriba filtran por plataforma, el engranaje configura el resaltado de menciones o limpia el chat, y el campo de abajo envía tu mensaje a una o a todas las plataformas.

**Starvios (opcional, solo chat):** Starvios no tiene API pública ni OAuth, así que la integración es parcial. **Stream Info no incluye Starvios** (no se puede publicar título, tags ni categoría); se añadirá cuando Starvios ofrezca una API.

*Qué sí hace:*
- **Chat unificado (solo lectura):** los mensajes de Starvios aparecen mezclados con los de Twitch, YouTube y Kick, con su icono, el color de cada usuario, los emotes y las donaciones marcadas con ⭐. Tiene su chip de filtro y su punto de estado.
- **Overlay Chat:** también sale en el overlay de la escena (el parámetro `platforms` lo incluye por defecto).
- **Emisión:** se emite a Starvios con **Multistream** (RTMP): servidor y clave de emisión. El destino lleva su icono si su nombre contiene `Starvios`.
- **Escribir:** desde la pestaña **Starvios** del dock de Chat, que muestra su chat completo.

*Qué no puede hacer* (Starvios no ofrece forma de hacerlo): publicar título/tags/categoría, enviar mensajes desde el cuadro de Confluence, ni mostrar el contador de viewers.

**Conectar el chat (una sola vez):**
1. En Starvios: **Studio → OBS Alerts**, copia el enlace del **chat** (`starvios.com/overlay/chat/…`). Es privado: no lo compartas.
2. En el dock **Confluence Chat**, pulsa el engranaje ⚙, pega el enlace en **Chat de Starvios** y pulsa **Conectar**. Confluence comprueba que Starvios lo acepta y lo guarda solo en tu PC. Para quitarlo, **Desconectar**.

**Escribir en el chat de Starvios (opcional):** en ese mismo menú ⚙, pega el enlace de tu canal (por ejemplo `starvios.com/popout/chat/tu_usuario` o `starvios.com/live/tu_usuario`) o escribe tu usuario en **Canal de Starvios**; el campo se queda solo con el usuario. Aparece la pestaña **Starvios** con `starvios.com/popout/chat/<usuario>`; la primera vez pulsa **Log in to chat** e inicia sesión (esa pantalla la rellenas tú).

**Emitir a Starvios con Multistream:** en tu panel de Starvios, **Go Live → OBS connection**, copia el servidor (`rtmps://live.cloudflare.com:443/live/`) y la clave de emisión (secreta), y añádelos como destino personalizado; ponle de nombre algo que contenga `Starvios`. Starvios recomienda CBR y un keyframe cada 2 segundos.

## Overlay Chat en tu escena

A diferencia de los docks, el Overlay se ve en tu stream, así que va **dentro de una escena**:

1. En **Fuentes**, pulsa **+ → Navegador**.
2. **URL:** `http://localhost:7773/overlay.html` (con los parámetros que quieras), **ancho/alto** según el espacio disponible, y marca **Apagar la fuente cuando no está visible**.

| Parámetro | Qué controla | Por defecto |
|---|---|---|
| `limit` | Mensajes visibles a la vez | `8` |
| `fade` | Segundos hasta que un mensaje se desvanece (`0` = nunca) | `20` |
| `platforms` | Plataformas a mostrar, separadas por coma | `twitch,youtube,kick,starvios` |
| `position` | Esquina: `bottom-left`, `bottom-right`, `top-left`, `top-right` | `bottom-left` |

Ejemplo: `http://localhost:7773/overlay.html?limit=8&fade=20&platforms=twitch,kick&position=bottom-left`

## Multistream

Aparece como un dock nativo de OBS (**Docks → Confluence Multistream**, si no se ve). Permite:

- **Add new target:** añadir un destino RTMP (YouTube, Kick o cualquier servidor) y, por destino, **Start / Modify / Delete**.
- **Start all / Stop all** para todos a la vez, y una fila para el stream principal de Twitch.
- Un indicador de estado de Confluence (verde/gris) con **Restart** y **Repair** para el servidor.

El plugin también expone una API por obs-websocket (listar, iniciar, detener y editar destinos); está documentada en [obs-plugin/README.md](obs-plugin/README.md).

## Stream Deck

Si instalaste el componente de Stream Deck, **reinicia la app de Stream Deck**. Las 9 acciones aparecen en la categoría **Confluence Suite**:

| Acción | Qué hace | Necesita |
|---|---|---|
| Target de Multistream | Inicia, detiene o alterna un destino RTMP | obs-websocket + Multistream |
| Stream Principal (Twitch) | Inicia o detiene el output nativo de OBS | obs-websocket |
| Start All / Stop All | Inicia o detiene el stream principal y todos los destinos | obs-websocket + Multistream |
| Reiniciar Confluence | Reinicia el servidor sin abrir OBS | Confluence instalado |
| Push Stream Info | Publica título, categoría y tags a las tres plataformas | Confluence en marcha |
| Enviar Mensaje al Chat | Envía un mensaje predefinido a las plataformas que elijas | Confluence en marcha |
| Crear Clip (Twitch) | Crea un clip y abre el editor | Confluence en marcha, canal en vivo |
| Estado de Confluence | Muestra el estado del chat y del stream en el dial (Stream Deck+) | Confluence + obs-websocket |

### Conectar Stream Deck con OBS (una sola vez)

Las acciones que controlan OBS (*Target de Multistream*, *Stream Principal*, *Start All*, *Stop All* y *Estado de Confluence*) hablan con OBS por **obs-websocket**, que ya viene incluido en OBS pero hay que activarlo:

1. Abre OBS → **Herramientas → Ajustes del servidor WebSocket**.
2. Marca **Activar servidor WebSocket**. Deja el puerto en `4455`.
3. Recomendado: deja marcada **Habilitar autenticación** y pulsa **Generar contraseña**; luego **Copiar contraseña**. Con la contraseña, nadie más en tu red puede controlar tu OBS. Pulsa **Aceptar**.
4. En Stream Deck, arrastra la acción **Target de Multistream** a un botón.
5. En su panel (Property Inspector), abajo, escribe: host `127.0.0.1` (o déjalo vacío), puerto `4455` (o vacío) y la **contraseña** que copiaste.
6. Pulsa **Probar conexión**. Debe decir en verde `Conectado a OBS <versión>`. Si falla, el mensaje dice la causa probable:
   - *"No se pudo conectar…"*: OBS está cerrado o el servidor WebSocket no está activado, o el puerto no coincide.
   - *"la contraseña no es correcta"*: vuelve a copiarla desde OBS.

Los datos de conexión son globales: se configuran una sola vez y valen para todas las acciones. El plugin reconecta solo si reinicias OBS. Las demás acciones no necesitan esto: *Push Stream Info*, *Enviar Mensaje al Chat*, *Crear Clip* y *Reiniciar Confluence* solo hablan con el servidor de Confluence.

## Actualizar, reparar y desinstalar

- **Actualizar:** cuando hay una versión nueva, los docks muestran un banner con **Descargar**. Descarga el nuevo `ConfluenceSetup-<versión>.exe`, cierra OBS y ejecútalo encima; conserva tus claves y sesiones.
- **Reparar:** ejecuta el instalador de nuevo y elige **Sí (reparar / actualizar / cambiar componentes)**, o usa **Reparar Confluence** del menú Inicio. Esto vuelve a poner las dependencias del servidor desde una copia incluida, sin internet, y lo reinicia. El botón **Repair** del dock de Multistream hace lo mismo.
- **Reiniciar:** botón **Restart** del dock de Multistream, o **Reiniciar Confluence** en el menú Inicio o en Stream Deck.
- **Desinstalar:** *Configuración → Aplicaciones → Confluence Suite*, o **Desinstalar Confluence** en el menú Inicio. Pregunta si quieres **borrar también** tus claves y sesiones (`data`): el botón por defecto es **No**, que las conserva. Si eliges **Sí**, antes guarda una copia en `Documentos\Confluence-respaldo`. Al reinstalar, si no hay claves y existe un respaldo, el instalador ofrece restaurarlo. Para scripts: `/DELETEDATA=1` al desinstalar y `/RESTOREBACKUP=1` al instalar en modo silencioso. Los docks que el asistente añadió a OBS se quitan desde **Docks → Custom Browser Docks**.

## Dónde se guarda todo

| Qué | Dónde |
|---|---|
| Servidor y Node portable | `%LOCALAPPDATA%\Confluence` (o la carpeta que elijas) |
| Tus claves y sesiones | `<carpeta de instalación>\data\` |
| Registro del servidor | `<carpeta de instalación>\scripts\confluence.log` |
| Plugin de OBS | `%PROGRAMDATA%\obs-studio\plugins\obs-multi-rtmp` |
| Plugin de Stream Deck | `%APPDATA%\Elgato\StreamDeck\Plugins\tv.noxtaipan.confluence.sdPlugin` |
| Dónde está instalado (lo lee el plugin de OBS) | `HKCU\Software\Confluence`, y `install-dir.txt` en `%APPDATA%\Confluence` y `%PROGRAMDATA%\Confluence` |

## Compilar desde el código fuente

Solo es necesario si quieres modificar algo; para usarlo basta el instalador.

### Servidor (`server/`)

Requisitos: [Node.js](https://nodejs.org) 20 o superior.

```powershell
cd server
npm install
npm run dev
```

Sirve en `http://localhost:7773`. Las credenciales se pueden pegar en `/setup.html` o ponerse en un `.env` (copia `.env.example`; los valores del `.env` tienen prioridad). Para arrancarlo oculto: `scripts\start-hidden.vbs`; para pararlo: `scripts\stop.ps1`; para que arranque con Windows: `scripts\install-task.ps1`.

### Plugin de OBS (`obs-plugin/`)

Requisitos: Visual Studio 2022 Build Tools (carga de trabajo *Desarrollo para el escritorio con C++*) y CMake 3.28 o superior. El soporte de websocket necesita la cabecera `obs-websocket-api.h` (no viene con el código de OBS): descárgala de [obs-websocket 5.5.4](https://github.com/obsproject/obs-websocket/blob/5.5.4/lib/obs-websocket-api.h) a una carpeta y pásala en `OBS_WEBSOCKET_INCLUDE_DIR`; sin ella CMake avisa `obs-websocket headers not found` y compila sin websocket.

```powershell
cd obs-plugin
cmake --preset windows-x64 -DENABLE_QT=ON -DENABLE_FRONTEND_API=ON -DENABLE_WEBSOCKET=ON -DOBS_WEBSOCKET_INCLUDE_DIR=<carpeta-con-la-cabecera>
cmake --build build_x64 --config Release
```

El resultado queda en `build_x64\rundir\Release` (`obs-multi-rtmp.dll` y la carpeta `obs-multi-rtmp` con idiomas y fuente). Para probarlo sin el instalador, con OBS cerrado, copia el `.dll` a `%PROGRAMDATA%\obs-studio\plugins\obs-multi-rtmp\bin\64bit\` y la carpeta `obs-multi-rtmp` a `%PROGRAMDATA%\obs-studio\plugins\obs-multi-rtmp\data\`. Si el servidor no está en `%LOCALAPPDATA%\Confluence`, define la variable de entorno `CONFLUENCE_DIR` con su carpeta.

### Plugin de Stream Deck (`streamdeck/`)

Requisitos: Node.js 20 y la app de Stream Deck 6.5+.

```powershell
cd streamdeck
npm install
npm run build
npm run link
npm run restart
```

`build` genera `bin/plugin.js`; `link` registra el plugin en la app y `restart` lo recarga tras cada compilación.

### Instalador (`installer/`)

Requisitos: [Inno Setup 6](https://jrsoftware.org/isinfo.php) (`winget install JRSoftware.InnoSetup`), Node.js y el plugin de OBS ya compilado.

```powershell
powershell -ExecutionPolicy Bypass -File installer\build.ps1 -PluginDir obs-plugin\build_x64\rundir\Release
```

Prepara el servidor con sus dependencias, descarga Node portable, compila el plugin de Stream Deck, y genera `installer\Output\ConfluenceSetup-<versión>.exe`. La versión sale de `server/package.json`.

**Publicar una versión:** sube la versión en `server/package.json`, añade la entrada al [CHANGELOG](CHANGELOG.md), genera el instalador y crea en GitHub una *release* con el tag `v<versión>` y el `.exe` adjunto. Los usuarios verán el banner de actualización en las siguientes 6 horas.

## Solución de problemas

- **Un dock muestra "Esperando a Confluence…" y no cambia.** El servidor no está corriendo. Abre el dock de Multistream y pulsa **Restart**; si no lo tienes, ejecuta **Reiniciar Confluence** del menú Inicio. Revisa `scripts\confluence.log` en la carpeta de instalación.
- **El dock de Multistream muestra Offline y Restart no hace nada.** Mira el log de OBS (**Ayuda → Archivos de registro**) y busca las líneas `[obs-multi-rtmp] Confluence dir`; deben mostrar la carpeta de instalación. Si dicen que no está configurada, vuelve a ejecutar el instalador, o define `CONFLUENCE_DIR`.
- **Tras instalar, el servidor no arranca o falta algo.** Usa **Reparar Confluence** (menú Inicio) o el botón **Repair**.
- **SmartScreen bloquea el instalador.** Pulsa **Más información → Ejecutar de todas formas**; el instalador no está firmado digitalmente.
- **Un dock de OBS muestra "server refused the connection".** Es Chromium, que no reintenta solo; los docks que añade el instalador usan una página de espera (`wait.html`) que lo evita. Si añadiste el dock a mano, usa como URL `file:///<carpeta de instalación>/public/wait.html?to=/` (Stream Info) o `...?to=/currents.html` (Chat), o pulsa **Click here to retry**.
- **`invalid_grant: Token has been expired or revoked` en YouTube.** Tu app de Google Cloud está en modo *Testing* y su token caduca a los 7 días de inactividad. Desconecta y reconecta YouTube; para que no vuelva a pasar, publica la app en Google Cloud.
- **Dos plugins de Multistream en OBS.** Borra `C:\Program Files\obs-studio\obs-plugins\64bit\obs-multi-rtmp.dll` y su carpeta en `data\obs-plugins\`, o desinstala el componente de `%APPDATA%`.
- **Las acciones de Stream Deck no aparecen.** Reinicia la app de Stream Deck. Si compilaste a mano, ejecuta `npm run link`.
