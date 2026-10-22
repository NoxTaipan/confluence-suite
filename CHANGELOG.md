# Changelog

## v1.0.0 — 2026-10-22

Primer lanzamiento de **Confluence Suite** como proyecto único: el servidor (antes `confluence-beta`), el plugin de OBS (antes `confluence-multistream`) y el plugin de Stream Deck (antes `confluence-streamdeck-beta`) viven ahora en este repositorio. / First release of **Confluence Suite** as a single project: the server (formerly `confluence-beta`), the OBS plugin (formerly `confluence-multistream`) and the Stream Deck plugin (formerly `confluence-streamdeck-beta`) now live in this repository.

- **Instalador `.exe` / `.exe` installer:** un asistente con selector de componentes (Stream Info + Chat + Overlay, Multistream, Stream Deck), Node portable incluido, docks de OBS automáticos, accesos en el menú Inicio, reparar y desinstalar. Sin permisos de administrador. / A wizard with a component picker, bundled portable Node, automatic OBS docks, Start menu shortcuts, repair and uninstall. No administrator rights needed.
- **Aviso de actualización / Update notice:** los docks muestran un banner con botón «Descargar» cuando hay una release nueva en GitHub (cada 6 h, sin enviar datos). / The docks show a banner with a Download button when a newer GitHub release exists (every 6 h, no data sent).
- **Multistream:** arranca Confluence solo al abrir OBS, ya no depende de una ruta fija (busca la carpeta en variable de entorno, registro y archivos `install-dir.txt`), y Restart/Repair ya no se quedan bloqueados si falla algo; Repair restaura `node_modules` sin internet. / Starts Confluence by itself when OBS opens, no longer depends on a hardcoded path (looks in an environment variable, the registry and `install-dir.txt` files), and Restart/Repair no longer lock up when something fails; Repair restores `node_modules` offline.
- **Stream Deck:** «Reiniciar Confluence» encuentra la instalación sin configurar `CONFLUENCE_DIR`. / "Restart Confluence" finds the installation without setting `CONFLUENCE_DIR`.
- **Starvios:** su chat se lee en el chat unificado y en el overlay (conectando el enlace del overlay de chat desde la pastilla de Stream Info), con su icono en todas las superficies (Stream Info, Chat, Overlay, Multistream y Stream Deck); pestaña «Starvios» para escribir; Starvios no tiene API pública, así que no hay título/categoría ni envío desde Confluence. / Its chat is read in the unified chat and the overlay (connect the chat overlay link from the Stream Info pill), with its icon everywhere (Stream Info, Chat, Overlay, Multistream and Stream Deck); a Starvios tab to write; Starvios has no public API, so no title/category and no sending from Confluence.
- **Stream Deck:** el dial de estado del chat pedía una ruta que no existe y siempre mostraba «Chat: ?»; ahora funciona y cuenta Starvios. / The chat status dial called a route that does not exist and always showed «Chat: ?»; it now works and counts Starvios.

## Historial previo del servidor / Earlier server history

## v1.1.1 — 2026-10-22

- **Popup de inicio de sesión / Sign-in popup:** el dock de OBS ahora cierra solo la ventana de Twitch, Kick y YouTube en cuanto la plataforma queda conectada (el navegador de OBS no deja que la página se cierre a sí misma). / The OBS dock now closes the Twitch, Kick and YouTube sign-in popup as soon as the platform is connected (OBS's embedded browser blocks the page from closing itself).

## v1.1 — 2026-10-21

- **Primer uso sin `.env` / First run without `.env`:** al tocar la pastilla de una plataforma sin credenciales se abre `/setup.html`, donde pegás tu Client ID y Client Secret una sola vez (se guardan en `data/credentials.json`, solo en tu PC). Confluence se reinicia solo y te lleva a iniciar sesión con tu usuario y clave. Los valores del `.env` siguen teniendo prioridad. / Clicking a platform pill with no credentials opens `/setup.html` to paste your Client ID/Secret once (stored in `data/credentials.json`, local only); Confluence restarts itself and sends you to sign in. `.env` values still take precedence.
- **Seguridad / Security:** el endpoint de configuración (`/api/setup`) solo acepta peticiones del propio `localhost:7773` (comprueba `Host` y `Origin`), para que otra web no pueda cambiar tus credenciales. / The setup endpoint only accepts requests from `localhost:7773` itself (checks `Host` and `Origin`).
- **Dependencias / Dependencies:** `npm audit fix` — resuelve la vulnerabilidad crítica de `proxy-addr`; 0 vulnerabilidades. / resolves the critical `proxy-addr` advisory; 0 vulnerabilities.
- **Multistream:** guía de compilación verificada con OBS 32.2, VS Build Tools 2022 y CMake 4, incluida la cabecera `obs-websocket-api.h`. / build guide verified with OBS 32.2, VS Build Tools 2022 and CMake 4, including the `obs-websocket-api.h` header.
