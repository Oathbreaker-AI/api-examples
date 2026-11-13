# Use Oathbreaker AI with LangChain

[Oathbreaker AI](https://oathbreaker.ai) is a prepaid model API that uses the OpenAI Chat Completions format. LangChain connects to it through `ChatOpenAI` from the `langchain-openai` package: set `base_url` to the Oathbreaker endpoint, pass an Oathbreaker API key, and name an Oathbreaker model. No Oathbreaker-specific package is needed.

```python
import os
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="oathbreaker-glm-5.3",
    base_url="https://oathbreaker.ai/v1",
    api_key=os.environ["OATHBREAKER_API_KEY"],
    max_tokens=2048,
    timeout=650,
    max_retries=0,
)
print(llm.invoke("Reply with exactly: Oathbreaker connected.").content)
```

## Settings

| Setting | Value |
|---|---|
| Class | `ChatOpenAI` from `langchain-openai` |
| `base_url` | `https://oathbreaker.ai/v1` |
| `api_key` | Your Oathbreaker key, kept in `OATHBREAKER_API_KEY` |
| `model` | `oathbreaker-glm-5.3`, or `oathbreaker-glm-5.3-flash` |

## Run the example

[`hello.py`](hello.py) is the snippet above with error handling. Each run makes **one billable request**. Set `OATHBREAKER_API_KEY` first, as described in the [main README](../README.md#before-you-start).

```sh
python3 -m venv .venv
.venv/bin/pip install -r langchain/requirements.txt
.venv/bin/python langchain/hello.py
```

## What the example sends

One `POST https://oathbreaker.ai/v1/chat/completions` with `model`, `messages`, `max_completion_tokens`, `reasoning_effort` and `stream: false`. LangChain sends your `max_tokens` under the name `max_completion_tokens`; the API accepts either. Every field is one the [API reference](https://oathbreaker.ai/docs#requests) lists. The API rejects a request that carries any other field: `400 invalid_request`, "The request contains an unsupported field."

## Things to know

- **Pass the key and base URL explicitly.** `ChatOpenAI` falls back to `OPENAI_API_KEY` and `OPENAI_BASE_URL` when you leave them out. Passing both keeps a key for one service from being sent to the other.
- **Turn off automatic retries.** By default `ChatOpenAI` repeats a failed request twice, so one failing call reaches the API three times. `max_retries=0` sends it once. A timeout does not prove that nothing was processed: [check usage before you repeat a request](https://oathbreaker.ai/docs#errors).
- **Allow long generations.** A generation can run for up to ten minutes; the example waits 650 seconds.
- **The output budget includes reasoning.** `max_tokens` covers the model's reasoning and its answer together, so set it yourself instead of relying on a default. If reasoning uses it up, `response_metadata["finish_reason"]` is `length` and the content can be empty; the example treats that as a failure.
- **Set reasoning with `reasoning_effort`.** `reasoning_effort="low"`, `"high"` or `"max"` stays on Chat Completions. `reasoning={...}`, `use_responses_api=True`, `output_version="responses/v1"` and OpenAI's built-in tools all switch `ChatOpenAI` to the Responses API, which Oathbreaker does not offer.
- **Only the listed request fields.** Leave `stop`, `n`, `seed`, `frequency_penalty`, `presence_penalty`, `logprobs` and `user` unset, on the model and on each call: the API accepts none of them. That includes chains and agents that pass stop sequences.
- **No embeddings.** Oathbreaker serves chat models only. For retrieval, take the embedding model from another provider or run one locally; `OpenAIEmbeddings` cannot point at Oathbreaker.
- **Text only.** Image and audio message parts are not supported.
- **Tool calling.** `bind_tools` sends your tools in the format the API accepts. Do not pass `strict=True`: strict tool schemas are not supported. In a tool conversation the [API reference](https://oathbreaker.ai/docs#tools) asks clients to send the assistant's `reasoning_content` back. `ChatOpenAI` does not keep that field, so the follow-up request goes out without it; the API accepts the request either way. This repository has no tool-calling example for LangChain.
- **Batches.** `llm.batch(...)` sends requests in parallel, and the API limits how many generations an account can run at once. Pass `config={"max_concurrency": n}` to stay within the [rate limits](https://oathbreaker.ai/docs#rate-limits).
- **Streaming.** `llm.stream(...)` sends `stream: true`. See the [streaming reference](https://oathbreaker.ai/docs#streaming).

## Checked with

`langchain-openai` 1.7.4 on Python 3.12. `PYTHON=.venv/bin/python node --test tests/frameworks/langchain.test.mjs` runs the example against a local stand-in server and checks the request it sends. It does not call the API, so it says nothing about model quality or latency.
