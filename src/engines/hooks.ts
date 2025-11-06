/**
 * Template Hooks Executor
 *
 * Executes lifecycle hooks during template generation (pre/post generation, pre/post file).
 */

import { spawn } from 'node:child_process';
import type {
  TemplateHook,
  HookType,
  HookExecutionResult,
} from '../types/template.js';
import type { Logger } from '../types/server.js';
import { MCPError, ErrorCodes } from '../types/server.js';

/**
 * Hook execution context
 */
export interface HookExecutionContext {
  /** Working directory for hook execution */
  cwd: string;

  /** Environment variables */
  env?: Record<string, string>;

  /** Template variables available to hooks */
  variables?: Record<string, unknown>;
}

/**
 * Template hooks executor
 */
export class HooksExecutor {
  private logger: Logger;
  private defaultTimeout: number;

  constructor(logger: Logger, defaultTimeout = 30000) {
    this.logger = logger.child({ component: 'HooksExecutor' });
    this.defaultTimeout = defaultTimeout;
  }

  /**
   * Execute hooks of a specific type
   */
  async executeHooks(
    hooks: TemplateHook[],
    hookType: HookType,
    context: HookExecutionContext
  ): Promise<HookExecutionResult[]> {
    const results: HookExecutionResult[] = [];

    // Filter hooks by type
    const relevantHooks = hooks.filter((hook) => hook.type === hookType);

    if (relevantHooks.length === 0) {
      this.logger.debug('No hooks to execute', { hookType });
      return results;
    }

    this.logger.info('Executing hooks', { hookType, count: relevantHooks.length });

    for (const hook of relevantHooks) {
      try {
        const result = await this.executeHook(hook, context);
        results.push(result);

        if (!result.success && !hook.continueOnError) {
          throw new MCPError(
            `Hook failed: ${hook.command}`,
            ErrorCodes.INTERNAL_ERROR,
            { hookType, exitCode: result.exitCode, stderr: result.stderr }
          );
        }
      } catch (error) {
        if (error instanceof MCPError) {
          throw error;
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error('Hook execution failed', {
          hookType,
          command: hook.command,
          error: message,
        });

        if (!hook.continueOnError) {
          throw new MCPError(
            `Hook execution failed: ${message}`,
            ErrorCodes.INTERNAL_ERROR,
            { hookType, command: hook.command, error: message }
          );
        }

        // Add failed result but continue
        results.push({
          type: hook.type,
          command: hook.command,
          exitCode: -1,
          stdout: '',
          stderr: message,
          duration: 0,
          success: false,
        });
      }
    }

    return results;
  }

  /**
   * Execute a single hook
   */
  private async executeHook(
    hook: TemplateHook,
    context: HookExecutionContext
  ): Promise<HookExecutionResult> {
    const startTime = Date.now();

    this.logger.debug('Executing hook', {
      type: hook.type,
      command: hook.command,
      cwd: hook.cwd || context.cwd,
    });

    try {
      const result = await this.runCommand(
        hook.command,
        hook.cwd || context.cwd,
        {
          ...context.env,
          ...hook.env,
        },
        hook.timeout || this.defaultTimeout
      );

      const duration = Date.now() - startTime;

      this.logger.info('Hook completed', {
        type: hook.type,
        command: hook.command,
        exitCode: result.exitCode,
        duration,
      });

      return {
        type: hook.type,
        command: hook.command,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
        duration,
        success: result.exitCode === 0,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Unknown error';

      return {
        type: hook.type,
        command: hook.command,
        exitCode: -1,
        stdout: '',
        stderr: message,
        duration,
        success: false,
      };
    }
  }

  /**
   * Run a command and capture output
   */
  private runCommand(
    command: string,
    cwd: string,
    env: Record<string, string> = {},
    timeout: number
  ): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      // Merge environment variables
      const mergedEnv = {
        ...process.env,
        ...env,
      };

      // Spawn process
      const child = spawn(command, {
        cwd,
        env: mergedEnv,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      // Collect stdout
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      // Collect stderr
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      // Handle process completion
      child.on('close', (code) => {
        resolve({
          exitCode: code || 0,
          stdout,
          stderr,
        });
      });

      // Handle process errors
      child.on('error', (error) => {
        reject(error);
      });

      // Set timeout
      const timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Hook timed out after ${timeout}ms`));
      }, timeout);

      // Clear timeout on completion
      child.on('close', () => {
        clearTimeout(timeoutId);
      });
    });
  }

  /**
   * Validate hook configuration
   */
  validateHook(hook: TemplateHook): string[] {
    const errors: string[] = [];

    if (!hook.type) {
      errors.push('Hook missing required field: type');
    }

    if (!hook.command) {
      errors.push('Hook missing required field: command');
    }

    const validTypes: HookType[] = ['pre-generate', 'post-generate', 'pre-file', 'post-file'];
    if (hook.type && !validTypes.includes(hook.type)) {
      errors.push(`Invalid hook type: ${hook.type}`);
    }

    if (hook.timeout !== undefined && hook.timeout <= 0) {
      errors.push('Hook timeout must be positive');
    }

    return errors;
  }

  /**
   * Check if command is available
   */
  async isCommandAvailable(command: string): Promise<boolean> {
    try {
      // Extract first word (command name) from full command
      const cmdName = command.split(' ')[0];

      const result = await this.runCommand(
        `which ${cmdName}`,
        process.cwd(),
        {},
        5000
      );

      return result.exitCode === 0;
    } catch {
      return false;
    }
  }

  /**
   * Get hook execution summary
   */
  summarizeResults(results: HookExecutionResult[]): {
    total: number;
    successful: number;
    failed: number;
    totalDuration: number;
  } {
    return {
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
    };
  }
}

/**
 * Create a hooks executor instance
 */
export function createHooksExecutor(logger: Logger, defaultTimeout?: number): HooksExecutor {
  return new HooksExecutor(logger, defaultTimeout);
}
