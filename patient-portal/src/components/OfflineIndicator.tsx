// 🔔 OFFLINE INDICATOR V200 - USER AWARENESS COMPONENT
// 🔥 PUNK PHILOSOPHY: CHALLENGE ESTABLISHMENT - DIGITAL RESISTANCE

import React, { useState, useEffect } from 'react';
import { WifiIcon, SignalSlashIcon, CloudIcon } from '@heroicons/react/24/outline';

// 🎯 PUNK CONSTANTS - INTEGRATED THROUGHOUT
const PUNK_CONSTANTS = {
  CODE_AS_ART: "Each line is elegant, efficient, powerful",
  SPEED_AS_WEAPON: "Prioritize execution fast and direct",
  CHALLENGE_ESTABLISHMENT: "No fear of unconventional solutions",
  INDEPENDENCE_ZERO_DEPENDENCIES: "Zero corporate dependencies",
  DEMOCRACY_THROUGH_CODE: "Equal access for all",
  DIGITAL_RESISTANCE: "Works when corporations fail"
};

// 🎨 CYBERPUNK COLOR PALETTE
const CYBERPUNK_COLORS = {
  neonGreen: '#00ff88',
  neonBlue: '#0088ff',
  neonPink: '#ff0088',
  darkBg: '#0a0a0a',
  darkGray: '#1a1a1a',
  lightGray: '#333333',
  textPrimary: '#ffffff',
  textSecondary: '#cccccc'
};

interface OfflineIndicatorProps {
  showDetails?: boolean;
  position?: 'top' | 'bottom';
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showDetails = true,
  position = 'top',
  className = ''
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [pendingOperations, setPendingOperations] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('good');

  // 🌐 ONLINE/OFFLINE DETECTION - REAL-TIME MONITORING
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionQuality('good');
      updateOnlineStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality('offline');
      updateOnlineStatus();
    };

    // Connection quality monitoring
    const checkConnectionQuality = async () => {
      if (!navigator.onLine) {
        setConnectionQuality('offline');
        return;
      }

      try {
        const startTime = Date.now();
        const response = await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' });
        const endTime = Date.now();
        const latency = endTime - startTime;

        if (latency < 100) setConnectionQuality('excellent');
        else if (latency < 500) setConnectionQuality('good');
        else setConnectionQuality('poor');
      } catch (error) {
        setConnectionQuality('poor');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial connection quality check
    checkConnectionQuality();

    // Periodic connection quality monitoring
    const qualityInterval = setInterval(checkConnectionQuality, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(qualityInterval);
    };
  }, []);

  // 🔄 UPDATE ONLINE STATUS - COMPREHENSIVE MONITORING
  const updateOnlineStatus = async () => {
    try {
      // Check for pending operations (this would integrate with actual storage)
      // For now, simulate based on localStorage or a global state
      const pending = parseInt(localStorage.getItem('pendingOperations') || '0');
      setPendingOperations(pending);

      // Update sync status based on operations
      if (pending > 0 && isOnline) {
        setSyncStatus('syncing');
        // Simulate sync completion
        setTimeout(() => {
          setSyncStatus('idle');
          setLastSyncTime(new Date());
          localStorage.setItem('pendingOperations', '0');
          setPendingOperations(0);
        }, 2000);
      } else if (pending > 0 && !isOnline) {
        setSyncStatus('idle'); // Waiting for connection
      } else {
        setSyncStatus('idle');
      }
    } catch (error) {
      setSyncStatus('error');
    }
  };

  // 🎨 CYBERPUNK STYLING - VISUAL DOMINATION
  const getStatusColor = () => {
    if (!isOnline) return {
      bg: `linear-gradient(135deg, ${CYBERPUNK_COLORS.neonPink}, ${CYBERPUNK_COLORS.neonBlue})`,
      text: CYBERPUNK_COLORS.textPrimary,
      border: CYBERPUNK_COLORS.neonPink,
      shadow: `0 0 20px ${CYBERPUNK_COLORS.neonPink}40`
    };

    switch (syncStatus) {
      case 'syncing':
        return {
          bg: `linear-gradient(135deg, ${CYBERPUNK_COLORS.neonBlue}, ${CYBERPUNK_COLORS.neonGreen})`,
          text: CYBERPUNK_COLORS.textPrimary,
          border: CYBERPUNK_COLORS.neonBlue,
          shadow: `0 0 20px ${CYBERPUNK_COLORS.neonBlue}40`
        };
      case 'error':
        return {
          bg: `linear-gradient(135deg, #ff4444, ${CYBERPUNK_COLORS.neonPink})`,
          text: CYBERPUNK_COLORS.textPrimary,
          border: '#ff4444',
          shadow: `0 0 20px #ff444440`
        };
      default:
        return {
          bg: `linear-gradient(135deg, ${CYBERPUNK_COLORS.neonGreen}, ${CYBERPUNK_COLORS.neonBlue})`,
          text: CYBERPUNK_COLORS.textPrimary,
          border: CYBERPUNK_COLORS.neonGreen,
          shadow: `0 0 20px ${CYBERPUNK_COLORS.neonGreen}40`
        };
    }
  };

  const getConnectionQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return CYBERPUNK_COLORS.neonGreen;
      case 'good': return CYBERPUNK_COLORS.neonBlue;
      case 'poor': return '#ffa500';
      case 'offline': return CYBERPUNK_COLORS.neonPink;
      default: return CYBERPUNK_COLORS.lightGray;
    }
  };

  const getStatusIcon = () => {
    if (!isOnline) return <SignalSlashIcon className="w-4 h-4" />;
    if (syncStatus === 'syncing') return <CloudIcon className="w-4 h-4 animate-pulse" />;
    return <WifiIcon className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'MODO OFFLINE';
    if (syncStatus === 'syncing') return 'SINCRONIZANDO...';
    if (syncStatus === 'error') return 'ERROR DE SINCRONIZACIÓN';
    return 'CONECTADO';
  };

  const getConnectionQualityText = () => {
    switch (connectionQuality) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Buena';
      case 'poor': return 'Débil';
      case 'offline': return 'Sin conexión';
      default: return 'Desconocida';
    }
  };

  const styles = getStatusColor();

  return (
    <div className={`fixed ${position === 'top' ? 'top-4' : 'bottom-4'} right-4 z-50 ${className}`}>
      <div
        className={`
          px-4 py-3 rounded-lg shadow-xl border-2 transition-all duration-300
          ${!isOnline ? 'animate-pulse' : ''}
        `}
        style={{
          background: styles.bg,
          color: styles.text,
          borderColor: styles.border,
          boxShadow: styles.shadow
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <div>
              <div className="text-sm font-bold tracking-wider">
                {getStatusText()}
              </div>
              <div
                className="text-xs opacity-80"
                style={{ color: getConnectionQualityColor() }}
              >
                {getConnectionQualityText()}
              </div>
            </div>
          </div>

          {showDetails && pendingOperations > 0 && (
            <div className="bg-black bg-opacity-30 px-2 py-1 rounded text-xs font-mono">
              {pendingOperations} pendientes
            </div>
          )}

          {lastSyncTime && (
            <div className="text-xs opacity-60">
              Última sync: {lastSyncTime.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Detailed status panel */}
        {showDetails && !isOnline && (
          <div
            className="mt-3 p-3 rounded-lg border"
            style={{
              backgroundColor: CYBERPUNK_COLORS.darkGray,
              borderColor: CYBERPUNK_COLORS.neonPink,
              borderWidth: '1px'
            }}
          >
            <h4 className="font-bold text-sm mb-2 flex items-center">
              <span className="mr-2">🛡️</span>
              MODO OFFLINE ACTIVO
            </h4>
            <ul className="text-xs space-y-1" style={{ color: CYBERPUNK_COLORS.textSecondary }}>
              <li className="flex items-center">
                <span className="mr-2" style={{ color: CYBERPUNK_COLORS.neonGreen }}>✅</span>
                Datos locales disponibles
              </li>
              <li className="flex items-center">
                <span className="mr-2" style={{ color: CYBERPUNK_COLORS.neonBlue }}>🔄</span>
                {pendingOperations > 0 ? `${pendingOperations} operaciones en cola` : 'Auto-sync al reconectar'}
              </li>
              <li className="flex items-center">
                <span className="mr-2" style={{ color: CYBERPUNK_COLORS.neonPink }}>🛡️</span>
                Veritas offline proof activo
              </li>
              <li className="flex items-center">
                <span className="mr-2" style={{ color: CYBERPUNK_COLORS.neonGreen }}>⚡</span>
                Carga instantánea desde cache
              </li>
              <li className="flex items-center">
                <span className="mr-2" style={{ color: CYBERPUNK_COLORS.neonBlue }}>📱</span>
                PWA nativa instalable
              </li>
              <li className="flex items-center">
                <span className="mr-2" style={{ color: CYBERPUNK_COLORS.neonPink }}>🔔</span>
                Notificaciones offline
              </li>
              <li className="flex items-center">
                <span className="mr-2" style={{ color: CYBERPUNK_COLORS.neonGreen }}>💾</span>
                Almacenamiento IndexedDB
              </li>
            </ul>

            <div className="mt-3 pt-2 border-t" style={{ borderColor: CYBERPUNK_COLORS.lightGray }}>
              <p className="text-xs italic" style={{ color: CYBERPUNK_COLORS.neonBlue }}>
                "INDEPENDENCE FROM ZERO DEPENDENCIES - DIGITAL RESISTANCE"
              </p>
            </div>
          </div>
        )}

        {/* Syncing animation overlay */}
        {syncStatus === 'syncing' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <CloudIcon className="w-4 h-4 animate-bounce" />
              <span className="text-xs font-mono">SYNCING...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 🎭 PUNK PHILOSOPHY INTEGRATION
// "CHALLENGE ESTABLISHMENT - DIGITAL RESISTANCE"
// This component challenges the corporate internet dependency paradigm