/**
 * TypeScript types for File Manager operations
 * Provides type safety for file system operations with backup/rollback support
 */

/**
 * Represents the result of a file operation
 */
export interface FileOperationResult {
  success: boolean;
  path: string;
  operation: FileOperation;
  error?: string;
  backupId?: string;
}

/**
 * Types of file operations
 */
export enum FileOperation {
  READ = 'read',
  WRITE = 'write',
  APPEND = 'append',
  DELETE = 'delete',
  MKDIR = 'mkdir',
  COPY = 'copy',
  MOVE = 'move',
}

/**
 * File operation audit log entry
 */
export interface FileAuditEntry {
  timestamp: Date;
  operation: FileOperation;
  path: string;
  success: boolean;
  backupId?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Backup metadata
 */
export interface BackupMetadata {
  id: string;
  timestamp: Date;
  operation: FileOperation;
  originalPath: string;
  backupPath: string;
  originalContent?: string | Uint8Array;
  originalStats?: FileStats;
}

/**
 * File statistics
 */
export interface FileStats {
  size: number;
  mode: number;
  mtime: Date;
  ctime: Date;
  isFile: boolean;
  isDirectory: boolean;
}

/**
 * Path validation result
 */
export interface PathValidationResult {
  isValid: boolean;
  normalizedPath: string;
  error?: string;
}

/**
 * Transaction operation
 */
export interface TransactionOperation {
  type: FileOperation;
  path: string;
  content?: string | Uint8Array;
  options?: FileOperationOptions;
}

/**
 * Transaction result
 */
export interface TransactionResult {
  success: boolean;
  operations: FileOperationResult[];
  error?: string;
  rollbackPerformed?: boolean;
}

/**
 * Options for file operations
 */
export interface FileOperationOptions {
  encoding?: BufferEncoding;
  mode?: number;
  flag?: string;
  createBackup?: boolean;
  preservePermissions?: boolean;
}

/**
 * File Manager configuration
 */
export interface FileManagerConfig {
  projectRoot: string;
  backupDir?: string;
  enableAuditLog?: boolean;
  maxBackupAge?: number; // in milliseconds
  allowedOperations?: FileOperation[];
}

/**
 * Rollback options
 */
export interface RollbackOptions {
  backupId?: string;
  timestamp?: Date;
  deleteBackupAfterRestore?: boolean;
}
