# Contributing to SE2-Minikit MCP Server

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Workflow](#contribution-workflow)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation Guidelines](#documentation-guidelines)
- [Issue Management](#issue-management)

---

## Code of Conduct

### Our Standards

- **Be Respectful**: Treat all contributors with respect and professionalism
- **Be Collaborative**: Work together to improve the project
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Inclusive**: Welcome contributors of all skill levels and backgrounds

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling or deliberately disruptive behavior
- Publishing private information without permission
- Other conduct inappropriate for a professional setting

### Enforcement

Project maintainers will enforce these standards and may remove, edit, or reject contributions that violate them.

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js**: v22.11.0 or higher
- **npm**: v10.0.0 or higher (or equivalent yarn/pnpm)
- **Git**: For version control
- **GitHub Account**: For submitting contributions
- **TypeScript Knowledge**: Familiarity with TypeScript 5.0+
- **MCP Familiarity**: Understanding of Model Context Protocol (recommended)

### Understanding the Project

1. **Read Core Documentation**:
   - [README](./docs/README.md) - Project overview
   - [Architecture](./docs/architecture.md) - System design
   - [Workflow](./WORKFLOW.md) - Implementation structure

2. **Explore the Codebase**:
   - Review existing code structure
   - Read test files for usage examples
   - Check issue templates for contribution types

3. **Join the Community**:
   - GitHub Discussions for questions
   - Discord (if available) for real-time chat
   - Weekly community calls (schedule TBD)

---

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub first
git clone https://github.com/<your-username>/se2-minikit-mcp-server.git
cd se2-minikit-mcp-server

# Add upstream remote
git remote add upstream https://github.com/original-org/se2-minikit-mcp-server.git
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- MCP SDK
- TypeScript toolchain
- Testing framework (Vitest)
- Linting and formatting tools
- Development utilities

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings (optional for local development)
```

Required for full functionality:
- `BASE_RPC_URL` - Base network RPC endpoint
- `BASE_SEPOLIA_RPC_URL` - Base Sepolia testnet RPC
- `BASESCAN_API_KEY` - For contract verification (optional in dev)

### 4. Verify Setup

```bash
# Build the project
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

All commands should complete successfully.

### 5. Development Mode

```bash
# Watch mode for development
npm run dev

# Run MCP server locally
npm run server

# Run tests in watch mode
npm run test:watch
```

---

## Contribution Workflow

### Finding Work

1. **Browse Issues**: Check the [GitHub Issues](https://github.com/org/repo/issues) page
2. **Filter by Labels**:
   - `good-first-issue` - Beginner-friendly tasks
   - `help-wanted` - Issues needing contributors
   - `p1-high` - High priority work
   - Your preferred domain: `backend`, `frontend`, `contracts`, `docs`

3. **Check Epic Progress**: Review [WORKFLOW.md](./WORKFLOW.md) for context
4. **Verify Dependencies**: Ensure prerequisite issues are completed

### Claiming an Issue

1. **Comment on the Issue**: "I'd like to work on this"
2. **Wait for Assignment**: Maintainer will assign it to you
3. **Ask Questions**: If anything is unclear, ask in the issue thread
4. **Understand Acceptance Criteria**: Review what "done" means for this issue

### Creating Your Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/<issue-number>-<short-description>

# Examples:
# git checkout -b feature/11-scaffold-project-tool
# git checkout -b fix/25-deployment-gas-estimation
# git checkout -b docs/38-api-reference-update
```

Branch naming conventions:
- `feature/<issue>-<description>` - New features
- `fix/<issue>-<description>` - Bug fixes
- `docs/<issue>-<description>` - Documentation
- `refactor/<issue>-<description>` - Code refactoring
- `test/<issue>-<description>` - Test additions

### Development Process

1. **Implement the Feature**:
   - Follow [Code Standards](#code-standards)
   - Write tests as you go
   - Document public APIs with JSDoc

2. **Test Your Changes**:
   ```bash
   npm test                    # Run unit tests
   npm run test:integration    # Run integration tests
   npm run test:e2e            # Run end-to-end tests
   npm run test:coverage       # Check coverage
   ```

3. **Lint and Format**:
   ```bash
   npm run lint                # Check for linting errors
   npm run lint:fix            # Auto-fix linting issues
   npm run format              # Format code with Prettier
   ```

4. **Update Documentation**:
   - Add JSDoc comments for public APIs
   - Update relevant markdown docs
   - Add usage examples if applicable

5. **Commit Your Changes**:
   ```bash
   git add .
   git commit -m "feat(scaffold): implement scaffold_project tool (#11)"
   ```

   Commit message format:
   ```
   <type>(<scope>): <subject> (#<issue-number>)

   <body (optional)>

   <footer (optional)>
   ```

   Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

   Examples:
   - `feat(deploy): add contract verification (#28)`
   - `fix(template): correct variable substitution bug (#15)`
   - `docs(api): add examples for minikit tools (#38)`

---

## Pull Request Process

### Before Opening PR

- [ ] All tests pass locally
- [ ] Code is linted and formatted
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

### Opening the PR

1. **Push Your Branch**:
   ```bash
   git push origin feature/<issue>-<description>
   ```

2. **Create Pull Request** on GitHub:
   - Base: `main`
   - Compare: Your feature branch
   - Use the PR template (auto-populated)

3. **Fill Out PR Template**:
   ```markdown
   ## Description
   Brief description of changes

   ## Related Issue
   Closes #<issue-number>

   ## Type of Change
   - [ ] Bug fix
   - [x] New feature
   - [ ] Documentation update
   - [ ] Refactoring

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated
   - [ ] Manual testing performed

   ## Checklist
   - [x] Code follows style guidelines
   - [x] Documentation updated
   - [x] Tests pass locally
   - [x] No new warnings introduced
   ```

4. **Link to Issue**: Use "Closes #N" in PR description

### PR Review Process

1. **Automated Checks**:
   - CI pipeline runs (tests, linting, build)
   - Test coverage checked
   - Build artifacts validated

2. **Code Review**:
   - Maintainer reviews code within 24-48 hours
   - Feedback provided as comments
   - Changes requested if needed

3. **Addressing Feedback**:
   ```bash
   # Make requested changes
   git add .
   git commit -m "refactor: address PR feedback"
   git push origin feature/<issue>-<description>
   ```

4. **Approval and Merge**:
   - Once approved, maintainer merges PR
   - Branch automatically deleted
   - Issue automatically closed

### PR Review Criteria

Reviewers check for:
- **Functionality**: Does it work as intended?
- **Tests**: Are tests comprehensive and passing?
- **Code Quality**: Is code clean, readable, maintainable?
- **Documentation**: Are changes documented properly?
- **Performance**: Any performance implications?
- **Security**: Any security concerns?
- **Standards**: Follows project conventions?

---

## Code Standards

### TypeScript Guidelines

**Naming Conventions**:
```typescript
// Classes: PascalCase
class TemplateEngine {}

// Interfaces: PascalCase with 'I' prefix (optional)
interface ITemplateConfig {}

// Functions: camelCase
function generateTemplate() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Private members: prefix with '_' (optional)
private _internalState: any;
```

**Type Safety**:
```typescript
// ✅ Good: Explicit types
function deployContract(name: string, args: any[]): Promise<DeploymentResult> {
  // ...
}

// ❌ Bad: Using 'any' without justification
function deployContract(name: any, args: any): any {
  // ...
}
```

**Error Handling**:
```typescript
// ✅ Good: Custom error types
class ValidationError extends Error {
  constructor(message: string, public details: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

throw new ValidationError('Invalid configuration', { field: 'network' });

// ❌ Bad: Generic errors
throw new Error('Error occurred');
```

**Async/Await**:
```typescript
// ✅ Good: Proper async/await usage
async function deployContracts(contracts: string[]): Promise<void> {
  try {
    for (const contract of contracts) {
      await deployContract(contract);
    }
  } catch (error) {
    logger.error('Deployment failed', error);
    throw error;
  }
}

// ❌ Bad: Unhandled promises
function deployContracts(contracts: string[]): void {
  contracts.forEach(contract => {
    deployContract(contract); // Unhandled promise!
  });
}
```

### Code Organization

**File Structure**:
```
src/
├── tools/           # MCP tool implementations
│   ├── scaffold-project.ts
│   └── deploy-contracts.ts
├── engines/         # Core business logic
│   ├── template.ts
│   └── deployment.ts
├── utils/           # Utility functions
│   ├── logger.ts
│   └── file-manager.ts
├── config/          # Configuration management
│   └── loader.ts
└── types/           # Type definitions
    └── index.ts
```

**Module Exports**:
```typescript
// ✅ Good: Named exports
export class TemplateEngine {}
export function loadTemplate() {}

// ❌ Bad: Default exports (harder to refactor)
export default class TemplateEngine {}
```

### Comments and Documentation

**JSDoc for Public APIs**:
```typescript
/**
 * Scaffolds a new Scaffold-ETH 2 project with optional Minikit integration.
 *
 * @param options - Project configuration options
 * @param options.projectName - Name of the project (kebab-case)
 * @param options.includesMinikit - Whether to include Base Minikit
 * @returns Promise resolving to project path and metadata
 * @throws {ValidationError} If project name is invalid
 * @throws {FileSystemError} If directory already exists
 *
 * @example
 * ```typescript
 * const result = await scaffoldProject({
 *   projectName: 'my-dapp',
 *   includesMinikit: true
 * });
 * console.log(`Project created at: ${result.projectPath}`);
 * ```
 */
export async function scaffoldProject(options: ScaffoldOptions): Promise<ScaffoldResult> {
  // Implementation
}
```

**Inline Comments**:
```typescript
// ✅ Good: Explain 'why', not 'what'
// Retry with exponential backoff to handle rate limiting
const result = await retryWithBackoff(apiCall, 3);

// ❌ Bad: Obvious comment
// Set result to the return value of retryWithBackoff
const result = await retryWithBackoff(apiCall, 3);
```

---

## Testing Requirements

### Test Coverage

- **Minimum Coverage**: 80% overall
- **Critical Paths**: 100% coverage for deployment, validation, security
- **Public APIs**: All public methods must have tests

### Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { scaffoldProject } from '../src/tools/scaffold-project';

describe('scaffold_project tool', () => {
  beforeEach(() => {
    // Setup test environment
  });

  afterEach(() => {
    // Cleanup test artifacts
  });

  describe('project initialization', () => {
    it('should create project with basic template', async () => {
      const result = await scaffoldProject({
        projectName: 'test-project',
        template: 'basic'
      });

      expect(result.success).toBe(true);
      expect(result.data.projectPath).toContain('test-project');
    });

    it('should throw error for invalid project name', async () => {
      await expect(
        scaffoldProject({ projectName: 'Invalid Name!' })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('minikit integration', () => {
    it('should add minikit when requested', async () => {
      const result = await scaffoldProject({
        projectName: 'test-minikit',
        includesMinikit: true
      });

      expect(result.data.minikit).toBe(true);
      // Verify OnchainKit installed
    });
  });
});
```

### Test Types

**Unit Tests** (`tests/unit/`):
- Test individual functions and classes in isolation
- Mock external dependencies
- Fast execution (<1s per test)

**Integration Tests** (`tests/integration/`):
- Test interaction between modules
- Use test doubles for external systems
- Moderate execution time (<5s per test)

**End-to-End Tests** (`tests/e2e/`):
- Test complete workflows
- Use real filesystem, test networks
- Slower execution (<30s per test)

### Running Tests

```bash
# All tests
npm test

# Specific test file
npm test -- scaffold-project.test.ts

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests only
npm run test:e2e
```

---

## Documentation Guidelines

### What to Document

1. **Public APIs**: All exported functions, classes, interfaces
2. **Complex Logic**: Non-obvious algorithms or business logic
3. **Configuration**: Environment variables, config options
4. **Workflows**: Multi-step processes and integrations
5. **Examples**: Usage examples for each feature

### Documentation Locations

- **Code Comments**: JSDoc for APIs, inline for complex logic
- **README**: Overview, quick start, high-level concepts
- **API Docs**: Generated from JSDoc comments
- **Guides**: Step-by-step tutorials (`docs/guides/`)
- **Architecture**: System design and patterns (`docs/architecture.md`)

### Writing Style

- **Be Concise**: Get to the point quickly
- **Be Clear**: Avoid jargon, explain technical terms
- **Be Accurate**: Keep docs in sync with code
- **Be Helpful**: Include examples and common pitfalls
- **Be Complete**: Cover all parameters, return values, errors

### Updating Documentation

When making code changes:
1. Update JSDoc comments in the code
2. Update relevant markdown files
3. Add examples if introducing new features
4. Update troubleshooting if fixing bugs
5. Regenerate API docs if public API changes

---

## Issue Management

### Creating Issues

**Before Creating**:
1. Search existing issues to avoid duplicates
2. Check if it's already in [WORKFLOW.md](./WORKFLOW.md)
3. Verify it's not already fixed in main branch

**Issue Template**:
```markdown
## Description
Clear description of the issue or feature request

## Type
- [ ] Bug report
- [ ] Feature request
- [ ] Documentation improvement
- [ ] Question

## Current Behavior (for bugs)
What happens currently

## Expected Behavior
What should happen

## Steps to Reproduce (for bugs)
1. Step 1
2. Step 2
3. ...

## Environment
- Node.js version:
- npm version:
- OS:

## Additional Context
Any other relevant information
```

### Issue Labels

**Priority**:
- `p0-critical` - Blocking issues, security vulnerabilities
- `p1-high` - Important features, major bugs
- `p2-medium` - Standard features, minor bugs
- `p3-low` - Nice-to-have features, cosmetic issues

**Status**:
- `blocked` - Cannot proceed due to dependency
- `needs-info` - Waiting for more information
- `in-progress` - Actively being worked on
- `needs-review` - PR open and awaiting review

**Type**:
- `feature` - New functionality
- `bug` - Something isn't working
- `docs` - Documentation improvements
- `refactor` - Code quality improvements
- `test` - Testing improvements

**Domain**:
- `backend` - Server-side code
- `frontend` - Client-side code
- `contracts` - Smart contracts
- `templates` - Project templates
- `docs` - Documentation

### Triaging Issues

Maintainers will:
1. Review new issues within 48 hours
2. Add appropriate labels
3. Assign to epic/milestone if applicable
4. Request more information if needed
5. Close duplicates or out-of-scope issues

---

## Commit Message Guidelines

### Format

```
<type>(<scope>): <subject> (#<issue-number>)

<body>

<footer>
```

### Type

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `refactor` - Code change that neither fixes bug nor adds feature
- `test` - Adding or updating tests
- `chore` - Changes to build process or auxiliary tools

### Scope

Component or module affected:
- `scaffold` - Scaffolding tools
- `deploy` - Deployment pipeline
- `minikit` - Minikit integration
- `templates` - Template system
- `config` - Configuration management
- `tests` - Test infrastructure

### Examples

```bash
feat(scaffold): implement scaffold_project tool (#11)

Add MCP tool for project initialization with template selection,
dependency installation, and git initialization.

Closes #11

---

fix(deploy): correct gas estimation calculation (#29)

Gas estimation was using outdated multiplier. Updated to use
current Base network gas pricing.

Fixes #29

---

docs(api): add examples for minikit tools (#38)

Added comprehensive usage examples for all Minikit-related
MCP tools including add_minikit_support and create_frame.

---

test(integration): add deployment workflow tests (#34)

Comprehensive E2E tests for deployment pipeline including
verification, type generation, and rollback scenarios.

Relates to #34
```

---

## Pull Request Template

When you open a PR, the following template will be auto-populated:

```markdown
## Description
<!-- Brief description of the changes -->

## Related Issue
<!-- Link to the issue this PR addresses -->
Closes #

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Test improvements

## Testing
<!-- Describe the tests you ran to verify your changes -->
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed
- [ ] Test coverage maintained/improved

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## Additional Notes
<!-- Any additional information for reviewers -->
```

---

## Getting Help

### Where to Ask Questions

1. **GitHub Discussions**: General questions and discussions
2. **Issue Comments**: Questions about specific issues
3. **Discord** (if available): Real-time chat
4. **Stack Overflow**: Tagged with `se2-minikit`

### Maintainer Contact

- **Project Lead**: [Contact info]
- **Core Team**: [Contact info]
- **Email**: [Support email]

### Response Times

- **Critical Issues**: <4 hours
- **Bug Reports**: <24 hours
- **Feature Requests**: <48 hours
- **Questions**: <48 hours
- **PR Reviews**: <48 hours

---

## Recognition

### Contributors

All contributors will be recognized:
- Listed in README.md
- Mentioned in release notes
- GitHub contributor badge

### Significant Contributions

Exceptional contributions may receive:
- Blog post feature
- Social media recognition
- Invitation to maintainer team

---

## Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Schedule

- **Patch**: As needed for critical bugs
- **Minor**: Monthly for new features
- **Major**: Quarterly for breaking changes

### Release Notes

Each release includes:
- Summary of changes
- New features
- Bug fixes
- Breaking changes (if any)
- Migration guide (for major versions)
- Contributors

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

## Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort! 🙏

If you have suggestions for improving this guide, please open an issue or PR.

---

**Last Updated**: 2025-11-06
**Maintained By**: Core Team
