// Lectura/escritura de los JSON con las claves (credentials.json, tokens.json) sin perderlas si el equipo se apaga a mitad de guardar:
// se escribe a un archivo temporal, se guarda copia del bueno anterior (.bak) y se renombra encima. Al leer, si el principal esta
// danado se usa la copia. (El 2026-10-21 se perdieron las claves originales; esto evita repetirlo por un corte de luz.)
const fs = require('fs');
const path = require('path');

function readJson(file, fallback) {
  for (const candidate of [file, `${file}.bak`]) {
    try {
      return JSON.parse(fs.readFileSync(candidate, 'utf8'));
    } catch {
      // probar con la copia
    }
  }
  return fallback;
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  try {
    JSON.parse(fs.readFileSync(file, 'utf8'));
    fs.copyFileSync(file, `${file}.bak`);
  } catch {
    // no habia archivo bueno que respaldar
  }
  fs.renameSync(tmp, file);
}

module.exports = { readJson, writeJson };
