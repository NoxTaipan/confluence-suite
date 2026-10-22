const tokenStore = require('./token-store');

// Starvios no tiene API publica ni OAuth. Lo unico pensado para terceros es el
// enlace privado del overlay de chat para OBS (Studio -> OBS Alerts):
//   https://starvios.com/overlay/chat/<token>
// y el JSON que ese mismo overlay consulta. Es solo lectura: no hay forma de
// enviar mensajes ni de publicar titulo/categoria desde fuera.
// STARVIOS_ENDPOINT solo existe para pruebas locales con un servidor simulado.
const ENDPOINT = process.env.STARVIOS_ENDPOINT || 'https://starvios.com/api/public/obs-chat';
const TOKEN_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

// Acepta el enlace completo del overlay o solo el token.
function parseToken(input) {
  const match = TOKEN_PATTERN.exec(String(input || ''));
  return match ? match[0].toLowerCase() : null;
}

function getToken() {
  const data = tokenStore.get('starvios');
  return data && data.token ? data.token : null;
}

function isConnected() {
  return !!getToken();
}

async function fetchChat(token, { full = false } = {}) {
  const res = await fetch(`${ENDPOINT}?token=${encodeURIComponent(token)}&v=2${full ? '&full=1' : ''}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) throw new Error(`Starvios respondio ${res.status}`);
  const data = await res.json();
  if (!data || !Array.isArray(data.messages)) throw new Error('Respuesta inesperada de Starvios');
  return data;
}

// Valida el enlace contra Starvios antes de guardarlo.
async function connect(input) {
  const token = parseToken(input);
  if (!token) throw new Error('No encuentro el enlace del overlay de chat. Copialo de Starvios: Studio > OBS Alerts.');
  await fetchChat(token, { full: true });
  tokenStore.set('starvios', { token });
}

function disconnect() {
  tokenStore.clear('starvios');
}

async function sendChatMessage() {
  throw new Error('Starvios no permite enviar mensajes desde Confluence (no tiene API). Escribe desde la pestaña de Starvios del chat.');
}

module.exports = { parseToken, getToken, isConnected, fetchChat, connect, disconnect, sendChatMessage };
