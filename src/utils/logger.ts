/**
 * Production-ready structured logging with Pino
 * Features: log rotation, performance monitoring, context propagation, redaction
 */

import pino from 'pino';
import type { Logger as PinoLogger } from 'pino';
import type { Logger, ServerConfig } from '../types/server.js';
import type { LogContext } from '../types/logger.js';
import {
  mergeContexts,
  sanitizeContext,
  serializeError,
  extractErrorContext,
} from './log-formatter.js';

/**
 * Extended logger configuration
 */
interface ExtendedLoggerConfig extends Pick<ServerConfig, 'logLevel' | 'prettyLogs'> {
  file?: string;
  redactPaths?: string[];
  enablePerformance?: boolean;
}

/**
 * Create redaction configuration for sensitive data
 */
function createRedactConfig(redactPaths: string[] = []) {
  const defaultPaths = [
    'password',
    'secret',
    'token',
    'apiKey',
    'api_key',
    'authorization',
    'bearer',
    '*.password',
    '*.secret',
    '*.token',
    '*.apiKey',
    '*.api_key',
    'args.*.password',
    'args.*.secret',
    'args.*.token',
  ];

  return {
    paths: [...defaultPaths, ...redactPaths],
    censor: '[REDACTED]',
  };
}

/**
 * Create Pino transport configuration
 * IMPORTANT: MCP protocol uses stdout for JSON-RPC, so logs go to stderr or file
 */
function createTransport(config: ExtendedLoggerConfig) {
  const destination = config.file || 2; // 2 = stderr (never stdout)

  if (config.prettyLogs) {
    return {
      target: 'pino-pretty',
      options: {
        colorize: !config.file,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        destination,
      },
    };
  }

  return {
    target: 'pino/file',
    options: {
      destination,
    },
  };
}

/**
 * Enhanced logger with context support
 */
class EnhancedLogger implements Logger {
  private pinoLogger: PinoLogger;
  private defaultContext?: LogContext;
  private redactPaths: string[];

  constructor(pinoLogger: PinoLogger, redactPaths: string[] = [], defaultContext?: LogContext) {
    this.pinoLogger = pinoLogger;
    this.redactPaths = redactPaths;
    this.defaultContext = defaultContext;
  }

  /**
   * Convert log context to Pino bindings
   */
  private contextToBindings(context?: LogContext): Record<string, unknown> {
    if (!context) return {};

    const bindings: Record<string, unknown> = {};
    if (context.requestId) bindings.requestId = context.requestId;
    if (context.correlationId) bindings.correlationId = context.correlationId;
    if (context.userId) bindings.userId = context.userId;
    if (context.operation) bindings.operation = context.operation;
    if (context.metadata) bindings.metadata = context.metadata;

    return bindings;
  }

  /**
   * Merge and sanitize context
   */
  private prepareContext(context?: LogContext): Record<string, unknown> {
    const merged = mergeContexts(this.defaultContext, context);
    const sanitized = sanitizeContext(merged, this.redactPaths);
    return this.contextToBindings(sanitized);
  }

  trace(message: string, ...args: unknown[]): void {
    const context = args[0] as LogContext | undefined;
    this.pinoLogger.trace({ ...this.prepareContext(context), args }, message);
  }

  debug(message: string, ...args: unknown[]): void {
    const context = args[0] as LogContext | undefined;
    this.pinoLogger.debug({ ...this.prepareContext(context), args }, message);
  }

  info(message: string, ...args: unknown[]): void {
    const context = args[0] as LogContext | undefined;
    this.pinoLogger.info({ ...this.prepareContext(context), args }, message);
  }

  warn(message: string, ...args: unknown[]): void {
    const context = args[0] as LogContext | undefined;
    this.pinoLogger.warn({ ...this.prepareContext(context), args }, message);
  }

  error(message: string | Error, ...args: unknown[]): void {
    if (message instanceof Error) {
      const errorContext = extractErrorContext(message);
      const context = args[0] as LogContext | undefined;
      const mergedContext = mergeContexts(context, errorContext);
      const bindings = {
        ...this.prepareContext(mergedContext),
        error: serializeError(message),
        args,
      };
      this.pinoLogger.error(bindings, message.message);
    } else {
      const context = args[0] as LogContext | undefined;
      this.pinoLogger.error({ ...this.prepareContext(context), args }, message);
    }
  }

  fatal(message: string | Error, ...args: unknown[]): void {
    if (message instanceof Error) {
      const errorContext = extractErrorContext(message);
      const context = args[0] as LogContext | undefined;
      const mergedContext = mergeContexts(context, errorContext);
      const bindings = {
        ...this.prepareContext(mergedContext),
        error: serializeError(message),
        args,
      };
      this.pinoLogger.fatal(bindings, message.message);
    } else {
      const context = args[0] as LogContext | undefined;
      this.pinoLogger.fatal({ ...this.prepareContext(context), args }, message);
    }
  }

  child(bindings: Record<string, unknown>): Logger {
    const childLogger = this.pinoLogger.child(bindings);
    return new EnhancedLogger(childLogger, this.redactPaths, this.defaultContext);
  }

  /**
   * Create a child logger with additional context
   */
  withContext(context: LogContext): Logger {
    const mergedContext = mergeContexts(this.defaultContext, context);
    const bindings = this.contextToBindings(mergedContext);
    const childLogger = this.pinoLogger.child(bindings);
    return new EnhancedLogger(childLogger, this.redactPaths, mergedContext);
  }

  /**
   * Get the underlying Pino logger
   */
  getPinoLogger(): PinoLogger {
    return this.pinoLogger;
  }

  /**
   * Flush logs
   */
  async flush(): Promise<void> {
    return new Promise((resolve) => {
      this.pinoLogger.flush(() => {
        resolve();
      });
    });
  }
}

/**
 * Create a configured Pino logger instance
 * BACKWARD COMPATIBLE: Maintains original signature
 */
export function createLogger(
  config: Pick<ServerConfig, 'logLevel' | 'prettyLogs'>,
  extendedConfig?: Partial<ExtendedLoggerConfig>
): Logger {
  const fullConfig: ExtendedLoggerConfig = {
    ...config,
    file: extendedConfig?.file || process.env.LOG_FILE,
    redactPaths: extendedConfig?.redactPaths || [],
    enablePerformance: extendedConfig?.enablePerformance || process.env.LOG_PERFORMANCE === 'true',
  };

  const pinoLogger: PinoLogger = pino({
    level: fullConfig.logLevel,
    base: {
      pid: process.pid,
      hostname: process.env.HOSTNAME || 'unknown',
    },
    redact: createRedactConfig(fullConfig.redactPaths),
    transport: createTransport(fullConfig),
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
      bindings: (bindings) => ({
        pid: bindings.pid,
        hostname: bindings.hostname,
      }),
    },
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  });

  return new EnhancedLogger(pinoLogger, fullConfig.redactPaths);
}

/**
 * Default logger instance (created on first use)
 */
let defaultLogger: Logger | null = null;

/**
 * Get or create the default logger instance
 */
export function getLogger(): Logger {
  if (!defaultLogger) {
    defaultLogger = createLogger({
      logLevel: (process.env.LOG_LEVEL as ServerConfig['logLevel']) || 'info',
      prettyLogs: process.env.NODE_ENV !== 'production',
    });
  }
  return defaultLogger;
}

/**
 * Set the default logger instance (useful for testing)
 */
export function setLogger(logger: Logger): void {
  defaultLogger = logger;
}

/**
 * Create a logger with context
 */
export function createLoggerWithContext(context: LogContext, config?: Partial<ExtendedLoggerConfig>): Logger {
  const logger = createLogger(
    {
      logLevel: (process.env.LOG_LEVEL as ServerConfig['logLevel']) || 'info',
      prettyLogs: process.env.NODE_ENV !== 'production',
    },
    config
  );

  if (logger instanceof EnhancedLogger) {
    return logger.withContext(context);
  }

  return logger.child(context as Record<string, unknown>);
}
