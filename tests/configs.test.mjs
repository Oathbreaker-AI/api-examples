import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../configs/', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const MODELS = ['oathbreaker-glm-5.3', 'oathbreaker-glm-5.3-flash', 'oathbreaker-deepseek-v4.1-flash', 'oathbreaker-deepseek-v4.1-flash-fast', 'oathbreaker-kimi-k3.1-pro'];

test('OpenCode configs list every model with the setup guide limits and read the key from the environment', () => {
  for (const [file, providersKey, optionsKey] of [['opencode/opencode.json', 'provider', 'options'], ['opencode/2.x/opencode.json', 'providers', 'settings']]) {
    const provider = JSON.parse(read(file))[providersKey].oathbreaker;
    assert.equal(provider[optionsKey].baseURL, 'https://oathbreaker.ai/v1', file);
    assert.equal(provider[optionsKey].apiKey, '{env:OATHBREAKER_API_KEY}', file);
    assert.deepEqual(Object.keys(provider.models), MODELS, file);
    for (const [id, model] of Object.entries(provider.models)) {
      assert.deepEqual(model.limit, { context: id.includes('glm') ? 131072 : 65536, output: id.includes('kimi') ? 24576 : 32768 }, `${file} ${id}`);
    }
  }
});

test('Codex config uses the Responses API, top-level keys first, and the environment key', () => {
  const toml = read('codex/config.toml');
  const lines = toml.split('\n');
  for (const line of ['model = "oathbreaker-glm-5.3"', 'model_provider = "oathbreaker"', 'model_context_window = 131072', 'model_auto_compact_token_limit = 91750', '[model_providers.oathbreaker]', 'base_url = "https://oathbreaker.ai/v1"', 'env_key = "OATHBREAKER_API_KEY"', 'wire_api = "responses"']) {
    assert.ok(lines.includes(line), line);
  }
  assert.ok(lines.indexOf('model_auto_compact_token_limit = 91750') < lines.indexOf('[model_providers.oathbreaker]'));
});

test('Claude Code scripts use the Messages base URL without /v1 and copy the key from the environment', () => {
  for (const file of ['claude-code/oathbreaker.sh', 'claude-code/oathbreaker.ps1']) {
    const text = read(file);
    assert.match(text, /ANTHROPIC_BASE_URL\s*=\s*"?https:\/\/oathbreaker\.ai"?\s*$/m, file);
    assert.match(text, /ANTHROPIC_AUTH_TOKEN\s*=\s*"?\$(env:)?OATHBREAKER_API_KEY"?\s*$/m, file);
    assert.match(text, /ANTHROPIC_DEFAULT_HAIKU_MODEL\s*=\s*"?oathbreaker-glm-5\.3-flash"?\s*$/m, file);
  }
});

test('No file in configs/ contains an API key', () => {
  for (const file of readdirSync(root, { recursive: true })) {
    if (!/\.(md|json|toml|sh|ps1)$/.test(file)) continue;
    assert.doesNotMatch(read(file), /ob_sk_[A-Za-z0-9]{8,}/, file);
  }
});
