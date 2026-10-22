# Servidor de Confluence / Confluence server

Aplicación Node.js (Express) que escucha en `localhost:7773`: inicio de sesión OAuth con Twitch, YouTube y Kick, publicación de título/tags/categoría, chat unificado y overlay. Los docks de OBS son páginas de `public/`.

Node.js (Express) app listening on `localhost:7773`: OAuth sign-in with Twitch, YouTube and Kick, title/tags/category publishing, unified chat and overlay. The OBS docks are pages in `public/`.

| Carpeta / Folder | Contenido / Contents |
|---|---|
| `server.js` | Arranque y rutas / startup and routes |
| `routes/` | `auth`, `push`, `search`, `chat`, `setup`, `update` (API HTTP) |
| `lib/` | Clientes de Twitch, YouTube y Kick, credenciales, tokens, chat |
| `public/` | Docks (`index.html`, `currents.html`), `overlay.html`, `setup.html`, `wait.html` |
| `scripts/` | Arranque oculto, parada, reinicio, reparación, tarea de inicio, docks de OBS |

Cómo usarlo y compilarlo / How to use and build it: [INSTALL.md](../INSTALL.md#servidor-server) · [INSTALL.en.md](../INSTALL.en.md#server-server).
