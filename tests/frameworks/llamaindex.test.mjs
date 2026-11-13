import { checkExample, python } from './fixture.mjs';

checkExample('LlamaIndex', python('llamaindex'), { usage: { prompt_tokens: 12, completion_tokens: 8, total_tokens: 20 } });
