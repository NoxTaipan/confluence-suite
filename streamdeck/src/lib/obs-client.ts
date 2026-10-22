import streamDeck from "@elgato/streamdeck";
import OBSWebSocket from "obs-websocket-js";

const VENDOR_NAME = "sorayuki.multi_rtmp";

export type ObsSettings = {
	obsHost?: string;
	obsPort?: number;
	obsPassword?: string;
};

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 4455;

let obs: OBSWebSocket | null = null;
let connecting: Promise<OBSWebSocket> | null = null;

async function getObsSettings(): Promise<ObsSettings> {
	return streamDeck.settings.getGlobalSettings<ObsSettings>();
}

async function connect(override?: ObsSettings): Promise<OBSWebSocket> {
	const settings = override ?? (await getObsSettings());
	const host = settings.obsHost || DEFAULT_HOST;
	const port = Number(settings.obsPort) || DEFAULT_PORT;
	const url = `ws://${host}:${port}`;

	const client = new OBSWebSocket();
	client.on("ConnectionClosed", () => {
		streamDeck.logger.info("obs-websocket: conexion cerrada");
		if (obs === client) {
			obs = null;
		}
	});

	await client.connect(url, settings.obsPassword || undefined);
	streamDeck.logger.info(`obs-websocket: conectado a ${url}`);
	return client;
}

/**
 * Devuelve una conexion viva a obs-websocket, conectando (o reconectando) segun haga falta.
 * Unica conexion compartida entre todas las instancias de acciones del plugin.
 */
async function getObs(): Promise<OBSWebSocket> {
	if (obs) {
		return obs;
	}
	if (!connecting) {
		connecting = connect()
			.then((client) => {
				obs = client;
				return client;
			})
			.finally(() => {
				connecting = null;
			});
	}
	return connecting;
}

/**
 * Llama a un request del vendor `sorayuki.multi_rtmp` que expone obs-multi-rtmp-ws
 * (StartTarget/StopTarget/ToggleTarget/ListTargets/GetTargetState/GetTargetStats, etc).
 * Tira si la respuesta trae `success: false` (target no encontrado, etc) en vez de
 * fallar en silencio - el handler C++ siempre responde con ese campo.
 */
export async function callMultiRtmpVendor<T = Record<string, unknown>>(
	requestType: string,
	requestData: Record<string, unknown> = {}
): Promise<T> {
	const client = await getObs();
	// `requestData` es un objeto JSON plano; el tipo JsonObject de obs-websocket-js
	// (via type-fest) no calza 1:1 con el de @elgato/utils, asi que se salva con un
	// `any` acotado en este unico call site en vez de pelear dos JsonObject de
	// terceros incompatibles entre si.
	const { responseData } = await client.call<"CallVendorRequest">("CallVendorRequest", {
		vendorName: VENDOR_NAME,
		requestType,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		requestData: requestData as any
	});
	const data = responseData as { success?: boolean; error?: string } & Record<string, unknown>;
	if (data.success === false) {
		throw new Error(data.error || `${requestType} fallo sin mensaje de error`);
	}
	return data as T;
}

/**
 * Resuelve el nombre de un target (Youtube/Kick, como se ve en el dock nativo) a su
 * id interno. Necesario porque `FindPushWidgetByIdOrName` en el plugin de OBS tiene
 * un bug: `obs_data_get_string(request_data, "id")` devuelve "" (no null) cuando el
 * campo "id" no viene en el request, y `if (targetId)` en C++ es true para un
 * puntero valido aunque apunte a texto vacio - asi que SIEMPRE toma el camino de
 * busqueda por id (con id="") y nunca llega a comparar por nombre, aunque se mande
 * `name` correctamente. Buscar por `id` en cambio funciona perfecto (probado
 * directo), asi que este helper hace la resolucion nombre->id de este lado.
 */
export async function resolveTargetId(name: string): Promise<string> {
	const { targets } = await callMultiRtmpVendor<{ targets: { id: string; name: string }[] }>("ListTargets");
	const normalized = name.trim().toLowerCase();
	const match = targets.find((t) => t.name.trim().toLowerCase() === normalized);
	if (!match) {
		const available = targets.map((t) => t.name).join(", ") || "ninguno";
		throw new Error(`Target "${name}" no encontrado. Targets disponibles: ${available}`);
	}
	return match.id;
}

/**
 * Llama a un request nativo de obs-websocket (StartStream/StopStream/ToggleStream/
 * GetStreamStatus, etc) - controla el stream principal de OBS, no los targets extra
 * del plugin de multistream.
 */
export async function callObs<T = Record<string, unknown>>(
	requestType: string,
	requestData?: Record<string, unknown>
): Promise<T> {
	const client = await getObs();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const response = await client.call(requestType as never, requestData as any);
	return response as T;
}

/**
 * Boton "Probar conexion" del Property Inspector: cierra la conexion actual, conecta con
 * los datos que el usuario tiene escritos en ese momento (aunque todavia no se hayan
 * guardado) y devuelve un mensaje claro, con la causa probable si falla.
 */
export async function testConnection(override: ObsSettings): Promise<{ ok: boolean; message: string }> {
	if (obs) {
		const old = obs;
		obs = null;
		await old.disconnect().catch(() => undefined);
	}
	let client: OBSWebSocket;
	try {
		client = await connect(override);
	} catch (err) {
		const text = String((err as { message?: string })?.message ?? err);
		const code = (err as { code?: number })?.code;
		if (code === 4009 || /authentication/i.test(text)) {
			return { ok: false, message: "OBS respondio, pero la contrasena no es correcta. Copiala de Herramientas > Ajustes del servidor WebSocket." };
		}
		if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|closed|failed/i.test(text) || code === undefined) {
			return {
				ok: false,
				message: "No se pudo conectar. Abre OBS y activa Herramientas > Ajustes del servidor WebSocket > Activar servidor; revisa host y puerto."
			};
		}
		return { ok: false, message: `No se pudo conectar: ${text}` };
	}
	obs = client;
	try {
		const version = await client.call("GetVersion");
		let multistream = "";
		try {
			const { targets } = await callMultiRtmpVendor<{ targets: unknown[] }>("ListTargets");
			multistream = ` Multistream detectado (${targets.length} destinos).`;
		} catch {
			multistream = " El plugin Confluence Multistream no responde (solo se necesita para las acciones de destinos).";
		}
		return { ok: true, message: `Conectado a OBS ${version.obsVersion}.${multistream}` };
	} catch {
		return { ok: true, message: "Conectado a OBS." };
	}
}
