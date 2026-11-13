# Use Oathbreaker AI with the OpenAI SDK

[Oathbreaker AI](https://oathbreaker.ai) is a prepaid model API that uses the OpenAI Chat Completions format, so the official OpenAI SDKs for Python and JavaScript work with it. Create the client with the Oathbreaker base URL and an Oathbreaker API key, then call `chat.completions.create` with an Oathbreaker model. No Oathbreaker-specific package is needed.

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://oathbreaker.ai/v1",
    api_key=os.environ["OATHBREAKER_API_KEY"],
    timeout=650.0,
    max_retries=0,
)
response = client.chat.completions.create(
    model="oathbreaker-glm-5.3",
    messages=[{"role": "user", "content": "Reply with exactly: Oathbreaker connected."}],
    max_tokens=2048,
)
print(response.choices[0].message.content)
```

```js
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://oathbreaker.ai/v1',
  apiKey: process.env.OATHBREAKER_API_KEY,
  timeout: 650_000,
  maxRetries: 0,
});
const response = await client.chat.completions.create({
  model: 'oathbreaker-glm-5.3',
  messages: [{ role: 'user', content: 'Reply with exactly: Oathbreaker connected.' }],
  max_tokens: 2048,
});
console.log(response.choices[0].message.content);
```

## Settings

| Setting | Value |
|---|---|
| Base URL | `https://oathbreaker.ai/v1` (do not add a second `/v1`) |
| API key | Your Oathbreaker key, kept in `OATHBREAKER_API_KEY` |
| Model | `oathbreaker-glm-5.3`, or `oathbreaker-glm-5.3-flash` |
| Method to call | `client.chat.completions.create` |

## Run the examples

[`hello.py`](hello.py) and [`hello.mjs`](hello.mjs) are the snippets above with error handling. Each run makes **one billable request**. Set `OATHBREAKER_API_KEY` first, as described in the [main README](../README.md#before-you-start).

```sh
python3 -m venv .venv
.venv/bin/pip install -r openai-sdk/requirements.txt
.venv/bin/python openai-sdk/hello.py
```

```sh
npm ci --prefix openai-sdk
node openai-sdk/hello.mjs
```

## What the examples send

One `POST https://oathbreaker.ai/v1/chat/completions` with `model`, `messages`, `max_tokens`, `reasoning_effort` and `stream: false`, and your key in the `Authorization: Bearer` header. Every field is one the [API reference](https://oathbreaker.ai/docs#requests) lists. The API rejects a request that carries any other field: `400 invalid_request`, "The request contains an unsupported field."

## Things to know

- **Pass the key and base URL explicitly.** The SDK falls back to `OPENAI_API_KEY` and `OPENAI_BASE_URL` when you leave them out. Passing both keeps a key for one service from being sent to the other.
- **Turn off automatic retries.** By default the SDK repeats a failed request twice, so one failing call reaches the API three times. `max_retries=0` (`maxRetries: 0`) sends it once. A timeout does not prove that nothing was processed: [check usage before you repeat a request](https://oathbreaker.ai/docs#errors).
- **Allow long generations.** A generation can run for up to ten minutes. The examples wait 650 seconds, as the API reference's own example does.
- **The output budget includes reasoning.** `max_tokens` covers the model's reasoning and its answer together, so set it yourself instead of relying on a default. If reasoning uses it up, `finish_reason` is `length` and the answer can be empty; the examples treat that as a failure instead of printing a partial answer.
- **Chat Completions only.** `client.responses`, `client.embeddings` and the legacy `client.completions` are not offered, and neither is image or audio input. `client.models.list()` works and lists the available models.
- **Only the listed request fields.** OpenAI parameters outside the request reference, such as `stop`, `n`, `seed`, `user`, `logprobs` and the penalty settings, are not accepted, and neither are the `developer` role or a `name` on a message.
- **Tool calling: append the message you got back.** In a tool conversation the [API reference](https://oathbreaker.ai/docs#tools) asks you to send the assistant's `reasoning_content` back along with its `tool_calls`. Both SDKs do that when you append `response.choices[0].message` itself to `messages`. Building a new assistant message from selected fields drops it. Leave `strict` off your tool definitions: strict tool schemas are not supported.
- **Streaming.** Pass `stream=True`. The last chunk carries the usage for the request. See the [streaming reference](https://oathbreaker.ai/docs#streaming).
- **Server side only.** Keep the key on your server. Browser requests to the API are not supported.

## Checked with

`openai` 3.50.0 for Python 3.12 and `openai` 7.56.0 for Node.js 22. `node --test tests/frameworks/openai-sdk.test.mjs` runs both examples against a local stand-in server and checks the request they send. It does not call the API, so it says nothing about model quality or latency.
