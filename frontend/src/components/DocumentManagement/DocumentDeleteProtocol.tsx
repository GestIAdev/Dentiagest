// ⚖️💀 DOCUMENT DELETE PROTOCOL - MULTI-JURISDICTION LEGAL COMPLIANCE
// Date: November 9, 2025
// Mission: Legal-safe document deletion with ES/AR jurisdiction warnings
// Status: Phase 5 - Legal Compliance UI
// @veritas: CRITICAL - Prevents illegal data deletion (€50M+ GDPR fines)

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '../../design-system/Button';
import { Badge } from '../../design-system/Badge';
import { Card, CardHeader, CardBody } from '../../design-system/Card';
import { ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

// 🎯 TYPES
interface Document {
  id: string;
  title: string;
  legal_category?: string;
  unified_type: string;
  created_at: string;
  smart_tags?: string[];
}

interface DocumentDeleteProtocolProps {
  document: Document;
  jurisdiction: 'ES' | 'AR' | 'GDPR';
  onConfirmDelete: (documentId: string) => void;
  onCancel: () => void;
}

// ⚖️ LEGAL RETENTION POLICIES (From LEGAL_DOCUMENT_DELETION_FRAMEWORK.md v2.0)
const RETENTION_POLICIES = {
  ES: {
    medical_simple: 15, // años (Ley 41/2002)
    medical_complex: 999, // permanent (surgery, implant, chronic)
    administrative: 5,
    billing: 4, // años (AEAT)
  },
  AR: {
    medical_all: 999, // PERMANENT (ALL medical in Argentina - STRICTEST)
    administrative: 5,
    billing: 7, // años (AFIP)
  },
  GDPR: {
    medical_simple: 10,
    medical_complex: 999,
    administrative: 3,
    billing: 7,
  },
};

// 🎯 HELPER: Determine if document is deletable
const isDeletable = (
  document: Document,
  jurisdiction: 'ES' | 'AR' | 'GDPR'
): { deletable: boolean; reason: string; retentionYears: number } => {
  const legalCategory = document.legal_category || 'administrative';
  const tags = document.smart_tags || [];
  const isComplex = tags.some(tag => ['surgery', 'implant', 'chronic'].includes(tag));
  
  // ARGENTINA: ALL medical = PERMANENT
  if (jurisdiction === 'AR' && legalCategory === 'medical') {
    return {
      deletable: false,
      reason: 'Argentina: Todos los documentos médicos son PERMANENTES (Ley 25.326)',
      retentionYears: 999,
    };
  }
  
  // SPAIN: Complex medical = PERMANENT
  if (jurisdiction === 'ES' && legalCategory === 'medical' && isComplex) {
    return {
      deletable: false,
      reason: 'España: Documentos médicos complejos (cirugía/implante/crónico) = PERMANENTES (Ley 41/2002)',
      retentionYears: 999,
    };
  }
  
  // SPAIN: Simple medical = 15 years
  if (jurisdiction === 'ES' && legalCategory === 'medical') {
    const ageYears = (Date.now() - new Date(document.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (ageYears < 15) {
      return {
        deletable: false,
        reason: `España: Documentos médicos deben conservarse 15 años (actualmente: ${Math.floor(ageYears)} años)`,
        retentionYears: 15,
      };
    }
    return {
      deletable: true,
      reason: 'España: Documento supera los 15 años de retención',
      retentionYears: 15,
    };
  }
  
  // Administrative/Billing documents
  if (legalCategory === 'administrative' || legalCategory === 'billing') {
    const retentionYears = RETENTION_POLICIES[jurisdiction][
      legalCategory === 'billing' ? 'billing' : 'administrative'
    ] as number;
    const ageYears = (Date.now() - new Date(document.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    if (ageYears < retentionYears) {
      return {
        deletable: false,
        reason: `${jurisdiction}: Documentos ${legalCategory} deben conservarse ${retentionYears} años (actualmente: ${Math.floor(ageYears)} años)`,
        retentionYears,
      };
    }
    return {
      deletable: true,
      reason: `${jurisdiction}: Documento supera los ${retentionYears} años de retención`,
      retentionYears,
    };
  }
  
  // Default: GDPR baseline
  return {
    deletable: true,
    reason: 'GDPR: Categoría no regulada, eliminación permitida',
    retentionYears: 0,
  };
};

// 🎯 MAIN COMPONENT
export const DocumentDeleteProtocol: React.FC<DocumentDeleteProtocolProps> = ({
  document,
  jurisdiction,
  onConfirmDelete,
  onCancel,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteCheck = isDeletable(document, jurisdiction);
  
  const handleDelete = async () => {
    if (!deleteCheck.deletable) {
      toast.error('⚠️ Eliminación no permitida por ley', {
        duration: 5000,
        style: { background: 'linear-gradient(to right, rgb(239 68 68), rgb(251 146 60))' },
      });
      return;
    }
    
    setIsDeleting(true);
    try {
      await onConfirmDelete(document.id);
      toast.success('🗑️ Documento eliminado legalmente', {
        duration: 4000,
        style: { background: 'linear-gradient(to right, rgb(34 197 94), rgb(74 222 128))' },
      });
    } catch (error) {
      toast.error('❌ Error al eliminar documento');
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full cyberpunk-card bg-gray-900 border-2 border-cyan-500/50 shadow-2xl">
        <CardHeader className="border-b border-gray-700 pb-4">
          <div className="flex items-center gap-3">
            {deleteCheck.deletable ? (
              <ShieldCheckIcon className="w-8 h-8 text-green-400" />
            ) : (
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
            )}
            <div>
              <h2 className="cyberpunk-text text-2xl font-bold">
                {deleteCheck.deletable ? '✅ Eliminación Permitida' : '⚠️ Eliminación PROHIBIDA'}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Protocolo de borrado legal · Jurisdicción: {jurisdiction}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="space-y-6 p-6">
          {/* Document Info */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="cyberpunk-text text-lg font-semibold mb-3">📄 Documento</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Título:</span>
                <span className="text-cyan-400 font-medium">{document.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Categoría Legal:</span>
                <Badge variant={document.legal_category === 'medical' ? 'error' : 'warning'}>
                  {document.legal_category || 'Sin categoría'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tipo:</span>
                <span className="text-white">{document.unified_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Antigüedad:</span>
                <span className="text-white">
                  {Math.floor((Date.now() - new Date(document.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365))} años
                </span>
              </div>
            </div>
          </div>
          
          {/* Legal Analysis */}
          <div className={`rounded-lg p-4 border-2 ${
            deleteCheck.deletable 
              ? 'bg-green-500/10 border-green-500/50' 
              : 'bg-red-500/10 border-red-500/50'
          }`}>
            <h3 className="cyberpunk-text text-lg font-semibold mb-2">
              ⚖️ Análisis Legal
            </h3>
            <p className={`text-sm ${deleteCheck.deletable ? 'text-green-400' : 'text-red-400'}`}>
              {deleteCheck.reason}
            </p>
            {deleteCheck.retentionYears > 0 && deleteCheck.retentionYears < 999 && (
              <p className="text-xs text-gray-400 mt-2">
                Período de retención: {deleteCheck.retentionYears} años
              </p>
            )}
            {deleteCheck.retentionYears === 999 && (
              <p className="text-xs text-yellow-400 mt-2 font-semibold">
                ⚠️ RETENCIÓN PERMANENTE - Eliminación NUNCA permitida
              </p>
            )}
          </div>
          
          {/* Warning if not deletable */}
          {!deleteCheck.deletable && (
            <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-lg p-4">
              <p className="text-sm text-yellow-400">
                <strong>⚠️ ADVERTENCIA LEGAL:</strong> Eliminar este documento violaría:
              </p>
              <ul className="list-disc list-inside text-xs text-yellow-300 mt-2 space-y-1">
                {jurisdiction === 'ES' && <li>Ley 41/2002 de autonomía del paciente (España)</li>}
                {jurisdiction === 'AR' && <li>Ley 25.326 de protección de datos personales (Argentina)</li>}
                {jurisdiction === 'GDPR' && <li>GDPR Art. 5.1.e (limitación del plazo de conservación)</li>}
                <li>Posible multa: €50M+ (GDPR) o equivalente local</li>
              </ul>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant={deleteCheck.deletable ? 'danger' : 'ghost'}
              onClick={handleDelete}
              disabled={!deleteCheck.deletable || isDeleting}
              className="flex-1"
            >
              {isDeleting ? 'Eliminando...' : deleteCheck.deletable ? '🗑️ Eliminar Documento' : '🔒 Eliminación Bloqueada'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DocumentDeleteProtocol;
