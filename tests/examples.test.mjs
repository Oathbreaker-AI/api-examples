import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { complete } from '../javascript/hello.mjs';

function python(key, baseUrl) {
  return new Promise((resolve, reject) => {
    const child = spawn('python3', ['-c', 'import sys,json;sys.path.insert(0,"python");from hello import complete;print(json.dumps(complete(sys.argv[1],sys.argv[2])))', key, baseUrl], { cwd: new URL('..', import.meta.url) });
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => stdout += chunk);
    child.stderr.on('data', chunk => stderr += chunk);
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve(JSON.parse(stdout)) : reject(new Error(stderr)));
  });
}

for (const [language, run] of [['JavaScript', complete], ['Python', python]]) {
  test(`${language} completes one authenticated request and handles failures without retries`, async () => {
    let mode = 'success', calls = 0;
    const server = createServer(async (req, res) => {
      calls++;
      assert.equal(req.url, '/v1/chat/completions');
      assert.equal(req.method, 'POST');
      assert.equal(req.headers.authorization, 'Bearer fixture-only');
      let body = ''; for await (const chunk of req) body += chunk;
      const payload = JSON.parse(body);
      assert.equal(payload.model, 'oathbreaker-glm-5.3');
      assert.equal(payload.messages[0].role, 'user');
      assert.equal(payload.max_tokens, 2048);
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
      mode = 'redirect'; await assert.rejects(run('fixture-only', base));
      assert.equal(calls, 4, 'each attempted request is sent once; redirects are not followed');
    } finally { await new Promise(resolve => server.close(resolve)); }
  });
}
