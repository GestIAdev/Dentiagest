/**
 * ⚡ WEB3 STORE - VITALPASS GENESIS
 * 
 * Zustand store for Ethereum wallet management using ethers.js v6
 * 
 * Features:
 * - MetaMask connection/disconnection
 * - Network validation (Mainnet/Sepolia only)
 * - Account change detection
 * - Chain change detection
 * - Abuela-friendly error messages
 * 
 * @author PunkClaude
 * @architecture Web3 Foundation for VitalPass
 */

import { create } from 'zustand';
import { ethers } from 'ethers';
import { 
  CONTRACTS, 
  DENTIA_TOKEN_ABI, 
  formatTokenAmount,
  NETWORKS 
} from '../config/web3';

// ═══════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════

interface Web3State {
  // Connection state
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  
  // Provider & Signer
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  
  // Balance (Mock for now - will be DENTIA token later)
  balance: string;
  
  // Error handling
  error: string | null;
  
  // Loading state
  isConnecting: boolean;
}

interface Web3Actions {
  connectWallet: () => Promise<void>;
  checkConnection: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (targetChainId: number) => Promise<void>;
  clearError: () => void;
  fetchTokenBalance: () => Promise<void>; // NEW: Fetch DENTIA balance
  
  // Event handlers (internal)
  handleAccountsChanged: (accounts: string[]) => void;
  handleChainChanged: (chainIdHex: string) => void;
}

type Web3Store = Web3State & Web3Actions;

// ═══════════════════════════════════════════════════════════
// CONSTANTS & CONFIG
// ═══════════════════════════════════════════════════════════

const SUPPORTED_NETWORKS = {
  MAINNET: 1,
  SEPOLIA: 11155111,
} as const;

const NETWORK_NAMES: Record<number, string> = {
  [SUPPORTED_NETWORKS.MAINNET]: 'Ethereum Mainnet',
  [SUPPORTED_NETWORKS.SEPOLIA]: 'Sepolia Testnet',
};

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Check if MetaMask is installed
 */
function isMetaMaskInstalled(): boolean {
  const { ethereum } = window as any;
  return Boolean(ethereum && ethereum.isMetaMask);
}

/**
 * Check if network is supported
 */
function isSupportedNetwork(chainId: number): boolean {
  return Object.values(SUPPORTED_NETWORKS).includes(chainId as any);
}

/**
 * Get user-friendly error message (Abuela-Friendly™)
 */
function getErrorMessage(error: any): string {
  if (error?.code === 4001) {
    return 'Conexión rechazada. Por favor acepta la solicitud en MetaMask para continuar.';
  }
  
  if (error?.code === -32002) {
    return 'Ya hay una solicitud pendiente en MetaMask. Por favor revisa tu extensión.';
  }
  
  if (error?.message?.includes('network')) {
    return 'Error de red. Por favor verifica tu conexión a Internet.';
  }
  
  return 'Ocurrió un error inesperado. Por favor intenta nuevamente.';
}

// ═══════════════════════════════════════════════════════════
// ZUSTAND STORE
// ═══════════════════════════════════════════════════════════

export const useWeb3Store = create<Web3Store>((set, get) => ({
  // ─────────────────────────────────────────────────────────
  // INITIAL STATE
  // ─────────────────────────────────────────────────────────
  address: null,
  isConnected: false,
  chainId: null,
  provider: null,
  signer: null,
  balance: '0 DENTIA', // Mock balance for Phase 1
  error: null,
  isConnecting: false,

  // ─────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────

  /**
   * Connect wallet (MetaMask)
   * Requests accounts and initializes provider/signer
   */
  connectWallet: async () => {
    console.log('🔌 VitalPass: Initiating wallet connection...');
    
    try {
      set({ isConnecting: true, error: null });

      // Check MetaMask installation
      if (!isMetaMaskInstalled()) {
        throw new Error('Por favor instala MetaMask para continuar. Visita https://metamask.io');
      }

      const { ethereum } = window as any;
      
      // Request accounts
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No se encontraron cuentas. Por favor desbloquea MetaMask.');
      }

      const address = accounts[0];
      console.log('✅ Wallet connected:', address);

      // Initialize provider and signer
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      console.log('🌐 Network detected:', NETWORK_NAMES[chainId] || `Unknown (${chainId})`);

      // Validate network
      if (!isSupportedNetwork(chainId)) {
        set({ 
          error: `Red no soportada. Por favor cambia a ${NETWORK_NAMES[SUPPORTED_NETWORKS.SEPOLIA]} o ${NETWORK_NAMES[SUPPORTED_NETWORKS.MAINNET]}`,
          isConnecting: false 
        });
        
        // Optionally auto-switch to Sepolia
        console.log('⚠️ Unsupported network, requesting switch to Sepolia...');
        await get().switchNetwork(SUPPORTED_NETWORKS.SEPOLIA);
        return;
      }

      // Update state
      set({
        address,
        isConnected: true,
        chainId,
        provider,
        signer,
        error: null,
        isConnecting: false,
      });

      console.log('🎉 VitalPass Web3 connection established!');

      // Fetch DENTIA balance from blockchain
      await get().fetchTokenBalance();

      // Setup event listeners
      ethereum.on('accountsChanged', get().handleAccountsChanged);
      ethereum.on('chainChanged', get().handleChainChanged);

    } catch (error: any) {
      console.error('❌ Wallet connection error:', error);
      const errorMessage = getErrorMessage(error);
      
      set({ 
        error: errorMessage,
        isConnecting: false,
        isConnected: false,
        address: null,
        provider: null,
        signer: null,
      });
    }
  },

  /**
   * Check if wallet is already connected (on app load)
   */
  checkConnection: async () => {
    console.log('🔍 VitalPass: Checking existing wallet connection...');

    try {
      if (!isMetaMaskInstalled()) {
        console.log('⚠️ MetaMask not installed');
        return;
      }

      const { ethereum } = window as any;
      
      // Check if already connected
      const accounts = await ethereum.request({ 
        method: 'eth_accounts' 
      }) as string[];

      if (accounts && accounts.length > 0) {
        console.log('🔗 Existing connection found, reconnecting...');
        await get().connectWallet();
      } else {
        console.log('ℹ️ No existing connection found');
      }
    } catch (error) {
      console.error('❌ Check connection error:', error);
      // Silent fail - user can manually connect
    }
  },

  /**
   * Disconnect wallet (UI only - doesn't revoke MetaMask permission)
   */
  disconnect: () => {
    console.log('🔌 VitalPass: Disconnecting wallet...');

    const { ethereum } = window as any;
    if (ethereum) {
      // Remove event listeners
      ethereum.removeListener('accountsChanged', get().handleAccountsChanged);
      ethereum.removeListener('chainChanged', get().handleChainChanged);
    }

    // Reset state
    set({
      address: null,
      isConnected: false,
      chainId: null,
      provider: null,
      signer: null,
      balance: '0 DENTIA',
      error: null,
      isConnecting: false,
    });

    console.log('✅ Wallet disconnected');
  },

  /**
   * Switch to a different network
   */
  switchNetwork: async (targetChainId: number) => {
    console.log(`🔄 Switching to network ${NETWORK_NAMES[targetChainId] || targetChainId}...`);

    try {
      if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask no encontrado');
      }

      const { ethereum } = window as any;
      const chainIdHex = `0x${targetChainId.toString(16)}`;

      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });

      console.log('✅ Network switched successfully');

    } catch (error: any) {
      console.error('❌ Network switch error:', error);

      // If network not added, add it (Sepolia example)
      if (error.code === 4902 && targetChainId === SUPPORTED_NETWORKS.SEPOLIA) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${SUPPORTED_NETWORKS.SEPOLIA.toString(16)}`,
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://1rpc.io/sepolia'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            }],
          });
        } catch (addError) {
          console.error('❌ Failed to add network:', addError);
          set({ error: 'No se pudo agregar la red. Por favor agrega Sepolia manualmente en MetaMask.' });
        }
      } else {
        set({ error: getErrorMessage(error) });
      }
    }
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Fetch DENTIA token balance from blockchain
   */
  fetchTokenBalance: async () => {
    const { provider, address, chainId } = get();
    
    if (!provider || !address || !chainId) {
      console.warn('⚠️ Cannot fetch balance: wallet not connected');
      return;
    }

    try {
      // Get contract address for current network
      const tokenAddress = CONTRACTS.DENTIA_TOKEN[chainId as keyof typeof CONTRACTS.DENTIA_TOKEN];
      
      if (!tokenAddress) {
        console.warn(`⚠️ DENTIA token not deployed on chain ${chainId}`);
        set({ balance: '0 DENTIA' });
        return;
      }

      // Create contract instance
      const tokenContract = new ethers.Contract(
        tokenAddress,
        DENTIA_TOKEN_ABI,
        provider
      );

      // Fetch balance
      console.log('🔍 Fetching DENTIA balance for:', address);
      const balanceWei = await tokenContract.balanceOf(address);
      
      // Format balance (18 decimals)
      const balanceFormatted = formatTokenAmount(balanceWei);
      
      console.log('💰 DENTIA Balance:', balanceFormatted);
      
      set({ balance: `${balanceFormatted} DENTIA` });

    } catch (error) {
      console.error('❌ Error fetching token balance:', error);
      set({ balance: '0 DENTIA' }); // Fallback to 0 on error
    }
  },

  // ─────────────────────────────────────────────────────────
  // EVENT HANDLERS (Private methods accessed via get())
  // ─────────────────────────────────────────────────────────

  handleAccountsChanged: (accounts: string[]) => {
    console.log('🔄 Accounts changed:', accounts);

    if (accounts.length === 0) {
      // User disconnected from MetaMask
      console.log('🔌 User disconnected all accounts');
      get().disconnect();
    } else {
      // User switched accounts
      console.log('🔄 Account switched, reconnecting...');
      get().connectWallet(); // This will also fetch the new balance
    }
  },

  handleChainChanged: (chainIdHex: string) => {
    const chainId = parseInt(chainIdHex, 16);
    console.log('🔄 Chain changed:', NETWORK_NAMES[chainId] || chainId);

    // Reload page on chain change (recommended by MetaMask)
    window.location.reload();
  },
}));

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export { SUPPORTED_NETWORKS, NETWORK_NAMES };
export type { Web3State, Web3Actions };
