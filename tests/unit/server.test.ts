import { describe, it, expect } from 'bun:test';

describe('SE2-Minikit MCP Server', () => {
  describe('Server initialization', () => {
    it('should pass basic test', () => {
      expect(true).toBe(true);
    });

    it('should have correct package name', () => {
      const pkg = require('../../package.json');
      expect(pkg.name).toBe('se2-minikit-mcp-server');
    });

    it('should have MCP SDK dependency', () => {
      const pkg = require('../../package.json');
      expect(pkg.dependencies).toHaveProperty('@modelcontextprotocol/sdk');
    });
  });
});
