/**
 * Tests for logger utility
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { createLogger, getLogger, setLogger } from './logger.js';

describe('createLogger', () => {
  test('should create logger with info level', () => {
    const logger = createLogger({ logLevel: 'info', prettyLogs: false });
    expect(logger).toBeDefined();
    expect(logger.info).toBeFunction();
    expect(logger.error).toBeFunction();
    expect(logger.debug).toBeFunction();
  });

  test('should create logger with debug level', () => {
    const logger = createLogger({ logLevel: 'debug', prettyLogs: false });
    expect(logger).toBeDefined();
  });

  test('should create child logger', () => {
    const logger = createLogger({ logLevel: 'info', prettyLogs: false });
    const child = logger.child({ component: 'test' });
    expect(child).toBeDefined();
    expect(child.info).toBeFunction();
  });

  test('should handle error objects', () => {
    const logger = createLogger({ logLevel: 'info', prettyLogs: false });
    const error = new Error('Test error');
    expect(() => logger.error(error)).not.toThrow();
  });

  test('should handle string messages', () => {
    const logger = createLogger({ logLevel: 'info', prettyLogs: false });
    expect(() => logger.info('Test message')).not.toThrow();
    expect(() => logger.debug('Debug message')).not.toThrow();
    expect(() => logger.warn('Warning message')).not.toThrow();
  });
});

describe('getLogger', () => {
  afterEach(() => {
    // Reset default logger
    setLogger(createLogger({ logLevel: 'info', prettyLogs: false }));
  });

  test('should return default logger', () => {
    const logger = getLogger();
    expect(logger).toBeDefined();
  });

  test('should return same instance on multiple calls', () => {
    const logger1 = getLogger();
    const logger2 = getLogger();
    expect(logger1).toBe(logger2);
  });
});

describe('setLogger', () => {
  test('should set custom logger', () => {
    const customLogger = createLogger({ logLevel: 'debug', prettyLogs: false });
    setLogger(customLogger);
    const logger = getLogger();
    expect(logger).toBe(customLogger);
  });
});
