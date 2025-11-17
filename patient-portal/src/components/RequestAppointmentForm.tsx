/**
 * Request Appointment Form - AI-Assisted Scheduling
 * DIRECTIVA #004 - GeminiEnder CEO
 * Fecha: 17-Nov-2025
 */

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REQUEST_APPOINTMENT } from '../graphql/appointmentRequests';

interface RequestAppointmentFormProps {
  patientId: string;
  onSuccess?: (suggestion: any) => void;
}

export const RequestAppointmentForm: React.FC<RequestAppointmentFormProps> = ({ 
  patientId, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    appointmentType: 'normal' as 'normal' | 'urgent',
    consultationType: '',
    preferredDates: [] as string[],
    preferredTimes: [] as string[],
    urgency: 'low',
    notes: '',
    symptoms: ''
  });

  const [requestAppointment, { loading, error }] = useMutation(REQUEST_APPOINTMENT, {
    onCompleted: (data) => {
      console.log('[RequestAppointment] Success:', data.requestAppointment);
      if (onSuccess) {
        onSuccess(data.requestAppointment);
      }
      // Reset form
      setFormData({
        appointmentType: 'normal',
        consultationType: '',
        preferredDates: [],
        preferredTimes: [],
        urgency: 'low',
        notes: '',
        symptoms: ''
      });
    },
    onError: (err) => {
      console.error('[RequestAppointment] Error:', err);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await requestAppointment({
      variables: {
        input: {
          patientId,
          ...formData
        }
      }
    });
  };

  const handleDateChange = (date: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        preferredDates: [...prev.preferredDates, date]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        preferredDates: prev.preferredDates.filter(d => d !== date)
      }));
    }
  };

  const handleTimeChange = (time: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        preferredTimes: [...prev.preferredTimes, time]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        preferredTimes: prev.preferredTimes.filter(t => t !== time)
      }));
    }
  };

  const isUrgent = formData.appointmentType === 'urgent';

  return (
    <div className="request-appointment-form bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {isUrgent ? '🚨 Solicitud de Cita Urgente' : '📅 Solicitar Nueva Cita'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Appointment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Cita
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="appointmentType"
                value="normal"
                checked={formData.appointmentType === 'normal'}
                onChange={(e) => setFormData({ ...formData, appointmentType: 'normal' })}
                className="mr-2"
              />
              <span className="text-gray-700">Normal</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="appointmentType"
                value="urgent"
                checked={formData.appointmentType === 'urgent'}
                onChange={(e) => setFormData({ ...formData, appointmentType: 'urgent' })}
                className="mr-2"
              />
              <span className="text-red-600 font-semibold">🚨 Urgente</span>
            </label>
          </div>
        </div>

        {/* Consultation Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Consulta
          </label>
          <select
            value={formData.consultationType}
            onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccionar...</option>
            <option value="Limpieza">Limpieza</option>
            <option value="Revisión General">Revisión General</option>
            <option value="Ortodoncia">Ortodoncia</option>
            <option value="Endodoncia">Endodoncia</option>
            <option value="Extracción">Extracción</option>
            <option value="Urgencia">Urgencia</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        {/* Preferred Dates */}
        {!isUrgent && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fechas Preferidas (Seleccione 2-3 opciones)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {generateNextDates(7).map(date => (
                <label key={date} className="flex items-center cursor-pointer p-2 border rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.preferredDates.includes(date)}
                    onChange={(e) => handleDateChange(date, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">{formatDate(date)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Preferred Times */}
        {!isUrgent && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horarios Preferidos
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Mañana (9am-12pm)', 'Tarde (12pm-3pm)', 'Noche (3pm-6pm)'].map(time => (
                <label key={time} className="flex items-center cursor-pointer p-2 border rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.preferredTimes.includes(time)}
                    onChange={(e) => handleTimeChange(time, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-xs">{time}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Symptoms (if urgent) */}
        {isUrgent && (
          <div>
            <label className="block text-sm font-medium text-red-700 mb-2">
              Síntomas Urgentes *
            </label>
            <textarea
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              placeholder="Describa sus síntomas con detalle (dolor, sangrado, hinchazón, etc.)"
              className="w-full px-4 py-2 border border-red-300 rounded-md focus:ring-2 focus:ring-red-500"
              rows={4}
              required={isUrgent}
            />
            <p className="text-xs text-gray-500 mt-1">
              La IA analizará sus síntomas para priorizar su cita
            </p>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas Adicionales
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Cualquier información adicional que desee compartir"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
            <p className="font-semibold">Error al solicitar cita:</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-6 rounded-md font-semibold text-white transition-colors ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : isUrgent
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? '⏳ Procesando...' : isUrgent ? '🚨 Solicitar Cita Urgente' : '📅 Solicitar Cita'}
        </button>

        {/* AI Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">🤖 Sistema IA:</span> Nuestra inteligencia artificial 
            analizará su solicitud y sugerirá la mejor fecha y hora basándose en disponibilidad 
            del doctor, su historial médico y sus preferencias.
          </p>
        </div>
      </form>
    </div>
  );
};

// Helper functions
function generateNextDates(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 1; i <= days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}
