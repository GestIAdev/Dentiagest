// 🏛️ LEGAL DELETION MANAGEMENT PAGE - ARGENTINA COMPLIANCE
/**
 * DocumentDeletionPage - Complete Legal Deletion Management System
 * 
 * Features:
 * 📋 Deletion requests dashboard
 * ⚖️ Legal compliance monitoring  
 * 🔍 Document eligibility checker
 * 👥 Multi-role approval workflows
 * 📊 Audit trail and reporting
 * 
 * Compliance: Argentina Ley 25.326 + Medical Practice Law
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import apollo from '../apollo.ts'; // 🚀 APOLLO NUCLEAR - WEBPACK EXTENSION EXPLICIT!
import { DeletionRequestsDashboard } from '../components/DocumentManagement/DeleteDocumentButton.tsx';
import {
  TrashIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

// � APOLLO API ARCHITECTURE - buildApiUrl eliminated, centralized in apollo service

interface DeletionStats {
  total_documents: number;
  medical_documents_protected: number;
  pending_approvals: number;
  approved_awaiting_deletion: number;
  completed_deletions: number;
  legal_framework: string;
  compliance_status: string;
  retention_compliance_rate: number;
}

interface DeletionRequest {
  id: string;
  document_id: string;
  document_title: string;
  document_category: string;
  requesting_user: string;
  deletion_reason: string;
  user_justification: string;
  status: string;
  requested_at: string;
  approved_at?: string;
  approved_by?: string;
  grace_period_end?: string;
  final_deletion_date?: string;
  rejection_reason?: string;
}

export const DocumentDeletionPage: React.FC = () => {
  const { state } = useAuth();
  const [stats, setStats] = useState<DeletionStats | null>(null);
  const [pendingRequests, setPendingRequests] = useState<DeletionRequest[]>([]);
  const [allRequests, setAllRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pending' | 'all' | 'audit'>('dashboard');

  useEffect(() => {
    if (state.user?.role === 'admin' || state.user?.role === 'professional') {
      loadDeletionData();
    }
  }, [state.user]);

  const loadDeletionData = async () => {
    if (!state.accessToken) return;

    try {
      setLoading(true);
      
      // 🚀 APOLLO API - Load statistics
      const statsResponse = await apollo.api.get('/documents/deletion-stats');
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data as any);
      }

      // 🚀 APOLLO API - Load pending requests
      const pendingResponse = await apollo.api.get('/documents/deletion-requests?status=pending_approval');
      if (pendingResponse.success && pendingResponse.data) {
        setPendingRequests(pendingResponse.data as any);
      }

      // 🚀 APOLLO API - Load all requests
      const allResponse = await apollo.api.get('/documents/deletion-requests');
      if (allResponse.success && allResponse.data) {
        setAllRequests(allResponse.data as any);
      }

    } catch (error) {
      console.error('❌ Apollo API - Error loading deletion data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!state.accessToken) return;

    try {
      // 🚀 APOLLO API - Approve deletion request
      const response = await apollo.api.post(`/documents/deletion-requests/${requestId}/approve`, {});

      if (response.success) {
        alert('✅ Solicitud aprobada. Período de gracia iniciado.');
        loadDeletionData();
      } else {
        alert(`❌ Error: ${response.error?.detail || 'Error al aprobar solicitud'}`);
      }
    } catch (error) {
      console.error('❌ Apollo API - Error approving request:', error);
      alert('❌ Error al aprobar solicitud');
    }
  };

  const handleRejectRequest = async (requestId: string, reason: string) => {
    if (!state.accessToken || !reason.trim()) return;

    try {
      // 🚀 APOLLO API - Reject deletion request
      const response = await apollo.api.post(`/documents/deletion-requests/${requestId}/reject`, {
        rejection_reason: reason
      });

      if (response.success) {
        alert('✅ Solicitud rechazada.');
        loadDeletionData();
      } else {
        alert(`❌ Error: ${response.error?.detail || 'Error al rechazar solicitud'}`);
      }
    } catch (error) {
      console.error('❌ Apollo API - Error rejecting request:', error);
      alert('❌ Error al rechazar solicitud');
    }
  };

  if (state.user?.role !== 'admin' && state.user?.role !== 'professional') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Sin Permisos de Administración</h3>
            <p className="mt-2 text-sm text-gray-500">
              No tiene permisos para acceder al sistema de gestión de eliminaciones.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  🏛️ Sistema Legal de Eliminación de Documentos
                </h1>
                <p className="text-sm text-gray-500">
                  Gestión conforme a Ley 25.326 de Protección de Datos Personales - Argentina
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: '📊 Panel General', icon: DocumentTextIcon },
              { id: 'pending', name: '⏳ Pendientes', icon: ClockIcon, count: pendingRequests.length },
              { id: 'all', name: '📋 Todas las Solicitudes', icon: DocumentTextIcon },
              { id: 'audit', name: '🔍 Auditoría', icon: ShieldCheckIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
              >
                <tab.icon className="h-4 w-4 mr-1" />
                {tab.name}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs font-medium">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
            <p className="mt-2 text-sm text-gray-500">Cargando datos del sistema...</p>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && (
              <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <ShieldCheckIcon className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Docs. Médicos Protegidos</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.medical_documents_protected}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <ClockIcon className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Pendientes Aprobación</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.pending_approvals}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">En Período de Gracia</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.approved_awaiting_deletion}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <TrashIcon className="h-8 w-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Eliminaciones Completadas</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.completed_deletions}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compliance Status */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">⚖️ Estado de Cumplimiento Legal</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Marco Legal:</span>
                      <span className="text-sm text-gray-900">{stats.legal_framework}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Estado de Cumplimiento:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        stats.compliance_status === 'compliant' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {stats.compliance_status === 'compliant' ? '✅ Cumpliendo' : '⚠️ Revisión Requerida'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Tasa de Cumplimiento de Retención:</span>
                      <span className="text-sm text-gray-900">{stats.retention_compliance_rate}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${stats.retention_compliance_rate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Embedded Dashboard Component */}
                <DeletionRequestsDashboard />
              </div>
            )}

            {/* Pending Requests Tab */}
            {activeTab === 'pending' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    ⏳ Solicitudes Pendientes de Aprobación ({pendingRequests.length})
                  </h3>
                </div>
                
                {pendingRequests.length === 0 ? (
                  <div className="p-6 text-center">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Sin solicitudes pendientes</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Todas las solicitudes han sido procesadas.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {request.document_title}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Categoría: <span className="font-medium">{request.document_category}</span>
                            </p>
                            <p className="text-sm text-gray-500">
                              Solicitado por: <span className="font-medium">{request.requesting_user}</span>
                            </p>
                            <p className="text-sm text-gray-500">
                              Fecha: {new Date(request.requested_at).toLocaleDateString()}
                            </p>
                            
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700">Motivo:</p>
                              <p className="text-sm text-gray-600">{request.deletion_reason}</p>
                            </div>
                            
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700">Justificación:</p>
                              <p className="text-sm text-gray-600">{request.user_justification}</p>
                            </div>
                          </div>
                          
                          <div className="ml-6 flex space-x-2">
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Aprobar
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Motivo del rechazo:');
                                if (reason) handleRejectRequest(request.id, reason);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                            >
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              Rechazar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Requests Tab */}
            {activeTab === 'all' && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    📋 Todas las Solicitudes ({allRequests.length})
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Documento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Solicitud
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Eliminación
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allRequests.map((request) => (
                        <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{request.document_title}</p>
                              <p className="text-sm text-gray-500">{request.document_category}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {request.requesting_user}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              request.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'approved_for_deletion' ? 'bg-blue-100 text-blue-800' :
                              request.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(request.requested_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.final_deletion_date 
                              ? new Date(request.final_deletion_date).toLocaleDateString()
                              : '-'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Audit Tab */}
            {activeTab === 'audit' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  🔍 Registro de Auditoría Legal
                </h3>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex">
                    <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Funcionalidad en desarrollo:</strong> El registro de auditoría completo 
                        estará disponible en la próxima versión. Actualmente se registran todas las 
                        operaciones de eliminación para cumplimiento legal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
