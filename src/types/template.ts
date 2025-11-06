/**
 * Template Engine Type Definitions
 *
 * Defines types for the template system that enables project scaffolding
 * with variable substitution and file generation.
 */

/**
 * Variable types supported in templates
 */
export type VariableType = 'string' | 'number' | 'boolean' | 'array' | 'object';

/**
 * Template variable definition
 */
export interface TemplateVariable {
  /** Variable name (used in {{variableName}} syntax) */
  name: string;

  /** Variable type */
  type: VariableType;

  /** Human-readable description */
  description?: string;

  /** Whether this variable is required */
  required?: boolean;

  /** Default value if not provided */
  default?: string | number | boolean | unknown[] | Record<string, unknown>;

  /** Validation pattern (for string types) */
  pattern?: string;

  /** Validation message if pattern fails */
  validationMessage?: string;

  /** Allowed values (enum) */
  enum?: (string | number)[];

  /** Minimum value (for numbers) */
  min?: number;

  /** Maximum value (for numbers) */
  max?: number;
}

/**
 * File mapping definition
 */
export interface FileMapping {
  /** Source path in template (supports {{variables}}) */
  source: string;

  /** Target path in generated project (supports {{variables}}) */
  target: string;

  /** Whether to apply variable substitution to file contents */
  transform?: boolean;

  /** Whether to process directory recursively */
  recursive?: boolean;

  /** File encoding (default: utf-8) */
  encoding?: BufferEncoding;

  /** File permissions (unix mode) */
  mode?: number;

  /** Conditions for including this file */
  condition?: string;
}

/**
 * Template hook types
 */
export type HookType = 'pre-generate' | 'post-generate' | 'pre-file' | 'post-file';

/**
 * Template hook definition
 */
export interface TemplateHook {
  /** Hook type */
  type: HookType;

  /** Command to execute */
  command: string;

  /** Working directory for command */
  cwd?: string;

  /** Environment variables */
  env?: Record<string, string>;

  /** Timeout in milliseconds */
  timeout?: number;

  /** Whether to continue on error */
  continueOnError?: boolean;
}

/**
 * Template metadata
 */
export interface TemplateMetadata {
  /** Template name (unique identifier) */
  name: string;

  /** Template version (semver) */
  version: string;

  /** Human-readable description */
  description: string;

  /** Template author */
  author?: string;

  /** Template license */
  license?: string;

  /** Tags for categorization */
  tags?: string[];

  /** Minimum required SE2-Minikit version */
  minVersion?: string;

  /** Template repository URL */
  repository?: string;

  /** Template homepage URL */
  homepage?: string;
}

/**
 * Complete template configuration
 */
export interface TemplateConfig extends TemplateMetadata {
  /** Template variables */
  variables: TemplateVariable[];

  /** File mappings */
  files: FileMapping[];

  /** Template hooks */
  hooks?: TemplateHook[];

  /** Template dependencies (other templates to include) */
  dependencies?: string[];

  /** Exclude patterns (glob) */
  exclude?: string[];

  /** Include patterns (glob) */
  include?: string[];
}

/**
 * Template generation options
 */
export interface TemplateGenerationOptions {
  /** Template name to use */
  template: string;

  /** Destination directory (absolute path) */
  destination: string;

  /** Variable values */
  variables: Record<string, unknown>;

  /** Whether to overwrite existing files */
  overwrite?: boolean;

  /** Whether to create git repository */
  initGit?: boolean;

  /** Whether to run hooks */
  runHooks?: boolean;

  /** Whether to install dependencies */
  installDependencies?: boolean;

  /** Dry run mode (don't actually create files) */
  dryRun?: boolean;

  /** Progress callback */
  onProgress?: (message: string, percentage: number) => void;
}

/**
 * Template generation result
 */
export interface TemplateGenerationResult {
  /** Whether generation succeeded */
  success: boolean;

  /** Generated file paths */
  files: string[];

  /** Skipped file paths */
  skipped: string[];

  /** Error message if failed */
  error?: string;

  /** Warnings during generation */
  warnings: string[];

  /** Hook execution results */
  hookResults?: HookExecutionResult[];

  /** Generation duration in milliseconds */
  duration: number;
}

/**
 * Hook execution result
 */
export interface HookExecutionResult {
  /** Hook type */
  type: HookType;

  /** Command that was executed */
  command: string;

  /** Exit code */
  exitCode: number;

  /** Standard output */
  stdout: string;

  /** Standard error */
  stderr: string;

  /** Execution duration in milliseconds */
  duration: number;

  /** Whether execution succeeded */
  success: boolean;
}

/**
 * Template validation result
 */
export interface TemplateValidationResult {
  /** Whether template is valid */
  valid: boolean;

  /** Validation errors */
  errors: string[];

  /** Validation warnings */
  warnings: string[];
}

/**
 * Loaded template with metadata
 */
export interface LoadedTemplate {
  /** Template configuration */
  config: TemplateConfig;

  /** Template root directory */
  path: string;

  /** When template was loaded */
  loadedAt: Date;

  /** Template validation result */
  validation: TemplateValidationResult;
}

/**
 * Template registry entry
 */
export interface TemplateRegistryEntry {
  /** Template name */
  name: string;

  /** Template path */
  path: string;

  /** Template metadata */
  metadata: TemplateMetadata;

  /** Whether template is valid */
  valid: boolean;
}

/**
 * Variable rendering context
 */
export interface RenderContext {
  /** Variables to substitute */
  variables: Record<string, unknown>;

  /** Additional helpers/functions */
  helpers?: Record<string, (...args: unknown[]) => unknown>;

  /** Partials (reusable template fragments) */
  partials?: Record<string, string>;
}

/**
 * File generation context
 */
export interface FileGenerationContext {
  /** Source file path */
  source: string;

  /** Target file path */
  target: string;

  /** Render context */
  renderContext: RenderContext;

  /** File mapping configuration */
  mapping: FileMapping;

  /** Template root directory */
  templateRoot: string;

  /** Destination root directory */
  destinationRoot: string;
}
