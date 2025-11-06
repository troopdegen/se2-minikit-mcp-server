# SE2-Minikit MCP Server - Claude Code Guide

**Project**: MCP server enabling rapid Web3 development on Base with Farcaster integration
**Runtime**: Bun v1.2.16
**Language**: TypeScript 5.9.3
**Status**: Issue #1 complete (3/44 story points, 6.8%)

## Quick Start Commands

```bash
bun run dev          # Start development server
bun run build        # Build for production (dist/)
bun test             # Run tests
bun test --watch     # Watch mode
bun run lint         # Check code style
bun run lint:fix     # Auto-fix linting issues
bun run format       # Format code with Prettier
bun run typecheck    # TypeScript validation
```

## Current Implementation State

**✅ Issue #1 Complete**: Project Initialization & Setup
- Bun runtime configured with MCP SDK v1.21.0
- TypeScript with strict mode, ESLint, Prettier
- Basic MCP server skeleton with stdio transport
- Single `health_check` tool (minimal viable implementation)
- CI/CD pipeline (GitHub Actions)
- Testing infrastructure (Bun test runner)

**⏳ Next Up**: Issue #2 - MCP Server Skeleton
- Tool registration system
- Resource registry infrastructure
- Error handling framework
- Structured logging (pino/winston)
- Configuration loader

**🚧 Not Yet Implemented**:
- Real Web3 functionality (Scaffold-ETH 2 scaffolding)
- Minikit/Farcaster integration
- Contract deployment tools
- Template system
- All 8 planned MCP tools (scaffold, configure, deploy, etc.)

## Architecture Overview

### 3-Layer Design
```
┌─────────────────────────────────────┐
│ TOOL LAYER (8 MCP Tools)            │
│ - scaffold_project                  │
│ - add_minikit_support               │
│ - configure_contracts               │
│ - deploy_contracts                  │
│ - setup_farcaster_manifest          │
│ - generate_minikit_components       │
│ - validate_configuration            │
│ - create_frame                      │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ RESOURCE LAYER (5 Endpoints)        │
│ - templates://* (project templates) │
│ - examples://* (code examples)      │
│ - guides://* (integration guides)   │
│ - contracts://* (smart contracts)   │
│ - config://* (configuration)        │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ CORE ENGINE LAYER (6 Engines)       │
│ - Template Engine                   │
│ - Configuration Engine              │
│ - Deployment Engine                 │
│ - File Manager                      │
│ - Network Engine                    │
│ - Validation Engine                 │
└─────────────────────────────────────┘
```

### Current Files
```
se2-minikit-mcp-server/
├── src/
│   ├── server/index.ts      # Basic MCP server (1 tool: health_check)
│   ├── tools/                # (empty, ready for Issue #2)
│   ├── resources/            # (empty, ready for Issue #2)
│   ├── engines/              # (empty, for future issues)
│   ├── utils/                # (empty, for future issues)
│   ├── config/               # (empty, for future issues)
│   └── types/                # (empty, for future issues)
├── tests/
│   ├── unit/server.test.ts  # Basic tests (3 passing)
│   ├── integration/          # (empty, for future)
│   └── e2e/                  # (empty, for future)
├── templates/                # (empty, for Issue #5+)
├── docs/                     # Design documentation (~70K words)
│   ├── README.md
│   ├── architecture.md
│   ├── tool-schemas.md
│   ├── resources-templates.md
│   ├── deployment-pipeline.md
│   ├── usage-guide.md
│   └── implementation-roadmap.md
├── WORKFLOW.md              # 44 implementation issues
├── DEPENDENCIES.md          # Critical path analysis
├── CONTRIBUTING.md          # Contribution guidelines
├── PROJECT_BOARD.md         # GitHub Projects setup
└── SESSION_SUMMARY.md       # Progress tracking
```

## Epic-Based Workflow

**6 Epics, 44 Issues, ~180 Story Points**

| Epic | Issues | Duration | Status |
|------|--------|----------|--------|
| **Epic 1**: Core Infrastructure | 10 | 2 weeks | ✅ Issue #1 complete |
| **Epic 2**: Scaffold & Configuration | 8 | 2 weeks | ⏳ Blocked by #2, #3 |
| **Epic 3**: Minikit Integration | 6 | 2 weeks | ⏳ Blocked by Epic 2 |
| **Epic 4**: Deployment Pipeline | 10 | 2 weeks | ⏳ Blocked by Epic 2 |
| **Epic 5**: Polish & Testing | 6 | 2 weeks | ⏳ Blocked by Epic 4 |
| **Epic 6**: Launch | 4 | 2 weeks | ⏳ Final phase |

**Critical Path**: #1 → #2 → #3 → #5 → #11 → #19 → #22 → #23 (~6-7 weeks sequential)

**Parallel Opportunities**: Up to 4 developers can work simultaneously (see DEPENDENCIES.md)

## Key Implementation Concepts

### MCP Protocol
- **Model Context Protocol**: Standard for Claude Code integration
- **StdioServerTransport**: Communication layer using stdin/stdout
- **Tools**: Actions Claude can invoke (currently: `health_check`)
- **Resources**: Data/templates Claude can access (not yet implemented)
- **Schema**: JSON Schema definitions for tool inputs/outputs

### Bun Runtime
- **Why Bun**: Faster than Node.js, native TypeScript support, built-in test runner
- **Compatibility**: Bun v1.2.16+ required
- **Build**: Native bundler (`bun build`), no webpack/vite needed
- **Test**: Built-in test runner (`bun test`), no jest/vitest needed

### Project Goals
1. **Scaffold Projects**: Initialize Scaffold-ETH 2 projects with 6 templates
2. **Minikit Integration**: Add Base Minikit and Farcaster support
3. **Contract Tools**: Configure and deploy smart contracts (ERC-20/721/1155)
4. **Deployment Pipeline**: 6-stage deployment with validation and rollback
5. **Developer Experience**: 10x faster setup (hours → minutes), natural language interface

## Important Patterns

### Code Style
- **Naming**: camelCase for functions/variables, PascalCase for classes/types
- **Imports**: Use `.js` extensions even for `.ts` files (ESM requirement)
- **Exports**: Named exports preferred over default exports
- **Error Handling**: Always use try-catch for async operations
- **Logging**: Use console.error for server logs (stdout reserved for MCP protocol)

### Testing Standards
- **Coverage**: >80% target
- **Structure**: unit/, integration/, e2e/ directories
- **Framework**: Bun test runner with native TypeScript support
- **Naming**: `*.test.ts` files, describe/it structure

### Git Workflow
- **Branches**: Feature branches for all work, never work on main/master
- **Commits**: Descriptive messages, frequent commits
- **Commit Messages**:
  - Max 50 characters
  - Concise and descriptive
  - No attributions/co-signatures
  - Lowercase except for proper nouns/required capitalized letters
  - Examples: `add health check tool`, `implement MCP server skeleton`, `fix TypeScript build errors`
- **PRs**: One feature per PR, all tests must pass

## Useful References

### Documentation
- **docs/project-management/WORKFLOW.md**: Complete list of 44 issues with tasks, acceptance criteria, dependencies
- **docs/project-management/DEPENDENCIES.md**: Critical path, parallel work opportunities, visual dependency graphs
- **docs/development/CONTRIBUTING.md**: Code standards, PR workflow, testing requirements
- **docs/architecture.md**: Complete system design with diagrams
- **docs/tool-schemas.md**: Specifications for all 8 planned MCP tools

### External Resources
- **Scaffold-ETH 2**: https://docs.scaffoldeth.io/llms-full.txt
- **Base Minikit**: https://docs.base.org/mini-apps/llms-full.txt
- **Farcaster Mini Apps**: https://miniapps.farcaster.xyz/llms-full.txt
- **OnchainKit**: https://onchainkit.xyz/
- **MCP Protocol**: https://modelcontextprotocol.io/

## Common Tasks

### Adding a New MCP Tool
1. Create tool handler in `src/tools/[tool-name].ts`
2. Define TypeScript types in `src/types/tools.ts`
3. Register in tool registry (`src/tools/registry.ts` - Issue #2)
4. Add to ListToolsRequestSchema handler
5. Add to CallToolRequestSchema handler
6. Write unit tests in `tests/unit/tools/[tool-name].test.ts`
7. Update documentation

### Adding a Template
1. Create template directory in `templates/[template-name]/`
2. Add template metadata JSON file
3. Implement template engine integration (Issue #3)
4. Create template tests in `tests/unit/templates/`
5. Document in `docs/resources-templates.md`

### Running the MCP Server
```bash
# Development mode with hot reload
bun run dev

# Production build
bun run build
bun run start

# Test with Claude Code
# Add to Claude Code config:
{
  "mcpServers": {
    "se2-minikit": {
      "command": "bun",
      "args": ["run", "/path/to/se2-minikit-mcp-server/src/server/index.ts"]
    }
  }
}
```

## Troubleshooting

### Tests Failing
```bash
bun test --watch  # Run in watch mode to debug
bun run typecheck  # Check for TypeScript errors
```

### Build Errors
```bash
bun run typecheck  # Validate TypeScript
bun run lint       # Check code style
rm -rf dist && bun run build  # Clean build
```

### MCP Server Not Responding
- Check Claude Code config has correct path to `src/server/index.ts`
- Verify `bun run dev` starts without errors
- Check logs in Claude Code console
- Ensure stdio transport is not blocked by other output

## Next Steps After Issue #1

**Immediate (Issue #2)**: MCP Server Skeleton
- Create tool registry system (`src/tools/registry.ts`)
- Create resource registry system (`src/resources/registry.ts`)
- Add error handling framework
- Add structured logging (pino or winston)
- Create configuration loader (`src/config/loader.ts`)

**Short-term (Issues #3-10)**: Complete Epic 1
- Template engine (#3)
- File manager (#4)
- Basic template (#5)
- Additional templates (#6-8)
- Config schema validation (#9)
- Logging infrastructure (#10)

**See docs/project-management/WORKFLOW.md for complete task breakdown and docs/project-management/DEPENDENCIES.md for parallel work opportunities.**

## Success Metrics

**Development**:
- ✅ Project scaffold: < 30 seconds (target)
- ⏳ Contract deployment: < 2 minutes (not yet implemented)
- ✅ Test coverage: >80% (target, currently basic tests only)

**Adoption** (post-launch):
- 1000+ projects created (3 months)
- 80% task success rate
- Average rating >4.5/5

---

**Last Updated**: Session 3 (2025-11-06) - Issue #1 Complete
**Epic Progress**: 3/180 story points (1.7%)
**Next Session**: Begin Issue #2 (MCP Server Skeleton)
