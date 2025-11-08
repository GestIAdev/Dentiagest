import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_PATIENTS_V3 } from '../../graphql/queries/patients';
import { CREATE_APPOINTMENT_V3 } from '../../graphql/queries/appointments';
import { XMarkIcon } from '@heroicons/react/24/outline';

// 🎸 APOLLO NUCLEAR - CREATE APPOINTMENT MODAL V3
// Modal para crear nuevas citas - 100% GraphQL V3
// @veritas quantum truth verification enabled

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (appointment: any) => void;
  selectedDate: string | null;
  selectedTime: string | null;
}

const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  selectedDate,
  selectedTime
}) => {
  // 🎯 V3 GRAPHQL OPERATIONS - Pure GraphQL, no REST
  const { data: patientsData, loading: loadingPatients } = useQuery(GET_PATIENTS_V3, {
    skip: !isOpen,
    fetchPolicy: 'cache-and-network'
  });

  const [createAppointmentMutation, { loading }] = useMutation(CREATE_APPOINTMENT_V3);

  const [formData, setFormData] = useState({
    patientId: '',
    appointmentDate: selectedDate || '',
    appointmentTime: selectedTime || '',
    duration: 30,
    type: '',
    notes: '',
    status: 'scheduled'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🚀 APOLLO VERITAS: Update form when selectedDate/selectedTime change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      appointmentDate: selectedDate || prev.appointmentDate,
      appointmentTime: selectedTime || prev.appointmentTime
    }));
  }, [selectedDate, selectedTime]);

  // 🎯 V3 PATIENTS DATA - Direct from GraphQL
  const patients = (patientsData as any)?.patientsV3 || [];

  // 🛡️ APOLLO VERITAS: Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) newErrors.patientId = 'Paciente requerido';
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Fecha requerida';
    if (!formData.appointmentTime) newErrors.appointmentTime = 'Hora requerida';
    if (!formData.type.trim()) newErrors.type = 'Tipo de cita requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ⚡ APOLLO V3 MUTATION: Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const { data } = await createAppointmentMutation({
        variables: {
          input: {
            patientId: formData.patientId,
            appointmentDate: formData.appointmentDate,
            appointmentTime: formData.appointmentTime,
            duration: Number(formData.duration),
            type: formData.type,
            notes: formData.notes || '',
            status: formData.status
          }
        }
      });

      // V3 mutation success
      if (data) {
        onCreate((data as any)?.createAppointmentV3);
        onClose();
        // Reset form
        setFormData({
          patientId: '',
          appointmentDate: '',
          appointmentTime: '',
          duration: 30,
          type: '',
          notes: '',
          status: 'scheduled'
        });
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      setErrors({ submit: 'Error al crear la cita. Intente nuevamente.' });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Crear Nueva Cita
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
              value={formData.patientId}
              onChange={(e) => handleChange('patientId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.patientId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loadingPatients}
            >
              <option value="">
                {loadingPatients ? 'Cargando pacientes...' : 'Seleccionar paciente'}
              </option>
              {patients.map((patient: any) => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
            {errors.patientId && (
              <p className="text-red-500 text-xs mt-1">{errors.patientId}</p>
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
                value={formData.appointmentDate}
                onChange={(e) => handleChange('appointmentDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.appointmentDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.appointmentDate && (
                <p className="text-red-500 text-xs mt-1">{errors.appointmentDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora *
              </label>
              <input
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => handleChange('appointmentTime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.appointmentTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.appointmentTime && (
                <p className="text-red-500 text-xs mt-1">{errors.appointmentTime}</p>
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

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de cita *
            </label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Consulta general, limpieza dental..."
            />
            {errors.type && (
              <p className="text-red-500 text-xs mt-1">{errors.type}</p>
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
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
              {loading ? 'Creando...' : 'Crear Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAppointmentModal;
