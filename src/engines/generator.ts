/**
 * Template File Generator
 *
 * Generates project files from templates with variable substitution.
 */

import { join, dirname, basename } from 'node:path';
import type {
  FileMapping,
  TemplateConfig,
  RenderContext,
  TemplateGenerationOptions,
  TemplateGenerationResult,
} from '../types/template.js';
import type { Logger } from '../types/server.js';
import { MCPError, ErrorCodes } from '../types/server.js';
import { TemplateRenderer } from './renderer.js';
import { TemplateLoader } from './loader.js';

/**
 * Template file generator
 */
export class TemplateGenerator {
  private logger: Logger;
  private loader: TemplateLoader;
  private renderer: TemplateRenderer;

  constructor(logger: Logger, templatesDir: string) {
    this.logger = logger.child({ component: 'TemplateGenerator' });
    this.loader = new TemplateLoader(logger, templatesDir);
    this.renderer = new TemplateRenderer(logger);
  }

  /**
   * Generate project from template
   */
  async generate(options: TemplateGenerationOptions): Promise<TemplateGenerationResult> {
    const startTime = Date.now();
    const files: string[] = [];
    const skipped: string[] = [];
    const warnings: string[] = [];

    this.logger.info('Starting template generation', {
      template: options.template,
      destination: options.destination,
      dryRun: options.dryRun,
    });

    try {
      // Load template
      const loaded = await this.loader.load(options.template);

      if (!loaded.validation.valid) {
        throw new MCPError(
          `Template validation failed: ${loaded.validation.errors.join(', ')}`,
          ErrorCodes.INVALID_PARAMS,
          { errors: loaded.validation.errors }
        );
      }

      // Add warnings from validation
      warnings.push(...loaded.validation.warnings);

      // Create render context
      const context: RenderContext = {
        variables: options.variables,
      };

      // Validate all required variables are provided
      const missing = this.validateRequiredVariables(loaded.config, options.variables);
      if (missing.length > 0) {
        throw new MCPError(
          `Missing required variables: ${missing.join(', ')}`,
          ErrorCodes.INVALID_PARAMS,
          { missing }
        );
      }

      // Check destination doesn't exist or overwrite is enabled
      if (!options.dryRun) {
        const destExists = await this.directoryExists(options.destination);
        if (destExists && !options.overwrite) {
          throw new MCPError(
            'Destination directory already exists. Use overwrite option to replace.',
            ErrorCodes.INVALID_PARAMS,
            { destination: options.destination }
          );
        }
      }

      // Process file mappings
      for (const mapping of loaded.config.files) {
        try {
          const result = await this.processFileMapping(
            mapping,
            loaded.path,
            options.destination,
            context,
            options.dryRun || false
          );

          if (result.generated) {
            files.push(...result.files);
          } else {
            skipped.push(...result.files);
          }

          if (result.warning) {
            warnings.push(result.warning);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          warnings.push(`Failed to process ${mapping.source}: ${message}`);
          this.logger.warn('File mapping failed', { mapping: mapping.source, error: message });
        }
      }

      const duration = Date.now() - startTime;

      this.logger.info('Template generation complete', {
        template: options.template,
        filesGenerated: files.length,
        filesSkipped: skipped.length,
        warnings: warnings.length,
        duration,
      });

      return {
        success: true,
        files,
        skipped,
        warnings,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Unknown error';

      this.logger.error('Template generation failed', {
        template: options.template,
        error: message,
        duration,
      });

      if (error instanceof MCPError) {
        throw error;
      }

      return {
        success: false,
        files,
        skipped,
        error: message,
        warnings,
        duration,
      };
    }
  }

  /**
   * Process a single file mapping
   */
  private async processFileMapping(
    mapping: FileMapping,
    templateRoot: string,
    destinationRoot: string,
    context: RenderContext,
    dryRun: boolean
  ): Promise<{ generated: boolean; files: string[]; warning?: string }> {
    // Render paths with variables
    const sourcePath = join(templateRoot, mapping.source);
    const targetPath = join(
      destinationRoot,
      this.renderer.renderPath(mapping.target, context)
    );

    this.logger.debug('Processing file mapping', { source: sourcePath, target: targetPath });

    // Check if source exists
    const sourceExists = await this.pathExists(sourcePath);
    if (!sourceExists) {
      return {
        generated: false,
        files: [targetPath],
        warning: `Source not found: ${mapping.source}`,
      };
    }

    // Check if source is directory
    const isDir = await this.isDirectory(sourcePath);

    if (isDir && mapping.recursive) {
      // Process directory recursively
      return await this.processDirectory(
        sourcePath,
        targetPath,
        mapping,
        context,
        dryRun
      );
    } else if (isDir) {
      // Skip directory if not recursive
      return {
        generated: false,
        files: [targetPath],
        warning: `Directory ${mapping.source} skipped (recursive not enabled)`,
      };
    } else {
      // Process single file
      const success = await this.processFile(
        sourcePath,
        targetPath,
        mapping,
        context,
        dryRun
      );
      return {
        generated: success,
        files: [targetPath],
      };
    }
  }

  /**
   * Process a directory recursively
   */
  private async processDirectory(
    sourcePath: string,
    targetPath: string,
    mapping: FileMapping,
    context: RenderContext,
    dryRun: boolean
  ): Promise<{ generated: boolean; files: string[]; warning?: string }> {
    const files: string[] = [];

    // Create target directory
    if (!dryRun) {
      await this.createDirectory(targetPath);
    }
    files.push(targetPath);

    // Read directory entries
    const entries = await this.readDirectory(sourcePath);

    for (const entry of entries) {
      const entrySourcePath = join(sourcePath, entry);
      // Render entry name with variables (for files like {{contractName}}.sol)
      const renderedEntry = this.renderer.renderPath(entry, context);
      const entryTargetPath = join(targetPath, renderedEntry);

      const isDir = await this.isDirectory(entrySourcePath);

      if (isDir) {
        // Recursively process subdirectory
        const result = await this.processDirectory(
          entrySourcePath,
          entryTargetPath,
          mapping,
          context,
          dryRun
        );
        files.push(...result.files);
      } else {
        // Process file
        const success = await this.processFile(
          entrySourcePath,
          entryTargetPath,
          mapping,
          context,
          dryRun
        );
        if (success) {
          files.push(entryTargetPath);
        }
      }
    }

    return { generated: true, files };
  }

  /**
   * Process a single file
   */
  private async processFile(
    sourcePath: string,
    targetPath: string,
    mapping: FileMapping,
    context: RenderContext,
    dryRun: boolean
  ): Promise<boolean> {
    try {
      // Create target directory if needed
      const targetDir = dirname(targetPath);
      if (!dryRun) {
        await this.createDirectory(targetDir);
      }

      // Read source file
      const file = Bun.file(sourcePath);
      let content: string | ArrayBuffer;

      if (mapping.transform !== false) {
        // Apply variable substitution
        const text = await file.text();
        content = this.renderer.render(text, context);
      } else {
        // Copy as-is (binary files)
        content = await file.arrayBuffer();
      }

      // Write target file
      if (!dryRun) {
        await Bun.write(targetPath, content);

        // Set file permissions if specified
        if (mapping.mode !== undefined) {
          await this.setPermissions(targetPath, mapping.mode);
        }
      }

      this.logger.debug('File processed', {
        source: basename(sourcePath),
        target: basename(targetPath),
        transformed: mapping.transform !== false,
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('File processing failed', {
        source: sourcePath,
        target: targetPath,
        error: message,
      });
      return false;
    }
  }

  /**
   * Validate required variables are provided
   */
  private validateRequiredVariables(
    config: TemplateConfig,
    variables: Record<string, unknown>
  ): string[] {
    const missing: string[] = [];

    if (!config.variables) {
      return missing;
    }

    for (const variable of config.variables) {
      if (variable.required && !(variable.name in variables)) {
        // Check if default exists
        if (variable.default === undefined) {
          missing.push(variable.name);
        }
      }
    }

    return missing;
  }

  /**
   * Clear template cache
   */
  clearCache(templateName?: string): void {
    this.loader.clearCache(templateName);
  }

  /**
   * Helper: Check if path exists (file or directory)
   */
  private async pathExists(path: string): Promise<boolean> {
    try {
      const file = Bun.file(path);
      // Try stat first - works for both files and directories
      await file.stat();
      return true;
    } catch {
      return false;
    }
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
   * Helper: Create directory
   */
  private async createDirectory(path: string): Promise<void> {
    try {
      await Bun.write(join(path, '.gitkeep'), '');
      // Directory is created as side effect of writing file
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new MCPError(
        `Failed to create directory: ${path}`,
        ErrorCodes.INTERNAL_ERROR,
        { path, error: message }
      );
    }
  }

  /**
   * Helper: Read directory entries (including dotfiles)
   */
  private async readDirectory(path: string): Promise<string[]> {
    try {
      const { readdirSync } = await import('fs');
      const entries = readdirSync(path).filter(e => e !== '.' && e !== '..');
      return entries;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Failed to read directory', { path, error: message });
      return [];
    }
  }

  /**
   * Helper: Set file permissions
   */
  private async setPermissions(path: string, mode: number): Promise<void> {
    try {
      // Bun doesn't have direct chmod, use Node.js compatibility
      const { chmod } = await import('node:fs/promises');
      await chmod(path, mode);
    } catch (error) {
      this.logger.warn('Failed to set file permissions', {
        path,
        mode,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

/**
 * Create a template generator instance
 */
export function createGenerator(logger: Logger, templatesDir: string): TemplateGenerator {
  return new TemplateGenerator(logger, templatesDir);
}
