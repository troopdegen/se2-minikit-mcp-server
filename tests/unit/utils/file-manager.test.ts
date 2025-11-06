/**
 * Comprehensive tests for File Manager utility
 * Tests security, backup/rollback, and transactional operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { join } from 'path';
import { tmpdir } from 'os';
import { mkdtemp, rm, readFile, writeFile, stat, access } from 'fs/promises';
import { FileManager } from '../../../src/utils/file-manager.ts';
import { PathValidator } from '../../../src/utils/path-validator.ts';
import { BackupManager } from '../../../src/utils/backup.ts';
import { FileOperation } from '../../../src/types/file-manager.ts';

describe('PathValidator', () => {
  let validator: PathValidator;
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'file-manager-test-'));
    validator = new PathValidator(testDir);
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('Path validation', () => {
    it('should validate paths within project root', () => {
      const result = validator.validate('test.txt');
      expect(result.isValid).toBe(true);
      expect(result.normalizedPath).toContain(testDir);
    });

    it('should validate nested paths', () => {
      const result = validator.validate('dir/subdir/test.txt');
      expect(result.isValid).toBe(true);
      expect(result.normalizedPath).toContain(testDir);
    });

    it('should reject directory traversal with ../../../', () => {
      const result = validator.validate('../../../etc/passwd');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject absolute paths outside project root', () => {
      const result = validator.validate('/etc/passwd');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject paths with null bytes', () => {
      const result = validator.validate('test\0.txt');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('null byte');
    });

    it('should reject paths with suspicious patterns', () => {
      const result = validator.validate('../sensitive/file.txt');
      expect(result.isValid).toBe(false);
    });

    it('should handle paths with .. that resolve within project', () => {
      const result = validator.validate('dir/../test.txt');
      expect(result.isValid).toBe(true);
    });

    it('should validate batch paths', () => {
      const paths = ['test1.txt', 'test2.txt', '../../../etc/passwd'];
      const results = validator.validateBatch(paths);

      expect(results.get('test1.txt')?.isValid).toBe(true);
      expect(results.get('test2.txt')?.isValid).toBe(true);
      expect(results.get('../../../etc/passwd')?.isValid).toBe(false);
    });

    it('should provide safe paths', () => {
      const safePath = validator.getSafePath('test.txt');
      expect(safePath).toBeDefined();
      expect(safePath).toContain(testDir);

      const unsafePath = validator.getSafePath('../../../etc/passwd');
      expect(unsafePath).toBeNull();
    });
  });

  describe('Security features', () => {
    it('should prevent directory traversal attacks', () => {
      const attacks = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        'test/../../etc/passwd',
        './../../etc/passwd',
      ];

      for (const attack of attacks) {
        const result = validator.validate(attack);
        expect(result.isValid).toBe(false);
      }
    });

    it('should handle various path formats', () => {
      const validPaths = [
        'test.txt',
        './test.txt',
        'dir/test.txt',
        './dir/test.txt',
      ];

      for (const path of validPaths) {
        const result = validator.validate(path);
        expect(result.isValid).toBe(true);
      }
    });
  });
});

describe('BackupManager', () => {
  let backupManager: BackupManager;
  let testDir: string;
  let backupDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'backup-test-'));
    backupDir = join(testDir, '.backups');
    backupManager = new BackupManager(backupDir);
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('Backup creation', () => {
    it('should create backup of existing file', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'original content');

      const backup = await backupManager.createBackup(testFile, FileOperation.WRITE);

      expect(backup).toBeDefined();
      expect(backup?.id).toBeDefined();
      expect(backup?.backupPath).toBeDefined();

      // Verify backup file exists
      const backupContent = await readFile(backup!.backupPath, 'utf-8');
      expect(backupContent).toBe('original content');
    });

    it('should handle backup of non-existent file', async () => {
      const testFile = join(testDir, 'nonexistent.txt');

      const backup = await backupManager.createBackup(testFile, FileOperation.WRITE);

      expect(backup).toBeDefined();
      expect(backup?.originalContent).toBeUndefined();
    });

    it('should store backup metadata', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'test content');

      const backup = await backupManager.createBackup(testFile, FileOperation.WRITE);

      expect(backup?.timestamp).toBeInstanceOf(Date);
      expect(backup?.operation).toBe(FileOperation.WRITE);
      expect(backup?.originalPath).toBe(testFile);
    });
  });

  describe('Backup restoration', () => {
    it('should restore file from backup', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'original content');

      const backup = await backupManager.createBackup(testFile, FileOperation.WRITE);

      // Modify file
      await writeFile(testFile, 'modified content');

      // Restore backup
      const restored = await backupManager.restoreBackup(backup!.id);
      expect(restored).toBe(true);

      // Verify content restored
      const content = await readFile(testFile, 'utf-8');
      expect(content).toBe('original content');
    });

    it('should restore multiple backups in reverse order', async () => {
      const testFile1 = join(testDir, 'test1.txt');
      const testFile2 = join(testDir, 'test2.txt');

      await writeFile(testFile1, 'original1');
      await writeFile(testFile2, 'original2');

      const backup1 = await backupManager.createBackup(testFile1, FileOperation.WRITE);
      const backup2 = await backupManager.createBackup(testFile2, FileOperation.WRITE);

      await writeFile(testFile1, 'modified1');
      await writeFile(testFile2, 'modified2');

      const restored = await backupManager.restoreMultiple([backup1!.id, backup2!.id]);
      expect(restored).toBe(true);

      const content1 = await readFile(testFile1, 'utf-8');
      const content2 = await readFile(testFile2, 'utf-8');
      expect(content1).toBe('original1');
      expect(content2).toBe('original2');
    });

    it('should handle restoration of deleted file', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'content');

      const backup = await backupManager.createBackup(testFile, FileOperation.DELETE);
      await rm(testFile);

      const restored = await backupManager.restoreBackup(backup!.id);
      expect(restored).toBe(true);

      const content = await readFile(testFile, 'utf-8');
      expect(content).toBe('content');
    });
  });

  describe('Backup management', () => {
    it('should list all backups', async () => {
      const testFile1 = join(testDir, 'test1.txt');
      const testFile2 = join(testDir, 'test2.txt');

      await writeFile(testFile1, 'content1');
      await writeFile(testFile2, 'content2');

      await backupManager.createBackup(testFile1, FileOperation.WRITE);
      await backupManager.createBackup(testFile2, FileOperation.WRITE);

      const backups = backupManager.listBackups();
      expect(backups.length).toBe(2);
    });

    it('should list backups for specific file', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'v1');

      await backupManager.createBackup(testFile, FileOperation.WRITE);
      await writeFile(testFile, 'v2');
      await backupManager.createBackup(testFile, FileOperation.WRITE);

      const backups = backupManager.listBackupsForFile(testFile);
      expect(backups.length).toBe(2);
    });

    it('should cleanup old backups', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'content');

      // Create backup manager with very short max age
      const shortAgeManager = new BackupManager(backupDir, 1); // 1ms
      await shortAgeManager.createBackup(testFile, FileOperation.WRITE);

      // Wait for backup to become old
      await new Promise((resolve) => setTimeout(resolve, 10));

      const cleaned = await shortAgeManager.cleanupOldBackups();
      expect(cleaned).toBeGreaterThan(0);
    });
  });
});

describe('FileManager', () => {
  let fileManager: FileManager;
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'file-mgr-test-'));
    fileManager = new FileManager({
      projectRoot: testDir,
      enableAuditLog: true,
    });
    await fileManager.initialize();
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('File operations', () => {
    it('should read file safely', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'test content');

      const content = await fileManager.readFile('test.txt');
      expect(content).toBe('test content');
    });

    it('should write file with backup', async () => {
      const result = await fileManager.writeFile('test.txt', 'new content');

      expect(result.success).toBe(true);
      expect(result.backupId).toBeDefined();

      const content = await readFile(join(testDir, 'test.txt'), 'utf-8');
      expect(content).toBe('new content');
    });

    it('should append to file with backup', async () => {
      await writeFile(join(testDir, 'test.txt'), 'line 1\n');

      const result = await fileManager.appendFile('test.txt', 'line 2\n');

      expect(result.success).toBe(true);

      const content = await readFile(join(testDir, 'test.txt'), 'utf-8');
      expect(content).toBe('line 1\nline 2\n');
    });

    it('should delete file with backup', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'content');

      const result = await fileManager.deleteFile('test.txt');

      expect(result.success).toBe(true);
      expect(result.backupId).toBeDefined();

      // File should be deleted
      await expect(access(testFile)).rejects.toThrow();
    });

    it('should create directory', async () => {
      const result = await fileManager.createDirectory('subdir/nested');

      expect(result.success).toBe(true);

      const stats = await stat(join(testDir, 'subdir/nested'));
      expect(stats.isDirectory()).toBe(true);
    });

    it('should copy file', async () => {
      const sourceFile = join(testDir, 'source.txt');
      await writeFile(sourceFile, 'content');

      const result = await fileManager.copyFile('source.txt', 'dest.txt');

      expect(result.success).toBe(true);

      const destContent = await readFile(join(testDir, 'dest.txt'), 'utf-8');
      expect(destContent).toBe('content');
    });

    it('should move file', async () => {
      const sourceFile = join(testDir, 'source.txt');
      await writeFile(sourceFile, 'content');

      const result = await fileManager.moveFile('source.txt', 'dest.txt');

      expect(result.success).toBe(true);

      // Source should not exist
      await expect(access(sourceFile)).rejects.toThrow();

      // Dest should exist with content
      const destContent = await readFile(join(testDir, 'dest.txt'), 'utf-8');
      expect(destContent).toBe('content');
    });
  });

  describe('Security features', () => {
    it('should reject directory traversal in read', async () => {
      await expect(fileManager.readFile('../../../etc/passwd')).rejects.toThrow('Invalid path');
    });

    it('should reject directory traversal in write', async () => {
      const result = await fileManager.writeFile('../../../tmp/evil.txt', 'content');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid path');
    });

    it('should prevent path traversal attacks in all operations', async () => {
      const attacks = [
        '../../../etc/passwd',
        '/etc/passwd',
        'test/../../../etc/passwd',
      ];

      for (const attack of attacks) {
        const result = await fileManager.writeFile(attack, 'content');
        expect(result.success).toBe(false);
      }
    });

    it('should sandbox operations to project directory', async () => {
      // Try to access file outside project
      const result = await fileManager.writeFile('/tmp/outside.txt', 'content');
      expect(result.success).toBe(false);

      // Verify file was not created
      await expect(access('/tmp/outside.txt')).rejects.toThrow();
    });
  });

  describe('Backup and rollback', () => {
    it('should rollback on write failure', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'original');

      // Write successfully first
      await fileManager.writeFile('test.txt', 'modified');

      // Get backup manager to manually restore
      const backupManager = fileManager.getBackupManager();
      const backups = backupManager.listBackupsForFile(testFile);
      expect(backups.length).toBeGreaterThan(0);

      // Restore backup
      await backupManager.restoreBackup(backups[0]!.id);

      const content = await readFile(testFile, 'utf-8');
      expect(content).toBe('original');
    });

    it('should maintain backup for delete operations', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'important data');

      const result = await fileManager.deleteFile('test.txt');
      expect(result.success).toBe(true);

      // File should be deleted
      await expect(access(testFile)).rejects.toThrow();

      // Restore from backup
      const backupManager = fileManager.getBackupManager();
      await backupManager.restoreBackup(result.backupId!);

      // File should be restored
      const content = await readFile(testFile, 'utf-8');
      expect(content).toBe('important data');
    });
  });

  describe('Transactional operations', () => {
    it('should execute transaction with all operations succeeding', async () => {
      const result = await fileManager.executeTransaction([
        { type: FileOperation.WRITE, path: 'file1.txt', content: 'content1' },
        { type: FileOperation.WRITE, path: 'file2.txt', content: 'content2' },
        { type: FileOperation.MKDIR, path: 'subdir' },
      ]);

      expect(result.success).toBe(true);
      expect(result.operations.length).toBe(3);

      // Verify all operations completed
      const content1 = await readFile(join(testDir, 'file1.txt'), 'utf-8');
      const content2 = await readFile(join(testDir, 'file2.txt'), 'utf-8');
      expect(content1).toBe('content1');
      expect(content2).toBe('content2');

      const stats = await stat(join(testDir, 'subdir'));
      expect(stats.isDirectory()).toBe(true);
    });

    it('should rollback transaction on failure', async () => {
      await writeFile(join(testDir, 'existing.txt'), 'original');

      const result = await fileManager.executeTransaction([
        { type: FileOperation.WRITE, path: 'existing.txt', content: 'modified' },
        { type: FileOperation.WRITE, path: 'new.txt', content: 'new content' },
        // This will fail due to invalid path
        { type: FileOperation.WRITE, path: '../../../invalid.txt', content: 'bad' },
      ]);

      expect(result.success).toBe(false);
      expect(result.rollbackPerformed).toBe(true);

      // Verify rollback - original file should be restored
      const content = await readFile(join(testDir, 'existing.txt'), 'utf-8');
      expect(content).toBe('original');
    });

    it('should handle complex transaction with multiple operations', async () => {
      await writeFile(join(testDir, 'source.txt'), 'source content');

      const result = await fileManager.executeTransaction([
        { type: FileOperation.READ, path: 'source.txt' },
        { type: FileOperation.WRITE, path: 'copy.txt', content: 'source content' },
        { type: FileOperation.MKDIR, path: 'backup' },
        { type: FileOperation.DELETE, path: 'source.txt' },
      ]);

      expect(result.success).toBe(true);

      // Source should be deleted
      await expect(access(join(testDir, 'source.txt'))).rejects.toThrow();

      // Copy should exist
      const copyContent = await readFile(join(testDir, 'copy.txt'), 'utf-8');
      expect(copyContent).toBe('source content');
    });
  });

  describe('Audit logging', () => {
    it('should log successful operations', async () => {
      await fileManager.writeFile('test.txt', 'content');
      await fileManager.readFile('test.txt');

      const auditLog = fileManager.getAuditLog();
      expect(auditLog.length).toBeGreaterThanOrEqual(2);

      const writeEntry = auditLog.find((e) => e.operation === FileOperation.WRITE);
      expect(writeEntry).toBeDefined();
      expect(writeEntry?.success).toBe(true);
    });

    it('should log failed operations', async () => {
      const result = await fileManager.writeFile('../../../invalid.txt', 'content');

      const auditLog = fileManager.getAuditLog();
      const failedEntry = auditLog.find((e) => !e.success);

      expect(failedEntry).toBeDefined();
      expect(failedEntry?.error).toBeDefined();
    });

    it('should clear audit log', async () => {
      await fileManager.writeFile('test.txt', 'content');

      let auditLog = fileManager.getAuditLog();
      expect(auditLog.length).toBeGreaterThan(0);

      fileManager.clearAuditLog();

      auditLog = fileManager.getAuditLog();
      expect(auditLog.length).toBe(0);
    });
  });

  describe('Permission handling', () => {
    it('should preserve file permissions when copying', async () => {
      const sourceFile = join(testDir, 'source.txt');
      await writeFile(sourceFile, 'content');

      // Set specific permissions
      const { chmod } = await import('fs/promises');
      await chmod(sourceFile, 0o644);

      await fileManager.copyFile('source.txt', 'dest.txt', {
        preservePermissions: true,
      });

      const sourceStat = await stat(sourceFile);
      const destStat = await stat(join(testDir, 'dest.txt'));

      expect(destStat.mode).toBe(sourceStat.mode);
    });

    it('should set custom permissions on write', async () => {
      const customMode = 0o600;

      await fileManager.writeFile('test.txt', 'content', {
        mode: customMode,
      });

      const fileStat = await stat(join(testDir, 'test.txt'));
      expect(fileStat.mode & 0o777).toBe(customMode);
    });
  });

  describe('Error handling', () => {
    it('should handle read of non-existent file', async () => {
      await expect(fileManager.readFile('nonexistent.txt')).rejects.toThrow('File not found');
    });

    it('should handle operations on restricted operations list', async () => {
      const restrictedManager = new FileManager({
        projectRoot: testDir,
        allowedOperations: [FileOperation.READ],
      });

      await restrictedManager.initialize();

      const result = await restrictedManager.writeFile('test.txt', 'content');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Operation not allowed');
    });

    it('should provide detailed error messages', async () => {
      const result = await fileManager.writeFile('../../../invalid.txt', 'content');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid path');
    });
  });
});

describe('Integration tests', () => {
  let fileManager: FileManager;
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'integration-test-'));
    fileManager = new FileManager({
      projectRoot: testDir,
      enableAuditLog: true,
    });
    await fileManager.initialize();
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should handle complex workflow with multiple operations', async () => {
    // Create initial file
    await fileManager.writeFile('original.txt', 'original content');

    // Copy to backup
    await fileManager.copyFile('original.txt', 'backup.txt');

    // Modify original
    await fileManager.writeFile('original.txt', 'modified content');

    // Create directory structure
    await fileManager.createDirectory('data/processed');

    // Move file to processed
    await fileManager.moveFile('backup.txt', 'data/processed/backup.txt');

    // Verify final state
    const originalContent = await readFile(join(testDir, 'original.txt'), 'utf-8');
    expect(originalContent).toBe('modified content');

    const backupContent = await readFile(
      join(testDir, 'data/processed/backup.txt'),
      'utf-8',
    );
    expect(backupContent).toBe('original content');

    // Check audit log
    const auditLog = fileManager.getAuditLog();
    expect(auditLog.length).toBeGreaterThanOrEqual(5);
  });

  it('should handle template engine integration scenario', async () => {
    // Simulate template engine creating multiple files
    const result = await fileManager.executeTransaction([
      { type: FileOperation.MKDIR, path: 'src' },
      { type: FileOperation.MKDIR, path: 'src/components' },
      { type: FileOperation.WRITE, path: 'src/index.ts', content: 'export * from "./components"' },
      { type: FileOperation.WRITE, path: 'src/components/Button.tsx', content: 'export const Button = () => {}' },
      { type: FileOperation.WRITE, path: 'package.json', content: '{"name": "test"}' },
    ]);

    expect(result.success).toBe(true);

    // Verify all files created
    const indexContent = await readFile(join(testDir, 'src/index.ts'), 'utf-8');
    expect(indexContent).toContain('components');

    const buttonContent = await readFile(join(testDir, 'src/components/Button.tsx'), 'utf-8');
    expect(buttonContent).toContain('Button');
  });
});
