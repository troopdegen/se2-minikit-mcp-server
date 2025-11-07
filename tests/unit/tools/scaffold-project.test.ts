import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { join } from 'path';
import { createScaffoldProjectHandler } from '../../../src/tools/scaffold-project.js';
import { createLogger } from '../../../src/utils/logger.js';
import type { TemplateEngine } from '../../../src/engines/index.js';
import type { ScaffoldProjectInput, ScaffoldProjectResponse } from '../../../src/types/tools.js';

describe('scaffold_project Tool', () => {
  let handler: ReturnType<typeof createScaffoldProjectHandler>;
  let mockEngine: TemplateEngine;
  let logger: ReturnType<typeof createLogger>;

  beforeEach(() => {
    logger = createLogger({ logLevel: 'error', prettyLogs: false });

    // Mock template engine
    mockEngine = {
      generate: mock(async () => ({
        template: 'basic',
        destination: '/tmp/test-project',
        files: ['package.json', 'contracts/YourContract.sol', 'nextjs/app/page.tsx'],
        variables: {},
      })),
    } as unknown as TemplateEngine;

    handler = createScaffoldProjectHandler(logger, mockEngine);
  });

  describe('Input Validation', () => {
    it('should reject invalid project names with uppercase', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'Invalid_Name', // Uppercase and underscore
        projectPath: '/tmp',
      };

      const result = (await handler(input)) as ScaffoldProjectResponse;

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('kebab-case');
    });

    it('should reject invalid project names with underscores', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'invalid_name', // Underscore not allowed
        projectPath: '/tmp',
      };

      const result = (await handler(input)) as ScaffoldProjectResponse;

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('kebab-case');
    });

    it('should reject project names that are too short', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'ab', // Only 2 characters
        projectPath: '/tmp',
      };

      const result = (await handler(input)) as ScaffoldProjectResponse;

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('3-50 characters');
    });

    it('should reject project names that are too long', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'a'.repeat(51), // 51 characters
        projectPath: '/tmp',
      };

      const result = (await handler(input)) as ScaffoldProjectResponse;

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('3-50 characters');
    });

    it('should accept valid kebab-case project names', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'my-dapp-123',
        projectPath: '/tmp',
      };

      const result = (await handler(input)) as ScaffoldProjectResponse;

      expect(result.success).toBe(true);
      expect(result.data?.projectName).toBe('my-dapp-123');
    });

    it('should validate template selection', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'test-project',
        projectPath: '/tmp',
        template: 'invalid' as any,
      };

      const result = (await handler(input)) as ScaffoldProjectResponse;

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid template');
    });

    it('should accept all valid templates', async () => {
      const validTemplates: Array<ScaffoldProjectInput['template']> = [
        'basic',
        'nft',
        'defi',
        'dao',
        'gaming',
        'social',
      ];

      for (const template of validTemplates) {
        const input: ScaffoldProjectInput = {
          projectName: `test-${template}`,
          projectPath: '/tmp',
          template,
        };

        const result = (await handler(input)) as ScaffoldProjectResponse;

        expect(result.success).toBe(true);
        expect(result.data?.template).toBe(template);
      }
    });
  });

  describe('Template Generation', () => {
    it('should call template engine with correct parameters', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'test-project',
        projectPath: '/tmp',
        template: 'basic',
        targetNetwork: 'baseSepolia',
      };

      await handler(input);

      expect(mockEngine.generate).toHaveBeenCalledWith({
        template: 'basic',
        destination: join('/tmp', 'test-project'),
        variables: expect.objectContaining({
          projectName: 'test-project',
          network: 'base-sepolia', // Mapped from camelCase to kebab-case
        }),
        overwrite: false,
      });
    });

    it('should use default values for optional parameters', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'minimal-project',
        projectPath: '/tmp',
      };

      const result = (await handler(input)) as ScaffoldProjectResponse;

      expect(result.success).toBe(true);
      expect(result.data?.template).toBe('basic');
      expect(result.data?.network).toBe('localhost');
      expect(result.data?.framework).toBe('hardhat');
      expect(result.data?.minikit).toBe(false);
    });

    it('should respect custom parameter values', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'custom-project',
        projectPath: '/tmp',
        template: 'nft',
        targetNetwork: 'base',
        contractFramework: 'foundry',
        includesMinikit: true,
      };

      const result = (await handler(input)) as ScaffoldProjectResponse;

      expect(result.success).toBe(true);
      expect(result.data?.template).toBe('nft');
      expect(result.data?.network).toBe('base');
      expect(result.data?.framework).toBe('foundry');
      expect(result.data?.minikit).toBe(true);
    });
  });

  describe('Response Formatting', () => {
    it('should return success response with file list', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'test-project',
        projectPath: '/tmp',
      };

      const result = (await handler(input)) as ScaffoldProjectResponse;

      expect(result.success).toBe(true);
      expect(result.data?.filesCreated).toBeArray();
      expect(result.data?.filesCreated.length).toBeGreaterThan(0);
      expect(result.data?.nextSteps).toBeArray();
      expect(result.data?.nextSteps.length).toBeGreaterThan(0);
    });

    it('should include basic next steps for non-Minikit projects', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'basic-project',
        projectPath: '/tmp',
        includesMinikit: false,
      };

      const result = (await handler(input)) as ScaffoldProjectResponse;

      expect(result.success).toBe(true);
      expect(result.data?.nextSteps.some((step) => step.includes('cd basic-project'))).toBe(true);
      expect(result.data?.nextSteps.some((step) => step.includes('yarn install'))).toBe(true);
      expect(result.data?.nextSteps.some((step) => step.includes('yarn chain'))).toBe(true);
    });

    it('should include Minikit-specific next steps', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'minikit-project',
        projectPath: '/tmp',
        includesMinikit: true,
      };

      const result = (await handler(input)) as ScaffoldProjectResponse;

      expect(result.success).toBe(true);
      expect(
        result.data?.nextSteps.some((step) => step.includes('Farcaster') || step.includes('Minikit'))
      ).toBe(true);
    });

    it('should include project path in response', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'path-test',
        projectPath: '/tmp',
      };

      const result = (await handler(input)) as ScaffoldProjectResponse;

      expect(result.success).toBe(true);
      expect(result.data?.projectPath).toBe(join('/tmp', 'path-test'));
    });
  });

  describe('Error Handling', () => {
    it('should handle template engine errors gracefully', async () => {
      mockEngine.generate = mock(async () => {
        throw new Error('Template generation failed');
      });

      const input: ScaffoldProjectInput = {
        projectName: 'error-project',
        projectPath: '/tmp',
      };

      const result = (await handler(input)) as ScaffoldProjectResponse;

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Template generation failed');
    });

    it('should return structured error responses', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'Invalid_Name',
        projectPath: '/tmp',
      };

      const result = (await handler(input)) as ScaffoldProjectResponse;

      expect(result.success).toBe(false);
      expect(result.error).toHaveProperty('code');
      expect(result.error).toHaveProperty('message');
    });

    it('should handle missing projectPath by using cwd', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'default-path',
        // projectPath omitted
      };

      const result = (await handler(input)) as ScaffoldProjectResponse;

      // Should succeed - uses process.cwd() as default
      expect(result.success).toBe(true);
    });
  });

  describe('Variable Mapping', () => {
    it('should map projectName to template variables', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'variable-test',
        projectPath: '/tmp',
      };

      await handler(input);

      expect(mockEngine.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            projectName: 'variable-test',
          }),
        })
      );
    });

    it('should map targetNetwork to template variables', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'network-test',
        projectPath: '/tmp',
        targetNetwork: 'base',
      };

      await handler(input);

      expect(mockEngine.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            network: 'base', // 'base' stays as 'base' in mapping
          }),
        })
      );
    });

    it('should include default author in variables', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'author-test',
        projectPath: '/tmp',
      };

      await handler(input);

      expect(mockEngine.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            author: expect.any(String),
          }),
        })
      );
    });

    it('should include description in variables', async () => {
      const input: ScaffoldProjectInput = {
        projectName: 'desc-test',
        projectPath: '/tmp',
      };

      await handler(input);

      expect(mockEngine.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            description: expect.stringContaining('Scaffold-ETH 2'),
          }),
        })
      );
    });
  });
});
