// 🔐✨ VERITAS FIELD INDICATOR - INLINE FIELD VERIFICATION
// Date: November 8, 2025
// Mission: Inline verification indicator for form fields
// Status: V3 - Production Ready

import React, { useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { VeritasVerification } from './VeritasVerificationBadge';

interface VeritasFieldIndicatorProps {
  veritas?: VeritasVerification | null;
  fieldName?: string;
  position?: 'left' | 'right';
  showTooltip?: boolean;
  className?: string;
}

export const VeritasFieldIndicator: React.FC<VeritasFieldIndicatorProps> = ({
  veritas,
  fieldName,
  position = 'right',
  showTooltip = true,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!veritas) return null;

  const isVerified = veritas.verified;
  const confidence = Math.round(veritas.confidence * 100);

  // Icon selection
  const Icon = isVerified
    ? confidence >= 80
      ? CheckCircleIcon
      : ExclamationCircleIcon
    : ExclamationCircleIcon;

  // Color selection
  const iconColor = isVerified
    ? confidence >= 80
      ? 'text-green-500'
      : confidence >= 60
      ? 'text-yellow-500'
      : 'text-orange-500'
    : 'text-red-500';

  const positionClasses = position === 'left' ? 'mr-2' : 'ml-2';

  return (
    <div className={`inline-flex items-center ${positionClasses} ${className}`}>
      {/* Icon */}
      <div
        className="relative cursor-help"
        onMouseEnter={() => showTooltip && setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        <Icon className={`w-4 h-4 ${iconColor}`} />

        {/* Tooltip */}
        {showTooltip && showDetails && (
          <div className="absolute z-50 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
            
            <div className="space-y-2">
              {fieldName && (
                <p className="font-semibold border-b border-gray-700 pb-1">
                  {fieldName}
                </p>
              )}
              
              <div className="space-y-1">
                <p>
                  <span className="text-gray-400">Estado:</span>{' '}
                  <span className={isVerified ? 'text-green-400' : 'text-red-400'}>
                    {isVerified ? 'Verificado' : 'No verificado'}
                  </span>
                </p>
                
                <p>
                  <span className="text-gray-400">Nivel:</span> {veritas.level}
                </p>
                
                <p>
                  <span className="text-gray-400">Confianza:</span> {confidence}%
                </p>
                
                <p>
                  <span className="text-gray-400">Algoritmo:</span> {veritas.algorithm}
                </p>
                
                <p className="text-[10px] text-gray-500">
                  {new Date(veritas.verifiedAt).toLocaleString('es-ES')}
                </p>
              </div>

              {veritas.error && (
                <p className="text-red-400 text-[10px] mt-2 pt-2 border-t border-gray-700">
                  ⚠️ {veritas.error}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VeritasFieldIndicator;
