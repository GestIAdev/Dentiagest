// 🔐📜 VERITAS AUDIT TRAIL - VERIFICATION HISTORY TIMELINE
// Date: November 8, 2025
// Mission: Display verification history with timeline
// Status: V3 - Production Ready

import React from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { VeritasVerification } from './VeritasVerificationBadge';

export interface VeritasAuditEntry {
  id: string;
  fieldName: string;
  veritas: VeritasVerification;
  timestamp: string;
}

interface VeritasAuditTrailProps {
  entries: VeritasAuditEntry[];
  maxEntries?: number;
  compact?: boolean;
  className?: string;
}

export const VeritasAuditTrail: React.FC<VeritasAuditTrailProps> = ({
  entries,
  maxEntries = 10,
  compact = false,
  className = ''
}) => {
  if (!entries || entries.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <ClockIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No hay historial de verificaciones</p>
      </div>
    );
  }

  const displayEntries = entries.slice(0, maxEntries);

  return (
    <div className={`space-y-3 ${className}`}>
      {displayEntries.map((entry, index) => {
        const isVerified = entry.veritas.verified;
        const confidence = Math.round(entry.veritas.confidence * 100);
        const isRecent = index === 0;

        return (
          <div
            key={entry.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              isRecent ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
            } transition-colors`}
          >
            {/* Status Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {isVerified ? (
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              ) : (
                <XCircleIcon className="w-5 h-5 text-red-600" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Field name */}
              <p className="text-sm font-semibold text-gray-900 truncate">
                {entry.fieldName}
              </p>

              {/* Verification details */}
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {entry.veritas.level}
                </span>
                <span className="text-xs text-gray-600">
                  {confidence}% confianza
                </span>
                {!compact && (
                  <span className="text-xs text-gray-500">
                    · {entry.veritas.algorithm}
                  </span>
                )}
              </div>

              {/* Timestamp */}
              <p className="text-xs text-gray-500 mt-1">
                {new Date(entry.timestamp).toLocaleString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>

              {/* Error message if verification failed */}
              {!isVerified && entry.veritas.error && (
                <p className="text-xs text-red-600 mt-2 italic">
                  ⚠️ {entry.veritas.error}
                </p>
              )}

              {/* Certificate preview */}
              {!compact && entry.veritas.certificate && (
                <p className="text-[10px] font-mono text-gray-400 mt-2 truncate" title={entry.veritas.certificate}>
                  Cert: {entry.veritas.certificate.substring(0, 32)}...
                </p>
              )}
            </div>

            {/* Recent indicator */}
            {isRecent && (
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-600 text-white">
                  Reciente
                </span>
              </div>
            )}
          </div>
        );
      })}

      {entries.length > maxEntries && (
        <p className="text-xs text-gray-500 text-center pt-2">
          Mostrando {maxEntries} de {entries.length} verificaciones
        </p>
      )}
    </div>
  );
};

export default VeritasAuditTrail;
