/**
 * 🔥💀🎸 EDIT APPOINTMENT MODAL V3 - GRAPHQL POWER
 * 
 * ARCHITECT: PunkClaude (The Verse Libre)
 * DATE: 2025-11-09
 * PURPOSE: Beautiful appointment creation/editing modal with GraphQL V3 + @veritas
 * 
 * FEATURES:
 * - Create & Edit appointments
 * - GraphQL V3 mutations with @veritas verification
 * - Design System components (beautiful!)
 * - Patient search/selection
 * - Date/Time picker
 * - Type & Status selection
 * - Form validation
 * - Real-time refetch after mutation
 */

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { 
  CREATE_APPOINTMENT_V3, 
  UPDATE_APPOINTMENT_V3,
  DELETE_APPOINTMENT 
} from '../../graphql/queries/appointments';
import { GET_PATIENTS } from '../../graphql/queries/patients';
import { Button } from '../../design-system/Button';
import { Card, CardHeader, CardBody } from '../../design-system/Card';
import { Badge } from '../../design-system/Badge';
import { Modal } from '../../design-system/Modal';

// 🎯 TYPES
interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: {
    id?: string;
    patientId?: string;
    patientName?: string;
    startTime?: Date;
    duration?: number;
    type?: string;
    status?: string;
    notes?: string;
  };
  onSuccess?: () => void;
  mode?: 'create' | 'edit';
}

// 📋 APPOINTMENT TYPES (Spanish backend)
const APPOINTMENT_TYPES = [
  { value: 'consulta', label: 'Consulta General' },
  { value: 'limpieza', label: 'Limpieza Dental' },
  { value: 'tratamiento', label: 'Tratamiento' },
  { value: 'emergencia', label: 'Emergencia' },
  { value: 'revision', label: 'Revisión' },
  { value: 'ortodoncia', label: 'Ortodoncia' },
  { value: 'cirugia', label: 'Cirugía' },
];

// 📊 STATUS OPTIONS
const STATUS_OPTIONS = [
  { value: 'pending', label: '⏳ Pendiente' },
  { value: 'confirmed', label: '✅ Confirmada' },
  { value: 'completed', label: '✔️ Completada' },
  { value: 'cancelled', label: '❌ Cancelada' },
];

// ⏱️ DURATION OPTIONS
const DURATION_OPTIONS = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1.5 horas' },
  { value: 120, label: '2 horas' },
];

export const EditAppointmentModalV3: React.FC<EditAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSuccess,
  mode = 'create'
}) => {
  // 🎯 FORM STATE
  const [formData, setFormData] = useState({
    patientId: appointment?.patientId || '',
    appointmentDate: appointment?.startTime 
      ? appointment.startTime.toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    appointmentTime: appointment?.startTime 
      ? appointment.startTime.toTimeString().slice(0, 5) 
      : '09:00',
    duration: appointment?.duration || 30,
    type: appointment?.type || 'consulta',
    status: appointment?.status || 'pending',
    notes: appointment?.notes || '',
  });

  const [searchTerm, setSearchTerm] = useState(appointment?.patientName || '');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // 🔌 GRAPHQL QUERIES & MUTATIONS
  const { data: patientsData, loading: patientsLoading } = useQuery(GET_PATIENTS, {
    variables: { 
      limit: 50,
      search: searchTerm.length > 2 ? searchTerm : undefined 
    },
    skip: !isOpen, // Only fetch when modal is open
  });

  const [createMutation, { loading: createLoading }] = useMutation(CREATE_APPOINTMENT_V3);
  const [updateMutation, { loading: updateLoading }] = useMutation(UPDATE_APPOINTMENT_V3);
  const [deleteMutation, { loading: deleteLoading }] = useMutation(DELETE_APPOINTMENT);

  const patients = (patientsData as any)?.patients || [];

  // 🎯 UPDATE FORM DATA WHEN APPOINTMENT CHANGES
  useEffect(() => {
    if (appointment && isOpen) {
      setFormData({
        patientId: appointment.patientId || '',
        appointmentDate: appointment.startTime 
          ? appointment.startTime.toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0],
        appointmentTime: appointment.startTime 
          ? appointment.startTime.toTimeString().slice(0, 5) 
          : '09:00',
        duration: appointment.duration || 30,
        type: appointment.type || 'consulta',
        status: appointment.status || 'pending',
        notes: appointment.notes || '',
      });
      setSearchTerm(appointment.patientName || '');
    }
  }, [appointment, isOpen]);

  // 🎯 HANDLERS
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePatientSelect = (patient: any) => {
    setFormData(prev => ({ ...prev, patientId: patient.id }));
    setSearchTerm(`${patient.firstName} ${patient.lastName}`);
    setShowPatientDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 📋 VALIDATION
    if (!formData.patientId) {
      alert('❌ Por favor selecciona un paciente');
      return;
    }

    try {
      if (mode === 'create') {
        // 🆕 CREATE NEW APPOINTMENT
        await createMutation({
          variables: {
            input: {
              patientId: formData.patientId,
              appointmentDate: formData.appointmentDate,
              appointmentTime: `${formData.appointmentTime}:00`, // Add seconds
              duration: formData.duration,
              type: formData.type,
              status: formData.status,
              notes: formData.notes || null,
            }
          }
        });
        console.log('✅ Appointment created!');
      } else {
        // ✏️ UPDATE EXISTING APPOINTMENT
        if (!appointment?.id) {
          throw new Error('No appointment ID for update');
        }
        
        await updateMutation({
          variables: {
            id: appointment.id,
            input: {
              appointmentDate: formData.appointmentDate,
              appointmentTime: `${formData.appointmentTime}:00`,
              duration: formData.duration,
              type: formData.type,
              status: formData.status,
              notes: formData.notes || null,
            }
          }
        });
        console.log('✅ Appointment updated!');
      }

      // 🎯 SUCCESS
      if (onSuccess) {
        onSuccess(); // Refetch appointments
      }
      onClose();
    } catch (error) {
      console.error('❌ Error saving appointment:', error);
      alert(`Error: ${(error as Error).message}`);
    }
  };

  const handleDelete = async () => {
    if (!appointment?.id) return;
    
    const confirmed = window.confirm('¿Estás seguro de eliminar esta cita?');
    if (!confirmed) return;

    try {
      await deleteMutation({
        variables: { id: appointment.id }
      });
      
      console.log('✅ Appointment deleted!');
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('❌ Error deleting appointment:', error);
      alert(`Error: ${(error as Error).message}`);
    }
  };

  // 🎨 RENDER
  if (!isOpen) return null;

  const isLoading = createLoading || updateLoading || deleteLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? '📅 Nueva Cita' : '✏️ Editar Cita'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 🔍 PATIENT SEARCH */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paciente *
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowPatientDropdown(true);
              }}
              onFocus={() => setShowPatientDropdown(true)}
              placeholder="Buscar paciente..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            
            {/* 📋 PATIENT DROPDOWN */}
            {showPatientDropdown && searchTerm.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {patientsLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    Buscando pacientes...
                  </div>
                ) : patients.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No se encontraron pacientes
                  </div>
                ) : (
                  patients.map((patient: any) => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => handlePatientSelect(patient)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient.email || patient.phone}
                        </div>
                      </div>
                      {formData.patientId === patient.id && (
                        <Badge variant="success">✓</Badge>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* 📅 DATE & TIME */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha *
            </label>
            <input
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora *
            </label>
            <input
              type="time"
              value={formData.appointmentTime}
              onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
        </div>

        {/* ⏱️ DURATION & TYPE */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duración *
            </label>
            <select
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            >
              {DURATION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            >
              {APPOINTMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 📊 STATUS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado *
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            required
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        {/* 📝 NOTES */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            placeholder="Notas adicionales sobre la cita..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* 🎯 ACTIONS */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            {mode === 'edit' && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={isLoading}
              >
                🗑️ Eliminar
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Guardando...
                </span>
              ) : (
                mode === 'create' ? '✅ Crear Cita' : '✅ Guardar Cambios'
              )}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditAppointmentModalV3;
