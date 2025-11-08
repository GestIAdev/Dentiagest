// 🌌📊 VERITAS SYSTEM STATUS - QUANTUM VERIFICATION GLOBAL DASHBOARD
// Date: November 8, 2025
// Mission: System-wide verification health monitoring
// Status: V3 - Production Ready

import React from 'react';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { VeritasConfidenceMeter } from './VeritasConfidenceMeter';

interface VeritasSystemMetrics {
  totalOperations: number;
  verifiedOperations: number;
  averageConfidence: number;
  algorithmsUsed: {
    name: string;
    count: number;
  }[];
  recentVerifications: number; // Last hour
  failedVerifications: number;
  lastUpdateTimestamp: string;
}

interface VeritasSystemStatusProps {
  metrics: VeritasSystemMetrics;
  className?: string;
}

export const VeritasSystemStatus: React.FC<VeritasSystemStatusProps> = ({
  metrics,
  className = ''
}) => {
  const verificationRate = (metrics.verifiedOperations / metrics.totalOperations) * 100;
  const failureRate = (metrics.failedVerifications / metrics.totalOperations) * 100;

  // Health status calculation
  const getHealthStatus = () => {
    if (verificationRate >= 95 && metrics.averageConfidence >= 0.8) {
      return { label: 'Excelente', color: 'green', bg: 'bg-green-50', border: 'border-green-200' };
    }
    if (verificationRate >= 85 && metrics.averageConfidence >= 0.6) {
      return { label: 'Bueno', color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    }
    if (verificationRate >= 70) {
      return { label: 'Aceptable', color: 'orange', bg: 'bg-orange-50', border: 'border-orange-200' };
    }
    return { label: 'Crítico', color: 'red', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const healthStatus = getHealthStatus();

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${healthStatus.border} ${healthStatus.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CpuChipIcon className={`w-6 h-6 text-${healthStatus.color}-600`} />
            <h2 className="text-lg font-bold text-gray-900">
              Estado del Sistema Quantum
            </h2>
          </div>
          <div className={`px-3 py-1 rounded-full bg-${healthStatus.color}-100 border border-${healthStatus.color}-300`}>
            <span className={`text-sm font-semibold text-${healthStatus.color}-800`}>
              {healthStatus.label}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Operations */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">
              {metrics.totalOperations.toLocaleString()}
            </span>
          </div>
          <p className="text-sm font-medium text-blue-700">Operaciones Totales</p>
          <p className="text-xs text-blue-600 mt-1">
            {metrics.verifiedOperations.toLocaleString()} verificadas
          </p>
        </div>

        {/* Verification Rate */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-green-700">Tasa de Verificación</span>
              <span className="text-2xl font-bold text-green-900">
                {Math.round(verificationRate)}%
              </span>
            </div>
            <VeritasConfidenceMeter
              veritas={{
                verified: verificationRate >= 80,
                confidence: verificationRate / 100,
                level: verificationRate >= 95 ? 'CRITICAL' : 'HIGH',
                verifiedAt: metrics.lastUpdateTimestamp,
                algorithm: 'system-aggregate'
              }}
              showLabel={false}
              showPercentage={false}
              size="sm"
            />
          </div>
          <p className="text-xs text-green-600">
            {failureRate.toFixed(1)}% fallos
          </p>
        </div>

        {/* Average Confidence */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-purple-700">Confianza Promedio</span>
              <span className="text-2xl font-bold text-purple-900">
                {Math.round(metrics.averageConfidence * 100)}%
              </span>
            </div>
            <VeritasConfidenceMeter
              veritas={{
                verified: metrics.averageConfidence >= 0.7,
                confidence: metrics.averageConfidence,
                level: 'HIGH',
                verifiedAt: metrics.lastUpdateTimestamp,
                algorithm: 'system-aggregate'
              }}
              showLabel={false}
              showPercentage={false}
              size="sm"
            />
          </div>
          <p className="text-xs text-purple-600">
            Basado en {metrics.totalOperations.toLocaleString()} ops
          </p>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <ClockIcon className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">
              {metrics.recentVerifications.toLocaleString()}
            </span>
          </div>
          <p className="text-sm font-medium text-orange-700">Última Hora</p>
          <p className="text-xs text-orange-600 mt-1">
            Verificaciones recientes
          </p>
        </div>
      </div>

      {/* Algorithms Distribution */}
      <div className="px-6 pb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Algoritmos Activos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.algorithmsUsed.map((algo, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              <p className="text-xs text-gray-600 mb-1 truncate" title={algo.name}>
                {algo.name}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {algo.count.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Última actualización:{' '}
          {new Date(metrics.lastUpdateTimestamp).toLocaleString('es-ES', {
            dateStyle: 'short',
            timeStyle: 'short'
          })}
        </p>
      </div>
    </div>
  );
};

export default VeritasSystemStatus;
