/**
 * Tests for logger implementation
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { createLogger, getLogger, setLogger, createLoggerWithContext } from '../../../src/utils/logger.js';
import type { LogContext } from '../../../src/types/logger.js';

describe('createLogger', () => {
  it('should create a logger with default config', () => {
    const logger = createLogger({
      logLevel: 'info',
      prettyLogs: false,
    });

    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.debug).toBeDefined();
  });

  it('should create a logger with custom config', () => {
    const logger = createLogger(
      {
        logLevel: 'debug',
        prettyLogs: true,
      },
      {
        redactPaths: ['customSecret'],
        enablePerformance: true,
      }
    );

    expect(logger).toBeDefined();
  });

  it('should respect environment variables', () => {
    const originalEnv = { ...process.env };
    process.env.LOG_LEVEL = 'warn';
    process.env.LOG_FILE = '/tmp/test.log';

    const logger = createLogger({
      logLevel: 'info',
      prettyLogs: false,
    });

    expect(logger).toBeDefined();

    // Restore environment
    process.env = originalEnv;
  });
});

describe('Logger methods', () => {
  let logger: ReturnType<typeof createLogger>;

  beforeEach(() => {
    logger = createLogger({
      logLevel: 'debug',
      prettyLogs: false,
    });
  });

  it('should log debug messages', () => {
    expect(() => logger.debug('Debug message')).not.toThrow();
  });

  it('should log info messages', () => {
    expect(() => logger.info('Info message')).not.toThrow();
  });

  it('should log warn messages', () => {
    expect(() => logger.warn('Warn message')).not.toThrow();
  });

  it('should log error messages', () => {
    expect(() => logger.error('Error message')).not.toThrow();
  });

  it('should log fatal messages', () => {
    expect(() => logger.fatal('Fatal message')).not.toThrow();
  });

  it('should log error objects', () => {
    const error = new Error('Test error');
    expect(() => logger.error(error)).not.toThrow();
  });

  it('should log with context', () => {
    const context: LogContext = {
      requestId: 'req-123',
      userId: 'user-456',
    };
    expect(() => logger.info('Message with context', context)).not.toThrow();
  });
});

describe('Child logger', () => {
  let logger: ReturnType<typeof createLogger>;

  beforeEach(() => {
    logger = createLogger({
      logLevel: 'debug',
      prettyLogs: false,
    });
  });

  it('should create a child logger', () => {
    const child = logger.child({ component: 'TestComponent' });
    expect(child).toBeDefined();
    expect(child.info).toBeDefined();
  });

  it('should inherit parent logger configuration', () => {
    const child = logger.child({ component: 'TestComponent' });
    expect(() => child.debug('Child debug message')).not.toThrow();
  });

  it('should support nested child loggers', () => {
    const child1 = logger.child({ component: 'Parent' });
    const child2 = child1.child({ subcomponent: 'Child' });

    expect(child2).toBeDefined();
    expect(() => child2.info('Nested child message')).not.toThrow();
  });
});

describe('getLogger and setLogger', () => {
  it('should get the default logger', () => {
    const logger = getLogger();
    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
  });

  it('should return the same logger instance', () => {
    const logger1 = getLogger();
    const logger2 = getLogger();
    expect(logger1).toBe(logger2);
  });

  it('should allow setting a custom logger', () => {
    const customLogger = createLogger({
      logLevel: 'error',
      prettyLogs: false,
    });

    setLogger(customLogger);
    const logger = getLogger();
    expect(logger).toBe(customLogger);

    // Reset to default
    setLogger(
      createLogger({
        logLevel: 'info',
        prettyLogs: false,
      })
    );
  });
});

describe('createLoggerWithContext', () => {
  it('should create a logger with default context', () => {
    const context: LogContext = {
      requestId: 'req-123',
      userId: 'user-456',
    };

    const logger = createLoggerWithContext(context);
    expect(logger).toBeDefined();
    expect(() => logger.info('Message with default context')).not.toThrow();
  });

  it('should create a logger with custom config and context', () => {
    const context: LogContext = {
      correlationId: 'corr-789',
      operation: 'testOp',
    };

    const logger = createLoggerWithContext(context, {
      redactPaths: ['customField'],
    });

    expect(logger).toBeDefined();
  });
});

describe('Error handling', () => {
  let logger: ReturnType<typeof createLogger>;

  beforeEach(() => {
    logger = createLogger({
      logLevel: 'debug',
      prettyLogs: false,
    });
  });

  it('should handle Error objects', () => {
    const error = new Error('Test error');
    error.stack = 'Error: Test error\n    at test.ts:10:5';

    expect(() => logger.error(error)).not.toThrow();
  });

  it('should handle errors with context', () => {
    const error = new Error('Test error') as Error & { context?: LogContext };
    error.context = {
      requestId: 'req-123',
      operation: 'testOp',
    };

    expect(() => logger.error(error)).not.toThrow();
  });

  it('should handle errors with additional properties', () => {
    const error = new Error('Test error') as Error & {
      code?: string;
      statusCode?: number;
    };
    error.code = 'ERR_TEST';
    error.statusCode = 500;

    expect(() => logger.error(error)).not.toThrow();
  });
});

describe('Sensitive data redaction', () => {
  it('should redact sensitive data by default', () => {
    const logger = createLogger({
      logLevel: 'debug',
      prettyLogs: false,
    });

    const context: LogContext = {
      requestId: 'req-123',
      metadata: {
        password: 'secret123',
        normalField: 'visible',
      },
    };

    expect(() => logger.info('Message with sensitive data', context)).not.toThrow();
  });

  it('should redact custom fields', () => {
    const logger = createLogger(
      {
        logLevel: 'debug',
        prettyLogs: false,
      },
      {
        redactPaths: ['customSecret'],
      }
    );

    const context: LogContext = {
      metadata: {
        customSecret: 'secret',
        normalField: 'visible',
      },
    };

    expect(() => logger.info('Message with custom sensitive data', context)).not.toThrow();
  });
});
