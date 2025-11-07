// 🎯🎸🛡️ AUDIT DETAIL VIEW V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 25, 2025
// Mission: Audit detail view with @veritas quantum verification
// Status: V3.0 - Full audit details with quantum truth verification
// Challenge: Regulatory audit details with AI insights and quantum validation
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on audit data

import React from 'react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Spinner } from '../atoms/index';
import { createModuleLogger } from '../../utils/logger';

// 🎯 ICONS - Heroicons for compliance theme
import {
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  CpuChipIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// 🎯 AUDIT DETAIL VIEW V3.0 INTERFACE
interface AuditDetailViewV3Props {
  audit: ComplianceAudit;
  onClose: () => void;
}

// 🎯 COMPLIANCE AUDIT INTERFACE - @veritas Enhanced
interface ComplianceAudit {
  id: string;
  title: string;
  title_veritas?: string;
  type: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  status_veritas?: string;
  scheduledDate: string;
  auditor: string;
  overallScore?: number;
  overallScore_veritas?: number;
  findings: ComplianceFinding[];
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
const AUDIT_STATUS_CONFIG = {
  SCHEDULED: { label: 'Programada', bgColor: 'bg-blue-500/20', textColor: 'text-blue-300', borderColor: 'border-blue-500/30', icon: ClockIcon },
  IN_PROGRESS: { label: 'En Progreso', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30', icon: BoltIcon },
  COMPLETED: { label: 'Completada', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30', icon: CheckCircleIcon },
  CANCELLED: { label: 'Cancelada', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30', icon: XCircleIcon }
};

const FINDING_SEVERITY_CONFIG = {
  CRITICAL: { label: 'Crítico', bgColor: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30' },
  HIGH: { label: 'Alto', bgColor: 'bg-orange-500/20', textColor: 'text-orange-300', borderColor: 'border-orange-500/30' },
  MEDIUM: { label: 'Medio', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30' },
  LOW: { label: 'Bajo', bgColor: 'bg-blue-500/20', textColor: 'text-blue-300', borderColor: 'border-blue-500/30' }
};

const FINDING_STATUS_CONFIG = {
  OPEN: { label: 'Abierto', bgColor: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30' },
  IN_PROGRESS: { label: 'En Progreso', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30' },
  RESOLVED: { label: 'Resuelto', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30' },
  CLOSED: { label: 'Cerrado', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30' }
};

// 🎯 LOGGER - Module specific logger
const l = createModuleLogger('AuditDetailViewV3');

export const AuditDetailViewV3: React.FC<AuditDetailViewV3Props> = ({
  audit,
  onClose
}) => {
  // 🎯 GET STATUS INFO - Cyberpunk Themed
  const getStatusInfo = (status: string) => {
    return AUDIT_STATUS_CONFIG[status as keyof typeof AUDIT_STATUS_CONFIG] || AUDIT_STATUS_CONFIG.SCHEDULED;
  };

  const getFindingSeverityInfo = (severity: string) => {
    return FINDING_SEVERITY_CONFIG[severity as keyof typeof FINDING_SEVERITY_CONFIG] || FINDING_SEVERITY_CONFIG.LOW;
  };

  const getFindingStatusInfo = (status: string) => {
    return FINDING_STATUS_CONFIG[status as keyof typeof FINDING_STATUS_CONFIG] || FINDING_STATUS_CONFIG.OPEN;
  };

  // 🎯 FORMAT FUNCTIONS
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const statusInfo = getStatusInfo(audit.status);
  const StatusIcon = statusInfo.icon;

  // 🎯 FINDINGS SUMMARY
  const findingsSummary = audit.findings.reduce((acc, finding) => {
    acc[finding.severity] = (acc[finding.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 🎯 BACKDROP - Quantum Effect */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* 🎯 MODAL - Cyberpunk Medical Theme */}
      <Card className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 backdrop-blur-sm border border-purple-500/20 shadow-2xl shadow-purple-500/25">
        {/* 🎯 HEADER - Quantum Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse pointer-events-none"></div>

        <CardHeader className="relative border-b border-gray-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <ClipboardDocumentCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🎯 Detalles de Auditoría V3.0
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
            <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 rounded-lg p-6 border border-purple-500/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <StatusIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                      <span>{audit.title}</span>
                      {audit._veritas && (
                        <BoltIcon className="w-6 h-6 text-green-400" />
                      )}
                    </h1>
                    <p className="text-gray-300 text-lg">{audit.type} • Auditor: {audit.auditor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor} text-lg px-4 py-2`}>
                    {statusInfo.label}
                  </Badge>
                  {audit.overallScore && (
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-purple-400">{formatPercentage(audit.overallScore)}</span>
                      <p className="text-gray-400 text-sm">Puntuación General</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 🎯 @VERITAS VERIFICATION - Quantum Badge */}
              {audit._veritas && (
                <div className="flex items-center space-x-3 mt-4 p-3 bg-gray-800/30 rounded-lg border border-green-500/20">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <BoltIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-green-300">
                      Verificación @veritas: {audit._veritas.confidence}% Confianza
                    </h4>
                    <p className="text-green-400/80 text-xs">
                      Algoritmo: {audit._veritas.algorithm} • Nivel: {audit._veritas.level}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 🎯 AUDIT DETAILS - Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800/30 border border-gray-600/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-cyan-300 flex items-center space-x-2">
                    <ClipboardDocumentCheckIcon className="w-5 h-5" />
                    <span>Detalles de Auditoría</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Tipo:</span>
                    <span className="text-white font-medium">{audit.type}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Estado:</span>
                    <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Auditor:</span>
                    <span className="text-white font-medium">{audit.auditor}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Programada:</span>
                    <span className="text-white font-medium">{formatDate(audit.scheduledDate)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/30 border border-gray-600/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-pink-300 flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <span>Resumen de Hallazgos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total de Hallazgos:</span>
                    <span className="text-white font-bold text-lg">{audit.findings.length}</span>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(findingsSummary).map(([severity, count]) => {
                      const severityInfo = getFindingSeverityInfo(severity);
                      return (
                        <div key={severity} className="flex justify-between items-center">
                          <span className="text-gray-400">{severityInfo.label}:</span>
                          <Badge className={`${severityInfo.bgColor} ${severityInfo.textColor} border ${severityInfo.borderColor}`}>
                            {count}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>

                  {audit.overallScore && (
                    <div className="pt-3 border-t border-gray-600/30">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Puntuación General:</span>
                        <span className="text-purple-400 font-bold text-lg">{formatPercentage(audit.overallScore)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 🎯 FINDINGS LIST - Findings Section */}
            {audit.findings.length > 0 && (
              <Card className="bg-gray-800/30 border border-gray-600/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-orange-300 flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <span>Hallazgos ({audit.findings.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {audit.findings.map((finding) => {
                      const severityInfo = getFindingSeverityInfo(finding.severity);
                      const statusInfo = getFindingStatusInfo(finding.status);

                      return (
                        <Card key={finding.id} className="bg-gray-800/20 border border-gray-600/20">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                                  <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-white font-semibold flex items-center space-x-2">
                                    <span>{finding.category}</span>
                                    {finding._veritas && (
                                      <BoltIcon className="w-4 h-4 text-green-400" />
                                    )}
                                  </h4>
                                  <p className="text-gray-400 text-sm">
                                    Asignado a: {finding.assignedTo}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={`${severityInfo.bgColor} ${severityInfo.textColor} border ${severityInfo.borderColor}`}>
                                  {severityInfo.label}
                                </Badge>
                                <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                                  {statusInfo.label}
                                </Badge>
                              </div>
                            </div>

                            <p className="text-gray-300 text-sm mb-3">{finding.description}</p>

                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Vence: {formatDate(finding.dueDate)}</span>
                              {finding._veritas && (
                                <div className="flex items-center space-x-1">
                                  <BoltIcon className="w-4 h-4 text-green-400" />
                                  <span className="text-green-400 text-xs font-mono">
                                    @veritas {finding._veritas.confidence}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 🎯 VERITAS VERIFICATION DETAILS - Advanced Section */}
            {audit._veritas && (
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
                        <span className={`font-medium ${audit._veritas.verified ? 'text-green-400' : 'text-red-400'}`}>
                          {audit._veritas.verified ? 'Verificado' : 'No Verificado'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Confianza:</span>
                        <span className="text-cyan-400 font-mono">{audit._veritas.confidence}%</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Nivel:</span>
                        <span className="text-purple-400">{audit._veritas.level}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Algoritmo:</span>
                        <span className="text-pink-400 font-mono text-sm">{audit._veritas.algorithm}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Verificado:</span>
                        <span className="text-white">{formatDate(audit._veritas.verifiedAt)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-400">Certificado:</span>
                        <span className="text-green-400 font-mono text-xs">{audit._veritas.certificate.substring(0, 16)}...</span>
                      </div>
                    </div>
                  </div>

                  {audit._veritas.error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                        <span className="text-red-300 text-sm">Error de Verificación</span>
                      </div>
                      <p className="text-red-400/80 text-xs mt-1">{audit._veritas.error}</p>
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
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
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

export default AuditDetailViewV3;
