/**
 * Template Loader Tests
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { TemplateLoader } from '../../../src/engines/loader.js';
import { getLogger } from '../../../src/utils/logger.js';
import { join } from 'node:path';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';

describe('TemplateLoader', () => {
  const logger = getLogger();
  const testTemplatesDir = join(process.cwd(), 'test-templates');
  let loader: TemplateLoader;

  beforeEach(() => {
    // Create test templates directory
    mkdirSync(testTemplatesDir, { recursive: true });
    loader = new TemplateLoader(logger, testTemplatesDir);
  });

  afterEach(() => {
    // Clean up test templates
    rmSync(testTemplatesDir, { recursive: true, force: true });
  });

  describe('load', () => {
    test('loads valid template', async () => {
      // Create test template
      const templateDir = join(testTemplatesDir, 'test-template');
      mkdirSync(templateDir, { recursive: true });

      const config = {
        name: 'test-template',
        version: '1.0.0',
        description: 'Test template',
        variables: [],
        files: [
          { source: 'src/', target: 'src/', recursive: true },
        ],
      };

      writeFileSync(
        join(templateDir, 'template.json'),
        JSON.stringify(config, null, 2)
      );

      // Create dummy source file
      const srcDir = join(templateDir, 'src');
      mkdirSync(srcDir, { recursive: true });
      writeFileSync(join(srcDir, 'index.ts'), '// test');

      const loaded = await loader.load('test-template');

      expect(loaded.config.name).toBe('test-template');
      expect(loaded.config.version).toBe('1.0.0');
      expect(loaded.validation.valid).toBe(true);
      expect(loaded.validation.errors).toHaveLength(0);
    });

    test('throws error for non-existent template', async () => {
      await expect(loader.load('non-existent')).rejects.toThrow();
    });

    test('throws error for missing template.json', async () => {
      const templateDir = join(testTemplatesDir, 'no-config');
      mkdirSync(templateDir, { recursive: true });

      await expect(loader.load('no-config')).rejects.toThrow();
    });

    test('throws error for invalid JSON', async () => {
      const templateDir = join(testTemplatesDir, 'invalid-json');
      mkdirSync(templateDir, { recursive: true });

      writeFileSync(join(templateDir, 'template.json'), '{invalid json}');

      await expect(loader.load('invalid-json')).rejects.toThrow();
    });

    test('validates required fields', async () => {
      const templateDir = join(testTemplatesDir, 'missing-fields');
      mkdirSync(templateDir, { recursive: true });

      const config = {
        // Missing name and version
        description: 'Test',
        variables: [],
        files: [],
      };

      writeFileSync(
        join(templateDir, 'template.json'),
        JSON.stringify(config, null, 2)
      );

      await expect(loader.load('missing-fields')).rejects.toThrow();
    });

    test('uses cache on second load', async () => {
      const templateDir = join(testTemplatesDir, 'cached');
      mkdirSync(templateDir, { recursive: true });

      const config = {
        name: 'cached',
        version: '1.0.0',
        description: 'Cached template',
        variables: [],
        files: [],
      };

      writeFileSync(
        join(templateDir, 'template.json'),
        JSON.stringify(config, null, 2)
      );

      const loaded1 = await loader.load('cached');
      const loaded2 = await loader.load('cached');

      expect(loaded1).toBe(loaded2); // Same reference from cache
    });

    test('skips cache when requested', async () => {
      const templateDir = join(testTemplatesDir, 'no-cache');
      mkdirSync(templateDir, { recursive: true });

      const config = {
        name: 'no-cache',
        version: '1.0.0',
        description: 'No cache template',
        variables: [],
        files: [],
      };

      writeFileSync(
        join(templateDir, 'template.json'),
        JSON.stringify(config, null, 2)
      );

      const loaded1 = await loader.load('no-cache', true);
      const loaded2 = await loader.load('no-cache', false);

      expect(loaded1).not.toBe(loaded2); // Different references
    });
  });

  describe('listTemplates', () => {
    test('lists available templates', async () => {
      // Create two test templates
      const templates = ['template1', 'template2'];

      for (const name of templates) {
        const templateDir = join(testTemplatesDir, name);
        mkdirSync(templateDir, { recursive: true });

        const config = {
          name,
          version: '1.0.0',
          description: `${name} description`,
          variables: [],
          files: [],
        };

        writeFileSync(
          join(templateDir, 'template.json'),
          JSON.stringify(config, null, 2)
        );
      }

      const list = await loader.listTemplates();

      expect(list).toHaveLength(2);
      expect(list.map((t) => t.name)).toContain('template1');
      expect(list.map((t) => t.name)).toContain('template2');
    });

    test('returns empty array for empty directory', async () => {
      const list = await loader.listTemplates();
      expect(list).toEqual([]);
    });

    test('skips invalid templates', async () => {
      // Create one valid and one invalid template
      const validDir = join(testTemplatesDir, 'valid');
      mkdirSync(validDir, { recursive: true });
      writeFileSync(
        join(validDir, 'template.json'),
        JSON.stringify({
          name: 'valid',
          version: '1.0.0',
          description: 'Valid',
          variables: [],
          files: [],
        })
      );

      const invalidDir = join(testTemplatesDir, 'invalid');
      mkdirSync(invalidDir, { recursive: true });
      writeFileSync(join(invalidDir, 'template.json'), '{invalid}');

      const list = await loader.listTemplates();

      expect(list).toHaveLength(1);
      expect(list[0]?.name).toBe('valid');
    });
  });

  describe('clearCache', () => {
    test('clears specific template from cache', async () => {
      const templateDir = join(testTemplatesDir, 'clear-one');
      mkdirSync(templateDir, { recursive: true });

      const config = {
        name: 'clear-one',
        version: '1.0.0',
        description: 'Clear one',
        variables: [],
        files: [],
      };

      writeFileSync(
        join(templateDir, 'template.json'),
        JSON.stringify(config, null, 2)
      );

      const loaded1 = await loader.load('clear-one');
      loader.clearCache('clear-one');
      const loaded2 = await loader.load('clear-one');

      expect(loaded1).not.toBe(loaded2);
    });

    test('clears all templates from cache', async () => {
      const templateDir = join(testTemplatesDir, 'clear-all');
      mkdirSync(templateDir, { recursive: true });

      const config = {
        name: 'clear-all',
        version: '1.0.0',
        description: 'Clear all',
        variables: [],
        files: [],
      };

      writeFileSync(
        join(templateDir, 'template.json'),
        JSON.stringify(config, null, 2)
      );

      const loaded1 = await loader.load('clear-all');
      loader.clearCache(); // No argument clears all
      const loaded2 = await loader.load('clear-all');

      expect(loaded1).not.toBe(loaded2);
    });
  });

  describe('validation', () => {
    test('detects missing source files', async () => {
      const templateDir = join(testTemplatesDir, 'missing-source');
      mkdirSync(templateDir, { recursive: true });

      const config = {
        name: 'missing-source',
        version: '1.0.0',
        description: 'Missing source',
        variables: [],
        files: [
          { source: 'nonexistent.ts', target: 'output.ts' },
        ],
      };

      writeFileSync(
        join(templateDir, 'template.json'),
        JSON.stringify(config, null, 2)
      );

      const loaded = await loader.load('missing-source');

      expect(loaded.validation.valid).toBe(true); // Still valid
      expect(loaded.validation.warnings).toContain(
        'Source file/directory not found: nonexistent.ts'
      );
    });

    test('validates semver format', async () => {
      const templateDir = join(testTemplatesDir, 'bad-version');
      mkdirSync(templateDir, { recursive: true });

      const config = {
        name: 'bad-version',
        version: 'v1', // Invalid semver
        description: 'Bad version',
        variables: [],
        files: [],
      };

      writeFileSync(
        join(templateDir, 'template.json'),
        JSON.stringify(config, null, 2)
      );

      const loaded = await loader.load('bad-version');

      expect(loaded.validation.warnings.some((w) => w.includes('semver'))).toBe(true);
    });

    test('validates variable patterns', async () => {
      const templateDir = join(testTemplatesDir, 'bad-pattern');
      mkdirSync(templateDir, { recursive: true });

      const config = {
        name: 'bad-pattern',
        version: '1.0.0',
        description: 'Bad pattern',
        variables: [
          {
            name: 'test',
            type: 'string' as const,
            pattern: '[invalid(', // Invalid regex
          },
        ],
        files: [],
      };

      writeFileSync(
        join(templateDir, 'template.json'),
        JSON.stringify(config, null, 2)
      );

      const loaded = await loader.load('bad-pattern');

      expect(loaded.validation.valid).toBe(false);
      expect(loaded.validation.errors.some((e) => e.includes('invalid regex pattern'))).toBe(
        true
      );
    });
  });
});
