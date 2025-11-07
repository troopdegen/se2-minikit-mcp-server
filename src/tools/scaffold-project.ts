/**
 * scaffold_project MCP Tool
 *
 * Creates a new Scaffold-ETH 2 project with optional Base Minikit integration
 */

import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { TemplateEngine } from '../engines/index.js';
import type { Logger, ToolHandler } from '../types/server.js';
import { MCPError, ErrorCodes } from '../types/server.js';
import type {
  ScaffoldProjectInput,
  ScaffoldProjectResponse,
  ScaffoldProjectData,
} from '../types/tools.js';

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate project name
 * - Must be kebab-case (lowercase letters, numbers, hyphens only)
 * - Length 3-50 characters
 */
function validateProjectName(name: string): void {
  const pattern = /^[a-z0-9-]+$/;
  if (!pattern.test(name)) {
    throw new MCPError(
      'Project name must be kebab-case (lowercase letters, numbers, hyphens only)',
      ErrorCodes.INVALID_PARAMS,
      { projectName: name, pattern: pattern.source }
    );
  }

  if (name.length < 3 || name.length > 50) {
    throw new MCPError(
      'Project name must be 3-50 characters long',
      ErrorCodes.INVALID_PARAMS,
      { projectName: name, length: name.length }
    );
  }
}

/**
 * Validate and resolve project path
 * - Check if path already exists
 * - Check if parent directory exists
 */
async function validateProjectPath(
  basePath: string,
  projectName: string
): Promise<string> {
  const fullPath = join(basePath, projectName);

  // Check if path already exists
  if (existsSync(fullPath)) {
    throw new MCPError(
      'Project directory already exists',
      ErrorCodes.INVALID_PARAMS,
      { path: fullPath }
    );
  }

  // Check if parent directory exists
  const parentPath = dirname(fullPath);
  if (!existsSync(parentPath)) {
    throw new MCPError(
      'Parent directory does not exist',
      ErrorCodes.INVALID_PARAMS,
      { path: parentPath }
    );
  }

  return fullPath;
}

/**
 * Validate template selection
 */
function validateTemplate(template: string): void {
  const validTemplates = ['basic', 'nft', 'defi', 'dao', 'gaming', 'social'];
  if (!validTemplates.includes(template)) {
    throw new MCPError(
      `Invalid template: ${template}`,
      ErrorCodes.INVALID_PARAMS,
      { template, validTemplates }
    );
  }
}

// ============================================================================
// Variable Mapping
// ============================================================================

/**
 * Map tool input parameters to template variables
 * Converts tool parameter format to template variable format
 */
function mapToTemplateVariables(
  input: ScaffoldProjectInput
): Record<string, unknown> {
  // Convert camelCase network names to kebab-case for template compatibility
  const networkMap: Record<string, string> = {
    baseSepolia: 'base-sepolia',
    base: 'base',
    localhost: 'localhost',
  };

  const network = input.targetNetwork || 'baseSepolia';

  return {
    projectName: input.projectName,
    author: process.env.USER || 'Anonymous',
    description: `A decentralized application built with Scaffold-ETH 2`,
    network: networkMap[network] || 'base-sepolia',
    contractName: 'YourContract',
  };
}

// ============================================================================
// Post-Generation Hooks
// ============================================================================

/**
 * Run post-generation hooks (yarn install, git init)
 */
async function runPostGenerationHooks(
  projectPath: string,
  logger: Logger
): Promise<void> {
  logger.info('Running post-generation hooks', { projectPath });

  // Run yarn install
  try {
    logger.debug('Installing dependencies...');
    const installProc = Bun.spawn(['yarn', 'install'], {
      cwd: projectPath,
      stdout: 'pipe',
      stderr: 'pipe',
    });
    await installProc.exited;
    logger.info('Dependencies installed successfully');
  } catch (error) {
    logger.warn('Failed to install dependencies', error);
    // Don't throw - installation can be done manually
  }

  // Initialize git repository
  try {
    logger.debug('Initializing git repository...');
    const gitProc = Bun.spawn(['git', 'init'], {
      cwd: projectPath,
      stdout: 'pipe',
      stderr: 'pipe',
    });
    await gitProc.exited;
    logger.info('Git repository initialized');
  } catch (error) {
    logger.warn('Failed to initialize git', error);
    // Don't throw - git can be initialized manually
  }
}

/**
 * Generate next steps based on project configuration
 */
function generateNextSteps(input: ScaffoldProjectInput): string[] {
  const steps = [
    `cd ${input.projectName}`,
    'yarn install (if not already done)',
    'yarn chain (start local blockchain)',
    'yarn deploy (deploy contracts)',
    'cd nextjs && yarn install && yarn dev (start Next.js frontend)',
  ];

  if (input.includesMinikit) {
    steps.push('Configure Farcaster app credentials in .env');
    steps.push('See docs/minikit-setup.md for Minikit configuration');
  }

  return steps;
}

// ============================================================================
// Main Tool Handler
// ============================================================================

/**
 * Create scaffold_project tool handler
 *
 * @param logger - Logger instance
 * @param engine - Template engine instance
 * @returns Tool handler function
 */
export function createScaffoldProjectHandler(
  logger: Logger,
  engine: TemplateEngine
): ToolHandler {
  return async (args: unknown): Promise<ScaffoldProjectResponse> => {
    const input = args as ScaffoldProjectInput;

    logger.info('Scaffolding new project', {
      projectName: input.projectName,
      template: input.template || 'basic',
    });

    try {
      // 1. Validate inputs
      validateProjectName(input.projectName);
      validateTemplate(input.template || 'basic');

      const projectPath = await validateProjectPath(
        input.projectPath || process.cwd(),
        input.projectName
      );

      // 2. Map variables
      const variables = mapToTemplateVariables(input);

      // 3. Generate project from template
      const result = await engine.generate({
        template: input.template || 'basic',
        destination: projectPath,
        variables,
        overwrite: false,
      });

      logger.info('Project scaffolded successfully', {
        projectPath,
        filesCreated: result.files.length,
      });

      // 4. Run post-generation hooks (bun install, git init)
      // Skip hooks during testing to avoid timeouts
      if (process.env.NODE_ENV !== 'test') {
        await runPostGenerationHooks(projectPath, logger);
      }

      // 5. Format response
      const data: ScaffoldProjectData = {
        projectPath,
        projectName: input.projectName,
        template: input.template || 'basic',
        minikit: input.includesMinikit || false,
        framework: input.contractFramework || 'hardhat',
        network: input.targetNetwork || 'baseSepolia',
        filesCreated: result.files,
        nextSteps: generateNextSteps(input),
      };

      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error('Project scaffolding failed', error);

      if (error instanceof MCPError) {
        return {
          success: false,
          error: {
            code: String(error.code),
            message: error.message,
            details: error.data,
          },
        };
      }

      return {
        success: false,
        error: {
          code: String(ErrorCodes.INTERNAL_ERROR),
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  };
}
