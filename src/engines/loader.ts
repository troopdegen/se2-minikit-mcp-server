/**
 * Template Loader
 *
 * Loads and validates template configurations from the templates directory.
 */

import { join, resolve } from 'node:path';
import type {
  TemplateConfig,
  LoadedTemplate,
  TemplateValidationResult,
  TemplateRegistryEntry,
  TemplateMetadata,
} from '../types/template.js';
import { MCPError, ErrorCodes } from '../types/server.js';
import type { Logger } from '../types/server.js';

/**
 * Template loader class
 */
export class TemplateLoader {
  private logger: Logger;
  private templatesDir: string;
  private cache: Map<string, LoadedTemplate>;

  constructor(logger: Logger, templatesDir: string) {
    this.logger = logger.child({ component: 'TemplateLoader' });
    this.templatesDir = resolve(templatesDir);
    this.cache = new Map();

    this.logger.info('TemplateLoader initialized', { templatesDir: this.templatesDir });
  }

  /**
   * Load a template by name
   */
  async load(templateName: string, useCache = true): Promise<LoadedTemplate> {
    // Check cache first
    if (useCache && this.cache.has(templateName)) {
      this.logger.debug('Loading template from cache', { templateName });
      return this.cache.get(templateName)!;
    }

    this.logger.info('Loading template', { templateName });

    try {
      const templatePath = join(this.templatesDir, templateName);

      // Check if template directory exists
      const dirExists = await this.directoryExists(templatePath);
      if (!dirExists) {
        throw new MCPError(
          `Template not found: ${templateName}`,
          ErrorCodes.INVALID_PARAMS,
          { templateName, templatesDir: this.templatesDir }
        );
      }

      // Load template.json
      const configPath = join(templatePath, 'template.json');
      const config = await this.loadConfig(configPath);

      // Validate template
      const validation = await this.validate(config, templatePath);

      const loadedTemplate: LoadedTemplate = {
        config,
        path: templatePath,
        loadedAt: new Date(),
        validation,
      };

      // Cache if valid
      if (validation.valid) {
        this.cache.set(templateName, loadedTemplate);
      }

      this.logger.info('Template loaded successfully', {
        templateName,
        valid: validation.valid,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length,
      });

      return loadedTemplate;
    } catch (error) {
      if (error instanceof MCPError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new MCPError(
        `Failed to load template: ${templateName}`,
        ErrorCodes.INTERNAL_ERROR,
        { templateName, error: message }
      );
    }
  }

  /**
   * Load template configuration from template.json
   */
  private async loadConfig(configPath: string): Promise<TemplateConfig> {
    try {
      const file = Bun.file(configPath);
      const exists = await file.exists();

      if (!exists) {
        throw new MCPError(
          'Template configuration file not found: template.json',
          ErrorCodes.INVALID_PARAMS,
          { configPath }
        );
      }

      const content = await file.text();
      const config = JSON.parse(content) as TemplateConfig;

      // Basic validation
      if (!config.name) {
        throw new MCPError(
          'Template configuration missing required field: name',
          ErrorCodes.INVALID_PARAMS
        );
      }

      if (!config.version) {
        throw new MCPError(
          'Template configuration missing required field: version',
          ErrorCodes.INVALID_PARAMS
        );
      }

      return config;
    } catch (error) {
      if (error instanceof MCPError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new MCPError(
        `Invalid template configuration: ${message}`,
        ErrorCodes.INVALID_PARAMS,
        { configPath, error: message }
      );
    }
  }

  /**
   * Validate template configuration
   */
  private async validate(
    config: TemplateConfig,
    templatePath: string
  ): Promise<TemplateValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!config.name) errors.push('Missing required field: name');
    if (!config.version) errors.push('Missing required field: version');
    if (!config.description) warnings.push('Missing recommended field: description');

    // Validate version format (basic semver check)
    if (config.version && !/^\d+\.\d+\.\d+/.test(config.version)) {
      warnings.push(`Version should follow semver format: ${config.version}`);
    }

    // Validate variables
    if (config.variables) {
      for (const variable of config.variables) {
        if (!variable.name) {
          errors.push('Variable missing required field: name');
        }
        if (!variable.type) {
          errors.push(`Variable ${variable.name} missing required field: type`);
        }

        // Validate pattern if provided
        if (variable.pattern) {
          try {
            new RegExp(variable.pattern);
          } catch {
            errors.push(`Variable ${variable.name} has invalid regex pattern: ${variable.pattern}`);
          }
        }
      }
    }

    // Validate files
    if (!config.files || config.files.length === 0) {
      warnings.push('No files defined in template');
    } else {
      for (const file of config.files) {
        if (!file.source) {
          errors.push('File mapping missing required field: source');
        }
        if (!file.target) {
          errors.push('File mapping missing required field: target');
        }

        // Check if source exists
        if (file.source) {
          const sourcePath = join(templatePath, file.source);
          const exists = await this.pathExists(sourcePath);
          if (!exists) {
            warnings.push(`Source file/directory not found: ${file.source}`);
          }
        }
      }
    }

    // Validate hooks
    if (config.hooks) {
      for (const hook of config.hooks) {
        if (!hook.type) {
          errors.push('Hook missing required field: type');
        }
        if (!hook.command) {
          errors.push('Hook missing required field: command');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * List all available templates
   */
  async listTemplates(): Promise<TemplateRegistryEntry[]> {
    this.logger.debug('Listing templates', { templatesDir: this.templatesDir });

    try {
      const templates: TemplateRegistryEntry[] = [];

      // Check if templates directory exists
      const exists = await this.directoryExists(this.templatesDir);
      if (!exists) {
        this.logger.warn('Templates directory does not exist', {
          templatesDir: this.templatesDir,
        });
        return [];
      }

      // Read directory
      const entries = await this.readDirectory(this.templatesDir);

      for (const entry of entries) {
        const entryPath = join(this.templatesDir, entry);
        const isDir = await this.isDirectory(entryPath);

        if (!isDir) continue;

        // Try to load template
        try {
          const loaded = await this.load(entry, true);
          templates.push({
            name: loaded.config.name,
            path: loaded.path,
            metadata: this.extractMetadata(loaded.config),
            valid: loaded.validation.valid,
          });
        } catch (error) {
          this.logger.warn('Failed to load template during listing', {
            entry,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      this.logger.info('Templates listed', { count: templates.length });
      return templates;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new MCPError(
        'Failed to list templates',
        ErrorCodes.INTERNAL_ERROR,
        { templatesDir: this.templatesDir, error: message }
      );
    }
  }

  /**
   * Clear template cache
   */
  clearCache(templateName?: string): void {
    if (templateName) {
      this.cache.delete(templateName);
      this.logger.debug('Template cache cleared', { templateName });
    } else {
      this.cache.clear();
      this.logger.debug('All template cache cleared');
    }
  }

  /**
   * Get template path
   */
  getTemplatePath(templateName: string): string {
    return join(this.templatesDir, templateName);
  }

  /**
   * Extract metadata from config
   */
  private extractMetadata(config: TemplateConfig): TemplateMetadata {
    return {
      name: config.name,
      version: config.version,
      description: config.description,
      author: config.author,
      license: config.license,
      tags: config.tags,
      minVersion: config.minVersion,
      repository: config.repository,
      homepage: config.homepage,
    };
  }

  /**
   * Helper: Check if directory exists
   */
  private async directoryExists(path: string): Promise<boolean> {
    try {
      const file = Bun.file(path);
      const stat = await file.stat();
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Helper: Check if path exists
   */
  private async pathExists(path: string): Promise<boolean> {
    try {
      const file = Bun.file(path);
      return await file.exists();
    } catch {
      return false;
    }
  }

  /**
   * Helper: Read directory entries
   */
  private async readDirectory(path: string): Promise<string[]> {
    const glob = new Bun.Glob('*');
    const entries: string[] = [];

    for await (const file of glob.scan({ cwd: path, onlyFiles: false })) {
      entries.push(file);
    }

    return entries;
  }

  /**
   * Helper: Check if path is a directory
   */
  private async isDirectory(path: string): Promise<boolean> {
    try {
      const file = Bun.file(path);
      const stat = await file.stat();
      return stat.isDirectory();
    } catch {
      return false;
    }
  }
}

/**
 * Create a template loader instance
 */
export function createLoader(logger: Logger, templatesDir: string): TemplateLoader {
  return new TemplateLoader(logger, templatesDir);
}
