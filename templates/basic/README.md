# {{projectName}}

{{description}}

**Author**: {{author}}
**Network**: {{network}}

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.0
- [Yarn](https://yarnpkg.com/) >= 1.22
- [Git](https://git-scm.com/)

### Installation

```bash
# Install dependencies
yarn install

# Start local blockchain
yarn chain

# In a new terminal, deploy contracts
yarn deploy

# Start the Next.js frontend
cd nextjs
yarn install
yarn dev
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
yarn compile
```

### Run Tests

```bash
yarn test
```

### Deploy to Network

```bash
# Deploy to {{network}}
yarn deploy

# Deploy with verification
yarn deploy:verify
```

### Generate Account

```bash
yarn generate
```

## Frontend

The Next.js frontend is located in the `nextjs/` directory.

```bash
cd nextjs
yarn install
yarn dev
```

## Network Configuration

Current network: **{{network}}**

To change networks, update the deployment scripts or use:

```bash
yarn hardhat deploy --network <network-name>
```

## Resources

- [Scaffold-ETH 2 Documentation](https://docs.scaffoldeth.io/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Base Documentation](https://docs.base.org/)

## License

MIT

---

Built with [Scaffold-ETH 2](https://scaffoldeth.io/) 🏗️
