# MCP Resources and Templates

This document defines the resource endpoints and template system for the scaffold-minikit MCP server.

## Resource Endpoints

MCP resources provide read-only information that can be accessed by clients. All resources follow the URI pattern: `scaffold-minikit://[category]/[resource]`

### Resource List

| URI | Description | MIME Type |
|-----|-------------|-----------|
| `scaffold-minikit://templates/projects` | Project templates catalog | application/json |
| `scaffold-minikit://templates/contracts/{type}` | Contract templates | text/x-solidity |
| `scaffold-minikit://examples/minikit` | Minikit integration examples | application/json |
| `scaffold-minikit://guides/deployment/{network}` | Deployment guides | text/markdown |
| `scaffold-minikit://schemas/config` | Configuration schemas | application/schema+json |

---

## 1. Project Templates

**URI**: `scaffold-minikit://templates/projects`

### Template Catalog

```json
{
  "version": "1.0.0",
  "templates": [
    {
      "id": "basic",
      "name": "Basic dApp",
      "description": "Simple starter with wallet connection and basic contract interaction",
      "features": [
        "wallet-connect",
        "contract-interaction",
        "basic-ui"
      ],
      "contracts": ["SimpleStorage"],
      "minikit_compatible": true,
      "minikit_required": false,
      "difficulty": "beginner",
      "estimated_setup_time": "5 minutes",
      "tags": ["starter", "minimal", "learning"]
    },
    {
      "id": "nft",
      "name": "NFT Collection",
      "description": "ERC-721 NFT minting platform with gallery and metadata management",
      "features": [
        "erc721",
        "minting-ui",
        "nft-gallery",
        "metadata-upload",
        "ipfs-integration"
      ],
      "contracts": ["NFTCollection", "NFTMetadata"],
      "minikit_compatible": true,
      "minikit_required": false,
      "difficulty": "intermediate",
      "estimated_setup_time": "10 minutes",
      "tags": ["nft", "collectibles", "art"]
    },
    {
      "id": "defi",
      "name": "DeFi Protocol",
      "description": "Token swap and liquidity protocol with AMM functionality",
      "features": [
        "erc20",
        "token-swap",
        "liquidity-pool",
        "yield-farming",
        "price-oracle"
      ],
      "contracts": ["SwapRouter", "LiquidityPool", "GovernanceToken"],
      "minikit_compatible": true,
      "minikit_required": false,
      "difficulty": "advanced",
      "estimated_setup_time": "15 minutes",
      "tags": ["defi", "swap", "liquidity", "amm"]
    },
    {
      "id": "dao",
      "name": "DAO Governance",
      "description": "Decentralized autonomous organization with voting and treasury management",
      "features": [
        "governance",
        "voting",
        "treasury",
        "proposals",
        "timelock"
      ],
      "contracts": ["Governor", "TimelockController", "GovernanceToken"],
      "minikit_compatible": true,
      "minikit_required": false,
      "difficulty": "advanced",
      "estimated_setup_time": "15 minutes",
      "tags": ["dao", "governance", "voting"]
    },
    {
      "id": "gaming",
      "name": "Gaming dApp",
      "description": "On-chain gaming with NFT items, achievements, and leaderboards",
      "features": [
        "game-logic",
        "nft-items",
        "achievements",
        "leaderboard",
        "rewards"
      ],
      "contracts": ["GameEngine", "GameItems", "Achievements"],
      "minikit_compatible": true,
      "minikit_required": false,
      "difficulty": "intermediate",
      "estimated_setup_time": "12 minutes",
      "tags": ["gaming", "nft", "play-to-earn"]
    },
    {
      "id": "social",
      "name": "Social dApp",
      "description": "Farcaster-integrated social application with tipping and content rewards",
      "features": [
        "farcaster-auth",
        "social-graph",
        "frames",
        "tipping",
        "content-rewards"
      ],
      "contracts": ["SocialTipping", "ContentRewards"],
      "minikit_compatible": true,
      "minikit_required": true,
      "difficulty": "intermediate",
      "estimated_setup_time": "10 minutes",
      "tags": ["social", "farcaster", "tipping"]
    }
  ]
}
```

### Template Structure

Each template follows this directory structure:

```
template-{name}/
├── packages/
│   ├── hardhat/
│   │   ├── contracts/
│   │   │   ├── {ContractName}.sol
│   │   │   └── ...
│   │   ├── deploy/
│   │   │   └── 00_deploy_{contract}.ts
│   │   ├── test/
│   │   │   └── {ContractName}.test.ts
│   │   ├── hardhat.config.ts
│   │   └── package.json
│   └── nextjs/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── providers.tsx
│       │   └── {feature}/
│       │       └── page.tsx
│       ├── components/
│       │   ├── scaffold-eth/
│       │   └── {template-specific}/
│       ├── hooks/
│       │   └── scaffold-eth/
│       ├── public/
│       │   ├── logo.png
│       │   └── .well-known/
│       │       └── farcaster.json  # if minikit
│       ├── styles/
│       ├── next.config.js
│       └── package.json
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── scaffold-minikit.config.json
```

---

## 2. Contract Templates

**URI**: `scaffold-minikit://templates/contracts/{type}`

### Available Contract Types

#### ERC-20 Token

```solidity
// scaffold-minikit://templates/contracts/erc20
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title {{ContractName}}
 * @dev ERC-20 token with configurable features
 */
contract {{ContractName}} is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    // Feature: Mintable
    {{#if features.mintable}}
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    {{/if}}

    // Feature: Burnable
    {{#if features.burnable}}
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
    {{/if}}
}
```

#### ERC-721 NFT

```solidity
// scaffold-minikit://templates/contracts/erc721
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title {{ContractName}}
 * @dev ERC-721 NFT with configurable features
 */
contract {{ContractName}} is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public maxSupply;
    uint256 public mintPrice;

    constructor(
        string memory name,
        string memory symbol,
        uint256 _maxSupply,
        uint256 _mintPrice
    ) ERC721(name, symbol) Ownable(msg.sender) {
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
    }

    function mint(address to, string memory uri) public payable returns (uint256) {
        require(_tokenIds.current() < maxSupply, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, uri);

        return newTokenId;
    }

    // Feature: Burnable
    {{#if features.burnable}}
    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _burn(tokenId);
    }
    {{/if}}

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

#### ERC-1155 Multi-Token

```solidity
// scaffold-minikit://templates/contracts/erc1155
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title {{ContractName}}
 * @dev ERC-1155 multi-token with configurable features
 */
contract {{ContractName}} is ERC1155, Ownable {
    mapping(uint256 => uint256) public tokenSupply;
    mapping(uint256 => uint256) public maxSupply;
    mapping(uint256 => uint256) public mintPrice;

    constructor(string memory uri) ERC1155(uri) Ownable(msg.sender) {}

    function createToken(
        uint256 tokenId,
        uint256 _maxSupply,
        uint256 _mintPrice
    ) public onlyOwner {
        require(maxSupply[tokenId] == 0, "Token already exists");
        maxSupply[tokenId] = _maxSupply;
        mintPrice[tokenId] = _mintPrice;
    }

    function mint(
        address to,
        uint256 tokenId,
        uint256 amount
    ) public payable {
        require(maxSupply[tokenId] > 0, "Token doesn't exist");
        require(
            tokenSupply[tokenId] + amount <= maxSupply[tokenId],
            "Exceeds max supply"
        );
        require(msg.value >= mintPrice[tokenId] * amount, "Insufficient payment");

        tokenSupply[tokenId] += amount;
        _mint(to, tokenId, amount, "");
    }
}
```

#### Custom: Social Tipping Contract

```solidity
// scaffold-minikit://templates/contracts/custom/social-tipping
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SocialTipping
 * @dev Allow users to tip content creators on Farcaster
 */
contract SocialTipping is Ownable, ReentrancyGuard {
    struct Tip {
        address tipper;
        address recipient;
        uint256 amount;
        uint256 fid; // Farcaster ID
        uint256 timestamp;
    }

    Tip[] public tips;
    mapping(address => uint256) public totalTipped;
    mapping(address => uint256) public totalReceived;

    event TipSent(
        address indexed tipper,
        address indexed recipient,
        uint256 amount,
        uint256 fid,
        uint256 timestamp
    );

    function sendTip(address recipient, uint256 fid) public payable nonReentrant {
        require(msg.value > 0, "Tip amount must be greater than 0");
        require(recipient != address(0), "Invalid recipient");

        tips.push(Tip({
            tipper: msg.sender,
            recipient: recipient,
            amount: msg.value,
            fid: fid,
            timestamp: block.timestamp
        }));

        totalTipped[msg.sender] += msg.value;
        totalReceived[recipient] += msg.value;

        (bool success, ) = recipient.call{value: msg.value}("");
        require(success, "Transfer failed");

        emit TipSent(msg.sender, recipient, msg.value, fid, block.timestamp);
    }

    function getTipHistory(address user) public view returns (Tip[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < tips.length; i++) {
            if (tips[i].tipper == user || tips[i].recipient == user) {
                count++;
            }
        }

        Tip[] memory userTips = new Tip[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < tips.length; i++) {
            if (tips[i].tipper == user || tips[i].recipient == user) {
                userTips[index] = tips[i];
                index++;
            }
        }

        return userTips;
    }
}
```

---

## 3. Minikit Integration Examples

**URI**: `scaffold-minikit://examples/minikit`

```json
{
  "version": "1.0.0",
  "examples": [
    {
      "id": "transaction-button",
      "name": "Transaction Button",
      "description": "OnchainKit Transaction component integrated with Scaffold-ETH contract",
      "category": "component",
      "code": "// See code block below"
    },
    {
      "id": "identity-display",
      "name": "Identity Display",
      "description": "Show Farcaster identity with ENS and avatar",
      "category": "component",
      "code": "// See code block below"
    },
    {
      "id": "wallet-connector",
      "name": "Wallet Connector",
      "description": "Smart wallet connection with Farcaster auth",
      "category": "auth",
      "code": "// See code block below"
    },
    {
      "id": "frame-generator",
      "name": "Frame Generator",
      "description": "Generate Farcaster Frame for Mini App sharing",
      "category": "frame",
      "code": "// See code block below"
    }
  ]
}
```

### Example: Transaction Button

```typescript
// components/minikit/MintButton.tsx
import { Transaction, TransactionButton, TransactionStatus } from "@coinbase/onchainkit/transaction";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { base } from "wagmi/chains";

export function MintButton() {
  const { data: nftContract } = useDeployedContractInfo("MyNFT");

  const contracts = [
    {
      address: nftContract?.address as `0x${string}`,
      abi: nftContract?.abi || [],
      functionName: "mint",
      args: [],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Transaction
        contracts={contracts}
        chainId={base.id}
        onSuccess={(response) => {
          console.log("Mint successful", response);
        }}
      >
        <TransactionButton text="Mint NFT" />
        <TransactionStatus />
      </Transaction>
    </div>
  );
}
```

### Example: Identity Display

```typescript
// components/minikit/UserIdentity.tsx
import { Identity, Name, Avatar, Address } from "@coinbase/onchainkit/identity";
import { useMiniKit } from "@coinbase/minikit";

export function UserIdentity() {
  const { context } = useMiniKit();
  const address = context?.user?.address;

  if (!address) return null;

  return (
    <Identity address={address}>
      <div className="flex items-center gap-2">
        <Avatar className="w-10 h-10" />
        <div>
          <Name className="font-bold" />
          <Address className="text-sm text-gray-500" />
        </div>
      </div>
    </Identity>
  );
}
```

### Example: Wallet Connector

```typescript
// components/minikit/WalletConnector.tsx
import { useAuthenticate } from "@coinbase/onchainkit/minikit";
import { useMiniKit } from "@coinbase/minikit";
import { useAccount } from "wagmi";

export function WalletConnector() {
  const { context } = useMiniKit();
  const { authenticate, user } = useAuthenticate();
  const { address, isConnected } = useAccount();

  if (isConnected && user) {
    return (
      <div className="flex items-center gap-2">
        <span>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
        <span className="text-sm text-gray-500">
          @{context?.user?.username}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => authenticate({ strategy: "siwf" })}
      className="btn btn-primary"
    >
      Sign in with Farcaster
    </button>
  );
}
```

### Example: Frame Generator

```typescript
// app/frame/route.tsx
import { FrameRequest, getFrameMessage } from "@coinbase/onchainkit/frame";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body);

  if (!isValid) {
    return new NextResponse("Invalid frame message", { status: 400 });
  }

  const fid = message.interactor.fid;

  return new NextResponse(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://yourapp.com/frame.png" />
        <meta property="fc:frame:button:1" content="Open Mini App" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="https://yourapp.com" />
      </head>
      <body>
        Frame for Mini App
      </body>
    </html>
    `,
    {
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}

export async function GET() {
  return new NextResponse(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://yourapp.com/frame.png" />
        <meta property="fc:frame:button:1" content="Open Mini App" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="https://yourapp.com" />
      </head>
      <body>
        Frame for Mini App
      </body>
    </html>
    `,
    {
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}
```

---

## 4. Deployment Guides

**URI**: `scaffold-minikit://guides/deployment/{network}`

### Base Sepolia Deployment Guide

```markdown
# Deploying to Base Sepolia

## Prerequisites

- [ ] Base Sepolia ETH (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet))
- [ ] Configured `.env` with `DEPLOYER_PRIVATE_KEY`
- [ ] Configured `BASE_SEPOLIA_RPC_URL`
- [ ] Basescan API key for verification

## Step 1: Verify Configuration

```bash
# Check your configuration
npm run validate

# Expected output:
# ✓ Environment variables configured
# ✓ Network connectivity verified
# ✓ Contracts compile successfully
```

## Step 2: Deploy Contracts

```bash
cd packages/hardhat
npx hardhat deploy --network baseSepolia
```

## Step 3: Verify Contracts

```bash
npx hardhat verify --network baseSepolia DEPLOYED_CONTRACT_ADDRESS
```

## Step 4: Update Frontend

```bash
cd packages/nextjs
# Contract addresses automatically updated in deployedContracts.ts
npm run build
```

## Troubleshooting

- **Insufficient funds**: Get more ETH from faucet
- **Nonce too high**: Reset MetaMask account
- **Verification failed**: Check Basescan API key
```

---

## 5. Configuration Schemas

**URI**: `scaffold-minikit://schemas/config`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Scaffold-Minikit Configuration",
  "type": "object",
  "required": ["project", "contracts"],
  "properties": {
    "project": {
      "type": "object",
      "required": ["name", "type"],
      "properties": {
        "name": {
          "type": "string",
          "pattern": "^[a-z0-9-]+$",
          "minLength": 3,
          "maxLength": 50
        },
        "type": {
          "type": "string",
          "enum": ["basic", "nft", "defi", "dao", "gaming", "social"]
        },
        "description": {
          "type": "string",
          "maxLength": 200
        }
      }
    },
    "contracts": {
      "type": "object",
      "required": ["framework", "target_network"],
      "properties": {
        "framework": {
          "type": "string",
          "enum": ["hardhat", "foundry"]
        },
        "solidity_version": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+$",
          "default": "0.8.20"
        },
        "target_network": {
          "type": "string",
          "enum": ["base", "baseSepolia", "localhost"]
        },
        "contracts": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["name", "type"],
            "properties": {
              "name": {
                "type": "string",
                "pattern": "^[A-Z][a-zA-Z0-9]*$"
              },
              "type": {
                "type": "string",
                "enum": ["erc20", "erc721", "erc1155", "custom"]
              },
              "features": {
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": ["mintable", "burnable", "pausable", "ownable", "upgradeable"]
                }
              }
            }
          }
        }
      }
    },
    "minikit": {
      "type": "object",
      "required": ["enabled"],
      "properties": {
        "enabled": {
          "type": "boolean"
        },
        "features": {
          "type": "object",
          "properties": {
            "farcaster_frames": {
              "type": "boolean",
              "default": true
            },
            "smart_wallet": {
              "type": "boolean",
              "default": true
            },
            "onchainkit_components": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": ["transaction", "identity", "wallet", "swap", "fund", "checkout"]
              }
            }
          }
        },
        "authentication": {
          "type": "object",
          "properties": {
            "strategies": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": ["siwf", "wallet"]
              }
            },
            "default": {
              "type": "string",
              "enum": ["siwf", "wallet"]
            }
          }
        },
        "manifest": {
          "type": "object",
          "required": ["name", "domain"],
          "properties": {
            "name": {
              "type": "string",
              "minLength": 3,
              "maxLength": 50
            },
            "icon": {
              "type": "string",
              "format": "uri"
            },
            "splash": {
              "type": "string",
              "format": "uri"
            },
            "domain": {
              "type": "string",
              "pattern": "^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$"
            }
          }
        }
      }
    },
    "deployment": {
      "type": "object",
      "properties": {
        "auto_verify": {
          "type": "boolean",
          "default": true
        },
        "networks": {
          "type": "object",
          "additionalProperties": {
            "type": "object",
            "required": ["rpc_url"],
            "properties": {
              "rpc_url": {
                "type": "string",
                "format": "uri"
              },
              "explorer": {
                "type": "string",
                "format": "uri"
              }
            }
          }
        }
      }
    }
  }
}
```

---

## Template Versioning

All templates follow semantic versioning:

- **Major**: Breaking changes to template structure
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, improvements

Current template version: **1.0.0**

## Template Contribution Guidelines

Community members can contribute templates following these guidelines:

1. **Structure**: Follow the standard template structure
2. **Documentation**: Include comprehensive README
3. **Testing**: Provide test suite for contracts
4. **Security**: Pass security audit checklist
5. **Minikit**: Ensure Minikit compatibility flag is accurate
