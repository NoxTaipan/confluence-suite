# Plugin de Stream Deck / Stream Deck plugin

Plugin de Elgato Stream Deck (SDK 2, TypeScript + Rollup) con 9 acciones para controlar Confluence Suite. Está en `tv.noxtaipan.confluence.sdPlugin/`; el código en `src/`. Lo instala el asistente de la suite; para compilarlo a mano mira [INSTALL.md](../INSTALL.md#plugin-de-stream-deck-streamdeck).

Elgato Stream Deck plugin (SDK 2, TypeScript + Rollup) with 9 actions to control Confluence Suite. It lives in `tv.noxtaipan.confluence.sdPlugin/`; code in `src/`. The suite's wizard installs it; to build it by hand see [INSTALL.en.md](../INSTALL.en.md#stream-deck-plugin-streamdeck).

```powershell
npm install
npm run build     # genera bin/plugin.js
npm run link      # registra el plugin en la app de Stream Deck
npm run restart   # lo recarga tras cada compilación
```
