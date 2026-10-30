const path = require('path');
const { readJson, writeJson } = require('./json-file');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TOKENS_FILE = path.join(DATA_DIR, 'tokens.json');

function readAll() {
  return readJson(TOKENS_FILE, {});
}

function writeAll(all) {
  writeJson(TOKENS_FILE, all);
}

function get(platform) {
  return readAll()[platform] || null;
}

function set(platform, tokenData) {
  const all = readAll();
  all[platform] = tokenData;
  writeAll(all);
}

function clear(platform) {
  const all = readAll();
  delete all[platform];
  writeAll(all);
}

const PLATFORM_NAMES = { twitch: 'Twitch', youtube: 'YouTube', kick: 'Kick' };

// Comparte la logica de "leer token, refrescar si esta por expirar" entre
// las 3 plataformas - cada una solo aporta su propia funcion refresh().
async function ensureFresh(platform, refreshFn) {
  let tokenData = get(platform);
  if (!tokenData) {
    const name = PLATFORM_NAMES[platform] || platform;
    throw new Error(`${name} no esta conectado. Usa /auth/${platform} primero.`);
  }
  if (Date.now() > tokenData.expires_at - 60000) {
    tokenData = await refreshFn(tokenData);
  }
  return tokenData;
}

module.exports = { get, set, clear, ensureFresh };
