// Shared by the framework tests: a local stand-in for the API and the checks every example has to pass.
// Nothing here sends a paid request.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

// The fields POST /v1/chat/completions accepts: https://oathbreaker.ai/docs#requests
// The API rejects a request that carries any other field, so an example must not send one.
// A framework release that starts sending something else fails here.
const DOCUMENTED_FIELDS = [
  'model', 'messages', 'max_tokens', 'max_completion_tokens', 'temperature', 'top_p', 'stream', 'reasoning_effort',
  'response_format', 'tools', 'tool_choice', 'parallel_tool_calls', 'stream_options',
];

const ROOT = new URL('../..', import.meta.url);

// Runs `complete(key, baseUrl)` from <folder>/hello.py with the interpreter in $PYTHON (default: python3).
export function python(folder) {
  const code = 'import sys,json;sys.path.insert(0,sys.argv[1]);from hello import complete;print(json.dumps(complete(sys.argv[2],sys.argv[3])))';
  return (key, baseUrl) => new Promise((resolve, reject) => {
    const child = spawn(process.env.PYTHON ?? 'python3', ['-c', code, folder, key, baseUrl], {
      cwd: ROOT,
      env: { ...process.env, CREWAI_DISABLE_TELEMETRY: 'true' },
    });
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => stdout += chunk);
    child.stderr.on('data', chunk => stderr += chunk);
    child.on('error', reject);
    // The result is the last line: a framework may print notices of its own before it.
    child.on('close', code => code === 0 ? resolve(JSON.parse(stdout.trim().split('\n').at(-1))) : reject(new Error(stderr)));
  });
}

function assertDocumentedRequest(request) {
  assert.equal(request.method, 'POST');
  assert.equal(request.url, '/v1/chat/completions');
  assert.equal(request.authorization, 'Bearer fixture-only');
  const { payload } = request;
  assert.deepEqual(Object.keys(payload).filter(field => !DOCUMENTED_FIELDS.includes(field)), [], 'only documented fields are sent');
  assert.equal(payload.model, 'oathbreaker-glm-5.3');
  assert.deepEqual([payload.max_tokens, payload.max_completion_tokens].filter(budget => budget !== undefined), [2048], 'one output budget');
  assert.equal(payload.reasoning_effort, 'low');
  assert.notEqual(payload.stream, true);
  for (const message of payload.messages) {
    assert.deepEqual(Object.keys(message).sort(), ['content', 'role']);
    assert.ok(['system', 'user'].includes(message.role));
    assert.equal(typeof message.content, 'string');
  }
  assert.equal(payload.messages.at(-1).role, 'user');
}

// `run(key, baseUrl)` resolves to { text, usage }. `usage` lists the counts the framework reports for the
// fixture's answer. `detectsIncomplete: false` is for a framework that does not expose why the model stopped.
export function checkExample(name, run, { usage, detectsIncomplete = true }) {
  test(`${name} sends one documented request and does not repeat a failed one`, async () => {
    let mode = 'success';
    const requests = [];
    const server = createServer(async (req, res) => {
      let body = ''; for await (const chunk of req) body += chunk;
      requests.push({ method: req.method, url: req.url, authorization: req.headers.authorization, payload: JSON.parse(body || '{}') });
      res.setHeader('Content-Type', 'application/json');
      if (mode === 'error') { res.writeHead(500); res.end(JSON.stringify({ error: { message: 'Upstream failed.', type: 'server_error', code: 'upstream_error' } })); return; }
      res.end(JSON.stringify({
        id: 'chatcmpl-fixture', object: 'chat.completion', created: 1, model: 'oathbreaker-glm-5.3',
        choices: [{ index: 0, finish_reason: mode === 'incomplete' ? 'length' : 'stop', message: { role: 'assistant', content: 'Oathbreaker connected.' } }],
        usage: { prompt_tokens: 12, completion_tokens: 8, total_tokens: 20 },
      }));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      const base = `http://127.0.0.1:${server.address().port}/v1`;
      await assert.rejects(run('', base), /Set OATHBREAKER_API_KEY/);
      assert.equal(requests.length, 0);

      const result = await run('fixture-only', base);
      assert.equal(result.text, 'Oathbreaker connected.');
      assert.deepEqual(Object.fromEntries(Object.keys(usage).map(count => [count, result.usage[count]])), usage);
      assert.equal(requests.length, 1);
      assertDocumentedRequest(requests[0]);

      mode = 'error'; await assert.rejects(run('fixture-only', base), /HTTP 500/);
      assert.equal(requests.length, 2, 'a failed request is sent once, not repeated');

      if (detectsIncomplete) {
        mode = 'incomplete'; await assert.rejects(run('fixture-only', base), /No complete text answer/);
        assert.equal(requests.length, 3);
      }
    } finally { await new Promise(resolve => server.close(resolve)); }
  });
}
