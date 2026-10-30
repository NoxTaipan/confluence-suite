// Defensa del servidor local: solo atiende a las propias paginas de Confluence en localhost.
//  · Host: bloquea «DNS rebinding» (una web ajena que apunta su dominio a 127.0.0.1 y le habla al servidor como si fuera suyo).
//  · Origin / Sec-Fetch-Site en peticiones que cambian algo (POST, etc.): bloquea que otra pestana del navegador pulse, sin que lo notes,
//    «desconectar», «crear clip» o «enviar al chat» (un POST sin cuerpo no necesita permiso CORS).
// Los docks de OBS, el overlay y el plugin de Stream Deck hablan desde localhost o sin Origin, asi que no se ven afectados.
const PORT = process.env.PORT || 7773;
const HOSTS = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`]);
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function hostOf(origin) {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}

function isAllowed(req) {
  if (!HOSTS.has(req.headers.host)) return false;
  if (SAFE_METHODS.has(req.method)) return true;
  const origin = req.headers.origin;
  if (origin !== undefined && !HOSTS.has(hostOf(origin))) return false;
  const site = req.headers['sec-fetch-site'];
  if (site !== undefined && site !== 'same-origin' && site !== 'none') return false;
  return true;
}

function localGuard(req, res, next) {
  if (!isAllowed(req)) return res.status(403).json({ ok: false, error: 'Origen no permitido' });
  next();
}

// Cabeceras baratas que no rompen el dock de OBS (sin CSP: el dock carga fuentes y el iframe de Starvios).
function securityHeaders(req, res, next) {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
  next();
}

module.exports = { localGuard, securityHeaders, isAllowed, HOSTS };
