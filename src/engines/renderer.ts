/**
 * Template Variable Renderer
 *
 * Handles variable substitution in template files and paths using Mustache syntax.
 */

import Mustache from 'mustache';
import type { RenderContext } from '../types/template.js';
import { MCPError, ErrorCodes } from '../types/server.js';
import type { Logger } from '../types/server.js';

/**
 * Template renderer for variable substitution
 */
export class TemplateRenderer {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.child({ component: 'TemplateRenderer' });
  }

  /**
   * Render a template string with variables
   */
  render(template: string, context: RenderContext): string {
    try {
      this.logger.debug('Rendering template', {
        templateLength: template.length,
        variableCount: Object.keys(context.variables).length,
      });

      // Disable HTML escaping since we're generating code files
      const rendered = Mustache.render(template, context.variables, context.partials, {
        escape: (text) => text, // No escaping
      });

      this.logger.debug('Template rendered successfully', {
        renderedLength: rendered.length,
      });

      return rendered;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown rendering error';
      this.logger.error('Template rendering failed', { error: message });

      throw new MCPError(
        `Failed to render template: ${message}`,
        ErrorCodes.INTERNAL_ERROR,
        { template: template.substring(0, 100), error: message }
      );
    }
  }

  /**
   * Render a file path with variables
   */
  renderPath(path: string, context: RenderContext): string {
    try {
      // Paths use the same {{variable}} syntax
      return this.render(path, context);
    } catch (error) {
      throw new MCPError(
        `Failed to render path: ${path}`,
        ErrorCodes.INVALID_PARAMS,
        { path, error }
      );
    }
  }

  /**
   * Check if a string contains template variables
   */
  hasVariables(template: string): boolean {
    return /\{\{.+?\}\}/.test(template);
  }

  /**
   * Extract variable names from a template string
   */
  extractVariables(template: string): string[] {
    const matches = template.matchAll(/\{\{([^}]+)\}\}/g);
    const variables = new Set<string>();

    for (const match of matches) {
      // Extract variable name (handle helpers and partials)
      const varName = match[1]?.trim();
      if (!varName) continue;

      // Skip mustache control structures
      if (varName.startsWith('#') || varName.startsWith('/') || varName.startsWith('^')) {
        continue;
      }

      // Extract base variable name (before dots or spaces)
      const parts = varName.split(/[.\s]/);
      const baseName = parts[0];
      if (baseName && baseName.length > 0) {
        variables.add(baseName);
      }
    }

    return Array.from(variables);
  }

  /**
   * Validate that all required variables are provided
   */
  validateVariables(template: string, variables: Record<string, unknown>): string[] {
    const required = this.extractVariables(template);
    const provided = Object.keys(variables);
    const missing: string[] = [];

    for (const varName of required) {
      if (!provided.includes(varName)) {
        missing.push(varName);
      }
    }

    return missing;
  }

  /**
   * Render with validation
   */
  renderSafe(template: string, context: RenderContext): string {
    const missing = this.validateVariables(template, context.variables);

    if (missing.length > 0) {
      throw new MCPError(
        `Missing required variables: ${missing.join(', ')}`,
        ErrorCodes.INVALID_PARAMS,
        { missing, provided: Object.keys(context.variables) }
      );
    }

    return this.render(template, context);
  }

  /**
   * Render a template file
   */
  async renderFile(filePath: string, context: RenderContext): Promise<string> {
    try {
      const file = Bun.file(filePath);
      const content = await file.text();

      return this.render(content, context);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new MCPError(
        `Failed to render file: ${filePath}`,
        ErrorCodes.INTERNAL_ERROR,
        { filePath, error: message }
      );
    }
  }

  /**
   * Pre-compile a template for faster rendering
   */
  compile(template: string): (context: RenderContext) => string {
    // Parse template once
    Mustache.parse(template);

    // Return render function
    return (context: RenderContext) => {
      return Mustache.render(template, context.variables, context.partials, {
        escape: (text) => text,
      });
    };
  }

  /**
   * Register a custom helper function
   */
  addHelper(name: string, fn: (...args: unknown[]) => unknown): void {
    this.logger.debug('Adding custom helper', { name });
    // Helpers are passed through context, not registered globally
    // This method is for validation/logging
  }

  /**
   * Register a partial template
   */
  addPartial(name: string, template: string): void {
    this.logger.debug('Adding partial template', { name, length: template.length });
    // Partials are passed through context, not registered globally
    // This method is for validation/logging
  }
}

/**
 * Create a template renderer instance
 */
export function createRenderer(logger: Logger): TemplateRenderer {
  return new TemplateRenderer(logger);
}

/**
 * Helper function to render a simple template
 */
export function renderTemplate(template: string, variables: Record<string, unknown>): string {
  return Mustache.render(template, variables, undefined, {
    escape: (text) => text,
  });
}

/**
 * Helper function to check if string has variables
 */
export function hasTemplateVariables(str: string): boolean {
  return /\{\{.+?\}\}/.test(str);
}
