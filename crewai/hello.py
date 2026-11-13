"""A one-agent CrewAI crew pointed at Oathbreaker. Run on your server; keep keys private."""
import json
import os
import sys

from crewai import LLM, Agent, Crew, Task
from openai import APIStatusError, OpenAIError

BASE_URL = "https://oathbreaker.ai/v1"
MODEL = "oathbreaker-glm-5.3"


def complete(api_key, base_url=BASE_URL):
    if not api_key:
        raise ValueError("Set OATHBREAKER_API_KEY in your environment.")
    llm = LLM(
        model=f"openai/{MODEL}",  # "openai/" selects CrewAI's OpenAI-compatible client; base_url sends it to Oathbreaker
        base_url=base_url,
        api_key=api_key,
        max_tokens=2048,
        reasoning_effort="low",
        timeout=650,
        max_retries=0,  # left at its default, the client repeats a failed request on its own
        context_window_size=131072,
    )
    agent = Agent(
        role="Connection checker",
        goal="Confirm that the model answers.",
        backstory="You check that an API connection works.",
        llm=llm,
        max_retry_limit=0,  # left at its default, the agent runs a failed task again, twice
        verbose=False,
    )
    task = Task(
        description="Reply with exactly: Oathbreaker connected.",
        expected_output="That sentence and nothing else.",
        agent=agent,
    )
    try:
        result = Crew(agents=[agent], tasks=[task], verbose=False).kickoff()
    except APIStatusError as error:
        raise RuntimeError(f"API returned HTTP {error.status_code}. Inspect your dashboard before retrying.") from None
    if not result.raw:
        raise RuntimeError("No text answer. Inspect usage and the output budget before retrying.")
    return {"text": result.raw, "usage": result.token_usage.model_dump()}


if __name__ == "__main__":
    try:
        result = complete(os.environ.get("OATHBREAKER_API_KEY"))
        print(result["text"])
        print("Usage:", json.dumps(result["usage"]))
    except (ValueError, RuntimeError, OpenAIError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
