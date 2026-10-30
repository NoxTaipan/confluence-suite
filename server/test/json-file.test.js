const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { readJson, writeJson } = require('../lib/json-file');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'confluence-json-'));
const file = path.join(dir, 'sub', 'tokens.json');

test('no existe: devuelve el valor por defecto', () => {
  assert.deepStrictEqual(readJson(file, { vacio: true }), { vacio: true });
});
test('escribe y lee, y crea la carpeta', () => {
  writeJson(file, { a: 1 });
  assert.deepStrictEqual(readJson(file, {}), { a: 1 });
  assert.ok(!fs.existsSync(`${file}.tmp`));
});
test('la segunda escritura deja copia del bueno anterior', () => {
  writeJson(file, { a: 2 });
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(`${file}.bak`, 'utf8')), { a: 1 });
});
test('si el principal se corrompe (corte a mitad de guardar) se usa la copia', () => {
  fs.writeFileSync(file, '{"a": 3, "tru');
  assert.deepStrictEqual(readJson(file, {}), { a: 1 });
});
test('una escritura nueva no respalda un archivo corrupto', () => {
  writeJson(file, { a: 4 });
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(`${file}.bak`, 'utf8')), { a: 1 });
  assert.deepStrictEqual(readJson(file, {}), { a: 4 });
});
