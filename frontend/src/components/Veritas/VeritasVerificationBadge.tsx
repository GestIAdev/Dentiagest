// 🔐💀 VERITAS VERIFICATION BADGE - QUANTUM TRUTH VISUALIZATION
// Date: November 8, 2025
// Mission: Visual representation of @veritas quantum truth verification
// Status: V3 - Production Ready

import React from 'react';
import { ShieldCheckIcon, ShieldExclamationIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

// ============================================================================
// TYPES
// ============================================================================

export interface VeritasVerification {
  verified: boolean;
  confidence: number;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  certificate?: string;
  error?: string;
  verifiedAt: string;
  algorithm: string;
}

interface VeritasVerificationBadgeProps {
  veritas?: VeritasVerification | null;
  compact?: boolean;
  showTimestamp?: boolean;
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getVeritasColor = (veritas: VeritasVerification): string => {
  if (!veritas.verified) return 'red';
  
  const { level, confidence } = veritas;
  
  if (level === 'CRITICAL' || level === 'HIGH') {
    return confidence >= 0.8 ? 'green' : confidence >= 0.6 ? 'yellow' : 'orange';
  }
  
  if (level === 'MEDIUM') {
    return confidence >= 0.6 ? 'green' : confidence >= 0.4 ? 'yellow' : 'orange';
  }
  
  return confidence >= 0.5 ? 'yellow' : 'orange';
};

const getVeritasIcon = (veritas: VeritasVerification) => {
  if (!veritas.verified) return ExclamationTriangleIcon;
  
  const { level, confidence } = veritas;
  
  if ((level === 'CRITICAL' || level === 'HIGH') && confidence >= 0.8) {
    return ShieldCheckIcon;
  }
  
  return ShieldExclamationIcon;
};

const getVeritasLabel = (veritas: VeritasVerification): string => {
  if (!veritas.verified) return 'No Verificado';
  
  const { level, confidence } = veritas;
  const confidencePercent = Math.round(confidence * 100);
  
  return `${level} (${confidencePercent}%)`;
};

// ============================================================================
// COMPONENT
// ============================================================================

export const VeritasVerificationBadge: React.FC<VeritasVerificationBadgeProps> = ({
  veritas,
  compact = false,
  showTimestamp = false,
  className = ''
}) => {
  // No veritas data - show nothing or warning
  if (!veritas) {
    if (compact) return null;
    
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs ${className}`}>
        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
        <span>Sin verificar</span>
      </div>
    );
  }

  const color = getVeritasColor(veritas);
  const Icon = getVeritasIcon(veritas);
  const label = getVeritasLabel(veritas);

  // Color classes mapping
  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300',
    red: 'bg-red-100 text-red-800 border-red-300'
  };

  const iconColorClasses = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    orange: 'text-orange-600',
    red: 'text-red-600'
  };

  // Compact mode - minimal badge
  if (compact) {
    return (
      <div
        className={`inline-flex items-center px-1.5 py-0.5 rounded border ${colorClasses[color]} ${className}`}
        title={`Veritas: ${label} | ${veritas.algorithm} | ${new Date(veritas.verifiedAt).toLocaleString()}`}
      >
        <Icon className={`w-3 h-3 ${iconColorClasses[color]}`} />
      </div>
    );
  }

  // Full mode - detailed badge
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colorClasses[color]} ${className}`}>
      <Icon className={`w-4 h-4 ${iconColorClasses[color]}`} />
      
      <div className="flex flex-col">
        <span className="text-xs font-semibold">{label}</span>
        
        {showTimestamp && (
          <span className="text-[10px] opacity-75">
            {new Date(veritas.verifiedAt).toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        )}
      </div>

      {veritas.certificate && (
        <div className="ml-auto">
          <span className="text-[10px] font-mono opacity-60" title={veritas.certificate}>
            {veritas.certificate.substring(0, 8)}...
          </span>
        </div>
      )}
    </div>
  );
};

export default VeritasVerificationBadge;
