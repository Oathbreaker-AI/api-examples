# Connect Hermes to Oathbreaker

The maintained [Oathbreaker agent guide](https://oathbreaker.ai/agents) contains current model settings and troubleshooting. Hermes's interface can vary by version.

1. Install Hermes using the [official Nous Research instructions](https://hermes-agent.nousresearch.com/docs/getting-started/installation).
2. Create an Oathbreaker account, add credit, and create a key in [your console](https://oathbreaker.ai/dashboard).
3. Exit any active Hermes conversation. Run `hermes model` and choose **Custom endpoint**.
4. Enter base URL `https://oathbreaker.ai/v1`, your key in the masked key prompt, and model `oathbreaker-glm-5.3`.
5. Use the context and compression settings currently listed on [the agent setup page](https://oathbreaker.ai/agents#connect). These should track the service's active context configuration.
6. Start a fresh conversation. Ask: `Reply with exactly: Oathbreaker connected.` This is a paid API request.
7. Check the request and token charge in your Oathbreaker Usage tab before starting a larger workflow.

Keep human approval for consequential tool actions. Model output can be incorrect; the abliteration label does not guarantee answers or successful tasks. Avoid sending data you are not authorized to share.

If the connection fails, review the exact API error and [troubleshooting guide](https://oathbreaker.ai/agents). Never post your API key or paste a complete private configuration into a public issue.
