import React, { useState, useEffect } from 'react';
import apolloGraphQL from '../../services/apolloGraphQL'; // 🔥 STEALTH GRAPHQL NUCLEAR
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

// 🎸 APOLLO NUCLEAR - EDIT APPOINTMENT MODAL
// Modal para editar y eliminar citas existentes
// Integrado con Veritas verification

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onUpdate: (appointment: any) => void;
  onDelete: (appointmentId: string) => void;
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onUpdate,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    patient_id: '',
    date: '',
    time: '',
    duration: 30,
    reason: '',
    notes: '',
    status: 'scheduled'
  });

  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🚀 APOLLO VERITAS: Load appointment data and patients list
  useEffect(() => {
    if (isOpen && appointment) {
      setFormData({
        patient_id: appointment.patient_id || '',
        date: appointment.date || '',
        time: appointment.time || '',
        duration: appointment.duration || 30,
        reason: appointment.reason || '',
        notes: appointment.notes || '',
        status: appointment.status || 'scheduled'
      });
      loadPatients();
    }
  }, [isOpen, appointment]);

  const loadPatients = async () => {
    setLoadingPatients(true);
    try {
      const response = await apolloGraphQL.api.get('/patients?limit=100');
      if (response.success && response.data) {
        // Handle both paginated and direct array responses
        const patientsData = Array.isArray(response.data) ? response.data : (response.data as any).items || [];
        setPatients(patientsData);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  // 🛡️ APOLLO VERITAS: Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patient_id) newErrors.patient_id = 'Paciente requerido';
    if (!formData.date) newErrors.date = 'Fecha requerida';
    if (!formData.time) newErrors.time = 'Hora requerida';
    if (!formData.reason.trim()) newErrors.reason = 'Motivo requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ⚡ APOLLO OFFLINE SUPREMACY: Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const appointmentData = {
        ...formData,
        duration: Number(formData.duration)
      };

      const response = await apolloGraphQL.api.put(`/appointments/${appointment.id}`, appointmentData);

      if (response.success) {
        onUpdate(response.data);
        onClose();
      } else {
        setErrors({ submit: response.error?.message || 'Error al actualizar cita' });
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      setErrors({ submit: 'Error de conexión. Intente nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  // 🎯 APOLLO CONSCIOUSNESS: Handle input changes
  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 🗑️ Handle delete
  const handleDelete = async () => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta cita? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoading(true);

    try {
      const response = await apolloGraphQL.api.delete(`/appointments/${appointment.id}`);

      if (response.success) {
        onDelete(appointment.id);
        onClose();
      } else {
        setErrors({ submit: response.error?.message || 'Error al eliminar cita' });
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setErrors({ submit: 'Error de conexión. Intente nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Editar Cita
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paciente *
            </label>
            <select
              value={formData.patient_id}
              onChange={(e) => handleChange('patient_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.patient_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loadingPatients}
            >
              <option value="">
                {loadingPatients ? 'Cargando pacientes...' : 'Seleccionar paciente'}
              </option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name}
                </option>
              ))}
            </select>
            {errors.patient_id && (
              <p className="text-red-500 text-xs mt-1">{errors.patient_id}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.time ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.time && (
                <p className="text-red-500 text-xs mt-1">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración (minutos)
            </label>
            <select
              value={formData.duration}
              onChange={(e) => handleChange('duration', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1.5 horas</option>
              <option value={120}>2 horas</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="scheduled">Programada</option>
              <option value="confirmed">Confirmada</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
              <option value="no_show">No asistió</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de la cita *
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Consulta general, limpieza dental..."
            />
            {errors.reason && (
              <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas opcionales sobre la cita..."
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={loading}
            >
              <TrashIcon className="w-4 h-4" />
              <span>Eliminar</span>
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Actualizando...' : 'Actualizar Cita'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAppointmentModal;