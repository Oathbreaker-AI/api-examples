# Use Oathbreaker AI with LlamaIndex

[Oathbreaker AI](https://oathbreaker.ai) is a prepaid model API that uses the OpenAI Chat Completions format. LlamaIndex connects to it through `OpenAILike` from the `llama-index-llms-openai-like` package: set `api_base` to the Oathbreaker endpoint, pass an Oathbreaker API key, name an Oathbreaker model, and set `is_chat_model=True`. No Oathbreaker-specific package is needed.

```python
import os
from llama_index.core.llms import ChatMessage
from llama_index.llms.openai_like import OpenAILike

llm = OpenAILike(
    model="oathbreaker-glm-5.3",
    api_base="https://oathbreaker.ai/v1",
    api_key=os.environ["OATHBREAKER_API_KEY"],
    is_chat_model=True,
    context_window=131072,
    max_tokens=2048,
    timeout=650,
    max_retries=0,
)
response = llm.chat([ChatMessage(role="user", content="Reply with exactly: Oathbreaker connected.")])
print(response.message.content)
```

To make it the default model for indexes, query engines and agents, set `Settings.llm = llm` (from `llama_index.core`).

## Settings

| Setting | Value |
|---|---|
| Class | `OpenAILike` from `llama-index-llms-openai-like` |
| `api_base` | `https://oathbreaker.ai/v1` |
| `api_key` | Your Oathbreaker key, kept in `OATHBREAKER_API_KEY` |
| `model` | `oathbreaker-glm-5.3`, or `oathbreaker-glm-5.3-flash` |
| `is_chat_model` | `True` |
| `context_window` | `131072` |

## Run the example

[`hello.py`](hello.py) is the snippet above with error handling. Each run makes **one billable request**. Set `OATHBREAKER_API_KEY` first, as described in the [main README](../README.md#before-you-start).

```sh
python3 -m venv .venv
.venv/bin/pip install -r llamaindex/requirements.txt
.venv/bin/python llamaindex/hello.py
```

## What the example sends

One `POST https://oathbreaker.ai/v1/chat/completions` with `model`, `messages`, `max_tokens`, `reasoning_effort`, `stream: false` and `temperature: 0.1`, which is LlamaIndex's own default. Every field is one the [API reference](https://oathbreaker.ai/docs#requests) lists. The API rejects a request that carries any other field: `400 invalid_request`, "The request contains an unsupported field."

## Things to know

- **`is_chat_model=True` is required.** Without it `OpenAILike` calls the legacy Completions endpoint, which Oathbreaker does not offer, and the request fails with `unsupported_endpoint`.
- **`api_base` is required.** Without it `OpenAILike` sends the request, and the key you passed, to OpenAI's own endpoint.
- **Set the context window.** `OpenAILike` assumes 3,900 tokens unless told otherwise, and LlamaIndex sizes the prompts it builds to fit that. Both Oathbreaker models have a 131,072-token window that input and requested output share; the [model limits](https://oathbreaker.ai/docs#model) list the current values.
- **Turn off automatic retries.** With the defaults, one failing call reached a local stand-in server 12 times. `max_retries=0` sends it once. A timeout does not prove that nothing was processed: [check usage before you repeat a request](https://oathbreaker.ai/docs#errors).
- **Allow long generations.** `OpenAILike` gives up after 60 seconds by default. A generation can run for up to ten minutes; the example waits 650 seconds.
- **The output budget includes reasoning.** `max_tokens` covers the model's reasoning and its answer together, so set it yourself instead of relying on a default. If reasoning uses it up, the finish reason is `length` and the content can be empty; the example reads it from `response.raw.choices[0].finish_reason` and treats that as a failure.
- **Reasoning effort.** `OpenAILike` has no setting of its own for it. `additional_kwargs={"reasoning_effort": "low"}` adds the field to every request; the API also accepts `"high"` and `"max"`.
- **No embeddings.** Oathbreaker serves chat models only. An index needs an embedding model from another provider or one you run locally: set `Settings.embed_model` yourself, because LlamaIndex otherwise looks for OpenAI's.
- **Text only.** Image and audio message parts are not supported.
- **Tool calling.** With `is_function_calling_model=True`, LlamaIndex sends your tools in the format the API accepts. In a tool conversation the [API reference](https://oathbreaker.ai/docs#tools) asks clients to send the assistant's `reasoning_content` back. LlamaIndex does not keep that field, so the follow-up request goes out without it; the API accepts the request either way. This repository has no tool-calling example for LlamaIndex.
- **Parallel calls.** Async and batched pipelines send requests in parallel, and the API limits how many generations an account can run at once. Keep the worker count within the [rate limits](https://oathbreaker.ai/docs#rate-limits).

## Checked with

`llama-index-llms-openai-like` 0.8.1 (`llama-index-core` 0.14.25) on Python 3.12. `PYTHON=.venv/bin/python node --test tests/frameworks/llamaindex.test.mjs` runs the example against a local stand-in server and checks the request it sends. It does not call the API, so it says nothing about model quality or latency.
