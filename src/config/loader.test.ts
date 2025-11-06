/**
 * Tests for configuration loader
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { loadConfig, getConfigValue } from './loader.js';

describe('loadConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  test('should load config with defaults', () => {
    const config = loadConfig();
    expect(config.name).toBe('se2-minikit-mcp-server');
    expect(config.version).toBe('0.0.1');
    // Bun sets NODE_ENV to 'test' during test runs
    expect(['development', 'test']).toContain(config.environment);
  });

  test('should use environment variables when set', () => {
    process.env['SERVER_NAME'] = 'custom-server';
    process.env['SERVER_VERSION'] = '1.0.0';
    process.env['NODE_ENV'] = 'production';
    process.env['LOG_LEVEL'] = 'warn';

    const config = loadConfig();
    expect(config.name).toBe('custom-server');
    expect(config.version).toBe('1.0.0');
    expect(config.environment).toBe('production');
    expect(config.logLevel).toBe('warn');
  });

  test('should use production defaults for production environment', () => {
    process.env['NODE_ENV'] = 'production';
    const config = loadConfig();
    expect(config.logLevel).toBe('info');
    expect(config.prettyLogs).toBe(false);
  });

  test('should use development defaults for development environment', () => {
    process.env['NODE_ENV'] = 'development';
    const config = loadConfig();
    expect(config.prettyLogs).toBe(true);
  });

  test('should throw on invalid log level', () => {
    process.env['LOG_LEVEL'] = 'invalid';
    expect(() => loadConfig()).toThrow();
  });

  test('should throw on invalid environment', () => {
    process.env['NODE_ENV'] = 'invalid';
    expect(() => loadConfig()).toThrow();
  });

  test('should accept valid log levels', () => {
    const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
    for (const level of levels) {
      process.env['LOG_LEVEL'] = level;
      const config = loadConfig();
      expect(config.logLevel).toBe(level);
    }
  });
});

describe('getConfigValue', () => {
  test('should return specific config value', () => {
    const name = getConfigValue('name');
    expect(typeof name).toBe('string');

    const logLevel = getConfigValue('logLevel');
    expect(typeof logLevel).toBe('string');
  });
});
