/**
 * File Manager - Safe file system operations with backup/rollback and security
 * Provides transactional file operations with comprehensive audit logging
 */

import { join, dirname } from 'path';
import { PathValidator } from './path-validator.ts';
import { BackupManager } from './backup.ts';
import {
  FileOperation,
  type FileManagerConfig,
  type FileOperationResult,
  type FileAuditEntry,
  type TransactionOperation,
  type TransactionResult,
  type FileOperationOptions,
} from '../types/file-manager.ts';

export class FileManager {
  private validator: PathValidator;
  private backupManager: BackupManager;
  private config: Required<FileManagerConfig>;
  private auditLog: FileAuditEntry[];

  constructor(config: FileManagerConfig) {
    // Set defaults
    this.config = {
      projectRoot: config.projectRoot,
      backupDir: config.backupDir || join(config.projectRoot, '.backups'),
      enableAuditLog: config.enableAuditLog ?? true,
      maxBackupAge: config.maxBackupAge ?? 24 * 60 * 60 * 1000, // 24 hours
      allowedOperations: config.allowedOperations || Object.values(FileOperation),
    };

    this.validator = new PathValidator(this.config.projectRoot);
    this.backupManager = new BackupManager(this.config.backupDir, this.config.maxBackupAge);
    this.auditLog = [];
  }

  /**
   * Initializes the file manager (creates backup directory)
   */
  async initialize(): Promise<void> {
    await this.ensureDirectory(this.config.backupDir);
  }

  /**
   * Reads a file safely
   */
  async readFile(path: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    const validPath = this.validatePath(path);
    this.checkOperationAllowed(FileOperation.READ);

    try {
      const file = Bun.file(validPath);
      const exists = await file.exists();

      if (!exists) {
        throw new Error(`File not found: ${path}`);
      }

      const content = await file.text();

      this.addAuditEntry({
        timestamp: new Date(),
        operation: FileOperation.READ,
        path: validPath,
        success: true,
      });

      return content;
    } catch (error) {
      this.addAuditEntry({
        timestamp: new Date(),
        operation: FileOperation.READ,
        path: validPath,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Writes to a file safely with backup
   */
  async writeFile(
    path: string,
    content: string | Uint8Array,
    options: FileOperationOptions = {},
  ): Promise<FileOperationResult> {
    const createBackup = options.createBackup ?? true;
    let backupId: string | undefined;
    let validPath: string = path;

    try {
      validPath = this.validatePath(path);
      this.checkOperationAllowed(FileOperation.WRITE);
      // Create backup if enabled
      if (createBackup) {
        const backup = await this.backupManager.createBackup(validPath, FileOperation.WRITE);
        backupId = backup?.id;
      }

      // Ensure parent directory exists
      const parentDir = dirname(validPath);
      await this.ensureDirectory(parentDir);

      // Write file
      await Bun.write(validPath, content);

      // Set permissions if specified
      if (options.mode) {
        await this.setFileMode(validPath, options.mode);
      }

      const result: FileOperationResult = {
        success: true,
        path: validPath,
        operation: FileOperation.WRITE,
        backupId,
      };

      this.addAuditEntry({
        timestamp: new Date(),
        operation: FileOperation.WRITE,
        path: validPath,
        success: true,
        backupId,
      });

      return result;
    } catch (error) {
      // Rollback if backup exists
      if (backupId) {
        await this.backupManager.restoreBackup(backupId);
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorPath = validPath || path;

      this.addAuditEntry({
        timestamp: new Date(),
        operation: FileOperation.WRITE,
        path: errorPath,
        success: false,
        error: errorMessage,
      });

      return {
        success: false,
        path: errorPath,
        operation: FileOperation.WRITE,
        error: errorMessage,
      };
    }
  }

  /**
   * Appends to a file safely with backup
   */
  async appendFile(
    path: string,
    content: string | Uint8Array,
    options: FileOperationOptions = {},
  ): Promise<FileOperationResult> {
    const createBackup = options.createBackup ?? true;
    let backupId: string | undefined;
    let validPath: string = path;

    try {
      validPath = this.validatePath(path);
      this.checkOperationAllowed(FileOperation.APPEND);
      // Create backup if enabled
      if (createBackup) {
        const backup = await this.backupManager.createBackup(validPath, FileOperation.APPEND);
        backupId = backup?.id;
      }

      // Read existing content if file exists
      const file = Bun.file(validPath);
      let existingContent = '';
      if (await file.exists()) {
        existingContent = await file.text();
      }

      // Append content
      const newContent = existingContent + (typeof content === 'string' ? content : new TextDecoder().decode(content));
      await Bun.write(validPath, newContent);

      const result: FileOperationResult = {
        success: true,
        path: validPath,
        operation: FileOperation.APPEND,
        backupId,
      };

      this.addAuditEntry({
        timestamp: new Date(),
        operation: FileOperation.APPEND,
        path: validPath,
        success: true,
        backupId,
      });

      return result;
    } catch (error) {
      // Rollback if backup exists
      if (backupId) {
        await this.backupManager.restoreBackup(backupId);
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorPath = validPath || path;

      this.addAuditEntry({
        timestamp: new Date(),
        operation: FileOperation.APPEND,
        path: errorPath,
        success: false,
        error: errorMessage,
      });

      return {
        success: false,
        path: errorPath,
        operation: FileOperation.APPEND,
        error: errorMessage,
      };
    }
  }

  /**
   * Deletes a file safely with backup
   */
  async deleteFile(
    path: string,
    options: FileOperationOptions = {},
  ): Promise<FileOperationResult> {
    const createBackup = options.createBackup ?? true;
    let backupId: string | undefined;
    let validPath: string = path;

    try {
      validPath = this.validatePath(path);
      this.checkOperationAllowed(FileOperation.DELETE);
      // Create backup if enabled
      if (createBackup) {
        const backup = await this.backupManager.createBackup(validPath, FileOperation.DELETE);
        backupId = backup?.id;
      }

      // Delete file
      const { unlink } = await import('fs/promises');
      await unlink(validPath);

      const result: FileOperationResult = {
        success: true,
        path: validPath,
        operation: FileOperation.DELETE,
        backupId,
      };

      this.addAuditEntry({
        timestamp: new Date(),
        operation: FileOperation.DELETE,
        path: validPath,
        success: true,
        backupId,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorPath = validPath || path;

      this.addAuditEntry({
        timestamp: new Date(),
        operation: FileOperation.DELETE,
        path: errorPath,
        success: false,
        error: errorMessage,
      });

      return {
        success: false,
        path: errorPath,
        operation: FileOperation.DELETE,
        error: errorMessage,
      };
    }
  }

  /**
   * Creates a directory safely
   */
  async createDirectory(
    path: string,
    options: FileOperationOptions = {},
  ): Promise<FileOperationResult> {
    let validPath: string = path;

    try {
      validPath = this.validatePath(path);
      this.checkOperationAllowed(FileOperation.MKDIR);
      await this.ensureDirectory(validPath);

      // Set permissions if specified
      if (options.mode) {
        await this.setFileMode(validPath, options.mode);
      }

      const result: FileOperationResult = {
        success: true,
        path: validPath,
        operation: FileOperation.MKDIR,
      };

      this.addAuditEntry({
        timestamp: new Date(),
        operation: FileOperation.MKDIR,
        path: validPath,
        success: true,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorPath = validPath || path;

      this.addAuditEntry({
        timestamp: new Date(),
        operation: FileOperation.MKDIR,
        path: errorPath,
        success: false,
        error: errorMessage,
      });

      return {
        success: false,
        path: errorPath,
        operation: FileOperation.MKDIR,
        error: errorMessage,
      };
    }
  }

  /**
   * Copies a file safely
   */
  async copyFile(
    sourcePath: string,
    destPath: string,
    options: FileOperationOptions = {},
  ): Promise<FileOperationResult> {
    const createBackup = options.createBackup ?? true;
    let backupId: string | undefined;
    let validSourcePath: string = sourcePath;
    let validDestPath: string = destPath;

    try {
      validSourcePath = this.validatePath(sourcePath);
      validDestPath = this.validatePath(destPath);
      this.checkOperationAllowed(FileOperation.COPY);
      // Create backup of destination if it exists
      if (createBackup) {
        const backup = await this.backupManager.createBackup(validDestPath, FileOperation.COPY);
        backupId = backup?.id;
      }

      // Read source file
      const sourceFile = Bun.file(validSourcePath);
      const content = await sourceFile.arrayBuffer();

      // Write to destination
      await Bun.write(validDestPath, content);

      // Preserve permissions if requested
      if (options.preservePermissions) {
        const stat = await sourceFile.stat();
        await this.setFileMode(validDestPath, stat.mode);
      }

      const result: FileOperationResult = {
        success: true,
        path: validDestPath,
        operation: FileOperation.COPY,
        backupId,
      };

      this.addAuditEntry({
        timestamp: new Date(),
        operation: FileOperation.COPY,
        path: `${validSourcePath} -> ${validDestPath}`,
        success: true,
        backupId,
      });

      return result;
    } catch (error) {
      // Rollback if backup exists
      if (backupId) {
        await this.backupManager.restoreBackup(backupId);
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorSourcePath = validSourcePath || sourcePath;
      const errorDestPath = validDestPath || destPath;

      this.addAuditEntry({
        timestamp: new Date(),
        operation: FileOperation.COPY,
        path: `${errorSourcePath} -> ${errorDestPath}`,
        success: false,
        error: errorMessage,
      });

      return {
        success: false,
        path: errorDestPath,
        operation: FileOperation.COPY,
        error: errorMessage,
      };
    }
  }

  /**
   * Moves a file safely
   */
  async moveFile(
    sourcePath: string,
    destPath: string,
    options: FileOperationOptions = {},
  ): Promise<FileOperationResult> {
    const createBackup = options.createBackup ?? true;
    let sourceBackupId: string | undefined;
    let destBackupId: string | undefined;
    let validSourcePath: string = sourcePath;
    let validDestPath: string = destPath;

    try {
      validSourcePath = this.validatePath(sourcePath);
      validDestPath = this.validatePath(destPath);
      this.checkOperationAllowed(FileOperation.MOVE);
      // Create backups
      if (createBackup) {
        const sourceBackup = await this.backupManager.createBackup(
          validSourcePath,
          FileOperation.MOVE,
        );
        sourceBackupId = sourceBackup?.id;

        const destBackup = await this.backupManager.createBackup(
          validDestPath,
          FileOperation.MOVE,
        );
        destBackupId = destBackup?.id;
      }

      // Copy then delete (safer than rename across filesystems)
      const sourceFile = Bun.file(validSourcePath);
      const content = await sourceFile.arrayBuffer();
      await Bun.write(validDestPath, content);

      // Preserve permissions
      if (options.preservePermissions) {
        const stat = await sourceFile.stat();
        await this.setFileMode(validDestPath, stat.mode);
      }

      // Delete source
      const { unlink } = await import('fs/promises');
      await unlink(validSourcePath);

      const result: FileOperationResult = {
        success: true,
        path: validDestPath,
        operation: FileOperation.MOVE,
        backupId: sourceBackupId,
      };

      this.addAuditEntry({
        timestamp: new Date(),
        operation: FileOperation.MOVE,
        path: `${validSourcePath} -> ${validDestPath}`,
        success: true,
        backupId: sourceBackupId,
      });

      return result;
    } catch (error) {
      // Rollback both if backups exist
      if (sourceBackupId) {
        await this.backupManager.restoreBackup(sourceBackupId);
      }
      if (destBackupId) {
        await this.backupManager.restoreBackup(destBackupId);
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorSourcePath = validSourcePath || sourcePath;
      const errorDestPath = validDestPath || destPath;

      this.addAuditEntry({
        timestamp: new Date(),
        operation: FileOperation.MOVE,
        path: `${errorSourcePath} -> ${errorDestPath}`,
        success: false,
        error: errorMessage,
      });

      return {
        success: false,
        path: errorDestPath,
        operation: FileOperation.MOVE,
        error: errorMessage,
      };
    }
  }

  /**
   * Executes multiple file operations as a transaction
   * All operations succeed or all are rolled back
   */
  async executeTransaction(operations: TransactionOperation[]): Promise<TransactionResult> {
    const results: FileOperationResult[] = [];
    const backupIds: string[] = [];

    try {
      // Execute all operations
      for (const operation of operations) {
        let result: FileOperationResult;

        switch (operation.type) {
          case FileOperation.READ:
            // Read operations don't modify state
            await this.readFile(operation.path);
            result = {
              success: true,
              path: operation.path,
              operation: FileOperation.READ,
            };
            break;

          case FileOperation.WRITE:
            result = await this.writeFile(
              operation.path,
              operation.content || '',
              operation.options,
            );
            break;

          case FileOperation.APPEND:
            result = await this.appendFile(
              operation.path,
              operation.content || '',
              operation.options,
            );
            break;

          case FileOperation.DELETE:
            result = await this.deleteFile(operation.path, operation.options);
            break;

          case FileOperation.MKDIR:
            result = await this.createDirectory(operation.path, operation.options);
            break;

          default:
            throw new Error(`Unsupported transaction operation: ${operation.type}`);
        }

        if (!result.success) {
          throw new Error(`Operation failed: ${result.error}`);
        }

        results.push(result);
        if (result.backupId) {
          backupIds.push(result.backupId);
        }
      }

      return {
        success: true,
        operations: results,
      };
    } catch (error) {
      // Rollback all operations
      console.error('Transaction failed, rolling back...', error);
      await this.backupManager.restoreMultiple(backupIds);

      return {
        success: false,
        operations: results,
        error: error instanceof Error ? error.message : 'Transaction failed',
        rollbackPerformed: true,
      };
    }
  }

  /**
   * Gets the audit log
   */
  getAuditLog(): FileAuditEntry[] {
    return [...this.auditLog];
  }

  /**
   * Clears the audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
  }

  /**
   * Gets the backup manager
   */
  getBackupManager(): BackupManager {
    return this.backupManager;
  }

  /**
   * Gets the path validator
   */
  getValidator(): PathValidator {
    return this.validator;
  }

  /**
   * Validates a path and returns the safe path
   */
  private validatePath(path: string): string {
    const result = this.validator.validate(path);
    if (!result.isValid) {
      throw new Error(`Invalid path: ${result.error}`);
    }
    return result.normalizedPath;
  }

  /**
   * Checks if an operation is allowed
   */
  private checkOperationAllowed(operation: FileOperation): void {
    if (!this.config.allowedOperations.includes(operation)) {
      throw new Error(`Operation not allowed: ${operation}`);
    }
  }

  /**
   * Adds an entry to the audit log
   */
  private addAuditEntry(entry: FileAuditEntry): void {
    if (this.config.enableAuditLog) {
      this.auditLog.push(entry);
    }
  }

  /**
   * Ensures a directory exists
   */
  private async ensureDirectory(path: string): Promise<void> {
    const { mkdir } = await import('fs/promises');
    try {
      await mkdir(path, { recursive: true });
    } catch (error) {
      // Ignore if directory already exists
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Sets file mode (permissions)
   */
  private async setFileMode(filePath: string, mode: number): Promise<void> {
    const { chmod } = await import('fs/promises');
    await chmod(filePath, mode);
  }
}
