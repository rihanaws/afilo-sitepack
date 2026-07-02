# Project Codex Configuration

This project configures the Paddle MCP server in `.codex/config.toml`.

The MCP server reads its bearer token from `LIVE_API_KEY`. Keep the actual Paddle
live API key in `.env` or your shell environment, not in Codex config.

Before launching Codex for this project from a terminal:

```bash
cd /Users/rihan/Documents/afilo-sitepack
set -a
source .env
set +a
open -a Codex
```

The expected MCP config is:

```toml
[mcp_servers.paddle-live]
url = "https://mcp.paddle.com/mcp"
bearer_token_env_var = "LIVE_API_KEY"
```

