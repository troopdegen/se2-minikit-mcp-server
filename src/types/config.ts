/**
 * Configuration type definitions
 * Auto-generated TypeScript types from Zod schemas
 */

// Re-export all types from schema modules
export type {
  NetworkType,
  TemplateType,
  ProjectMetadata,
  NetworkConfig,
  BuildConfig,
  DevServerConfig,
  ProjectConfig,
} from '../config/schemas/project-config.js';

export type {
  ContractType,
  SolidityType,
  ConstructorParam,
  ERC20Config,
  ERC721Config,
  ERC1155Config,
  DeploymentConfig,
  AccessControlConfig,
  UpgradeabilityConfig,
  ContractConfig,
  ContractsConfig,
} from '../config/schemas/contract-config.js';

export type {
  FrameAspectRatio,
  ManifestMetadata,
  DomainConfig,
  FrameConfig,
  WalletConfig,
  IdentityConfig,
  AnalyticsConfig,
  ApiConfig,
  MinikitConfig,
} from '../config/schemas/minikit-config.js';

// Re-export schemas for runtime validation
export {
  ProjectConfigSchema,
  NetworkTypeSchema,
  TemplateTypeSchema,
  EXAMPLE_PROJECT_CONFIG,
} from '../config/schemas/project-config.js';

export {
  ContractConfigSchema,
  ContractsConfigSchema,
  ContractTypeSchema,
  SolidityTypeSchema,
  EXAMPLE_ERC20_CONTRACT,
  EXAMPLE_ERC721_CONTRACT,
} from '../config/schemas/contract-config.js';

export {
  MinikitConfigSchema,
  FrameAspectRatioSchema,
  EXAMPLE_MINIKIT_CONFIG,
} from '../config/schemas/minikit-config.js';

// Re-export validator functions
export {
  validateProjectConfig,
  validateContractConfig,
  validateContractsConfig,
  validateMinikitConfig,
  validateConfigFromContent,
  detectConfigFormat,
  formatValidationErrors,
  validateAndFormat,
  isProjectConfig,
  isContractConfig,
  isContractsConfig,
  isMinikitConfig,
  mergeConfigs,
  parseConfig,
  ConfigType,
  type ValidationResult,
  type ValidationError,
  type ConfigFormat,
} from '../config/validator.js';
