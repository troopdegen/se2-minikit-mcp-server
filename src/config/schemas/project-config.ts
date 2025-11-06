/**
 * Project configuration schema
 * Defines the structure and validation for project-level configuration
 */

import { z } from 'zod';

/**
 * Network type enumeration
 */
export const NetworkTypeSchema = z.enum(['base-mainnet', 'base-sepolia', 'base-local']);

/**
 * Template type enumeration
 */
export const TemplateTypeSchema = z.enum([
  'basic',
  'erc20',
  'erc721',
  'erc1155',
  'defi',
  'dao',
  'custom',
]);

/**
 * Project metadata schema
 */
export const ProjectMetadataSchema = z.object({
  /** Project name (alphanumeric, hyphens, underscores) */
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters')
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      'Project name must contain only alphanumeric characters, hyphens, and underscores'
    ),

  /** Project description */
  description: z
    .string()
    .min(1, 'Project description is required')
    .max(500, 'Project description must be less than 500 characters')
    .optional(),

  /** Project version (semver) */
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/, 'Version must follow semver format (e.g., 1.0.0)')
    .default('1.0.0'),

  /** Project author */
  author: z
    .string()
    .max(200, 'Author name must be less than 200 characters')
    .optional(),

  /** Project license */
  license: z
    .string()
    .max(50, 'License must be less than 50 characters')
    .default('MIT'),
});

/**
 * Network configuration schema
 */
export const NetworkConfigSchema = z.object({
  /** Target network */
  network: NetworkTypeSchema.default('base-sepolia'),

  /** Custom RPC URL (optional, overrides default) */
  rpcUrl: z.string().url('RPC URL must be a valid URL').optional(),

  /** Custom chain ID (optional, for custom networks) */
  chainId: z.number().int().positive('Chain ID must be a positive integer').optional(),

  /** Block explorer URL */
  explorerUrl: z.string().url('Explorer URL must be a valid URL').optional(),
});

/**
 * Minikit integration settings
 */
export const MinikitEnabledSchema = z.boolean().default(false);

/**
 * Build configuration schema
 */
export const BuildConfigSchema = z.object({
  /** Output directory for compiled contracts */
  outDir: z.string().default('artifacts'),

  /** Cache directory for build cache */
  cacheDir: z.string().default('cache'),

  /** Enable source map generation */
  sourceMaps: z.boolean().default(true),

  /** Optimization enabled */
  optimize: z.boolean().default(true),

  /** Optimization runs */
  optimizerRuns: z.number().int().positive().default(200),
});

/**
 * Development server configuration
 */
export const DevServerConfigSchema = z.object({
  /** Port for local development server */
  port: z.number().int().min(1024).max(65535).default(3000),

  /** Host for local development server */
  host: z.string().default('localhost'),

  /** Enable hot reload */
  hotReload: z.boolean().default(true),

  /** Open browser on start */
  openBrowser: z.boolean().default(false),
});

/**
 * Complete project configuration schema
 */
export const ProjectConfigSchema = z.object({
  /** Project metadata */
  project: ProjectMetadataSchema,

  /** Network configuration */
  network: NetworkConfigSchema,

  /** Template selection */
  template: TemplateTypeSchema.default('basic'),

  /** Enable Minikit integration */
  minikit: MinikitEnabledSchema,

  /** Build configuration */
  build: BuildConfigSchema.optional(),

  /** Development server configuration */
  devServer: DevServerConfigSchema.optional(),

  /** Additional custom configuration */
  custom: z.record(z.string(), z.unknown()).optional(),
});

/**
 * TypeScript types inferred from schemas
 */
export type NetworkType = z.infer<typeof NetworkTypeSchema>;
export type TemplateType = z.infer<typeof TemplateTypeSchema>;
export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
export type NetworkConfig = z.infer<typeof NetworkConfigSchema>;
export type BuildConfig = z.infer<typeof BuildConfigSchema>;
export type DevServerConfig = z.infer<typeof DevServerConfigSchema>;
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

/**
 * Example valid project configuration
 */
export const EXAMPLE_PROJECT_CONFIG: ProjectConfig = {
  project: {
    name: 'my-dapp',
    description: 'A decentralized application on Base',
    version: '1.0.0',
    author: 'Developer Name',
    license: 'MIT',
  },
  network: {
    network: 'base-sepolia',
  },
  template: 'erc20',
  minikit: false,
};
