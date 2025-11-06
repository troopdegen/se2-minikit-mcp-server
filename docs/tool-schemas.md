# MCP Tool Schemas

This document defines the complete schema specifications for all MCP tools provided by the scaffold-minikit server.

## Tool Naming Convention

All tools follow the naming pattern: `mcp__scaffold-minikit__<tool_name>`

## Tools Overview

| Tool | Purpose | Complexity |
|------|---------|------------|
| scaffold_project | Initialize new projects | Medium |
| add_minikit_support | Add Minikit to existing projects | Low |
| configure_contracts | Customize smart contracts | Medium |
| deploy_contracts | Deploy to Base networks | High |
| setup_farcaster_manifest | Generate Farcaster manifest | Low |
| generate_minikit_components | Create OnchainKit components | Medium |
| validate_configuration | Validate project setup | Low |
| create_frame | Generate Farcaster Frames | Medium |

---

## 1. scaffold_project

Creates a new Scaffold-ETH 2 project with optional Base Minikit integration.

### Schema

```typescript
{
  name: "mcp__scaffold-minikit__scaffold_project",
  description: "Initialize a new Scaffold-ETH 2 project with optional Base Minikit integration for Farcaster Mini Apps",
  parameters: {
    type: "object",
    properties: {
      projectName: {
        type: "string",
        description: "Name of the project (kebab-case recommended)",
        pattern: "^[a-z0-9-]+$",
        minLength: 3,
        maxLength: 50
      },
      projectPath: {
        type: "string",
        description: "Path where project should be created (defaults to current directory)",
        default: "."
      },
      includesMinikit: {
        type: "boolean",
        description: "Whether to include Base Minikit integration",
        default: false
      },
      template: {
        type: "string",
        enum: ["basic", "nft", "defi", "dao", "gaming", "social"],
        description: "Project template to use",
        default: "basic"
      },
      contractFramework: {
        type: "string",
        enum: ["hardhat", "foundry"],
        description: "Smart contract framework to use",
        default: "hardhat"
      },
      targetNetwork: {
        type: "string",
        enum: ["base", "baseSepolia", "localhost"],
        description: "Target network for deployment",
        default: "baseSepolia"
      }
    },
    required: ["projectName"]
  }
}
```

### Response Schema

```typescript
interface ScaffoldProjectResponse {
  success: boolean;
  data?: {
    projectPath: string;
    projectName: string;
    template: string;
    minikit: boolean;
    framework: string;
    network: string;
    filesCreated: string[];
    nextSteps: string[];
  };
  error?: ErrorResponse;
}
```

### Example Usage

```typescript
// Basic project
await mcp.scaffold_project({
  projectName: "my-dapp",
  template: "basic"
});

// NFT Mini App
await mcp.scaffold_project({
  projectName: "nft-gallery",
  includesMinikit: true,
  template: "nft",
  targetNetwork: "baseSepolia"
});
```

---

## 2. add_minikit_support

Adds Base Minikit integration to an existing Scaffold-ETH 2 project.

### Schema

```typescript
{
  name: "mcp__scaffold-minikit__add_minikit_support",
  description: "Add Base Minikit integration to existing Scaffold-ETH 2 project",
  parameters: {
    type: "object",
    properties: {
      projectPath: {
        type: "string",
        description: "Path to Scaffold-ETH 2 project"
      },
      includesFarcasterFrames: {
        type: "boolean",
        description: "Whether to include Farcaster Frames support",
        default: true
      },
      includesSmartWallet: {
        type: "boolean",
        description: "Whether to configure smart wallet features",
        default: true
      },
      authStrategy: {
        type: "string",
        enum: ["siwf", "wallet", "both"],
        description: "Authentication strategy: Sign-in with Farcaster, Wallet, or Both",
        default: "both"
      },
      components: {
        type: "array",
        items: {
          type: "string",
          enum: ["transaction", "identity", "wallet", "swap", "fund", "checkout"]
        },
        description: "OnchainKit components to include",
        default: ["transaction", "identity", "wallet"]
      }
    },
    required: ["projectPath"]
  }
}
```

### Response Schema

```typescript
interface AddMinikitResponse {
  success: boolean;
  data?: {
    projectPath: string;
    packagesInstalled: string[];
    filesModified: string[];
    filesCreated: string[];
    configuration: {
      frames: boolean;
      smartWallet: boolean;
      authStrategy: string;
      components: string[];
    };
    nextSteps: string[];
  };
  error?: ErrorResponse;
}
```

---

## 3. configure_contracts

Configure and customize smart contracts with various features.

### Schema

```typescript
{
  name: "mcp__scaffold-minikit__configure_contracts",
  description: "Configure smart contracts with custom logic and Base-specific features",
  parameters: {
    type: "object",
    properties: {
      projectPath: {
        type: "string",
        description: "Path to project"
      },
      contractType: {
        type: "string",
        enum: ["erc20", "erc721", "erc1155", "custom"],
        description: "Type of contract to configure"
      },
      contractName: {
        type: "string",
        description: "Name for the contract (PascalCase)",
        pattern: "^[A-Z][a-zA-Z0-9]*$"
      },
      features: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "mintable",
            "burnable",
            "pausable",
            "ownable",
            "upgradeable",
            "enumerable",
            "uri-storage",
            "votes",
            "snapshot"
          ]
        },
        description: "Features to include in contract"
      },
      customCode: {
        type: "string",
        description: "Optional custom Solidity code to add"
      },
      baseFeatures: {
        type: "object",
        properties: {
          gasOptimized: {
            type: "boolean",
            description: "Apply gas optimization patterns",
            default: true
          },
          securityChecks: {
            type: "boolean",
            description: "Include security best practices",
            default: true
          }
        }
      }
    },
    required: ["projectPath", "contractType"]
  }
}
```

### Response Schema

```typescript
interface ConfigureContractsResponse {
  success: boolean;
  data?: {
    contractPath: string;
    contractName: string;
    contractType: string;
    features: string[];
    deploymentScript: string;
    testFile: string;
    estimatedGas: number;
    securityNotes: string[];
  };
  error?: ErrorResponse;
}
```

---

## 4. deploy_contracts

Deploy smart contracts to Base networks with verification.

### Schema

```typescript
{
  name: "mcp__scaffold-minikit__deploy_contracts",
  description: "Deploy smart contracts to Base mainnet or testnet with automatic verification",
  parameters: {
    type: "object",
    properties: {
      projectPath: {
        type: "string",
        description: "Path to project"
      },
      network: {
        type: "string",
        enum: ["base", "baseSepolia", "localhost"],
        description: "Network to deploy to"
      },
      contracts: {
        type: "array",
        items: {
          type: "string"
        },
        description: "Specific contracts to deploy (empty = all)"
      },
      verifyContracts: {
        type: "boolean",
        description: "Whether to verify contracts on Basescan",
        default: true
      },
      deploymentArgs: {
        type: "object",
        description: "Constructor arguments for contract deployment",
        additionalProperties: true
      },
      gasLimit: {
        type: "number",
        description: "Optional gas limit for deployment transactions"
      },
      waitForConfirmations: {
        type: "number",
        description: "Number of confirmations to wait",
        default: 2,
        minimum: 1,
        maximum: 10
      }
    },
    required: ["projectPath", "network"]
  }
}
```

### Response Schema

```typescript
interface DeployContractsResponse {
  success: boolean;
  data?: {
    network: string;
    chainId: number;
    deployments: Array<{
      contractName: string;
      address: string;
      transactionHash: string;
      blockNumber: number;
      gasUsed: string;
      verified: boolean;
      explorerUrl: string;
      constructorArgs?: any[];
    }>;
    totalGasUsed: string;
    estimatedCost: {
      eth: string;
      usd?: string;
    };
    deploymentTime: number; // milliseconds
  };
  error?: ErrorResponse;
}
```

---

## 5. setup_farcaster_manifest

Generate and configure Farcaster Mini App manifest file.

### Schema

```typescript
{
  name: "mcp__scaffold-minikit__setup_farcaster_manifest",
  description: "Generate Farcaster Mini App manifest with proper configuration and domain signature",
  parameters: {
    type: "object",
    properties: {
      projectPath: {
        type: "string",
        description: "Path to project"
      },
      appName: {
        type: "string",
        description: "Display name of the Mini App",
        minLength: 3,
        maxLength: 50
      },
      domain: {
        type: "string",
        description: "Domain where app will be hosted (without protocol)",
        pattern: "^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$"
      },
      iconUrl: {
        type: "string",
        description: "URL to app icon (PNG, 200x200px minimum)",
        format: "uri"
      },
      splashImageUrl: {
        type: "string",
        description: "URL to splash screen image",
        format: "uri"
      },
      description: {
        type: "string",
        description: "Short description of the app",
        maxLength: 200
      },
      enableWebhooks: {
        type: "boolean",
        description: "Whether to enable webhook support",
        default: false
      },
      webhookUrl: {
        type: "string",
        description: "Webhook endpoint URL (if webhooks enabled)",
        format: "uri"
      }
    },
    required: ["projectPath", "appName", "domain", "iconUrl"]
  }
}
```

### Response Schema

```typescript
interface SetupManifestResponse {
  success: boolean;
  data?: {
    manifestPath: string;
    manifest: FarcasterManifest;
    domainSignature: string;
    validationStatus: {
      manifestValid: boolean;
      domainValid: boolean;
      imagesAccessible: boolean;
      issues: string[];
    };
    nextSteps: string[];
  };
  error?: ErrorResponse;
}

interface FarcasterManifest {
  accountAssociation: {
    header: string;
    payload: string;
    signature: string;
  };
  frame: {
    version: string;
    name: string;
    iconUrl: string;
    homeUrl: string;
    imageUrl: string;
    splashImageUrl: string;
    webhookUrl?: string;
  };
}
```

---

## 6. generate_minikit_components

Generate OnchainKit components integrated with deployed contracts.

### Schema

```typescript
{
  name: "mcp__scaffold-minikit__generate_minikit_components",
  description: "Generate OnchainKit components connected to deployed contracts",
  parameters: {
    type: "object",
    properties: {
      projectPath: {
        type: "string",
        description: "Path to project"
      },
      componentType: {
        type: "string",
        enum: [
          "transaction",
          "identity",
          "wallet",
          "swap",
          "fund",
          "checkout",
          "nft-mint",
          "custom"
        ],
        description: "Type of OnchainKit component to generate"
      },
      componentName: {
        type: "string",
        description: "Name for the component (PascalCase)",
        pattern: "^[A-Z][a-zA-Z0-9]*$"
      },
      contractName: {
        type: "string",
        description: "Name of contract to integrate with"
      },
      functionName: {
        type: "string",
        description: "Specific contract function to call"
      },
      outputPath: {
        type: "string",
        description: "Path where component should be generated (relative to nextjs/)"
      },
      styling: {
        type: "string",
        enum: ["tailwind", "daisyui", "custom"],
        description: "Styling approach to use",
        default: "daisyui"
      }
    },
    required: ["projectPath", "componentType"]
  }
}
```

### Response Schema

```typescript
interface GenerateComponentResponse {
  success: boolean;
  data?: {
    componentPath: string;
    componentName: string;
    imports: string[];
    integrations: {
      contract: string;
      functions: string[];
    };
    exampleUsage: string;
  };
  error?: ErrorResponse;
}
```

---

## 7. validate_configuration

Validate project configuration and deployment readiness.

### Schema

```typescript
{
  name: "mcp__scaffold-minikit__validate_configuration",
  description: "Validate project setup, configuration, and deployment readiness with comprehensive checks",
  parameters: {
    type: "object",
    properties: {
      projectPath: {
        type: "string",
        description: "Path to project"
      },
      validationType: {
        type: "string",
        enum: ["full", "contracts", "minikit", "deployment", "security"],
        description: "Type of validation to perform",
        default: "full"
      },
      strictMode: {
        type: "boolean",
        description: "Whether to fail on warnings (not just errors)",
        default: false
      }
    },
    required: ["projectPath"]
  }
}
```

### Response Schema

```typescript
interface ValidationResponse {
  success: boolean;
  data?: {
    valid: boolean;
    checks: {
      configuration: ValidationCheck;
      contracts: ValidationCheck;
      frontend: ValidationCheck;
      minikit?: ValidationCheck;
      security: ValidationCheck;
      deployment: ValidationCheck;
    };
    errors: ValidationIssue[];
    warnings: ValidationIssue[];
    summary: {
      totalChecks: number;
      passed: number;
      failed: number;
      warnings: number;
    };
  };
  error?: ErrorResponse;
}

interface ValidationCheck {
  name: string;
  passed: boolean;
  details: string[];
}

interface ValidationIssue {
  severity: "error" | "warning";
  category: string;
  message: string;
  location?: string;
  fix?: string;
}
```

---

## 8. create_frame

Generate Farcaster Frame for viral distribution of Mini App.

### Schema

```typescript
{
  name: "mcp__scaffold-minikit__create_frame",
  description: "Generate a Farcaster Frame that links to your Mini App for social sharing",
  parameters: {
    type: "object",
    properties: {
      projectPath: {
        type: "string",
        description: "Path to project"
      },
      frameType: {
        type: "string",
        enum: ["launch", "transaction", "mint", "poll", "custom"],
        description: "Type of Frame to generate"
      },
      frameName: {
        type: "string",
        description: "Name for the frame (used in file naming)"
      },
      imageUrl: {
        type: "string",
        description: "URL to Frame preview image (1200x630px recommended)",
        format: "uri"
      },
      title: {
        type: "string",
        description: "Frame title",
        maxLength: 100
      },
      buttonText: {
        type: "string",
        description: "Text for Frame action button",
        maxLength: 32
      },
      targetUrl: {
        type: "string",
        description: "URL to Mini App or specific action",
        format: "uri"
      },
      postUrl: {
        type: "string",
        description: "URL for frame interactions",
        format: "uri"
      }
    },
    required: ["projectPath", "frameType", "imageUrl", "buttonText", "targetUrl"]
  }
}
```

### Response Schema

```typescript
interface CreateFrameResponse {
  success: boolean;
  data?: {
    framePath: string;
    frameMetadata: FrameMetadata;
    apiRoute: string;
    testUrl: string;
    sharingUrl: string;
  };
  error?: ErrorResponse;
}

interface FrameMetadata {
  "fc:frame": string;
  "fc:frame:image": string;
  "fc:frame:button:1": string;
  "fc:frame:button:1:action": string;
  "fc:frame:button:1:target": string;
  "fc:frame:post_url": string;
}
```

---

## Common Types

### ErrorResponse

```typescript
interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
  recovery?: {
    automatic: boolean;
    steps?: string[];
  };
}
```

### Error Codes

| Code | Description | Recovery |
|------|-------------|----------|
| INVALID_PROJECT_PATH | Project path doesn't exist | Manual |
| NETWORK_ERROR | RPC connection failed | Automatic (retry) |
| COMPILATION_ERROR | Contract compilation failed | Manual |
| DEPLOYMENT_ERROR | Contract deployment failed | Automatic (rollback) |
| VALIDATION_ERROR | Configuration validation failed | Manual |
| MINIKIT_ERROR | Minikit setup failed | Manual |
| MANIFEST_ERROR | Farcaster manifest invalid | Manual |
| PERMISSION_ERROR | File system permission denied | Manual |

---

## Best Practices for Tool Usage

### 1. Project Initialization
```typescript
// Always start with scaffold_project
await scaffold_project({ projectName: "my-app", includesMinikit: true });

// Then validate before proceeding
await validate_configuration({ projectPath: "./my-app" });
```

### 2. Incremental Development
```typescript
// Configure contracts first
await configure_contracts({
  projectPath: "./my-app",
  contractType: "erc721",
  features: ["mintable", "burnable"]
});

// Then generate matching components
await generate_minikit_components({
  projectPath: "./my-app",
  componentType: "nft-mint",
  contractName: "MyNFT"
});
```

### 3. Pre-Deployment Checks
```typescript
// Always validate before deploying
const validation = await validate_configuration({
  projectPath: "./my-app",
  validationType: "deployment"
});

if (validation.data.valid) {
  await deploy_contracts({
    projectPath: "./my-app",
    network: "baseSepolia"
  });
}
```

### 4. Minikit Setup
```typescript
// Setup manifest before creating frames
await setup_farcaster_manifest({
  projectPath: "./my-app",
  appName: "My App",
  domain: "myapp.xyz",
  iconUrl: "https://myapp.xyz/icon.png"
});

// Then create frames
await create_frame({
  projectPath: "./my-app",
  frameType: "launch",
  imageUrl: "https://myapp.xyz/frame.png",
  buttonText: "Open App",
  targetUrl: "https://myapp.xyz"
});
```
