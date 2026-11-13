"""OpenAI Python SDK pointed at Oathbreaker. Run on your server; keep keys private."""
import json
import os
import sys

from openai import APIStatusError, OpenAI, OpenAIError

BASE_URL = "https://oathbreaker.ai/v1"
MODEL = "oathbreaker-glm-5.3"


def complete(api_key, base_url=BASE_URL):
    if not api_key:
        raise ValueError("Set OATHBREAKER_API_KEY in your environment.")
    # max_retries=0: left at its default, the SDK repeats a failed request on its own.
    client = OpenAI(api_key=api_key, base_url=base_url, timeout=650.0, max_retries=0)
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": "Reply with exactly: Oathbreaker connected."}],
            max_tokens=2048,
            reasoning_effort="low",
            stream=False,
        )
    except APIStatusError as error:
        raise RuntimeError(f"API returned HTTP {error.status_code}. Inspect your dashboard before retrying.") from None
    choice = response.choices[0] if response.choices else None
    if choice is None or choice.finish_reason != "stop" or not choice.message.content:
        raise RuntimeError("No complete text answer. Inspect usage and the output budget before retrying.")
    usage = response.usage.model_dump(exclude_none=True) if response.usage else None
    return {"text": choice.message.content, "usage": usage}


if __name__ == "__main__":
    try:
        result = complete(os.environ.get("OATHBREAKER_API_KEY"))
        print(result["text"])
        print("Usage:", json.dumps(result["usage"]))
    except (ValueError, RuntimeError, OpenAIError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
