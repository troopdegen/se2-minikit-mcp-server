/**
 * Tool-specific type definitions for MCP tools
 */

// ============================================================================
// scaffold_project Tool Types
// ============================================================================

/**
 * Input parameters for scaffold_project tool
 */
export interface ScaffoldProjectInput {
  /** Name of the project (kebab-case recommended) */
  projectName: string;
  /** Path where project should be created (defaults to current directory) */
  projectPath?: string;
  /** Whether to include Base Minikit integration */
  includesMinikit?: boolean;
  /** Project template to use */
  template?: 'basic' | 'nft' | 'defi' | 'dao' | 'gaming' | 'social';
  /** Smart contract framework to use */
  contractFramework?: 'hardhat' | 'foundry';
  /** Target network for deployment */
  targetNetwork?: 'base' | 'baseSepolia' | 'localhost';
}

/**
 * Success data for scaffold_project tool
 */
export interface ScaffoldProjectData {
  /** Full path to the created project */
  projectPath: string;
  /** Name of the project */
  projectName: string;
  /** Template used for generation */
  template: string;
  /** Whether Minikit integration was included */
  minikit: boolean;
  /** Contract framework used */
  framework: string;
  /** Target network configured */
  network: string;
  /** List of files created */
  filesCreated: string[];
  /** Next steps for the user */
  nextSteps: string[];
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Additional error details */
  details?: unknown;
}

/**
 * Response from scaffold_project tool
 */
export interface ScaffoldProjectResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** Data returned on success */
  data?: ScaffoldProjectData;
  /** Error information on failure */
  error?: ErrorResponse;
}
