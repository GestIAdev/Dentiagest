/**
 * ⚡ WEB3 CONFIGURATION - VITALPASS
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
  REWARDS_VAULT: {
    [NETWORKS.MAINNET.chainId]: '',
    // Sepolia testnet address (LIVE ✅)
    [NETWORKS.SEPOLIA.chainId]: '0x30f21027Abe424AfAFe3DBE0c7BC842C1Ea86B3f',
  },
  STAKING_POOL: {
    [NETWORKS.MAINNET.chainId]: '',
    [NETWORKS.SEPOLIA.chainId]: '', // Future feature
  },
} as const;

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
 * Get contract address for current network
 */
export function getContractAddress(
  contractName: keyof typeof CONTRACTS,
  chainId: number
): string {
  const address = CONTRACTS[contractName][chainId as keyof typeof CONTRACTS[typeof contractName]];
  
  if (!address) {
    throw new Error(`Contract ${contractName} not deployed on chain ${chainId}`);
  }
  
  return address;
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
export function formatTokenAmount(amount: bigint, decimals: number = WEB3_CONFIG.DENTIA_DECIMALS): string {
  const divisor = BigInt(10 ** decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  // Format with 2 decimal places
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0').slice(0, 2);
  
  return `${integerPart}.${fractionalStr}`;
}

/**
 * Parse token amount to wei
 */
export function parseTokenAmount(amount: string, decimals: number = WEB3_CONFIG.DENTIA_DECIMALS): bigint {
  const [integerStr = '0', fractionalStr = '0'] = amount.split('.');
  const fractional = fractionalStr.padEnd(decimals, '0').slice(0, decimals);
  const combined = integerStr + fractional;
  
  return BigInt(combined);
}

// ═══════════════════════════════════════════════════════════
// CONTRACT ABIs (Minimal for reading balance)
// ═══════════════════════════════════════════════════════════

/**
 * DentiaCoin ERC-20 ABI (minimal interface for frontend)
 */
export const DENTIA_TOKEN_ABI = [
  // Read functions
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  // Write functions
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
] as const;

/**
 * DentiaRewards ABI (minimal interface for frontend)
 */
export const DENTIA_REWARDS_ABI = [
  // Read functions
  {
    constant: true,
    inputs: [{ name: '', type: 'address' }],
    name: 'totalRewardsReceived',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '', type: 'address' }],
    name: 'lastRewardTimestamp',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'patient', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'reason', type: 'string' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'RewardDistributed',
    type: 'event',
  },
] as const;
