/**
 * Tests for tool registry
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { createToolRegistry } from './registry.js';
import { MCPError, ErrorCodes } from '../types/server.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

describe('ToolRegistry', () => {
  let registry: ReturnType<typeof createToolRegistry>;

  beforeEach(() => {
    registry = createToolRegistry();
  });

  const createTestTool = (name: string): Tool => ({
    name,
    description: `Test tool: ${name}`,
    inputSchema: {
      type: 'object',
      properties: {
        input: { type: 'string' },
      },
      required: [],
    },
  });

  describe('register', () => {
    test('should register a tool', () => {
      const tool = createTestTool('test_tool');
      const handler = async () => ({ result: 'success' });

      registry.register(tool, handler);

      expect(registry.has('test_tool')).toBe(true);
      expect(registry.size).toBe(1);
    });

    test('should throw on duplicate registration', () => {
      const tool = createTestTool('test_tool');
      const handler = async () => ({ result: 'success' });

      registry.register(tool, handler);

      expect(() => registry.register(tool, handler)).toThrow(MCPError);
    });

    test('should throw on invalid tool definition', () => {
      const handler = async () => ({ result: 'success' });

      expect(() =>
        registry.register({ name: '', description: 'test', inputSchema: { type: 'object' } }, handler)
      ).toThrow(MCPError);
    });

    test('should throw on missing description', () => {
      const handler = async () => ({ result: 'success' });

      expect(() =>
        registry.register({ name: 'test', description: '', inputSchema: { type: 'object' } } as Tool, handler)
      ).toThrow(MCPError);
    });

    test('should throw on missing inputSchema', () => {
      const handler = async () => ({ result: 'success' });

      expect(() => registry.register({ name: 'test', description: 'test' } as Tool, handler)).toThrow(MCPError);
    });

    test('should throw on non-object inputSchema', () => {
      const handler = async () => ({ result: 'success' });

      expect(() =>
        registry.register({ name: 'test', description: 'test', inputSchema: { type: 'string' } } as unknown as Tool, handler)
      ).toThrow(MCPError);
    });
  });

  describe('registerMany', () => {
    test('should register multiple tools', () => {
      const tools = [
        { definition: createTestTool('tool1'), handler: async () => 'result1' },
        { definition: createTestTool('tool2'), handler: async () => 'result2' },
      ];

      registry.registerMany(tools);

      expect(registry.size).toBe(2);
      expect(registry.has('tool1')).toBe(true);
      expect(registry.has('tool2')).toBe(true);
    });
  });

  describe('get', () => {
    test('should retrieve registered tool', () => {
      const tool = createTestTool('test_tool');
      const handler = async () => ({ result: 'success' });

      registry.register(tool, handler);

      const retrieved = registry.get('test_tool');
      expect(retrieved).toBeDefined();
      expect(retrieved?.definition.name).toBe('test_tool');
    });

    test('should return undefined for unregistered tool', () => {
      const retrieved = registry.get('nonexistent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('list', () => {
    test('should list all registered tools', () => {
      registry.register(createTestTool('tool1'), async () => 'result1');
      registry.register(createTestTool('tool2'), async () => 'result2');

      const tools = registry.list();
      expect(tools).toHaveLength(2);
      expect(tools.map((t) => t.name)).toContain('tool1');
      expect(tools.map((t) => t.name)).toContain('tool2');
    });

    test('should return empty array when no tools registered', () => {
      const tools = registry.list();
      expect(tools).toHaveLength(0);
    });
  });

  describe('unregister', () => {
    test('should unregister a tool', () => {
      registry.register(createTestTool('test_tool'), async () => 'result');

      const result = registry.unregister('test_tool');
      expect(result).toBe(true);
      expect(registry.has('test_tool')).toBe(false);
    });

    test('should return false for unregistered tool', () => {
      const result = registry.unregister('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    test('should clear all tools', () => {
      registry.register(createTestTool('tool1'), async () => 'result1');
      registry.register(createTestTool('tool2'), async () => 'result2');

      registry.clear();

      expect(registry.size).toBe(0);
      expect(registry.list()).toHaveLength(0);
    });
  });

  describe('execute', () => {
    test('should execute registered tool', async () => {
      const handler = async (args: unknown) => {
        const typedArgs = args as { input: string };
        return { result: `processed: ${typedArgs.input}` };
      };
      registry.register(createTestTool('test_tool'), handler);

      const result = await registry.execute('test_tool', { input: 'test' });
      expect(result).toEqual({ result: 'processed: test' });
    });

    test('should throw on unregistered tool', async () => {
      await expect(registry.execute('nonexistent', {})).rejects.toThrow(MCPError);
    });

    test('should wrap handler errors in MCPError', async () => {
      const handler = async () => {
        throw new Error('Handler error');
      };
      registry.register(createTestTool('test_tool'), handler);

      await expect(registry.execute('test_tool', {})).rejects.toThrow(MCPError);
    });

    test('should preserve MCPError from handler', async () => {
      const handler = async () => {
        throw new MCPError('Custom error', ErrorCodes.INVALID_PARAMS);
      };
      registry.register(createTestTool('test_tool'), handler);

      try {
        await registry.execute('test_tool', {});
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(MCPError);
        expect((error as MCPError).code).toBe(ErrorCodes.INVALID_PARAMS);
      }
    });

    test('should handle synchronous handlers', async () => {
      const handler = () => ({ result: 'sync result' });
      registry.register(createTestTool('test_tool'), handler);

      const result = await registry.execute('test_tool', {});
      expect(result).toEqual({ result: 'sync result' });
    });
  });
});
