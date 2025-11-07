import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "{{network}}",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia.basescan.org",
          apiKey: process.env.BASESCAN_API_KEY || "",
        },
      },
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      verify: {
        etherscan: {
          apiUrl: "https://api.basescan.org",
          apiKey: process.env.BASESCAN_API_KEY || "",
        },
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};

export default config;
