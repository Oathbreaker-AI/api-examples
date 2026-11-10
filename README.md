# Oathbreaker AI API examples

Small, dependency-free examples for [Oathbreaker AI](https://oathbreaker.ai), a prepaid model API operated by **Formacha LLC**. The current public model is `oathbreaker-glm-5.3`, backed by Refuseless's `glm-5.3-abliterated` offering. Oathbreaker operates the API gateway and billing, not the underlying model development.

## Before you start

1. [Create an account](https://oathbreaker.ai/sign-up), add prepaid credit, and create an API key in your dashboard.
2. Set `OATHBREAKER_API_KEY` in your server or terminal environment. Do not commit the key, put it in a client-side application, or share it in an issue.
3. Review [current pricing](https://oathbreaker.ai/pricing), [API limits](https://oathbreaker.ai/docs#model), [privacy](https://oathbreaker.ai/privacy), and [terms](https://oathbreaker.ai/terms).

These examples make **one billable request** when run with your real key. They use low reasoning effort and a 2,048-token output budget; reasoning shares that budget. There are no automatic retries. A timeout or incomplete answer is a reason to inspect usage before trying again, not proof that nothing was processed.

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

## Hermes

Follow [the Hermes walkthrough](HERMES.md) and the maintained [agent setup page](https://oathbreaker.ai/agents). No Oathbreaker-specific app or GPU account is required.

## Streaming and tools

The examples above are non-streaming text requests. See the [API reference](https://oathbreaker.ai/docs) for streaming, function calling, preserving reasoning in tool conversations, and billing behavior. Tool calls must be validated and executed by your own application. Do not automatically replay an interrupted tool action.

## Validation

```sh
node --test tests/*.test.mjs
```

The tests run both languages against a local fixture server and require Python 3. They check request authentication and shape, returned usage, incomplete answers, redirects, and HTTP errors without sending paid inference requests. Passing these tests does not measure live model quality or latency.

## Support and contributions

For account, billing, or private security reports, use [support@oathbreaker.ai](mailto:support@oathbreaker.ai). Public issues are suitable for example-code bugs; remove keys, account data, and private prompts before sharing. This repository contains integration examples, not the private Oathbreaker application.

Code is MIT-licensed. Oathbreaker trademarks and the hosted service are not licensed by this repository.
