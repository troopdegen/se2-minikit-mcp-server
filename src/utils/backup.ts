/**
 * Backup System - Provides backup and rollback capabilities for file operations
 * Enables safe file operations with ability to restore previous state
 */

import { join, basename } from 'path';
import { randomBytes } from 'crypto';
import {
  FileOperation,
  type BackupMetadata,
  type FileStats,
  type RollbackOptions,
} from '../types/file-manager.ts';

export class BackupManager {
  private backupDir: string;
  private backups: Map<string, BackupMetadata>;
  private maxBackupAge: number;

  constructor(backupDir: string, maxBackupAge: number = 24 * 60 * 60 * 1000) {
    // 24 hours default
    this.backupDir = backupDir;
    this.backups = new Map();
    this.maxBackupAge = maxBackupAge;
  }

  /**
   * Creates a backup of a file before modification
   */
  async createBackup(
    filePath: string,
    operation: FileOperation,
  ): Promise<BackupMetadata | null> {
    try {
      // Check if file exists
      const file = Bun.file(filePath);
      const exists = await file.exists();

      if (!exists && operation !== FileOperation.WRITE && operation !== FileOperation.MKDIR) {
        // File doesn't exist and operation is not create - no backup needed
        return null;
      }

      // Generate unique backup ID
      const backupId = this.generateBackupId();
      const timestamp = new Date();

      let backupMetadata: BackupMetadata;

      if (exists) {
        // Read current content and stats
        const content = await file.arrayBuffer();
        const stats = await this.getFileStats(filePath);

        // Create backup file path
        const backupFileName = `${backupId}_${basename(filePath)}`;
        const backupPath = join(this.backupDir, backupFileName);

        // Write backup file
        await Bun.write(backupPath, content);

        backupMetadata = {
          id: backupId,
          timestamp,
          operation,
          originalPath: filePath,
          backupPath,
          originalContent: new Uint8Array(content),
          originalStats: stats,
        };
      } else {
        // File doesn't exist - just record that fact
        backupMetadata = {
          id: backupId,
          timestamp,
          operation,
          originalPath: filePath,
          backupPath: '', // No backup file created
          originalContent: undefined,
          originalStats: undefined,
        };
      }

      // Store backup metadata
      this.backups.set(backupId, backupMetadata);

      return backupMetadata;
    } catch (error) {
      console.error(`Failed to create backup for ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Restores a file from backup
   */
  async restoreBackup(
    backupId: string,
    options: RollbackOptions = {},
  ): Promise<boolean> {
    try {
      const backup = this.backups.get(backupId);
      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      // If original file didn't exist, delete the current file
      if (!backup.originalContent) {
        const file = Bun.file(backup.originalPath);
        if (await file.exists()) {
          await this.deleteFile(backup.originalPath);
        }
        return true;
      }

      // Restore from backup file
      if (backup.backupPath && backup.originalContent) {
        await Bun.write(backup.originalPath, backup.originalContent);

        // Restore permissions if available
        if (backup.originalStats?.mode) {
          await this.setFileMode(backup.originalPath, backup.originalStats.mode);
        }
      }

      // Clean up backup if requested
      if (options.deleteBackupAfterRestore && backup.backupPath) {
        await this.deleteFile(backup.backupPath);
        this.backups.delete(backupId);
      }

      return true;
    } catch (error) {
      console.error(`Failed to restore backup ${backupId}:`, error);
      return false;
    }
  }

  /**
   * Restores multiple backups in order (for transaction rollback)
   */
  async restoreMultiple(backupIds: string[]): Promise<boolean> {
    // Restore in reverse order (last operation first)
    const reversedIds = [...backupIds].reverse();

    for (const backupId of reversedIds) {
      const success = await this.restoreBackup(backupId);
      if (!success) {
        console.error(`Failed to restore backup ${backupId} during transaction rollback`);
        return false;
      }
    }

    return true;
  }

  /**
   * Gets backup metadata
   */
  getBackup(backupId: string): BackupMetadata | undefined {
    return this.backups.get(backupId);
  }

  /**
   * Lists all backups
   */
  listBackups(): BackupMetadata[] {
    return Array.from(this.backups.values());
  }

  /**
   * Lists backups for a specific file
   */
  listBackupsForFile(filePath: string): BackupMetadata[] {
    return Array.from(this.backups.values()).filter(
      (backup) => backup.originalPath === filePath,
    );
  }

  /**
   * Cleans up old backups
   */
  async cleanupOldBackups(): Promise<number> {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [backupId, backup] of this.backups.entries()) {
      const age = now - backup.timestamp.getTime();
      if (age > this.maxBackupAge) {
        if (backup.backupPath) {
          await this.deleteFile(backup.backupPath);
        }
        this.backups.delete(backupId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Clears all backups
   */
  async clearAllBackups(): Promise<void> {
    for (const backup of this.backups.values()) {
      if (backup.backupPath) {
        await this.deleteFile(backup.backupPath);
      }
    }
    this.backups.clear();
  }

  /**
   * Gets the backup directory
   */
  getBackupDir(): string {
    return this.backupDir;
  }

  /**
   * Generates a unique backup ID
   */
  private generateBackupId(): string {
    const timestamp = Date.now();
    const random = randomBytes(8).toString('hex');
    return `backup_${timestamp}_${random}`;
  }

  /**
   * Gets file statistics
   */
  private async getFileStats(filePath: string): Promise<FileStats> {
    const file = Bun.file(filePath);
    const stat = await file.stat();

    return {
      size: stat.size,
      mode: stat.mode,
      mtime: stat.mtime,
      ctime: stat.ctime,
      isFile: stat.isFile(),
      isDirectory: stat.isDirectory(),
    };
  }

  /**
   * Sets file mode (permissions)
   */
  private async setFileMode(filePath: string, mode: number): Promise<void> {
    // Bun doesn't have built-in chmod, use Node.js fs
    const { chmod } = await import('fs/promises');
    await chmod(filePath, mode);
  }

  /**
   * Deletes a file safely
   */
  private async deleteFile(filePath: string): Promise<void> {
    const { unlink } = await import('fs/promises');
    try {
      await unlink(filePath);
    } catch (error) {
      // Ignore if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
