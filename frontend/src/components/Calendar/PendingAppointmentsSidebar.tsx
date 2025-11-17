/**
 * Pending Appointments Sidebar - AI Suggestions
 * DIRECTIVA #004 - GeminiEnder CEO
 * Fecha: 17-Nov-2025
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_PENDING_SUGGESTIONS,
  APPROVE_SUGGESTION,
  REJECT_SUGGESTION
} from '../../graphql/appointmentSuggestions';

interface PendingAppointmentsSidebarProps {
  onApprove?: (appointmentId: string) => void;
  onReject?: (suggestionId: string) => void;
}

export const PendingAppointmentsSidebar: React.FC<PendingAppointmentsSidebarProps> = ({
  onApprove,
  onReject
}) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_PENDING_SUGGESTIONS, {
    variables: { status: 'pending_approval' },
    pollInterval: 30000 // Poll every 30s for new suggestions
  });

  const [approveSuggestion, { loading: approving }] = useMutation(APPROVE_SUGGESTION, {
    onCompleted: (data: any) => {
      console.log('[Approve] Success:', data.approveAppointmentSuggestion);
      refetch();
      if (onApprove) {
        onApprove(data.approveAppointmentSuggestion.id);
      }
    }
  });

  const [rejectSuggestion, { loading: rejecting }] = useMutation(REJECT_SUGGESTION, {
    onCompleted: () => {
      console.log('[Reject] Success');
      refetch();
      setShowRejectModal(false);
      setRejectReason('');
      if (onReject && selectedSuggestion) {
        onReject(selectedSuggestion.id);
      }
    }
  });

  const handleApprove = async (suggestion: any) => {
    await approveSuggestion({
      variables: {
        suggestionId: suggestion.id,
        adjustments: null // MVP: accept AI suggestion as-is
      }
    });
  };

  const handleRejectClick = (suggestion: any) => {
    setSelectedSuggestion(suggestion);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedSuggestion || !rejectReason.trim()) return;

    await rejectSuggestion({
      variables: {
        suggestionId: selectedSuggestion.id,
        reason: rejectReason
      }
    });
  };

  if (loading) {
    return (
      <div className="pending-sidebar bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">🤖 Citas Sugeridas por IA</h3>
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pending-sidebar bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">🤖 Citas Sugeridas por IA</h3>
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  const suggestions = data?.appointmentSuggestionsV3 || [];

  return (
    <>
      <div className="pending-sidebar bg-white p-4 rounded-lg shadow-md max-h-[600px] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">🤖 Citas Sugeridas por IA</h3>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
            {suggestions.length} pendientes
          </span>
        </div>

        {suggestions.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay sugerencias pendientes</p>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion: any) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onApprove={() => handleApprove(suggestion)}
                onReject={() => handleRejectClick(suggestion)}
                approving={approving}
                rejecting={rejecting}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Rechazar Sugerencia</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del Rechazo
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explique por qué rechaza esta sugerencia..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={rejecting}
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim() || rejecting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
              >
                {rejecting ? 'Rechazando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Suggestion Card Component
interface SuggestionCardProps {
  suggestion: any;
  onApprove: () => void;
  onReject: () => void;
  approving: boolean;
  rejecting: boolean;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onApprove,
  onReject,
  approving,
  rejecting
}) => {
  const isUrgent = suggestion.appointment_type === 'urgent';
  const confidencePercent = Math.round(suggestion.confidence_score * 100);

  return (
    <div className={`suggestion-card border-2 rounded-lg p-4 ${
      isUrgent ? 'border-red-300 bg-red-50' : 'border-blue-300 bg-blue-50'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-800">
            {suggestion.patient.first_name} {suggestion.patient.last_name}
          </p>
          <p className="text-xs text-gray-600">{suggestion.patient.phone_primary}</p>
        </div>
        {isUrgent && (
          <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
            🚨 URGENTE
          </span>
        )}
      </div>

      {/* AI Suggestion */}
      <div className="mb-3 bg-white rounded-md p-3">
        <p className="text-sm font-medium text-gray-700 mb-1">
          📅 {formatDate(suggestion.suggested_date)} a las {suggestion.suggested_time}
        </p>
        <p className="text-xs text-gray-600">Duración: {suggestion.suggested_duration} min</p>
        
        {/* Confidence Score */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Confianza IA:</span>
            <span className={`font-semibold ${
              confidencePercent >= 80 ? 'text-green-600' : 
              confidencePercent >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {confidencePercent}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                confidencePercent >= 80 ? 'bg-green-500' : 
                confidencePercent >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Reasoning */}
      {suggestion.reasoning && (
        <div className="mb-3 text-xs text-gray-600 bg-white rounded-md p-2">
          <p className="font-medium mb-1">💡 Razonamiento IA:</p>
          <p>{JSON.parse(suggestion.reasoning).summary || 'Slot óptimo encontrado'}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onApprove}
          disabled={approving || rejecting}
          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 text-sm font-semibold"
        >
          {approving ? '⏳' : '✅ Aprobar'}
        </button>
        <button
          onClick={onReject}
          disabled={approving || rejecting}
          className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 text-sm font-semibold"
        >
          {rejecting ? '⏳' : '❌ Rechazar'}
        </button>
      </div>

      {/* Timestamp */}
      <p className="text-xs text-gray-500 mt-2 text-center">
        Solicitada: {new Date(suggestion.created_at).toLocaleString('es-ES')}
      </p>
    </div>
  );
};

// Helper function
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}
