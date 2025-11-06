/**
 * Hooks Executor Tests
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { HooksExecutor } from '../../../src/engines/hooks.js';
import { getLogger } from '../../../src/utils/logger.js';
import type { TemplateHook, HookType } from '../../../src/types/template.js';

describe('HooksExecutor', () => {
  const logger = getLogger();
  let executor: HooksExecutor;

  beforeEach(() => {
    executor = new HooksExecutor(logger, 5000); // 5 second timeout for tests
  });

  describe('executeHooks', () => {
    test('executes successful hook', async () => {
      const hooks: TemplateHook[] = [
        {
          type: 'post-generate',
          command: 'echo "test"',
        },
      ];

      const results = await executor.executeHooks(hooks, 'post-generate', {
        cwd: process.cwd(),
      });

      expect(results).toHaveLength(1);
      expect(results[0]?.success).toBe(true);
      expect(results[0]?.exitCode).toBe(0);
      expect(results[0]?.stdout).toContain('test');
    });

    test('filters hooks by type', async () => {
      const hooks: TemplateHook[] = [
        { type: 'pre-generate', command: 'echo "pre"' },
        { type: 'post-generate', command: 'echo "post"' },
      ];

      const results = await executor.executeHooks(hooks, 'post-generate', {
        cwd: process.cwd(),
      });

      expect(results).toHaveLength(1);
      expect(results[0]?.command).toBe('echo "post"');
    });

    test('returns empty array when no matching hooks', async () => {
      const hooks: TemplateHook[] = [
        { type: 'pre-generate', command: 'echo "test"' },
      ];

      const results = await executor.executeHooks(hooks, 'post-generate', {
        cwd: process.cwd(),
      });

      expect(results).toEqual([]);
    });

    test('executes multiple hooks in order', async () => {
      const hooks: TemplateHook[] = [
        { type: 'post-generate', command: 'echo "first"' },
        { type: 'post-generate', command: 'echo "second"' },
        { type: 'post-generate', command: 'echo "third"' },
      ];

      const results = await executor.executeHooks(hooks, 'post-generate', {
        cwd: process.cwd(),
      });

      expect(results).toHaveLength(3);
      expect(results[0]?.stdout).toContain('first');
      expect(results[1]?.stdout).toContain('second');
      expect(results[2]?.stdout).toContain('third');
    });

    test('continues on error when continueOnError is true', async () => {
      const hooks: TemplateHook[] = [
        { type: 'post-generate', command: 'false', continueOnError: true },
        { type: 'post-generate', command: 'echo "after error"' },
      ];

      const results = await executor.executeHooks(hooks, 'post-generate', {
        cwd: process.cwd(),
      });

      expect(results).toHaveLength(2);
      expect(results[0]?.success).toBe(false);
      expect(results[1]?.success).toBe(true);
    });

    test('stops on error when continueOnError is false', async () => {
      const hooks: TemplateHook[] = [
        { type: 'post-generate', command: 'false', continueOnError: false },
        { type: 'post-generate', command: 'echo "never runs"' },
      ];

      await expect(
        executor.executeHooks(hooks, 'post-generate', {
          cwd: process.cwd(),
        })
      ).rejects.toThrow();
    });

    test('passes environment variables to hooks', async () => {
      const hooks: TemplateHook[] = [
        {
          type: 'post-generate',
          command: 'echo $TEST_VAR',
          env: { TEST_VAR: 'test-value' },
        },
      ];

      const results = await executor.executeHooks(hooks, 'post-generate', {
        cwd: process.cwd(),
      });

      expect(results[0]?.stdout).toContain('test-value');
    });

    test('uses custom working directory', async () => {
      const hooks: TemplateHook[] = [
        {
          type: 'post-generate',
          command: 'pwd',
          cwd: '/tmp',
        },
      ];

      const results = await executor.executeHooks(hooks, 'post-generate', {
        cwd: process.cwd(),
      });

      expect(results[0]?.stdout).toContain('/tmp');
    });
  });

  describe('validateHook', () => {
    test('validates valid hook', () => {
      const hook: TemplateHook = {
        type: 'post-generate',
        command: 'echo "test"',
      };

      const errors = executor.validateHook(hook);
      expect(errors).toEqual([]);
    });

    test('detects missing type', () => {
      const hook = {
        command: 'echo "test"',
      } as TemplateHook;

      const errors = executor.validateHook(hook);
      expect(errors.some((e) => e.includes('type'))).toBe(true);
    });

    test('detects missing command', () => {
      const hook = {
        type: 'post-generate',
      } as TemplateHook;

      const errors = executor.validateHook(hook);
      expect(errors.some((e) => e.includes('command'))).toBe(true);
    });

    test('detects invalid hook type', () => {
      const hook = {
        type: 'invalid-type' as HookType,
        command: 'echo "test"',
      };

      const errors = executor.validateHook(hook);
      expect(errors.some((e) => e.includes('Invalid hook type'))).toBe(true);
    });

    test('detects invalid timeout', () => {
      const hook: TemplateHook = {
        type: 'post-generate',
        command: 'echo "test"',
        timeout: -1,
      };

      const errors = executor.validateHook(hook);
      expect(errors.some((e) => e.includes('timeout'))).toBe(true);
    });
  });

  describe('isCommandAvailable', () => {
    test('detects available command', async () => {
      const available = await executor.isCommandAvailable('echo');
      expect(available).toBe(true);
    });

    test('detects unavailable command', async () => {
      const available = await executor.isCommandAvailable('nonexistent-command-xyz');
      expect(available).toBe(false);
    });
  });

  describe('summarizeResults', () => {
    test('summarizes successful results', () => {
      const results = [
        {
          type: 'post-generate' as HookType,
          command: 'cmd1',
          exitCode: 0,
          stdout: '',
          stderr: '',
          duration: 100,
          success: true,
        },
        {
          type: 'post-generate' as HookType,
          command: 'cmd2',
          exitCode: 0,
          stdout: '',
          stderr: '',
          duration: 200,
          success: true,
        },
      ];

      const summary = executor.summarizeResults(results);

      expect(summary.total).toBe(2);
      expect(summary.successful).toBe(2);
      expect(summary.failed).toBe(0);
      expect(summary.totalDuration).toBe(300);
    });

    test('summarizes mixed results', () => {
      const results = [
        {
          type: 'post-generate' as HookType,
          command: 'cmd1',
          exitCode: 0,
          stdout: '',
          stderr: '',
          duration: 100,
          success: true,
        },
        {
          type: 'post-generate' as HookType,
          command: 'cmd2',
          exitCode: 1,
          stdout: '',
          stderr: 'error',
          duration: 50,
          success: false,
        },
      ];

      const summary = executor.summarizeResults(results);

      expect(summary.total).toBe(2);
      expect(summary.successful).toBe(1);
      expect(summary.failed).toBe(1);
      expect(summary.totalDuration).toBe(150);
    });
  });
});
