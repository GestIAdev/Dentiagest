// Simple useOfflineCapabilities hook
import { useState, useEffect, useCallback } from 'react';

export interface OfflineCapabilitiesState {
  isOnline: boolean;
  storageAvailable: boolean;
  isSyncing: boolean;
  lastError: string | null;
}

export interface UseOfflineCapabilitiesReturn extends OfflineCapabilitiesState {
  refreshCapabilities: () => Promise<void>;
  checkConnectivity: () => Promise<boolean>;
  canPerformOffline: (operation: string) => boolean;
}

export const useOfflineCapabilities = (): UseOfflineCapabilitiesReturn => {
  const [state, setState] = useState<OfflineCapabilitiesState>({
    isOnline: navigator.onLine,
    storageAvailable: false,
    isSyncing: false,
    lastError: null
  });

  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    const isOnline = navigator.onLine;
    setState(prev => ({ ...prev, isOnline }));
    return isOnline;
  }, []);

  const refreshCapabilities = useCallback(async (): Promise<void> => {
    await checkConnectivity();
    setState(prev => ({ ...prev, storageAvailable: true }));
  }, [checkConnectivity]);

  const canPerformOffline = useCallback((operation: string): boolean => {
    return state.storageAvailable;
  }, [state.storageAvailable]);

  useEffect(() => {
    refreshCapabilities();
  }, [refreshCapabilities]);

  return {
    ...state,
    refreshCapabilities,
    checkConnectivity,
    canPerformOffline
  };
};
