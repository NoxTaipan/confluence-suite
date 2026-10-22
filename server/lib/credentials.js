const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'credentials.json');
const PLATFORMS = ['twitch', 'youtube', 'kick'];
const PORT = process.env.PORT || 7773;

function read() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; }
}

// Vuelca lo guardado en la pantalla de configuracion a process.env (el .env sigue mandando si ya trae valores).
function load() {
  const saved = read();
  for (const p of PLATFORMS) {
    const P = p.toUpperCase();
    const c = saved[p] || {};
    if (!process.env[`${P}_CLIENT_ID`] && c.clientId) process.env[`${P}_CLIENT_ID`] = c.clientId;
    if (!process.env[`${P}_CLIENT_SECRET`] && c.clientSecret) process.env[`${P}_CLIENT_SECRET`] = c.clientSecret;
    if (!process.env[`${P}_REDIRECT_URI`]) process.env[`${P}_REDIRECT_URI`] = `http://localhost:${PORT}/auth/${p}/callback`;
  }
}

function isConfigured(platform) {
  const P = platform.toUpperCase();
  return !!(process.env[`${P}_CLIENT_ID`] && process.env[`${P}_CLIENT_SECRET`]);
}

function save(platform, clientId, clientSecret) {
  const all = read();
  all[platform] = { clientId: String(clientId).trim(), clientSecret: String(clientSecret).trim() };
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(all, null, 2));
}

module.exports = { PLATFORMS, load, isConfigured, save };
