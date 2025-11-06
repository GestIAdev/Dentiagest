// 🗑️ LEGAL DOCUMENT DELETION COMPONENT - ARGENTINA COMPLIANCE
/**
 * DeleteDocumentButton - Legal-compliant document deletion system
 * 
 * Features:
 * 🚫 Medical documents: NEVER DELETE (protected by law)
 * ✅ Administrative documents: Soft delete with approval workflow
 * ⚖️ Legal warnings and compliance checks
 * 📋 Complete audit trail
 * 
 * Compliance: Argentina Ley 25.326 + Medical Practice Law
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import apollo from '../../apollo'; // 🚀 APOLLO NUCLEAR - WEBPACK EXTENSION EXPLICIT!
import {
  TrashIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// � APOLLO API ARCHITECTURE - buildApiUrl eliminated, centralized in apollo service

interface MedicalDocument {
  id: string;
  title: string;
  document_type: string;
  category: string;
  created_at: string;
  patient_id: string;
  access_level: string;
}

interface DeletionEligibility {
  document_id: string;
  category: string;
  deletable: boolean;
  retention_period_met: boolean;
  user_authorized: boolean;
  document_age_years: number;
  min_retention_years: number;
  legal_basis: string;
  can_request_deletion: boolean;
  restriction_reason?: string;
  patient_safety_notice?: string;
}

interface DeletionRequest {
  id: string;
  status: string;
  deletion_reason: string;
  user_justification: string;
  grace_period_end?: string;
  final_deletion_date?: string;
}

// 🏛️ LEGAL DELETION REASONS
const DELETION_REASONS = {
  'retention_period_expired': 'Período de retención legal cumplido',
  'administrative_cleanup': 'Limpieza administrativa',
  'data_minimization': 'Minimización de datos (GDPR)',
  'duplicate_document': 'Documento duplicado',
  'legal_compliance': 'Cumplimiento legal'
};

interface DeleteDocumentButtonProps {
  document: MedicalDocument;
  onDeletionRequested?: () => void;
  className?: string;
}

export const DeleteDocumentButton: React.FC<DeleteDocumentButtonProps> = ({
  document,
  onDeletionRequested,
  className = ''
}) => {
  const { state } = useAuth();
  const [eligibility, setEligibility] = useState<DeletionEligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLegalWarning, setShowLegalWarning] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [deletionReason, setDeletionReason] = useState('retention_period_expired');
  const [justification, setJustification] = useState('');
  const [existingRequest, setExistingRequest] = useState<DeletionRequest | null>(null);

  // 🔍 Check deletion eligibility on component mount
  const checkDeletionEligibility = useCallback(async () => {
    if (!state.accessToken) return;

    try {
      setLoading(true);
      // 🚀 APOLLO API - Centralized eligibility check
      const response = await apollo.api.get(`/documents/${document.id}/deletion-eligibility`);

      if (response.success && response.data) {
        setEligibility(response.data as any);
      } else {
        console.error('❌ Apollo API - Failed to check deletion eligibility:', response.error);
      }
    } catch (error) {
      console.error('❌ Apollo API - Error checking deletion eligibility:', error);
    } finally {
      setLoading(false);
    }
  }, [document.id, state.accessToken]);

  useEffect(() => {
    checkDeletionEligibility();
  }, [checkDeletionEligibility]);

  const handleDeleteClick = () => {
    if (!eligibility?.can_request_deletion) {
      setShowLegalWarning(true);
      return;
    }
    
    setShowRequestForm(true);
  };

  const submitDeletionRequest = async () => {
    if (!state.accessToken || !justification.trim()) return;

    try {
      setLoading(true);
      // 🚀 APOLLO API - Centralized deletion request
      const response = await apollo.api.post(`/documents/${document.id}/request-deletion`, {
        reason: deletionReason,
        justification: justification.trim()
      });

      if (response.success && response.data) {
        setExistingRequest(response.data as any);
        setShowRequestForm(false);
        onDeletionRequested?.();
        
        // Show success message
        alert('✅ Solicitud de eliminación enviada para aprobación');
      } else {
        alert(`❌ Error: ${response.error?.detail || 'Error al procesar solicitud'}`);
      }
    } catch (error) {
      console.error('Error requesting deletion:', error);
      alert('❌ Error al solicitar eliminación');
    } finally {
      setLoading(false);
    }
  };

  // 🎨 BUTTON STATES AND STYLING
  const getButtonState = () => {
    if (loading) {
      return {
        disabled: true,
        className: 'bg-gray-100 text-gray-400 cursor-wait',
        icon: <ClockIcon className="h-4 w-4" />,
        tooltip: 'Verificando elegibilidad...'
      };
    }

    if (!eligibility) {
      return {
        disabled: true,
        className: 'bg-gray-100 text-gray-400 cursor-not-allowed',
        icon: <ClockIcon className="h-4 w-4" />,
        tooltip: 'Cargando información legal...'
      };
    }

    if (eligibility.category === 'medical') {
      return {
        disabled: true,
        className: 'bg-red-100 text-red-600 cursor-not-allowed',
        icon: <ShieldCheckIcon className="h-4 w-4" />,
        tooltip: '🏥 Documento médico protegido legalmente - No eliminable'
      };
    }

    if (!eligibility.can_request_deletion) {
      return {
        disabled: true,
        className: 'bg-yellow-100 text-yellow-600 cursor-not-allowed',
        icon: <ExclamationTriangleIcon className="h-4 w-4" />,
        tooltip: `⏰ Período de retención: ${eligibility.document_age_years}/${eligibility.min_retention_years} años`
      };
    }

    if (existingRequest) {
      return {
        disabled: true,
        className: 'bg-blue-100 text-blue-600 cursor-not-allowed',
        icon: <DocumentTextIcon className="h-4 w-4" />,
        tooltip: `📋 Solicitud ${existingRequest.status} - En proceso`
      };
    }

    return {
      disabled: false,
      className: 'bg-green-100 text-green-600 hover:bg-green-200',
      icon: <TrashIcon className="h-4 w-4" />,
      tooltip: '🗑️ Documento elegible - Clic para solicitar eliminación'
    };
  };

  const buttonState = getButtonState();

  return (
    <>
      <button
        onClick={handleDeleteClick}
        disabled={buttonState.disabled}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${buttonState.className} ${className}`}
        title={buttonState.tooltip}
      >
        {buttonState.icon}
      </button>

      {/* 🚨 LEGAL WARNING MODAL */}
      {showLegalWarning && eligibility && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                ⚖️ Aviso Legal - Eliminación Restringida
              </h3>
            </div>
            
            <div className="space-y-3 text-sm text-gray-700">
              {eligibility.category === 'medical' && (
                <div className="bg-red-50 p-3 rounded">
                  <p className="font-medium text-red-800">🏥 Documentos Médicos Protegidos</p>
                  <p>{eligibility.patient_safety_notice}</p>
                  <p className="mt-2 text-xs">
                    <strong>Marco Legal:</strong> {eligibility.legal_basis}
                  </p>
                </div>
              )}
              
              {!eligibility.retention_period_met && (
                <div className="bg-yellow-50 p-3 rounded">
                  <p className="font-medium text-yellow-800">⏰ Período de Retención Legal</p>
                  <p>Documento debe conservarse por <strong>{eligibility.min_retention_years} años</strong></p>
                  <p>Edad actual: <strong>{eligibility.document_age_years} años</strong></p>
                </div>
              )}
              
              {!eligibility.user_authorized && (
                <div className="bg-blue-50 p-3 rounded">
                  <p className="font-medium text-blue-800">🔒 Permisos Insuficientes</p>
                  <p>Su rol no tiene autorización para eliminar este tipo de documento.</p>
                </div>
              )}
              
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">📋 Información del Documento:</p>
                <ul className="text-xs mt-1 space-y-1">
                  <li>• <strong>Categoría:</strong> {eligibility.category}</li>
                  <li>• <strong>Creado:</strong> {new Date(document.created_at).toLocaleDateString()}</li>
                  <li>• <strong>Eliminable:</strong> {eligibility.deletable ? 'Sí' : 'No'}</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowLegalWarning(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📝 DELETION REQUEST FORM */}
      {showRequestForm && eligibility?.can_request_deletion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center mb-4">
              <DocumentTextIcon className="h-6 w-6 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                📋 Solicitud de Eliminación Legal
              </h3>
            </div>
            
            <div className="space-y-4">
              {/* Document Info */}
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p><strong>Documento:</strong> {document.title}</p>
                <p><strong>Categoría:</strong> {eligibility.category}</p>
                <p><strong>Edad:</strong> {eligibility.document_age_years} años</p>
              </div>
              
              {/* Legal Notice */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Aviso Legal Importante</p>
                    <p className="text-yellow-700">
                      La eliminación será irreversible después del período de gracia (30 días).
                      Solo proceda si cumple con los requisitos legales de retención.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Deletion Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo Legal de Eliminación *
                </label>
                <select
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  {Object.entries(DELETION_REASONS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              {/* Justification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Justificación Detallada *
                </label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Explique por qué este documento debe ser eliminado y confirme que cumple con los requisitos legales..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 20 caracteres. Esta justificación será registrada para auditoría legal.
                </p>
              </div>
              
              {/* Legal Compliance Checkbox */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="legal-compliance"
                  className="mt-1 mr-2"
                  required
                />
                <label htmlFor="legal-compliance" className="text-xs text-gray-600">
                  Confirmo que he verificado el cumplimiento del período de retención legal 
                  y que tengo autorización para solicitar la eliminación de este documento 
                  según la Ley 25.326 de Protección de Datos Personales de Argentina.
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowRequestForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={submitDeletionRequest}
                disabled={loading || justification.length < 20}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Enviando...' : '📋 Enviar Solicitud'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// 📊 DELETION REQUESTS DASHBOARD COMPONENT
export const DeletionRequestsDashboard: React.FC = () => {
  const { state } = useAuth();
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [complianceData, setComplianceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadDeletionRequests = useCallback(async () => {
    if (!state.accessToken) return;

    try {
      setLoading(true);
      // 🚀 APOLLO API - Centralized deletion requests load
      const response = await apollo.api.get('/documents/deletion-requests');

      if (response.success && response.data) {
        setRequests(response.data as any);
      } else {
        console.error('❌ Apollo API - Error loading deletion requests:', response.error);
      }
    } catch (error) {
      console.error('❌ Apollo API - Error loading deletion requests:', error);
    } finally {
      setLoading(false);
    }
  }, [state.accessToken]);

  const loadComplianceData = useCallback(async () => {
    if (!state.accessToken) return;

    try {
      // 🚀 APOLLO API - Centralized compliance data load
      const response = await apollo.api.get('/documents/compliance-dashboard');

      if (response.success && response.data) {
        setComplianceData(response.data as any);
      } else {
        console.error('❌ Apollo API - Error loading compliance data:', response.error);
      }
    } catch (error) {
      console.error('❌ Apollo API - Error loading compliance data:', error);
    }
  }, [state.accessToken]);

  useEffect(() => {
    if (state.user?.role === 'admin' || state.user?.role === 'professional') {
      loadDeletionRequests();
      loadComplianceData();
    }
  }, [state.user, loadDeletionRequests, loadComplianceData]);

  // (kept memoized versions above)

  if (state.user?.role !== 'admin' && state.user?.role !== 'professional') {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Sin Permisos</h3>
        <p className="mt-1 text-sm text-gray-500">
          No tiene permisos para ver el panel de eliminaciones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      {complianceData && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            🏛️ Panel de Cumplimiento Legal - Eliminaciones
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Docs. Médicos Protegidos</p>
                  <p className="text-2xl font-bold text-green-900">{complianceData.medical_documents_protected}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">Pendientes Aprobación</p>
                  <p className="text-2xl font-bold text-yellow-900">{complianceData.pending_approvals}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">Aprobadas (Gracia)</p>
                  <p className="text-2xl font-bold text-blue-900">{complianceData.approved_awaiting_deletion}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <TrashIcon className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">Eliminadas Total</p>
                  <p className="text-2xl font-bold text-red-900">{complianceData.completed_deletions}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p><strong>Marco Legal:</strong> {complianceData.legal_framework}</p>
            <p><strong>Estado:</strong> {complianceData.compliance_status}</p>
          </div>
        </div>
      )}

      {/* Active Deletion Requests */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            📋 Solicitudes de Eliminación Activas
          </h3>
        </div>
        
        <div className="overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">
              <ClockIcon className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
              <p className="mt-2 text-sm text-gray-500">Cargando solicitudes...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-6 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sin solicitudes</h3>
              <p className="mt-1 text-sm text-gray-500">
                No hay solicitudes de eliminación pendientes.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {requests.map((request) => (
                <div key={request.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {DELETION_REASONS[request.deletion_reason as keyof typeof DELETION_REASONS]}
                      </p>
                      <p className="text-sm text-gray-500">{request.user_justification}</p>
                    </div>
                    <div className="flex items-center">
                      {request.status === 'pending_approval' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          Pendiente Aprobación
                        </span>
                      )}
                      {request.status === 'approved_for_deletion' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Aprobada - Período Gracia
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {request.final_deletion_date && (
                    <p className="mt-2 text-xs text-gray-500">
                      Eliminación programada: {new Date(request.final_deletion_date).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
