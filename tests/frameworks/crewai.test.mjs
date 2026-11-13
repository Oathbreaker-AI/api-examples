import { checkExample, python } from './fixture.mjs';

// A crew's result does not say why the model stopped, so the example cannot tell a cut-off answer from a whole one.
checkExample('CrewAI', python('crewai'), {
  usage: { prompt_tokens: 12, completion_tokens: 8, total_tokens: 20, successful_requests: 1 },
  detectsIncomplete: false,
});
