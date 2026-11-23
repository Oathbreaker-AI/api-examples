# Hermes

Use the official Hermes app with Oathbreaker as a custom OpenAI-compatible endpoint. Hermes sends Chat Completions requests to `https://oathbreaker.ai/v1/chat/completions`. No GPU account or Oathbreaker-specific app is needed.

**Full guide:** [oathbreaker.ai/agents](https://oathbreaker.ai/agents#hermes)

Hermes is set up through its own wizard, which stores your key in its masked key prompt, so there is no file to copy. This folder gives the values to enter and the recommended settings as a script.

| File | Use it for |
|---|---|
| [`recommended-settings.sh`](recommended-settings.sh) | Three `hermes config set` commands to run after the wizard |

## Before you start

- An Oathbreaker API key: [create an account](https://oathbreaker.ai/sign-up), add at least $5 of credit, then create a key under **API keys** in [your console](https://oathbreaker.ai/dashboard). The key is shown once.
- Hermes installed from [Nous Research's installation guide](https://hermes-agent.nousresearch.com/docs/getting-started/installation).

## Set up

Exit any active Hermes conversation. In your terminal, run:

```sh
hermes model
```

Choose **Custom endpoint** (the wording may vary slightly by Hermes version) and enter:

| Wizard field | Value |
|---|---|
| API base URL | `https://oathbreaker.ai/v1` (include `/v1` at the end) |
| API key | Your Oathbreaker key, in Hermes' masked key prompt |
| API compatibility mode | Chat Completions (`chat_completions`) |
| Model | `oathbreaker-glm-5.3` (or one of the models below) |
| Context length | `131072` |
| Display name | `Oathbreaker` |

Choose one model:

| Model | Input / output, USD per million tokens |
|---|---|
| `oathbreaker-glm-5.3` | $3.00 / $4.00 |
| `oathbreaker-glm-5.3-flash` | $0.40 / $1.20 |
| `oathbreaker-deepseek-v4.1-flash` | $0.40 / $1.20 |
| `oathbreaker-deepseek-v4.1-flash-fast` | $0.50 / $1.50 |
| `oathbreaker-kimi-k3.1-pro` | $4.50 / $9.00 |

Current prices are on the [pricing page](https://oathbreaker.ai/pricing). You can switch models later in Hermes' provider settings with the same key and base URL; start a fresh conversation when you switch.

Save the setup, then apply the recommended settings in the same terminal, from the root of this repository:

```sh
sh configs/hermes/recommended-settings.sh
```

Oathbreaker allows up to 32,768 output tokens per request, including reasoning (24,576 on `oathbreaker-kimi-k3.1-pro`); a larger budget is lowered to that limit rather than refused.

## Check it works

Run `hermes`, or open a new conversation in Hermes Desktop. Check that the selected model is the one you chose, then send:

```text
Reply with exactly: Oathbreaker connected.
```

The reply is billed to your prepaid credit. Your console's **Usage** tab should then show the request.

## Limits

- Hermes runs your workspace and tools on your computer unless you configure remote tools.
- Oathbreaker accepts up to 128 tool definitions per request. If a long conversation or tool request fails, start a fresh conversation or ask Hermes to summarize the current one, and keep the recommended settings above.
- If Hermes still uses your previous provider, run `hermes model` again, select the saved Oathbreaker endpoint, and start a new conversation rather than resuming an old one.

More troubleshooting is in the [full guide](https://oathbreaker.ai/agents#hermes). A shorter walkthrough is in [HERMES.md](../../HERMES.md).
