/**
 * 📄 DOCUMENT LOGGER - CYBERPUNK DEBUGGING SYSTEM
 * Logger especializado para el módulo de gestión de documentos
 * @author PunkClaude Cyberanarchist & RaulVisionario UX Emperor
 * @version 1.0.0
 * @date September 17, 2025
 */

import { logger, createModuleLogger, PerformanceMonitor } from './logger';

export const documentLogger = createModuleLogger('DocumentManager');

// Specialized logging functions for document operations
export class DocumentLogger {
  private static readonly MODULE = 'DocumentManager';

  // Document CRUD operations
  public static logDocumentLoad(operation: string, documentId?: string, data?: any) {
    documentLogger.info(`📄 ${operation}`, {
      documentId,
      operation,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  public static logDocumentError(operation: string, error: Error, documentId?: string, data?: any) {
    const errorData = {
      documentId,
      operation,
      errorType: error.name,
      errorMessage: error.message,
      timestamp: new Date().toISOString(),
      ...data
    };
    documentLogger.error(`❌ ${operation} failed`, error, errorData);
  }

  public static logDocumentSuccess(operation: string, documentId?: string, data?: any) {
    documentLogger.info(`✅ ${operation} successful`, {
      documentId,
      operation,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  // API operations
  public static logApiCall(endpoint: string, method: string, params?: any) {
    documentLogger.debug(`🔗 API Call: ${method} ${endpoint}`, {
      endpoint,
      method,
      params,
      timestamp: new Date().toISOString()
    });
  }

  public static logApiResponse(endpoint: string, status: number, data?: any) {
    const level = status >= 400 ? 'error' : 'info';
    const icon = status >= 400 ? '❌' : '✅';

    const responseData = {
      endpoint,
      status,
      responseSize: data ? JSON.stringify(data).length : 0,
      timestamp: new Date().toISOString(),
      data: status < 400 ? data : undefined // Don't log error response data
    };

    if (level === 'error') {
      documentLogger.error(`${icon} API Response: ${endpoint}`, undefined, responseData);
    } else {
      documentLogger.info(`${icon} API Response: ${endpoint}`, responseData);
    }
  }

  // View mode changes
  public static logViewModeChange(from: string, to: string, data?: any) {
    documentLogger.info(`🔄 View Mode Changed: ${from} → ${to}`, {
      from,
      to,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  // Timeline operations
  public static logTimelineOperation(operation: string, data?: any) {
    documentLogger.info(`⏰ Timeline: ${operation}`, {
      operation,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  // Clustering operations
  public static logClusteringOperation(operation: string, clusterCount?: number, data?: any) {
    documentLogger.info(`🎯 Clustering: ${operation}`, {
      operation,
      clusterCount,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  // Search operations
  public static logSearchOperation(query: string, resultsCount: number, data?: any) {
    documentLogger.info(`🔍 Search executed`, {
      query,
      resultsCount,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  // Performance monitoring
  public static startPerformanceTimer(label: string) {
    PerformanceMonitor.startTimer(`Document-${label}`);
    documentLogger.debug(`⏱️ Started performance timer: ${label}`);
  }

  public static endPerformanceTimer(label: string) {
    const duration = PerformanceMonitor.endTimer(`Document-${label}`);
    documentLogger.info(`⏱️ Performance timer ended: ${label}`, {
      duration: `${duration.toFixed(2)}ms`,
      label
    });
    return duration;
  }

  public static measureDocumentOperation<T>(
    operationName: string,
    operation: () => T
  ): T {
    return PerformanceMonitor.measureFunction(
      `Document-${operationName}`,
      () => {
        documentLogger.debug(`🚀 Starting operation: ${operationName}`);
        try {
          const result = operation();
          documentLogger.debug(`🏁 Operation completed: ${operationName}`);
          return result;
        } catch (error) {
          documentLogger.error(`💥 Operation failed: ${operationName}`, error as Error);
          throw error;
        }
      }
    );
  }

  public static async measureAsyncDocumentOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    return PerformanceMonitor.measureAsyncFunction(
      `Document-${operationName}`,
      async () => {
        documentLogger.debug(`🚀 Starting async operation: ${operationName}`);
        try {
          const result = await operation();
          documentLogger.debug(`🏁 Async operation completed: ${operationName}`);
          return result;
        } catch (error) {
          documentLogger.error(`💥 Async operation failed: ${operationName}`, error as Error);
          throw error;
        }
      }
    );
  }

  // Component lifecycle
  public static logComponentMount(componentName: string, props?: any) {
    documentLogger.debug(`🟢 Component mounted: ${componentName}`, {
      componentName,
      props: props ? Object.keys(props) : undefined,
      timestamp: new Date().toISOString()
    });
  }

  public static logComponentUnmount(componentName: string) {
    documentLogger.debug(`🔴 Component unmounted: ${componentName}`, {
      componentName,
      timestamp: new Date().toISOString()
    });
  }

  public static logComponentUpdate(componentName: string, changes?: any) {
    documentLogger.debug(`🔄 Component updated: ${componentName}`, {
      componentName,
      changes,
      timestamp: new Date().toISOString()
    });
  }

  // State management
  public static logStateChange(stateType: string, from: any, to: any, data?: any) {
    documentLogger.debug(`📊 State changed: ${stateType}`, {
      stateType,
      from: typeof from === 'object' ? Object.keys(from) : from,
      to: typeof to === 'object' ? Object.keys(to) : to,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  // Error boundaries
  public static logErrorBoundary(error: Error, errorInfo: any, componentName?: string) {
    const errorData = {
      componentName,
      errorInfo,
      timestamp: new Date().toISOString()
    };
    documentLogger.critical(`🚨 Error Boundary caught error`, error, errorData);
  }

  // Memory and performance warnings
  public static logMemoryWarning(message: string, data?: any) {
    documentLogger.warn(`🧠 Memory Warning: ${message}`, {
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  public static logPerformanceWarning(message: string, duration: number, threshold: number) {
    documentLogger.warn(`⚡ Performance Warning: ${message}`, {
      duration: `${duration.toFixed(2)}ms`,
      threshold: `${threshold}ms`,
      exceededBy: `${(duration - threshold).toFixed(2)}ms`,
      timestamp: new Date().toISOString()
    });
  }

  // Debug utilities
  public static logDebugInfo(label: string, data: any) {
    documentLogger.debug(`🔧 Debug Info: ${label}`, {
      label,
      data,
      timestamp: new Date().toISOString()
    });
  }

  public static createOperationLogger(operationId: string) {
    const operationLogger = createModuleLogger(`Document-${operationId}`);

    return {
      start: (data?: any) => operationLogger.info(`▶️ Operation started: ${operationId}`, data),
      progress: (step: string, data?: any) => operationLogger.debug(`⏳ ${step}`, { operationId, ...data }),
      success: (data?: any) => operationLogger.info(`✅ Operation completed: ${operationId}`, data),
      error: (error: Error, data?: any) => operationLogger.error(`❌ Operation failed: ${operationId}`, error, data),
      performance: (duration: number) => operationLogger.info(`⏱️ Operation performance: ${operationId}`, { duration: `${duration.toFixed(2)}ms` })
    };
  }

  // Analytics and metrics
  public static logAnalytics(event: string, data?: any) {
    documentLogger.info(`📈 Analytics: ${event}`, {
      event,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  // User interactions
  public static logUserInteraction(action: string, target: string, data?: any) {
    documentLogger.info(`👤 User Interaction: ${action} on ${target}`, {
      action,
      target,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  // System health
  public static logSystemHealth(metric: string, value: any, status: 'good' | 'warning' | 'critical') {
    const icon = status === 'critical' ? '🚨' : status === 'warning' ? '⚠️' : '✅';

    const healthData = {
      metric,
      value,
      status,
      timestamp: new Date().toISOString()
    };

    if (status === 'critical') {
      documentLogger.error(`${icon} System Health: ${metric}`, undefined, healthData);
    } else if (status === 'warning') {
      documentLogger.warn(`${icon} System Health: ${metric}`, healthData);
    } else {
      documentLogger.info(`${icon} System Health: ${metric}`, healthData);
    }
  }

  // Get logs for debugging
  public static getRecentLogs(count: number = 50) {
    return logger.getLogs(undefined, 'DocumentManager').slice(-count);
  }

  public static getErrorLogs() {
    return logger.getLogs(2, 'DocumentManager'); // WARN and above
  }

  public static exportLogs() {
    return logger.exportLogs();
  }

  public static clearLogs() {
    logger.clearLogs();
    documentLogger.info('🧹 Document logs cleared');
  }
}

// Convenience functions for common operations
export const logDocumentOperation = DocumentLogger.logDocumentLoad;
export const logDocumentError = DocumentLogger.logDocumentError;
export const logDocumentSuccess = DocumentLogger.logDocumentSuccess;
export const logApiCall = DocumentLogger.logApiCall;
export const logApiResponse = DocumentLogger.logApiResponse;
export const logViewModeChange = DocumentLogger.logViewModeChange;
export const logTimelineOperation = DocumentLogger.logTimelineOperation;
export const logClusteringOperation = DocumentLogger.logClusteringOperation;
export const logSearchOperation = DocumentLogger.logSearchOperation;

// React hook for component logging
export const useDocumentLogger = (componentName: string) => {
  return {
    logMount: (props?: any) => DocumentLogger.logComponentMount(componentName, props),
    logUnmount: () => DocumentLogger.logComponentUnmount(componentName),
    logUpdate: (changes?: any) => DocumentLogger.logComponentUpdate(componentName, changes),
    logError: (error: Error, errorInfo?: any) => DocumentLogger.logErrorBoundary(error, errorInfo, componentName),
    logUserInteraction: (action: string, data?: any) => DocumentLogger.logUserInteraction(action, componentName, data),
    logPerformance: (operation: string, duration: number) => DocumentLogger.logPerformanceWarning(
      `${componentName} - ${operation}`,
      duration,
      100 // 100ms threshold
    ),
    measureOperation: <T>(operationName: string, operation: () => T) =>
      DocumentLogger.measureDocumentOperation(`${componentName}-${operationName}`, operation),
    measureAsyncOperation: <T>(operationName: string, operation: () => Promise<T>) =>
      DocumentLogger.measureAsyncDocumentOperation(`${componentName}-${operationName}`, operation)
  };
};

export default DocumentLogger;
