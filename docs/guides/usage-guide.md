# Usage Guide: Scaffold-Minikit MCP Server

Complete guide for using the scaffold-minikit MCP server through Claude Code.

## Quick Start

### Creating Your First Project

```plaintext
User: "Create an NFT minting dApp for Base"

Claude Code: I'll create an NFT minting dApp using Scaffold-ETH 2 and Base Minikit.

[Calls scaffold_project tool]

✅ Project created at ./nft-minting-dapp

Project includes:
- ERC-721 NFT contract with minting functionality
- NextJS frontend with OnchainKit components
- Base Sepolia network configuration
- Farcaster Mini App setup

Next steps:
1. cd nft-minting-dapp
2. Configure your .env file
3. Deploy contracts: "Deploy to Base Sepolia"
```

## Complete Workflows

### Workflow 1: Basic NFT Marketplace

#### Step 1: Initialize Project

```plaintext
User: "Create an NFT marketplace dApp with Minikit support"

Response: Creates project with:
- NFT Collection contract (ERC-721)
- Marketplace contract for buying/selling
- Minikit integration for Farcaster
- Base Sepolia configuration
```

#### Step 2: Customize Contracts

```plaintext
User: "Add royalty support to the NFT contract"

Response: Configures contract with:
- ERC-2981 royalty standard
- Royalty percentage configuration
- Marketplace royalty distribution
```

#### Step 3: Deploy to Testnet

```plaintext
User: "Deploy to Base Sepolia"

Response: Executes deployment:
✅ NFTCollection deployed: 0x742d35...
✅ NFTMarketplace deployed: 0x8f3a21...
✅ Contracts verified on Basescan
✅ Frontend configuration updated

Gas used: 4.2M
Estimated cost: 0.0021 ETH
```

#### Step 4: Generate UI Components

```plaintext
User: "Create a mint button component"

Response: Generates component:
- MintButton.tsx created
- Integrated with NFTCollection contract
- OnchainKit Transaction component
- Includes loading and error states
```

#### Step 5: Setup Farcaster Integration

```plaintext
User: "Setup Farcaster manifest for nftmarket.xyz"

Response: Configures manifest:
✅ Domain signature generated
✅ Manifest created at .well-known/farcaster.json
✅ Icons validated
✅ Ready for Mini App registration
```

#### Step 6: Create Frame for Sharing

```plaintext
User: "Create a Frame to share minted NFTs"

Response: Generates Frame:
✅ Frame route created at app/frame/route.tsx
✅ Frame metadata configured
✅ Share URL: warpcast.com/~/compose?embeds[]=nftmarket.xyz/frame

Users can now share NFTs virally on Farcaster!
```

---

### Workflow 2: Social Tipping dApp

#### Step 1: Scaffold Social Template

```plaintext
User: "Build a tipping app for Farcaster users"

Response: Creates social dApp with:
- Farcaster authentication (SIWF)
- Tipping contract for ETH tips
- Social graph integration
- Base Minikit components
```

#### Step 2: Configure Authentication

```plaintext
User: "Setup dual authentication (SIWF + wallet)"

Response: Configures auth:
✅ Sign-in with Farcaster enabled
✅ Wallet authentication enabled
✅ Auth components generated
✅ Session management configured
```

#### Step 3: Deploy and Test

```plaintext
User: "Deploy to Base Sepolia and validate"

Response: Deploys and validates:
✅ Contracts deployed and verified
✅ Frontend deployed to Vercel
✅ Health checks passed
✅ Mini App registered

Testing URL: https://fartips-xyz.vercel.app
```

---

### Workflow 3: DeFi Token Swap

#### Step 1: Create DeFi Project

```plaintext
User: "Create a token swap protocol on Base"

Response: Scaffolds DeFi template:
- SwapRouter contract (Uniswap V2 style)
- LiquidityPool contract
- GovernanceToken (ERC-20)
- Swap UI with OnchainKit
```

#### Step 2: Configure Contracts

```plaintext
User: "Add a 0.3% swap fee with fee distribution"

Response: Configures contracts:
✅ Swap fee set to 0.3%
✅ Fee distribution to liquidity providers
✅ Fee withdrawal mechanism
✅ Tests updated
```

#### Step 3: Generate Swap UI

```plaintext
User: "Create a swap interface component"

Response: Generates SwapInterface.tsx:
- Token selection dropdown
- Amount input with balance display
- Slippage settings
- OnchainKit Transaction integration
- Price impact warning
```

---

## Natural Language Patterns

### Project Creation

```plaintext
✅ "Create an NFT marketplace"
✅ "Build a DeFi swap protocol"
✅ "Make a DAO governance dApp"
✅ "Setup a gaming dApp with NFT items"
✅ "Create a social tipping app for Farcaster"

❌ "Just give me some code"  (be specific about what you want)
```

### Contract Configuration

```plaintext
✅ "Add minting functionality to the NFT contract"
✅ "Make the token burnable and pausable"
✅ "Add governance voting to the DAO"
✅ "Include royalty support"

❌ "Change the contract"  (be specific about changes)
```

### Deployment

```plaintext
✅ "Deploy to Base Sepolia"
✅ "Deploy to Base mainnet"
✅ "Deploy and verify my contracts"

❌ "Put it on the blockchain"  (specify network)
```

### Minikit Setup

```plaintext
✅ "Add Minikit support"
✅ "Setup Farcaster manifest for myapp.xyz"
✅ "Create a Frame for sharing"
✅ "Enable smart wallet features"

❌ "Make it work with Farcaster"  (be specific)
```

### Component Generation

```plaintext
✅ "Create a mint button"
✅ "Generate a transaction component for swapping"
✅ "Make an identity display component"
✅ "Build a wallet connector"

❌ "Add a button"  (specify what the button does)
```

### Validation

```plaintext
✅ "Validate my project configuration"
✅ "Check if I'm ready to deploy"
✅ "Run security checks"

✅ "Is everything configured correctly?"
```

---

## Advanced Usage

### Custom Contract Features

```typescript
User: "Add custom logic to track NFT trading volume"

Response: I'll add tracking functionality to your marketplace contract.

[Updates MarketplaceContract.sol]

Changes made:
- Added tradingVolume mapping
- Updated buyNFT function to track volume
- Added getTradingVolume view function
- Tests updated and passing

Custom logic integrated successfully!
```

### Multi-Contract Deployment

```typescript
User: "Deploy my NFT contract first, then the marketplace with the NFT address"

Response: I'll deploy in sequence with proper dependency handling.

Step 1: Deploying NFTCollection...
✅ NFTCollection: 0x742d35...

Step 2: Deploying NFTMarketplace with NFT address...
✅ NFTMarketplace: 0x8f3a21...
✅ Constructor arg (NFT address): 0x742d35...

Both contracts deployed and linked!
```

### Environment-Specific Configuration

```typescript
User: "Use different RPC endpoints for testnet and mainnet"

Response: I'll configure network-specific RPC endpoints.

Updated hardhat.config.ts:
- Base Sepolia: https://sepolia.base.org
- Base Mainnet: https://mainnet.base.org

Environment variables:
- BASE_SEPOLIA_RPC_URL (testnet)
- BASE_RPC_URL (mainnet)

Network switching: --network base | baseSepolia
```

### Custom Minikit Components

```typescript
User: "Create a component that shows NFT balance with OnchainKit styling"

Response: I'll generate a custom component with OnchainKit integration.

Created: components/minikit/NFTBalance.tsx

Features:
- Fetches NFT balance from contract
- OnchainKit Identity styling
- Loading states
- Error handling
- Responsive design

Usage:
import { NFTBalance } from "~~/components/minikit/NFTBalance";
<NFTBalance address={address} />
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue: "Environment variables not set"

```plaintext
User: "Deploy to Base Sepolia"

Error: Missing required environment variables:
- DEPLOYER_PRIVATE_KEY
- BASE_SEPOLIA_RPC_URL

Solution:
1. Copy .env.example to .env
2. Add your private key (never commit this!)
3. Add Base Sepolia RPC URL
4. Retry deployment
```

#### Issue: "Contract compilation failed"

```plaintext
User: "Deploy my contracts"

Error: Solidity compilation failed
Details: ParserError: Expected ';' at contracts/MyNFT.sol:42

Solution:
Let me check the contract for syntax errors...

Found issue in MyNFT.sol:42
- Missing semicolon after function declaration
- Fixed automatically

Ready to deploy now!
```

#### Issue: "Insufficient funds for deployment"

```plaintext
User: "Deploy to Base Sepolia"

Error: Insufficient funds
Required: 0.005 ETH
Balance: 0 ETH

Solution:
1. Get testnet ETH from Base Sepolia Faucet
2. Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
3. Request funds for your deployer address
4. Retry deployment
```

#### Issue: "Minikit manifest validation failed"

```plaintext
User: "Setup Farcaster manifest"

Error: Manifest validation failed
- Icon URL not accessible
- Domain not HTTPS

Solution:
1. Upload icon to accessible HTTPS URL
2. Ensure domain supports HTTPS
3. Icon requirements: PNG, 200x200px minimum
4. Regenerate manifest

Would you like me to help fix these issues?
```

---

## Best Practices

### 1. Project Organization

```plaintext
✅ Use descriptive project names
✅ Keep contracts simple and focused
✅ Follow naming conventions (PascalCase for contracts)
✅ Document custom logic

❌ Don't mix multiple unrelated features
❌ Don't use generic names like "contract1"
```

### 2. Contract Development

```plaintext
✅ Start with templates, customize incrementally
✅ Write tests for custom logic
✅ Use OpenZeppelin standards
✅ Add comments for complex logic

❌ Don't skip testing
❌ Don't reinvent security patterns
```

### 3. Deployment

```plaintext
✅ Deploy to testnet first
✅ Verify contracts immediately
✅ Test thoroughly before mainnet
✅ Keep private keys secure

❌ Don't deploy to mainnet untested
❌ Don't commit private keys
❌ Don't skip contract verification
```

### 4. Minikit Integration

```plaintext
✅ Setup manifest early
✅ Test Frame rendering
✅ Use SIWF for best UX
✅ Validate icons and images

❌ Don't skip manifest validation
❌ Don't use low-resolution icons
```

---

## Integration with Other MCP Servers

### With Sequential Thinking

```plaintext
User: "Help me decide between ERC-721 and ERC-1155 for my game items"

Claude: Let me analyze this systematically...

[Activates sequential-thinking MCP]
→ Analyzes use case requirements
→ Compares gas costs and flexibility
→ Considers future scalability
→ Recommends ERC-1155 for game items

Reasoning: Multiple item types with quantities = ERC-1155 optimal

Then: [Uses scaffold-minikit MCP]
→ Configures ERC-1155 contract
→ Adds gaming-specific features
```

### With Context7

```plaintext
User: "Show me the latest OnchainKit Identity patterns"

Claude: Let me fetch the official OnchainKit docs...

[Uses context7 MCP]
→ Retrieves OnchainKit documentation
→ Finds Identity component examples

Then: [Uses scaffold-minikit MCP]
→ Generates component with latest patterns
→ Integrates with your deployed contracts
```

### With Magic

```plaintext
User: "Create a beautiful NFT gallery with modern UI"

Claude: I'll generate a modern NFT gallery...

[Uses magic MCP]
→ Generates gallery UI from 21st.dev patterns
→ Modern, accessible component

Then: [Uses scaffold-minikit MCP]
→ Connects UI to NFT contract
→ Adds OnchainKit transaction flows
→ Integrates with Minikit features
```

---

## Progressive Enhancement Workflow

### Phase 1: Basic Setup

```plaintext
1. Create project with basic template
2. Deploy contracts to testnet
3. Test basic functionality
4. Validate configuration
```

### Phase 2: Minikit Integration

```plaintext
5. Add Minikit support
6. Setup Farcaster manifest
7. Configure authentication
8. Test Mini App in Base App
```

### Phase 3: Advanced Features

```plaintext
9. Generate OnchainKit components
10. Create Frames for sharing
11. Add custom contract logic
12. Optimize gas usage
```

### Phase 4: Production Ready

```plaintext
13. Comprehensive testing
14. Security audit review
15. Deploy to mainnet
16. Register Mini App
17. Launch! 🚀
```

---

## Tips for Hackathons

### Speed Optimization

```plaintext
✅ Use templates (10x faster setup)
✅ Deploy to testnet immediately
✅ Iterate on features incrementally
✅ Leverage Minikit for viral growth

Timeline:
- Hour 1: Project scaffold + deploy
- Hour 2-4: Core features + UI
- Hour 5-6: Minikit + Frames
- Hour 7-8: Polish + testing
```

### Focus Areas

```plaintext
High Impact:
1. Working demo on testnet
2. Farcaster Frame for distribution
3. Clean UI with OnchainKit
4. Clear value proposition

Lower Priority:
- Perfect code optimization
- Extensive documentation
- Mainnet deployment
```

### Demo Preparation

```plaintext
Before Demo:
1. Deploy to testnet with permanent URL
2. Create Frame for easy sharing
3. Test all user flows
4. Prepare contract addresses
5. Screenshot key features

During Demo:
1. Show Frame first (viral potential)
2. Demonstrate user flow
3. Show smart contract interaction
4. Highlight Base/Farcaster integration
```

---

## Getting Help

### Validation and Debugging

```plaintext
User: "Something's not working, can you check?"

Claude: I'll run a full validation...

[Validates project]
✅ Configuration valid
✅ Contracts compile
❌ Missing ONCHAINKIT_API_KEY
⚠️ Test coverage below 80%

Fix the API key and you'll be ready to deploy!
```

### Understanding Generated Code

```plaintext
User: "Explain what this contract does"

Claude: Let me break down the contract functionality...

[Provides detailed explanation]
- Contract purpose
- Key functions
- Security features
- Gas optimization patterns
- Integration points
```

### Best Next Steps

```plaintext
User: "What should I do next?"

Claude: Based on your project state...

Current: Contracts deployed to testnet ✅
Next steps:
1. Generate UI components
2. Setup Farcaster manifest
3. Create sharing Frame
4. Test complete user flow

Would you like me to help with step 1?
```

---

## Summary

The scaffold-minikit MCP server enables rapid Web3 development through natural language interaction. Use clear, specific requests for best results, and leverage the complete workflow from scaffolding to deployment to create production-ready dApps in hours, not days.

For implementation details, see:
- [Architecture](./architecture.md)
- [Tool Schemas](./tool-schemas.md)
- [Resources & Templates](./resources-templates.md)
- [Deployment Pipeline](./deployment-pipeline.md)
