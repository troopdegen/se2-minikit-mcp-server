/**
 * Template Engine
 *
 * Main orchestrator for the template system that coordinates loading, rendering,
 * generation, and hooks execution.
 */

import type {
  TemplateGenerationOptions,
  TemplateGenerationResult,
  TemplateRegistryEntry,
  TemplateConfig,
  HookType,
} from '../types/template.js';
import type { Logger } from '../types/server.js';
import { MCPError, ErrorCodes } from '../types/server.js';
import { TemplateLoader } from './loader.js';
import { TemplateRenderer } from './renderer.js';
import { TemplateGenerator } from './generator.js';
import { HooksExecutor, type HookExecutionContext } from './hooks.js';

/**
 * Template engine configuration
 */
export interface TemplateEngineConfig {
  /** Templates directory path */
  templatesDir: string;

  /** Default hook timeout in milliseconds */
  hookTimeout?: number;

  /** Enable template caching */
  enableCache?: boolean;
}

/**
 * Complete template engine
 */
export class TemplateEngine {
  private logger: Logger;
  private loader: TemplateLoader;
  private renderer: TemplateRenderer;
  private generator: TemplateGenerator;
  private hooks: HooksExecutor;
  private config: TemplateEngineConfig;

  constructor(logger: Logger, config: TemplateEngineConfig) {
    this.logger = logger.child({ component: 'TemplateEngine' });
    this.config = config;

    // Initialize components
    this.loader = new TemplateLoader(logger, config.templatesDir);
    this.renderer = new TemplateRenderer(logger);
    this.generator = new TemplateGenerator(logger, config.templatesDir);
    this.hooks = new HooksExecutor(logger, config.hookTimeout);

    this.logger.info('TemplateEngine initialized', {
      templatesDir: config.templatesDir,
      cacheEnabled: config.enableCache !== false,
    });
  }

  /**
   * Generate project from template with full lifecycle
   */
  async generate(options: TemplateGenerationOptions): Promise<TemplateGenerationResult> {
    this.logger.info('Starting template generation with hooks', {
      template: options.template,
      destination: options.destination,
      runHooks: options.runHooks,
    });

    try {
      // Load template to get hooks configuration
      const loaded = await this.loader.load(options.template);

      // Apply defaults to variables (before validation)
      const mergedVariables = this.applyDefaults(loaded.config, options.variables);

      // Validate variables against template schema
      const validationErrors = this.validateVariables(loaded.config, mergedVariables);
      if (validationErrors.length > 0) {
        throw new MCPError(
          `Variable validation failed: ${validationErrors.join(', ')}`,
          ErrorCodes.INVALID_PARAMS,
          { template: options.template, errors: validationErrors }
        );
      }

      // Update options with merged variables
      const updatedOptions = { ...options, variables: mergedVariables };

      // Prepare hook execution context
      const hookContext: HookExecutionContext = {
        cwd: options.destination,
        variables: mergedVariables,
      };

      let hookResults = [];

      // Run pre-generate hooks
      if (options.runHooks && loaded.config.hooks) {
        this.logger.info('Running pre-generate hooks');
        const preResults = await this.hooks.executeHooks(
          loaded.config.hooks,
          'pre-generate',
          { ...hookContext, cwd: process.cwd() } // Pre-generate runs in current dir
        );
        hookResults.push(...preResults);
      }

      // Generate files
      const result = await this.generator.generate(updatedOptions);

      // Run post-generate hooks
      if (options.runHooks && loaded.config.hooks && result.success) {
        this.logger.info('Running post-generate hooks');
        const postResults = await this.hooks.executeHooks(
          loaded.config.hooks,
          'post-generate',
          hookContext
        );
        hookResults.push(...postResults);
      }

      // Add hook results to generation result
      return {
        ...result,
        hookResults: hookResults.length > 0 ? hookResults : undefined,
      };
    } catch (error) {
      if (error instanceof MCPError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new MCPError(
        `Template generation failed: ${message}`,
        ErrorCodes.INTERNAL_ERROR,
        { template: options.template, error: message }
      );
    }
  }

  /**
   * List all available templates
   */
  async listTemplates(): Promise<TemplateRegistryEntry[]> {
    return await this.loader.listTemplates();
  }

  /**
   * Get template information
   */
  async getTemplate(templateName: string) {
    return await this.loader.load(templateName);
  }

  /**
   * Validate template
   */
  async validateTemplate(templateName: string) {
    const loaded = await this.loader.load(templateName, false); // Skip cache
    return loaded.validation;
  }

  /**
   * Clear template cache
   */
  clearCache(templateName?: string): void {
    this.loader.clearCache(templateName);
    this.generator.clearCache(templateName);
  }

  /**
   * Preview template generation (dry run)
   */
  async preview(options: Omit<TemplateGenerationOptions, 'dryRun'>) {
    return await this.generate({ ...options, dryRun: true });
  }

  /**
   * Apply default values to variables
   */
  private applyDefaults(
    config: TemplateConfig,
    variables: Record<string, unknown>
  ): Record<string, unknown> {
    const merged = { ...variables };

    for (const varDef of config.variables) {
      // Apply default if variable not provided and default exists
      if ((merged[varDef.name] === undefined || merged[varDef.name] === null) && varDef.default !== undefined) {
        merged[varDef.name] = varDef.default;
      }
    }

    return merged;
  }

  /**
   * Validate variables against template schema
   */
  private validateVariables(
    config: TemplateConfig,
    variables: Record<string, unknown>
  ): string[] {
    const errors: string[] = [];

    for (const varDef of config.variables) {
      const value = variables[varDef.name];

      // Check required variables
      if (varDef.required && (value === undefined || value === null || value === '')) {
        errors.push(`Variable '${varDef.name}' is required`);
        continue;
      }

      // Skip validation if variable not provided and not required
      if (value === undefined || value === null) {
        continue;
      }

      // Type validation
      const actualType = typeof value;
      if (varDef.type && actualType !== varDef.type) {
        errors.push(`Variable '${varDef.name}' must be of type ${varDef.type}, got ${actualType}`);
        continue;
      }

      // Pattern validation (for strings)
      if (varDef.pattern && typeof value === 'string') {
        const regex = new RegExp(varDef.pattern);
        if (!regex.test(value)) {
          errors.push(`Variable '${varDef.name}' does not match pattern ${varDef.pattern}`);
        }
      }

      // Enum validation
      if (varDef.enum && Array.isArray(varDef.enum)) {
        if (!varDef.enum.includes(value as string)) {
          errors.push(`Variable '${varDef.name}' must be one of: ${varDef.enum.join(', ')}`);
        }
      }
    }

    return errors;
  }

  /**
   * Validate generation options
   */
  validateOptions(options: TemplateGenerationOptions): string[] {
    const errors: string[] = [];

    if (!options.template) {
      errors.push('Template name is required');
    }

    if (!options.destination) {
      errors.push('Destination path is required');
    }

    if (!options.variables || typeof options.variables !== 'object') {
      errors.push('Variables must be an object');
    }

    return errors;
  }
}

/**
 * Create a template engine instance
 */
export function createTemplateEngine(
  logger: Logger,
  config: TemplateEngineConfig
): TemplateEngine {
  return new TemplateEngine(logger, config);
}

/**
 * Export all template engine components
 */
export { TemplateLoader, createLoader } from './loader.js';
export { TemplateRenderer, createRenderer } from './renderer.js';
export { TemplateGenerator, createGenerator } from './generator.js';
export { HooksExecutor, createHooksExecutor } from './hooks.js';
export type { HookExecutionContext } from './hooks.js';
