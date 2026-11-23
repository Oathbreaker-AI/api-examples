# OpenCode

Add Oathbreaker to OpenCode as an OpenAI-compatible provider. OpenCode sends requests to `https://oathbreaker.ai/v1/chat/completions`, with streaming and tool calls. Usage is charged to your prepaid Oathbreaker credit.

**Full guide:** [oathbreaker.ai/agents/opencode](https://oathbreaker.ai/agents/opencode)

| File | Use it for |
|---|---|
| [`opencode.json`](opencode.json) | OpenCode 1.x |
| [`2.x/opencode.json`](2.x/opencode.json) | OpenCode 2.x, which renamed the provider fields |

Run `opencode --version` to see which one you need. Both list all five Oathbreaker models with the context and output limits OpenCode should plan for, and both read your key from `OATHBREAKER_API_KEY`.

## Before you start

- An Oathbreaker API key: [create an account](https://oathbreaker.ai/sign-up), add at least $5 of credit, then create a key under **API keys** in [your console](https://oathbreaker.ai/dashboard). The key starts with `ob_sk_` and is shown once.
- OpenCode installed from [the official install guide](https://opencode.ai/docs/). Check it with `opencode --version`.
- `OATHBREAKER_API_KEY` set in your terminal. Paste the key at the hidden prompt; it stays in this session and is not written to your shell history.

```sh
printf 'Oathbreaker API key: '; read -rs OATHBREAKER_API_KEY; export OATHBREAKER_API_KEY; printf '\n'
```

PowerShell 7.2 or later:

```powershell
$env:OATHBREAKER_API_KEY = Read-Host -MaskInput "Oathbreaker API key"
```

## Set up

Copy the file that matches your version into your project folder as `opencode.json`. OpenCode also reads `opencode.jsonc`; if you already have either file, merge the `oathbreaker` entry into it instead.

To use Oathbreaker in every project, put the same config in OpenCode's global config file, `~/.config/opencode/opencode.json`. Keep the key in `OATHBREAKER_API_KEY` rather than in the file.

From that folder, start OpenCode with an Oathbreaker model:

```sh
opencode --model oathbreaker/oathbreaker-glm-5.3
```

The provider name comes first, then the model identifier. You can also choose any of the five models from `/models` inside OpenCode.

## Check it works

From your project folder, send one short request. It costs a little credit, because the agent sends its instructions and tool definitions with every request.

```sh
opencode run --model oathbreaker/oathbreaker-glm-5.3 "Reply with OK"
```

Expected reply: `OK`. Your console's **Usage** tab then shows the request.

## Limits

- OpenCode runs its tools, such as file edits and shell commands, on your computer as usual.
- No image input: the API reads text only and rejects image attachments with HTTP 400, so leave screenshots out of the conversation.
- No built-in web search: the models cannot search the web themselves; any search has to come from a tool OpenCode runs.
- `oathbreaker-glm-5.3` has a 131,072-token context. The DeepSeek and Kimi models accept up to 262,144 bytes per request, so long sessions on them need compacting sooner. If a request is too long, run `/compact` or start a new session.
- No Oathbreaker models in `/models` means OpenCode did not load the config: start it from the folder that holds `opencode.json`, check that the file is valid JSON, and use the config that matches `opencode --version`.

Error messages and fixes are in the [full guide](https://oathbreaker.ai/agents/opencode#limits).

## OpenWork

OpenWork reads `opencode.jsonc` in its workspace, so the same provider entry works there. Follow the [OpenWork steps](https://oathbreaker.ai/agents#openwork) to add the key in its settings.
