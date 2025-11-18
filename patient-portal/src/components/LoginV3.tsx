import React, { useEffect, useState, useRef } from 'react';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useAuthStore, loginWithCredentials } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// COMPONENTE: LOGIN V3 - REAL AUTHENTICATION (NO MORE MOCKS)
// By PunkClaude - Directiva #003 GeminiEnder
// FIXED: Anti-loop navigation guard
// ============================================================================

const LoginV3: React.FC = () => {
  const { auth, setLoading, setError, clearError, error, isLoading } = useAuthStore();
  const navigate = useNavigate();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Anti-loop guard: solo navegar UNA VEZ
  const hasRedirected = useRef(false);

  // Redirect if already authenticated (SOLO UNA VEZ)
  useEffect(() => {
    if (auth?.isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      console.log('✅ Ya autenticado, redirigiendo a dashboard...');
      navigate('/', { replace: true });
    }
  }, [auth?.isAuthenticated, navigate]);

  // 🔐 REAL LOGIN HANDLER - No más mocks
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña');
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);
      clearError();

      await loginWithCredentials(email, password);

      console.log('✅ Login exitoso - redirigiendo...');
      
      // Marcar que vamos a redirigir
      hasRedirected.current = true;
      
      // Navegación con replace para evitar bucle de history
      navigate('/', { replace: true });

    } catch (err) {
      console.error('❌ Login falló:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
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
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-400 font-medium">Error de Autenticación</p>
                  <p className="text-xs text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REAL LOGIN FORM - Conectado a Selene GraphQL */}
          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-cyber-light mb-2">
                Email
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-cyan" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-cyber-gray border border-neon-cyan/30 text-white rounded-lg py-3 px-10 focus:outline-none focus:border-neon-cyan transition-colors"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-cyber-light mb-2">
                Contraseña
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-cyan" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-cyber-gray border border-neon-cyan/30 text-white rounded-lg py-3 px-10 focus:outline-none focus:border-neon-cyan transition-colors"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full bg-gradient-to-r from-neon-cyan to-neon-blue text-cyber-black py-4 px-6 rounded-xl font-bold text-lg hover:from-neon-cyan/80 hover:to-neon-blue/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-neon-cyan flex items-center justify-center"
            >
              {isSubmitting || isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyber-black mr-3"></div>
                  Autenticando...
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-6 h-6 mr-3" />
                  🔐 INICIAR SESIÓN
                  <ArrowRightIcon className="w-6 h-6 ml-3" />
                </>
              )}
            </button>
          </form>

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
                <p className="font-medium text-white">Conexión Segura a Selene</p>
                <p>Backend GraphQL en puerto 8005 - Selene Song Core</p>
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

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-cyber-light">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-neon-cyan hover:text-neon-blue font-medium transition-colors"
              >
                Regístrate aquí
              </button>
            </p>
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