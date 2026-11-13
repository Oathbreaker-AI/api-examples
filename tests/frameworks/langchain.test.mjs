import { checkExample, python } from './fixture.mjs';

checkExample('LangChain', python('langchain'), { usage: { input_tokens: 12, output_tokens: 8, total_tokens: 20 } });
