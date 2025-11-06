/**
 * 🏥 DENTIAGEST APPOINTMENT TOOLTIP - PHASE 2.7
 * 
 * Purpose: Detailed appointment information popup
 * Created: August 9, 2025 - Phase 2.7 - APPOINTMENT VISUALIZATION
 * Status: IN DEVELOPMENT
 * 
 * Key Features:
 * - Rich appointment details on hover
 * - Patient contact information
 * - Treatment notes and estimated cost
 * - Quick action buttons
 * - Responsive positioning
 * 
 * PlatformGest Extraction Notes:
 * - Universal tooltip pattern for all appointment types
 * - Customizable content based on business vertical
 * - Dental: treatment codes, estimated costs, medical notes
 * - Vet: pet info, vaccination records, medical history
 * - Auto: vehicle details, parts needed, labor estimates
 * 
 * Dependencies:
 * - date-fns: Time formatting
 * - AppointmentData: Type definitions
 * 
 * @author Punk Claude & Platform Gestia Developer
 */

import React from 'react';
import { format } from 'date-fns';
import { AppointmentData } from './AppointmentCard';

interface AppointmentTooltipProps {
  appointment: AppointmentData;
  isVisible: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onQuickAction?: (action: string, appointment: AppointmentData) => void;
  className?: string;
}

export function AppointmentTooltip({
  appointment,
  isVisible,
  position = 'top',
  onQuickAction,
  className = ''
}: AppointmentTooltipProps) {

  if (!isVisible) return null;

  const handleQuickAction = (action: string) => {
    if (onQuickAction) {
      onQuickAction(action, appointment);
    }
  };

  const getPositionClasses = () => {
    const baseClasses = 'absolute z-50 p-3 bg-white border border-gray-300 rounded-lg shadow-lg';
    
    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return baseClasses;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'text-green-600 bg-green-100';
      case 'pendiente':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelada':
        return 'text-red-600 bg-red-100';
      case 'completada':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return 'text-red-600 bg-red-100';
      case 'alta':
        return 'text-orange-600 bg-orange-100';
      case 'normal':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`${getPositionClasses()} ${className} w-80 max-w-sm`}>
      {/* Tooltip arrow */}
      <div className={`
        absolute w-3 h-3 bg-white border transform rotate-45
        ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1.5 border-b-0 border-r-0' : ''}
        ${position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1.5 border-t-0 border-l-0' : ''}
        ${position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1.5 border-t-0 border-l-0' : ''}
        ${position === 'right' ? 'right-full top-1/2 -translate-y-1/2 -mr-1.5 border-b-0 border-r-0' : ''}
      `} />

      {/* Patient header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{appointment.patientName}</h3>
          <p className="text-sm text-gray-600">{appointment.type.toUpperCase()}</p>
        </div>
        <div className="text-right">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
            {appointment.status}
          </span>
        </div>
      </div>

      {/* Appointment details */}
      <div className="space-y-2 mb-3">
        {/* Time and duration */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">⏰ Horario:</span>
          <span className="text-sm font-medium">
            {format(appointment.startTime, 'HH:mm')} - {format(appointment.endTime, 'HH:mm')}
          </span>
        </div>

        {/* Duration */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">⌛ Duración:</span>
          <span className="text-sm font-medium">
            {appointment.duration >= 60 
              ? `${Math.floor(appointment.duration / 60)}h ${appointment.duration % 60}m`
              : `${appointment.duration}m`
            }
          </span>
        </div>

        {/* Doctor */}
        {appointment.doctorName && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">👨‍⚕️ Doctor:</span>
            <span className="text-sm font-medium">Dr. {appointment.doctorName}</span>
          </div>
        )}

        {/* Treatment code */}
        {appointment.treatmentCode && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">🏷️ Código:</span>
            <span className="text-sm font-mono">{appointment.treatmentCode}</span>
          </div>
        )}

        {/* Priority */}
        {appointment.priority && appointment.priority !== 'normal' && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">🚨 Prioridad:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(appointment.priority)}`}>
              {appointment.priority}
            </span>
          </div>
        )}

        {/* Estimated cost */}
        {appointment.estimatedCost && appointment.estimatedCost > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">💰 Estimado:</span>
            <span className="text-sm font-semibold text-green-600">
              {formatCurrency(appointment.estimatedCost)}
            </span>
          </div>
        )}
      </div>

      {/* Contact information */}
      <div className="border-t pt-2 mb-3">
        <h4 className="text-xs font-medium text-gray-700 mb-1">CONTACTO</h4>
        {appointment.patientPhone && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">📞 Teléfono:</span>
            <button
              onClick={() => handleQuickAction('call')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {appointment.patientPhone}
            </button>
          </div>
        )}
        {appointment.patientEmail && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">📧 Email:</span>
            <button
              onClick={() => handleQuickAction('email')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium truncate ml-2"
            >
              {appointment.patientEmail}
            </button>
          </div>
        )}
      </div>

      {/* Notes */}
      {appointment.notes && (
        <div className="border-t pt-2 mb-3">
          <h4 className="text-xs font-medium text-gray-700 mb-1">NOTAS</h4>
          <p className="text-sm text-gray-600 break-words">{appointment.notes}</p>
        </div>
      )}

      {/* Quick actions */}
      <div className="border-t pt-2 flex space-x-2">
        <button
          onClick={() => handleQuickAction('edit')}
          className="flex-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
        >
          ✏️ Editar
        </button>
        <button
          onClick={() => handleQuickAction('reschedule')}
          className="flex-1 px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition-colors"
        >
          📅 Reprogramar
        </button>
        {appointment.status === 'confirmed' && (
          <button
            onClick={() => handleQuickAction('complete')}
            className="flex-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
          >
            ✅ Completar
          </button>
        )}
      </div>
    </div>
  );
}

export default AppointmentTooltip;
