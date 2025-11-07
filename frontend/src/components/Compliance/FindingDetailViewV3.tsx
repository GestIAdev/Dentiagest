// 🎯🎸🛡️ FINDING DETAIL VIEW V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 25, 2025
// Mission: Finding detail view with @veritas quantum verification
// Status: V3.0 - Full finding details with quantum truth verification
// Challenge: Regulatory finding details with AI insights and quantum validation
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on finding data

import React from 'react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Spinner } from '../atoms/index';
import { createModuleLogger } from '../../utils/logger';

// 🎯 ICONS - Heroicons for compliance theme
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// 🎯 FINDING DETAIL VIEW V3.0 INTERFACE
interface FindingDetailViewV3Props {
  finding: ComplianceFinding;
  onClose: () => void;
}

// 🎯 COMPLIANCE FINDING INTERFACE - @veritas Enhanced
interface ComplianceFinding {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  severity_veritas?: string;
  category: string;
  description: string;
  description_veritas?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  status_veritas?: string;
  assignedTo: string;
  dueDate: string;
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
const FINDING_SEVERITY_CONFIG = {
  CRITICAL: { label: 'Crítico', bgColor: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30', icon: ExclamationTriangleIcon },
  HIGH: { label: 'Alto', bgColor: 'bg-orange-500/20', textColor: 'text-orange-300', borderColor: 'border-orange-500/30', icon: ExclamationTriangleIcon },
  MEDIUM: { label: 'Medio', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30', icon: ClockIcon },
  LOW: { label: 'Bajo', bgColor: 'bg-blue-500/20', textColor: 'text-blue-300', borderColor: 'border-blue-500/30', icon: CheckCircleIcon }
};

const FINDING_STATUS_CONFIG = {
  OPEN: { label: 'Abierto', bgColor: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30', icon: XCircleIcon },
  IN_PROGRESS: { label: 'En Progreso', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30', icon: ClockIcon },
  RESOLVED: { label: 'Resuelto', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30', icon: CheckCircleIcon },
  CLOSED: { label: 'Cerrado', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30', icon: CheckCircleIcon }
};

// 🎯 LOGGER - Module specific logger
const l = createModuleLogger('FindingDetailViewV3');

export const FindingDetailViewV3: React.FC<FindingDetailViewV3Props> = ({
  finding,
  onClose
}) => {
  // 🎯 GET STATUS INFO - Cyberpunk Themed
  const getSeverityInfo = (severity: string) => {
    return FINDING_SEVERITY_CONFIG[severity as keyof typeof FINDING_SEVERITY_CONFIG] || FINDING_SEVERITY_CONFIG.LOW;
  };

  const getStatusInfo = (status: string) => {
    return FINDING_STATUS_CONFIG[status as keyof typeof FINDING_STATUS_CONFIG] || FINDING_STATUS_CONFIG.OPEN;
  };

  // 🎯 FORMAT FUNCTIONS
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const severityInfo = getSeverityInfo(finding.severity);
  const statusInfo = getStatusInfo(finding.status);
  const SeverityIcon = severityInfo.icon;
  const StatusIcon = statusInfo.icon;

  // 🎯 DAYS UNTIL DUE
  const daysUntilDue = Math.ceil((new Date(finding.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 7;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 🎯 BACKDROP - Quantum Effect */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* 🎯 MODAL - Cyberpunk Medical Theme */}
      <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 backdrop-blur-sm border border-orange-500/20 shadow-2xl shadow-orange-500/25">
        {/* 🎯 HEADER - Quantum Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse pointer-events-none"></div>

        <CardHeader className="relative border-b border-gray-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                <SeverityIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🎯 Detalles del Hallazgo V3.0
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
            <div className="bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 rounded-lg p-6 border border-orange-500/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <SeverityIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                      <span>{finding.category}</span>
                      {finding._veritas && (
                        <BoltIcon className="w-6 h-6 text-green-400" />
                      )}
                    </h1>
                    <p className="text-gray-300 text-lg">Asignado a: {finding.assignedTo}</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge className={`${severityInfo.bgColor} ${severityInfo.textColor} border ${severityInfo.borderColor} text-lg px-4 py-2`}>
                    {severityInfo.label}
                  </Badge>
                  <div>
                    <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor} text-sm px-3 py-1`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 🎯 DUE DATE WARNING */}
              {(isOverdue || isDueSoon) && (
                <div className={`p-3 rounded-lg border ${isOverdue ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className={`w-5 h-5 ${isOverdue ? 'text-red-400' : 'text-yellow-400'}`} />
                    <span className={`font-medium ${isOverdue ? 'text-red-300' : 'text-yellow-300'}`}>
                      {isOverdue ? '¡Hallazgo Vencido!' : '¡Vence Pronto!'}
                    </span>
                  </div>
                  <p className={`${isOverdue ? 'text-red-400/80' : 'text-yellow-400/80'} text-sm mt-1`}>
                    {isOverdue
                      ? `Venció hace ${Math.abs(daysUntilDue)} día(s)`
                      : `Vence en ${daysUntilDue} día(s)`
                    }
                  </p>
                </div>
              )}

              {/* 🎯 @VERITAS VERIFICATION - Quantum Badge */}
              {finding._veritas && (
                <div className="flex items-center space-x-3 mt-4 p-3 bg-gray-800/30 rounded-lg border border-green-500/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <BoltIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-green-300">
                      Verificación @veritas: {finding._veritas.confidence}% Confianza
                    </h4>
                    <p className="text-green-400/80 text-xs">
                      Algoritmo: {finding._veritas.algorithm} • Nivel: {finding._veritas.level}
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
                  <span>Descripción del Hallazgo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">{finding.description}</p>
              </CardContent>
            </Card>

            {/* 🎯 FINDING DETAILS - Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800/30 border border-gray-600/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-purple-300 flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <span>Detalles del Hallazgo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Categoría:</span>
                    <span className="text-white font-medium">{finding.category}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Severidad:</span>
                    <Badge className={`${severityInfo.bgColor} ${severityInfo.textColor} border ${severityInfo.borderColor}`}>
                      {severityInfo.label}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Estado:</span>
                    <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Asignado a:</span>
                    <span className="text-white font-medium">{finding.assignedTo}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/30 border border-gray-600/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-pink-300 flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5" />
                    <span>Fechas Importantes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Fecha de Vencimiento:</span>
                    <span className={`font-medium ${isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : 'text-white'}`}>
                      {formatDate(finding.dueDate)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Días Restantes:</span>
                    <span className={`font-bold text-lg ${isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : 'text-green-400'}`}>
                      {isOverdue ? `${Math.abs(daysUntilDue)} días atrasado` : `${daysUntilDue} días`}
                    </span>
                  </div>

                  {finding.status === 'OPEN' && finding.severity === 'CRITICAL' && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                        <span className="text-red-300 font-medium text-sm">Acción Requerida</span>
                      </div>
                      <p className="text-red-400/80 text-xs mt-1">
                        Este hallazgo crítico requiere atención inmediata.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 🎯 VERITAS VERIFICATION DETAILS - Advanced Section */}
            {finding._veritas && (
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
                        <span className={`font-medium ${finding._veritas.verified ? 'text-green-400' : 'text-red-400'}`}>
                          {finding._veritas.verified ? 'Verificado' : 'No Verificado'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Confianza:</span>
                        <span className="text-cyan-400 font-mono">{finding._veritas.confidence}%</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Nivel:</span>
                        <span className="text-purple-400">{finding._veritas.level}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Algoritmo:</span>
                        <span className="text-pink-400 font-mono text-sm">{finding._veritas.algorithm}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Verificado:</span>
                        <span className="text-white">{formatDateTime(finding._veritas.verifiedAt)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Certificado:</span>
                        <span className="text-green-400 font-mono text-xs">{finding._veritas.certificate.substring(0, 16)}...</span>
                      </div>
                    </div>
                  </div>

                  {finding._veritas.error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                        <span className="text-red-300 text-sm">Error de Verificación</span>
                      </div>
                      <p className="text-red-400/80 text-xs mt-1">{finding._veritas.error}</p>
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
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25"
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

export default FindingDetailViewV3;
