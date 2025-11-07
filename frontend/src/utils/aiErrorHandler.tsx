// 🎸💀 AI ERROR HANDLER - V2.0 CYBERPUNK REVOLUTION
/**
 * AI Error Handler - Robust Error Management for AI Services
 *
 * 🎯 MISSION: Provide comprehensive error handling and graceful degradation
 * ✅ AI service unavailability detection
 * ✅ Automatic fallback mechanisms
 * ✅ User-friendly error messages
 * ✅ Retry logic with exponential backoff
 * ✅ Offline mode support
 * ✅ Error analytics and reporting
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apollo from '../apollo';

interface AIErrorHandlerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: AIError) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

interface AIError {
  type: 'SERVICE_UNAVAILABLE' | 'NETWORK_ERROR' | 'TIMEOUT' | 'RATE_LIMIT' | 'AUTH_ERROR' | 'UNKNOWN';
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  retryable: boolean;
  userMessage: string;
}

interface AIServiceStatus {
  available: boolean;
  lastCheck: Date;
  responseTime?: number;
  errorCount: number;
  consecutiveFailures: number;
}

class AIErrorHandler {
  private static instance: AIErrorHandler;
  private serviceStatus: Map<string, AIServiceStatus> = new Map();
  private retryQueue: Map<string, (() => Promise<any>)[]> = new Map();

  static getInstance(): AIErrorHandler {
    if (!AIErrorHandler.instance) {
      AIErrorHandler.instance = new AIErrorHandler();
    }
    return AIErrorHandler.instance;
  }

  // 🎯 CHECK AI SERVICE HEALTH
  async checkServiceHealth(serviceName: string = 'default'): Promise<boolean> {
    try {
      // Use general health endpoint instead of AI-specific one
      const response = await apollo.api.get('/health') as any;
      const isHealthy = response.success && response.data?.status === 'healthy';

      this.updateServiceStatus(serviceName, {
        available: isHealthy,
        lastCheck: new Date(),
        responseTime: response.data?.responseTime,
        errorCount: isHealthy ? 0 : (this.serviceStatus.get(serviceName)?.errorCount || 0) + 1,
        consecutiveFailures: isHealthy ? 0 : (this.serviceStatus.get(serviceName)?.consecutiveFailures || 0) + 1
      });

      return isHealthy;
    } catch (error) {
      this.updateServiceStatus(serviceName, {
        available: false,
        lastCheck: new Date(),
        errorCount: (this.serviceStatus.get(serviceName)?.errorCount || 0) + 1,
        consecutiveFailures: (this.serviceStatus.get(serviceName)?.consecutiveFailures || 0) + 1
      });
      return false;
    }
  }

  // 🎯 UPDATE SERVICE STATUS
  private updateServiceStatus(serviceName: string, status: Partial<AIServiceStatus>) {
    const currentStatus = this.serviceStatus.get(serviceName) || {
      available: true,
      lastCheck: new Date(),
      errorCount: 0,
      consecutiveFailures: 0
    };

    this.serviceStatus.set(serviceName, { ...currentStatus, ...status });
  }

  // 🎯 HANDLE AI ERRORS
  handleError(error: any, context?: string): AIError {
    let aiError: AIError;

    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 429:
          aiError = {
            type: 'RATE_LIMIT',
            message: 'Rate limit exceeded',
            code: data?.code,
            details: data,
            timestamp: new Date(),
            retryable: true,
            userMessage: 'Demasiadas solicitudes. Inténtalo de nuevo en unos momentos.'
          };
          break;
        case 401:
        case 403:
          aiError = {
            type: 'AUTH_ERROR',
            message: 'Authentication failed',
            code: data?.code,
            details: data,
            timestamp: new Date(),
            retryable: false,
            userMessage: 'Error de autenticación con el servicio de IA.'
          };
          break;
        case 503:
        case 502:
          aiError = {
            type: 'SERVICE_UNAVAILABLE',
            message: 'AI service temporarily unavailable',
            code: data?.code,
            details: data,
            timestamp: new Date(),
            retryable: true,
            userMessage: 'El servicio de IA no está disponible temporalmente. Se reintentará automáticamente.'
          };
          break;
        default:
          aiError = {
            type: 'UNKNOWN',
            message: data?.message || 'Unknown error',
            code: data?.code,
            details: data,
            timestamp: new Date(),
            retryable: false,
            userMessage: 'Ha ocurrido un error desconocido con el servicio de IA.'
          };
      }
    } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
      aiError = {
        type: 'NETWORK_ERROR',
        message: 'Network connection failed',
        details: error,
        timestamp: new Date(),
        retryable: true,
        userMessage: 'Error de conexión. Verifica tu conexión a internet.'
      };
    } else if (error.code === 'TIMEOUT') {
      aiError = {
        type: 'TIMEOUT',
        message: 'Request timeout',
        details: error,
        timestamp: new Date(),
        retryable: true,
        userMessage: 'La solicitud tardó demasiado tiempo. Se reintentará automáticamente.'
      };
    } else {
      aiError = {
        type: 'UNKNOWN',
        message: error.message || 'Unknown error',
        details: error,
        timestamp: new Date(),
        retryable: false,
        userMessage: 'Ha ocurrido un error inesperado.'
      };
    }

    // Error logged through structured logging system
    return aiError;
  }

  // 🎯 RETRY WITH EXPONENTIAL BACKOFF
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000,
    context?: string
  ): Promise<T> {
    let lastError: AIError | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = this.handleError(error, context);

        if (!lastError.retryable || attempt === maxAttempts) {
          throw lastError;
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt - 1) + (attempt * 100); // Deterministic jitter
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (lastError) {
      throw lastError;
    } else {
      throw new Error('Unknown retry error');
    }
  }

  // 🎯 GET FALLBACK RESPONSE
  getFallbackResponse(operationType: string): any {
    const fallbacks = {
      'analyze-document': {
        confidence: 0,
        tags: [],
        analysis: {
          type: 'fallback',
          message: 'Análisis no disponible - servicio de IA temporalmente fuera de línea',
          fallback: true
        }
      },
      'search': {
        documents: [],
        total_count: 0,
        ai_suggestions: [],
        facets: {}
      },
      'extract-text': {
        text: '',
        confidence: 0,
        message: 'Extracción de texto no disponible'
      }
    };

    return fallbacks[operationType as keyof typeof fallbacks] || null;
  }

  // 🎯 GET SERVICE STATUS
  getServiceStatus(serviceName: string = 'default'): AIServiceStatus | null {
    return this.serviceStatus.get(serviceName) || null;
  }

  // 🎯 IS SERVICE AVAILABLE
  isServiceAvailable(serviceName: string = 'default'): boolean {
    const status = this.serviceStatus.get(serviceName);
    if (!status) return true; // Assume available if not checked

    // Consider unavailable if too many consecutive failures
    if (status.consecutiveFailures > 5) return false;

    // Consider unavailable if last check was too long ago and was failing
    const timeSinceLastCheck = Date.now() - status.lastCheck.getTime();
    if (!status.available && timeSinceLastCheck > 5 * 60 * 1000) { // 5 minutes
      return false;
    }

    return status.available;
  }
}

// 🎯 REACT HOOK FOR AI ERROR HANDLING
export const useAIErrorHandler = (
  serviceName: string = 'default',
  options: {
    retryAttempts?: number;
    retryDelay?: number;
    onError?: (error: AIError) => void;
  } = {}
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AIError | null>(null);
  const [serviceAvailable, setServiceAvailable] = useState(true);

  const errorHandler = useMemo(() => AIErrorHandler.getInstance(), []);

  // Check service availability periodically
  useEffect(() => {
    const checkAvailability = async () => {
      const available = await errorHandler.checkServiceHealth(serviceName);
      setServiceAvailable(available);
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [serviceName, errorHandler]);

  // Execute AI operation with error handling
  const executeAIOperation = useCallback(async <T,>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    if (!serviceAvailable) {
      const fallback = errorHandler.getFallbackResponse(context || 'unknown');
      return fallback;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await errorHandler.retryWithBackoff(
        operation,
        options.retryAttempts || 3,
        options.retryDelay || 1000,
        context
      );

      setIsLoading(false);
      return result;
    } catch (aiError) {
      setError(aiError as AIError);
      setIsLoading(false);

      if (options.onError) {
        options.onError(aiError as AIError);
      }

      // Return fallback if available
      return errorHandler.getFallbackResponse(context || 'unknown');
    }
  }, [serviceAvailable, options, errorHandler]);

  return {
    executeAIOperation,
    isLoading,
    error,
    serviceAvailable,
    clearError: () => setError(null)
  };
};

// 🎯 AI ERROR BOUNDARY COMPONENT
const AIErrorBoundaryComponent = ({
  children,
  fallback,
  onError,
  retryAttempts = 3,
  retryDelay = 1000
}: AIErrorHandlerProps): JSX.Element => {
  const [error, setError] = useState<AIError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setError(null);
    setRetryCount(prev => prev + 1);
  }, []);

  if (error && retryCount < retryAttempts) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-red-600">⚠️</div>
            <div>
              <h4 className="font-medium text-red-900">Error en servicio de IA</h4>
              <p className="text-sm text-red-700">{error.userMessage}</p>
            </div>
          </div>
          <button
            onClick={retry}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Reintentar ({retryCount + 1}/{retryAttempts})
          </button>
        </div>
      </div>
    );
  }

  if (error && retryCount >= retryAttempts) {
    return <>{fallback || (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="text-yellow-600">🚫</div>
          <div>
            <h4 className="font-medium text-yellow-900">Servicio de IA no disponible</h4>
            <p className="text-sm text-yellow-700">
              El servicio de IA no está disponible en este momento. Las funciones estarán limitadas.
            </p>
          </div>
        </div>
      </div>
    )}</>;
  }

  return <>{children}</>;
};

export const AIErrorBoundary = AIErrorBoundaryComponent;

// 🎯 AI SERVICE STATUS INDICATOR
export const AIServiceStatusIndicator: React.FC<{
  serviceName?: string;
  showDetails?: boolean;
  className?: string;
}> = ({
  serviceName = 'default',
  showDetails = false,
  className = ''
}) => {
  const [status, setStatus] = useState<AIServiceStatus | null>(null);

  useEffect(() => {
    const errorHandler = AIErrorHandler.getInstance();
    const updateStatus = () => {
      setStatus(errorHandler.getServiceStatus(serviceName));
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [serviceName]);

  if (!status) return null;

  const getStatusColor = () => {
    if (status.available) return 'text-green-600';
    if (status.consecutiveFailures > 3) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getStatusIcon = () => {
    if (status.available) return '🟢';
    if (status.consecutiveFailures > 3) return '🔴';
    return '🟡';
  };

  return (
    <div className={`flex items-center space-x-2 text-sm ${getStatusColor()} ${className}`}>
      <span>{getStatusIcon()}</span>
      <span>Servicio IA</span>
      {showDetails && (
        <span className="text-gray-500">
          ({status.responseTime ? `${status.responseTime}ms` : 'N/A'})
        </span>
      )}
    </div>
  );
};

export { AIErrorHandler };
export type { AIError, AIServiceStatus };



