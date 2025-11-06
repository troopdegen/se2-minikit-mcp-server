/**
 * Tests for resource registry
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { createResourceRegistry } from './registry.js';
import { MCPError, ErrorCodes } from '../types/server.js';
import type { ResourceDefinition } from '../types/server.js';

describe('ResourceRegistry', () => {
  let registry: ReturnType<typeof createResourceRegistry>;

  beforeEach(() => {
    registry = createResourceRegistry();
  });

  const createTestResource = (name: string): ResourceDefinition => ({
    uri: `resource://${name}`,
    name,
    description: `Test resource: ${name}`,
    mimeType: 'text/plain',
    provider: async () => `Content of ${name}`,
  });

  describe('register', () => {
    test('should register a resource', () => {
      const resource = createTestResource('test_resource');

      registry.register(resource);

      expect(registry.has('resource://test_resource')).toBe(true);
      expect(registry.size).toBe(1);
    });

    test('should throw on duplicate registration', () => {
      const resource = createTestResource('test_resource');

      registry.register(resource);

      expect(() => registry.register(resource)).toThrow(MCPError);
    });

    test('should throw on invalid URI', () => {
      const resource = { ...createTestResource('test'), uri: 'invalid-uri' };

      expect(() => registry.register(resource)).toThrow(MCPError);
    });

    test('should throw on missing name', () => {
      const resource = { ...createTestResource('test'), name: '' };

      expect(() => registry.register(resource)).toThrow(MCPError);
    });

    test('should throw on missing mimeType', () => {
      const resource = { ...createTestResource('test'), mimeType: '' };

      expect(() => registry.register(resource)).toThrow(MCPError);
    });

    test('should throw on missing provider', () => {
      const resource = { ...createTestResource('test'), provider: null as any };

      expect(() => registry.register(resource)).toThrow(MCPError);
    });
  });

  describe('registerMany', () => {
    test('should register multiple resources', () => {
      const resources = [createTestResource('resource1'), createTestResource('resource2')];

      registry.registerMany(resources);

      expect(registry.size).toBe(2);
      expect(registry.has('resource://resource1')).toBe(true);
      expect(registry.has('resource://resource2')).toBe(true);
    });
  });

  describe('get', () => {
    test('should retrieve registered resource', () => {
      const resource = createTestResource('test_resource');

      registry.register(resource);

      const retrieved = registry.get('resource://test_resource');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('test_resource');
    });

    test('should return undefined for unregistered resource', () => {
      const retrieved = registry.get('resource://nonexistent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('list', () => {
    test('should list all registered resources', () => {
      registry.register(createTestResource('resource1'));
      registry.register(createTestResource('resource2'));

      const resources = registry.list();
      expect(resources).toHaveLength(2);
      expect(resources.map((r) => r.name)).toContain('resource1');
      expect(resources.map((r) => r.name)).toContain('resource2');
    });

    test('should return empty array when no resources registered', () => {
      const resources = registry.list();
      expect(resources).toHaveLength(0);
    });

    test('should not include provider in listed resources', () => {
      registry.register(createTestResource('resource1'));

      const resources = registry.list();
      expect('provider' in resources[0]!).toBe(false);
    });
  });

  describe('unregister', () => {
    test('should unregister a resource', () => {
      registry.register(createTestResource('test_resource'));

      const result = registry.unregister('resource://test_resource');
      expect(result).toBe(true);
      expect(registry.has('resource://test_resource')).toBe(false);
    });

    test('should return false for unregistered resource', () => {
      const result = registry.unregister('resource://nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    test('should clear all resources', () => {
      registry.register(createTestResource('resource1'));
      registry.register(createTestResource('resource2'));

      registry.clear();

      expect(registry.size).toBe(0);
      expect(registry.list()).toHaveLength(0);
    });
  });

  describe('read', () => {
    test('should read text resource', async () => {
      registry.register(createTestResource('test_resource'));

      const result = await registry.read('resource://test_resource');
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0]?.text).toBe('Content of test_resource');
      expect(result.contents[0]?.mimeType).toBe('text/plain');
    });

    test('should read binary resource', async () => {
      const binaryResource: ResourceDefinition = {
        uri: 'resource://binary',
        name: 'binary',
        mimeType: 'application/octet-stream',
        provider: async () => new Uint8Array([1, 2, 3, 4]),
      };

      registry.register(binaryResource);

      const result = await registry.read('resource://binary');
      expect(result.contents).toHaveLength(1);
      expect(result.contents[0]?.blob).toBeDefined();
      expect(result.contents[0]?.text).toBeUndefined();
    });

    test('should throw on unregistered resource', async () => {
      await expect(registry.read('resource://nonexistent')).rejects.toThrow(MCPError);
    });

    test('should wrap provider errors in MCPError', async () => {
      const failingResource: ResourceDefinition = {
        uri: 'resource://failing',
        name: 'failing',
        mimeType: 'text/plain',
        provider: async () => {
          throw new Error('Provider error');
        },
      };

      registry.register(failingResource);

      await expect(registry.read('resource://failing')).rejects.toThrow(MCPError);
    });

    test('should preserve MCPError from provider', async () => {
      const failingResource: ResourceDefinition = {
        uri: 'resource://failing',
        name: 'failing',
        mimeType: 'text/plain',
        provider: async () => {
          throw new MCPError('Custom error', ErrorCodes.INVALID_PARAMS);
        },
      };

      registry.register(failingResource);

      try {
        await registry.read('resource://failing');
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(MCPError);
        expect((error as MCPError).code).toBe(ErrorCodes.INVALID_PARAMS);
      }
    });
  });
});
