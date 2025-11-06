# Scaffold-Minikit MCP Server Documentation

Complete documentation for the scaffold-minikit MCP server - enabling rapid Web3 development on Base with Farcaster integration.

## 📚 Documentation Index

### Core Documentation

1. **[Architecture Overview](./architecture.md)**
   - System architecture and design
   - Component breakdown
   - Technology stack
   - Integration patterns
   - Security architecture

2. **[Tool Schemas](./tool-schemas.md)**
   - Complete MCP tool specifications
   - Parameter schemas and validation
   - Response formats
   - Error codes and handling
   - Best practices for tool usage

3. **[Resources & Templates](./resources-templates.md)**
   - Project templates catalog
   - Contract templates (ERC-20, ERC-721, ERC-1155)
   - Minikit integration examples
   - Deployment guides
   - Configuration schemas

4. **[Deployment Pipeline](./deployment-pipeline.md)**
   - 6-stage deployment process
   - Pre-deployment validation
   - Contract deployment & verification
   - Frontend configuration
   - Minikit setup
   - Post-deployment checks

5. **[Usage Guide](./guides/usage-guide.md)**
   - Quick start guide
   - Complete workflows
   - Natural language patterns
   - Troubleshooting guide
   - Best practices
   - Integration examples

6. **[Implementation Roadmap](./guides/implementation-roadmap.md)**
   - 10-12 week development plan
   - Phase-by-phase breakdown
   - Resource requirements
   - Success metrics
   - Risk management
   - Post-launch roadmap

### Development & Project Management

7. **[Contributing Guide](./development/CONTRIBUTING.md)**
   - Code standards and conventions
   - Development workflow
   - Pull request process
   - Testing requirements

8. **[Development Setup](./development/DEV_SETUP.md)**
   - Local environment setup
   - Running the MCP server
   - Available scripts
   - Troubleshooting

9. **[Workflow & Issues](./project-management/WORKFLOW.md)**
   - Complete 44-issue breakdown
   - Epic structure (6 epics)
   - Task details and acceptance criteria
   - Story point estimates

10. **[Dependencies Map](./project-management/DEPENDENCIES.md)**
    - Visual dependency graphs
    - Critical path analysis
    - Parallel work opportunities
    - Risk mitigation

11. **[Project Board Setup](./project-management/PROJECT_BOARD.md)**
    - GitHub Projects configuration
    - Automation rules
    - Team workflows
    - Progress tracking

12. **[Session Summary](./project-management/SESSION_SUMMARY.md)**
    - Implementation progress
    - Completed work
    - Next steps

## 🚀 Quick Start

### What is scaffold-minikit?

An MCP server that enables developers to rapidly scaffold, configure, and deploy decentralized applications using Scaffold-ETH 2, with optional Base Minikit integration for Farcaster Mini Apps.

### Key Features

- **🎯 Natural Language Interface**: Create dApps through conversation with Claude Code
- **⚡ Rapid Development**: Go from idea to deployed dApp in hours
- **🔧 8 Core Tools**: Scaffold, configure, deploy, and manage Web3 projects
- **📦 6 Templates**: Basic, NFT, DeFi, DAO, Gaming, Social
- **🌊 Minikit Integration**: Built-in Farcaster Mini App support
- **🚀 Base Network**: Optimized for Base mainnet and testnet

### Target Users

- Hackathon participants
- Web3 developers
- Teams prototyping blockchain applications
- Developers building on Base + Farcaster

## 🛠️ Available Tools

| Tool | Description |
|------|-------------|
| **scaffold_project** | Initialize new Scaffold-ETH 2 projects with optional Minikit |
| **add_minikit_support** | Add Base Minikit to existing Scaffold-ETH 2 projects |
| **configure_contracts** | Configure and customize smart contracts |
| **deploy_contracts** | Deploy contracts to Base networks |
| **setup_farcaster_manifest** | Generate Farcaster Mini App manifest |
| **generate_minikit_components** | Create OnchainKit components |
| **validate_configuration** | Validate project setup and readiness |
| **create_frame** | Generate Farcaster Frames for viral distribution |

## 📖 Documentation Structure

```
docs/
├── README.md                          # This file - Documentation index
│
├── Core Technical Documentation
│   ├── architecture.md                # System architecture and design
│   ├── tool-schemas.md                # MCP tool specifications
│   ├── resources-templates.md         # Templates and contract examples
│   └── deployment-pipeline.md         # 6-stage deployment process
│
├── guides/                            # User and implementation guides
│   ├── usage-guide.md                 # Complete user guide
│   └── implementation-roadmap.md      # Development roadmap
│
├── development/                       # Development documentation
│   ├── CONTRIBUTING.md                # Contribution guidelines
│   └── DEV_SETUP.md                   # Local development setup
│
└── project-management/                # Project management docs
    ├── WORKFLOW.md                    # 44 implementation issues
    ├── DEPENDENCIES.md                # Dependency analysis
    ├── PROJECT_BOARD.md               # GitHub Projects setup
    └── SESSION_SUMMARY.md             # Progress tracking
```

## 🎯 Use Cases

### Hackathon Development
Create and deploy a complete dApp in hours:
1. Scaffold project with template
2. Customize contracts and UI
3. Deploy to Base Sepolia
4. Add Minikit for viral distribution

### Production dApps
Build production-ready applications:
1. Start with robust template
2. Extensive testing and validation
3. Security checks
4. Deploy to Base mainnet
5. Register as Farcaster Mini App

### Learning & Prototyping
Experiment with Web3 development:
1. Quick project setup
2. Explore different templates
3. Test contract interactions
4. Learn Minikit integration

## 🏗️ Architecture Highlights

### Three-Layer Design

```
┌─────────────────────────────────┐
│    Tool Layer (Actions)         │  8 MCP tools
├─────────────────────────────────┤
│    Resource Layer (Information) │  5 resource endpoints
├─────────────────────────────────┤
│    Core Engine Layer            │  6 core engines
└─────────────────────────────────┘
```

### Core Engines

1. **Template Engine** - Project scaffolding and file generation
2. **Config Manager** - Configuration file management
3. **Deployment Engine** - Contract deployment orchestration
4. **File Manager** - Safe file system operations
5. **Network Manager** - RPC connections and network interactions
6. **Validator Engine** - Configuration and deployment validation

## 📋 Project Templates

### Available Templates

| Template | Description | Complexity | Minikit |
|----------|-------------|------------|---------|
| **basic** | Simple starter with wallet connection | Beginner | ✅ |
| **nft** | ERC-721 NFT minting platform | Intermediate | ✅ |
| **defi** | Token swap and liquidity protocol | Advanced | ✅ |
| **dao** | DAO with voting and treasury | Advanced | ✅ |
| **gaming** | On-chain gaming with NFT items | Intermediate | ✅ |
| **social** | Farcaster-integrated social app | Intermediate | ✅ Required |

## 🚀 Deployment Pipeline

### 6-Stage Process

```
1. Pre-Deployment Validation
   ├─ Configuration checks
   ├─ Environment validation
   └─ Network connectivity

2. Contract Deployment
   ├─ Compilation
   ├─ Deployment
   └─ Verification

3. Frontend Configuration
   ├─ Contract address updates
   ├─ Provider configuration
   └─ Build optimization

4. Minikit Setup (if enabled)
   ├─ Domain signature
   ├─ Manifest generation
   └─ Frame configuration

5. Deployment
   ├─ Frontend deployment
   ├─ Domain configuration
   └─ Mini App registration

6. Post-Deployment
   ├─ Health checks
   ├─ Deployment report
   └─ Usage documentation
```

## 🔐 Security Considerations

- **Environment Variables**: Secure private key management
- **File System**: Sandboxed operations within project directory
- **Network Operations**: Validated RPC endpoints with timeouts
- **Contract Security**: Pre-deployment security checks
- **Validation Gates**: Multi-stage validation before deployment

## 🎓 Learning Path

### Beginner
1. Read [Usage Guide](./guides/usage-guide.md)
2. Try basic template
3. Deploy to testnet
4. Explore Minikit features

### Intermediate
1. Study [Architecture](./architecture.md)
2. Customize contract templates
3. Build custom components
4. Create Farcaster Frames

### Advanced
1. Review [Tool Schemas](./tool-schemas.md)
2. Understand [Deployment Pipeline](./deployment-pipeline.md)
3. Contribute custom templates
4. Extend with plugins

## 🤝 Integration with Ecosystem

### Compatible MCP Servers

- **sequential-thinking**: Complex analysis and debugging
- **context7**: Official documentation lookup
- **magic**: UI component generation
- **serena**: Project memory and session persistence
- **playwright**: E2E testing of deployed Mini Apps

### Example Integration Flow

```
User: "Create and test an NFT marketplace"

Claude orchestrates:
1. scaffold-minikit: Scaffold project
2. magic: Generate UI components
3. scaffold-minikit: Deploy contracts
4. playwright: Run E2E tests
5. serena: Save project state
```

## 📊 Success Metrics

### Development
- Project scaffold < 30 seconds
- Contract deployment < 2 minutes
- Test coverage > 80%
- Documentation coverage 100%

### User Adoption
- 1000+ projects created (3 months)
- 80% task success rate
- Average rating > 4.5/5
- 70% return users

## 🗺️ Implementation Timeline

**Phase 1 (Weeks 1-2)**: Core Infrastructure
**Phase 2 (Weeks 3-4)**: Scaffold & Configuration
**Phase 3 (Weeks 5-6)**: Minikit Integration
**Phase 4 (Weeks 7-8)**: Deployment Pipeline
**Phase 5 (Weeks 9-10)**: Polish & Testing
**Phase 6 (Weeks 11-12)**: Launch

**Total**: 10-12 weeks with 2-3 developers

## 📝 Contributing

### Template Contributions
Community templates welcome! Follow these guidelines:
1. Follow standard template structure
2. Include comprehensive README
3. Provide test suite
4. Pass security checklist
5. Ensure Minikit compatibility

### Code Contributions
1. Review [Architecture](./architecture.md)
2. Follow TypeScript best practices
3. Include tests (>80% coverage)
4. Update documentation
5. Submit PR with clear description

## 🔮 Future Enhancements

### Version 1.1 (Months 2-3)
- Multi-chain support (Optimism, Arbitrum)
- Advanced contract templates
- Gas optimization tools
- Testing framework integration

### Version 1.2 (Months 4-6)
- Visual project builder
- Template marketplace
- Team collaboration
- Advanced analytics

### Version 2.0 (Months 7-12)
- Multi-framework support
- Enterprise features
- White-label solutions
- Advanced tooling

## 📞 Support

### Documentation
- [Usage Guide](./guides/usage-guide.md) - Comprehensive user guide
- [Tool Schemas](./tool-schemas.md) - Complete API reference
- [Troubleshooting](./guides/usage-guide.md#troubleshooting-guide) - Common issues
- [Contributing](./development/CONTRIBUTING.md) - How to contribute

### Community
- GitHub Issues - Bug reports and feature requests
- Discord - Community discussion
- Twitter - Updates and announcements

## 📄 License

[Add license information]

## 🙏 Acknowledgments

Built with:
- [Scaffold-ETH 2](https://scaffoldeth.io/)
- [Base Minikit](https://docs.base.org/mini-apps/)
- [OnchainKit](https://onchainkit.xyz/)
- [Farcaster](https://www.farcaster.xyz/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

**Ready to build?** Start with the [Usage Guide](./guides/usage-guide.md) for users or [Contributing Guide](./development/CONTRIBUTING.md) for contributors! 🚀
