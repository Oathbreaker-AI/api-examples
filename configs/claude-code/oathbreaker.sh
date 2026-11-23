# Point Claude Code at Oathbreaker for the current terminal session.
#
#   1. Set OATHBREAKER_API_KEY in this terminal (see README.md).
#   2. source configs/claude-code/oathbreaker.sh
#   3. claude
#
# Full guide: https://oathbreaker.ai/agents/claude-code

if [ -z "${OATHBREAKER_API_KEY:-}" ]; then
  echo "Set OATHBREAKER_API_KEY first: these lines copy it when they run." >&2
  return 1 2>/dev/null || exit 1
fi

# No /v1 here: Claude Code adds /v1/messages itself.
export ANTHROPIC_BASE_URL=https://oathbreaker.ai
export ANTHROPIC_AUTH_TOKEN="$OATHBREAKER_API_KEY"
export ANTHROPIC_MODEL=oathbreaker-glm-5.3
export ANTHROPIC_DEFAULT_OPUS_MODEL=oathbreaker-glm-5.3
export ANTHROPIC_DEFAULT_SONNET_MODEL=oathbreaker-glm-5.3
export ANTHROPIC_DEFAULT_HAIKU_MODEL=oathbreaker-glm-5.3-flash
export CLAUDE_CODE_AUTO_COMPACT_WINDOW=100000
