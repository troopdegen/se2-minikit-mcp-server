/**
 * Template Renderer Tests
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { TemplateRenderer } from '../../../src/engines/renderer.js';
import { getLogger } from '../../../src/utils/logger.js';
import type { RenderContext } from '../../../src/types/template.js';

describe('TemplateRenderer', () => {
  let renderer: TemplateRenderer;
  const logger = getLogger();

  beforeEach(() => {
    renderer = new TemplateRenderer(logger);
  });

  describe('render', () => {
    test('renders simple variable substitution', () => {
      const template = 'Hello {{name}}!';
      const context: RenderContext = {
        variables: { name: 'World' },
      };

      const result = renderer.render(template, context);
      expect(result).toBe('Hello World!');
    });

    test('renders multiple variables', () => {
      const template = '{{greeting}} {{name}}, you are {{age}} years old';
      const context: RenderContext = {
        variables: { greeting: 'Hello', name: 'Alice', age: 30 },
      };

      const result = renderer.render(template, context);
      expect(result).toBe('Hello Alice, you are 30 years old');
    });

    test('renders nested object properties', () => {
      const template = '{{user.name}} works at {{user.company}}';
      const context: RenderContext = {
        variables: { user: { name: 'Bob', company: 'Acme Corp' } },
      };

      const result = renderer.render(template, context);
      expect(result).toBe('Bob works at Acme Corp');
    });

    test('handles missing variables gracefully', () => {
      const template = 'Hello {{name}}!';
      const context: RenderContext = {
        variables: {},
      };

      const result = renderer.render(template, context);
      expect(result).toBe('Hello !');
    });

    test('does not escape HTML by default', () => {
      const template = '{{content}}';
      const context: RenderContext = {
        variables: { content: '<script>alert("test")</script>' },
      };

      const result = renderer.render(template, context);
      expect(result).toBe('<script>alert("test")</script>');
    });
  });

  describe('renderPath', () => {
    test('renders path with variables', () => {
      const path = 'src/{{moduleName}}/index.ts';
      const context: RenderContext = {
        variables: { moduleName: 'auth' },
      };

      const result = renderer.renderPath(path, context);
      expect(result).toBe('src/auth/index.ts');
    });

    test('renders path with multiple variables', () => {
      const path = '{{category}}/{{subcategory}}/{{filename}}.ts';
      const context: RenderContext = {
        variables: {
          category: 'components',
          subcategory: 'forms',
          filename: 'LoginForm',
        },
      };

      const result = renderer.renderPath(path, context);
      expect(result).toBe('components/forms/LoginForm.ts');
    });
  });

  describe('hasVariables', () => {
    test('detects variables in template', () => {
      expect(renderer.hasVariables('Hello {{name}}')).toBe(true);
      expect(renderer.hasVariables('{{var1}} and {{var2}}')).toBe(true);
    });

    test('returns false for templates without variables', () => {
      expect(renderer.hasVariables('Hello World')).toBe(false);
      expect(renderer.hasVariables('No variables here')).toBe(false);
    });

    test('detects variables in paths', () => {
      expect(renderer.hasVariables('src/{{module}}/index.ts')).toBe(true);
    });
  });

  describe('extractVariables', () => {
    test('extracts single variable', () => {
      const vars = renderer.extractVariables('Hello {{name}}!');
      expect(vars).toEqual(['name']);
    });

    test('extracts multiple variables', () => {
      const vars = renderer.extractVariables('{{greeting}} {{name}}!');
      expect(vars).toContain('greeting');
      expect(vars).toContain('name');
      expect(vars).toHaveLength(2);
    });

    test('extracts unique variables', () => {
      const vars = renderer.extractVariables('{{name}} and {{name}} again');
      expect(vars).toEqual(['name']);
    });

    test('extracts base names from nested properties', () => {
      const vars = renderer.extractVariables('{{user.name}} and {{user.email}}');
      expect(vars).toEqual(['user']);
    });

    test('ignores mustache control structures', () => {
      const vars = renderer.extractVariables('{{#section}}content{{/section}}');
      expect(vars).toHaveLength(0);
    });
  });

  describe('validateVariables', () => {
    test('returns empty array when all variables provided', () => {
      const template = 'Hello {{name}}!';
      const variables = { name: 'World' };

      const missing = renderer.validateVariables(template, variables);
      expect(missing).toEqual([]);
    });

    test('returns missing variable names', () => {
      const template = '{{greeting}} {{name}}!';
      const variables = { greeting: 'Hello' };

      const missing = renderer.validateVariables(template, variables);
      expect(missing).toEqual(['name']);
    });

    test('returns all missing variables', () => {
      const template = '{{a}} {{b}} {{c}}';
      const variables = {};

      const missing = renderer.validateVariables(template, variables);
      expect(missing).toHaveLength(3);
      expect(missing).toContain('a');
      expect(missing).toContain('b');
      expect(missing).toContain('c');
    });
  });

  describe('renderSafe', () => {
    test('renders when all variables provided', () => {
      const template = 'Hello {{name}}!';
      const context: RenderContext = {
        variables: { name: 'World' },
      };

      const result = renderer.renderSafe(template, context);
      expect(result).toBe('Hello World!');
    });

    test('throws error when variables missing', () => {
      const template = 'Hello {{name}}!';
      const context: RenderContext = {
        variables: {},
      };

      expect(() => renderer.renderSafe(template, context)).toThrow();
    });
  });

  describe('compile', () => {
    test('compiles template for reuse', () => {
      const template = 'Hello {{name}}!';
      const compiled = renderer.compile(template);

      const result1 = compiled({ variables: { name: 'Alice' } });
      const result2 = compiled({ variables: { name: 'Bob' } });

      expect(result1).toBe('Hello Alice!');
      expect(result2).toBe('Hello Bob!');
    });
  });
});
