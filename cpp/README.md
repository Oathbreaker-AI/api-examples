# C++ example (libcurl)

One Chat Completions request from C++17, using [libcurl](https://curl.se/libcurl/) for HTTPS and [nlohmann/json](https://github.com/nlohmann/json) for JSON. Oathbreaker has no C++ SDK and needs none: send an HTTPS `POST` to the full URL below.

| | |
|---|---|
| Request URL | `https://oathbreaker.ai/v1/chat/completions` |
| Base URL | `https://oathbreaker.ai/v1` |
| Headers | `Authorization: Bearer <key>` and `Content-Type: application/json` |
| Key | read from `OATHBREAKER_API_KEY` |

The host is `oathbreaker.ai`. There is no `api.` subdomain. `ai.oathbreaker/oathbreaker`, which you may see in MCP directories, is the registry name of the [Oathbreaker MCP server](https://github.com/Oathbreaker-AI/oathbreaker-mcp) (the domain written backwards), not a hostname.

## Build and run

Install a C++17 compiler, libcurl and nlohmann/json:

| System | Install |
|---|---|
| Ubuntu / Debian | `sudo apt install g++ libcurl4-openssl-dev nlohmann-json3-dev` |
| macOS (Homebrew) | `brew install nlohmann-json` (libcurl ships with macOS) |
| Windows (vcpkg) | `vcpkg install curl nlohmann-json` |

Then, from the repository root:

```sh
g++ -std=c++17 -O2 cpp/hello.cpp -o hello -lcurl
export OATHBREAKER_API_KEY=...   # your key; never commit it
./hello
```

On macOS with Homebrew, add `-I"$(brew --prefix)/include"` to the `g++` line (or use `clang++`).

Running it with a real key makes **one billable request** with `oathbreaker-glm-5.3`, low reasoning effort and a 2,048-token output budget. It prints the answer and the returned token usage.

## What it does

- Sends only the request fields the [API reference](https://oathbreaker.ai/docs#requests) lists: `model`, `messages`, `max_tokens`, `reasoning_effort` and `stream`. The API rejects any other top-level field with HTTP 400.
- Does not follow redirects and does not retry. A non-2xx status, a timeout (660 seconds) or a `finish_reason` other than `stop` is an error. Check your usage before sending the request again.
- Never prints the key. The optional command-line argument replaces the base URL for the local tests only. Leave it out in real use, because the key is sent to whatever base URL is used.

To use another model, change `"oathbreaker-glm-5.3"` to any identifier in the [models table](../README.md#models). For streaming and function calling, see the [API reference](https://oathbreaker.ai/docs).

## Test

```sh
node --test tests/cpp/*.test.mjs
```

The test builds the example (set `CXX` to choose the compiler) and runs it against a local fixture server, with no paid requests. It checks the URL, headers, request body, usage output, HTTP errors, incomplete answers and that redirects are not followed.
