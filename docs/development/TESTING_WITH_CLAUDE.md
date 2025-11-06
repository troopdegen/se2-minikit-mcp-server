# Testing SE2-Minikit MCP Server with Claude Desktop

## Quick Setup

### 1. Find Your Claude Desktop Config

The config file location depends on your OS:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**Linux**: `~/.config/Claude/claude_desktop_config.json`

### 2. Add Server to Config

Open the config file and add the MCP server:

```json
{
  "mcpServers": {
    "se2-minikit": {
      "command": "bun",
      "args": [
        "run",
        "/Users/mel/code/fafo/se2-minikit-mcp-server/src/server/index.ts"
      ]
    }
  }
}
```

**Important**: Use the absolute path to your project directory!

### 3. Restart Claude Desktop

Completely quit and restart Claude Desktop for changes to take effect.

### 4. Verify Server is Running

In a new Claude conversation, you should see the MCP server indicator (hammer icon 🔨) in the bottom right.

Click it to see:
- **se2-minikit** server listed
- **1 tool available**: `health_check`

## Testing the Server

### Test 1: Check Server Health

Ask Claude:
```
Can you run the health_check tool from the se2-minikit server?
```

Expected response:
```json
{
  "status": "healthy",
  "version": "0.0.1",
  "timestamp": "<current timestamp>"
}
```

### Test 2: List Available Tools

Ask Claude:
```
What tools are available from the se2-minikit MCP server?
```

Expected: Claude should list the `health_check` tool with its description.

### Test 3: Check Server Logs

Open a terminal and check the server is running:

```bash
# View Claude Desktop logs (macOS)
tail -f ~/Library/Logs/Claude/mcp*.log

# Or check if the server process is running
ps aux | grep se2-minikit
```

## Troubleshooting

### Server Not Appearing

1. **Check config file syntax**:
   ```bash
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .
   ```
   Should parse without errors.

2. **Verify Bun is in PATH**:
   ```bash
   which bun
   # Should output: /Users/mel/.bun/bin/bun (or similar)
   ```

3. **Test server manually**:
   ```bash
   cd /Users/mel/code/fafo/se2-minikit-mcp-server
   bun run src/server/index.ts
   ```
   Should start and show "Server started successfully"

### Tools Not Working

1. **Check Claude Desktop logs**:
   ```bash
   # macOS
   open ~/Library/Logs/Claude/

   # Look for mcp-server-se2-minikit.log
   ```

2. **Verify TypeScript compilation**:
   ```bash
   cd /Users/mel/code/fafo/se2-minikit-mcp-server
   bun run typecheck
   ```

3. **Test tool directly**:
   ```bash
   # Start server in one terminal
   bun run src/server/index.ts

   # In another terminal, send a test request
   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | bun run src/server/index.ts
   ```

### Common Issues

**Issue**: "command not found: bun"
**Fix**: Add Bun to config with full path:
```json
{
  "mcpServers": {
    "se2-minikit": {
      "command": "/Users/mel/.bun/bin/bun",
      "args": ["run", "/Users/mel/code/fafo/se2-minikit-mcp-server/src/server/index.ts"]
    }
  }
}
```

**Issue**: Server starts but no tools appear
**Fix**: Check logs for errors, verify tool registration in src/server/index.ts

**Issue**: JSON parse error in config
**Fix**: Validate JSON syntax (trailing commas, quotes, brackets)

## Alternative: Test with Production Build

If you prefer to use the built version:

```json
{
  "mcpServers": {
    "se2-minikit": {
      "command": "node",
      "args": [
        "/Users/mel/code/fafo/se2-minikit-mcp-server/dist/index.js"
      ]
    }
  }
}
```

First build the project:
```bash
cd /Users/mel/code/fafo/se2-minikit-mcp-server
bun run build
```

## Current Limitations

Since this is still in development (Issue #2 complete, Issue #3 pending):

- **Only 1 tool available**: `health_check` (basic functionality test)
- **No resources yet**: Template system not implemented (Issue #3)
- **No actual Web3 functionality**: Scaffold-ETH 2 integration pending (Epic 2)

Once Issue #3 (Template Engine) is complete, you'll see:
- Multiple scaffolding tools
- Template resources
- Project generation capabilities

## Next Steps

After testing the MCP server connection:

1. **Development**: Continue with Issue #3 (Template Engine)
2. **More tools**: Issues #11-18 will add the 8 main MCP tools
3. **Full functionality**: Epic 2-6 will add complete Web3 capabilities

## Advanced Testing

### Using MCP Inspector

For detailed MCP protocol debugging:

```bash
# Install MCP Inspector
npm install -g @modelcontextprotocol/inspector

# Run inspector
mcp-inspector bun run /Users/mel/code/fafo/se2-minikit-mcp-server/src/server/index.ts
```

Opens a web UI at http://localhost:5173 for testing tools directly.

### Environment Variables

Create `.env` file for custom configuration:

```bash
# .env
LOG_LEVEL=debug
ENVIRONMENT=development
SERVER_NAME=se2-minikit-mcp-server
```

### Manual Protocol Testing

Test the JSON-RPC protocol directly:

```bash
# Start server
bun run src/server/index.ts

# In another terminal, send requests via stdin
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | bun run src/server/index.ts
```

## Support

If you encounter issues:

1. Check logs: `~/Library/Logs/Claude/mcp-server-se2-minikit.log`
2. Verify tests pass: `bun test`
3. Check TypeScript: `bun run typecheck`
4. Review server startup: `bun run src/server/index.ts`

For Claude Desktop specific issues, see: https://docs.claude.ai/docs/claude-code
