// 📲 PWA INSTALL PROMPT V200 - NATIVE APP EXPERIENCE
// 🔥 PUNK PHILOSOPHY: INDEPENDENCE FROM ZERO DEPENDENCIES

import React, { useState, useEffect } from 'react';
import { DevicePhoneMobileIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

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
  neonPurple: '#8800ff',
  darkBg: '#0a0a0a',
  darkGray: '#1a1a1a',
  lightGray: '#333333',
  textPrimary: '#ffffff',
  textSecondary: '#cccccc'
};

interface PWAInstallPromptProps {
  className?: string;
  autoShow?: boolean;
  showDelay?: number; // Delay before showing prompt (ms)
  dismissDuration?: number; // How long to hide after dismiss (ms)
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  className = '',
  autoShow = true,
  showDelay = 3000,
  dismissDuration = 86400000 // 24 hours
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installOutcome, setInstallOutcome] = useState<'accepted' | 'dismissed' | null>(null);

  // 📱 PWA INSTALLATION DETECTION - NATIVE APP CAPABILITIES
  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInstalled = isStandalone || isInWebAppiOS;

      setIsInstalled(isInstalled);

      if (isInstalled) {
        // Clear any stored dismissal if now installed
        localStorage.removeItem('pwa-install-dismissed');
        localStorage.setItem('pwa-install-completed', Date.now().toString());
      }
    };

    checkInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user has dismissed recently
      const dismissedTime = localStorage.getItem('pwa-install-dismissed');
      const completedTime = localStorage.getItem('pwa-install-completed');

      if (completedTime) {
        // Already installed
        return;
      }

      if (dismissedTime) {
        const timeSinceDismiss = Date.now() - parseInt(dismissedTime);
        if (timeSinceDismiss < dismissDuration) {
          // Still in dismissal period
          return;
        }
      }

      // Auto-show after delay if enabled
      if (autoShow) {
        setTimeout(() => {
          setShowPrompt(true);
        }, showDelay);
      }
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstalling(false);
      setInstallOutcome('accepted');
      setDeferredPrompt(null);

      // Store completion
      localStorage.setItem('pwa-install-completed', Date.now().toString());
      localStorage.removeItem('pwa-install-dismissed');

      // Hide prompt after showing success briefly
      setTimeout(() => {
        setShowPrompt(false);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [autoShow, showDelay, dismissDuration]);

  // 🚀 HANDLE INSTALLATION - NATIVE APP DEPLOYMENT
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      setInstallOutcome(outcome);

      if (outcome === 'accepted') {
        setIsInstalled(true);
        // appinstalled event will handle the rest
      } else {
        handleDismiss();
      }
    } catch (error) {
      console.error('PWA install failed:', error);
      setIsInstalling(false);
      setInstallOutcome('dismissed');
    }

    setDeferredPrompt(null);
  };

  // ❌ HANDLE DISMISSAL - RESPECT USER CHOICE
  const handleDismiss = () => {
    setShowPrompt(false);
    setInstallOutcome('dismissed');

    // Store dismissal time
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());

    // Don't show again for dismissDuration
    setTimeout(() => {
      // Could reset dismissal here if needed
    }, dismissDuration);
  };

  // 🎨 DYNAMIC STYLING - CYBERPUNK VISUAL DOMINATION
  const getPromptStyle = () => {
    if (installOutcome === 'accepted') {
      return {
        background: `linear-gradient(135deg, ${CYBERPUNK_COLORS.neonGreen}, ${CYBERPUNK_COLORS.neonBlue})`,
        border: `2px solid ${CYBERPUNK_COLORS.neonGreen}`,
        shadow: `0 0 30px ${CYBERPUNK_COLORS.neonGreen}60`
      };
    }

    return {
      background: `linear-gradient(135deg, ${CYBERPUNK_COLORS.neonPurple}, ${CYBERPUNK_COLORS.neonBlue})`,
      border: `2px solid ${CYBERPUNK_COLORS.neonPurple}`,
      shadow: `0 0 30px ${CYBERPUNK_COLORS.neonPurple}60`
    };
  };

  // 📊 INSTALLATION FEATURES - VALUE PROPOSITION
  const installationFeatures = [
    { icon: '✅', text: 'Acceso offline completo', color: CYBERPUNK_COLORS.neonGreen },
    { icon: '⚡', text: 'Carga instantánea', color: CYBERPUNK_COLORS.neonBlue },
    { icon: '🔔', text: 'Notificaciones push', color: CYBERPUNK_COLORS.neonPink },
    { icon: '📱', text: 'Experiencia nativa', color: CYBERPUNK_COLORS.neonPurple },
    { icon: '🛡️', text: 'Independiente de internet', color: CYBERPUNK_COLORS.neonGreen },
    { icon: '🔄', text: 'Sincronización automática', color: CYBERPUNK_COLORS.neonBlue }
  ];

  // 🎯 RENDER CONDITIONS
  if (isInstalled && !showPrompt) return null;
  if (!showPrompt && !deferredPrompt) return null;

  const promptStyle = getPromptStyle();

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-96 ${className}`}>
      <div
        className="rounded-lg shadow-2xl border-2 transition-all duration-500"
        style={{
          background: promptStyle.background,
          borderColor: promptStyle.border,
          boxShadow: promptStyle.shadow
        }}
      >
        {/* Success State */}
        {installOutcome === 'accepted' && (
          <div className="p-6 text-center">
            <CheckCircleIcon className="w-12 h-12 mx-auto mb-4 text-white animate-bounce" />
            <h3 className="font-bold text-xl text-white mb-2">¡INSTALACIÓN COMPLETADA!</h3>
            <p className="text-white opacity-90">
              DentiAgest ahora está disponible como aplicación nativa
            </p>
          </div>
        )}

        {/* Installation Prompt */}
        {installOutcome !== 'accepted' && (
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: CYBERPUNK_COLORS.darkBg }}
                >
                  <DevicePhoneMobileIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">📱 Instalar DentiAgest</h3>
                  <p className="text-white opacity-90 text-sm mt-1">
                    Convierta su portal en una aplicación nativa
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white hover:text-gray-300 transition-colors p-1"
                disabled={isInstalling}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {installationFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 rounded"
                  style={{ backgroundColor: CYBERPUNK_COLORS.darkBg + '40' }}
                >
                  <span style={{ color: feature.color }}>{feature.icon}</span>
                  <span className="text-white text-xs">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleInstall}
                disabled={isInstalling || !deferredPrompt}
                className={`
                  flex-1 py-3 px-4 rounded-lg font-bold text-white transition-all duration-300
                  ${isInstalling
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transform hover:scale-105'
                  }
                `}
                style={{
                  boxShadow: isInstalling ? 'none' : `0 0 15px ${CYBERPUNK_COLORS.neonGreen}40`
                }}
              >
                {isInstalling ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Instalando...</span>
                  </div>
                ) : (
                  '🚀 Instalar Ahora'
                )}
              </button>

              <button
                onClick={handleDismiss}
                disabled={isInstalling}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Más Tarde
              </button>
            </div>

            {/* Footer Message */}
            <div className="mt-4 text-center">
              <p className="text-xs text-white opacity-75 italic">
                "{PUNK_CONSTANTS.INDEPENDENCE_ZERO_DEPENDENCIES}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 🎭 PUNK PHILOSOPHY INTEGRATION
// "INDEPENDENCE FROM ZERO DEPENDENCIES"
// This component enables true app independence from web browsers