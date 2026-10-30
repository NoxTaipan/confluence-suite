const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const credentials = require('../lib/credentials');

const router = express.Router();

// El filtro de Host/Origin (lib/guard.js) ya protege todo el servidor, incluido este endpoint.

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
