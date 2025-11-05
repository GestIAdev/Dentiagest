// 🔄 SYNC QUEUE MANAGER V200 - OPERATION VISIBILITY
// 🔥 PUNK PHILOSOPHY: SPEED AS WEAPON - DEMOCRACY THROUGH CODE

import React, { useState, useEffect } from 'react';
import { ArrowPathIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

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
  neonOrange: '#ff8800',
  darkBg: '#0a0a0a',
  darkGray: '#1a1a1a',
  lightGray: '#333333',
  textPrimary: '#ffffff',
  textSecondary: '#cccccc'
};

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  error?: string;
  retryCount?: number;
  maxRetries?: number;
}

interface SyncQueueManagerProps {
  className?: string;
  autoHide?: boolean;
  maxVisibleOperations?: number;
}

export const SyncQueueManager: React.FC<SyncQueueManagerProps> = ({
  className = '',
  autoHide = true,
  maxVisibleOperations = 10
}) => {
  const [operations, setOperations] = useState<SyncOperation[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [totalPending, setTotalPending] = useState(0);
  const [totalProcessing, setTotalProcessing] = useState(0);
  const [totalFailed, setTotalFailed] = useState(0);

  // 🔄 LOAD OPERATIONS - REAL-TIME SYNC MONITORING
  useEffect(() => {
    const loadOperations = () => {
      // This would integrate with actual storage/state management
      // For now, simulate with localStorage or mock data
      const mockOperations: SyncOperation[] = [
        // Example operations - in real implementation, load from IndexedDB
        // {
        //   id: 'op_1',
        //   type: 'create',
        //   entity: 'appointment',
        //   status: 'pending',
        //   priority: 'high',
        //   timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        //   retryCount: 0,
        //   maxRetries: 3
        // }
      ];

      // Load from localStorage for demo purposes
      const storedOps = localStorage.getItem('syncOperations');
      if (storedOps) {
        try {
          const parsedOps = JSON.parse(storedOps).map((op: any) => ({
            ...op,
            timestamp: new Date(op.timestamp)
          }));
          setOperations(parsedOps);
        } catch (error) {
          console.warn('Failed to load stored operations:', error);
        }
      } else {
        setOperations(mockOperations);
      }

      updateStats(mockOperations);
    };

    loadOperations();

    // Poll for updates every 5 seconds
    const pollInterval = setInterval(loadOperations, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  // 📊 UPDATE STATISTICS - REAL-TIME METRICS
  const updateStats = (ops: SyncOperation[]) => {
    const pending = ops.filter(op => op.status === 'pending').length;
    const processing = ops.filter(op => op.status === 'processing').length;
    const failed = ops.filter(op => op.status === 'failed').length;

    setTotalPending(pending);
    setTotalProcessing(processing);
    setTotalFailed(failed);
  };

  // 🎨 PRIORITY STYLING - CYBERPUNK VISUAL HIERARCHY
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critical':
        return {
          container: `border-l-4 border-red-500 bg-gradient-to-r from-red-900/20 to-red-800/10`,
          badge: 'bg-red-500 text-white',
          glow: `0 0 10px ${CYBERPUNK_COLORS.neonPink}40`
        };
      case 'high':
        return {
          container: `border-l-4 border-orange-500 bg-gradient-to-r from-orange-900/20 to-orange-800/10`,
          badge: 'bg-orange-500 text-white',
          glow: `0 0 10px ${CYBERPUNK_COLORS.neonOrange}40`
        };
      case 'medium':
        return {
          container: `border-l-4 border-blue-500 bg-gradient-to-r from-blue-900/20 to-blue-800/10`,
          badge: 'bg-blue-500 text-white',
          glow: `0 0 10px ${CYBERPUNK_COLORS.neonBlue}40`
        };
      default: // low
        return {
          container: `border-l-4 border-gray-500 bg-gradient-to-r from-gray-900/20 to-gray-800/10`,
          badge: 'bg-gray-500 text-white',
          glow: 'none'
        };
    }
  };

  // 🔄 STATUS ICONS - VISUAL STATE INDICATION
  const getStatusIcon = (status: string, priority: string) => {
    const baseClasses = "w-4 h-4";

    switch (status) {
      case 'pending':
        return <ClockIcon className={`${baseClasses} text-yellow-500`} />;
      case 'processing':
        return <ArrowPathIcon className={`${baseClasses} text-blue-500 animate-spin`} />;
      case 'completed':
        return <CheckCircleIcon className={`${baseClasses} text-green-500`} />;
      case 'failed':
        return <ExclamationTriangleIcon className={`${baseClasses} text-red-500`} />;
      default:
        return <ClockIcon className={`${baseClasses} text-gray-500`} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'completed': return 'Completado';
      case 'failed': return 'Fallido';
      default: return 'Desconocido';
    }
  };

  // 📱 TOGGLE VISIBILITY - USER CONTROL
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    if (!isVisible) {
      setIsExpanded(false); // Reset expanded state when opening
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // 🧹 CLEAR COMPLETED OPERATIONS
  const clearCompleted = () => {
    const filteredOps = operations.filter(op => op.status !== 'completed');
    setOperations(filteredOps);
    localStorage.setItem('syncOperations', JSON.stringify(filteredOps));
    updateStats(filteredOps);
  };

  // 🔄 RETRY FAILED OPERATIONS
  const retryFailed = () => {
    const updatedOps = operations.map(op => {
      if (op.status === 'failed' && (op.retryCount || 0) < (op.maxRetries || 3)) {
        return {
          ...op,
          status: 'pending' as const,
          retryCount: (op.retryCount || 0) + 1,
          timestamp: new Date()
        };
      }
      return op;
    });

    setOperations(updatedOps);
    localStorage.setItem('syncOperations', JSON.stringify(updatedOps));
    updateStats(updatedOps);
  };

  // 📊 SUMMARY STATS
  const totalOperations = operations.length;
  const hasOperations = totalOperations > 0;
  const hasPendingOrProcessing = totalPending > 0 || totalProcessing > 0;

  // Auto-hide logic
  const shouldShow = !autoHide || hasPendingOrProcessing || isVisible;

  if (!shouldShow && autoHide) return null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleVisibility}
        className={`
          fixed bottom-4 left-4 p-3 rounded-full shadow-xl transition-all duration-300 z-50
          ${hasPendingOrProcessing
            ? 'bg-gradient-to-r from-red-600 to-pink-600 animate-pulse'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
          }
        `}
        style={{
          boxShadow: hasPendingOrProcessing
            ? `0 0 20px ${CYBERPUNK_COLORS.neonPink}60`
            : `0 0 15px ${CYBERPUNK_COLORS.neonBlue}40`
        }}
        title="Ver Cola de Sincronización"
      >
        <ArrowPathIcon className="w-5 h-5 text-white" />
        {(totalPending + totalProcessing) > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {totalPending + totalProcessing}
          </span>
        )}
      </button>

      {/* Sync Queue Panel */}
      {isVisible && (
        <div
          className={`
            fixed bottom-20 left-4 w-80 rounded-lg shadow-2xl z-50 transition-all duration-300
            ${isExpanded ? 'max-h-96' : 'max-h-64'}
          `}
          style={{
            background: `linear-gradient(135deg, ${CYBERPUNK_COLORS.darkBg}, ${CYBERPUNK_COLORS.darkGray})`,
            border: `1px solid ${CYBERPUNK_COLORS.neonBlue}`,
            boxShadow: `0 0 30px ${CYBERPUNK_COLORS.neonBlue}30`
          }}
        >
          {/* Header */}
          <div
            className="p-4 border-b cursor-pointer"
            style={{ borderColor: CYBERPUNK_COLORS.lightGray }}
            onClick={toggleExpanded}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">COLA DE SINCRONIZACIÓN</h3>
                  <p className="text-xs text-gray-300">
                    {totalPending} pendientes • {totalProcessing} procesando • {totalFailed} fallidos
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {hasOperations && (
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); retryFailed(); }}
                      className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors"
                      disabled={totalFailed === 0}
                    >
                      Reintentar
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); clearCompleted(); }}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                    >
                      Limpiar
                    </button>
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Operations List */}
          <div className="p-2 space-y-2 overflow-y-auto max-h-80">
            {hasOperations ? (
              operations.slice(0, maxVisibleOperations).map((operation) => {
                const priorityStyle = getPriorityStyle(operation.priority);

                return (
                  <div
                    key={operation.id}
                    className={`p-3 rounded-lg transition-all duration-200 ${priorityStyle.container}`}
                    style={{ boxShadow: priorityStyle.glow }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(operation.status, operation.priority)}
                        <span className="font-medium text-white text-sm capitalize">
                          {operation.type} {operation.entity}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityStyle.badge}`}>
                          {operation.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-300">
                          {getStatusText(operation.status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        {operation.timestamp.toLocaleTimeString()}
                      </span>
                      {operation.retryCount !== undefined && operation.maxRetries && (
                        <span>
                          Intento {operation.retryCount}/{operation.maxRetries}
                        </span>
                      )}
                    </div>

                    {operation.error && (
                      <div
                        className="mt-2 p-2 rounded text-xs bg-red-900/30 border border-red-500/30"
                        style={{ color: CYBERPUNK_COLORS.neonPink }}
                      >
                        Error: {operation.error}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-white font-medium">Todo sincronizado</p>
                <p className="text-gray-400 text-sm">No hay operaciones pendientes</p>
              </div>
            )}

            {operations.length > maxVisibleOperations && (
              <div className="text-center py-2">
                <span className="text-xs text-gray-400">
                  Y {operations.length - maxVisibleOperations} operaciones más...
                </span>
              </div>
            )}
          </div>

          {/* Footer with punk philosophy */}
          <div
            className="p-3 border-t text-center"
            style={{ borderColor: CYBERPUNK_COLORS.lightGray }}
          >
            <p className="text-xs italic text-gray-400">
              "{PUNK_CONSTANTS.SPEED_AS_WEAPON}"
            </p>
          </div>
        </div>
      )}
    </>
  );
};

// 🎭 PUNK PHILOSOPHY INTEGRATION
// "SPEED AS WEAPON - DEMOCRACY THROUGH CODE"
// This component delivers real-time sync visibility, democratizing data flow