# Troubleshooting Guide

## MCP Server Issues

### "Template not found: basic" Error

**Symptom**: The `scaffold_project` tool fails with "Template not found: basic" error.

**Cause**: The MCP server cannot locate the templates directory.

**Solution**: Ensure you're using the **built** version (`dist/index.js`), not the source version:

```json
{
  "mcpServers": {
    "scaffold-minikit": {
      "command": "/Users/yourusername/.bun/bin/bun",
      "args": ["--silent", "/absolute/path/to/se2-minikit-mcp-server/dist/index.js"]
    }
  }
}
```

**Why**: The built version correctly resolves paths relative to the project root. The source version uses `process.cwd()` which can vary depending on where Claude Code starts the process.

---

### "Unexpected token 'd', '[dotenv@17...' is not valid JSON"

**Symptom**: Claude Code shows JSON parsing errors in the MCP server logs.

**Cause**: The MCP server is writing non-JSON output to stdout, but the MCP protocol requires stdout to be exclusively JSON-RPC messages.

**Solution**: Add these three flags to your configuration:

```json
{
  "mcpServers": {
    "scaffold-minikit": {
      "command": "/Users/yourusername/.bun/bin/bun",
      "args": ["--silent", "/absolute/path/to/se2-minikit-mcp-server/dist/index.js"],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**Explanation**:
- `--silent`: Suppresses Bun's package manager output
- `NODE_ENV=production`: Disables pino-pretty (prevents stdout leaks)
- `LOG_LEVEL=info`: Reduces log verbosity

**Why**: Bun prints dependency installation messages and pino-pretty can leak startup messages to stdout despite being configured for stderr.

---

### "spawn bun ENOENT" Error

**Symptom**: Claude Code cannot find the `bun` command.

**Cause**: You're using `"command": "bun"` instead of the absolute path.

**Solution**: Find your Bun path and use the absolute path:

```bash
which bun
# Output: /Users/yourusername/.bun/bin/bun
```

Then update your config:

```json
{
  "command": "/Users/yourusername/.bun/bin/bun"
}
```

**Why**: Claude Desktop doesn't inherit your shell's PATH environment variable.

---

### Server Connects But Tools Don't Work

**Symptom**: The MCP server appears in Claude Code, but the `scaffold_project` tool fails.

**Check**:
1. ✅ Built the server: `bun run build`
2. ✅ Using `dist/index.js` not `src/server/index.ts`
3. ✅ Absolute paths in configuration
4. ✅ Templates directory exists: `ls templates/basic/`

**Verify Template Path**:
```bash
cd dist
node -e "import { fileURLToPath } from 'url'; import { dirname, join } from 'path'; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename); const PROJECT_ROOT = __dirname.includes('/dist') ? join(__dirname, '..') : join(__dirname, '..', '..'); console.log('Templates:', join(PROJECT_ROOT, 'templates'));"
```

Should output: `/absolute/path/to/se2-minikit-mcp-server/templates`

---

## Complete Working Configuration

Here's a complete, working Claude Code configuration:

```json
{
  "mcpServers": {
    "scaffold-minikit": {
      "command": "/Users/yourusername/.bun/bin/bun",
      "args": [
        "--silent",
        "/absolute/path/to/se2-minikit-mcp-server/dist/index.js"
      ],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**Replace**:
- `/Users/yourusername/.bun/bin/bun` → Your actual Bun path (run `which bun`)
- `/absolute/path/to/se2-minikit-mcp-server/dist/index.js` → Your actual server path

---

## Verification Checklist

Before reporting an issue, verify:

- [ ] ✅ Bun is installed: `bun --version` shows v1.2.16+
- [ ] ✅ Dependencies installed: `bun install` completed
- [ ] ✅ Server built: `bun run build` completed successfully
- [ ] ✅ Tests pass: `bun test` shows 337 passing tests
- [ ] ✅ Templates exist: `ls templates/basic/` shows template files
- [ ] ✅ Using absolute paths in Claude Code config
- [ ] ✅ Using `dist/index.js` not `src/server/index.ts`
- [ ] ✅ Using `--silent` flag with Bun
- [ ] ✅ Setting `NODE_ENV=production`
- [ ] ✅ Restarted Claude Code after config changes

---

## Debugging Tips

### Check MCP Server Logs

Claude Code logs MCP server output. Look for:
- ✅ `"Server started successfully"`
- ✅ `"Tool registered: mcp__scaffold-minikit__scaffold_project"`
- ❌ `"Template not found"`
- ❌ `"Unexpected token"`

### Test Server Directly

Test the server outside of Claude Code:

```bash
cd /path/to/se2-minikit-mcp-server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | NODE_ENV=production bun --silent dist/index.js
```

Should return JSON with `scaffold_project` tool.

### Verify Path Resolution

```bash
cd dist
node -e "console.log('CWD:', process.cwd()); console.log('__dirname:', import.meta.url);"
```

---

## Getting Help

If you've tried everything above and still have issues:

1. Run `bun test` and include the output
2. Include your Claude Code configuration (with paths anonymized)
3. Include relevant MCP server logs from Claude Code
4. Open an issue at: https://github.com/yourusername/se2-minikit-mcp-server/issues
