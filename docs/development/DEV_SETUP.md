# Development Setup

## Prerequisites

- **Bun**: v1.0.0 or higher
- **Git**: For version control
- **Node.js**: v22.11.0+ (for compatibility testing)

## Quick Start

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Run tests
bun test

# Run tests in watch mode
bun test --watch

# Build for production
bun run build

# Run linting
bun run lint

# Format code
bun run format

# Type check
bun run typecheck
```

## Project Structure

```
se2-minikit-mcp-server/
├── src/
│   ├── server/         # MCP server implementation
│   ├── tools/          # MCP tool implementations
│   ├── resources/      # MCP resource handlers
│   ├── engines/        # Core business logic
│   ├── utils/          # Utility functions
│   ├── config/         # Configuration management
│   └── types/          # TypeScript type definitions
├── tests/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── e2e/            # End-to-end tests
├── templates/          # Project templates
├── docs/               # Documentation
└── dist/               # Build output (gitignored)
```

## Development Workflow

### 1. Issue #1: Project Initialization ✅ COMPLETE

All tasks completed:
- ✅ Bun project initialized with TypeScript
- ✅ MCP SDK installed
- ✅ Build system configured (bun build)
- ✅ Bun test framework ready
- ✅ ESLint + Prettier configured
- ✅ .gitignore and .npmignore created
- ✅ GitHub Actions CI/CD pipeline setup

### 2. Next Steps (Issue #2: MCP Server Skeleton)

The basic server skeleton is created in `src/server/index.ts`. Next tasks:
- Implement tool registration system
- Create resource registry infrastructure
- Build error handling framework
- Add structured logging
- Create configuration loader

See [WORKFLOW.md](./WORKFLOW.md) for complete implementation plan.

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Run production build |
| `bun test` | Run all tests |
| `bun test --watch` | Run tests in watch mode |
| `bun run lint` | Check code style |
| `bun run lint:fix` | Fix code style issues |
| `bun run format` | Format code with Prettier |
| `bun run format:check` | Check code formatting |
| `bun run typecheck` | Type check with TypeScript |

## CI/CD Pipeline

GitHub Actions workflow runs on push/PR:

1. **Lint & Typecheck**
   - ESLint validation
   - Prettier format check
   - TypeScript compilation check

2. **Test**
   - Unit tests
   - Integration tests (when added)

3. **Build**
   - Production build
   - Artifact upload

## Testing

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/unit/server.test.ts

# Watch mode
bun test --watch

# Coverage (coming soon)
bun test --coverage
```

## Code Quality

### ESLint Rules

- TypeScript recommended rules
- Unused variables error (with `_` prefix exception)
- `any` type warnings
- Prefer const over let
- No var declarations

### Prettier Configuration

- Single quotes
- 2-space indentation
- 100 character line width
- Trailing commas (ES5)
- Semicolons enabled

## Troubleshooting

### Bun Installation

```bash
# Install Bun (macOS/Linux)
curl -fsSL https://bun.sh/install | bash

# Upgrade Bun
bun upgrade
```

### Type Errors

```bash
# Clear Bun cache
rm -rf node_modules .cache
bun install
```

### Build Issues

```bash
# Clean build
rm -rf dist
bun run build
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

## Resources

- **Bun Documentation**: https://bun.sh/docs
- **MCP SDK**: https://github.com/modelcontextprotocol/sdk
- **WORKFLOW.md**: Implementation roadmap
- **DEPENDENCIES.md**: Dependency analysis
