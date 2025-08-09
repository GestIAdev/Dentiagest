import React, { useState, useEffect } from 'react';
import { usePatients } from '../hooks/usePatients.ts';
import { XMarkIcon, CalendarIcon, ClockIcon, UserIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAppointments } from '../hooks/useAppointments.ts';

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onUpdate: (appointmentId: string, appointmentData: any) => void;
  onDelete: (appointmentId: string) => void;
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onUpdate,
  onDelete
}) => {
  const { patients, fetchPatients } = usePatients();
  const { loading } = useAppointments();
  
  // 🎯 ESTADO INICIAL BASADO EN LA CITA EXISTENTE
  const [formData, setFormData] = useState({
    patient_id: '',
    patient_name: '',
    title: '',
    date: '',
    time: '',
    duration: 30,
    appointment_type: 'consultation',
    priority: 'normal',
    status: 'scheduled',
    description: '',
    notes: ''
  });
  
  const [patientSearch, setPatientSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState(patients || []);

  // 🔄 CARGAR DATOS DE LA CITA AL ABRIR EL MODAL
  useEffect(() => {
    if (appointment && isOpen) {
      console.log('🔍 DEBUG - Appointment object:', appointment);
      console.log('🔍 DEBUG - Extended props:', appointment.extendedProps);
      
      const appointmentDate = new Date(appointment.extendedProps?.scheduled_date || appointment.start);
      const dateStr = appointmentDate.toISOString().split('T')[0];
      const timeStr = appointmentDate.toTimeString().slice(0, 5);
      
      const newFormData = {
        patient_id: appointment.extendedProps?.patient_id || '',
        patient_name: appointment.extendedProps?.patient_name || appointment.title || '',
        title: appointment.extendedProps?.title || appointment.title.split(' - ')[1] || appointment.title || '',
        date: dateStr,
        time: timeStr,
        duration: appointment.extendedProps?.duration_minutes || 30,
        appointment_type: appointment.extendedProps?.appointment_type || 'consultation',
        priority: appointment.extendedProps?.priority || 'normal',
        status: appointment.extendedProps?.status || 'scheduled',
        description: appointment.extendedProps?.description || '',
        notes: appointment.extendedProps?.notes || ''
      };
      
      console.log('🔍 DEBUG - New form data:', newFormData);
      setFormData(newFormData);
      
      setPatientSearch(appointment.extendedProps?.patient_name || appointment.title || '');
    }
  }, [appointment, isOpen]);

  // 🔍 AUTOCOMPLETADO DE PACIENTES
  const handlePatientSearch = async (searchTerm: string) => {
    setPatientSearch(searchTerm);
    
    if (searchTerm.length > 0) {
      const localResults = (patients || []).filter(p => 
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm)
      );
      
      setFilteredPatients(localResults);
      setShowSuggestions(true);
      
      if (localResults.length === 0) {
        await fetchPatients({ query: searchTerm });
      }
    } else {
      setShowSuggestions(false);
      setFilteredPatients([]);
    }
  };

  const selectPatient = (patient: any) => {
    setFormData(prev => ({
      ...prev,
      patient_id: patient.id,
      patient_name: `${patient.first_name} ${patient.last_name}`
    }));
    setPatientSearch(`${patient.first_name} ${patient.last_name}`);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🔍 DEBUG: Vamos a ver qué está pasando
    console.log('🔍 DEBUG - FormData al enviar:', formData);
    console.log('🔍 DEBUG - Patient ID:', formData.patient_id);
    console.log('🔍 DEBUG - Patient Name:', formData.patient_name);
    
    // 🚨 VALIDACIÓN MEJORADA
    if (!formData.patient_id && !formData.patient_name) {
      alert('⚠️ Por favor selecciona un paciente');
      return;
    }

    // 🔧 FALLBACK: Si no hay patient_id pero hay patient_name, buscar el ID
    if (!formData.patient_id && formData.patient_name) {
      console.log('⚠️ Falta patient_id, pero tenemos patient_name. Esto puede ser un problema de carga de datos.');
      // Por ahora continuamos, pero logueamos el problema
    }

    const appointmentData: any = {
      patient_id: formData.patient_id,
      title: formData.title || `Cita con ${formData.patient_name}`,
      appointment_type: formData.appointment_type,
      priority: formData.priority,
      status: formData.status,
      description: formData.description,
      notes: formData.notes
    };

    // Solo enviar fecha/tiempo si realmente cambiaron
    const appointmentStart = new Date(appointment.start);
    const originalDate = appointmentStart.toISOString().split('T')[0];
    const originalTime = appointmentStart.toTimeString().substring(0, 5);
    const originalDuration = appointment.extendedProps?.duration_minutes || 30;

    if (formData.date !== originalDate || formData.time !== originalTime) {
      // 🌍 SOLUCIÓN: Crear fecha local y convertir a UTC (como en drag&drop)
      const localDateTime = new Date(`${formData.date}T${formData.time}:00`);
      const utcDateTime = localDateTime.toISOString().slice(0, -5) + 'Z';
      appointmentData.scheduled_date = utcDateTime;
    }
    
    if (parseInt(formData.duration.toString()) !== originalDuration) {
      appointmentData.duration_minutes = parseInt(formData.duration.toString());
    }

    try {
      await onUpdate(appointment.id, appointmentData);
      onClose();
    } catch (error) {
      console.error('Error al actualizar cita:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('⚠️ ¿Estás seguro de que quieres eliminar esta cita?')) {
      try {
        await onDelete(appointment.id);
        onClose();
      } catch (error) {
        console.error('Error al eliminar cita:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 🎯 HEADER COMPACTO */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
              <PencilIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Editar Cita</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 📝 FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {/* 🔍 PACIENTE + TÍTULO (2 COLUMNAS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <UserIcon className="w-4 h-4 inline mr-2" />
                Paciente
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => handlePatientSearch(e.target.value)}
                  placeholder="🔍 Buscar paciente..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              
              {/* SUGERENCIAS */}
              {showSuggestions && filteredPatients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => selectPatient(patient)}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </div>
                      {patient.email && (
                        <div className="text-sm text-gray-500">{patient.email}</div>
                      )}
                      {patient.phone && (
                        <div className="text-sm text-gray-500">{patient.phone}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📝 Título de la Cita
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Consulta general, Limpieza..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* FECHA, HORA, DURACIÓN (3 COLUMNAS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CalendarIcon className="w-4 h-4 inline mr-2" />
                Fecha
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]} // No fechas pasadas
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <ClockIcon className="w-4 h-4 inline mr-2" />
                Hora
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                min="07:00"
                max="21:00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ⏱️ Duración
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hora</option>
                <option value={90}>1.5 h</option>
                <option value={120}>2 horas</option>
              </select>
            </div>
          </div>

          {/* TIPO + PRIORIDAD + ESTADO (3 COLUMNAS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🦷 Tipo de Cita
              </label>
              <select
                value={formData.appointment_type}
                onChange={(e) => setFormData(prev => ({ ...prev, appointment_type: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="consultation">Consulta</option>
                <option value="cleaning">Limpieza</option>
                <option value="filling">Empaste</option>
                <option value="extraction">Extracción</option>
                <option value="root_canal">Endodoncia</option>
                <option value="crown">Corona</option>
                <option value="implant">Implante</option>
                <option value="orthodontics">Ortodoncia</option>
                <option value="emergency">Emergencia</option>
                <option value="follow_up">Seguimiento</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🎯 Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">🔵 Baja</option>
                <option value="normal">🟢 Normal</option>
                <option value="high">🟠 Alta</option>
                <option value="urgent">🔴 Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📋 Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="scheduled">📅 Programada</option>
                <option value="confirmed">✅ Confirmada</option>
                <option value="in_progress">⏳ En progreso</option>
                <option value="completed">✅ Completada</option>
                <option value="cancelled">❌ Cancelada</option>
                <option value="no_show">👻 No presentó</option>
              </select>
            </div>
          </div>

          {/* DESCRIPCIÓN (1 COLUMNA) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📄 Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del tratamiento o motivo de la cita..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* NOTAS (1 COLUMNA) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 Notas Internas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notas adicionales para el equipo médico..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* 🎯 BOTONES DE ACCIÓN */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <TrashIcon className="w-5 h-5" />
              <span>Eliminar Cita</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <PencilIcon className="w-5 h-5" />
              <span>{loading ? 'Guardando...' : 'Actualizar Cita'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAppointmentModal;
