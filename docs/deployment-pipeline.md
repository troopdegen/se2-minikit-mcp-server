# Deployment Pipeline Architecture

This document describes the complete deployment pipeline for projects created with the scaffold-minikit MCP server.

## Pipeline Overview

The deployment pipeline consists of 6 major stages, each with validation gates and rollback capabilities.

```
┌──────────────────────────────────────────────────────────────┐
│                    Deployment Pipeline                        │
└──────────────────────────────────────────────────────────────┘

Stage 1: PRE-DEPLOYMENT VALIDATION
├─ Validate configuration file
├─ Check environment variables
├─ Verify contract compilation
├─ Run test suite
└─ Check network connectivity

Stage 2: CONTRACT DEPLOYMENT
├─ Compile contracts (Hardhat/Foundry)
├─ Deploy to target network (Base/Sepolia)
├─ Verify on Basescan
├─ Generate TypeScript types
└─ Update frontend contract imports

Stage 3: FRONTEND CONFIGURATION
├─ Update contract addresses in config
├─ Configure OnchainKit providers
├─ Setup Minikit SDK (if enabled)
├─ Generate Farcaster manifest (if enabled)
└─ Build and optimize frontend

Stage 4: MINIKIT SETUP (if enabled)
├─ Generate domain signature
├─ Create Farcaster manifest
├─ Configure Frame metadata
├─ Setup webhook endpoints (optional)
└─ Validate Mini App requirements

Stage 5: DEPLOYMENT
├─ Deploy frontend (Vercel/custom)
├─ Configure DNS/domain
├─ Setup HTTPS/SSL
├─ Register Mini App (if Minikit)
└─ Final validation checks

Stage 6: POST-DEPLOYMENT
├─ Health checks
├─ Generate deployment report
├─ Create usage documentation
└─ Store deployment metadata
```

## Stage 1: Pre-Deployment Validation

### Configuration Validation

```typescript
interface ConfigurationCheck {
  projectPath: string;
  configFile: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

async function validateConfiguration(projectPath: string): Promise<ConfigurationCheck> {
  const checks = {
    configFileExists: await fileExists(`${projectPath}/scaffold-minikit.config.json`),
    packageJsonValid: await validatePackageJson(projectPath),
    hardhatConfigValid: await validateHardhatConfig(projectPath),
    envVariablesSet: await validateEnvironmentVariables(projectPath),
  };

  return {
    projectPath,
    configFile: "scaffold-minikit.config.json",
    valid: Object.values(checks).every(v => v),
    errors: collectErrors(checks),
    warnings: collectWarnings(checks),
  };
}
```

### Environment Variable Validation

```typescript
interface EnvironmentCheck {
  required: {
    DEPLOYER_PRIVATE_KEY: boolean;
    BASE_RPC_URL?: boolean;
    BASE_SEPOLIA_RPC_URL?: boolean;
    BASESCAN_API_KEY: boolean;
  };
  optional: {
    NEXT_PUBLIC_ONCHAINKIT_API_KEY?: boolean;
    FARCASTER_FID?: boolean;
  };
  allSet: boolean;
}

async function validateEnvironmentVariables(projectPath: string): Promise<EnvironmentCheck> {
  const env = await loadEnvFile(`${projectPath}/.env`);

  return {
    required: {
      DEPLOYER_PRIVATE_KEY: !!env.DEPLOYER_PRIVATE_KEY,
      BASE_SEPOLIA_RPC_URL: !!env.BASE_SEPOLIA_RPC_URL,
      BASESCAN_API_KEY: !!env.BASESCAN_API_KEY,
    },
    optional: {
      NEXT_PUBLIC_ONCHAINKIT_API_KEY: !!env.NEXT_PUBLIC_ONCHAINKIT_API_KEY,
      FARCASTER_FID: !!env.FARCASTER_FID,
    },
    allSet: checkAllRequired(env),
  };
}
```

### Contract Compilation Check

```typescript
interface CompilationCheck {
  framework: "hardhat" | "foundry";
  success: boolean;
  contracts: CompiledContract[];
  errors: CompilationError[];
  warnings: string[];
}

interface CompiledContract {
  name: string;
  path: string;
  bytecode: string;
  abi: any[];
  gasEstimate: number;
}

async function validateContractCompilation(projectPath: string): Promise<CompilationCheck> {
  const framework = detectFramework(projectPath);

  if (framework === "hardhat") {
    return await compileWithHardhat(projectPath);
  } else {
    return await compileWithFoundry(projectPath);
  }
}
```

### Test Suite Execution

```typescript
interface TestResults {
  framework: "hardhat" | "foundry";
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  coverage?: CoverageReport;
  duration: number; // milliseconds
}

async function runTestSuite(projectPath: string): Promise<TestResults> {
  const framework = detectFramework(projectPath);

  if (framework === "hardhat") {
    return await runHardhatTests(projectPath);
  } else {
    return await runFoundryTests(projectPath);
  }
}
```

### Network Connectivity Check

```typescript
interface NetworkCheck {
  network: string;
  rpcUrl: string;
  connected: boolean;
  blockNumber?: number;
  chainId?: number;
  latency: number; // milliseconds
}

async function validateNetworkConnectivity(network: string, rpcUrl: string): Promise<NetworkCheck> {
  const startTime = Date.now();

  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const blockNumber = await provider.getBlockNumber();
    const network = await provider.getNetwork();

    return {
      network,
      rpcUrl,
      connected: true,
      blockNumber,
      chainId: network.chainId,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      network,
      rpcUrl,
      connected: false,
      latency: Date.now() - startTime,
    };
  }
}
```

## Stage 2: Contract Deployment

### Deployment Orchestration

```typescript
interface DeploymentPlan {
  contracts: ContractDeployment[];
  dependencies: Map<string, string[]>; // Contract dependencies
  deploymentOrder: string[]; // Topologically sorted
}

interface ContractDeployment {
  name: string;
  path: string;
  constructorArgs: any[];
  libraries?: Record<string, string>;
  gasLimit?: number;
}

async function executeDeployment(
  projectPath: string,
  network: string,
  plan: DeploymentPlan
): Promise<DeploymentResult> {
  const results: DeployedContract[] = [];

  // Deploy contracts in dependency order
  for (const contractName of plan.deploymentOrder) {
    const deployment = plan.contracts.find(c => c.name === contractName);

    try {
      const result = await deployContract(deployment, network);
      results.push(result);

      // Verify contract on explorer
      if (shouldVerify(network)) {
        await verifyContract(result, network);
      }
    } catch (error) {
      // Rollback previous deployments on failure
      await rollbackDeployments(results);
      throw error;
    }
  }

  return {
    success: true,
    contracts: results,
    network,
    timestamp: Date.now(),
  };
}
```

### Contract Verification

```typescript
interface VerificationRequest {
  contractAddress: string;
  contractName: string;
  sourceCode: string;
  constructorArgs: string; // ABI-encoded
  compilerVersion: string;
  optimizationUsed: boolean;
  runs: number;
}

async function verifyContract(
  contract: DeployedContract,
  network: string
): Promise<VerificationResult> {
  const apiKey = getBasescanApiKey();
  const apiUrl = getBasescanApiUrl(network);

  const request: VerificationRequest = {
    contractAddress: contract.address,
    contractName: contract.name,
    sourceCode: await getSourceCode(contract.path),
    constructorArgs: encodeConstructorArgs(contract.constructorArgs),
    compilerVersion: getCompilerVersion(),
    optimizationUsed: true,
    runs: 200,
  };

  const response = await submitVerification(apiUrl, apiKey, request);

  // Poll for verification status
  return await pollVerificationStatus(apiUrl, apiKey, response.guid);
}
```

### TypeScript Type Generation

```typescript
interface TypeGenerationResult {
  outputPath: string;
  filesGenerated: string[];
  contracts: GeneratedTypes[];
}

async function generateTypeScriptTypes(
  deployments: DeployedContract[]
): Promise<TypeGenerationResult> {
  const outputPath = "packages/nextjs/contracts";
  const filesGenerated: string[] = [];

  // Generate deployedContracts.ts
  const deployedContractsFile = generateDeployedContractsFile(deployments);
  await writeFile(`${outputPath}/deployedContracts.ts`, deployedContractsFile);
  filesGenerated.push("deployedContracts.ts");

  // Generate contract types
  for (const contract of deployments) {
    const typeFile = generateContractTypes(contract);
    await writeFile(`${outputPath}/${contract.name}.ts`, typeFile);
    filesGenerated.push(`${contract.name}.ts`);
  }

  return {
    outputPath,
    filesGenerated,
    contracts: deployments,
  };
}
```

## Stage 3: Frontend Configuration

### Contract Address Updates

```typescript
interface FrontendConfig {
  contractAddresses: Record<string, string>;
  networkId: number;
  rpcUrl: string;
  explorerUrl: string;
}

async function updateFrontendConfiguration(
  projectPath: string,
  deployments: DeployedContract[],
  network: string
): Promise<void> {
  const config: FrontendConfig = {
    contractAddresses: Object.fromEntries(
      deployments.map(d => [d.name, d.address])
    ),
    networkId: getNetworkId(network),
    rpcUrl: getRpcUrl(network),
    explorerUrl: getExplorerUrl(network),
  };

  // Update deployedContracts.ts
  await updateDeployedContracts(projectPath, deployments, network);

  // Update environment variables
  await updateNextEnvFile(projectPath, config);
}
```

### OnchainKit Provider Configuration

```typescript
async function configureOnchainKit(
  projectPath: string,
  network: string
): Promise<void> {
  const providersPath = `${projectPath}/packages/nextjs/app/providers.tsx`;

  const providersCode = `
"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { ${network === "base" ? "base" : "baseSepolia"} } from "wagmi/chains";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={${network === "base" ? "base" : "baseSepolia"}}
      >
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </OnchainKitProvider>
    </WagmiProvider>
  );
}
`;

  await writeFile(providersPath, providersCode);
}
```

### Minikit SDK Setup

```typescript
async function setupMinikitSDK(projectPath: string): Promise<void> {
  const layoutPath = `${projectPath}/packages/nextjs/app/layout.tsx`;

  // Add Minikit initialization to layout
  const layoutCode = await readFile(layoutPath);
  const updatedLayout = injectMinikitInit(layoutCode);
  await writeFile(layoutPath, updatedLayout);
}

function injectMinikitInit(layoutCode: string): string {
  const initCode = `
  useEffect(() => {
    import("@coinbase/minikit").then(({ default: sdk }) => {
      sdk.actions.ready();
    });
  }, []);
`;

  // Inject into root layout component
  return layoutCode.replace(
    /(export default function RootLayout.*?\{)/s,
    `$1\n${initCode}`
  );
}
```

## Stage 4: Minikit Setup

### Domain Signature Generation

```typescript
interface DomainSignature {
  domain: string;
  fid: number;
  header: string;
  payload: string;
  signature: string;
}

async function generateDomainSignature(
  domain: string,
  fid: number,
  privateKey: string
): Promise<DomainSignature> {
  const message = `${domain}:${fid}`;
  const wallet = new ethers.Wallet(privateKey);
  const signature = await wallet.signMessage(message);

  return {
    domain,
    fid,
    header: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(domain)),
    payload: message,
    signature,
  };
}
```

### Farcaster Manifest Generation

```typescript
interface ManifestConfig {
  appName: string;
  domain: string;
  iconUrl: string;
  splashImageUrl: string;
  homeUrl: string;
  webhookUrl?: string;
}

async function generateFarcasterManifest(
  config: ManifestConfig,
  signature: DomainSignature
): Promise<FarcasterManifest> {
  return {
    accountAssociation: {
      header: signature.header,
      payload: signature.payload,
      signature: signature.signature,
    },
    frame: {
      version: "next",
      name: config.appName,
      iconUrl: config.iconUrl,
      homeUrl: config.homeUrl,
      imageUrl: `${config.homeUrl}/og.png`,
      splashImageUrl: config.splashImageUrl,
      webhookUrl: config.webhookUrl,
    },
  };
}
```

### Frame Metadata Configuration

```typescript
async function configureFrameMetadata(
  projectPath: string,
  appName: string,
  domain: string
): Promise<void> {
  const metadataPath = `${projectPath}/packages/nextjs/app/layout.tsx`;

  const frameMetadata = {
    "fc:frame": "vNext",
    "fc:frame:image": `https://${domain}/og.png`,
    "fc:frame:button:1": `Open ${appName}`,
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": `https://${domain}`,
  };

  await injectFrameMetadata(metadataPath, frameMetadata);
}
```

## Stage 5: Deployment

### Frontend Deployment (Vercel)

```typescript
interface VercelDeployment {
  url: string;
  deploymentId: string;
  readyState: "READY" | "ERROR" | "QUEUED";
  alias?: string[];
}

async function deployToVercel(
  projectPath: string,
  config: DeploymentConfig
): Promise<VercelDeployment> {
  // Build frontend
  await buildFrontend(projectPath);

  // Deploy to Vercel
  const deployment = await execVercelDeploy(projectPath, config);

  // Wait for deployment to be ready
  const result = await pollDeploymentStatus(deployment.id);

  // Assign custom domain if configured
  if (config.customDomain) {
    await assignDomain(deployment.id, config.customDomain);
  }

  return result;
}
```

### Mini App Registration

```typescript
interface MiniAppRegistration {
  appId: string;
  domain: string;
  manifestUrl: string;
  verified: boolean;
  status: "pending" | "approved" | "rejected";
}

async function registerMiniApp(
  domain: string,
  manifestUrl: string
): Promise<MiniAppRegistration> {
  // Submit Mini App for registration
  const registration = await submitMiniAppRegistration({
    domain,
    manifestUrl,
  });

  // Poll for approval status
  return await pollRegistrationStatus(registration.appId);
}
```

## Stage 6: Post-Deployment

### Health Checks

```typescript
interface HealthCheck {
  frontend: {
    accessible: boolean;
    loadTime: number;
    status: number;
  };
  contracts: {
    deployed: boolean;
    verified: boolean;
    callable: boolean;
  };
  minikit?: {
    manifestAccessible: boolean;
    frameRenderable: boolean;
    authWorking: boolean;
  };
}

async function performHealthChecks(
  deploymentUrl: string,
  contracts: DeployedContract[],
  minikit: boolean
): Promise<HealthCheck> {
  const checks: HealthCheck = {
    frontend: await checkFrontend(deploymentUrl),
    contracts: await checkContracts(contracts),
  };

  if (minikit) {
    checks.minikit = await checkMinikit(deploymentUrl);
  }

  return checks;
}
```

### Deployment Report Generation

```typescript
interface DeploymentReport {
  timestamp: number;
  network: string;
  contracts: DeployedContract[];
  frontend: {
    url: string;
    buildTime: number;
  };
  minikit?: {
    registered: boolean;
    manifestUrl: string;
  };
  costs: {
    gasUsed: string;
    estimatedCostETH: string;
    estimatedCostUSD?: string;
  };
  nextSteps: string[];
}

async function generateDeploymentReport(
  deployment: DeploymentResult
): Promise<DeploymentReport> {
  const report: DeploymentReport = {
    timestamp: deployment.timestamp,
    network: deployment.network,
    contracts: deployment.contracts,
    frontend: deployment.frontend,
    costs: calculateDeploymentCosts(deployment),
    nextSteps: generateNextSteps(deployment),
  };

  if (deployment.minikit) {
    report.minikit = deployment.minikit;
  }

  return report;
}
```

## Rollback Strategies

### Contract Deployment Rollback

```typescript
interface RollbackPlan {
  contracts: string[]; // Addresses to mark as deprecated
  previousDeployment?: DeploymentMetadata;
  rollbackActions: RollbackAction[];
}

async function rollbackDeployments(
  deployedContracts: DeployedContract[]
): Promise<void> {
  // Mark contracts as deprecated in deployment metadata
  for (const contract of deployedContracts) {
    await markContractDeprecated(contract.address, contract.name);
  }

  // Restore previous configuration
  const previousConfig = await loadPreviousConfiguration();
  if (previousConfig) {
    await restoreConfiguration(previousConfig);
  }

  // Clean up generated files
  await cleanupGeneratedFiles(deployedContracts);
}
```

### Configuration Rollback

```typescript
async function rollbackConfiguration(
  projectPath: string,
  backupTimestamp: number
): Promise<void> {
  const backupPath = `${projectPath}/.backups/${backupTimestamp}`;

  // Restore configuration files
  await restoreFile(`${backupPath}/scaffold-minikit.config.json`, `${projectPath}/scaffold-minikit.config.json`);
  await restoreFile(`${backupPath}/.env`, `${projectPath}/.env`);
  await restoreFile(`${backupPath}/hardhat.config.ts`, `${projectPath}/packages/hardhat/hardhat.config.ts`);

  // Restore frontend configuration
  await restoreDirectory(`${backupPath}/nextjs/contracts`, `${projectPath}/packages/nextjs/contracts`);
}
```

## State Machine

```typescript
type DeploymentState =
  | "idle"
  | "validating"
  | "compiling"
  | "deploying_contracts"
  | "verifying_contracts"
  | "configuring_frontend"
  | "building_frontend"
  | "deploying_frontend"
  | "registering_miniapp"
  | "health_checking"
  | "completed"
  | "failed"
  | "rolling_back";

interface DeploymentStateMachine {
  state: DeploymentState;
  context: DeploymentContext;
  history: StateTransition[];

  transition(newState: DeploymentState, data?: any): Promise<void>;
  rollback(): Promise<void>;
  canTransition(targetState: DeploymentState): boolean;
}
```

## Error Handling

### Error Categories

```typescript
enum DeploymentErrorCategory {
  VALIDATION = "validation",
  COMPILATION = "compilation",
  DEPLOYMENT = "deployment",
  VERIFICATION = "verification",
  CONFIGURATION = "configuration",
  NETWORK = "network",
  MINIKIT = "minikit",
}

interface DeploymentError {
  category: DeploymentErrorCategory;
  stage: DeploymentState;
  message: string;
  details?: any;
  recoverable: boolean;
  recovery?: RecoveryStrategy;
}
```

### Recovery Strategies

```typescript
interface RecoveryStrategy {
  automatic: boolean;
  actions: RecoveryAction[];
  retryCount: number;
  backoffMs: number;
}

type RecoveryAction =
  | { type: "retry"; delay: number }
  | { type: "skip"; continue: boolean }
  | { type: "rollback"; toState: DeploymentState }
  | { type: "manual"; instructions: string[] };
```

## Performance Optimization

### Parallel Operations

```typescript
async function optimizedDeployment(plan: DeploymentPlan): Promise<DeploymentResult> {
  // Group independent contracts
  const batches = groupIndependentContracts(plan);

  // Deploy each batch in parallel
  const results: DeployedContract[] = [];
  for (const batch of batches) {
    const batchResults = await Promise.all(
      batch.map(contract => deployContract(contract))
    );
    results.push(...batchResults);
  }

  return { success: true, contracts: results };
}
```

### Caching Strategy

```typescript
interface DeploymentCache {
  compiledContracts: Map<string, CompiledContract>;
  verificationResults: Map<string, VerificationResult>;
  networkStatus: Map<string, NetworkCheck>;
}

async function getCachedOrCompile(
  contractPath: string,
  cache: DeploymentCache
): Promise<CompiledContract> {
  const cacheKey = await getFileHash(contractPath);

  if (cache.compiledContracts.has(cacheKey)) {
    return cache.compiledContracts.get(cacheKey)!;
  }

  const compiled = await compileContract(contractPath);
  cache.compiledContracts.set(cacheKey, compiled);

  return compiled;
}
```

## Monitoring & Logging

### Structured Logging

```typescript
interface DeploymentLog {
  timestamp: number;
  level: "debug" | "info" | "warn" | "error";
  stage: DeploymentState;
  message: string;
  data?: any;
  duration?: number;
}

function logDeploymentEvent(
  stage: DeploymentState,
  message: string,
  level: "info" | "warn" | "error" = "info",
  data?: any
): void {
  const log: DeploymentLog = {
    timestamp: Date.now(),
    level,
    stage,
    message,
    data,
  };

  console.log(JSON.stringify(log));
}
```

### Progress Tracking

```typescript
interface DeploymentProgress {
  totalStages: number;
  completedStages: number;
  currentStage: DeploymentState;
  estimatedTimeRemaining: number; // milliseconds
  startTime: number;
}

function calculateProgress(
  stateMachine: DeploymentStateMachine
): DeploymentProgress {
  const stages = getOrderedStages();
  const currentIndex = stages.indexOf(stateMachine.state);
  const averageStageTime = calculateAverageStageTime(stateMachine.history);

  return {
    totalStages: stages.length,
    completedStages: currentIndex,
    currentStage: stateMachine.state,
    estimatedTimeRemaining: (stages.length - currentIndex) * averageStageTime,
    startTime: stateMachine.history[0]?.timestamp || Date.now(),
  };
}
```
