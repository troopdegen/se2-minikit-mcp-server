# Logging Infrastructure Guide

Production-ready structured logging system for the SE2-Minikit MCP Server.

## Overview

The logging infrastructure provides:
- **Structured JSON logging** with Pino for production
- **Human-readable logs** with pino-pretty for development
- **Performance monitoring** with timing and memory tracking
- **Context propagation** for request/user correlation
- **Sensitive data redaction** for security
- **MCP protocol compliance** (logs to stderr, never stdout)

## Quick Start

### Basic Usage

```typescript
import { getLogger } from './utils/logger.js';

const logger = getLogger();

// Simple logging
logger.info('Server started');
logger.debug('Debug information');
logger.warn('Warning message');
logger.error('Error occurred');
logger.fatal('Fatal error');

// Error logging
try {
  // operation
} catch (error) {
  logger.error(error); // Automatically serializes stack trace
}
```

### Logging with Context

```typescript
import { createLoggerWithContext } from './utils/logger.js';
import type { LogContext } from './types/logger.js';

// Create logger with default context
const context: LogContext = {
  requestId: 'req-12345',
  userId: 'user-789',
  operation: 'processPayment',
};

const logger = createLoggerWithContext(context);

// All logs will include this context
logger.info('Payment processing started');
logger.info('Payment validated', {
  metadata: { amount: 100, currency: 'USD' },
});
```

## Configuration

### Environment Variables

```bash
# Log level (trace, debug, info, warn, error, fatal)
LOG_LEVEL=info

# Log format (json for production, pretty for dev)
LOG_FORMAT=json

# Log file path (optional, defaults to stderr)
LOG_FILE=./logs/app.log

# Log rotation strategy (daily, size, none)
LOG_ROTATION=daily

# Maximum log files to keep
LOG_MAX_FILES=14

# Enable performance logging
LOG_PERFORMANCE=true

# Hostname (optional, defaults to system hostname)
HOSTNAME=mcp-server-01
```

### Programmatic Configuration

```typescript
import { createLogger } from './utils/logger.js';

const logger = createLogger(
  {
    logLevel: 'debug',
    prettyLogs: true,
  },
  {
    file: './logs/custom.log',
    redactPaths: ['customSecret', 'internalToken'],
    enablePerformance: true,
  }
);
```

## Features

### 1. Structured Logging

**Production (JSON)**:
```json
{
  "level": "INFO",
  "timestamp": "2025-11-06T18:00:00.000Z",
  "pid": 12345,
  "hostname": "mcp-server-01",
  "requestId": "req-12345",
  "userId": "user-789",
  "msg": "Payment processed successfully"
}
```

**Development (Pretty)**:
```
[2025-11-06 18:00:00] INFO: Payment processed successfully
  requestId: req-12345
  userId: user-789
```

### 2. Context Propagation

```typescript
import type { LogContext } from './types/logger.js';

// Define context for request tracing
const context: LogContext = {
  requestId: 'req-12345',      // Unique request identifier
  correlationId: 'corr-67890', // Cross-service correlation
  userId: 'user-789',          // User identifier
  operation: 'authenticate',   // Operation name
  metadata: {                  // Additional metadata
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
  },
};

const logger = createLoggerWithContext(context);
```

### 3. Child Loggers

```typescript
// Create base logger
const baseLogger = getLogger();

// Create child logger for a component
const componentLogger = baseLogger.child({ component: 'AuthService' });
componentLogger.info('Authentication started');

// Create nested child logger
const requestLogger = componentLogger.child({ requestId: 'req-123' });
requestLogger.info('Validating credentials');
```

### 4. Error Serialization

```typescript
import type { ErrorWithContext } from './types/logger.js';

// Basic error logging
try {
  throw new Error('Database connection failed');
} catch (error) {
  logger.error(error); // Includes stack trace
}

// Error with context
const error: ErrorWithContext = new Error('Payment failed');
error.context = {
  requestId: 'req-123',
  userId: 'user-789',
};
error.code = 'PAYMENT_ERROR';
error.statusCode = 500;

logger.error(error); // Includes context, code, statusCode
```

### 5. Sensitive Data Redaction

```typescript
// Automatic redaction of common sensitive fields
logger.info('User login', {
  metadata: {
    username: 'john@example.com',
    password: 'secret123',      // [REDACTED]
    apiKey: 'key-abc123',       // [REDACTED]
    token: 'jwt-xyz789',        // [REDACTED]
  },
});

// Custom redaction paths
const logger = createLogger(
  { logLevel: 'info', prettyLogs: false },
  { redactPaths: ['customSecret', 'internalData'] }
);
```

## Performance Monitoring

### Basic Performance Tracking

```typescript
import { PerformanceTimer } from './utils/performance.js';

// Manual timing
const timer = new PerformanceTimer('database-query', context);
const result = await queryDatabase();
const metrics = timer.stopAndLog(); // Logs duration and memory

console.log(metrics.duration); // milliseconds
console.log(metrics.memory);   // memory delta
```

### Measure Functions

```typescript
import { measure, measureAsync } from './utils/performance.js';

// Synchronous function
const result = measure('calculation', () => {
  return complexCalculation();
});
console.log(result.result);  // function result
console.log(result.metrics); // performance metrics

// Asynchronous function
const result = await measureAsync('api-call', async () => {
  return await fetch('https://api.example.com');
});
```

### Performance Tracking

```typescript
import { measureAndTrack, performanceTracker } from './utils/performance.js';

// Measure and track automatically
await measureAndTrack('process-payment', async () => {
  return await processPayment(data);
});

// Get statistics
const stats = performanceTracker.getStats('process-payment');
console.log(stats);
// {
//   operation: 'process-payment',
//   samples: 100,
//   avg: 250.5,
//   min: 150,
//   max: 500,
//   p50: 240,
//   p95: 450,
//   p99: 480
// }

// Export all stats
const allStats = performanceTracker.exportStats();
console.log(allStats);
```

### Decorator Pattern

```typescript
import { measurePerformance } from './utils/performance.js';

class PaymentService {
  @measurePerformance('process-payment', true)
  async processPayment(data: PaymentData) {
    // Implementation
    // Performance automatically logged
  }
}
```

## Advanced Usage

### Custom Log Formatter

```typescript
import {
  formatDuration,
  formatMemory,
  generateCorrelationId,
  formatMessage,
} from './utils/log-formatter.js';

// Format utilities
console.log(formatDuration(1500));        // "1.50s"
console.log(formatMemory(1048576));       // "1.00MB"
console.log(generateCorrelationId());     // "1699234567890-abc123def"

// Message formatting
const message = formatMessage(
  'Request {requestId} for user {userId}',
  { requestId: 'req-123', userId: 'user-789' }
);
```

### Performance Tracker Management

```typescript
import { PerformanceTracker } from './utils/performance.js';

// Create custom tracker
const tracker = new PerformanceTracker(100); // max 100 samples

// Record metrics
tracker.record({
  duration: 250,
  timestamp: Date.now(),
  operation: 'custom-op',
});

// Get statistics
const stats = tracker.getStats('custom-op');

// Get all tracked operations
const operations = tracker.getOperations();

// Clear specific operation
tracker.clear('custom-op');

// Clear all operations
tracker.clearAll();
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// DEBUG: Development/troubleshooting information
logger.debug('Cache miss for key', { metadata: { key: 'user:123' } });

// INFO: Normal operational messages
logger.info('Payment processed successfully', { metadata: { amount: 100 } });

// WARN: Warning conditions (recoverable)
logger.warn('Rate limit approaching', { metadata: { remaining: 10 } });

// ERROR: Error conditions (recoverable)
logger.error('Database query failed', { metadata: { query: 'SELECT...' } });

// FATAL: System unusable (unrecoverable)
logger.fatal('Critical system failure', { metadata: { reason: 'OOM' } });
```

### 2. Always Include Context

```typescript
// Bad
logger.info('User logged in');

// Good
logger.info('User logged in', {
  requestId: 'req-123',
  userId: 'user-789',
  metadata: { loginMethod: 'oauth' },
});
```

### 3. Use Child Loggers for Components

```typescript
// Create component-specific loggers
const authLogger = getLogger().child({ component: 'AuthService' });
const paymentLogger = getLogger().child({ component: 'PaymentService' });

// All logs from this component will include the component name
authLogger.info('Authentication successful');
```

### 4. Track Performance for Critical Operations

```typescript
// Track database queries
await measureAndTrack('db-query', async () => {
  return await db.query('SELECT...');
});

// Track API calls
await measureAndTrack('external-api', async () => {
  return await fetch('https://api.example.com');
});

// Review statistics regularly
const dbStats = performanceTracker.getStats('db-query');
if (dbStats.p95 > 1000) {
  logger.warn('Database queries are slow', { metadata: dbStats });
}
```

### 5. Never Log to stdout in MCP Server

```typescript
// WRONG - breaks MCP protocol
console.log('Message'); // stdout is reserved for MCP JSON-RPC

// CORRECT - use logger (goes to stderr or file)
logger.info('Message');
```

## Integration Examples

### MCP Server Integration

```typescript
import { getLogger, createLoggerWithContext } from './utils/logger.js';
import type { LogContext } from './types/logger.js';

class MCPServer {
  private logger = getLogger().child({ component: 'MCPServer' });

  async handleRequest(request: Request) {
    // Create request-specific logger
    const context: LogContext = {
      requestId: generateCorrelationId(),
      operation: request.method,
    };
    const requestLogger = createLoggerWithContext(context);

    requestLogger.info('Request received');

    try {
      const result = await this.processRequest(request, requestLogger);
      requestLogger.info('Request completed successfully');
      return result;
    } catch (error) {
      requestLogger.error(error);
      throw error;
    }
  }
}
```

### Tool Implementation

```typescript
import { measureAndTrack } from './utils/performance.js';
import type { LogContext } from './types/logger.js';

async function deployContract(args: DeployArgs, context: LogContext) {
  const logger = createLoggerWithContext(context);

  return await measureAndTrack('deploy-contract', async () => {
    logger.info('Starting contract deployment', {
      metadata: { contractName: args.name },
    });

    try {
      const tx = await deploy(args);
      logger.info('Contract deployed', {
        metadata: { address: tx.address, txHash: tx.hash },
      });
      return tx;
    } catch (error) {
      logger.error('Deployment failed', { metadata: { error } });
      throw error;
    }
  }, context);
}
```

## Testing

### Mock Logger

```typescript
import { createLogger, setLogger } from './utils/logger.js';

// In tests, create a test logger
const testLogger = createLogger({
  logLevel: 'debug',
  prettyLogs: false,
});

setLogger(testLogger);

// Run tests
// ...

// Reset to default
setLogger(getLogger());
```

## Troubleshooting

### Logs Not Appearing

1. Check log level: `LOG_LEVEL=debug`
2. Verify logs go to stderr: `node app.js 2> error.log`
3. Check file permissions if using `LOG_FILE`

### Performance Impact

1. Use appropriate log levels (avoid debug in production)
2. Disable performance tracking if not needed: `LOG_PERFORMANCE=false`
3. Limit metadata size in high-volume logs

### MCP Protocol Issues

1. Ensure no `console.log()` calls (use logger instead)
2. All logs must go to stderr or file, never stdout
3. Verify transport configuration: `destination: 2` (stderr)

## API Reference

See TypeScript types in:
- `src/types/logger.ts` - Core type definitions
- `src/utils/logger.ts` - Logger implementation
- `src/utils/log-formatter.ts` - Formatting utilities
- `src/utils/performance.ts` - Performance monitoring

## Support

For issues or questions:
1. Check tests: `tests/unit/utils/logger.test.ts`
2. Review examples in this guide
3. Consult Pino documentation: https://getpino.io
