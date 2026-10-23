const MAX_MESSAGES = 200;
const NEAR_BOTTOM_PX = 60;

const feed = document.getElementById('chat-feed');
const activePlatforms = { twitch: true, youtube: true, kick: true, starvios: true };

// PLATFORM_ICONS y el llenado de .platform-icon-holder vienen de
// platform-icons.js (compartido con Confluence Stream Info).

function isNearBottom() {
  return feed.scrollHeight - feed.scrollTop - feed.clientHeight < NEAR_BOTTOM_PX;
}

const MENTION_KEY = 'confluence-chat-mention';
let mentionKeyword = '';
try {
  mentionKeyword = localStorage.getItem(MENTION_KEY) || '';
} catch {
  // localStorage no disponible - sin resaltado, no bloqueante
}

function appendMessage(msg) {
  const stickToBottom = isNearBottom();

  const row = document.createElement('div');
  row.className = 'chat-msg';
  row.dataset.platform = msg.platform;
  if (!activePlatforms[msg.platform]) row.hidden = true;

  const icon = document.createElement('span');
  icon.className = 'platform-icon';
  icon.innerHTML = PLATFORM_ICONS[msg.platform] || '';

  const author = document.createElement('span');
  author.className = 'author';
  author.textContent = msg.author;
  if (msg.color) author.style.color = msg.color;

  const text = document.createElement('span');
  text.className = 'text';

  if (Array.isArray(msg.segments)) {
    msg.segments.forEach((seg) => {
      if (seg.type === 'emote') {
        const img = document.createElement('img');
        img.className = 'emote-img';
        img.src = seg.url;
        img.alt = seg.name;
        img.title = seg.name;
        text.appendChild(img);
      } else {
        text.appendChild(document.createTextNode(seg.value));
      }
    });
  } else {
    text.textContent = msg.text;
  }

  if (mentionKeyword && msg.text && msg.text.toLowerCase().includes(mentionKeyword.toLowerCase())) {
    row.classList.add('mention');
  }

  row.append(icon, author, text);
  feed.appendChild(row);

  while (feed.children.length > MAX_MESSAGES) {
    feed.removeChild(feed.firstChild);
  }

  if (stickToBottom) feed.scrollTop = feed.scrollHeight;
}

function updateStatus(platform, status) {
  document.querySelectorAll(`[data-platform="${platform}"]`).forEach((el) => {
    el.dataset.status = status;
  });
}

function connect() {
  const source = new EventSource('/api/chat/stream');
  source.onmessage = (ev) => {
    let data;
    try {
      data = JSON.parse(ev.data);
    } catch {
      return; // linea de keepalive u otro dato no valido - ignorar
    }
    if (data.type === 'status') updateStatus(data.platform, data.status);
    else appendMessage(data);
  };
  // EventSource reintenta la conexion solo (comportamiento nativo del spec).
}

document.querySelectorAll('.filter-chip').forEach((chip) => {
  const toggleFilter = () => {
    const platform = chip.dataset.platform;
    activePlatforms[platform] = !activePlatforms[platform];
    chip.dataset.active = String(activePlatforms[platform]);
    feed.querySelectorAll(`.chat-msg[data-platform="${platform}"]`).forEach((row) => {
      row.hidden = !activePlatforms[platform];
    });
  };
  chip.addEventListener('click', toggleFilter);
  chip.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFilter();
    }
  });
});

// Popovers tipo "click para abrir, click afuera o Escape para cerrar" -
// mismo comportamiento para el menu de configuracion y el picker de emojis.
const popovers = [];

function registerPopover(btn, panel) {
  function close() {
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }
  btn.addEventListener('click', () => {
    const willOpen = panel.hidden;
    popovers.forEach((p) => p.close());
    if (willOpen) {
      panel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
    }
  });
  popovers.push({ btn, panel, close });
  return close;
}

// mousedown en fase de captura (no click en bubble) - mas confiable para
// detectar "click afuera" dentro de un dock embebido en CEF/OBS.
document.addEventListener('mousedown', (e) => {
  popovers.forEach(({ btn, panel, close }) => {
    if (!panel.hidden && !panel.contains(e.target) && e.target !== btn) close();
  });
}, true);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') popovers.forEach((p) => p.close());
});

const settingsBtn = document.getElementById('settings-btn');
const settingsMenu = document.getElementById('settings-menu');
const closeSettingsMenu = registerPopover(settingsBtn, settingsMenu);

document.querySelectorAll('.settings-item').forEach((item) => {
  item.addEventListener('click', () => {
    const target = item.dataset.clear;
    const rows = target === 'all'
      ? feed.querySelectorAll('.chat-msg')
      : feed.querySelectorAll(`.chat-msg[data-platform="${target}"]`);
    rows.forEach((row) => row.remove());
    closeSettingsMenu();
  });
});

const EMOJIS = [
  '😀', '😂', '🤣', '😊', '😍', '🥰', '😎', '🤔', '😢', '😭',
  '😡', '🤯', '😱', '🥳', '😴', '🙄', '😏', '😇', '🤗', '🫡',
  '👍', '👎', '👏', '🙌', '🤝', '💪', '🙏', '👋', '✌️', '🤙',
  '❤️', '🔥', '💯', '⭐', '✨', '💀', '🎉', '👀', '💬', '⚡'
];

const emojiBtn = document.getElementById('emoji-btn');
const emojiPicker = document.getElementById('emoji-picker');

if (emojiPicker.children.length === 0) {
  EMOJIS.forEach((emoji) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = emoji;
    btn.addEventListener('click', () => insertAtCursor(composerInput, emoji));
    emojiPicker.appendChild(btn);
  });
}

registerPopover(emojiBtn, emojiPicker);

function insertAtCursor(input, text) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  input.value = input.value.slice(0, start) + text + input.value.slice(end);
  const cursor = start + text.length;
  input.focus();
  input.setSelectionRange(cursor, cursor);
}

const mentionInput = document.getElementById('mention-keyword');
mentionInput.value = mentionKeyword;
mentionInput.addEventListener('input', () => {
  mentionKeyword = mentionInput.value.trim();
  try {
    localStorage.setItem(MENTION_KEY, mentionKeyword);
  } catch {
    // no bloqueante
  }
});

// --- Starvios: chat embebido (Starvios no tiene API publica; su pagina popout permite leer y escribir) ---
const STARVIOS_KEY = 'confluence-starvios-channel';
const starviosInput = document.getElementById('starvios-channel');
const starviosFrame = document.getElementById('starvios-frame');
const viewTabs = document.getElementById('view-tabs');

function setView(view) {
  document.body.classList.toggle('view-starvios', view === 'starvios');
  viewTabs.querySelectorAll('.view-tab').forEach((tab) => {
    tab.setAttribute('aria-pressed', String(tab.dataset.view === view));
  });
}

// Acepta el usuario o cualquier enlace de tu canal (popout/chat, live o @usuario) y se queda solo con el usuario.
function parseStarviosChannel(raw) {
  const value = String(raw || '').trim();
  const fromLink = /starvios\.com\/(?:popout\/chat\/|live\/|@)?@?([A-Za-z0-9_.-]{2,40})/i.exec(value);
  if (fromLink) return fromLink[1];
  return value.replace(/^@/, '');
}

function applyStarvios() {
  const channel = parseStarviosChannel(starviosInput.value);
  const valid = /^[A-Za-z0-9_.-]{2,40}$/.test(channel);
  viewTabs.hidden = !valid;
  if (valid) {
    const src = `https://starvios.com/popout/chat/${encodeURIComponent(channel)}`;
    if (starviosFrame.getAttribute('src') !== src) starviosFrame.setAttribute('src', src);
  } else {
    starviosFrame.removeAttribute('src');
    setView('unified');
  }
}

try {
  starviosInput.value = localStorage.getItem(STARVIOS_KEY) || '';
} catch {
  // localStorage no disponible - sin pestaña de Starvios, no bloqueante
}
starviosInput.addEventListener('input', () => {
  const channel = parseStarviosChannel(starviosInput.value);
  if (channel !== starviosInput.value.trim()) starviosInput.value = channel; // el enlace pegado se reduce al usuario
  try {
    localStorage.setItem(STARVIOS_KEY, channel);
  } catch {
    // no bloqueante
  }
  applyStarvios();
});
viewTabs.querySelectorAll('.view-tab').forEach((tab) => {
  tab.addEventListener('click', () => setView(tab.dataset.view));
});
applyStarvios();

// Conexion del chat de Starvios (solo lectura): se pega el enlace privado del overlay de chat.
const starviosConnectRow = document.getElementById('starvios-connect-row');
const starviosConnected = document.getElementById('starvios-connected');
const starviosLink = document.getElementById('starvios-link');
const starviosMsg = document.getElementById('starvios-link-msg');

async function refreshStarviosState() {
  try {
    const status = await (await fetch('/api/status')).json();
    starviosConnectRow.hidden = !!status.starvios;
    starviosConnected.hidden = !status.starvios;
  } catch {
    // servidor no disponible - se deja el estado como esta, no bloqueante
  }
}

document.getElementById('starvios-link-save').addEventListener('click', async () => {
  starviosMsg.textContent = '...';
  try {
    const res = await fetch('/auth/starvios/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ link: starviosLink.value })
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Error');
    starviosLink.value = '';
    starviosMsg.textContent = '';
  } catch (err) {
    starviosMsg.textContent = err.message;
  }
  refreshStarviosState();
});

document.getElementById('starvios-link-clear').addEventListener('click', async () => {
  await fetch('/auth/starvios/disconnect', { method: 'POST' });
  refreshStarviosState();
});
refreshStarviosState();

const composerInput = document.getElementById('composer-input');
const composerSend = document.getElementById('composer-send');
const composerTargetAll = document.getElementById('composer-target-all');
const composerPlatformTargets = document.querySelectorAll('.composer-target[data-platform]');

// A cuales plataformas se envia - toggles persistentes, no botones de
// "enviar solo aca" (eso generaba confusion sobre que iba a recibir el
// mensaje al tocar la flecha de enviar).
const composerActive = { twitch: true, youtube: true, kick: true };

function renderComposerTargets() {
  composerPlatformTargets.forEach((btn) => {
    // Starvios no esta en composerActive: es solo lectura (no tiene API para enviar).
    btn.dataset.active = String(!!composerActive[btn.dataset.platform]);
  });
  composerTargetAll.dataset.active = String(Object.values(composerActive).every(Boolean));
}
renderComposerTargets();

composerTargetAll.addEventListener('click', () => {
  Object.keys(composerActive).forEach((p) => { composerActive[p] = true; });
  renderComposerTargets();
});

composerPlatformTargets.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.dataset.readonly === 'true') return;
    const platform = btn.dataset.platform;
    composerActive[platform] = !composerActive[platform];
    renderComposerTargets();
  });
});

async function sendMessage() {
  const message = composerInput.value.trim();
  const platforms = Object.keys(composerActive).filter((p) => composerActive[p]);
  if (!message || platforms.length === 0) return;

  composerInput.disabled = true;
  try {
    await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, platforms })
    });
    composerInput.value = '';
  } catch {
    // el usuario ya ve si no llego mirando el chat - sin bloquear la UI
  } finally {
    composerInput.disabled = false;
    composerInput.focus();
  }
}

composerSend.addEventListener('click', sendMessage);
composerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

const VIEWER_TOGGLES_KEY = 'confluence-viewer-toggles';
let viewerToggles = { twitch: true, youtube: true, kick: true };
try {
  viewerToggles = { ...viewerToggles, ...JSON.parse(localStorage.getItem(VIEWER_TOGGLES_KEY)) };
} catch {
  // localStorage no disponible - toggles quedan todos en on, no bloqueante
}

const viewerChips = document.querySelectorAll('.viewer-chip');

function renderViewerToggles() {
  viewerChips.forEach((chip) => {
    chip.setAttribute('aria-pressed', String(viewerToggles[chip.dataset.platform]));
  });
}
renderViewerToggles();

function saveViewerToggles() {
  try {
    localStorage.setItem(VIEWER_TOGGLES_KEY, JSON.stringify(viewerToggles));
  } catch {
    // no bloqueante
  }
}

// Un chip apagado ni siquiera se pide al backend - asi el toggle tambien
// sirve para dejar de pegarle a una plataforma con problemas (ej. token
// vencido) sin tocar las otras dos.
async function loadViewers() {
  const enabled = Object.keys(viewerToggles).filter((p) => viewerToggles[p]);
  const counts = {};
  if (enabled.length) {
    try {
      const res = await fetch(`/api/viewers?platforms=${enabled.join(',')}`);
      Object.assign(counts, await res.json());
    } catch {
      // el dock sigue funcionando sin el dato - no bloqueante
    }
  }
  let total = 0;
  let anyCount = false;
  viewerChips.forEach((chip) => {
    const platform = chip.dataset.platform;
    const countEl = chip.querySelector('.viewer-count');
    const value = counts[platform];
    if (viewerToggles[platform] && typeof value === 'number') {
      countEl.textContent = String(value);
      total += value;
      anyCount = true;
    } else {
      countEl.textContent = '–';
    }
  });
  const totalEl = document.getElementById('viewer-total');
  if (totalEl) {
    totalEl.hidden = !anyCount;
    if (anyCount) document.getElementById('viewer-total-count').textContent = String(total);
  }
}

viewerChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const platform = chip.dataset.platform;
    viewerToggles[platform] = !viewerToggles[platform];
    saveViewerToggles();
    renderViewerToggles();
    loadViewers();
  });
});

loadViewers();
setInterval(loadViewers, 20000);

connect();
