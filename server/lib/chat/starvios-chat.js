const starvios = require('../starvios');

// Mismo ritmo que el overlay oficial de Starvios: cada 4 s con el directo en
// marcha, mucho mas lento si esta apagado (no hay nada que leer).
const POLL_LIVE_MS = 4000;
const POLL_OFFLINE_MS = 20000;
const BACKLOG_WINDOW_MS = 120000; // al abrir el dock no se vuelca el historial viejo
const SEEN_LIMIT = 500;

function toEmoteMap(emotes) {
  const map = {};
  (Array.isArray(emotes) ? emotes : []).forEach((e) => {
    if (e && e.code && e.url) map[`:${String(e.code).toLowerCase()}:`] = e.url;
  });
  return map;
}

// Los emotes de Starvios van en el texto como :codigo: (igual que en su overlay).
function buildSegments(text, emoteMap) {
  return text
    .split(/(:[a-zA-Z0-9_]{2,20}:)/g)
    .filter((part) => part.length > 0)
    .map((part) => {
      const url = emoteMap[part.toLowerCase()];
      return url ? { type: 'emote', url, name: part } : { type: 'text', value: part };
    });
}

function start(emit, onStatus) {
  let stopped = false;
  let timer = null;
  let firstPoll = true;
  const seen = new Set();

  function remember(id) {
    seen.add(id);
    if (seen.size > SEEN_LIMIT) seen.delete(seen.values().next().value);
  }

  async function poll() {
    if (stopped) return;
    const token = starvios.getToken();
    if (!token) {
      onStatus('offline');
      return;
    }
    let delay = POLL_LIVE_MS;
    try {
      // full=1 solo la primera vez: trae los emotes del canal
      const data = await starvios.fetchChat(token, { full: firstPoll });
      if (stopped) return;
      if (data.emotes) poll.emoteMap = toEmoteMap(data.emotes);
      const emoteMap = poll.emoteMap || {};
      const now = Date.now();
      data.messages.forEach((m) => {
        if (!m || m.id == null || seen.has(m.id)) return;
        remember(m.id);
        const created = m.createdAt ? Date.parse(m.createdAt) : now;
        if (firstPoll && Number.isFinite(created) && now - created > BACKLOG_WINDOW_MS) return;
        let text = String(m.body || '');
        if (m.coins > 0) text = `⭐ ${m.coins} · ${text}`;
        emit({
          platform: 'starvios',
          id: `sv-${m.id}`,
          author: m.name || 'unknown',
          color: m.color || null,
          text,
          segments: buildSegments(text, emoteMap),
          timestamp: Number.isFinite(created) ? created : now
        });
      });
      firstPoll = false;
      onStatus('online');
      if (data.live === false) delay = POLL_OFFLINE_MS;
    } catch {
      onStatus('connecting');
      delay = POLL_OFFLINE_MS;
    }
    if (!stopped) timer = setTimeout(poll, delay);
  }

  onStatus('connecting');
  poll();

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}

module.exports = { start };
