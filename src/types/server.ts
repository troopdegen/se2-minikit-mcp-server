/**
 * Core server type definitions for SE2-Minikit MCP Server
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Tool handler function type
 */
export type ToolHandler<TArgs = unknown, TResult = unknown> = (
  args: TArgs
) => Promise<TResult> | TResult;

/**
 * Tool definition with handler
 */
export interface ToolDefinition {
  /** Tool metadata (name, description, schema) */
  definition: Tool;
  /** Handler function to execute the tool */
  handler: ToolHandler;
}

/**
 * Resource definition
 */
export interface ResourceDefinition {
  /** Unique resource URI */
  uri: string;
  /** Human-readable name */
  name: string;
  /** Resource description */
  description?: string;
  /** MIME type of resource content */
  mimeType: string;
  /** Function to retrieve resource content */
  provider: () => Promise<string | Uint8Array>;
}

/**
 * Server configuration
 */
export interface ServerConfig {
  /** Server name */
  name: string;
  /** Server version */
  version: string;
  /** Log level (trace, debug, info, warn, error, fatal) */
  logLevel: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  /** Enable pretty printing for logs (development) */
  prettyLogs: boolean;
  /** Environment (development, production, test) */
  environment: 'development' | 'production' | 'test';
}

/**
 * Error with additional context for MCP protocol
 */
export class MCPError extends Error {
  constructor(
    message: string,
    public readonly code: number = -32603,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

/**
 * Standard MCP error codes
 */
export const ErrorCodes = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  SERVER_ERROR_START: -32000,
  SERVER_ERROR_END: -32099,
} as const;

/**
 * Tool execution result wrapper
 */
export interface ToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

/**
 * Logger interface
 */
export interface Logger {
  trace(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string | Error, ...args: unknown[]): void;
  fatal(message: string | Error, ...args: unknown[]): void;
  child(bindings: Record<string, unknown>): Logger;
}
