"""LlamaIndex pointed at Oathbreaker. Run on your server; keep keys private."""
import json
import os
import sys

from llama_index.core.llms import ChatMessage
from llama_index.llms.openai_like import OpenAILike
from openai import APIStatusError, OpenAIError

BASE_URL = "https://oathbreaker.ai/v1"
MODEL = "oathbreaker-glm-5.3"


def complete(api_key, base_url=BASE_URL):
    if not api_key:
        raise ValueError("Set OATHBREAKER_API_KEY in your environment.")
    llm = OpenAILike(
        model=MODEL,
        api_base=base_url,
        api_key=api_key,
        is_chat_model=True,  # without it OpenAILike calls the legacy Completions endpoint, which Oathbreaker does not have
        context_window=131072,
        max_tokens=2048,
        timeout=650,
        max_retries=0,  # left at its default, LlamaIndex repeats a failed request on its own
        additional_kwargs={"reasoning_effort": "low"},
    )
    try:
        response = llm.chat([ChatMessage(role="user", content="Reply with exactly: Oathbreaker connected.")])
    except APIStatusError as error:
        raise RuntimeError(f"API returned HTTP {error.status_code}. Inspect your dashboard before retrying.") from None
    choice = response.raw.choices[0] if response.raw.choices else None
    if choice is None or choice.finish_reason != "stop" or not response.message.content:
        raise RuntimeError("No complete text answer. Inspect usage and the output budget before retrying.")
    usage = response.raw.usage.model_dump(exclude_none=True) if response.raw.usage else None
    return {"text": response.message.content, "usage": usage}


if __name__ == "__main__":
    try:
        result = complete(os.environ.get("OATHBREAKER_API_KEY"))
        print(result["text"])
        print("Usage:", json.dumps(result["usage"]))
    except (ValueError, RuntimeError, OpenAIError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
