/**
 * Log Formatter Utilities
 * Utilities for formatting log messages and context
 */

import type { LogContext, ErrorWithContext } from '../types/logger.js';

/**
 * Serialize an error with full context and stack trace
 */
export function serializeError(error: Error | ErrorWithContext): Record<string, unknown> {
  const serialized: Record<string, unknown> = {
    message: error.message,
    name: error.name,
    stack: error.stack,
  };

  if ('context' in error && error.context) {
    serialized.context = error.context;
  }

  if ('code' in error && error.code) {
    serialized.code = error.code;
  }

  if ('statusCode' in error && error.statusCode) {
    serialized.statusCode = error.statusCode;
  }

  // Include any additional enumerable properties
  for (const key of Object.keys(error)) {
    if (!(key in serialized)) {
      serialized[key] = (error as any)[key];
    }
  }

  return serialized;
}

/**
 * Merge log contexts with conflict resolution
 */
export function mergeContexts(...contexts: (LogContext | undefined)[]): LogContext {
  const merged: LogContext = {};

  for (const context of contexts) {
    if (!context) continue;

    // Merge non-metadata fields (last wins)
    if (context.requestId) merged.requestId = context.requestId;
    if (context.correlationId) merged.correlationId = context.correlationId;
    if (context.userId) merged.userId = context.userId;
    if (context.operation) merged.operation = context.operation;

    // Deep merge metadata
    if (context.metadata) {
      merged.metadata = {
        ...merged.metadata,
        ...context.metadata,
      };
    }
  }

  return merged;
}

/**
 * Sanitize sensitive data from log context
 */
export function sanitizeContext(context: LogContext, redactPaths: string[] = []): LogContext {
  const sanitized = { ...context };

  // Default redaction patterns
  const defaultRedactPatterns = [
    /password/i,
    /secret/i,
    /token/i,
    /apikey/i,
    /api_key/i,
    /authorization/i,
    /bearer/i,
  ];

  // Redact metadata if present
  if (sanitized.metadata) {
    const cleanMetadata: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(sanitized.metadata)) {
      const shouldRedact =
        defaultRedactPatterns.some((pattern) => pattern.test(key)) ||
        redactPaths.includes(key);

      cleanMetadata[key] = shouldRedact ? '[REDACTED]' : value;
    }

    sanitized.metadata = cleanMetadata;
  }

  return sanitized;
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1) {
    return `${(milliseconds * 1000).toFixed(2)}μs`;
  }
  if (milliseconds < 1000) {
    return `${milliseconds.toFixed(2)}ms`;
  }
  if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(2)}s`;
  }
  return `${(milliseconds / 60000).toFixed(2)}m`;
}

/**
 * Format memory size in human-readable format
 */
export function formatMemory(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)}${units[unitIndex]}`;
}

/**
 * Create a correlation ID for request tracing
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Extract context from an error if it exists
 */
export function extractErrorContext(error: Error | ErrorWithContext): LogContext | undefined {
  if ('context' in error && error.context) {
    return error.context;
  }
  return undefined;
}

/**
 * Format log message with context interpolation
 */
export function formatMessage(template: string, context: LogContext): string {
  let message = template;

  // Replace placeholders with context values
  if (context.requestId) {
    message = message.replace('{requestId}', context.requestId);
  }
  if (context.correlationId) {
    message = message.replace('{correlationId}', context.correlationId);
  }
  if (context.userId) {
    message = message.replace('{userId}', context.userId);
  }
  if (context.operation) {
    message = message.replace('{operation}', context.operation);
  }

  return message;
}
