# Ready-made agent configs

Copy-ready settings for running coding agents on Oathbreaker's abliterated models. Each folder holds the file to copy, a one-line check, the limits to know, and a link to the maintained setup guide on oathbreaker.ai.

| Agent | What you copy | Oathbreaker endpoint | Full guide |
|---|---|---|---|
| [Claude Code](claude-code/) | [`oathbreaker.sh`](claude-code/oathbreaker.sh) or [`oathbreaker.ps1`](claude-code/oathbreaker.ps1) | `/v1/messages` (Anthropic Messages) | [oathbreaker.ai/agents/claude-code](https://oathbreaker.ai/agents/claude-code) |
| [Codex](codex/) | [`config.toml`](codex/config.toml) into `~/.codex/` | `/v1/responses` | [oathbreaker.ai/agents/codex](https://oathbreaker.ai/agents/codex) |
| [OpenCode](opencode/) | [`opencode.json`](opencode/opencode.json) (1.x) or [`2.x/opencode.json`](opencode/2.x/opencode.json) | `/v1/chat/completions` | [oathbreaker.ai/agents/opencode](https://oathbreaker.ai/agents/opencode) |
| [Hermes](hermes/) | Wizard values and [`recommended-settings.sh`](hermes/recommended-settings.sh) | `/v1/chat/completions` | [oathbreaker.ai/agents](https://oathbreaker.ai/agents#hermes) |

OpenWork uses the OpenCode provider entry; OpenWork and Pi are covered on the [agent setup page](https://oathbreaker.ai/agents#other-agents).

## Your key stays out of these files

None of the files contains a key. Claude Code, Codex and OpenCode read it from `OATHBREAKER_API_KEY` in the terminal you start them from; Hermes keeps it through its own masked key prompt. To set the variable without writing the key to your shell history:

```sh
printf 'Oathbreaker API key: '; read -rs OATHBREAKER_API_KEY; export OATHBREAKER_API_KEY; printf '\n'
```

PowerShell 7.2 or later:

```powershell
$env:OATHBREAKER_API_KEY = Read-Host -MaskInput "Oathbreaker API key"
```

Create the key under **API keys** in [your console](https://oathbreaker.ai/dashboard) after adding at least $5 of prepaid credit. Do not commit it or paste it into an issue.

## What the configs set

- `oathbreaker-glm-5.3` is the default model, for everyday coding and agent tasks. GLM-5.3 Flash and DeepSeek Fast suit background and cheap tasks; Kimi K3.1 Pro is for the hardest problems and costs the most per token. All five models share the same key and credit balance.
- Context values follow the live setup guides: 131,072 tokens for the GLM models, and 65,536 for the DeepSeek and Kimi models where a guide sets one (OpenCode, and Codex when Kimi is the default). The [models table](../README.md#models) gives a more conservative 32,768 for those models as a planning value for frameworks.
- The models read text only, and the agents' hosted web search is not available. Tools such as file edits and shell commands run on your computer as usual.

Every check command sends one short, billable request; the agent includes its instructions and tool definitions with it. Your console's **Usage** tab shows each request.

Abliterated models are modified to reduce trained refusals. That does not make their output correct, so give agents work you can check, such as a code change with tests, and keep human approval for consequential tool actions. Use them only for lawful work you are authorized to do, as the [terms](https://oathbreaker.ai/terms) require: for example, coding tasks, research, and security testing limited to systems you own or have permission to test.

If a guide on oathbreaker.ai and a file here ever disagree, the guide is current.
