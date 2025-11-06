/**
 * Configuration loader for SE2-Minikit MCP Server
 * Loads and validates configuration from environment variables
 */

import { config as loadDotenv } from 'dotenv';
import type { ServerConfig } from '../types/server.js';

/**
 * Load environment variables from .env file
 */
export function loadEnvFile(): void {
  loadDotenv();
}

/**
 * Get environment variable with optional default
 */
function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Validate log level string
 */
function validateLogLevel(level: string): ServerConfig['logLevel'] {
  const validLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
  if (validLevels.includes(level as ServerConfig['logLevel'])) {
    return level as ServerConfig['logLevel'];
  }
  throw new Error(`Invalid log level: ${level}. Must be one of: ${validLevels.join(', ')}`);
}

/**
 * Validate environment string
 */
function validateEnvironment(env: string): ServerConfig['environment'] {
  const validEnvs = ['development', 'production', 'test'] as const;
  if (validEnvs.includes(env as ServerConfig['environment'])) {
    return env as ServerConfig['environment'];
  }
  throw new Error(`Invalid environment: ${env}. Must be one of: ${validEnvs.join(', ')}`);
}

/**
 * Load server configuration from environment variables
 */
export function loadConfig(): ServerConfig {
  // Load .env file if it exists
  loadEnvFile();

  // Determine environment
  const environment = validateEnvironment(getEnv('NODE_ENV', 'development'));

  // Build configuration
  const config: ServerConfig = {
    name: getEnv('SERVER_NAME', 'se2-minikit-mcp-server'),
    version: getEnv('SERVER_VERSION', '0.0.1'),
    logLevel: validateLogLevel(getEnv('LOG_LEVEL', environment === 'production' ? 'info' : 'debug')),
    prettyLogs: getEnv('PRETTY_LOGS', environment !== 'production' ? 'true' : 'false') === 'true',
    environment,
  };

  return config;
}

/**
 * Get a specific configuration value
 */
export function getConfigValue<K extends keyof ServerConfig>(key: K): ServerConfig[K] {
  const config = loadConfig();
  return config[key];
}
