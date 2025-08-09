import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  
  const { state } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  React.useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [state.isAuthenticated, navigate]);

  // Validación de contraseña en tiempo real
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Mínimo 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Al menos 1 mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Al menos 1 minúscula');
    }
    if (!/\d/.test(password)) {
      errors.push('Al menos 1 número');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Al menos 1 símbolo especial');
    }
    
    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar contraseña en tiempo real
    if (name === 'password') {
      setPasswordErrors(validatePassword(value));
    }

    // Limpiar errores generales al escribir
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validaciones del cliente
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('Nombre y apellido son requeridos');
      setIsLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Email es requerido');
      setIsLoading(false);
      return;
    }

    if (passwordErrors.length > 0) {
      setError('Por favor corrige los errores de contraseña');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8002/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim().toLowerCase(),
          username: formData.username.trim() || undefined, // Opcional
          password: formData.password,
          role: 'PROFESSIONAL' // Por defecto, profesional dental
        })
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Redirigir al login con mensaje de éxito
        navigate('/login', { 
          state: { 
            message: '¡Registro exitoso! Inicia sesión con tus credenciales.',
            email: formData.email.trim().toLowerCase()
          }
        });
      } else {
        const errorData = await response.json();
        
        if (response.status === 400) {
          if (errorData.detail.includes('email')) {
            setError('Este email ya está registrado. ¿Olvidaste tu contraseña?');
          } else if (errorData.detail.includes('username')) {
            setError('Este nombre de usuario ya está ocupado. Intenta con otro.');
          } else {
            setError(errorData.detail || 'Error en los datos proporcionados');
          }
        } else {
          setError('Error del servidor. Inténtalo más tarde.');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">🦷 DentiaGest</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Cuenta</h2>
          <p className="text-gray-600">Únete a la plataforma dental más avanzada</p>
        </div>

        {/* Formulario de Registro */}
        <div className="bg-white p-8 rounded-xl shadow-soft">
          <form className="space-y-6" onSubmit={handleSubmit}>
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

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="tu@email.com"
              />
            </div>

            {/* Username (opcional) */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Usuario <span className="text-gray-500">(opcional)</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="usuario_opcional"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si no especificas uno, podrás usar tu email para iniciar sesión
              </p>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="••••••••"
              />
              
              {/* Indicadores de validación de contraseña */}
              {formData.password && (
                <div className="mt-2">
                  <div className="text-xs space-y-1">
                    {passwordErrors.length > 0 ? (
                      <div className="text-red-600">
                        <p className="font-medium">Requisitos faltantes:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {passwordErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-green-600 font-medium">✅ Contraseña válida</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="••••••••"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">Las contraseñas no coinciden</p>
              )}
            </div>

            {/* Botón de Registro */}
            <button
              type="submit"
              disabled={isLoading || passwordErrors.length > 0}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </>
              ) : (
                '🦷 Crear Cuenta DentiaGest'
              )}
            </button>

            {/* Link a Login */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium transition-colors">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </form>

          {/* Información adicional */}
          <div className="mt-6 pt-6 border-t border-secondary-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Al registrarte aceptas nuestros términos de uso</p>
              <div className="bg-secondary-50 p-3 rounded-lg text-xs text-gray-600">
                <p className="mb-1"><strong>🔐 Tu información está segura:</strong></p>
                <p>• Contraseñas encriptadas con bcrypt</p>
                <p>• Comunicación HTTPS segura</p>
                <p>• Autenticación JWT profesional</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
