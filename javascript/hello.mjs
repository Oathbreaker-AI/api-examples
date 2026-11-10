// Node.js 22+. Run on your server, never in a browser bundle.
import { pathToFileURL } from 'node:url';

export async function complete(apiKey, baseUrl = 'https://oathbreaker.ai/v1') {
  if (!apiKey) throw new Error('Set OATHBREAKER_API_KEY in your environment.');
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    redirect: 'error',
    signal: AbortSignal.timeout(660_000),
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'oathbreaker-glm-5.3',
      messages: [{ role: 'user', content: 'Reply with exactly: Oathbreaker connected.' }],
      max_tokens: 2048,
      reasoning_effort: 'low',
      stream: false,
    }),
  });
  if (!response.ok) throw new Error(`API returned HTTP ${response.status}. Inspect your dashboard before retrying.`);
  const result = await response.json();
  const choice = result.choices?.[0];
  if (choice?.finish_reason !== 'stop' || !choice?.message?.content) {
    throw new Error('No complete text answer. Inspect usage and the output budget before retrying.');
  }
  return { text: choice.message.content, usage: result.usage };
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
