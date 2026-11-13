import { checkExample, python } from './fixture.mjs';
import { complete } from '../../openai-sdk/hello.mjs';

const usage = { prompt_tokens: 12, completion_tokens: 8, total_tokens: 20 };
checkExample('OpenAI SDK for JavaScript', complete, { usage });
checkExample('OpenAI SDK for Python', python('openai-sdk'), { usage });
