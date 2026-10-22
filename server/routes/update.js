const express = require('express');
const pkg = require('../package.json');

const router = express.Router();

const REPO = 'NoxTaipan/confluence-suite';
const CACHE_MS = 6 * 60 * 60 * 1000;
let cache = { at: 0, data: null };

function newer(a, b) {
  const pa = String(a).replace(/^v/, '').split('.').map(Number);
  const pb = String(b).replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0);
  }
  return false;
}

// Consulta la ultima release publica de GitHub (sin token, cacheada 6 h).
// Si no hay red o no hay releases, responde sin aviso: nunca debe romper el dock.
async function check() {
  if (cache.data && Date.now() - cache.at < CACHE_MS) return cache.data;
  let data = { current: pkg.version, latest: pkg.version, hasUpdate: false, url: null };
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { 'User-Agent': 'confluence-update-check', Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const rel = await res.json();
      const latest = String(rel.tag_name || '').replace(/^v/, '');
      if (latest) {
        data = { current: pkg.version, latest, hasUpdate: newer(latest, pkg.version), url: rel.html_url, notes: rel.name || null };
      }
    }
  } catch {
    // sin red: se reintenta en la proxima consulta
  }
  cache = { at: Date.now(), data };
  return data;
}

router.get('/', async (req, res) => {
  res.json(await check());
});

module.exports = router;
