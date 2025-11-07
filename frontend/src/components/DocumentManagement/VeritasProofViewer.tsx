// 🎯🎸💀 VERITAS PROOF VIEWER V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 26, 2025
// Mission: Quantum truth verification display with zero-knowledge proof visualization
// Status: V3.0 - Full Apollo Nuclear Integration with @veritas Quantum Truth Verification
// Challenge: Visual representation of cryptographic document integrity verification

import React, { useState, useMemo } from 'react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Spinner
} from '../atoms';
import { createModuleLogger } from '../../utils/logger';

// 🎯 ICONS - Heroicons for medical theme
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  LockClosedIcon,
  KeyIcon,
  FingerPrintIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentCheckIcon,
  ClockIcon,
  HashtagIcon
} from '@heroicons/react/24/outline';

// 🎯 TYPES AND INTERFACES
interface VeritasProofViewerProps {
  veritasData: any;
  documentId: string;
  documentTitle: string;
  onVerificationRefresh?: (documentId: string) => void;
  className?: string;
}

interface VeritasProof {
  verified: boolean;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  proof: {
    hash: string;
    signature: string;
    timestamp: string;
    algorithm: string;
    publicKey?: string;
    zeroKnowledgeProof?: any;
  };
  metadata: {
    verifier: string;
    verificationTime: string;
    blockHeight?: number;
    transactionId?: string;
  };
  details?: {
    integrityCheck: boolean;
    authenticityCheck: boolean;
    nonRepudiationCheck: boolean;
    timestampVerification: boolean;
  };
}

const l = createModuleLogger('VeritasProofViewer');

// 🎯 VERITAS CONSTANTS
const VERITAS_LEVELS = {
  CRITICAL: {
    label: 'CRÍTICO',
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-900',
    icon: ShieldCheckIcon,
    description: 'Verificación de máxima seguridad para datos médicos sensibles'
  },
  HIGH: {
    label: 'ALTO',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-900',
    icon: ShieldCheckIcon,
    description: 'Verificación avanzada para documentos importantes'
  },
  MEDIUM: {
    label: 'MEDIO',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-900',
    icon: ShieldExclamationIcon,
    description: 'Verificación estándar para documentos generales'
  },
  LOW: {
    label: 'BAJO',
    color: 'gray',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-900',
    icon: ShieldExclamationIcon,
    description: 'Verificación básica para documentos no críticos'
  }
};

const VERIFICATION_CHECKS = [
  { key: 'integrityCheck', label: 'Integridad', description: 'Verifica que el documento no ha sido alterado' },
  { key: 'authenticityCheck', label: 'Autenticidad', description: 'Confirma la procedencia del documento' },
  { key: 'nonRepudiationCheck', label: 'No Repudio', description: 'Garantiza que no se puede negar la autoría' },
  { key: 'timestampVerification', label: 'Marca de Tiempo', description: 'Verifica la temporalidad del documento' }
];

// 🎯 UTILITY FUNCTIONS
const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const truncateHash = (hash: string, length: number = 16): string => {
  if (hash.length <= length) return hash;
  return `${hash.substring(0, length / 2)}...${hash.substring(hash.length - length / 2)}`;
};

const getVerificationStatusIcon = (verified: boolean) => {
  return verified ? CheckCircleIcon : XCircleIcon;
};

const getVerificationStatusColor = (verified: boolean) => {
  return verified ? 'text-green-600' : 'text-red-600';
};

// 🎯 MAIN COMPONENT - VeritasProofViewer
export const VeritasProofViewer: React.FC<VeritasProofViewerProps> = ({
  veritasData,
  documentId,
  documentTitle,
  onVerificationRefresh,
  className = ''
}) => {
  // 🎯 STATE MANAGEMENT
  const [showDetails, setShowDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 🎯 COMPUTED VALUES
  const proof: VeritasProof | null = useMemo(() => {
    if (!veritasData) return null;

    return {
      verified: veritasData.verified || false,
      level: veritasData.level || 'LOW',
      confidence: veritasData.confidence || 0,
      proof: veritasData.proof || {},
      metadata: veritasData.metadata || {},
      details: veritasData.details || {}
    };
  }, [veritasData]);

  const levelConfig = useMemo(() => {
    return VERITAS_LEVELS[proof?.level as keyof typeof VERITAS_LEVELS] || VERITAS_LEVELS.LOW;
  }, [proof?.level]);

  // 🎯 EVENT HANDLERS
  const handleRefreshVerification = async () => {
    if (!onVerificationRefresh) return;

    setIsRefreshing(true);
    try {
      await onVerificationRefresh(documentId);
      l.info('Veritas verification refreshed', { documentId });
    } catch (error) {
      l.error('Failed to refresh Veritas verification', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsRefreshing(false);
    }
  };

  // 🎯 RENDER HELPERS
  const renderVerificationStatus = () => {
    if (!proof) {
      return (
        <div className="text-center py-8">
          <ShieldExclamationIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin Verificación @veritas
          </h3>
          <p className="text-gray-600 mb-4">
            Este documento no tiene verificación de integridad @veritas.
          </p>
          {onVerificationRefresh && (
            <Button onClick={handleRefreshVerification} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Verificando...
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-4 h-4 mr-2" />
                  Iniciar Verificación
                </>
              )}
            </Button>
          )}
        </div>
      );
    }

    const StatusIcon = proof.verified ? CheckCircleIcon : XCircleIcon;
    const statusColor = proof.verified ? 'text-green-600' : 'text-red-600';
    const statusBg = proof.verified ? 'bg-green-50' : 'bg-red-50';
    const statusBorder = proof.verified ? 'border-green-200' : 'border-red-200';

    return (
      <div className={`${statusBg} border ${statusBorder} rounded-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${levelConfig.bgColor}`}>
              <levelConfig.icon className={`w-6 h-6 ${levelConfig.textColor}`} />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${levelConfig.textColor}`}>
                Nivel {levelConfig.label}
              </h3>
              <p className="text-sm text-gray-600">{levelConfig.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center space-x-2 ${statusColor} mb-1`}>
              <StatusIcon className="w-5 h-5" />
              <span className="font-medium">
                {proof.verified ? 'Verificado' : 'No Verificado'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Confianza: {(proof.confidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Confianza de Verificación</span>
            <span className={statusColor}>{(proof.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                proof.verified ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${proof.confidence * 100}%` }}
            />
          </div>
        </div>

        {/* Verification Details Toggle */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? (
              <>
                <EyeSlashIcon className="w-4 h-4 mr-2" />
                Ocultar Detalles
              </>
            ) : (
              <>
                <EyeIcon className="w-4 h-4 mr-2" />
                Ver Detalles
              </>
            )}
          </Button>
          {onVerificationRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshVerification}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Spinner size="sm" />
              ) : (
                <ShieldCheckIcon className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderVerificationDetails = () => {
    if (!proof || !showDetails) return null;

    return (
      <div className="space-y-6 mt-6">
        {/* Verification Checks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <DocumentCheckIcon className="w-5 h-5 mr-2" />
              Verificaciones Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VERIFICATION_CHECKS.map((check) => {
                const isPassed = proof.details?.[check.key as keyof typeof proof.details] ?? false;
                const StatusIcon = getVerificationStatusIcon(isPassed);
                const statusColor = getVerificationStatusColor(isPassed);

                return (
                  <div key={check.key} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <StatusIcon className={`w-5 h-5 mt-0.5 ${statusColor}`} />
                    <div className="flex-1">
                      <h4 className={`font-medium ${statusColor}`}>{check.label}</h4>
                      <p className="text-sm text-gray-600">{check.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Cryptographic Proof */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <KeyIcon className="w-5 h-5 mr-2" />
              Prueba Criptográfica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hash del Documento
                  </label>
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded font-mono text-sm">
                    <HashtagIcon className="w-4 h-4 text-gray-500" />
                    <span className="truncate">{truncateHash(proof.proof.hash, 32)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Algoritmo
                  </label>
                  <Badge variant="outline" className="font-mono">
                    {proof.proof.algorithm || 'SHA-256'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firma Digital
                </label>
                <div className="p-3 bg-gray-50 rounded font-mono text-sm break-all">
                  {truncateHash(proof.proof.signature, 64)}
                </div>
              </div>

              {proof.proof.zeroKnowledgeProof && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prueba de Conocimiento Cero
                  </label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      ✅ Prueba ZKP válida - Verificación sin revelar contenido
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              Metadatos de Verificación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verificador
                </label>
                <p className="text-sm text-gray-900">{proof.metadata.verifier || 'Sistema Olympus'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Verificación
                </label>
                <p className="text-sm text-gray-900">
                  {formatTimestamp(proof.metadata.verificationTime)}
                </p>
              </div>

              {proof.metadata.blockHeight && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Altura del Bloque
                  </label>
                  <Badge variant="outline" className="font-mono">
                    #{proof.metadata.blockHeight}
                  </Badge>
                </div>
              )}

              {proof.metadata.transactionId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de Transacción
                  </label>
                  <div className="font-mono text-sm bg-gray-50 p-2 rounded truncate">
                    {proof.metadata.transactionId}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timestamp */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FingerPrintIcon className="w-5 h-5 mr-2" />
              Marca de Tiempo Digital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Timestamp Criptográfico</p>
                  <p className="text-sm text-gray-600">
                    {formatTimestamp(proof.proof.timestamp)}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    <LockClosedIcon className="w-4 h-4 mr-1" />
                    Firmado
                  </Badge>
                  <p className="text-xs text-gray-500">No modificable</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 🎯 MAIN RENDER
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card className="cyberpunk-card">
        <CardHeader>
          <CardTitle className="cyberpunk-text flex items-center">
            <ShieldCheckIcon className="w-6 h-6 mr-2" />
            Verificación @veritas - Quantum Truth
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Documento: {documentTitle}
          </p>
        </CardHeader>
      </Card>

      {/* Verification Status */}
      {renderVerificationStatus()}

      {/* Detailed Information */}
      {renderVerificationDetails()}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-6">
        <p>🔐 Verificación criptográfica @veritas - Integridad garantizada</p>
        <p className="mt-1">Sistema Olympus V3.0 - Quantum Truth Verification</p>
      </div>
    </div>
  );
};

export default VeritasProofViewer;
