/**
 * Integration tests for MCP server
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { createToolRegistry } from '../tools/registry.js';
import { createResourceRegistry } from '../resources/registry.js';
import { loadConfig } from '../config/loader.js';
import { createLogger } from '../utils/logger.js';

describe('Server Integration', () => {
  let config: ReturnType<typeof loadConfig>;
  let logger: ReturnType<typeof createLogger>;
  let toolRegistry: ReturnType<typeof createToolRegistry>;
  let resourceRegistry: ReturnType<typeof createResourceRegistry>;

  beforeEach(() => {
    config = loadConfig();
    logger = createLogger(config);
    toolRegistry = createToolRegistry(logger);
    resourceRegistry = createResourceRegistry(logger);
  });

  describe('Configuration', () => {
    test('should load valid configuration', () => {
      expect(config.name).toBe('se2-minikit-mcp-server');
      expect(config.version).toBe('0.0.1');
      expect(['development', 'production', 'test']).toContain(config.environment);
    });
  });

  describe('Tool Registry Integration', () => {
    test('should register and execute health check tool', async () => {
      toolRegistry.register(
        {
          name: 'health_check',
          description: 'Check server health',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        async () => ({
          status: 'healthy',
          server: config.name,
          version: config.version,
        })
      );

      const result = await toolRegistry.execute('health_check', {});
      expect(result).toMatchObject({
        status: 'healthy',
        server: config.name,
        version: config.version,
      });
    });

    test('should list registered tools', () => {
      toolRegistry.register(
        {
          name: 'test_tool',
          description: 'Test tool',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        async () => 'result'
      );

      const tools = toolRegistry.list();
      expect(tools).toHaveLength(1);
      expect(tools[0]?.name).toBe('test_tool');
    });
  });

  describe('Resource Registry Integration', () => {
    test('should register and read resource', async () => {
      resourceRegistry.register({
        uri: 'resource://test',
        name: 'test',
        mimeType: 'text/plain',
        provider: async () => 'test content',
      });

      const result = await resourceRegistry.read('resource://test');
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0]?.text).toBe('test content');
    });

    test('should list registered resources', () => {
      resourceRegistry.register({
        uri: 'resource://test',
        name: 'test',
        mimeType: 'text/plain',
        provider: async () => 'test content',
      });

      const resources = resourceRegistry.list();
      expect(resources).toHaveLength(1);
      expect(resources[0]?.name).toBe('test');
    });
  });

  describe('Logger Integration', () => {
    test('should create child logger with component context', () => {
      const componentLogger = logger.child({ component: 'TestComponent' });
      expect(componentLogger).toBeDefined();

      // Should not throw
      expect(() => {
        componentLogger.info('Test message');
        componentLogger.debug('Debug message');
        componentLogger.warn('Warning message');
      }).not.toThrow();
    });

    test('should handle error logging', () => {
      const error = new Error('Test error');
      expect(() => logger.error(error)).not.toThrow();
    });
  });
});
