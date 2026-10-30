const test = require('node:test');
const assert = require('node:assert');
process.env.PORT = '7794';
const { isAllowed } = require('../lib/guard');

const req = (method, headers) => ({ method, headers });
const HOST = 'localhost:7794';

test('GET desde localhost y 127.0.0.1', () => {
  assert.ok(isAllowed(req('GET', { host: HOST })));
  assert.ok(isAllowed(req('GET', { host: '127.0.0.1:7794' })));
});
test('Host ajeno (DNS rebinding) se bloquea, tambien en GET', () => {
  assert.ok(!isAllowed(req('GET', { host: 'evil.example:7794' })));
  assert.ok(!isAllowed(req('GET', { host: 'localhost:9999' })));
  assert.ok(!isAllowed(req('GET', {})));
});
test('POST desde la propia pagina', () => {
  assert.ok(isAllowed(req('POST', { host: HOST, origin: 'http://localhost:7794', 'sec-fetch-site': 'same-origin' })));
});
test('POST sin Origin (Stream Deck, plugin de OBS, curl) pasa', () => {
  assert.ok(isAllowed(req('POST', { host: HOST })));
});
test('POST desde otra web se bloquea', () => {
  assert.ok(!isAllowed(req('POST', { host: HOST, origin: 'https://evil.example' })));
  assert.ok(!isAllowed(req('POST', { host: HOST, origin: 'null' })));
  assert.ok(!isAllowed(req('POST', { host: HOST, 'sec-fetch-site': 'cross-site' })));
  assert.ok(!isAllowed(req('POST', { host: HOST, 'sec-fetch-site': 'same-site' })));
});
test('Origin de otro puerto de localhost se bloquea', () => {
  assert.ok(!isAllowed(req('DELETE', { host: HOST, origin: 'http://localhost:3000' })));
});
