# Recommended Hermes settings for Oathbreaker.
# Run these after saving the Oathbreaker endpoint with `hermes model` (see README.md).
# They set low reasoning and summarize long conversations earlier in this Hermes profile.
# They change only the named settings; they do not replace your config or API keys.
# Full guide: https://oathbreaker.ai/agents#hermes

hermes config set agent.reasoning_effort low
hermes config set compression.threshold 0.75
hermes config set compression.threshold_tokens 81920
