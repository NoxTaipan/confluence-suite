🇬🇧 **English** | [🇪🇸 Español](INSTALL.md)

# Confluence Suite installation guide

This guide covers installing with the wizard (recommended), creating each platform's app, daily use, and building everything from source. For an overview see the [README](README.en.md).

## Contents

1. [Install with the wizard](#install-with-the-wizard)
2. [Create each platform's app](#create-each-platforms-app)
3. [Connect your accounts and use Confluence](#connect-your-accounts-and-use-confluence)
4. [Overlay Chat in your scene](#overlay-chat-in-your-scene)
5. [Multistream](#multistream)
6. [Stream Deck](#stream-deck)
7. [Update, repair and uninstall](#update-repair-and-uninstall)
8. [Where everything is stored](#where-everything-is-stored)
9. [Build from source](#build-from-source)
10. [Troubleshooting](#troubleshooting)

## Install with the wizard

**Requirements:** 64-bit Windows 10/11 and OBS Studio 31 or newer. Nothing else.

1. Download `ConfluenceSetup-<version>.exe` from [Releases](https://github.com/NoxTaipan/confluence-suite/releases/latest).
2. **Close OBS.** The wizard will not continue while OBS is running and tells you so.
3. Run it. It does not need administrator rights. If Windows SmartScreen warns (the installer is not signed), click **More info → Run anyway**.
4. Choose the language and the installation type:
   - **Full installation:** everything below.
   - **Custom:** tick only what you want.

   | Component | What it installs | Where |
   |---|---|---|
   | Stream Info + Chat + Overlay | The server, portable Node and the docks | `%LOCALAPPDATA%\Confluence` (you can pick another folder) |
   | Multistream | The native OBS plugin | `%PROGRAMDATA%\obs-studio\plugins\obs-multi-rtmp` |
   | Stream Deck plugin | The 9 actions | `%APPDATA%\Elgato\StreamDeck\Plugins` |

5. Tick or untick the extra options:
   - **Add the Stream Info and Chat docks to OBS** (ticked): adds both docks to OBS without touching the ones you already have.
   - **Open the pages to create the Twitch, YouTube and Kick apps** (unticked).
6. At the end you can open the [Ko-fi](https://ko-fi.com/noxtaipan) page if you want to support the project (optional).
7. Open OBS. The server starts with OBS and the docks connect as soon as it is ready.

If you already had the Multistream plugin installed in OBS's own folder (`C:\Program Files\obs-studio\obs-plugins\64bit`), delete it before installing the Multistream component, or OBS will load two copies.

## Create each platform's app

Confluence uses **your own** credentials: there is no shared app. Create one app per platform you will use; skip the rest. On all of them the redirect URL must be exactly the one shown (if you change port `7773`, change it here too).

### Twitch

1. Go to [dev.twitch.tv/console/apps/create](https://dev.twitch.tv/console/apps/create) with your account.
2. **Name:** anything. **OAuth Redirect URLs:** `http://localhost:7773/auth/twitch/callback`. **Category:** *Application Integration*.
3. Save. Copy the **Client ID** and click **New Secret** to generate the **Client Secret** (shown only once).

### YouTube (Google Cloud)

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and create a project (or use an existing one).
2. **APIs & Services → Library** → search **YouTube Data API v3** → **Enable**.
3. **APIs & Services → OAuth consent screen:** type **External**, fill in name and email, and add the scope `https://www.googleapis.com/auth/youtube`. While the app is in *Testing* (normal for personal use), add yourself as a **test user** with your YouTube account's email.
4. **Credentials → Create credentials → OAuth client ID**, type **Web application**. **Authorized redirect URIs:** `http://localhost:7773/auth/youtube/callback`.
5. Copy the **Client ID** and the **Client secret**.

### Kick

1. Turn on **two-factor authentication** on your Kick account; without it the developer panel stays locked.
2. Go to [kick.com/settings/developer](https://kick.com/settings/developer) and create a new app.
3. **Redirect URL:** `http://localhost:7773/auth/kick/callback`.
4. Copy the **Client ID** and **Client Secret**.

## Connect your accounts and use Confluence

1. In the **Confluence Stream Info** dock, click a platform's pill (for example *Twitch*).
2. The first time, a screen opens to paste your **Client ID** and **Client Secret**. They are saved on your PC and Confluence restarts by itself.
3. Click the pill again: the platform's sign-in window opens. Authorize and the window closes itself. The pill now says *disconnect*.
4. Repeat with the other platforms.

**Publish title, tags and category:** type the title and the tags (comma-separated), search the Twitch and Kick category (with autocomplete), pick the YouTube one, and click **Publish to all 3**, or a single-platform button. The **clip** button creates a Twitch clip (only while the channel is live) and opens its editor.

**Chat:** the **Confluence Chat** dock mixes the three chats as soon as accounts are connected. The chips on top filter by platform, the gear sets mention highlighting or clears the chat, and the field at the bottom sends your message to one platform or all of them.

**Starvios (optional, chat only):** Starvios has no public API or OAuth, so the integration is partial. **Stream Info does not include Starvios** (title, tags and category cannot be published); it will be added when Starvios offers an API.

*What it does:*
- **Unified chat (read-only):** Starvios messages show up mixed with Twitch, YouTube and Kick, with its icon, each user's color, emotes and donations marked with ⭐. It has its own filter chip and status dot.
- **Overlay Chat:** it also appears in the scene overlay (the `platforms` parameter includes it by default).
- **Streaming:** you stream to Starvios with **Multistream** (RTMP): server and stream key. The destination gets its icon if its name contains `Starvios`.
- **Writing:** from the **Starvios** tab in the Chat dock, which shows its full chat.

*What it cannot do* (Starvios offers no way to): publish title/tags/category, send messages from Confluence's box, or show the viewer count.

**Connect the chat (one time):**
1. In Starvios: **Studio → OBS Alerts**, copy the **chat** link (`starvios.com/overlay/chat/…`). It is private: do not share it.
2. In the **Confluence Chat** dock, click the gear ⚙, paste the link into **Starvios chat** and click **Connect**. Confluence checks that Starvios accepts it and saves it only on your PC. To remove it, **Disconnect**.

**Write in Starvios chat (optional):** in that same ⚙ menu, paste your channel link (for example `starvios.com/popout/chat/your_username` or `starvios.com/live/your_username`) or type your username in **Starvios channel**; the field keeps only the username. The **Starvios** tab appears with `starvios.com/popout/chat/<username>`; the first time click **Log in to chat** and sign in (you fill in that screen yourself).

**Stream to Starvios with Multistream:** in your Starvios panel, **Go Live → OBS connection**, copy the server (`rtmps://live.cloudflare.com:443/live/`) and the stream key (secret), and add them as a custom destination; name it something that contains `Starvios`. Starvios recommends CBR and a keyframe every 2 seconds.

## Overlay Chat in your scene

Unlike the docks, the overlay is visible on your stream, so it goes **inside a scene**:

1. In **Sources**, click **+ → Browser**.
2. **URL:** `http://localhost:7773/overlay.html` (with the parameters you want), **width/height** to fit the space, and tick **Shutdown source when not visible**.

| Parameter | What it controls | Default |
|---|---|---|
| `limit` | Messages visible at once | `8` |
| `fade` | Seconds until a message fades out (`0` = never) | `20` |
| `platforms` | Platforms to show, comma-separated | `twitch,youtube,kick,starvios` |
| `position` | Corner: `bottom-left`, `bottom-right`, `top-left`, `top-right` | `bottom-left` |

Example: `http://localhost:7773/overlay.html?limit=8&fade=20&platforms=twitch,kick&position=bottom-left`

## Multistream

It appears as a native OBS dock (**Docks → Confluence Multistream**, if it is not visible). It lets you:

- **Add new target:** add an RTMP destination (YouTube, Kick or any server) and, per destination, **Start / Modify / Delete**.
- **Start all / Stop all** for everything at once, and a row for the main Twitch stream.
- A Confluence status indicator (green/grey) with **Restart** and **Repair** for the server.

The plugin also exposes an API over obs-websocket (list, start, stop and edit targets); it is documented in [obs-plugin/README.md](obs-plugin/README.md).

## Stream Deck

If you installed the Stream Deck component, **restart the Stream Deck app**. The 9 actions appear under the **Confluence Suite** category:

| Action | What it does | Needs |
|---|---|---|
| Multistream Target | Starts, stops or toggles an RTMP destination | obs-websocket + Multistream |
| Main Stream (Twitch) | Starts or stops OBS's native output | obs-websocket |
| Start All / Stop All | Starts or stops the main stream and all destinations | obs-websocket + Multistream |
| Restart Confluence | Restarts the server without opening OBS | Confluence installed |
| Push Stream Info | Publishes title, category and tags to all three platforms | Confluence running |
| Send Chat Message | Sends a preset message to the platforms you choose | Confluence running |
| Create Clip (Twitch) | Creates a clip and opens the editor | Confluence running, channel live |
| Confluence Status | Shows chat and stream status on the dial (Stream Deck+) | Confluence + obs-websocket |

### Connect Stream Deck to OBS (one time)

The actions that control OBS (*Multistream Target*, *Main Stream*, *Start All*, *Stop All* and *Confluence Status*) talk to OBS through **obs-websocket**, which ships with OBS but has to be turned on:

1. Open OBS → **Tools → WebSocket Server Settings**.
2. Tick **Enable WebSocket server**. Leave the port at `4455`.
3. Recommended: keep **Enable Authentication** ticked and click **Generate Password**, then **Copy Password**. With a password, nobody else on your network can control your OBS. Click **OK**.
4. In Stream Deck, drag the **Multistream Target** action onto a button.
5. In its panel (Property Inspector), at the bottom, enter: host `127.0.0.1` (or leave empty), port `4455` (or empty) and the **password** you copied.
6. Click **Probar conexión** (Test connection). It should say `Connected to OBS <version>` in green. If it fails, the message gives the likely cause:
   - *"Could not connect…"*: OBS is closed, the WebSocket server is not enabled, or the port differs.
   - *"the password is incorrect"*: copy it again from OBS.

The connection settings are global: set them once and they apply to every action. The plugin reconnects by itself if you restart OBS. The other actions do not need this: *Push Stream Info*, *Send Chat Message*, *Create Clip* and *Restart Confluence* only talk to the Confluence server.

## Update, repair and uninstall

- **Update:** when a newer version exists, the docks show a banner with **Download**. Download the new `ConfluenceSetup-<version>.exe`, close OBS and run it over the old one; it keeps your credentials and sessions.
- **Repair:** run the installer again and choose **Yes (repair / update / change components)**, or use **Repair Confluence** in the Start menu. It restores the server's dependencies from a bundled copy, offline, and restarts it. The **Repair** button in the Multistream dock does the same.
- **Restart:** the **Restart** button in the Multistream dock, or **Restart Confluence** in the Start menu or on Stream Deck.
- **Uninstall:** *Settings → Apps → Confluence Suite*, or **Uninstall Confluence** in the Start menu. It asks whether to keep your credentials (`data`). The docks the wizard added to OBS are removed from **Docks → Custom Browser Docks**.

## Where everything is stored

| What | Where |
|---|---|
| Server and portable Node | `%LOCALAPPDATA%\Confluence` (or the folder you chose) |
| Your credentials and sessions | `<install folder>\data\` |
| Server log | `<install folder>\scripts\confluence.log` |
| OBS plugin | `%PROGRAMDATA%\obs-studio\plugins\obs-multi-rtmp` |
| Stream Deck plugin | `%APPDATA%\Elgato\StreamDeck\Plugins\tv.noxtaipan.confluence.sdPlugin` |
| Where it is installed (read by the OBS plugin) | `HKCU\Software\Confluence`, and `install-dir.txt` in `%APPDATA%\Confluence` and `%PROGRAMDATA%\Confluence` |

## Build from source

Only needed if you want to modify something; to just use it, the installer is enough.

### Server (`server/`)

Requirements: [Node.js](https://nodejs.org) 20 or newer.

```powershell
cd server
npm install
npm run dev
```

It serves on `http://localhost:7773`. Credentials can be pasted on `/setup.html` or put in a `.env` (copy `.env.example`; `.env` values take precedence). To start it hidden: `scripts\start-hidden.vbs`; to stop it: `scripts\stop.ps1`; to start it with Windows: `scripts\install-task.ps1`.

### OBS plugin (`obs-plugin/`)

Requirements: Visual Studio 2022 Build Tools (*Desktop development with C++* workload) and CMake 3.28 or newer. Websocket support needs the `obs-websocket-api.h` header (it does not ship with OBS's source): download it from [obs-websocket 5.5.4](https://github.com/obsproject/obs-websocket/blob/5.5.4/lib/obs-websocket-api.h) into a folder and pass it as `OBS_WEBSOCKET_INCLUDE_DIR`; without it CMake warns `obs-websocket headers not found` and builds without websocket.

```powershell
cd obs-plugin
cmake --preset windows-x64 -DENABLE_QT=ON -DENABLE_FRONTEND_API=ON -DENABLE_WEBSOCKET=ON -DOBS_WEBSOCKET_INCLUDE_DIR=<folder-with-the-header>
cmake --build build_x64 --config Release
```

The output lands in `build_x64\rundir\Release` (`obs-multi-rtmp.dll` and the `obs-multi-rtmp` folder with languages and font). To try it without the installer, with OBS closed, copy the `.dll` to `%PROGRAMDATA%\obs-studio\plugins\obs-multi-rtmp\bin\64bit\` and the `obs-multi-rtmp` folder to `%PROGRAMDATA%\obs-studio\plugins\obs-multi-rtmp\data\`. If the server is not in `%LOCALAPPDATA%\Confluence`, set the `CONFLUENCE_DIR` environment variable to its folder.

### Stream Deck plugin (`streamdeck/`)

Requirements: Node.js 20 and the Stream Deck app 6.5+.

```powershell
cd streamdeck
npm install
npm run build
npm run link
npm run restart
```

`build` generates `bin/plugin.js`; `link` registers the plugin in the app and `restart` reloads it after each build.

### Installer (`installer/`)

Requirements: [Inno Setup 6](https://jrsoftware.org/isinfo.php) (`winget install JRSoftware.InnoSetup`), Node.js and the OBS plugin already built.

```powershell
powershell -ExecutionPolicy Bypass -File installer\build.ps1 -PluginDir obs-plugin\build_x64\rundir\Release
```

It prepares the server with its dependencies, downloads portable Node, builds the Stream Deck plugin, and produces `installer\Output\ConfluenceSetup-<version>.exe`. The version comes from `server/package.json`.

**Publishing a version:** bump the version in `server/package.json`, add the entry to the [CHANGELOG](CHANGELOG.md), build the installer and create a GitHub *release* tagged `v<version>` with the `.exe` attached. Users will see the update banner within the next 6 hours.

## Troubleshooting

- **A dock shows "Waiting for Confluence…" and never changes.** The server is not running. Open the Multistream dock and click **Restart**; if you do not have it, run **Restart Confluence** from the Start menu. Check `scripts\confluence.log` in the install folder.
- **The Multistream dock shows Offline and Restart does nothing.** Look at OBS's log (**Help → Log Files**) for the `[obs-multi-rtmp] Confluence dir` lines; they should show the install folder. If they say it is not configured, run the installer again, or set `CONFLUENCE_DIR`.
- **After installing, the server does not start or something is missing.** Use **Repair Confluence** (Start menu) or the **Repair** button.
- **SmartScreen blocks the installer.** Click **More info → Run anyway**; the installer is not digitally signed.
- **An OBS dock shows "server refused the connection".** That is Chromium, which does not retry by itself; the docks the installer adds use a waiting page (`wait.html`) that avoids it. If you added the dock by hand, use `file:///<install folder>/public/wait.html?to=/` (Stream Info) or `...?to=/currents.html` (Chat) as the URL, or click **Click here to retry**.
- **`invalid_grant: Token has been expired or revoked` on YouTube.** Your Google Cloud app is in *Testing* mode and its token expires after 7 days of inactivity. Disconnect and reconnect YouTube; to stop it happening again, publish the app in Google Cloud.
- **Two Multistream plugins in OBS.** Delete `C:\Program Files\obs-studio\obs-plugins\64bit\obs-multi-rtmp.dll` and its folder under `data\obs-plugins\`, or uninstall the `%APPDATA%` component.
- **The Stream Deck actions do not show up.** Restart the Stream Deck app. If you built by hand, run `npm run link`.
