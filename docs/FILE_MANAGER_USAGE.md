# File Manager Utility - Usage Guide

## Overview

The File Manager Utility provides safe, transactional file operations with automatic backup/rollback and comprehensive security features for the SE2-Minikit MCP Server project.

## Key Features

- **Path Security**: Automatic validation prevents directory traversal attacks
- **Backup/Rollback**: All destructive operations create backups before execution
- **Transactional Operations**: Multiple operations succeed or fail atomically
- **Audit Logging**: Comprehensive logging of all file operations
- **Permission Handling**: Preserves or sets file permissions as needed

## Quick Start

```typescript
import { FileManager } from './utils/file-manager.ts';

// Initialize
const fileManager = new FileManager({
  projectRoot: '/path/to/project',
  enableAuditLog: true,
});
await fileManager.initialize();

// Write file (with automatic backup)
const result = await fileManager.writeFile('config.json', '{"key": "value"}');
if (result.success) {
  console.log('File written successfully');
}
```

## Basic Operations

### Read File
```typescript
const content = await fileManager.readFile('package.json');
```

### Write File
```typescript
const result = await fileManager.writeFile('output.txt', 'content', {
  mode: 0o644, // Optional: set permissions
  createBackup: true, // Default: true
});
```

### Append to File
```typescript
const result = await fileManager.appendFile('log.txt', 'New log entry\n');
```

### Delete File
```typescript
const result = await fileManager.deleteFile('temp.txt');
// Backup is automatically created for rollback
```

### Create Directory
```typescript
const result = await fileManager.createDirectory('src/components', {
  mode: 0o755, // Optional: set permissions
});
```

### Copy File
```typescript
const result = await fileManager.copyFile('source.txt', 'dest.txt', {
  preservePermissions: true,
});
```

### Move File
```typescript
const result = await fileManager.moveFile('old.txt', 'new.txt');
```

## Advanced Features

### Transactional Operations

Execute multiple operations atomically - all succeed or all are rolled back:

```typescript
const result = await fileManager.executeTransaction([
  { type: FileOperation.MKDIR, path: 'src' },
  { type: FileOperation.WRITE, path: 'src/index.ts', content: 'export {}' },
  { type: FileOperation.COPY, path: 'template.json', dest: 'src/config.json' },
]);

if (result.success) {
  console.log('All operations completed');
} else {
  console.log('Transaction rolled back:', result.error);
}
```

### Manual Rollback

```typescript
const result = await fileManager.writeFile('important.txt', 'new content');

if (needsRollback) {
  const backupManager = fileManager.getBackupManager();
  await backupManager.restoreBackup(result.backupId!);
}
```

### Audit Log Access

```typescript
const auditLog = fileManager.getAuditLog();
auditLog.forEach(entry => {
  console.log(`${entry.timestamp}: ${entry.operation} - ${entry.path}`);
});
```

## Security Features

### Automatic Path Validation

All paths are automatically validated to prevent security issues:

```typescript
// These will automatically fail with descriptive errors:
await fileManager.writeFile('../../../etc/passwd', 'hack'); // ❌ Outside project
await fileManager.writeFile('/etc/passwd', 'hack');         // ❌ Absolute path
await fileManager.writeFile('test\0.txt', 'hack');          // ❌ Null byte injection
```

### Sandboxing

All operations are sandboxed to the project root directory:

```typescript
const fileManager = new FileManager({
  projectRoot: '/Users/mel/code/project',
});

// Only paths within /Users/mel/code/project are allowed
```

### Operation Restrictions

Restrict allowed operations for security:

```typescript
const readOnlyManager = new FileManager({
  projectRoot: '/path/to/project',
  allowedOperations: [FileOperation.READ],
});

// Write operations will fail
await readOnlyManager.writeFile('test.txt', 'content'); // ❌ Not allowed
```

## Configuration Options

```typescript
interface FileManagerConfig {
  projectRoot: string;              // Required: Base directory
  backupDir?: string;                // Optional: Backup storage location
  enableAuditLog?: boolean;          // Optional: Enable audit logging (default: true)
  maxBackupAge?: number;             // Optional: Max backup age in ms (default: 24h)
  allowedOperations?: FileOperation[]; // Optional: Restrict operations
}
```

## Integration Examples

### Template Engine Integration

```typescript
// Generate project files transactionally
const files = [
  { type: FileOperation.MKDIR, path: 'src/components' },
  { type: FileOperation.WRITE, path: 'src/index.ts', content: indexContent },
  { type: FileOperation.WRITE, path: 'src/components/Button.tsx', content: buttonContent },
];

const result = await fileManager.executeTransaction(files);
```

### MCP Server Integration

```typescript
// Safe file operations for MCP tools
async function handleFileWrite(path: string, content: string) {
  const result = await fileManager.writeFile(path, content);

  if (!result.success) {
    throw new Error(`File operation failed: ${result.error}`);
  }

  return {
    success: true,
    backupId: result.backupId,
  };
}
```

## Error Handling

All operations return a `FileOperationResult`:

```typescript
interface FileOperationResult {
  success: boolean;
  path: string;
  operation: FileOperation;
  error?: string;        // Present if success is false
  backupId?: string;     // Present if backup was created
}
```

Example error handling:

```typescript
const result = await fileManager.writeFile(userPath, userContent);

if (!result.success) {
  console.error(`Operation failed: ${result.error}`);
  // Handle error (e.g., notify user, log, retry)
} else {
  console.log(`File written: ${result.path}`);
  console.log(`Backup ID: ${result.backupId}`);
}
```

## Best Practices

1. **Always initialize**: Call `await fileManager.initialize()` before operations
2. **Check results**: Always check `result.success` before assuming success
3. **Use transactions**: For multiple related operations, use `executeTransaction()`
4. **Preserve backups**: Keep important backup IDs for potential rollback
5. **Enable audit logs**: Keep audit logging enabled for debugging and security
6. **Validate user input**: Even though paths are validated, sanitize user input
7. **Handle errors gracefully**: Provide meaningful error messages to users

## Testing

Comprehensive tests are available in `tests/unit/utils/file-manager.test.ts`:

```bash
# Run file manager tests
bun test tests/unit/utils/file-manager.test.ts

# Run all tests
bun test
```

## Files Created

- `/src/types/file-manager.ts` - TypeScript type definitions
- `/src/utils/path-validator.ts` - Path security validation
- `/src/utils/backup.ts` - Backup and rollback system
- `/src/utils/file-manager.ts` - Main FileManager class
- `/tests/unit/utils/file-manager.test.ts` - Comprehensive tests

## Security Considerations

1. **Never disable backups** for destructive operations in production
2. **Always validate user-provided paths** even though automatic validation exists
3. **Monitor audit logs** for suspicious patterns
4. **Set restrictive permissions** (0o644 for files, 0o755 for directories)
5. **Keep backup directory secure** to prevent unauthorized access
6. **Clean up old backups** regularly using `backupManager.cleanupOldBackups()`

## Support

For questions or issues, refer to:
- Type definitions: `src/types/file-manager.ts`
- Test examples: `tests/unit/utils/file-manager.test.ts`
- Implementation: `src/utils/file-manager.ts`
