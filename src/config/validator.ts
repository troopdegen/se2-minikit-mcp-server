/**
 * Configuration validator
 * Provides validation functions for different configuration types with JSON/YAML support
 */

import { z } from 'zod';
import { load as parseYaml } from 'js-yaml';
import { ProjectConfigSchema } from './schemas/project-config.js';
import { ContractConfigSchema, ContractsConfigSchema } from './schemas/contract-config.js';
import { MinikitConfigSchema } from './schemas/minikit-config.js';

/**
 * Configuration format types
 */
export type ConfigFormat = 'json' | 'yaml';

/**
 * Validation result with detailed error information
 */
export interface ValidationResult<T = unknown> {
  /** Whether validation succeeded */
  success: boolean;

  /** Parsed and validated data (only if success = true) */
  data?: T;

  /** Validation errors (only if success = false) */
  errors?: ValidationError[];
}

/**
 * Detailed validation error
 */
export interface ValidationError {
  /** JSON path to the error location */
  path: string[];

  /** Error message */
  message: string;

  /** Error code (if available) */
  code?: string;

  /** Expected value or type */
  expected?: string;

  /** Received value */
  received?: unknown;
}

/**
 * Configuration type enumeration
 */
export enum ConfigType {
  PROJECT = 'project',
  CONTRACT = 'contract',
  CONTRACTS = 'contracts',
  MINIKIT = 'minikit',
}

/**
 * Parse configuration content based on format
 */
export function parseConfig(content: string, format: ConfigFormat): unknown {
  try {
    if (format === 'json') {
      return JSON.parse(content);
    } else if (format === 'yaml') {
      return parseYaml(content);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    throw new Error(
      `Failed to parse ${format.toUpperCase()}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Convert Zod errors to validation errors
 */
function formatZodErrors(zodError: z.ZodError | undefined): ValidationError[] {
  if (!zodError || !zodError.issues) {
    return [
      {
        path: [],
        message: 'Unknown validation error',
      },
    ];
  }

  return zodError.issues.map((err: any) => ({
    path: err.path.map(String),
    message: err.message,
    code: err.code,
    expected: 'expected' in err ? String(err.expected) : undefined,
    received: err.received,
  }));
}

/**
 * Generic validation function
 */
function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  configType: string
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  } else {
    return {
      success: false,
      errors: formatZodErrors(result.error),
    };
  }
}

/**
 * Validate project configuration
 */
export function validateProjectConfig(data: unknown): ValidationResult {
  return validateWithSchema(ProjectConfigSchema, data, 'project configuration');
}

/**
 * Validate single contract configuration
 */
export function validateContractConfig(data: unknown): ValidationResult {
  return validateWithSchema(ContractConfigSchema, data, 'contract configuration');
}

/**
 * Validate multiple contracts configuration
 */
export function validateContractsConfig(data: unknown): ValidationResult {
  return validateWithSchema(ContractsConfigSchema, data, 'contracts configuration');
}

/**
 * Validate Minikit configuration
 */
export function validateMinikitConfig(data: unknown): ValidationResult {
  return validateWithSchema(MinikitConfigSchema, data, 'Minikit configuration');
}

/**
 * Validate configuration from file content
 */
export function validateConfigFromContent(
  content: string,
  format: ConfigFormat,
  type: ConfigType
): ValidationResult {
  try {
    const data = parseConfig(content, format);

    switch (type) {
      case ConfigType.PROJECT:
        return validateProjectConfig(data);
      case ConfigType.CONTRACT:
        return validateContractConfig(data);
      case ConfigType.CONTRACTS:
        return validateContractsConfig(data);
      case ConfigType.MINIKIT:
        return validateMinikitConfig(data);
      default:
        return {
          success: false,
          errors: [
            {
              path: [],
              message: `Unknown configuration type: ${type}`,
            },
          ],
        };
    }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          path: [],
          message: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}

/**
 * Auto-detect configuration format from file extension
 */
export function detectConfigFormat(filename: string): ConfigFormat {
  const ext = filename.toLowerCase().split('.').pop();

  if (ext === 'json') {
    return 'json';
  } else if (ext === 'yaml' || ext === 'yml') {
    return 'yaml';
  }

  throw new Error(`Cannot detect format from filename: ${filename}. Use .json, .yaml, or .yml extension`);
}

/**
 * Format validation errors for human-readable output
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return 'No errors';
  }

  const lines = errors.map((err, index) => {
    const pathStr = err.path.length > 0 ? err.path.join('.') : 'root';
    let line = `${index + 1}. [${pathStr}] ${err.message}`;

    if (err.expected) {
      line += `\n   Expected: ${err.expected}`;
    }

    if (err.received !== undefined) {
      line += `\n   Received: ${JSON.stringify(err.received)}`;
    }

    return line;
  });

  return lines.join('\n\n');
}

/**
 * Validate and return formatted result
 */
export function validateAndFormat(
  content: string,
  format: ConfigFormat,
  type: ConfigType
): { valid: boolean; message: string; data?: unknown } {
  const result = validateConfigFromContent(content, format, type);

  if (result.success) {
    return {
      valid: true,
      message: 'Configuration is valid',
      data: result.data,
    };
  } else {
    return {
      valid: false,
      message: formatValidationErrors(result.errors || []),
    };
  }
}

/**
 * Check if data matches project config schema
 */
export function isProjectConfig(data: unknown): boolean {
  return ProjectConfigSchema.safeParse(data).success;
}

/**
 * Check if data matches contract config schema
 */
export function isContractConfig(data: unknown): boolean {
  return ContractConfigSchema.safeParse(data).success;
}

/**
 * Check if data matches contracts config schema
 */
export function isContractsConfig(data: unknown): boolean {
  return ContractsConfigSchema.safeParse(data).success;
}

/**
 * Check if data matches Minikit config schema
 */
export function isMinikitConfig(data: unknown): boolean {
  return MinikitConfigSchema.safeParse(data).success;
}

/**
 * Merge configurations with validation
 * Useful for extending base configurations with overrides
 */
export function mergeConfigs<T>(
  schema: z.ZodSchema<T>,
  base: unknown,
  override: unknown
): ValidationResult<T> {
  // Validate base config
  const baseResult = schema.safeParse(base);
  if (!baseResult.success) {
    return {
      success: false,
      errors: formatZodErrors(baseResult.error).map((err) => ({
        ...err,
        path: ['base', ...err.path],
      })),
    };
  }

  // Deep merge objects
  const merged =
    typeof base === 'object' && base !== null && typeof override === 'object' && override !== null
      ? { ...base, ...override }
      : override;

  // Validate merged result
  const mergedResult = schema.safeParse(merged);
  if (mergedResult.success) {
    return {
      success: true,
      data: mergedResult.data,
    };
  } else {
    return {
      success: false,
      errors: formatZodErrors(mergedResult.error),
    };
  }
}
