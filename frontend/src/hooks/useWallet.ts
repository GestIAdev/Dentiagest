import { useState, useEffect } from 'react';
import { web3Manager } from '../utils/web3/web3Config';
import { createModuleLogger } from '../utils/logger';

const l = createModuleLogger('useWallet');

export interface WalletState {
  isConnected: boolean;
  account: string | null;
  networkId: number | null;
  isConnecting: boolean;
  balance: string | null;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    account: null,
    networkId: null,
    isConnecting: false,
    balance: null,
  });

  // Función para conectar wallet
  const connectWallet = async (): Promise<boolean> => {
    setWalletState(prev => ({ ...prev, isConnecting: true }));

    try {
      const connected = await web3Manager.connect();
      if (connected) {
        // Cambiar a la red correcta si es necesario
        await web3Manager.switchNetwork();

        // Obtener estado actualizado
        const status = await web3Manager.getConnectionStatus();
        const balance = await web3Manager.getBalance(status.account || undefined);

        setWalletState({
          isConnected: status.isConnected,
          account: status.account,
          networkId: status.networkId,
          isConnecting: false,
          balance,
        });

        return true;
      } else {
        setWalletState(prev => ({ ...prev, isConnecting: false }));
        return false;
      }
    } catch (error) {
      l.error('Error conectando wallet', error instanceof Error ? error : new Error(String(error)));
      setWalletState(prev => ({ ...prev, isConnecting: false }));
      return false;
    }
  };

  // Función para desconectar wallet
  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      account: null,
      networkId: null,
      isConnecting: false,
      balance: null,
    });
  };

  // Función para actualizar balance
  const refreshBalance = async () => {
    if (walletState.account) {
      try {
        const balance = await web3Manager.getBalance(walletState.account);
        setWalletState(prev => ({ ...prev, balance }));
      } catch (error) {
        l.error('Error obteniendo balance', error instanceof Error ? error : new Error(String(error)));
      }
    }
  };

  // Verificar conexión inicial
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await web3Manager.getConnectionStatus();
        if (status.isConnected && status.account) {
          const balance = await web3Manager.getBalance(status.account);
          setWalletState({
            isConnected: status.isConnected,
            account: status.account,
            networkId: status.networkId,
            isConnecting: false,
            balance,
          });
        }
      } catch (error) {
        l.error('Error verificando conexión inicial', error instanceof Error ? error : new Error(String(error)));
      }
    };

    checkConnection();
  }, []);

  // Escuchar cambios en la cuenta de MetaMask
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length > 0) {
          try {
            const balance = await web3Manager.getBalance(accounts[0]);
            setWalletState(prev => ({
              ...prev,
              account: accounts[0],
              balance,
            }));
          } catch (error) {
            setWalletState(prev => ({
              ...prev,
              account: accounts[0],
              balance: null,
            }));
          }
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = (chainId: string) => {
        setWalletState(prev => ({
          ...prev,
          networkId: parseInt(chainId, 16),
        }));
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  };
};
