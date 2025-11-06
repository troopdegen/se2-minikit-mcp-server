/**
 * Performance Monitoring Utilities
 * Track function execution time and memory usage
 */

import type { PerformanceMetrics, TimedResult, LogContext } from '../types/logger.js';
import { getLogger } from './logger.js';
import { formatDuration, formatMemory } from './log-formatter.js';

/**
 * Get current memory usage
 */
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external,
    rss: usage.rss,
  };
}

/**
 * Calculate memory delta between two snapshots
 */
function calculateMemoryDelta(
  before: ReturnType<typeof getMemoryUsage>,
  after: ReturnType<typeof getMemoryUsage>
) {
  return {
    heapUsed: after.heapUsed - before.heapUsed,
    heapTotal: after.heapTotal - before.heapTotal,
    external: after.external - before.external,
    rss: after.rss - before.rss,
  };
}

/**
 * Performance timer for tracking operation duration
 */
export class PerformanceTimer {
  private startTime: number;
  private startMemory?: ReturnType<typeof getMemoryUsage>;
  private operation: string;
  private context?: LogContext;

  constructor(operation: string, context?: LogContext, trackMemory = true) {
    this.operation = operation;
    this.context = context;
    this.startTime = performance.now();
    this.startMemory = trackMemory ? getMemoryUsage() : undefined;
  }

  /**
   * Stop the timer and return metrics
   */
  stop(): PerformanceMetrics {
    const endTime = performance.now();
    const duration = endTime - this.startTime;

    const metrics: PerformanceMetrics = {
      duration,
      timestamp: Date.now(),
      operation: this.operation,
      context: this.context,
    };

    if (this.startMemory) {
      const endMemory = getMemoryUsage();
      metrics.memory = calculateMemoryDelta(this.startMemory, endMemory);
    }

    return metrics;
  }

  /**
   * Stop the timer and log the metrics
   */
  stopAndLog(level: 'debug' | 'info' = 'debug'): PerformanceMetrics {
    const metrics = this.stop();
    const logger = getLogger();

    const message = `Operation completed: ${this.operation} in ${formatDuration(metrics.duration)}`;
    const logContext = {
      ...this.context,
      metadata: {
        ...this.context?.metadata,
        duration: metrics.duration,
        durationFormatted: formatDuration(metrics.duration),
        ...(metrics.memory && {
          memoryDelta: {
            heapUsed: formatMemory(metrics.memory.heapUsed),
            heapTotal: formatMemory(metrics.memory.heapTotal),
            rss: formatMemory(metrics.memory.rss),
          },
        }),
      },
    };

    if (level === 'info') {
      logger.info(message, logContext);
    } else {
      logger.debug(message, logContext);
    }

    return metrics;
  }
}

/**
 * Measure the execution time of a synchronous function
 */
export function measure<T>(
  operation: string,
  fn: () => T,
  context?: LogContext,
  trackMemory = true
): TimedResult<T> {
  const timer = new PerformanceTimer(operation, context, trackMemory);
  const result = fn();
  const metrics = timer.stop();

  return {
    result,
    metrics,
  };
}

/**
 * Measure the execution time of an asynchronous function
 */
export async function measureAsync<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: LogContext,
  trackMemory = true
): Promise<TimedResult<T>> {
  const timer = new PerformanceTimer(operation, context, trackMemory);
  const result = await fn();
  const metrics = timer.stop();

  return {
    result,
    metrics,
  };
}

/**
 * Decorator to measure function execution time
 * Usage: @measurePerformance('operationName')
 */
export function measurePerformance(operation: string, trackMemory = true) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const timer = new PerformanceTimer(operation, undefined, trackMemory);
      try {
        const result = await originalMethod.apply(this, args);
        timer.stopAndLog();
        return result;
      } catch (error) {
        timer.stopAndLog();
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Track performance metrics over time with statistical analysis
 */
export class PerformanceTracker {
  private metrics: Map<string, PerformanceMetrics[]>;
  private maxSamples: number;

  constructor(maxSamples = 100) {
    this.metrics = new Map();
    this.maxSamples = maxSamples;
  }

  /**
   * Record a performance metric
   */
  record(metrics: PerformanceMetrics): void {
    const samples = this.metrics.get(metrics.operation) || [];
    samples.push(metrics);

    // Keep only the most recent samples
    if (samples.length > this.maxSamples) {
      samples.shift();
    }

    this.metrics.set(metrics.operation, samples);
  }

  /**
   * Get statistics for an operation
   */
  getStats(operation: string): {
    operation: string;
    samples: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const samples = this.metrics.get(operation);
    if (!samples || samples.length === 0) return null;

    const durations = samples.map((m) => m.duration).sort((a, b) => a - b);
    const sum = durations.reduce((acc, d) => acc + d, 0);

    return {
      operation,
      samples: durations.length,
      avg: sum / durations.length,
      min: durations[0] ?? 0,
      max: durations[durations.length - 1] ?? 0,
      p50: durations[Math.floor(durations.length * 0.5)] ?? 0,
      p95: durations[Math.floor(durations.length * 0.95)] ?? 0,
      p99: durations[Math.floor(durations.length * 0.99)] ?? 0,
    };
  }

  /**
   * Get all tracked operations
   */
  getOperations(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Clear metrics for an operation
   */
  clear(operation: string): void {
    this.metrics.delete(operation);
  }

  /**
   * Clear all metrics
   */
  clearAll(): void {
    this.metrics.clear();
  }

  /**
   * Export all statistics
   */
  exportStats(): Record<string, ReturnType<PerformanceTracker['getStats']>> {
    const stats: Record<string, ReturnType<PerformanceTracker['getStats']>> = {};
    for (const operation of this.getOperations()) {
      stats[operation] = this.getStats(operation);
    }
    return stats;
  }
}

/**
 * Global performance tracker instance
 */
export const performanceTracker = new PerformanceTracker();

/**
 * Measure and track function execution
 */
export async function measureAndTrack<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: LogContext,
  trackMemory = true
): Promise<T> {
  const result = await measureAsync(operation, fn, context, trackMemory);
  performanceTracker.record(result.metrics);
  return result.result;
}
