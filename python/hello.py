"""Python 3.10+ standard library. Run on your server; keep keys private."""
import json
import os
import sys
import urllib.error
import urllib.request


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def complete(api_key, base_url="https://oathbreaker.ai/v1"):
    if not api_key:
        raise ValueError("Set OATHBREAKER_API_KEY in your environment.")
    payload = {
        "model": "oathbreaker-glm-5.3",
        "messages": [{"role": "user", "content": "Reply with exactly: Oathbreaker connected."}],
        "max_tokens": 2048,
        "reasoning_effort": "low",
        "stream": False,
    }
    request = urllib.request.Request(
        base_url + "/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization": "Bearer " + api_key, "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.build_opener(NoRedirect).open(request, timeout=660) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"API returned HTTP {error.code}. Inspect your dashboard before retrying.") from None
    choices = result.get("choices", [])
    choice = choices[0] if choices else {}
    text = choice.get("message", {}).get("content")
    if choice.get("finish_reason") != "stop" or not text:
        raise RuntimeError("No complete text answer. Inspect usage and the output budget before retrying.")
    return {"text": text, "usage": result.get("usage")}


if __name__ == "__main__":
    try:
        result = complete(os.environ.get("OATHBREAKER_API_KEY"))
        print(result["text"])
        print("Usage:", json.dumps(result["usage"]))
    except (ValueError, RuntimeError, urllib.error.URLError, TimeoutError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
