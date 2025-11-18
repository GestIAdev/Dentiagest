import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener mensaje de éxito del registro si existe
  const successMessage = location.state?.message;
  const prefilledEmail = location.state?.email;

  // Anti-loop guard: solo navegar UNA VEZ durante MANUAL LOGIN
  const isSubmitting = useRef(false);

  // 🔥 CRITICAL: Remove autorestore redirect from LoginPage
  // Reason: Causes conflict with StaffGuard verification
  // Flow: If authed + tries to access /login → user is redirected by routes themselves
  // If coming from logout → user needs to manually login again
  // If restoring from localStorage → AuthContext handles state, routes do final check
  // No useEffect redirect needed here!

  // 🔍 Debug: Read stored logs after redirect
  React.useEffect(() => {
    const debugLogs = sessionStorage.getItem('loginDebugLogs');
    const loginError = sessionStorage.getItem('loginError');
    
    if (debugLogs) {
      console.log('📋 [DEBUG LOGS FROM REDIRECT]:', JSON.parse(debugLogs));
      sessionStorage.removeItem('loginDebugLogs');
    }
    
    if (loginError) {
      console.log('❌ [LOGIN ERROR FROM REDIRECT]:', loginError);
      sessionStorage.removeItem('loginError');
    }
  }, []);

  // Prellenar email si viene del registro
  React.useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Marcar que estamos en proceso de submit (bloquea cualquier interference)
      isSubmitting.current = true;
      
      // 🔥 Get result with user and role directly (don't wait for async setState)
      const loginResult = await login(email, password);
      
      if (!loginResult.success) {
        // Reset flag si falla
        isSubmitting.current = false;
        setError('Credenciales inválidas. Verifica tu email y contraseña.');
        setIsLoading(false);
        return;
      }

      // 🔥 Use role from the login response (not from state which is still updating)
      const userRole = loginResult.role;
      
      console.log('✅ [HANDLE SUBMIT] Login exitoso');
      console.log('✅ [HANDLE SUBMIT] loginResult:', loginResult);
      console.log('✅ [HANDLE SUBMIT] userRole:', userRole);
      
      // Si es PACIENTE → Redirigir al Patient Portal (3001)
      if (userRole === 'PATIENT') {
        console.log('✅ [MANUAL LOGIN] PACIENTE - Redirigiendo a Patient Portal (3001)...');
        // For cross-port, MUST use window.location.href
        window.location.href = 'http://localhost:3001';
        return;
      }
      
      // Si es STAFF/ADMIN/DENTIST/RECEPTIONIST → Dashboard
      // 🔥 Use window.location.href to force a REAL page load that resets React state
      console.log('✅ [MANUAL LOGIN] STAFF - Redirigiendo a dashboard con window.location...');
      window.location.href = 'http://localhost:3000/dashboard';
      return;
      
    } catch (err) {
      // Reset flag si error
      isSubmitting.current = false;
      setError('Error al iniciar sesión. Inténtalo de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">🦷 DentiaGest</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
          <p className="text-gray-600">Accede a tu panel de gestión odontológica</p>
        </div>

        {/* Formulario */}
        <div className="bg-white p-8 rounded-xl shadow-soft">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Success Message from Registration */}
            {successMessage && (
              <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-success-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-success-700">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="tu@email.com"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <span>Iniciar Sesión</span>
              )}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button type="button" className="text-sm text-primary-600 hover:text-primary-500 transition-colors">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-secondary-200">
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-500 font-medium transition-colors">
                  Regístrate gratis
                </Link>
              </p>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-secondary-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Credenciales de demostración:</p>
              <div className="bg-secondary-50 p-3 rounded-lg text-xs text-gray-600">
                <p><strong>Admin:</strong> admin@dentiagest.com / <span className="font-mono">AdminDent123!</span></p>
                <p><strong>Odontólogo:</strong> doctor@dentiagest.com / <span className="font-mono">DoctorDent123!</span> <span className="text-gray-400">(sugerido)</span></p>
                <p><strong>Recepcionista:</strong> recep@dentiagest.com / <span className="font-mono">RecepDent123!</span> <span className="text-gray-400">(sugerido)</span></p>
                <p className="text-xs text-gray-400 mt-2">Las contraseñas cumplen con la política: mayúsculas, minúsculas, números y símbolo especial.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

