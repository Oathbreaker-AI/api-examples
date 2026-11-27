// C++17 with libcurl and nlohmann/json. Run on your server; keep keys private.
//
// The API host is oathbreaker.ai and every request goes to a path below
// https://oathbreaker.ai/v1, for example https://oathbreaker.ai/v1/chat/completions.
// "ai.oathbreaker/oathbreaker" is the MCP Registry name of the Oathbreaker MCP
// server (the domain written backwards), not a hostname, and there is no api.
// subdomain.
#include <curl/curl.h>
#include <nlohmann/json.hpp>

#include <cstdlib>
#include <iostream>
#include <stdexcept>
#include <string>

namespace {

const std::string kBaseUrl = "https://oathbreaker.ai/v1";

size_t collect(char* data, size_t size, size_t count, void* out) {
  static_cast<std::string*>(out)->append(data, size * count);
  return size * count;
}

struct Answer {
  std::string text;
  nlohmann::json usage;
};

// Sends one non-streaming Chat Completions request. It does not retry and does
// not follow redirects. Keep any custom base URL trusted: the API key is sent there.
Answer complete(const std::string& api_key, const std::string& base_url = kBaseUrl) {
  if (api_key.empty()) throw std::invalid_argument("Set OATHBREAKER_API_KEY in your environment.");

  const nlohmann::json payload = {
      {"model", "oathbreaker-glm-5.3"},
      {"messages", {{{"role", "user"}, {"content", "Reply with exactly: Oathbreaker connected."}}}},
      {"max_tokens", 2048},
      {"reasoning_effort", "low"},
      {"stream", false},
  };
  const std::string body = payload.dump();
  const std::string url = base_url + "/chat/completions";
  const std::string auth = "Authorization: Bearer " + api_key;

  CURL* curl = curl_easy_init();
  if (!curl) throw std::runtime_error("Could not start libcurl.");
  curl_slist* headers = curl_slist_append(nullptr, auth.c_str());
  headers = curl_slist_append(headers, "Content-Type: application/json");

  std::string response;
  curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
  curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
  curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body.c_str());
  curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, static_cast<long>(body.size()));
  curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 0L);
  curl_easy_setopt(curl, CURLOPT_TIMEOUT, 660L);
  curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, collect);
  curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);

  const CURLcode sent = curl_easy_perform(curl);
  long status = 0;
  curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &status);
  curl_slist_free_all(headers);
  curl_easy_cleanup(curl);

  if (sent != CURLE_OK) {
    throw std::runtime_error(std::string("Request failed: ") + curl_easy_strerror(sent) +
                             ". Inspect your dashboard before retrying.");
  }
  if (status < 200 || status >= 300) {
    throw std::runtime_error("API returned HTTP " + std::to_string(status) +
                             ". Inspect your dashboard before retrying.");
  }

  const nlohmann::json result = nlohmann::json::parse(response, nullptr, false);
  const nlohmann::json* choice = nullptr;
  if (result.is_object() && result.contains("choices") && result["choices"].is_array() &&
      !result["choices"].empty() && result["choices"][0].is_object()) {
    choice = &result["choices"][0];
  }
  const bool stopped = choice && choice->value("finish_reason", "") == "stop";
  const bool has_text = choice && choice->contains("message") && (*choice)["message"].is_object() &&
                        (*choice)["message"].contains("content") &&
                        (*choice)["message"]["content"].is_string() &&
                        !(*choice)["message"]["content"].get<std::string>().empty();
  if (!stopped || !has_text) {
    throw std::runtime_error("No complete text answer. Inspect usage and the output budget before retrying.");
  }
  return {(*choice)["message"]["content"].get<std::string>(), result.value("usage", nlohmann::json())};
}

}  // namespace

int main(int argc, char** argv) {
  curl_global_init(CURL_GLOBAL_DEFAULT);
  int code = 0;
  try {
    const char* key = std::getenv("OATHBREAKER_API_KEY");
    // The optional argument exists for the local tests; leave it out to use the official API.
    const Answer answer = argc > 1 ? complete(key ? key : "", argv[1]) : complete(key ? key : "");
    std::cout << answer.text << "\n";
    std::cout << "Usage: " << answer.usage.dump() << "\n";
  } catch (const std::exception& error) {
    std::cerr << error.what() << "\n";
    code = 1;
  }
  curl_global_cleanup();
  return code;
}
