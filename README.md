# SE2-Minikit MCP Server

> MCP server enabling rapid Web3 development on Base with Farcaster integration

**Status**: ✅ Basic Scaffolding Functional
**Version**: 0.1.0 (Alpha)
**Last Updated**: 2025-11-07

## 🚀 Quick Start

### Prerequisites

- **[Bun](https://bun.sh/)** v1.2.16+ (for running the MCP server)
- **[Claude Desktop](https://claude.ai/download)** (for using the MCP server)
- **[Git](https://git-scm.com/)** (optional, for version control)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/se2-minikit-mcp-server.git
   cd se2-minikit-mcp-server
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Build the server**:
   ```bash
   bun run build
   ```

4. **Configure Claude Desktop**:

   Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):
   ```json
   {
     "mcpServers": {
       "scaffold-minikit": {
         "command": "bun",
         "args": ["run", "/absolute/path/to/se2-minikit-mcp-server/src/server/index.ts"]
       }
     }
   }
   ```

5. **Restart Claude Desktop** and verify the server appears in the MCP servers list.

### Usage

Ask Claude to scaffold a project:

```
Create a Scaffold-ETH 2 project called "my-dapp" on Base Sepolia testnet
```

Claude will use the `scaffold_project` tool to generate a complete project with:
- Smart contracts (Hardhat)
- Next.js frontend
- Deployment scripts
- Testing infrastructure
- All dependencies installed

### Generated Project Setup

After Claude generates your project:

```bash
cd my-dapp

# Start local blockchain
yarn chain

# Deploy contracts (in new terminal)
yarn deploy

# Start frontend (in new terminal)
cd nextjs
yarn install
yarn dev
```

Your dApp will be running at `http://localhost:3000`!

## 📖 Documentation

### For Users
- **[Usage Guide](./docs/guides/usage-guide.md)** - How to use the MCP server
- **[Current Status](./CURRENT_STATUS.md)** - What works now

### For Developers
- **[Contributing Guide](./docs/development/CONTRIBUTING.md)** - How to contribute
- **[Claude Code Guide](./CLAUDE.md)** - For Claude Code instances
- **[Architecture](./docs/architecture.md)** - System design

### Project Management
- **[Implementation Workflow](./docs/project-management/WORKFLOW.md)** - All 44 issues
- **[Dependencies Map](./docs/project-management/DEPENDENCIES.md)** - Dependency analysis

## 📚 Project Overview

An MCP server that enables developers to rapidly scaffold, configure, and deploy decentralized applications using Scaffold-ETH 2, with optional Base Minikit integration for Farcaster Mini Apps.

### Key Features

- 🎯 **8 MCP Tools**: Scaffold, configure, deploy, validate Web3 projects
- ⚡ **6 Templates**: Basic, NFT, DeFi, DAO, Gaming, Social
- 🌊 **Minikit Integration**: Built-in Farcaster Mini App support
- 🚀 **Base Network**: Optimized for Base mainnet and testnet
- 💬 **Natural Language**: Create dApps through conversation with Claude Code

### Target Users

- Hackathon participants needing rapid dApp setup
- Web3 developers building on Base + Farcaster
- Teams prototyping blockchain applications

## 🏗️ Implementation Status

**Progress**: 35/180 story points (19.4% complete)

### ✅ What Works Now

**Core Infrastructure** (Epic 1: 62.2% complete):
- ✅ MCP server with tool/resource registries
- ✅ Template engine with variable substitution
- ✅ File manager with backup and security
- ✅ Configuration validation (Zod schemas)
- ✅ Structured logging (Pino)
- ✅ 337 tests passing

**Project Scaffolding**:
- ✅ `scaffold_project` tool - **FULLY FUNCTIONAL**
- ✅ Basic Scaffold-ETH 2 template
- ✅ Network support (base, baseSepolia, localhost)
- ✅ Post-generation hooks (yarn install, git init)
- ✅ Input validation and error handling

### 🚧 In Progress / Planned

**Templates** (5 remaining):
- ⏳ NFT template (ERC-721 minting)
- ⏳ DeFi template (token swaps)
- ⏳ DAO template (governance)
- ⏳ Gaming template (on-chain gaming)
- ⏳ Social template (Farcaster integration)

**Epic 2**: Scaffold & Configuration (35% complete):
- ✅ scaffold_project tool
- ⏳ configure_contracts tool
- ⏳ Contract validation

**Epic 3**: Minikit Integration (0% complete):
- Farcaster Mini Apps support
- Base Minikit components
- Frame generation

**Epic 4**: Deployment Pipeline (0% complete):
- Network configuration
- Contract deployment automation
- Verification and validation

**See [CURRENT_STATUS.md](./CURRENT_STATUS.md) for detailed progress.**

## 🛠️ Available Tools

| Tool | Description | Status |
|------|-------------|--------|
| `scaffold_project` | Initialize Scaffold-ETH 2 projects | ✅ **Functional** |
| `add_minikit_support` | Add Base Minikit to existing projects | ⏳ Planned |
| `configure_contracts` | Configure smart contracts | ⏳ Planned |
| `deploy_contracts` | Deploy to Base networks | ⏳ Planned |
| `setup_farcaster_manifest` | Generate Farcaster manifests | ⏳ Planned |
| `generate_minikit_components` | Create OnchainKit components | ⏳ Planned |
| `validate_configuration` | Pre-deployment validation | ⏳ Planned |
| `create_frame` | Generate Farcaster Frames | ⏳ Planned |

### scaffold_project Tool

**Status**: ✅ Fully functional

**Parameters**:
- `projectName` (required): kebab-case project name (e.g., "my-dapp")
- `projectPath` (optional): Where to create project (default: current directory)
- `template` (optional): "basic" | "nft" | "defi" | "dao" | "gaming" | "social" (default: "basic")
- `targetNetwork` (optional): "base" | "baseSepolia" | "localhost" (default: "baseSepolia")
- `contractFramework` (optional): "hardhat" | "foundry" (default: "hardhat")
- `includesMinikit` (optional): Add Minikit support (default: false)

**Example Usage**:
```
Ask Claude: "Create a Scaffold-ETH 2 project called 'my-nft-marketplace'"
```

Claude will invoke the tool with appropriate parameters and generate a complete project.

## 📦 Project Templates

| Template | Description | Complexity | Status |
|----------|-------------|------------|--------|
| **basic** | Simple starter with wallet connection | Beginner | ✅ **Available** |
| **nft** | ERC-721 NFT minting platform | Intermediate | ⏳ Planned |
| **defi** | Token swap and liquidity protocol | Advanced | ⏳ Planned |
| **dao** | DAO with voting and treasury | Advanced | ⏳ Planned |
| **gaming** | On-chain gaming with NFT items | Intermediate | ⏳ Planned |
| **social** | Farcaster-integrated social app | Intermediate | ⏳ Planned |

### Basic Template (Available Now)

The basic template includes:
- **Smart Contract**: Simple `YourContract.sol` with Hardhat
- **Frontend**: Next.js app with wallet connection (RainbowKit)
- **Deployment**: Ready-to-deploy scripts
- **Testing**: Hardhat test infrastructure
- **Configuration**: Environment setup and network configs

## 🚀 Tech Stack

**MCP Server**:
- **Bun** v1.2.16+ (runtime)
- **TypeScript** 5.9.3 (strict mode)
- **MCP SDK** v1.21.0
- **Pino** (structured logging)
- **Zod** (schema validation)

**Generated Projects**:
- **Scaffold-ETH 2** (base framework)
- **Yarn** (package manager, official SE2 standard)
- **Hardhat** (smart contracts)
- **Next.js** 14+ (frontend)
- **RainbowKit** (wallet connection)
- **Wagmi** (Web3 hooks)
- **Base Network** (mainnet + Sepolia)

**Testing**:
- **Bun Test** (unit/integration, 337 tests)
- **Playwright** (E2E, planned)

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./docs/development/CONTRIBUTING.md) for detailed guidelines.

### Development Setup

```bash
# Clone and setup
git clone https://github.com/yourusername/se2-minikit-mcp-server.git
cd se2-minikit-mcp-server
bun install

# Run tests
bun test

# Run tests in watch mode
bun test --watch

# Type check
bun run typecheck

# Lint
bun run lint

# Build
bun run build
```

### Good First Issues

Looking to contribute? Check out:
- **Issue #6**: NFT Template (5 points) - Create ERC-721 template
- **Issue #7**: DeFi Template (5 points) - Create token swap template
- **Issue #8**: Advanced Templates (5 points) - DAO/Gaming/Social templates

Each template follows the same structure as the basic template, making them great for new contributors!

### Project Structure

```
se2-minikit-mcp-server/
├── src/
│   ├── server/           # MCP server implementation
│   ├── tools/            # MCP tool handlers
│   ├── resources/        # Resource handlers
│   ├── engines/          # Template/deployment engines
│   ├── config/           # Configuration system
│   ├── types/            # TypeScript types
│   └── utils/            # Utilities
├── templates/            # Project templates
│   └── basic/           # Basic SE2 template
├── tests/
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── docs/                # Documentation
└── claudedocs/          # Claude-specific docs
```

## 📈 Development Progress

### Completed (35/180 points)

✅ **Issues #1-5, #9-11**: Core infrastructure and basic scaffolding
- MCP server skeleton with registries
- Template engine with variable substitution
- File manager with security
- Configuration validation
- Logging infrastructure
- Basic Scaffold-ETH 2 template
- **scaffold_project tool (fully functional)**

### Next Steps

**Short-term** (2-3 weeks):
- Issue #6-8: Additional templates (NFT, DeFi, DAO, Gaming, Social)
- Issue #12: configure_contracts tool
- Issue #13: Contract validation

**Medium-term** (4-8 weeks):
- Epic 3: Minikit integration
- Epic 4: Deployment pipeline

See [WORKFLOW.md](./docs/project-management/WORKFLOW.md) for complete roadmap.

## 📊 Success Metrics

### Current Performance
- ✅ Project scaffold: < 10 seconds
- ✅ Test coverage: 100% (337/337 tests passing)
- ✅ Build time: < 1 second
- ✅ TypeScript: Strict mode, zero errors

### Goals
- 1000+ projects created (3 months post-launch)
- 80% task success rate
- Average rating > 4.5/5

## 🔗 Resources

- **Scaffold-ETH 2**: https://docs.scaffoldeth.io/llms-full.txt
- **Base Minikit**: https://docs.base.org/mini-apps/llms-full.txt
- **Farcaster Mini Apps**: https://miniapps.farcaster.xyz/llms-full.txt
- **OnchainKit**: https://onchainkit.xyz/
- **MCP Protocol**: https://modelcontextprotocol.io/

## 🗺️ Roadmap

### v0.1.0 - Alpha (Current)
- ✅ Core MCP server infrastructure
- ✅ Template engine with variable substitution
- ✅ Basic Scaffold-ETH 2 template
- ✅ scaffold_project tool (fully functional)
- ✅ 337 tests passing
- ✅ TypeScript strict mode

### v0.2.0 - Beta (2-3 weeks)
- [ ] NFT template (ERC-721 minting)
- [ ] DeFi template (token swaps)
- [ ] DAO/Gaming/Social templates
- [ ] configure_contracts tool
- [ ] Contract validation

### v1.0.0 - Initial Release (8-12 weeks)
- [ ] All 8 MCP tools implemented
- [ ] 6 project templates complete
- [ ] Minikit integration (Farcaster Mini Apps)
- [ ] Deployment pipeline
- [ ] Security audit

### v1.1.0+ - Future
- Multi-chain support (Optimism, Arbitrum)
- Advanced contract templates
- Gas optimization tools
- Visual project builder

## 📄 License

[To be determined]

## 🙏 Acknowledgments

Built with:
- [Scaffold-ETH 2](https://scaffoldeth.io/)
- [Base Minikit](https://docs.base.org/mini-apps/)
- [OnchainKit](https://onchainkit.xyz/)
- [Farcaster](https://www.farcaster.xyz/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/yourusername/se2-minikit-mcp-server/issues)
- **Documentation**: [Complete Docs](./docs/README.md)
- **Status**: [Current Implementation Status](./CURRENT_STATUS.md)
- **Contributing**: [Contribution Guide](./docs/development/CONTRIBUTING.md)

## ⚠️ Important Notes

### Package Manager Separation

**MCP Server** uses **Bun** for development (faster, native TypeScript)

**Generated Projects** use **Yarn** (official Scaffold-ETH 2 standard)

This separation ensures:
- ✅ Fast MCP server development
- ✅ Generated projects follow official SE2 conventions
- ✅ Users can reference SE2 docs without confusion

### Current Limitations

- Only "basic" template available (5 more templates planned)
- Only Hardhat support (Foundry planned)
- No Minikit integration yet (planned for v0.2.0)
- No automated deployment yet (planned for v1.0.0)

---

**Ready to build?**

1. Follow [Quick Start](#-quick-start) to install the MCP server
2. Ask Claude to scaffold a project
3. Start building your dApp on Base!

For development, see [CONTRIBUTING.md](./docs/development/CONTRIBUTING.md) 🚀
