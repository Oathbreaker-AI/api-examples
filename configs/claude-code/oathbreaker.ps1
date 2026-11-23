# Point Claude Code at Oathbreaker for the current PowerShell session.
#
#   1. Set $env:OATHBREAKER_API_KEY in this session (see README.md).
#   2. . .\configs\claude-code\oathbreaker.ps1
#   3. claude
#
# Full guide: https://oathbreaker.ai/agents/claude-code

if (-not $env:OATHBREAKER_API_KEY) {
  Write-Error "Set OATHBREAKER_API_KEY first: these lines copy it when they run."
  return
}

# No /v1 here: Claude Code adds /v1/messages itself.
$env:ANTHROPIC_BASE_URL = "https://oathbreaker.ai"
$env:ANTHROPIC_AUTH_TOKEN = $env:OATHBREAKER_API_KEY
$env:ANTHROPIC_MODEL = "oathbreaker-glm-5.3"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL = "oathbreaker-glm-5.3"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL = "oathbreaker-glm-5.3"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL = "oathbreaker-glm-5.3-flash"
$env:CLAUDE_CODE_AUTO_COMPACT_WINDOW = "100000"
