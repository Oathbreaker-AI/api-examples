# Oathbreaker AI API examples

Small examples for [Oathbreaker AI](https://oathbreaker.ai), a prepaid model API operated by **Formacha LLC** that uses the OpenAI Chat Completions format. The examples use `oathbreaker-glm-5.3`, the hosted GLM-5.3 Abliterated model; [`oathbreaker-glm-5.3-flash`](https://oathbreaker.ai/models/glm-5-3-flash-abliterated) is available with the same account and key. Oathbreaker operates the API gateway and billing, not the underlying model development.

| | |
|---|---|
| API format | OpenAI Chat Completions: `POST https://oathbreaker.ai/v1/chat/completions` |
| Base URL | `https://oathbreaker.ai/v1` |
| Authentication | `Authorization: Bearer <key>`, with the key kept in `OATHBREAKER_API_KEY` |
| Models | `oathbreaker-glm-5.3`, `oathbreaker-glm-5.3-flash` |
| Not offered | Responses API, legacy Completions, embeddings, image and audio input |

The JavaScript and Python examples below need no packages. The SDK and framework guides each install the one package they are about.

## Before you start

1. [Create an account](https://oathbreaker.ai/sign-up), add prepaid credit, and create an API key in your dashboard.
2. Set `OATHBREAKER_API_KEY` in your server or terminal environment. Do not commit the key, put it in a client-side application, or share it in an issue.
3. Review [current pricing](https://oathbreaker.ai/pricing), [API limits](https://oathbreaker.ai/docs#model), [privacy](https://oathbreaker.ai/privacy), and [terms](https://oathbreaker.ai/terms).

Each example makes **one billable request** when run with your real key. All of them use low reasoning effort and a 2,048-token output budget; reasoning shares that budget. There are no automatic retries, with one exception that the [CrewAI guide](crewai/) describes. A timeout or incomplete answer is a reason to inspect usage before trying again, not proof that nothing was processed.

## JavaScript

Requires Node.js 22 or newer; no package installation.

```sh
node javascript/hello.mjs
```

## Python

Requires Python 3.10 or newer; uses only the standard library.

```sh
python3 python/hello.py
```

Both examples print the final answer and returned token usage. They reject redirects and incomplete answers. They deliberately use the official HTTPS base URL and never log the API key. Keep any custom base URL trusted: the function sends its authorization header there.

## SDKs and frameworks

Oathbreaker needs no SDK of its own. Anything that can call an OpenAI-style Chat Completions endpoint can be pointed at it with three values: the base URL, your key and a model name.

| You use | Point it at Oathbreaker with | Guide and example |
|---|---|---|
| OpenAI SDK for Python or JavaScript | `OpenAI(base_url="https://oathbreaker.ai/v1", api_key=...)` | [openai-sdk/](openai-sdk/) |
| LangChain | `ChatOpenAI(base_url="https://oathbreaker.ai/v1", api_key=..., model=...)` | [langchain/](langchain/) |
| LlamaIndex | `OpenAILike(api_base="https://oathbreaker.ai/v1", api_key=..., model=..., is_chat_model=True)` | [llamaindex/](llamaindex/) |
| CrewAI | `LLM(model="openai/oathbreaker-glm-5.3", base_url="https://oathbreaker.ai/v1", api_key=...)` | [crewai/](crewai/) |

Each guide gives the settings, a runnable example, the request that example sends, and what to watch for with that framework. The examples send only the request fields the [API reference](https://oathbreaker.ai/docs#requests) lists, because the API rejects any other field, and they switch off the automatic retries these libraries apply by default.

## Hermes and other agents

Follow [the Hermes walkthrough](HERMES.md) and the maintained [agent setup page](https://oathbreaker.ai/agents), which also covers OpenCode, OpenWork and Pi. No Oathbreaker-specific app or GPU account is required.

## Streaming and tools

The examples above are non-streaming text requests. See the [API reference](https://oathbreaker.ai/docs) for streaming, function calling, preserving reasoning in tool conversations, and billing behavior. Tool calls must be validated and executed by your own application. Do not automatically replay an interrupted tool action.

## Validation

```sh
node --test tests/*.test.mjs
```

The tests run both languages against a local fixture server and require Python 3. They check request authentication and shape, returned usage, incomplete answers, redirects, and HTTP errors without sending paid inference requests. Passing these tests does not measure live model quality or latency.

Each SDK and framework example has a test of its own, which needs that example's package installed:

```sh
python3 -m venv .venv
.venv/bin/pip install -r langchain/requirements.txt
PYTHON=.venv/bin/python node --test tests/frameworks/langchain.test.mjs
```

It runs the example against the same kind of local server. It fails if the request carries a field the API reference does not document, or if a failed request is sent more than once. The OpenAI SDK test also needs `npm ci --prefix openai-sdk`.

## Support and contributions

For account, billing, or private security reports, use [support@oathbreaker.ai](mailto:support@oathbreaker.ai). Public issues are suitable for example-code bugs; remove keys, account data, and private prompts before sharing. This repository contains integration examples, not the private Oathbreaker application.

Code is MIT-licensed. Oathbreaker trademarks and the hosted service are not licensed by this repository.
