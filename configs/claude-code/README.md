# Claude Code

Run Claude Code on Oathbreaker's abliterated models through the Anthropic Messages endpoint, `https://oathbreaker.ai/v1/messages`. You do not need an Anthropic account or key for these requests; usage is charged to your prepaid Oathbreaker credit.

**Full guide:** [oathbreaker.ai/agents/claude-code](https://oathbreaker.ai/agents/claude-code)

| File | Use it for |
|---|---|
| [`oathbreaker.sh`](oathbreaker.sh) | Bash or Zsh: `source` it in the terminal you start Claude Code from |
| [`oathbreaker.ps1`](oathbreaker.ps1) | PowerShell: dot-source it in the session you start Claude Code from |

## Before you start

- An Oathbreaker API key: [create an account](https://oathbreaker.ai/sign-up), add at least $5 of credit, then create a key under **API keys** in [your console](https://oathbreaker.ai/dashboard). The key starts with `ob_sk_` and is shown once.
- Claude Code installed from [the official install guide](https://code.claude.com/docs). Check it with `claude --version`.
- `OATHBREAKER_API_KEY` set in your terminal. Paste the key at the hidden prompt; it stays in this session and is not written to your shell history.

```sh
printf 'Oathbreaker API key: '; read -rs OATHBREAKER_API_KEY; export OATHBREAKER_API_KEY; printf '\n'
```

PowerShell 7.2 or later:

```powershell
$env:OATHBREAKER_API_KEY = Read-Host -MaskInput "Oathbreaker API key"
```

## Set up

From the root of this repository, in the same terminal:

```sh
source configs/claude-code/oathbreaker.sh
```

PowerShell:

```powershell
. .\configs\claude-code\oathbreaker.ps1
```

The file sends every Claude Code request to Oathbreaker: the main model, the `opus` and `sonnet` aliases, and background tasks, which use the `haiku` alias (`oathbreaker-glm-5.3-flash` here). `CLAUDE_CODE_AUTO_COMPACT_WINDOW=100000` makes Claude Code compact a long conversation before it reaches the context limit. The base URL has no `/v1` because Claude Code adds `/v1/messages` itself.

Then run `claude` from your project folder. Inside Claude Code, `/status` should show the Oathbreaker base URL.

To try another model for one session, start Claude Code with `--model`:

```sh
claude --model oathbreaker-kimi-k3.1-pro
```

## Check it works

From your project folder, send one short request. It costs a little credit, because the agent sends its instructions and tool definitions with every request.

```sh
claude -p "Reply with OK"
```

Expected reply: `OK`. Your console's **Usage** tab then shows the request.

## Limits

- Claude Code's tools, such as file edits and shell commands, run on your computer as usual.
- No web search: Claude Code's web search is a hosted tool, so it is left out of requests.
- No image input: attached images and documents are replaced with a short note, because the models read text only.
- `oathbreaker-glm-5.3` has a 131,072-token context. The DeepSeek and Kimi models accept up to 262,144 bytes per request, so long sessions on them need compacting sooner. If a request is too long, run `/compact` or start fresh with `/clear`.

Error messages and fixes are in the [full guide](https://oathbreaker.ai/agents/claude-code#limits).

## Switch back

Open a new terminal, or remove the variables from the current one:

```sh
unset ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN ANTHROPIC_MODEL ANTHROPIC_DEFAULT_OPUS_MODEL ANTHROPIC_DEFAULT_SONNET_MODEL ANTHROPIC_DEFAULT_HAIKU_MODEL CLAUDE_CODE_AUTO_COMPACT_WINDOW
```
