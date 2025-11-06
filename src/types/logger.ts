/**
 * Logger Types
 * TypeScript types and interfaces for the logging infrastructure
 */

import type { Level } from 'pino';

/**
 * Log levels enumeration
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * Log format types
 */
export enum LogFormat {
  JSON = 'json',
  PRETTY = 'pretty',
}

/**
 * Log rotation strategies
 */
export enum LogRotation {
  DAILY = 'daily',
  SIZE = 'size',
  NONE = 'none',
}

/**
 * Logger configuration interface
 */
export interface LoggerConfig {
  level: Level;
  format: LogFormat;
  file?: string;
  rotation?: LogRotation;
  maxFiles?: number;
  maxSize?: string;
  enablePerformance?: boolean;
  redactPaths?: string[];
  base?: Record<string, unknown>;
}

/**
 * Log context for request tracing and correlation
 */
export interface LogContext {
  requestId?: string;
  correlationId?: string;
  userId?: string;
  operation?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  duration: number;
  timestamp: number;
  operation: string;
  context?: LogContext;
  memory?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
}

/**
 * Timed operation result
 */
export interface TimedResult<T> {
  result: T;
  metrics: PerformanceMetrics;
}

/**
 * Error with context
 */
export interface ErrorWithContext extends Error {
  context?: LogContext;
  code?: string;
  statusCode?: number;
}

/**
 * Logger method types
 */
export type LogMethod = (
  message: string,
  context?: LogContext,
  ...args: unknown[]
) => void;

/**
 * Child logger options
 */
export interface ChildLoggerOptions {
  context?: LogContext;
  bindings?: Record<string, unknown>;
}
