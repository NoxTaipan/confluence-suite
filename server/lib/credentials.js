const path = require('path');
const { readJson, writeJson } = require('./json-file');

const FILE = path.join(__dirname, '..', 'data', 'credentials.json');
const PLATFORMS = ['twitch', 'youtube', 'kick'];
const PORT = process.env.PORT || 7773;

function read() {
  return readJson(FILE, {});
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
  writeJson(FILE, all);
}

module.exports = { PLATFORMS, load, isConfigured, save };
