/**
 * ⚡ WALLET CONNECT WIDGET - VITALPASS WEB3
 * 
 * Neon-styled Web3 wallet connection component
 * Shows connection status, balance, and address
 * 
 * @author PunkClaude
 */

import React, { useState, useEffect, useRef } from 'react';
import { useWeb3Store } from '../../stores/web3Store';
import { formatAddress } from '../../config/web3';
import './WalletConnect.css';

export const WalletConnect: React.FC = () => {
  const {
    address,
    isConnected,
    balance,
    error,
    isConnecting,
    connectWallet,
    disconnect,
    checkConnection,
    clearError,
  } = useWeb3Store();

  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check for existing connection on mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowMenu(false);
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="wallet-connect-container">
      {/* Error Toast */}
      {error && (
        <div className="wallet-error-toast">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
          <button 
            className="error-close"
            onClick={clearError}
            aria-label="Cerrar error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Disconnected State */}
      {!isConnected && (
        <button
          className="wallet-connect-button neon-button"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <span className="spinner"></span>
              <span>Conectando...</span>
            </>
          ) : (
            <>
              <span className="wallet-icon">🔌</span>
              <span>Conectar Billetera</span>
            </>
          )}
        </button>
      )}

      {/* Connected State */}
      {isConnected && address && (
        <div 
          className="wallet-connected-pill"
          ref={menuRef}
        >
          <div 
            className="pill-content"
            onClick={() => setShowMenu(!showMenu)}
          >
            {/* Balance */}
            <div className="wallet-balance">
              <span className="balance-icon">💎</span>
              <span className="balance-amount">{balance}</span>
            </div>

            {/* Address */}
            <div className="wallet-address">
              <div className="address-dot"></div>
              <span className="address-text">{formatAddress(address)}</span>
            </div>

            {/* Dropdown Arrow */}
            <span className={`dropdown-arrow ${showMenu ? 'open' : ''}`}>
              ▼
            </span>
          </div>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="wallet-menu">
              <button
                className="menu-item copy-item"
                onClick={handleCopyAddress}
              >
                <span className="menu-icon">📋</span>
                <span>{copied ? '¡Copiado!' : 'Copiar Dirección'}</span>
                {copied && <span className="check-icon">✓</span>}
              </button>

              <button
                className="menu-item disconnect-item"
                onClick={handleDisconnect}
              >
                <span className="menu-icon">🔌</span>
                <span>Desconectar</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
