/**
 * Tests for performance monitoring utilities
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import {
  PerformanceTimer,
  measure,
  measureAsync,
  PerformanceTracker,
  performanceTracker,
  measureAndTrack,
} from '../../../src/utils/performance.js';
import type { LogContext } from '../../../src/types/logger.js';

describe('PerformanceTimer', () => {
  it('should measure operation duration', async () => {
    const timer = new PerformanceTimer('test-operation');
    await new Promise((resolve) => setTimeout(resolve, 10));
    const metrics = timer.stop();

    expect(metrics.operation).toBe('test-operation');
    expect(metrics.duration).toBeGreaterThan(0);
    expect(metrics.timestamp).toBeDefined();
  });

  it('should track memory usage when enabled', () => {
    const timer = new PerformanceTimer('test-operation', undefined, true);
    const metrics = timer.stop();

    expect(metrics.memory).toBeDefined();
    expect(metrics.memory?.heapUsed).toBeDefined();
    expect(metrics.memory?.heapTotal).toBeDefined();
    expect(metrics.memory?.rss).toBeDefined();
  });

  it('should not track memory when disabled', () => {
    const timer = new PerformanceTimer('test-operation', undefined, false);
    const metrics = timer.stop();

    expect(metrics.memory).toBeUndefined();
  });

  it('should include context in metrics', () => {
    const context: LogContext = {
      requestId: 'req-123',
      userId: 'user-456',
    };

    const timer = new PerformanceTimer('test-operation', context);
    const metrics = timer.stop();

    expect(metrics.context).toEqual(context);
  });

  it('should stop and log metrics', async () => {
    const timer = new PerformanceTimer('test-operation');
    await new Promise((resolve) => setTimeout(resolve, 10));

    const metrics = timer.stopAndLog('debug');

    expect(metrics.duration).toBeGreaterThan(0);
  });
});

describe('measure', () => {
  it('should measure synchronous function execution', () => {
    const fn = () => {
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += i;
      }
      return sum;
    };

    const result = measure('test-sync', fn);

    expect(result.result).toBe(499500);
    expect(result.metrics.duration).toBeGreaterThan(0);
    expect(result.metrics.operation).toBe('test-sync');
  });

  it('should measure with context', () => {
    const context: LogContext = {
      requestId: 'req-123',
    };

    const result = measure('test-sync', () => 42, context);

    expect(result.result).toBe(42);
    expect(result.metrics.context).toEqual(context);
  });

  it('should track memory when enabled', () => {
    const result = measure('test-sync', () => 42, undefined, true);

    expect(result.metrics.memory).toBeDefined();
  });

  it('should not track memory when disabled', () => {
    const result = measure('test-sync', () => 42, undefined, false);

    expect(result.metrics.memory).toBeUndefined();
  });
});

describe('measureAsync', () => {
  it('should measure asynchronous function execution', async () => {
    const fn = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return 'result';
    };

    const result = await measureAsync('test-async', fn);

    expect(result.result).toBe('result');
    expect(result.metrics.duration).toBeGreaterThanOrEqual(10);
    expect(result.metrics.operation).toBe('test-async');
  });

  it('should measure with context', async () => {
    const context: LogContext = {
      correlationId: 'corr-456',
    };

    const result = await measureAsync('test-async', async () => 'done', context);

    expect(result.result).toBe('done');
    expect(result.metrics.context).toEqual(context);
  });

  it('should handle async function errors', async () => {
    const fn = async () => {
      throw new Error('Test error');
    };

    try {
      await measureAsync('test-async-error', fn);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Test error');
    }
  });
});

describe('PerformanceTracker', () => {
  let tracker: PerformanceTracker;

  beforeEach(() => {
    tracker = new PerformanceTracker(10);
  });

  it('should record performance metrics', () => {
    const metrics = {
      duration: 100,
      timestamp: Date.now(),
      operation: 'test-op',
    };

    tracker.record(metrics);
    const stats = tracker.getStats('test-op');

    expect(stats).toBeDefined();
    expect(stats?.samples).toBe(1);
    expect(stats?.avg).toBe(100);
  });

  it('should calculate statistics correctly', () => {
    const durations = [10, 20, 30, 40, 50];

    for (const duration of durations) {
      tracker.record({
        duration,
        timestamp: Date.now(),
        operation: 'test-op',
      });
    }

    const stats = tracker.getStats('test-op');

    expect(stats).toBeDefined();
    expect(stats?.samples).toBe(5);
    expect(stats?.avg).toBe(30);
    expect(stats?.min).toBe(10);
    expect(stats?.max).toBe(50);
    expect(stats?.p50).toBe(30);
  });

  it('should limit samples to maxSamples', () => {
    const tracker = new PerformanceTracker(3);

    for (let i = 0; i < 5; i++) {
      tracker.record({
        duration: i * 10,
        timestamp: Date.now(),
        operation: 'test-op',
      });
    }

    const stats = tracker.getStats('test-op');
    expect(stats?.samples).toBe(3);
  });

  it('should track multiple operations', () => {
    tracker.record({ duration: 10, timestamp: Date.now(), operation: 'op-1' });
    tracker.record({ duration: 20, timestamp: Date.now(), operation: 'op-2' });
    tracker.record({ duration: 30, timestamp: Date.now(), operation: 'op-3' });

    const operations = tracker.getOperations();

    expect(operations).toHaveLength(3);
    expect(operations).toContain('op-1');
    expect(operations).toContain('op-2');
    expect(operations).toContain('op-3');
  });

  it('should clear specific operation', () => {
    tracker.record({ duration: 10, timestamp: Date.now(), operation: 'op-1' });
    tracker.record({ duration: 20, timestamp: Date.now(), operation: 'op-2' });

    tracker.clear('op-1');

    expect(tracker.getStats('op-1')).toBeNull();
    expect(tracker.getStats('op-2')).toBeDefined();
  });

  it('should clear all operations', () => {
    tracker.record({ duration: 10, timestamp: Date.now(), operation: 'op-1' });
    tracker.record({ duration: 20, timestamp: Date.now(), operation: 'op-2' });

    tracker.clearAll();

    expect(tracker.getOperations()).toHaveLength(0);
  });

  it('should export all statistics', () => {
    tracker.record({ duration: 10, timestamp: Date.now(), operation: 'op-1' });
    tracker.record({ duration: 20, timestamp: Date.now(), operation: 'op-2' });

    const stats = tracker.exportStats();

    expect(Object.keys(stats)).toHaveLength(2);
    expect(stats['op-1']).toBeDefined();
    expect(stats['op-2']).toBeDefined();
  });

  it('should return null for unknown operation', () => {
    const stats = tracker.getStats('unknown-op');
    expect(stats).toBeNull();
  });
});

describe('Global performanceTracker', () => {
  it('should be defined', () => {
    expect(performanceTracker).toBeDefined();
    expect(performanceTracker).toBeInstanceOf(PerformanceTracker);
  });

  it('should track metrics globally', () => {
    performanceTracker.record({
      duration: 100,
      timestamp: Date.now(),
      operation: 'global-test',
    });

    const stats = performanceTracker.getStats('global-test');
    expect(stats).toBeDefined();
    expect(stats?.samples).toBeGreaterThanOrEqual(1);

    // Cleanup
    performanceTracker.clear('global-test');
  });
});

describe('measureAndTrack', () => {
  it('should measure and track async function', async () => {
    const operation = 'track-test-' + Date.now();
    const fn = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return 'tracked';
    };

    const result = await measureAndTrack(operation, fn);

    expect(result).toBe('tracked');

    const stats = performanceTracker.getStats(operation);
    expect(stats).toBeDefined();
    expect(stats?.samples).toBeGreaterThanOrEqual(1);

    // Cleanup
    performanceTracker.clear(operation);
  });

  it('should track with context', async () => {
    const operation = 'track-context-test-' + Date.now();
    const context: LogContext = {
      requestId: 'req-123',
    };

    await measureAndTrack(operation, async () => 'done', context);

    const stats = performanceTracker.getStats(operation);
    expect(stats).toBeDefined();

    // Cleanup
    performanceTracker.clear(operation);
  });
});

describe('Performance edge cases', () => {
  it('should handle very fast operations', () => {
    const result = measure('fast-op', () => 42);
    expect(result.metrics.duration).toBeGreaterThanOrEqual(0);
  });

  it('should handle operations with errors', () => {
    try {
      measure('error-op', () => {
        throw new Error('Test error');
      });
      expect(true).toBe(false); // Should not reach
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should handle async operations with errors', async () => {
    try {
      await measureAsync('async-error-op', async () => {
        throw new Error('Async test error');
      });
      expect(true).toBe(false); // Should not reach
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
