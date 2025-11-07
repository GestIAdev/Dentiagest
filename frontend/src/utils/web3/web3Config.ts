/**
 * 🌐 WEB3 CONFIGURATION - APOLLO DENTAL CRYPTO SYSTEM
 * Configuración simplificada usando ethers.js para evitar conflictos
 *
 * 🎯 MISSION: Conectar el frontend con los smart contracts
 * ✅ Configuración ethers.js
 * ✅ ABIs de contratos
 * ✅ Direcciones de contratos
 * ✅ Funciones de conexión
 *
 * @author PunkClaude Cyberanarchist & RaulVisionario UX Emperor
 * @version 2.0.0
 * @date September 19, 2025
 */

import { ethers } from 'ethers';
import React from 'react';
import { createModuleLogger } from '../..//utils/logger';

// 🏆 CONFIGURACIÓN DE RED
export const NETWORK_CONFIG = {
  chainId: 11155111, // Sepolia Testnet
  chainName: 'Sepolia Testnet',
  rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'SEP',
    decimals: 18,
  },
};

// 📋 DIRECCIONES DE CONTRATOS (TESTNET)
// NOTA: Estas son direcciones placeholder. Reemplazar con direcciones reales después del despliegue
export const CONTRACT_ADDRESSES = {
  dentalCoin: process.env.REACT_APP_DENTAL_COIN_ADDRESS || '0x0000000000000000000000000000000000000000',
  oralHygieneToken: process.env.REACT_APP_ORAL_HYGIENE_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
  paymentSystem: process.env.REACT_APP_PAYMENT_SYSTEM_ADDRESS || '0x0000000000000000000000000000000000000000',
};

// 🔧 ABIs DE CONTRATOS
export const DENTAL_COIN_ABI = [
  // ERC-20 Standard
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  "function transferFrom(address, address, uint256) returns (bool)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",

  // DentalCoin Specific
  "function recordDentalServicePayment(address, address, uint256) external",
  "function distributeCommunityReward(address, uint256, string) external",
  "function getTokenStats() view returns (uint256, uint256, uint256, uint256, uint256)",
  "function calculateAmountAfterBurn(uint256) pure returns (uint256, uint256)",

  // Events
  "event Transfer(address indexed, address indexed, uint256)",
  "event DentalServicePayment(address indexed, address indexed, uint256)",
  "event CommunityRewardDistributed(address indexed, uint256)",
];

export const ORAL_HYGIENE_TOKEN_ABI = [
  // ERC-20 Standard
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",

  // Oral Hygiene Specific
  "function recordBrushing(address) external",
  "function recordWeeklyCheckup(address, uint256) external",
  "function grantMonthlyMaintenanceReward(address) external",
  "function recordReferral(address, address) external",
  "function stakeTokens(uint256) external",
  "function unstakeTokens(uint256) external",
  "function getHygieneRecord(address) view returns (tuple(uint256, uint256, uint256, uint256, uint256, uint256, bool))",
  "function getReferralRecord(address) view returns (tuple(address, uint256, uint256, bool))",
  "function calculateStakingRewards(address) view returns (uint256)",

  // Events
  "event HygieneRewardClaimed(address indexed, uint256, string)",
  "event ReferralRewardEarned(address indexed, address indexed, uint256)",
  "event TokensStaked(address indexed, uint256)",
  "event TokensUnstaked(address indexed, uint256, uint256)",
];

export const PAYMENT_SYSTEM_ABI = [
  // Payment Functions
  "function processTreatmentPayment(address, address, uint256, bool) payable returns (uint256)",
  "function processSubscriptionPayment(address, uint256, uint256) payable returns (uint256)",
  "function redeemLoyaltyPoints(uint256, uint256) returns (uint256)",
  "function processRefund(uint256, uint256, string) external",

  // View Functions
  "function getLoyaltyAccount(address) view returns (tuple(uint256, uint256, uint256, uint256, bool))",
  "function getPatientPaymentHistory(address) view returns (uint256[])",
  "function getDentistEarningsHistory(address) view returns (uint256[])",
  "function getTreatmentPayment(uint256) view returns (tuple(uint256, address, address, uint256, uint256, uint256, bool, uint256, uint256, uint8))",
  "function getSystemStats() view returns (uint256, uint256, uint256)",

  // Events
  "event TreatmentPaymentProcessed(uint256 indexed, address indexed, address indexed, uint256, uint256, bool)",
  "event SubscriptionPaymentProcessed(uint256 indexed, address indexed, uint256, uint256, uint256)",
  "event LoyaltyPointsEarned(address indexed, uint256, string)",
  "event LoyaltyPointsRedeemed(address indexed, uint256, uint256)",
];

// 🌐 CLASE WEB3 MANAGER SIMPLIFICADA
export class Web3Manager {
  private logger = createModuleLogger('Web3Config');
  private provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null;
  private signer: ethers.Signer | null = null;
  private isConnected = false;

  // 🔌 CONEXIÓN A WEB3
  async connect(): Promise<boolean> {
    try {
      // Verificar si MetaMask está disponible
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        this.provider = new ethers.BrowserProvider((window as any).ethereum);

        // Solicitar acceso a las cuentas
        await (window as any).ethereum.request({
          method: 'eth_requestAccounts'
        });

        this.signer = await this.provider.getSigner();
        this.isConnected = true;

        this.logger.info('Conectado a Web3', { account: await this.signer.getAddress() });
        return true;
      } else {
        this.logger.warn('MetaMask no detectado. Usando provider local.');
        // Fallback a provider local
        this.provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        this.signer = await this.provider.getSigner();
        this.isConnected = true;
        return true;
      }
    } catch (error) {
      const e = error instanceof Error ? error : new Error(String(error));
      this.logger.error('❌ Error conectando a Web3', e);
      return false;
    }
  }

  // 📊 OBTENER ESTADO DE CONEXIÓN
  async getConnectionStatus(): Promise<{
    isConnected: boolean;
    account: string | null;
    networkId: number | null;
  }> {
    if (!this.provider) {
      return {
        isConnected: false,
        account: null,
        networkId: null,
      };
    }

    try {
      const network = await this.provider.getNetwork();
      const account = this.signer ? await this.signer.getAddress() : null;

      return {
        isConnected: this.isConnected,
        account,
        networkId: Number(network.chainId),
      };
    } catch (error) {
      return {
        isConnected: false,
        account: null,
        networkId: null,
      };
    }
  }

  // 🎯 OBTENER INSTANCIA DE CONTRATO
  getContract(contractType: 'dentalCoin' | 'oralHygieneToken' | 'paymentSystem') {
    if (!this.provider || !this.isConnected) {
      throw new Error('Web3 no conectado');
    }

    let abi: any[];
    let address: string;

    switch (contractType) {
      case 'dentalCoin':
        abi = DENTAL_COIN_ABI;
        address = CONTRACT_ADDRESSES.dentalCoin;
        break;
      case 'oralHygieneToken':
        abi = ORAL_HYGIENE_TOKEN_ABI;
        address = CONTRACT_ADDRESSES.oralHygieneToken;
        break;
      case 'paymentSystem':
        abi = PAYMENT_SYSTEM_ABI;
        address = CONTRACT_ADDRESSES.paymentSystem;
        break;
      default:
        throw new Error('Tipo de contrato no válido');
    }

    return new ethers.Contract(address, abi, this.signer || this.provider);
  }

  // 💰 OBTENER BALANCE DE CUENTA
  async getBalance(account?: string): Promise<string> {
    if (!this.provider) throw new Error('Web3 no inicializado');

    const targetAccount = account || (this.signer ? await this.signer.getAddress() : '');
    if (!targetAccount) throw new Error('No hay cuenta disponible');

    const balance = await this.provider.getBalance(targetAccount);
    return ethers.formatEther(balance);
  }

  // 🔄 CAMBIAR DE RED
  async switchNetwork(): Promise<boolean> {
    if (!(window as any).ethereum) return false;

    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
      });
      return true;
    } catch (error: any) {
      // Si la red no existe, intentar añadirla
      if (error.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_CONFIG],
          });
          return true;
        } catch (addError) {
          const e = addError instanceof Error ? addError : new Error(String(addError));
          this.logger.error('❌ Error añadiendo red', e);
          return false;
        }
      }
      const e = error instanceof Error ? error : new Error(String(error));
      this.logger.error('❌ Error cambiando red', e);
      return false;
    }
  }

  // 📤 ENVIAR TRANSACCIÓN
  async sendTransaction(to: string, value: string): Promise<any> {
    if (!this.signer) {
      throw new Error('Web3 no conectado o sin signer');
    }

    const tx = await this.signer.sendTransaction({
      to,
      value: ethers.parseEther(value),
    });

    return await tx.wait();
  }

  // 🎫 ESCUCHAR EVENTOS DE CONTRATO
  listenToContractEvents(
    contractType: 'dentalCoin' | 'oralHygieneToken' | 'paymentSystem',
    eventName: string,
    callback: (event: any) => void
  ) {
    const contract = this.getContract(contractType);
    contract.on(eventName, callback);
  }
}

// 🌟 INSTANCIA GLOBAL
export const web3Manager = new Web3Manager();

// 🔧 FUNCIONES DE UTILIDAD
export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTokenAmount = (amount: string, decimals: number = 18): string => {
  return ethers.formatUnits(amount, decimals);
};

export const parseTokenAmount = (amount: string, decimals: number = 18): string => {
  return ethers.parseUnits(amount, decimals).toString();
};

// 📊 HOOKS DE REACT PARA WEB3
export const useWeb3Connection = () => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [account, setAccount] = React.useState<string | null>(null);
  const [networkId, setNetworkId] = React.useState<number | null>(null);

  React.useEffect(() => {
    const connectWeb3 = async () => {
      const connected = await web3Manager.connect();
      if (connected) {
        const status = await web3Manager.getConnectionStatus();
        setIsConnected(status.isConnected);
        setAccount(status.account);
        setNetworkId(status.networkId);
      }
    };

    connectWeb3();
  }, []);

  return { isConnected, account, networkId };
};

export default web3Manager;
