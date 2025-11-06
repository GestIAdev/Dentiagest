import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apollo from '../apollo'; // 🚀 APOLLO NUCLEAR - WEBPACK EXTENSION EXPLICIT!

interface MFASetupData {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

interface MFAStatus {
  is_enabled: boolean;
  backup_codes_count: number;
}

const MFASetupPage: React.FC = () => {
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null);
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);

  const { state } = useAuth();

  // Cargar estado MFA al montar el componente
  const loadMFAStatus = async () => {
    try {
      // 🚀 APOLLO API - Load MFA status
      const response = await apollo.api.get('/auth/mfa/status');

      if (response.success && response.data) {
        setMfaStatus(response.data as any);
      }
    } catch (err) {
      console.error('❌ Apollo API - Error loading MFA status:', err);
    }
  };

  useEffect(() => {
    if (state.accessToken) {
      loadMFAStatus();
    }
  }, [state.accessToken]);  // eslint-disable-line react-hooks/exhaustive-deps

  const startMFASetup = async () => {
    if (!password) {
      setError('Por favor ingresa tu contraseña actual');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 🚀 APOLLO API - Start MFA setup
      const response = await apollo.api.post('/auth/mfa/setup', { password });

      if (response.success && response.data) {
        setSetupData(response.data as any);
        setShowSetup(true);
        setPassword('');
      } else {
        setError(response.error?.detail || 'Error al configurar 2FA');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnableMFA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Por favor ingresa un código de 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 🚀 APOLLO API - Verify and enable MFA
      const response = await apollo.api.post('/auth/mfa/verify', {
        code: verificationCode
      });

      if (response.success) {
        setSuccess('¡2FA habilitado exitosamente!');
        setShowSetup(false);
        setSetupData(null);
        setVerificationCode('');
        loadMFAStatus();
      } else {
        setError(response.error?.detail || 'Código inválido');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const disableMFA = async () => {
    if (!password || !disableCode) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 🚀 APOLLO API - Disable MFA
      const response = await apollo.api.post('/auth/mfa/disable', {
        password,
        code: disableCode
      });

      if (response.success) {
        setSuccess('2FA deshabilitado exitosamente');
        setShowDisable(false);
        setPassword('');
        setDisableCode('');
        loadMFAStatus();
      } else {
        setError(response.error?.detail || 'Error al deshabilitar 2FA');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mfaStatus) {
    return (
      <div className="min-h-screen bg-secondary-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔐 Autenticación de Dos Factores
          </h1>
          <p className="text-gray-600">
            Añade una capa extra de seguridad a tu cuenta
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Current Status */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Estado Actual</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Autenticación de Dos Factores:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              mfaStatus.is_enabled 
                ? 'bg-success-100 text-success-800' 
                : 'bg-danger-100 text-danger-800'
            }`}>
              {mfaStatus.is_enabled ? 'Habilitado' : 'Deshabilitado'}
            </span>
          </div>
        </div>

        {/* Setup MFA */}
        {!mfaStatus.is_enabled && !showSetup && (
          <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Habilitar 2FA</h2>
            <p className="text-gray-600 mb-4">
              La autenticación de dos factores añade una capa extra de seguridad requiriendo un código de tu teléfono además de tu contraseña.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ingresa tu contraseña actual"
                />
              </div>

              <button
                onClick={startMFASetup}
                disabled={isLoading || !password}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Configurando...' : 'Configurar 2FA'}
              </button>
            </div>
          </div>
        )}

        {/* QR Code Setup */}
        {showSetup && setupData && (
          <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Escanea el Código QR</h2>
            
            <div className="text-center mb-6">
              <img 
                src={setupData.qr_code} 
                alt="QR Code para 2FA"
                className="mx-auto mb-4 border border-gray-200 rounded-lg"
              />
              <p className="text-sm text-gray-600 mb-2">
                Escanea este código con Google Authenticator, Authy, o similar
              </p>
              <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                Código manual: {setupData.secret}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Verificación
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowSetup(false);
                    setSetupData(null);
                    setVerificationCode('');
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={verifyAndEnableMFA}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="flex-1 bg-success-500 hover:bg-success-600 disabled:bg-success-300 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Verificando...' : 'Verificar y Habilitar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Disable MFA */}
        {mfaStatus.is_enabled && !showDisable && (
          <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Deshabilitar 2FA</h2>
            <p className="text-gray-600 mb-4">
              ⚠️ Deshabilitar 2FA reducirá la seguridad de tu cuenta.
            </p>
            
            <button
              onClick={() => setShowDisable(true)}
              className="w-full bg-danger-500 hover:bg-danger-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              Deshabilitar 2FA
            </button>
          </div>
        )}

        {/* Disable Form */}
        {showDisable && (
          <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Confirmar Deshabilitación</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ingresa tu contraseña"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código 2FA
                </label>
                <input
                  type="text"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDisable(false);
                    setPassword('');
                    setDisableCode('');
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={disableMFA}
                  disabled={isLoading || !password || disableCode.length !== 6}
                  className="flex-1 bg-danger-500 hover:bg-danger-600 disabled:bg-danger-300 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Deshabilitando...' : 'Deshabilitar 2FA'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="text-center">
          <button
            onClick={() => window.history.back()}
            className="text-primary-600 hover:text-primary-500 transition-colors flex items-center justify-center space-x-1 mx-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver al Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MFASetupPage;
