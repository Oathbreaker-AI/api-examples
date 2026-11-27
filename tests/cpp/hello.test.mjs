// Builds cpp/hello.cpp and runs it against a local fixture server, the same
// checks as the JavaScript and Python examples. Needs a C++17 compiler, libcurl
// and nlohmann/json (Ubuntu: apt install g++ libcurl4-openssl-dev nlohmann-json3-dev).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../../cpp/hello.cpp', import.meta.url));
const dir = mkdtempSync(join(tmpdir(), 'oathbreaker-cpp-'));
const binary = join(dir, 'hello');
test.after(() => rmSync(dir, { recursive: true, force: true }));

function run(key, baseUrl) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    if (key) env.OATHBREAKER_API_KEY = key; else delete env.OATHBREAKER_API_KEY;
    const child = spawn(binary, [baseUrl], { env });
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => stdout += chunk);
    child.stderr.on('data', chunk => stderr += chunk);
    child.on('error', reject);
    child.on('close', code => {
      if (code !== 0) return reject(new Error(stderr));
      const [text, usage] = stdout.trimEnd().split('\n');
      resolve({ text, usage: JSON.parse(usage.replace(/^Usage: /, '')) });
    });
  });
}

test('the C++ example names the official base URL and builds', () => {
  const code = readFileSync(source, 'utf8');
  assert.match(code, /const std::string kBaseUrl = "https:\/\/oathbreaker\.ai\/v1";/);
  assert.doesNotMatch(code, /https?:\/\/(api\.|ai\.oathbreaker)/, 'no guessed hostnames');
  execFileSync(process.env.CXX || 'g++', ['-std=c++17', '-Wall', '-Wextra', '-Werror', '-O2', source, '-o', binary, '-lcurl'], { stdio: 'inherit' });
});

test('C++ completes one authenticated request and handles failures without retries', async () => {
  let mode = 'success', calls = 0;
  const server = createServer(async (req, res) => {
    calls++;
    assert.equal(req.url, '/v1/chat/completions');
    assert.equal(req.method, 'POST');
    assert.equal(req.headers.authorization, 'Bearer fixture-only');
    assert.equal(req.headers['content-type'], 'application/json');
    let body = ''; for await (const chunk of req) body += chunk;
    const payload = JSON.parse(body);
    assert.deepEqual(Object.keys(payload).sort(), ['max_tokens', 'messages', 'model', 'reasoning_effort', 'stream']);
    assert.equal(payload.model, 'oathbreaker-glm-5.3');
    assert.equal(payload.messages[0].role, 'user');
    assert.equal(payload.max_tokens, 2048);
    assert.equal(payload.reasoning_effort, 'low');
    assert.equal(payload.stream, false);
    if (mode === 'error') { res.writeHead(429); res.end('{}'); return; }
    if (mode === 'redirect') { res.writeHead(307, { Location: '/v1/chat/completions' }); res.end(); return; }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ choices: [{ finish_reason: mode === 'incomplete' ? 'length' : 'stop', message: { content: 'Oathbreaker connected.' } }], usage: { prompt_tokens: 12, completion_tokens: 8, total_tokens: 20 } }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}/v1`;
    await assert.rejects(run('', base), /Set OATHBREAKER_API_KEY/);
    assert.equal(calls, 0);
    assert.deepEqual(await run('fixture-only', base), { text: 'Oathbreaker connected.', usage: { prompt_tokens: 12, completion_tokens: 8, total_tokens: 20 } });
    mode = 'error'; await assert.rejects(run('fixture-only', base), /HTTP 429/);
    mode = 'incomplete'; await assert.rejects(run('fixture-only', base), /No complete text answer/);
    mode = 'redirect'; await assert.rejects(run('fixture-only', base), /HTTP 307/);
    assert.equal(calls, 4, 'each attempted request is sent once; redirects are not followed');
  } finally { await new Promise(resolve => server.close(resolve)); }
});
