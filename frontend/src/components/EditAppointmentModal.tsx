import React, { useState, useEffect } from 'react';
import { usePatients } from '../hooks/usePatients.ts';
import { XMarkIcon, CalendarIcon, ClockIcon, UserIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAppointments } from '../hooks/useAppointments.ts';
import { parseClinicDateTime } from '../utils/timezone.ts'; // 🌍 TIMEZONE SOLUTION!
import { useAuth } from '../context/AuthContext.tsx'; // 🔐 AUTH SOLUTION!

// 🏴‍☠️ AINARKALENDAR TIME SLOTS - FREEDOM EDITION
const generateTimeSlots = (): Array<{value: string, display: string}> => {
  const slots: Array<{value: string, display: string}> = [];
  for (let hour = 7; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({ value: timeString, display: timeString });
    }
  }
  return slots;
};
const TIME_SLOTS = generateTimeSlots();

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
  const { state } = useAuth(); // 🔐 AUTH STATE FOR TOKEN
  
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

  // 🕐 ESTADO DE VALIDACIÓN DE HORARIOS
  const [scheduleValidation, setScheduleValidation] = useState<{
    message: string;
    type: 'idle' | 'validating' | 'success' | 'error';
    availableSlots?: string[];
  }>({ message: '', type: 'idle' });

  // 🔄 CARGAR DATOS DE LA CITA AL ABRIR EL MODAL
  useEffect(() => {
    if (appointment && isOpen) {
      // 🛡️ DEFENSIVE DATE PARSING - Handle both FullCalendar and direct appointment formats
      const rawDate = appointment.extendedProps?.scheduled_date || 
                     appointment.start || 
                     appointment.scheduled_date; // 🎯 ADD DIRECT APPOINTMENT SUPPORT!
      
      if (!rawDate) {
        console.warn('⚠️ EditAppointmentModal: No date found in appointment:', appointment);
        return;
      }

      console.log('🔍 EditAppointmentModal: Found date:', rawDate, 'from appointment:', appointment);

      try {
        // 🌍 USE TIMEZONE UTILITIES - CYBERPUNK SOLUTION!
        const appointmentDate = parseClinicDateTime(rawDate);
        
        // 🛡️ CHECK IF PARSED DATE IS VALID
        if (!appointmentDate || isNaN(appointmentDate.getTime())) {
          console.error('❌ EditAppointmentModal: Invalid parsed date:', rawDate, '→', appointmentDate);
          return;
        }

        const dateStr = appointmentDate.toISOString().split('T')[0];
      
      // 🏴‍☠️ AINARKALENDAR TIME PARSING - FREEDOM EDITION
      const hours = appointmentDate.getHours();
      const minutes = appointmentDate.getMinutes();
      // Round to nearest 15-minute slot
      const roundedMinutes = Math.round(minutes / 15) * 15;
      const timeStr = `${hours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
      
      // 🎯 HELPER: Get field from either FullCalendar or direct appointment format
      const getField = (fcField: string, directField: string, fallback: any = '') => {
        return appointment.extendedProps?.[fcField] || appointment[directField] || fallback;
      };
      
      const newFormData = {
        patient_id: getField('patient_id', 'patient_id'),
        patient_name: getField('patient_name', 'patient_name') || appointment.title || '',
        title: getField('title', 'title') || appointment.title?.split(' - ')[1] || appointment.title || '',
        date: dateStr,
        time: timeStr,
        duration: getField('duration_minutes', 'duration_minutes', 30),
        appointment_type: getField('appointment_type', 'appointment_type', 'consultation'),
        priority: getField('priority', 'priority', 'normal'),
        status: getField('status', 'status', 'scheduled'),
        description: getField('description', 'description'),
        notes: getField('notes', 'notes')
      };
      
      setFormData(newFormData);
      
      setPatientSearch(getField('patient_name', 'patient_name') || appointment.title || '');
      
      } catch (error) {
        console.error('❌ EditAppointmentModal: Error processing appointment data:', error, appointment);
      }
    }
  }, [appointment, isOpen]);

  // � VALIDAR HORARIO CUANDO CAMBIE FECHA/HORA
  // 🏥 MULTI-DENTIST CLINIC: Schedule validation disabled
  // Allow simultaneous appointments for multi-doctor flexibility
  useEffect(() => {
    // validateSchedule function commented out to allow overlapping appointments
    // const validateSchedule = async () => {
    //   if (formData.date && formData.time) {
    //     setScheduleValidation({ message: 'Validando horario...', type: 'validating' });
    //     
    //     const result = await validateTimeSlot(
    //       formData.date, 
    //       formData.time, 
    //       formData.duration,
    //       appointment.id // Excluir la cita actual
    //     );
    //     
    //     if (result.hasConflict) {
    //       const availableSlots = findAvailableSlots(formData.date, formData.duration);
    //       setScheduleValidation({
    //         message: result.message,
    //         type: 'error',
    //         availableSlots: availableSlots.slice(0, 5) // Mostrar solo 5 sugerencias
    //       });
    //     } else {
    //       setScheduleValidation({
    //         message: result.message,
    //         type: 'success'
    //       });
    //     }
    //   }
    // };

    // // Debounce la validación para no hacer demasiadas llamadas
    // const timeoutId = setTimeout(validateSchedule, 500);
    // return () => clearTimeout(timeoutId);
  }, []); // Simplified dependency array

  // �🔍 AUTOCOMPLETADO DE PACIENTES
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
    
    // � VALIDACIÓN DE HORARIOS ANTES DE ENVIAR
    if (scheduleValidation.type === 'error') {
      alert(`❌ ${scheduleValidation.message}`);
      return;
    }
    
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
    // 🛡️ DEFENSIVE: Handle both FullCalendar and direct appointment formats
    const rawOriginalDate = appointment.start || appointment.scheduled_date;
    
    if (!rawOriginalDate) {
      console.warn('⚠️ No original date found for comparison:', appointment);
      // Skip date comparison, just send the new data
    } else {
      const appointmentStart = new Date(rawOriginalDate);
      
      // 🛡️ CHECK IF DATE IS VALID before using toISOString()
      if (isNaN(appointmentStart.getTime())) {
        console.error('❌ Invalid original date:', rawOriginalDate);
        // Skip date comparison, just send the new data
      } else {
        const originalDate = appointmentStart.toISOString().split('T')[0];
        const originalTime = appointmentStart.toTimeString().substring(0, 5);
        const originalDuration = appointment.extendedProps?.duration_minutes || appointment.duration_minutes || 30;

        if (formData.date !== originalDate || formData.time !== originalTime) {
          // 🌍 SOLUCIÓN: Crear fecha local y convertir a UTC (como en drag&drop)
          const localDateTime = new Date(`${formData.date}T${formData.time}:00`);
          
          // 🛡️ VALIDATE local date before toISOString()
          if (isNaN(localDateTime.getTime())) {
            console.error('❌ Invalid local date time:', `${formData.date}T${formData.time}:00`);
            alert('⚠️ Fecha u hora inválida. Por favor revisa los valores.');
            return;
          }
          
          const utcDateTime = localDateTime.toISOString().slice(0, -5) + 'Z';
          appointmentData.scheduled_date = utcDateTime;
        }
        
        if (parseInt(formData.duration.toString()) !== originalDuration) {
          appointmentData.duration_minutes = parseInt(formData.duration.toString());
        }
      }
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
              <select
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                required
              >
                <option value="">Selecciona hora</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.display}
                  </option>
                ))}
              </select>
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

          {/* 🕐 VALIDACIÓN DE HORARIOS */}
          {formData.date && formData.time && (
            <div className={`
              p-3 rounded-lg text-sm
              ${scheduleValidation.type === 'validating' ? 'bg-blue-50 text-blue-700' : ''}
              ${scheduleValidation.type === 'success' ? 'bg-green-50 text-green-700' : ''}
              ${scheduleValidation.type === 'error' ? 'bg-red-50 text-red-700' : ''}
            `}>
              <div className="flex items-center space-x-2">
                {scheduleValidation.type === 'validating' && <span className="animate-spin">⏳</span>}
                {scheduleValidation.type === 'success' && <span>✅</span>}
                {scheduleValidation.type === 'error' && <span>⚠️</span>}
                <span>{scheduleValidation.message}</span>
              </div>
              
              {scheduleValidation.type === 'error' && scheduleValidation.availableSlots && scheduleValidation.availableSlots.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">💡 Horarios disponibles:</p>
                  <div className="flex flex-wrap gap-1">
                    {scheduleValidation.availableSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, time: slot }))}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
                <option value="follow_up">Seguimiento</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🎯 Prioridad
                <span className="text-xs text-gray-500 ml-2" title="🤖 Auto: 'dolor' en notas=Alta. 👤 Manual: sobrescribe automático">
                  (Auto + Manual)
                </span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="🤖 Sistema Híbrido: Se auto-detecta por tipo/notas, pero puedes sobrescribir manualmente"
              >
                <option value="normal">🟢 Normal</option>
                <option value="high">🟠 Alta</option>
                <option value="urgent">🔴 Urgente</option>
              </select>
              <div className="text-xs text-gray-500 mt-1">
                🤖 Auto: "dolor"/"urgente" en notas→Alta
              </div>
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
