import streamDeck, { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import type { JsonObject } from "@elgato/utils";
import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type Settings = JsonObject;

// Carpeta donde esta instalado Confluence. Orden de busqueda:
//   1. variable de entorno CONFLUENCE_DIR (para instalaciones a mano),
//   2. install-dir.txt que escribe el instalador (AppData y ProgramData),
//   3. la carpeta por defecto del instalador: %LOCALAPPDATA%\Confluence.
// Sin ninguna, la accion muestra una alerta en vez de apuntar a una carpeta ajena.
function findConfluenceDir(): string | undefined {
	const candidates: string[] = [];
	if (process.env.CONFLUENCE_DIR) candidates.push(process.env.CONFLUENCE_DIR);
	for (const base of [process.env.APPDATA, process.env.PROGRAMDATA]) {
		if (!base) continue;
		try {
			candidates.push(readFileSync(join(base, "Confluence", "install-dir.txt"), "utf8").trim());
		} catch {
			// no existe: se prueba el siguiente
		}
	}
	if (process.env.LOCALAPPDATA) candidates.push(join(process.env.LOCALAPPDATA, "Confluence"));
	return candidates.find((dir) => dir && existsSync(join(dir, "scripts", "start-hidden.vbs")));
}

/**
 * Reinicia el servidor de Confluence corriendo los mismos dos scripts que usa el
 * boton "Restart" del dock nativo de OBS: stop.ps1 (mata el PID guardado si sigue
 * vivo) y start-hidden.vbs (lo relanza oculto).
 */
@action({ UUID: "tv.noxtaipan.confluence.restart-confluence" })
export class RestartConfluence extends SingletonAction<Settings> {
	override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
		const dir = findConfluenceDir();
		if (!dir) {
			streamDeck.logger.error("restart-confluence: no se encontro la carpeta de Confluence (ver CONFLUENCE_DIR)");
			await ev.action.showAlert();
			return;
		}
		try {
			await execFileAsync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", join(dir, "scripts", "stop.ps1")]);
			await execFileAsync("wscript.exe", [join(dir, "scripts", "start-hidden.vbs")]);
			await ev.action.showOk();
		} catch (err) {
			streamDeck.logger.error(`restart-confluence: error - ${err}`);
			await ev.action.showAlert();
		}
	}
}
