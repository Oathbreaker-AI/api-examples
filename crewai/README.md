# Use Oathbreaker AI with CrewAI

[Oathbreaker AI](https://oathbreaker.ai) is a prepaid model API that uses the OpenAI Chat Completions format. CrewAI connects to it through its own `LLM` class: prefix an Oathbreaker model with `openai/`, set `base_url` to the Oathbreaker endpoint, and pass an Oathbreaker API key. Give that `LLM` to your agents. No Oathbreaker-specific package is needed. Agents that use tools are not supported yet; see below.

```python
import os
from crewai import LLM, Agent, Crew, Task

llm = LLM(
    model="openai/oathbreaker-glm-5.3",
    base_url="https://oathbreaker.ai/v1",
    api_key=os.environ["OATHBREAKER_API_KEY"],
    max_tokens=2048,
    timeout=650,
    max_retries=0,
    context_window_size=131072,
)
agent = Agent(
    role="Connection checker",
    goal="Confirm that the model answers.",
    backstory="You check that an API connection works.",
    llm=llm,
    max_retry_limit=0,
)
task = Task(
    description="Reply with exactly: Oathbreaker connected.",
    expected_output="That sentence and nothing else.",
    agent=agent,
)
print(Crew(agents=[agent], tasks=[task]).kickoff().raw)
```

## Settings

| Setting | Value |
|---|---|
| Class | `LLM` from `crewai` |
| `model` | `openai/oathbreaker-glm-5.3`, or `openai/oathbreaker-glm-5.3-flash` |
| `base_url` | `https://oathbreaker.ai/v1` |
| `api_key` | Your Oathbreaker key, kept in `OATHBREAKER_API_KEY` |
| `context_window_size` | `131072` |

The `openai/` prefix selects CrewAI's client for OpenAI-style APIs, and `base_url` points that client at Oathbreaker. Only the part after the slash is sent as the model name.

## Run the example

[`hello.py`](hello.py) is the snippet above with error handling. This crew has one agent, one task and no tools, so each run makes **one billable request**. Set `OATHBREAKER_API_KEY` first, as described in the [main README](../README.md#before-you-start).

```sh
python3 -m venv .venv
.venv/bin/pip install -r crewai/requirements.txt
.venv/bin/python crewai/hello.py
```

## What the example sends

One `POST https://oathbreaker.ai/v1/chat/completions` with `model`, `messages`, `max_tokens` and `reasoning_effort`. The messages are a system prompt that CrewAI writes from the agent's role, goal and backstory, followed by the task. Every field is one the [API reference](https://oathbreaker.ai/docs#requests) lists. The API rejects a request that carries any other field: `400 invalid_request`, "The request contains an unsupported field."

## Things to know

- **Every step is a request.** Each task and each extra agent adds requests, and CrewAI's system prompt is sent, and billed as input, with every one of them. Start with a small crew and look at the Usage tab in your console before scaling up.
- **Turn off both kinds of retry.** The client repeats a failed request twice (`max_retries`), and the agent runs a failed task again twice (`max_retry_limit`). With the defaults, one failing call reached a local stand-in server 9 times; with both set to `0` it was sent once. A timeout does not prove that nothing was processed: [check usage before you repeat a request](https://oathbreaker.ai/docs#errors).
- **A 429 is still retried.** CrewAI itself retries a rate-limit response, up to three attempts in all, and this cannot be switched off on `LLM`. The API does not charge for a 429.
- **Set the context window.** CrewAI does not know Oathbreaker's models and assumes 8,192 tokens. Past that it summarises the conversation, which takes requests of its own. Both models have a 131,072-token window that input and requested output share; the [model limits](https://oathbreaker.ai/docs#model) list the current values.
- **Allow long generations.** A generation can run for up to ten minutes; the example waits 650 seconds.
- **The output budget includes reasoning.** `max_tokens` covers the model's reasoning and its answer together, so set it yourself instead of relying on a default. A crew's result does not say why the model stopped, so an answer that was cut off looks like any other. If answers come back short or empty, raise `max_tokens` or lower `reasoning_effort`.
- **No embeddings.** Oathbreaker serves chat models only. Crew memory and knowledge sources need an embedding model, so leave them off or configure an embedder from another provider.
- **Agents with tools do not work yet.** CrewAI marks every tool schema `strict: true` and adds a `name` to each tool result. The API supports neither, so a request from an agent that has tools is rejected with HTTP 400 (`invalid_tools`). Use Oathbreaker with CrewAI for agents that work without tools.
- **Parallel work.** Asynchronous tasks and several crews at once send requests in parallel, and the API limits how many generations an account can run at once. See the [rate limits](https://oathbreaker.ai/docs#rate-limits).
- **CrewAI's own telemetry.** CrewAI has telemetry of its own, which is separate from Oathbreaker. `CREWAI_DISABLE_TELEMETRY=true` turns it off.

## Checked with

`crewai` 1.15.41 on Python 3.12. `PYTHON=.venv/bin/python node --test tests/frameworks/crewai.test.mjs` runs the example against a local stand-in server and checks the request it sends. It does not call the API, so it says nothing about model quality or latency.
