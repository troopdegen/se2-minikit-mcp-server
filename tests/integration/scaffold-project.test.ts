import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { join } from 'path';
import { existsSync, rmSync, mkdirSync, readFileSync } from 'fs';
import { TemplateEngine } from '../../src/engines/index.js';
import { createScaffoldProjectHandler } from '../../src/tools/scaffold-project.js';
import { createLogger } from '../../src/utils/logger.js';
import type { ScaffoldProjectInput, ScaffoldProjectResponse } from '../../src/types/tools.js';

describe('scaffold_project Integration', () => {
  const testOutputDir = join(process.cwd(), 'test-output-scaffold');
  let engine: TemplateEngine;
  let handler: ReturnType<typeof createScaffoldProjectHandler>;

  beforeEach(() => {
    // Clean and recreate test output directory
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true, force: true });
    }
    mkdirSync(testOutputDir, { recursive: true });

    const logger = createLogger({ logLevel: 'error', prettyLogs: false });
    const templatesDir = join(process.cwd(), 'templates');
    engine = new TemplateEngine(logger, { templatesDir });
    handler = createScaffoldProjectHandler(logger, engine);
  });

  afterEach(() => {
    // Cleanup
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  it('should scaffold a complete basic project', async () => {
    const input: ScaffoldProjectInput = {
      projectName: 'test-basic-project',
      projectPath: testOutputDir,
      template: 'basic',
    };

    const result = (await handler(input)) as ScaffoldProjectResponse;

    expect(result.success).toBe(true);
    expect(result.data?.filesCreated.length).toBeGreaterThan(10);

    // Verify key files exist
    const projectPath = join(testOutputDir, 'test-basic-project');
    expect(existsSync(join(projectPath, 'package.json'))).toBe(true);
    expect(existsSync(join(projectPath, 'contracts', 'YourContract.sol'))).toBe(true);
    expect(existsSync(join(projectPath, 'nextjs', 'app', 'page.tsx'))).toBe(true);
    expect(existsSync(join(projectPath, '.gitignore'))).toBe(true);
    expect(existsSync(join(projectPath, '.env.example'))).toBe(true);
  });

  it('should reject creating project in existing directory', async () => {
    const projectPath = join(testOutputDir, 'existing-project');
    mkdirSync(projectPath, { recursive: true });

    const input: ScaffoldProjectInput = {
      projectName: 'existing-project',
      projectPath: testOutputDir,
    };

    const result = (await handler(input)) as ScaffoldProjectResponse;

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('already exists');
  });

  it('should generate project with custom variables', async () => {
    const input: ScaffoldProjectInput = {
      projectName: 'custom-project',
      projectPath: testOutputDir,
      template: 'basic',
      targetNetwork: 'base',
    };

    const result = (await handler(input)) as ScaffoldProjectResponse;

    expect(result.success).toBe(true);
    expect(result.data?.network).toBe('base');

    // Verify variables were substituted
    const projectPath = join(testOutputDir, 'custom-project');
    const packageJson = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf-8'));
    expect(packageJson.name).toBe('custom-project');
  });

  it('should substitute projectName in all files', async () => {
    const input: ScaffoldProjectInput = {
      projectName: 'substitution-test',
      projectPath: testOutputDir,
      template: 'basic',
    };

    const result = (await handler(input)) as ScaffoldProjectResponse;

    expect(result.success).toBe(true);

    const projectPath = join(testOutputDir, 'substitution-test');

    // Check package.json
    const packageJson = JSON.parse(readFileSync(join(projectPath, 'package.json'), 'utf-8'));
    expect(packageJson.name).toBe('substitution-test');

    // Check Next.js layout
    const layoutPath = join(projectPath, 'nextjs', 'app', 'layout.tsx');
    if (existsSync(layoutPath)) {
      const layoutContent = readFileSync(layoutPath, 'utf-8');
      expect(layoutContent).toContain('substitution-test');
    }
  });

  it('should create all contract files', async () => {
    const input: ScaffoldProjectInput = {
      projectName: 'contract-test',
      projectPath: testOutputDir,
      template: 'basic',
    };

    const result = (await handler(input)) as ScaffoldProjectResponse;

    expect(result.success).toBe(true);

    const projectPath = join(testOutputDir, 'contract-test');
    const contractsDir = join(projectPath, 'contracts');

    expect(existsSync(contractsDir)).toBe(true);
    expect(existsSync(join(contractsDir, 'YourContract.sol'))).toBe(true);
  });

  it('should create all deployment files', async () => {
    const input: ScaffoldProjectInput = {
      projectName: 'deploy-test',
      projectPath: testOutputDir,
      template: 'basic',
    };

    const result = (await handler(input)) as ScaffoldProjectResponse;

    expect(result.success).toBe(true);

    const projectPath = join(testOutputDir, 'deploy-test');
    const deployDir = join(projectPath, 'deploy');

    expect(existsSync(deployDir)).toBe(true);
    expect(existsSync(join(deployDir, '00_deploy_contract.ts'))).toBe(true);
  });

  it('should create all test files', async () => {
    const input: ScaffoldProjectInput = {
      projectName: 'test-files',
      projectPath: testOutputDir,
      template: 'basic',
    };

    const result = (await handler(input)) as ScaffoldProjectResponse;

    expect(result.success).toBe(true);

    const projectPath = join(testOutputDir, 'test-files');
    const testDir = join(projectPath, 'test');

    expect(existsSync(testDir)).toBe(true);
    expect(existsSync(join(testDir, 'YourContract.ts'))).toBe(true);
  });

  it('should create all Next.js frontend files', async () => {
    const input: ScaffoldProjectInput = {
      projectName: 'nextjs-test',
      projectPath: testOutputDir,
      template: 'basic',
    };

    const result = (await handler(input)) as ScaffoldProjectResponse;

    expect(result.success).toBe(true);

    const projectPath = join(testOutputDir, 'nextjs-test');
    const nextjsDir = join(projectPath, 'nextjs');

    expect(existsSync(join(nextjsDir, 'app', 'page.tsx'))).toBe(true);
    expect(existsSync(join(nextjsDir, 'app', 'layout.tsx'))).toBe(true);
    expect(existsSync(join(nextjsDir, 'app', 'globals.css'))).toBe(true);
    expect(existsSync(join(nextjsDir, 'components', 'Header.tsx'))).toBe(true);
  });

  it('should include dotfiles in generated project', async () => {
    const input: ScaffoldProjectInput = {
      projectName: 'dotfiles-test',
      projectPath: testOutputDir,
      template: 'basic',
    };

    const result = (await handler(input)) as ScaffoldProjectResponse;

    expect(result.success).toBe(true);

    const projectPath = join(testOutputDir, 'dotfiles-test');

    expect(existsSync(join(projectPath, '.gitignore'))).toBe(true);
    expect(existsSync(join(projectPath, '.env.example'))).toBe(true);
  });

  it('should return correct file count', async () => {
    const input: ScaffoldProjectInput = {
      projectName: 'count-test',
      projectPath: testOutputDir,
      template: 'basic',
    };

    const result = (await handler(input)) as ScaffoldProjectResponse;

    expect(result.success).toBe(true);
    expect(result.data?.filesCreated).toBeArray();

    // Should have at least: package.json, contract, deploy, test, frontend files
    expect(result.data?.filesCreated.length).toBeGreaterThanOrEqual(15);
  });

  it('should include projectName in response data', async () => {
    const input: ScaffoldProjectInput = {
      projectName: 'response-test',
      projectPath: testOutputDir,
      template: 'basic',
    };

    const result = (await handler(input)) as ScaffoldProjectResponse;

    expect(result.success).toBe(true);
    expect(result.data?.projectName).toBe('response-test');
    expect(result.data?.projectPath).toBe(join(testOutputDir, 'response-test'));
  });

  it('should include template in response data', async () => {
    const input: ScaffoldProjectInput = {
      projectName: 'template-test',
      projectPath: testOutputDir,
      template: 'basic',
    };

    const result = (await handler(input)) as ScaffoldProjectResponse;

    expect(result.success).toBe(true);
    expect(result.data?.template).toBe('basic');
  });

  it('should include configuration in response data', async () => {
    const input: ScaffoldProjectInput = {
      projectName: 'config-test',
      projectPath: testOutputDir,
      template: 'basic',
      targetNetwork: 'base',
      contractFramework: 'hardhat',
      includesMinikit: true,
    };

    const result = (await handler(input)) as ScaffoldProjectResponse;

    expect(result.success).toBe(true);
    expect(result.data?.network).toBe('base');
    expect(result.data?.framework).toBe('hardhat');
    expect(result.data?.minikit).toBe(true);
  });

  it('should reject invalid parent directory', async () => {
    const input: ScaffoldProjectInput = {
      projectName: 'invalid-parent',
      projectPath: '/nonexistent/path/that/does/not/exist',
    };

    const result = (await handler(input)) as ScaffoldProjectResponse;

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('Parent directory does not exist');
  });
});
