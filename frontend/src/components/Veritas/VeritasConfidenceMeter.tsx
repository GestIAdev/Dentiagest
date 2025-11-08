// 🔐📊 VERITAS CONFIDENCE METER - VISUAL CONFIDENCE INDICATOR
// Date: November 8, 2025
// Mission: Animated confidence meter for quantum verification
// Status: V3 - Production Ready

import React from 'react';
import { VeritasVerification } from './VeritasVerificationBadge';

interface VeritasConfidenceMeterProps {
  veritas?: VeritasVerification | null;
  showLabel?: boolean;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VeritasConfidenceMeter: React.FC<VeritasConfidenceMeterProps> = ({
  veritas,
  showLabel = true,
  showPercentage = true,
  size = 'md',
  className = ''
}) => {
  if (!veritas) return null;

  const confidence = veritas.confidence * 100;
  const verified = veritas.verified;

  // Size classes
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  // Color based on confidence
  const getColor = (): string => {
    if (!verified) return 'bg-red-500';
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    if (confidence >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const barColor = getColor();

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-700">
            Confianza Quantum
          </span>
          {showPercentage && (
            <span className="text-xs font-semibold text-gray-900">
              {confidence.toFixed(1)}%
            </span>
          )}
        </div>
      )}

      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${barColor} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${confidence}%` }}
        >
          {/* Animated shine effect */}
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-25 animate-shimmer" />
        </div>
      </div>

      {!verified && (
        <p className="text-[10px] text-red-600 mt-1">
          ⚠️ Verificación fallida
        </p>
      )}
    </div>
  );
};

export default VeritasConfidenceMeter;
