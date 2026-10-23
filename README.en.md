🇬🇧 **English** | [🇪🇸 Español](README.md)

# Confluence Suite

**Confluence Suite** is a set of free tools for streamers who go live on **Twitch, YouTube and Kick** at the same time, all inside **OBS Studio**:

| Piece | What it does |
|---|---|
| **Stream Info** | Publishes title, tags and category to all three platforms with one click. Creates Twitch clips. |
| **Chat** | A unified Twitch, YouTube and Kick chat, with emotes, a per-platform viewer counter and a box to reply on any of them. |
| **Starvios** | Chat only: its chat is read in the unified chat (with icon, emotes and donations) and in the overlay, and you stream to Starvios with Multistream (RTMP). Without a public API there is no title/category or sending from Confluence: Stream Info does not include it until Starvios has an API. |
| **Overlay Chat** | The same chat in read-only mode, to show inside your scene. |
| **Multistream** | Native OBS plugin that sends your video to several RTMP destinations at once (Twitch, YouTube, Kick or any server), with start/stop buttons per destination. |
| **Stream Deck** | Elgato Stream Deck plugin with 9 actions to control everything above from physical buttons. |

Everything runs **on your own PC**: no central server, account or subscription. You create your own developer apps on each platform (the guide explains how) and your keys stay on your machine.

<p>
  <img src="docs/screenshots/stream-info.png" alt="Stream Info dock" width="280" />
  <img src="docs/screenshots/chat.png" alt="Chat dock" width="280" />
  <img src="docs/screenshots/multistream.png" alt="Multistream dock" width="280" />
</p>

## What you need

- **Windows 10 or 11** (64-bit).
- **OBS Studio 31 or newer** (tested with 32.2).
- An account on each platform you want to use and **your own developer app** on each one (free; the guide shows how): [Twitch](https://dev.twitch.tv/console/apps/create), [Google Cloud / YouTube](https://console.cloud.google.com/) and [Kick](https://kick.com/settings/developer) (Kick requires two-factor authentication first).
- For Stream Deck: the [Elgato Stream Deck](https://www.elgato.com/downloads) app, 6.5 or newer.

You do not need to install Node.js, Visual Studio or anything else: the installer bundles everything.

## Quick install

1. Download **`ConfluenceSetup-<version>.exe`** from [Releases](https://github.com/NoxTaipan/confluence-suite/releases/latest).
2. **Close OBS** and run the installer (no administrator rights needed). Windows SmartScreen may warn because the installer is not code-signed: click **More info → Run anyway**.
3. Choose what to install: **Stream Info + Chat + Overlay**, **Multistream**, **Stream Deck plugin**, or any combination.
4. Open OBS. The **Confluence Stream Info** and **Confluence Chat** docks appear by themselves and the server starts with OBS.
5. Click each platform's pill in Stream Info: the first time it asks for your app's *Client ID* and *Client Secret*, then takes you to sign in.

The full guide, including how to create each platform's app, is in **[INSTALL.en.md](INSTALL.en.md)**.

## How it works

```
 Twitch ─┐                                   ┌─ "Stream Info" dock  (Custom Browser Dock)
 YouTube ┼─ each platform's API ─── Server ──┼─ "Chat" dock         (Custom Browser Dock)
 Kick  ──┘     (your keys, on your PC) Node  └─ Overlay Chat        (Browser Source in your scene)
                                      :7773
 OBS ── Multistream plugin ── obs-websocket ── Stream Deck plugin
```

- **Server (`server/`):** a small Node.js app that listens only on `localhost:7773`. It handles sign-in (OAuth) with each platform, publishes title/tags/category and keeps the chats open. OBS shows it as *Custom Browser Docks*.
- **OBS plugin (`obs-plugin/`):** a native C++ plugin (based on [obs-multi-rtmp](https://github.com/sorayuki/obs-multi-rtmp)) with its own panel. Besides RTMP destinations, it starts the server when OBS opens and has **Restart** and **Repair** buttons for it. It exposes an API over obs-websocket.
- **Stream Deck plugin (`streamdeck/`):** talks to the server over HTTP and to OBS over obs-websocket.
- **Installer (`installer/`):** an Inno Setup wizard that bundles portable Node and installs everything without touching your system outside the app and OBS folders.

## Update, repair and uninstall

- **Update notice:** the docks show a banner with a **Download** button when a newer version exists on GitHub (checked every 6 hours; it only asks for the published version and sends none of your data).
- **Update:** run the new installer over the old one. Your credentials and sessions are kept.
- **Repair:** run the installer again and choose *Repair*, or use **Repair Confluence** in the Start menu (restores dependencies offline), or the **Repair** button in the Multistream dock.
- **Uninstall:** Windows *Apps*, or **Uninstall Confluence** in the Start menu. It asks whether to also delete your credentials; the default is to keep them, and a backup is saved before any deletion.

## Privacy and security

- Your *Client ID/Secret* and sessions are stored **only on your PC** (`data/` inside the install folder).
- The server only accepts connections from `localhost`, and its setup page rejects requests from other websites.
- The only thing that leaves your PC, besides talking to the platforms themselves, is the version check against GitHub's public API.

## Known limitations

- YouTube can only update a broadcast that is already live (it does not create a new one).
- Kick uses a relatively new public API; if category search fails, check the current endpoints at [docs.kick.com](https://docs.kick.com).
- A Google Cloud app in *Testing* mode expires the YouTube token after 7 days of inactivity (`invalid_grant`); disconnect and reconnect YouTube, or publish the app in Google Cloud.
- The installer is not code-signed, which is why SmartScreen warns.
- Windows only.

## Build from source

Explained in [INSTALL.en.md](INSTALL.en.md#build-from-source): the server and the Stream Deck plugin with Node.js, the OBS plugin with Visual Studio Build Tools and CMake, and the installer with Inno Setup.

## Support the project

Everything I publish on GitHub, including this, is free and open source. If it is useful to you and you want to support its upkeep, buy me a coffee:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/noxtaipan)

Separately, on [Gumroad](https://noxtaipan.gumroad.com/) I sell other products; those do cost money. Issues and pull requests are welcome.

## License

The server, the Stream Deck plugin and the installer are [MIT](LICENSE). The OBS plugin (`obs-plugin/`) is a derivative work of [obs-multi-rtmp](https://github.com/sorayuki/obs-multi-rtmp) and is distributed under **GPL-2.0** ([obs-plugin/LICENSE](obs-plugin/LICENSE)); see [NOTICE.md](NOTICE.md) for credits.
