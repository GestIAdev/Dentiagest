/**
 * Web3 Store - Dentiagest Treasury Metrics
 * 
 * ARQUITECTURA CORRECTA:
 * - Treasury balance = balance DEL contrato REWARDS_VAULT (100M+ DENTIA)
 * - Hot Wallet balance = balance de la wallet operadora de Selene
 * - NO requiere wallet conectada para leer métricas públicas
 * 
 * Usa JsonRpcProvider para lecturas públicas sin MetaMask
 */

import { create } from 'zustand';
import { ethers } from 'ethers';
import { CONTRACTS, NETWORKS, DENTIA_TOKEN_ABI, formatTokenAmount } from '../config/web3';

interface Web3State {
  // Estado de conexión (solo para operaciones que SÍ requieren wallet)
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  
  // MÉTRICAS DEL TESORO - Lectura pública, sin wallet
  treasuryBalance: string;
  treasuryBalanceRaw: bigint;
  hotWalletBalance: string;
  hotWalletBalanceRaw: bigint;
  hotWalletEth: string;
  
  // Loading states
  isLoadingMetrics: boolean;
  metricsError: string | null;
  lastMetricsUpdate: Date | null;
  
  // Acciones
  connect: () => Promise<void>;
  disconnect: () => void;
  fetchTreasuryMetrics: () => Promise<void>;
}

export const useWeb3Store = create<Web3State>((set, get) => ({
  // Estado inicial
  isConnected: false,
  account: null,
  chainId: null,
  
  // Métricas del Tesoro
  treasuryBalance: '0 DENTIA',
  treasuryBalanceRaw: BigInt(0),
  hotWalletBalance: '0 DENTIA',
  hotWalletBalanceRaw: BigInt(0),
  hotWalletEth: '0 ETH',
  
  // Loading
  isLoadingMetrics: false,
  metricsError: null,
  lastMetricsUpdate: null,
  
  /**
   * Conectar wallet (opcional, solo para operaciones de escritura)
   */
  connect: async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        console.warn('[Web3Store] MetaMask no detectado - modo read-only');
        return;
      }
      
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      
      set({ 
        isConnected: true, 
        account: accounts[0],
        chainId: parseInt(chainId as string, 16)
      });
      
      console.log('[Web3Store] Wallet conectada:', accounts[0]);
      
    } catch (error) {
      console.error('[Web3Store] Error conectando wallet:', error);
    }
  },
  
  /**
   * Desconectar wallet
   */
  disconnect: () => {
    set({ 
      isConnected: false, 
      account: null,
      chainId: null 
    });
  },
  
  /**
   * FETCH TREASURY METRICS - Lectura pública
   * 
   * Lee balances ON-CHAIN sin necesidad de wallet conectada.
   * Usa JsonRpcProvider público para queries de solo lectura.
   */
  fetchTreasuryMetrics: async () => {
    set({ isLoadingMetrics: true, metricsError: null });
    
    try {
      // Provider público - NO requiere MetaMask
      const provider = new ethers.JsonRpcProvider(NETWORKS.SEPOLIA.rpcUrl);
      const chainId = NETWORKS.SEPOLIA.chainId;
      
      // Direcciones de contratos
      const tokenAddress = CONTRACTS.DENTIA_TOKEN[chainId];
      const treasuryAddress = CONTRACTS.TREASURY[chainId];
      const hotWalletAddress = CONTRACTS.HOT_WALLET[chainId];
      
      if (!tokenAddress || !treasuryAddress || !hotWalletAddress) {
        throw new Error('Direcciones de contratos no configuradas para chainId: ' + chainId);
      }
      
      // Instanciar contrato ERC20 (solo lectura)
      const tokenContract = new ethers.Contract(tokenAddress, DENTIA_TOKEN_ABI, provider);
      
      // LECTURA 1: Balance DEL Treasury (REWARDS_VAULT)
      // Esto lee cuántos DENTIA tiene el contrato del tesoro
      const treasuryBalanceRaw: bigint = await tokenContract.balanceOf(treasuryAddress);
      
      // LECTURA 2: Balance del Hot Wallet (Selene operator)
      const hotWalletBalanceRaw: bigint = await tokenContract.balanceOf(hotWalletAddress);
      
      // LECTURA 3: ETH del Hot Wallet (para gas)
      const hotWalletEthRaw = await provider.getBalance(hotWalletAddress);
      
      // Formatear para UI
      const treasuryFormatted = formatTokenAmount(treasuryBalanceRaw);
      const hotWalletFormatted = formatTokenAmount(hotWalletBalanceRaw);
      const hotWalletEthFormatted = ethers.formatEther(hotWalletEthRaw);
      
      console.log('[Web3Store] Treasury Metrics actualizadas:', {
        treasury: treasuryFormatted + ' DENTIA',
        hotWallet: hotWalletFormatted + ' DENTIA',
        hotWalletEth: hotWalletEthFormatted + ' ETH'
      });
      
      set({
        treasuryBalance: treasuryFormatted + ' DENTIA',
        treasuryBalanceRaw,
        hotWalletBalance: hotWalletFormatted + ' DENTIA',
        hotWalletBalanceRaw,
        hotWalletEth: parseFloat(hotWalletEthFormatted).toFixed(4) + ' ETH',
        isLoadingMetrics: false,
        lastMetricsUpdate: new Date()
      });
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[Web3Store] Error fetching treasury metrics:', error);
      
      set({ 
        isLoadingMetrics: false,
        metricsError: errorMsg
      });
    }
  }
}));

// Type declaration para window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}
