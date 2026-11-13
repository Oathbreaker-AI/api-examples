"""LangChain pointed at Oathbreaker. Run on your server; keep keys private."""
import json
import os
import sys

from langchain_openai import ChatOpenAI
from openai import APIStatusError, OpenAIError

BASE_URL = "https://oathbreaker.ai/v1"
MODEL = "oathbreaker-glm-5.3"


def complete(api_key, base_url=BASE_URL):
    if not api_key:
        raise ValueError("Set OATHBREAKER_API_KEY in your environment.")
    # max_retries=0: left at its default, ChatOpenAI repeats a failed request on its own.
    llm = ChatOpenAI(
        model=MODEL,
        api_key=api_key,
        base_url=base_url,
        max_tokens=2048,
        reasoning_effort="low",
        timeout=650,
        max_retries=0,
    )
    try:
        message = llm.invoke("Reply with exactly: Oathbreaker connected.")
    except APIStatusError as error:
        raise RuntimeError(f"API returned HTTP {error.status_code}. Inspect your dashboard before retrying.") from None
    if message.response_metadata.get("finish_reason") != "stop" or not message.content:
        raise RuntimeError("No complete text answer. Inspect usage and the output budget before retrying.")
    return {"text": message.content, "usage": message.usage_metadata}


if __name__ == "__main__":
    try:
        result = complete(os.environ.get("OATHBREAKER_API_KEY"))
        print(result["text"])
        print("Usage:", json.dumps(result["usage"]))
    except (ValueError, RuntimeError, OpenAIError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
