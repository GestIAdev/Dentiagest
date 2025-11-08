// 🔐📋 VERITAS PANEL - COMPLETE VERIFICATION PANEL
// Date: November 8, 2025
// Mission: Comprehensive verification panel with all details
// Status: V3 - Production Ready

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { VeritasVerification, VeritasVerificationBadge } from './VeritasVerificationBadge';
import { VeritasConfidenceMeter } from './VeritasConfidenceMeter';

interface VeritasField {
  fieldName: string;
  displayName: string;
  veritas: VeritasVerification;
  value?: any;
}

interface VeritasPanelProps {
  fields: VeritasField[];
  title?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  showValues?: boolean;
  className?: string;
}

export const VeritasPanel: React.FC<VeritasPanelProps> = ({
  fields,
  title = 'Verificación Quantum',
  collapsible = true,
  defaultExpanded = false,
  showValues = false,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!fields || fields.length === 0) return null;

  // Calculate overall statistics
  const totalFields = fields.length;
  const verifiedFields = fields.filter(f => f.veritas.verified).length;
  const avgConfidence = fields.reduce((sum, f) => sum + f.veritas.confidence, 0) / totalFields;
  const verificationRate = (verifiedFields / totalFields) * 100;

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className={`bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 ${
          collapsible ? 'cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors' : ''
        }`}
        onClick={() => collapsible && setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <span className="text-xs text-gray-600">
              {verifiedFields}/{totalFields} verificados
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-600">Confianza promedio</p>
              <p className="text-sm font-semibold text-gray-900">
                {Math.round(avgConfidence * 100)}%
              </p>
            </div>

            {collapsible && (
              <button className="p-1 hover:bg-white rounded transition-colors">
                {expanded ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                verificationRate >= 80
                  ? 'bg-green-500'
                  : verificationRate >= 60
                    ? 'bg-yellow-500'
                    : 'bg-orange-500'
              }`}
              style={{ width: `${verificationRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {(!collapsible || expanded) && (
        <div className="divide-y divide-gray-100">
          {fields.map((field, index) => (
            <div key={index} className="px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                {/* Field info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {field.displayName}
                  </p>
                  
                  {showValues && field.value !== undefined && (
                    <p className="text-xs text-gray-600 mb-2 font-mono truncate">
                      {String(field.value)}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <VeritasVerificationBadge veritas={field.veritas} compact />
                    <span className="text-xs text-gray-500">
                      {field.veritas.algorithm}
                    </span>
                  </div>
                </div>

                {/* Confidence meter */}
                <div className="flex-shrink-0 w-32">
                  <VeritasConfidenceMeter
                    veritas={field.veritas}
                    showLabel={false}
                    showPercentage
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VeritasPanel;
