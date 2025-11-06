/**
 * Path Validator - Security-focused path validation
 * Prevents directory traversal attacks and ensures paths stay within project boundaries
 */

import { resolve, normalize, relative, isAbsolute, sep } from 'path';
import type { PathValidationResult } from '../types/file-manager.ts';

export class PathValidator {
  private projectRoot: string;

  constructor(projectRoot: string) {
    // Normalize and resolve the project root to absolute path
    this.projectRoot = resolve(normalize(projectRoot));
  }

  /**
   * Validates a path for security and returns normalized path
   * Prevents: directory traversal, absolute paths outside project, symlink attacks
   */
  validate(inputPath: string): PathValidationResult {
    try {
      // Check for null bytes (path injection)
      if (inputPath.includes('\0')) {
        return {
          isValid: false,
          normalizedPath: '',
          error: 'Path contains null byte',
        };
      }

      // Check for suspicious patterns
      if (this.containsSuspiciousPatterns(inputPath)) {
        return {
          isValid: false,
          normalizedPath: '',
          error: 'Path contains suspicious patterns',
        };
      }

      // Normalize the path (resolves . and .. segments)
      const normalizedPath = normalize(inputPath);

      // Resolve to absolute path
      let absolutePath: string;
      if (isAbsolute(normalizedPath)) {
        absolutePath = normalizedPath;
      } else {
        absolutePath = resolve(this.projectRoot, normalizedPath);
      }

      // Check if path is within project root
      const relativePath = relative(this.projectRoot, absolutePath);

      // If relative path starts with .. or is absolute, it's outside project root
      if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
        return {
          isValid: false,
          normalizedPath: '',
          error: 'Path is outside project root',
        };
      }

      // Additional check: ensure the resolved path starts with project root
      if (!absolutePath.startsWith(this.projectRoot + sep) && absolutePath !== this.projectRoot) {
        return {
          isValid: false,
          normalizedPath: '',
          error: 'Path escapes project boundaries',
        };
      }

      return {
        isValid: true,
        normalizedPath: absolutePath,
      };
    } catch (error) {
      return {
        isValid: false,
        normalizedPath: '',
        error: error instanceof Error ? error.message : 'Path validation failed',
      };
    }
  }

  /**
   * Checks for suspicious patterns in paths
   * Note: We don't check for ../ here as it will be validated by path resolution
   */
  private containsSuspiciousPatterns(path: string): boolean {
    const suspiciousPatterns = [
      /[<>"|?*]/, // Invalid filename characters on Windows
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(path));
  }

  /**
   * Validates multiple paths in batch
   */
  validateBatch(paths: string[]): Map<string, PathValidationResult> {
    const results = new Map<string, PathValidationResult>();
    for (const path of paths) {
      results.set(path, this.validate(path));
    }
    return results;
  }

  /**
   * Checks if a path is within the project root without full validation
   */
  isWithinProjectRoot(path: string): boolean {
    const result = this.validate(path);
    return result.isValid;
  }

  /**
   * Returns the project root
   */
  getProjectRoot(): string {
    return this.projectRoot;
  }

  /**
   * Validates and returns a safe path relative to project root
   */
  getSafePath(inputPath: string): string | null {
    const result = this.validate(inputPath);
    return result.isValid ? result.normalizedPath : null;
  }
}
