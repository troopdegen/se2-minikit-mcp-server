/**
 * Smart contract configuration schema
 * Defines the structure and validation for contract deployment configurations
 */

import { z } from 'zod';

/**
 * Contract type enumeration
 */
export const ContractTypeSchema = z.enum([
  'erc20',
  'erc721',
  'erc1155',
  'upgradeable-proxy',
  'custom',
]);

/**
 * Solidity data type for constructor parameters
 */
export const SolidityTypeSchema = z.enum([
  'address',
  'uint256',
  'uint128',
  'uint64',
  'uint32',
  'uint16',
  'uint8',
  'int256',
  'bool',
  'string',
  'bytes',
  'bytes32',
  'address[]',
  'uint256[]',
  'string[]',
]);

/**
 * Constructor parameter schema
 */
export const ConstructorParamSchema = z.object({
  /** Parameter name */
  name: z
    .string()
    .min(1, 'Parameter name is required')
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Parameter name must be a valid identifier'),

  /** Solidity type */
  type: SolidityTypeSchema,

  /** Parameter value (will be validated based on type at runtime) */
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.unknown())]),

  /** Parameter description */
  description: z.string().optional(),
});

/**
 * ERC-20 specific configuration
 */
export const ERC20ConfigSchema = z.object({
  /** Token name */
  name: z.string().min(1, 'Token name is required').max(100),

  /** Token symbol (typically 3-5 characters) */
  symbol: z
    .string()
    .min(1, 'Token symbol is required')
    .max(10, 'Token symbol should be 10 characters or less')
    .regex(/^[A-Z0-9]+$/, 'Token symbol should be uppercase alphanumeric'),

  /** Initial supply (as string to handle large numbers) */
  initialSupply: z
    .string()
    .regex(/^\d+$/, 'Initial supply must be a positive integer')
    .default('1000000'),

  /** Number of decimals */
  decimals: z.number().int().min(0).max(18).default(18),

  /** Enable minting functionality */
  mintable: z.boolean().default(false),

  /** Enable burning functionality */
  burnable: z.boolean().default(false),

  /** Enable pause functionality */
  pausable: z.boolean().default(false),
});

/**
 * ERC-721 specific configuration
 */
export const ERC721ConfigSchema = z.object({
  /** NFT collection name */
  name: z.string().min(1, 'Collection name is required').max(100),

  /** NFT collection symbol */
  symbol: z
    .string()
    .min(1, 'Collection symbol is required')
    .max(10)
    .regex(/^[A-Z0-9]+$/, 'Collection symbol should be uppercase alphanumeric'),

  /** Base URI for token metadata */
  baseUri: z.string().url('Base URI must be a valid URL').optional(),

  /** Maximum supply (0 for unlimited) */
  maxSupply: z.number().int().min(0).default(0),

  /** Enable minting functionality */
  mintable: z.boolean().default(true),

  /** Enable burning functionality */
  burnable: z.boolean().default(false),

  /** Enable enumerable extension */
  enumerable: z.boolean().default(false),

  /** Enable URI storage extension */
  uriStorage: z.boolean().default(true),
});

/**
 * ERC-1155 specific configuration
 */
export const ERC1155ConfigSchema = z.object({
  /** Collection name */
  name: z.string().min(1, 'Collection name is required').max(100),

  /** Base URI for token metadata */
  baseUri: z.string().url('Base URI must be a valid URL').optional(),

  /** Enable minting functionality */
  mintable: z.boolean().default(true),

  /** Enable burning functionality */
  burnable: z.boolean().default(false),

  /** Enable pause functionality */
  pausable: z.boolean().default(false),

  /** Enable supply tracking */
  supplyTracking: z.boolean().default(true),
});

/**
 * Deployment configuration
 */
export const DeploymentConfigSchema = z.object({
  /** Gas limit for deployment (optional) */
  gasLimit: z.number().int().positive().optional(),

  /** Gas price in Gwei (optional) */
  gasPrice: z.number().positive().optional(),

  /** Number of confirmations to wait */
  confirmations: z.number().int().min(1).default(1),

  /** Enable contract verification on explorer */
  verify: z.boolean().default(true),

  /** Verification API key */
  verifyApiKey: z.string().optional(),

  /** Constructor arguments (for custom contracts) */
  constructorArgs: z.array(ConstructorParamSchema).default([]),
});

/**
 * Access control configuration
 */
export const AccessControlConfigSchema = z.object({
  /** Enable role-based access control */
  enabled: z.boolean().default(false),

  /** Default admin address */
  admin: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Admin must be a valid Ethereum address').optional(),

  /** Additional roles */
  roles: z
    .array(
      z.object({
        name: z.string().min(1),
        addresses: z.array(z.string().regex(/^0x[a-fA-F0-9]{40}$/)),
      })
    )
    .default([]),
});

/**
 * Upgradeability configuration
 */
export const UpgradeabilityConfigSchema = z.object({
  /** Enable upgradeable proxy pattern */
  enabled: z.boolean().default(false),

  /** Proxy type (transparent, UUPS) */
  proxyType: z.enum(['transparent', 'uups']).default('transparent'),

  /** Proxy admin address */
  proxyAdmin: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
});

/**
 * Complete contract configuration schema
 */
export const ContractConfigSchema = z.object({
  /** Contract name */
  name: z
    .string()
    .min(1, 'Contract name is required')
    .regex(/^[A-Z][a-zA-Z0-9]*$/, 'Contract name must be PascalCase'),

  /** Contract type */
  type: ContractTypeSchema,

  /** Type-specific configuration */
  erc20: ERC20ConfigSchema.optional(),
  erc721: ERC721ConfigSchema.optional(),
  erc1155: ERC1155ConfigSchema.optional(),

  /** Deployment configuration */
  deployment: DeploymentConfigSchema.default({
    confirmations: 1,
    verify: true,
    constructorArgs: [],
  }),

  /** Access control configuration */
  accessControl: AccessControlConfigSchema.default({
    enabled: false,
    roles: [],
  }),

  /** Upgradeability configuration */
  upgradeability: UpgradeabilityConfigSchema.default({
    enabled: false,
    proxyType: 'transparent',
  }),

  /** Custom contract source path (for custom type) */
  sourcePath: z.string().optional(),

  /** Custom ABI path (for custom type) */
  abiPath: z.string().optional(),
});

/**
 * Multiple contracts configuration
 */
export const ContractsConfigSchema = z.object({
  /** Array of contract configurations */
  contracts: z.array(ContractConfigSchema).min(1, 'At least one contract is required'),
});

/**
 * TypeScript types inferred from schemas
 */
export type ContractType = z.infer<typeof ContractTypeSchema>;
export type SolidityType = z.infer<typeof SolidityTypeSchema>;
export type ConstructorParam = z.infer<typeof ConstructorParamSchema>;
export type ERC20Config = z.infer<typeof ERC20ConfigSchema>;
export type ERC721Config = z.infer<typeof ERC721ConfigSchema>;
export type ERC1155Config = z.infer<typeof ERC1155ConfigSchema>;
export type DeploymentConfig = z.infer<typeof DeploymentConfigSchema>;
export type AccessControlConfig = z.infer<typeof AccessControlConfigSchema>;
export type UpgradeabilityConfig = z.infer<typeof UpgradeabilityConfigSchema>;
export type ContractConfig = z.infer<typeof ContractConfigSchema>;
export type ContractsConfig = z.infer<typeof ContractsConfigSchema>;

/**
 * Example valid contract configuration for ERC-20
 */
export const EXAMPLE_ERC20_CONTRACT: ContractConfig = {
  name: 'MyToken',
  type: 'erc20',
  erc20: {
    name: 'My Token',
    symbol: 'MTK',
    initialSupply: '1000000',
    decimals: 18,
    mintable: true,
    burnable: true,
    pausable: false,
  },
  deployment: {
    confirmations: 2,
    verify: true,
    constructorArgs: [],
  },
  accessControl: {
    enabled: false,
    roles: [],
  },
  upgradeability: {
    enabled: false,
    proxyType: 'transparent',
  },
};

/**
 * Example valid contract configuration for ERC-721
 */
export const EXAMPLE_ERC721_CONTRACT: ContractConfig = {
  name: 'MyNFT',
  type: 'erc721',
  erc721: {
    name: 'My NFT Collection',
    symbol: 'MNFT',
    maxSupply: 10000,
    mintable: true,
    burnable: false,
    enumerable: true,
    uriStorage: true,
  },
  deployment: {
    confirmations: 2,
    verify: true,
    constructorArgs: [],
  },
  accessControl: {
    enabled: true,
    roles: [],
  },
  upgradeability: {
    enabled: false,
    proxyType: 'transparent',
  },
};
