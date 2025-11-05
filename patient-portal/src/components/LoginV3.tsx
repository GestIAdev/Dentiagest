import React, { useEffect, useState } from 'react';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuthStore, initiateSSO, handleSSOCallback } from '../stores/authStore';
import { useSearchParams } from 'react-router-dom';

// ============================================================================
// COMPONENTE: LOGIN/SSO V3 - CYBERPUNK AUTHENTICATION
// ============================================================================

const LoginV3: React.FC = () => {
  const { auth, setLoading, setError, clearError } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Handle SSO callback
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setError('Error en la autenticación SSO');
      return;
    }

    if (code && state) {
      handleSSOCallback(code, state).catch((err) => {
        console.error('SSO callback failed:', err);
        setError('Error al procesar la autenticación');
      });
    }
  }, [searchParams, setError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (auth?.isAuthenticated) {
      window.location.href = '/';
    }
  }, [auth]);

  const handleSSOLogin = async () => {
    try {
      setLoading(true);
      clearError();
      setIsRedirecting(true);

      // For demo purposes, use mock patient/clinic IDs
      // In production, this would come from user input or URL params
      await initiateSSO('patient-001', 'clinic-001');

    } catch (error) {
      console.error('SSO initiation failed:', error);
      setError('Error al iniciar la autenticación');
      setIsRedirecting(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Demo login for development
    useAuthStore.getState().login(
      'demo-patient-001',
      'demo-clinic-001',
      'demo-jwt-token',
      900 // 15 minutes
    );
  };

  if (auth?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <div className="text-center">
          <CheckCircleIcon className="w-16 h-16 text-neon-green mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-neon-green mb-2">¡Autenticado!</h2>
          <p className="text-cyber-light">Redirigiendo al portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-gradient flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-neon-cyan to-neon-blue rounded-full flex items-center justify-center mx-auto mb-6 shadow-neon-cyan">
            <ShieldCheckIcon className="w-10 h-10 text-cyber-black" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple bg-clip-text text-transparent mb-2">
            Dentiagest V3
          </h1>
          <p className="text-xl text-cyber-light mb-4">Portal del Paciente</p>
          <p className="text-cyber-light text-sm">
            Acceso seguro a tus registros dentales
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-cyber-dark rounded-2xl shadow-2xl border border-neon-cyan/20 p-8">
          <div className="text-center mb-6">
            <LockClosedIcon className="w-12 h-12 text-neon-cyan mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Autenticación Segura</h2>
            <p className="text-cyber-light text-sm">
              Inicia sesión de forma segura con tu clínica dental
            </p>
          </div>

          {/* Error Display */}
          {useAuthStore.getState().error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-400 font-medium">Error de Autenticación</p>
                  <p className="text-xs text-red-300 mt-1">
                    {useAuthStore.getState().error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SSO Login Button */}
          <button
            onClick={handleSSOLogin}
            disabled={isRedirecting || useAuthStore.getState().isLoading}
            className="w-full bg-gradient-to-r from-neon-cyan to-neon-blue text-cyber-black py-4 px-6 rounded-xl font-bold text-lg hover:from-neon-cyan/80 hover:to-neon-blue/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-neon-cyan mb-4 flex items-center justify-center"
          >
            {isRedirecting || useAuthStore.getState().isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyber-black mr-3"></div>
                Conectando...
              </>
            ) : (
              <>
                <ShieldCheckIcon className="w-6 h-6 mr-3" />
                🔐 INICIAR SESIÓN SSO
                <ArrowRightIcon className="w-6 h-6 ml-3" />
              </>
            )}
          </button>

          {/* Demo Login Button (Development Only) */}
          <button
            onClick={handleDemoLogin}
            className="w-full bg-cyber-gray hover:bg-cyber-light text-cyber-light hover:text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 border border-cyber-light mb-6"
          >
            🚀 DEMO LOGIN (Desarrollo)
          </button>

          {/* Info Section */}
          <div className="space-y-4 text-sm text-cyber-light">
            <div className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-neon-green mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Autenticación JWT Segura</p>
                <p>Tokens con expiración de 15 minutos para máxima seguridad</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-neon-green mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Integración Apollo Nuclear</p>
                <p>Conexión directa con el backend GraphQL en puerto 8002</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-neon-green mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Modelo Netflix Dental</p>
                <p>Suscripciones flexibles adaptadas a tus necesidades</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-cyber-light text-center">
            <p className="text-xs text-cyber-light">
              Titan V3 - Pure Quantum Truth
            </p>
            <p className="text-xs text-neon-cyan mt-1">
              @veritas quantum verification
            </p>
          </div>
        </div>

        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-purple/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoginV3;