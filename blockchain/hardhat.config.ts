import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

// Load .env from blockchain directory first, then fallback to parent
dotenv.config(); // Load ./blockchain/.env
dotenv.config({ path: "../.env" }); // Fallback to parent .env

/**
 * 🦷 DENTIA BLOCKCHAIN - HARDHAT CONFIGURATION
 * ═══════════════════════════════════════════════════════════════
 * 
 * NETWORKS:
 * - localhost: Local Hardhat node (testing)
 * - sepolia: Ethereum testnet (staging)
 * - polygon: Polygon mainnet (production - recommended)
 * - mumbai: Polygon testnet (staging alt)
 * 
 * SECURITY NOTES:
 * - Never commit private keys to git
 * - Use environment variables from .env
 * - For production: Use hardware wallet + Gnosis Safe
 */

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Optimize for average usage patterns
      },
      viaIR: true, // Enable IR-based code generation for better optimization
    },
  },
  
  networks: {
    // Local development
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    
    // Ethereum Sepolia Testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.DEPLOYER_PRIVATE_KEY 
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      chainId: 11155111,
    },
    
    // Polygon Mainnet (RECOMMENDED FOR PRODUCTION)
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      accounts: process.env.DEPLOYER_PRIVATE_KEY 
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      chainId: 137,
      gasPrice: 50000000000, // 50 gwei (adjust based on network conditions)
    },
    
    // Polygon Mumbai Testnet
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.DEPLOYER_PRIVATE_KEY 
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      chainId: 80001,
    },
  },
  
  etherscan: {
    apiKey: {
      // For contract verification
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
};

export default config;
