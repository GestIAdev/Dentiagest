// 🎯🎸🛡️ REGULATION DETAIL VIEW V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 25, 2025
// Mission: Regulation detail view with @veritas quantum verification
// Status: V3.0 - Full regulation details with quantum truth verification
// Challenge: Regulatory compliance details with AI insights and quantum validation
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on regulation data

import React from 'react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Spinner } from '../atoms/index';
import { createModuleLogger } from '../../utils/logger';

// 🎯 ICONS - Heroicons for compliance theme
import {
  XMarkIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CpuChipIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// 🎯 REGULATION DETAIL VIEW V3.0 INTERFACE
interface RegulationDetailViewV3Props {
  regulation: ComplianceRegulation;
  onClose: () => void;
}

// 🎯 COMPLIANCE REGULATION INTERFACE - @veritas Enhanced
interface ComplianceRegulation {
  id: string;
  name: string;
  name_veritas?: string;
  description: string;
  description_veritas?: string;
  category: string;
  version: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  status_veritas?: string;
  complianceDeadline: string;
  complianceScore: number;
  complianceScore_veritas?: number;
  responsibleParty: string;
  _veritas?: {
    verified: boolean;
    confidence: number;
    level: string;
    certificate: string;
    error?: string;
    verifiedAt: string;
    algorithm: string;
  };
}

// 🎯 STATUS CONFIGURATION - Cyberpunk Theme
const REGULATION_STATUS_CONFIG = {
  ACTIVE: { label: 'Activa', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30', icon: CheckCircleIcon },
  INACTIVE: { label: 'Inactiva', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30', icon: XCircleIcon },
  EXPIRED: { label: 'Expirada', bgColor: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30', icon: ExclamationTriangleIcon }
};

// 🎯 LOGGER - Module specific logger
const l = createModuleLogger('RegulationDetailViewV3');

export const RegulationDetailViewV3: React.FC<RegulationDetailViewV3Props> = ({
  regulation,
  onClose
}) => {
  // 🎯 GET STATUS INFO - Cyberpunk Themed
  const getStatusInfo = (status: string) => {
    return REGULATION_STATUS_CONFIG[status as keyof typeof REGULATION_STATUS_CONFIG] || REGULATION_STATUS_CONFIG.ACTIVE;
  };

  // 🎯 FORMAT FUNCTIONS
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const statusInfo = getStatusInfo(regulation.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 🎯 BACKDROP - Quantum Effect */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* 🎯 MODAL - Cyberpunk Medical Theme */}
      <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 backdrop-blur-sm border border-cyan-500/20 shadow-2xl shadow-cyan-500/25">
        {/* 🎯 HEADER - Quantum Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse pointer-events-none"></div>

        <CardHeader className="relative border-b border-gray-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🎯 Detalles de Regulación V3.0
                </CardTitle>
                <p className="text-gray-300 text-sm mt-1">
                  Información completa con verificación cuántica @veritas
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-700/50"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        {/* 🎯 CONTENT - Modular Layout */}
        <CardContent className="relative p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="space-y-6">
            {/* 🎯 HEADER INFO - Primary Section */}
            <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-lg p-6 border border-cyan-500/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                    <StatusIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                      <span>{regulation.name}</span>
                      {regulation._veritas && (
                        <ShieldCheckIcon className="w-6 h-6 text-green-400" />
                      )}
                    </h1>
                    <p className="text-gray-300 text-lg">{regulation.category} • v{regulation.version}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor} text-lg px-4 py-2`}>
                    {statusInfo.label}
                  </Badge>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-cyan-400">{formatPercentage(regulation.complianceScore)}</span>
                    <p className="text-gray-400 text-sm">Puntuación de Cumplimiento</p>
                  </div>
                </div>
              </div>

              {/* 🎯 @VERITAS VERIFICATION - Quantum Badge */}
              {regulation._veritas && (
                <div className="flex items-center space-x-3 mt-4 p-3 bg-gray-800/30 rounded-lg border border-green-500/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <BoltIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-green-300">
                      Verificación @veritas: {regulation._veritas.confidence}% Confianza
                    </h4>
                    <p className="text-green-400/80 text-xs">
                      Algoritmo: {regulation._veritas.algorithm} • Nivel: {regulation._veritas.level}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 🎯 DESCRIPTION - Content Section */}
            <Card className="bg-gray-800/30 border border-gray-600/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-cyan-300 flex items-center space-x-2">
                  <DocumentTextIcon className="w-5 h-5" />
                  <span>Descripción</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">{regulation.description}</p>
              </CardContent>
            </Card>

            {/* 🎯 COMPLIANCE DETAILS - Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800/30 border border-gray-600/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-purple-300 flex items-center space-x-2">
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Detalles de Cumplimiento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Estado:</span>
                    <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Categoría:</span>
                    <span className="text-white font-medium">{regulation.category}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Versión:</span>
                    <span className="text-white font-medium">v{regulation.version}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Responsable:</span>
                    <span className="text-white font-medium">{regulation.responsibleParty}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/30 border border-gray-600/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-pink-300 flex items-center space-x-2">
                    <CpuChipIcon className="w-5 h-5" />
                    <span>Fechas Importantes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Fecha Límite:</span>
                    <span className="text-white font-medium">{formatDate(regulation.complianceDeadline)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Puntuación:</span>
                    <span className="text-cyan-400 font-bold text-lg">{formatPercentage(regulation.complianceScore)}</span>
                  </div>

                  {regulation.status === 'EXPIRED' && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                        <span className="text-red-300 font-medium">¡Regulación Expirada!</span>
                      </div>
                      <p className="text-red-400/80 text-sm mt-1">
                        Esta regulación ha expirado y requiere atención inmediata.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 🎯 VERITAS VERIFICATION DETAILS - Advanced Section */}
            {regulation._veritas && (
              <Card className="bg-gradient-to-r from-green-500/5 via-cyan-500/5 to-purple-500/5 border border-green-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-300 flex items-center space-x-2">
                    <BoltIcon className="w-5 h-5" />
                    <span>Verificación Cuántica @veritas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Estado:</span>
                        <span className={`font-medium ${regulation._veritas.verified ? 'text-green-400' : 'text-red-400'}`}>
                          {regulation._veritas.verified ? 'Verificado' : 'No Verificado'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Confianza:</span>
                        <span className="text-cyan-400 font-mono">{regulation._veritas.confidence}%</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Nivel:</span>
                        <span className="text-purple-400">{regulation._veritas.level}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Algoritmo:</span>
                        <span className="text-pink-400 font-mono text-sm">{regulation._veritas.algorithm}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Verificado:</span>
                        <span className="text-white">{formatDate(regulation._veritas.verifiedAt)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Certificado:</span>
                        <span className="text-green-400 font-mono text-xs">{regulation._veritas.certificate.substring(0, 16)}...</span>
                      </div>
                    </div>
                  </div>

                  {regulation._veritas.error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                        <span className="text-red-300 text-sm">Error de Verificación</span>
                      </div>
                      <p className="text-red-400/80 text-xs mt-1">{regulation._veritas.error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>

        {/* 🎯 FOOTER - Action Buttons */}
        <div className="relative border-t border-gray-600/30 p-6">
          <div className="flex items-center justify-end">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-cyan-500/25"
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Cerrar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RegulationDetailViewV3;