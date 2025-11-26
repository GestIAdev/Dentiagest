/**
 * ⚡ WEB3 CONFIGURATION - DENTIAGEST ADMIN
 * 
 * Network configurations, contract addresses, and Web3 constants
 * 
 * @author PunkClaude
 */

// ═══════════════════════════════════════════════════════════
// NETWORK CONFIGURATIONS
// ═══════════════════════════════════════════════════════════

export const NETWORKS = {
  MAINNET: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://1rpc.io/sepolia',
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
} as const;

// ═══════════════════════════════════════════════════════════
// CONTRACT ADDRESSES - LIVE ON SEPOLIA ⚡
// Deployed: November 25, 2025
// ═══════════════════════════════════════════════════════════

export const CONTRACTS = {
  DENTIA_TOKEN: {
    // Mainnet address (to be deployed)
    [NETWORKS.MAINNET.chainId]: '',
    // Sepolia testnet address (LIVE ✅)
    [NETWORKS.SEPOLIA.chainId]: '0x9Aef082d6A8EB49Dc6e7db19E5D118746f599Fad',
  },
  TREASURY: {
    // DentiaRewards contract address
    [NETWORKS.MAINNET.chainId]: '',
    [NETWORKS.SEPOLIA.chainId]: '0x30f21027Abe424AfAFe3DBE0c7BC842C1Ea86B3f',
  },
  HOT_WALLET: {
    // Selene Operator wallet for gas
    [NETWORKS.MAINNET.chainId]: '',
    [NETWORKS.SEPOLIA.chainId]: '0x742D35cc6634C0532925A3b844BC9E7595F2bD73',
  },
} as const;

// ═══════════════════════════════════════════════════════════
// TOKEN ABI (Minimal ERC20)
// ═══════════════════════════════════════════════════════════

export const DENTIA_TOKEN_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view',
  },
] as const;

// ═══════════════════════════════════════════════════════════
// WEB3 CONSTANTS
// ═══════════════════════════════════════════════════════════

export const WEB3_CONFIG = {
  // Default network for development
  DEFAULT_NETWORK: NETWORKS.SEPOLIA.chainId,
  
  // Supported chain IDs
  SUPPORTED_CHAIN_IDS: [
    NETWORKS.MAINNET.chainId,
    NETWORKS.SEPOLIA.chainId,
  ],
  
  // Gas limits (conservative estimates)
  GAS_LIMITS: {
    TOKEN_TRANSFER: 100000,
    APPROVE: 50000,
    CLAIM_REWARDS: 150000,
  },
  
  // Token decimals
  DENTIA_DECIMALS: 18,
  
  // Polling intervals (milliseconds)
  POLLING: {
    BALANCE_UPDATE: 15000, // 15 seconds
    TRANSACTION_STATUS: 3000, // 3 seconds
  },
} as const;

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get network configuration by chain ID
 */
export function getNetworkConfig(chainId: number) {
  const network = Object.values(NETWORKS).find((n) => n.chainId === chainId);
  if (!network) {
    throw new Error(`Unsupported network: ${chainId}`);
  }
  return network;
}

/**
 * Check if chain ID is supported
 */
export function isSupportedChainId(chainId: number): boolean {
  return WEB3_CONFIG.SUPPORTED_CHAIN_IDS.includes(chainId as any);
}

/**
 * Format address (0x1234...5678)
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format token amount with decimals
 */
export function formatTokenAmount(
  amount: bigint,
  decimals: number = WEB3_CONFIG.DENTIA_DECIMALS
): string {
  const divisor = BigInt(10 ** decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  // Format with 2 decimal places
  const fractionalStr = fractionalPart
    .toString()
    .padStart(decimals, '0')
    .slice(0, 2);
  
  return `${integerPart}.${fractionalStr}`;
}
