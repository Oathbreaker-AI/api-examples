# Codex

Add Oathbreaker to Codex as a model provider over the Responses API, `https://oathbreaker.ai/v1/responses`. Usage is charged to your prepaid Oathbreaker credit.

**Full guide:** [oathbreaker.ai/agents/codex](https://oathbreaker.ai/agents/codex)

| File | Use it for |
|---|---|
| [`config.toml`](config.toml) | Copy to `~/.codex/config.toml`, or merge into the one you have |

## Before you start

- An Oathbreaker API key: [create an account](https://oathbreaker.ai/sign-up), add at least $5 of credit, then create a key under **API keys** in [your console](https://oathbreaker.ai/dashboard). The key starts with `ob_sk_` and is shown once.
- Codex installed from [the official install guide](https://developers.openai.com/codex). Check it with `codex --version`.
- `OATHBREAKER_API_KEY` set in your terminal. Paste the key at the hidden prompt; it stays in this session and is not written to your shell history.

```sh
printf 'Oathbreaker API key: '; read -rs OATHBREAKER_API_KEY; export OATHBREAKER_API_KEY; printf '\n'
```

PowerShell 7.2 or later:

```powershell
$env:OATHBREAKER_API_KEY = Read-Host -MaskInput "Oathbreaker API key"
```

## Set up

If you have no `~/.codex/config.toml` yet, copy the file from the root of this repository (`-n` leaves an existing file untouched):

```sh
mkdir -p ~/.codex && cp -n configs/codex/config.toml ~/.codex/config.toml
```

If the file already has settings, merge these in instead. The four lines before `[model_providers.oathbreaker]` are top-level keys: put them above the first `[section]` in the file, and replace any existing `model` or `model_provider` line.

The config adds Oathbreaker as a model provider, makes it the default, and tells Codex the context window to plan for, so it compacts long conversations before they reach the limit. Codex appends `/responses` to the base URL.

Then run `codex` from your project folder. To pick a model for one run, use `--model` (or `-m`):

```sh
codex --model oathbreaker-kimi-k3.1-pro
```

When `oathbreaker-kimi-k3.1-pro` is your default model, also set `model_context_window = 65536` and `model_auto_compact_token_limit = 45875`, because it takes smaller requests than `oathbreaker-glm-5.3`.

## Check it works

Inside a Git repository (outside one, Codex asks you to add `--skip-git-repo-check`), send one short request. It costs a little credit, because the agent sends its instructions and tool definitions with every request.

```sh
codex exec "Reply with OK"
```

Expected reply: `OK`. Your console's **Usage** tab then shows the request.

## Limits

- Codex runs its tools, such as shell commands and file patches, on your computer as usual.
- No web search: Codex's web search is a hosted tool, so it is left out of requests.
- No image input: attached images are replaced with a short note, because the models read text only.
- The Responses endpoint keeps no conversation state between requests: Codex sends the full conversation each turn, and `previous_response_id` is not accepted.
- `oathbreaker-glm-5.3` has a 131,072-token context. The DeepSeek and Kimi models accept up to 262,144 bytes per request, so long sessions on them need compacting sooner. If a request is too long, run `/compact` or start a new session with `/new`.

Error messages and fixes are in the [full guide](https://oathbreaker.ai/agents/codex#limits).

## Switch back

Remove or comment out the `model`, `model_provider`, `model_context_window` and `model_auto_compact_token_limit` lines. The `[model_providers.oathbreaker]` section can stay, ready for `codex -c model_provider=oathbreaker`.
