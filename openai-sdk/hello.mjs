// OpenAI JavaScript SDK pointed at Oathbreaker. Node.js 22+. Run on your server, never in a browser bundle.
import { pathToFileURL } from 'node:url';
import OpenAI from 'openai';

export const BASE_URL = 'https://oathbreaker.ai/v1';
export const MODEL = 'oathbreaker-glm-5.3';

export async function complete(apiKey, baseUrl = BASE_URL) {
  if (!apiKey) throw new Error('Set OATHBREAKER_API_KEY in your environment.');
  // maxRetries: 0 because, left at its default, the SDK repeats a failed request on its own.
  const client = new OpenAI({ apiKey, baseURL: baseUrl, timeout: 650_000, maxRetries: 0 });
  let response;
  try {
    response = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: 'Reply with exactly: Oathbreaker connected.' }],
      max_tokens: 2048,
      reasoning_effort: 'low',
      stream: false,
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError && error.status) {
      throw new Error(`API returned HTTP ${error.status}. Inspect your dashboard before retrying.`);
    }
    throw error;
  }
  const choice = response.choices?.[0];
  if (choice?.finish_reason !== 'stop' || !choice?.message?.content) {
    throw new Error('No complete text answer. Inspect usage and the output budget before retrying.');
  }
  return { text: choice.message.content, usage: response.usage };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await complete(process.env.OATHBREAKER_API_KEY);
    console.log(result.text);
    console.log('Usage:', result.usage);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
