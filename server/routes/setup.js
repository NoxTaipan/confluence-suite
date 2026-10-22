const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const credentials = require('../lib/credentials');

const router = express.Router();

// Solo desde esta misma pagina en localhost: evita que otra web (CSRF / DNS rebinding) cambie las credenciales.
const PORT = process.env.PORT || 7773;
const ALLOWED_HOSTS = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`]);
router.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!ALLOWED_HOSTS.has(req.headers.host) || (origin && !ALLOWED_HOSTS.has(origin.replace(/^https?:\/\//, '')))) {
    return res.status(403).json({ error: 'Origen no permitido' });
  }
  next();
});

router.get('/status', (req, res) => {
  const out = {};
  for (const p of credentials.PLATFORMS) out[p] = credentials.isConfigured(p);
  res.json(out);
});

router.post('/:platform', (req, res) => {
  const platform = req.params.platform;
  if (!credentials.PLATFORMS.includes(platform)) return res.status(404).json({ error: 'Plataforma desconocida' });
  const { clientId, clientSecret } = req.body || {};
  if (!clientId || !clientSecret) return res.status(400).json({ error: 'Faltan Client ID y/o Client Secret' });
  credentials.save(platform, clientId, clientSecret);
  res.json({ ok: true });
  // Las credenciales se leen al arrancar: relanzar el servidor oculto tras responder.
  setTimeout(() => {
    const root = path.join(__dirname, '..');
    const vbs = path.join(root, 'scripts', 'start-hidden.vbs');
    const relaunch = `setTimeout(() => require('child_process').spawn('wscript', [${JSON.stringify(vbs)}], { detached: true, stdio: 'ignore', windowsHide: true }).unref(), 2000)`;
    spawn(process.execPath, ['-e', relaunch], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
    process.exit(0);
  }, 300);
});

module.exports = router;
