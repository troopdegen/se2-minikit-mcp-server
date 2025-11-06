# MCP Server Architecture: Scaffold-ETH 2 + Minikit Deployment Platform

## Overview

**Name**: `mcp__scaffold-minikit` (or `mcp__web3-builder`)

**Purpose**: Enable users to rapidly scaffold, configure, and deploy decentralized applications using Scaffold-ETH 2, with optional Base Minikit integration for Farcaster Mini Apps.

**Target Users**:
- Hackathon participants needing rapid dApp setup
- Web3 developers building on Base + Farcaster
- Teams prototyping blockchain applications
- Developers migrating to Minikit platform

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code Client                        │
│              (User interacts via natural language)           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ MCP Protocol
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              MCP Server: scaffold-minikit                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Tool Layer (Actions)                     │  │
│  │  • scaffold_project                                   │  │
│  │  • add_minikit_support                               │  │
│  │  • configure_contracts                               │  │
│  │  • deploy_contracts                                  │  │
│  │  • setup_farcaster_manifest                          │  │
│  │  • generate_minikit_components                       │  │
│  │  • validate_configuration                            │  │
│  │  • create_frame                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Resource Layer (Information)                │  │
│  │  • project_templates                                  │  │
│  │  • contract_templates                                │  │
│  │  • minikit_examples                                  │  │
│  │  • deployment_guides                                 │  │
│  │  • configuration_schemas                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Core Engine Layer                        │  │
│  │  ┌───────────┐  ┌───────────┐  ┌──────────────────┐ │  │
│  │  │ Template  │  │  Config   │  │   Deployment     │ │  │
│  │  │  Engine   │  │  Manager  │  │     Engine       │ │  │
│  │  └───────────┘  └───────────┘  └──────────────────┘ │  │
│  │  ┌───────────┐  ┌───────────┐  ┌──────────────────┐ │  │
│  │  │   File    │  │  Network  │  │    Validator     │ │  │
│  │  │  Manager  │  │  Manager  │  │     Engine       │ │  │
│  │  └───────────┘  └───────────┘  └──────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                External Integrations                         │
│  • Scaffold-ETH 2 (via npm)                                 │
│  • Base Minikit (via npm)                                   │
│  • Hardhat/Foundry (contracts)                              │
│  • Base RPC (deployment)                                    │
│  • Farcaster (manifest validation)                          │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### Tool Layer (Actions)

The Tool Layer provides 8 primary MCP tools that users can invoke through natural language:

1. **scaffold_project** - Initialize new Scaffold-ETH 2 projects with optional Minikit
2. **add_minikit_support** - Add Base Minikit to existing Scaffold-ETH 2 projects
3. **configure_contracts** - Configure and customize smart contracts
4. **deploy_contracts** - Deploy contracts to Base networks
5. **setup_farcaster_manifest** - Generate Farcaster Mini App manifest
6. **generate_minikit_components** - Create OnchainKit components
7. **validate_configuration** - Validate project setup and readiness
8. **create_frame** - Generate Farcaster Frames for viral distribution

### Resource Layer (Information)

The Resource Layer provides read-only information through MCP resources:

1. **project_templates** - Available Scaffold-ETH 2 + Minikit templates
2. **contract_templates** - Pre-built smart contract templates
3. **minikit_examples** - OnchainKit integration code examples
4. **deployment_guides** - Network-specific deployment guides
5. **configuration_schemas** - JSON schemas for validation

### Core Engine Layer

The Core Engine Layer contains the business logic:

1. **Template Engine** - Manages project templates and scaffolding
2. **Config Manager** - Handles configuration files and environment variables
3. **Deployment Engine** - Orchestrates contract deployment pipeline
4. **File Manager** - Handles file system operations safely
5. **Network Manager** - Manages RPC connections and network interactions
6. **Validator Engine** - Validates configurations and deployment readiness

## Technology Stack

### MCP Server
- **Runtime**: Node.js 22.11.0+
- **Language**: TypeScript
- **MCP SDK**: @modelcontextprotocol/sdk
- **Architecture**: Event-driven with async operations

### Integrations
- **Scaffold-ETH 2**: Via `create-eth` CLI and direct npm packages
- **Base Minikit**: @coinbase/minikit, @coinbase/onchainkit
- **Smart Contracts**: Hardhat, Foundry (optional)
- **Networks**: Base (mainnet), Base Sepolia (testnet)
- **Farcaster**: @farcaster/frame-sdk

## Data Flow

### Project Scaffolding Flow

```
User Request
    ↓
Claude Code (natural language processing)
    ↓
MCP Tool: scaffold_project
    ↓
Template Engine
    ├─ Select template (basic, nft, defi, etc.)
    ├─ Clone Scaffold-ETH 2 structure
    ├─ Apply Minikit integration (if requested)
    └─ Configure base settings
    ↓
File Manager
    ├─ Create directory structure
    ├─ Generate configuration files
    ├─ Setup environment variables
    └─ Initialize git repository
    ↓
Response to User
    ├─ Project path
    ├─ Next steps
    └─ Configuration summary
```

### Deployment Flow

```
User Request
    ↓
MCP Tool: deploy_contracts
    ↓
Validator Engine
    ├─ Check configuration
    ├─ Verify environment variables
    ├─ Validate contract compilation
    └─ Test network connectivity
    ↓
Deployment Engine
    ├─ Compile contracts (Hardhat/Foundry)
    ├─ Deploy to target network
    ├─ Verify on Basescan
    ├─ Generate TypeScript types
    └─ Update frontend imports
    ↓
Response to User
    ├─ Deployed contract addresses
    ├─ Explorer links
    ├─ Verification status
    └─ Next steps
```

## Security Architecture

### Secure Operations

1. **Environment Variable Protection**
   - Never log private keys or sensitive data
   - Validate .env file permissions
   - Use secure storage for credentials

2. **File System Security**
   - Sandboxed file operations within project directory
   - Validate all file paths to prevent traversal attacks
   - Read-only access to template directories

3. **Network Security**
   - Validate RPC endpoints before use
   - Implement timeout and retry logic
   - Handle network errors gracefully

4. **Contract Security**
   - Pre-deployment security checks
   - Validate contract code for common vulnerabilities
   - Enforce best practices (access control, reentrancy protection)

### Validation Gates

```
┌─────────────────────────────────────┐
│     Pre-Deployment Validation       │
├─────────────────────────────────────┤
│  ✓ Configuration valid              │
│  ✓ Environment variables set        │
│  ✓ Contracts compile                │
│  ✓ Tests pass                       │
│  ✓ Network accessible               │
│  ✓ No hardcoded secrets             │
└─────────────────────────────────────┘
           │
           ↓ (if all pass)
┌─────────────────────────────────────┐
│       Contract Deployment           │
└─────────────────────────────────────┘
```

## Scalability Considerations

### Performance Optimization

1. **Template Caching**
   - Cache frequently used templates in memory
   - Lazy load templates on demand
   - Version templates for cache invalidation

2. **Parallel Operations**
   - Deploy multiple contracts in parallel
   - Concurrent file operations where safe
   - Async network requests

3. **Resource Management**
   - Connection pooling for RPC endpoints
   - Rate limiting for external API calls
   - Timeout management for long operations

### Extensibility

1. **Plugin Architecture**
   - Support for custom templates
   - Extensible contract types
   - Custom deployment strategies

2. **Template System**
   - Community-contributed templates
   - Version management
   - Template marketplace potential

## Error Handling Strategy

### Error Categories

1. **User Errors** (recoverable)
   - Invalid configuration
   - Missing environment variables
   - Network selection issues
   → Provide clear guidance for fix

2. **System Errors** (potentially recoverable)
   - Network timeouts
   - RPC connection failures
   - Compilation errors
   → Implement retry logic, suggest alternatives

3. **Fatal Errors** (non-recoverable)
   - Disk space exhausted
   - Permission denied
   - Critical dependency missing
   → Clean up partial state, report clearly

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    recovery?: {
      automatic: boolean;
      steps?: string[];
    };
  };
}
```

## Integration with SuperClaude Framework

### MCP Server Coordination

This MCP server works seamlessly with other MCP servers in the ecosystem:

- **Sequential Thinking**: Complex architecture decisions and debugging
- **Context7**: Official documentation lookup for libraries
- **Magic**: UI component generation for frontend
- **Serena**: Project memory and session persistence
- **Playwright**: E2E testing of deployed Mini Apps

### Example Coordination Flow

```
User: "Create and deploy an NFT marketplace with accessibility testing"

Claude Code orchestrates:
1. scaffold-minikit: Scaffold project
2. magic: Generate accessible UI components
3. scaffold-minikit: Deploy contracts
4. playwright: Run accessibility tests
5. serena: Save project state
```

## Monitoring and Observability

### Metrics to Track

- Project scaffold success rate
- Average deployment time
- Contract verification success rate
- Most popular templates
- Error frequency by type

### Logging Strategy

- Structured JSON logs
- Log levels: DEBUG, INFO, WARN, ERROR
- Context-rich error messages
- Performance timing for operations

## Future Enhancements

### Phase 2 Features
- Multi-chain deployment support (Optimism, Arbitrum)
- Advanced contract templates (governance, staking)
- Automated testing generation
- CI/CD pipeline integration

### Phase 3 Features
- Visual project builder (GUI)
- Template marketplace
- Team collaboration features
- Analytics dashboard

## Conclusion

This architecture provides a solid foundation for an MCP server that dramatically simplifies Web3 development on Base with Farcaster integration. The modular design allows for incremental development and easy extension while maintaining security and performance standards.
