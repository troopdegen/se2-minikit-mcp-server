/**
 * Tests for log formatter utilities
 */

import { describe, it, expect } from 'bun:test';
import {
  serializeError,
  mergeContexts,
  sanitizeContext,
  formatDuration,
  formatMemory,
  generateCorrelationId,
  extractErrorContext,
  formatMessage,
} from '../../../src/utils/log-formatter.js';
import type { ErrorWithContext, LogContext } from '../../../src/types/logger.js';

describe('serializeError', () => {
  it('should serialize a basic error', () => {
    const error = new Error('Test error');
    const serialized = serializeError(error);

    expect(serialized.message).toBe('Test error');
    expect(serialized.name).toBe('Error');
    expect(serialized.stack).toBeDefined();
  });

  it('should include context from ErrorWithContext', () => {
    const error: ErrorWithContext = new Error('Test error');
    error.context = { requestId: 'req-123', userId: 'user-456' };
    error.code = 'ERR_TEST';
    error.statusCode = 500;

    const serialized = serializeError(error);

    expect(serialized.context).toEqual({ requestId: 'req-123', userId: 'user-456' });
    expect(serialized.code).toBe('ERR_TEST');
    expect(serialized.statusCode).toBe(500);
  });

  it('should include additional enumerable properties', () => {
    const error = new Error('Test error') as Error & { customProp: string };
    error.customProp = 'custom value';

    const serialized = serializeError(error);

    expect(serialized.customProp).toBe('custom value');
  });
});

describe('mergeContexts', () => {
  it('should merge multiple contexts', () => {
    const context1: LogContext = { requestId: 'req-1', userId: 'user-1' };
    const context2: LogContext = { correlationId: 'corr-1', operation: 'test' };
    const context3: LogContext = { metadata: { key: 'value' } };

    const merged = mergeContexts(context1, context2, context3);

    expect(merged.requestId).toBe('req-1');
    expect(merged.userId).toBe('user-1');
    expect(merged.correlationId).toBe('corr-1');
    expect(merged.operation).toBe('test');
    expect(merged.metadata).toEqual({ key: 'value' });
  });

  it('should handle undefined contexts', () => {
    const context1: LogContext = { requestId: 'req-1' };
    const merged = mergeContexts(context1, undefined, undefined);

    expect(merged.requestId).toBe('req-1');
  });

  it('should merge metadata deeply', () => {
    const context1: LogContext = { metadata: { a: 1, b: 2 } };
    const context2: LogContext = { metadata: { b: 3, c: 4 } };

    const merged = mergeContexts(context1, context2);

    expect(merged.metadata).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('should use last value for overlapping fields', () => {
    const context1: LogContext = { requestId: 'req-1', userId: 'user-1' };
    const context2: LogContext = { requestId: 'req-2' };

    const merged = mergeContexts(context1, context2);

    expect(merged.requestId).toBe('req-2');
    expect(merged.userId).toBe('user-1');
  });
});

describe('sanitizeContext', () => {
  it('should redact sensitive fields by default', () => {
    const context: LogContext = {
      requestId: 'req-1',
      metadata: {
        password: 'secret123',
        apiKey: 'key123',
        token: 'token123',
        normalField: 'visible',
      },
    };

    const sanitized = sanitizeContext(context);

    expect(sanitized.requestId).toBe('req-1');
    expect(sanitized.metadata?.password).toBe('[REDACTED]');
    expect(sanitized.metadata?.apiKey).toBe('[REDACTED]');
    expect(sanitized.metadata?.token).toBe('[REDACTED]');
    expect(sanitized.metadata?.normalField).toBe('visible');
  });

  it('should redact custom paths', () => {
    const context: LogContext = {
      metadata: {
        customSecret: 'secret',
        normalField: 'visible',
      },
    };

    const sanitized = sanitizeContext(context, ['customSecret']);

    expect(sanitized.metadata?.customSecret).toBe('[REDACTED]');
    expect(sanitized.metadata?.normalField).toBe('visible');
  });

  it('should handle context without metadata', () => {
    const context: LogContext = { requestId: 'req-1' };
    const sanitized = sanitizeContext(context);

    expect(sanitized.requestId).toBe('req-1');
    expect(sanitized.metadata).toBeUndefined();
  });
});

describe('formatDuration', () => {
  it('should format microseconds', () => {
    expect(formatDuration(0.5)).toBe('500.00μs');
    expect(formatDuration(0.001)).toBe('1.00μs');
  });

  it('should format milliseconds', () => {
    expect(formatDuration(1)).toBe('1.00ms');
    expect(formatDuration(500)).toBe('500.00ms');
    expect(formatDuration(999)).toBe('999.00ms');
  });

  it('should format seconds', () => {
    expect(formatDuration(1000)).toBe('1.00s');
    expect(formatDuration(5500)).toBe('5.50s');
    expect(formatDuration(30000)).toBe('30.00s');
  });

  it('should format minutes', () => {
    expect(formatDuration(60000)).toBe('1.00m');
    expect(formatDuration(120000)).toBe('2.00m');
    expect(formatDuration(90000)).toBe('1.50m');
  });
});

describe('formatMemory', () => {
  it('should format bytes', () => {
    expect(formatMemory(512)).toBe('512.00B');
    expect(formatMemory(1023)).toBe('1023.00B');
  });

  it('should format kilobytes', () => {
    expect(formatMemory(1024)).toBe('1.00KB');
    expect(formatMemory(2048)).toBe('2.00KB');
    expect(formatMemory(1536)).toBe('1.50KB');
  });

  it('should format megabytes', () => {
    expect(formatMemory(1048576)).toBe('1.00MB');
    expect(formatMemory(5242880)).toBe('5.00MB');
  });

  it('should format gigabytes', () => {
    expect(formatMemory(1073741824)).toBe('1.00GB');
    expect(formatMemory(2147483648)).toBe('2.00GB');
  });
});

describe('generateCorrelationId', () => {
  it('should generate a unique correlation ID', () => {
    const id1 = generateCorrelationId();
    const id2 = generateCorrelationId();

    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
  });

  it('should match expected format', () => {
    const id = generateCorrelationId();
    expect(id).toMatch(/^\d+-[a-z0-9]+$/);
  });
});

describe('extractErrorContext', () => {
  it('should extract context from ErrorWithContext', () => {
    const error: ErrorWithContext = new Error('Test error');
    error.context = { requestId: 'req-123', userId: 'user-456' };

    const context = extractErrorContext(error);

    expect(context).toEqual({ requestId: 'req-123', userId: 'user-456' });
  });

  it('should return undefined for basic Error', () => {
    const error = new Error('Test error');
    const context = extractErrorContext(error);

    expect(context).toBeUndefined();
  });
});

describe('formatMessage', () => {
  it('should replace context placeholders', () => {
    const context: LogContext = {
      requestId: 'req-123',
      correlationId: 'corr-456',
      userId: 'user-789',
      operation: 'testOp',
    };

    const message = formatMessage(
      'Request {requestId} with correlation {correlationId} for user {userId} operation {operation}',
      context
    );

    expect(message).toBe('Request req-123 with correlation corr-456 for user user-789 operation testOp');
  });

  it('should handle missing context values', () => {
    const context: LogContext = { requestId: 'req-123' };
    const message = formatMessage('Request {requestId} user {userId}', context);

    expect(message).toBe('Request req-123 user {userId}');
  });

  it('should return original message if no placeholders', () => {
    const context: LogContext = { requestId: 'req-123' };
    const message = formatMessage('Simple message', context);

    expect(message).toBe('Simple message');
  });
});
