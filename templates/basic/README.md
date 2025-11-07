# {{projectName}}

{{description}}

**Author**: {{author}}
**Network**: {{network}}

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [Git](https://git-scm.com/)

### Installation

```bash
# Install dependencies
bun install

# Start local blockchain
bun run chain

# In a new terminal, deploy contracts
bun run deploy

# Start the Next.js frontend
cd nextjs
bun install
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your dApp.

## Project Structure

```
{{projectName}}/
├── contracts/          # Solidity smart contracts
├── deploy/            # Deployment scripts
├── test/              # Contract tests
├── nextjs/            # Next.js frontend
└── hardhat.config.ts  # Hardhat configuration
```

## Smart Contracts

### {{contractName}}

A simple smart contract demonstrating basic Scaffold-ETH 2 functionality.

**Features**:
- Greeting storage and retrieval
- Owner-only updates
- Event emission

## Development

### Compile Contracts

```bash
bun run compile
```

### Run Tests

```bash
bun test
```

### Deploy to Network

```bash
# Deploy to {{network}}
bun run deploy

# Deploy with verification
bun run deploy:verify
```

### Generate Account

```bash
bun run generate
```

## Frontend

The Next.js frontend is located in the `nextjs/` directory.

```bash
cd nextjs
bun install
bun run dev
```

## Network Configuration

Current network: **{{network}}**

To change networks, update the deployment scripts or use:

```bash
bun hardhat deploy --network <network-name>
```

## Resources

- [Scaffold-ETH 2 Documentation](https://docs.scaffoldeth.io/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Base Documentation](https://docs.base.org/)

## License

MIT

---

Built with [Scaffold-ETH 2](https://scaffoldeth.io/) 🏗️
