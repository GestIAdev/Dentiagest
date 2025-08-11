import React, { useState, useEffect } from 'react';
import { usePatients } from '../hooks/usePatients.ts';
import { XMarkIcon, CalendarIcon, ClockIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAppointments } from '../hooks/useAppointments.ts';
import { useAuth } from '../context/AuthContext.tsx';

// 🏴‍☠️ AINARKALENDAR TIME SLOTS - FREEDOM EDITION
const generateTimeSlots = (): Array<{value: string, display: string}> => {
  const slots: Array<{value: string, display: string}> = [];
  // 7AM to 8PM (20:00) in 15-minute intervals
  for (let hour = 7; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({ value: timeString, display: displayTime });
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string | null;
  selectedTime?: string | null; // 🕒 PROP PARA HORA PRE-SELECCIONADA
  onCreate?: (appointment: any) => void;
}

const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime, // 🕒 RECIBIR HORA PRE-SELECCIONADA
  onCreate
}) => {
  // ⚡ MODAL INTEGRATION: Clean appointment creation
  const { createAppointment, loading } = useAppointments();
  const { patients, fetchPatients, fetchAllPatients } = usePatients();
  const { state } = useAuth();
  
  // 🎯 ESTADO LIMPIO Y PROFESIONAL
  const [formData, setFormData] = useState({
    patient_id: '',
    patient_name: '',
    title: '',
    date: selectedDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    time: selectedTime || '09:00', // 🕒 USAR HORA PRE-SELECCIONADA
    duration: 30,
    appointment_type: 'consultation',
    priority: 'normal',
    description: '',
    notes: ''
  });
  
  // 🔧 DEBUG: Ver qué hora se establece en el estado inicial
  // 🎯 STATE MANAGEMENT: Patient search and suggestions
  const [patientSearch, setPatientSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState(patients || []);

  // � ACTUALIZAR FORMULARIO CUANDO CAMBIAN LAS PROPS PRE-SELECCIONADAS
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      date: selectedDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      time: selectedTime || prev.time
    }));
  }, [selectedDate, selectedTime]);

  // �🔍 AUTOCOMPLETADO PROFESIONAL - NO MORE TEMPORARY BULLSHIT!
  const handlePatientSearch = async (searchTerm: string) => {
    setPatientSearch(searchTerm);
    
    if (searchTerm.length > 0) {
      // 🔥 ANARQUIST DEBUG - TEST fetchAllPatients first
      console.log('🔥 Testing fetchAllPatients vs fetchPatients');
      console.log('🔥 Current patients array length:', patients.length);
      
      // Buscar en pacientes locales primero
      const localResults = (patients || []).filter(p => 
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm)
      );
      
      // Si no hay resultados locales, buscar en API
      if (localResults.length === 0) {
        // Try fetchAllPatients first, then search endpoint
        const allPatientsTest = await fetchAllPatients();
        
        // Now try the search endpoint
        const apiResults = await fetchPatients({ query: searchTerm });
        const patients = apiResults?.items || [];
        setFilteredPatients(patients);
      } else {
        setFilteredPatients(localResults);
      }
      
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFormData(prev => ({ ...prev, patient_id: '', patient_name: '' }));
    }
  };

  // 📅 VALIDACIÓN DE FECHAS PROFESIONAL
  const isValidDate = (dateString: string) => {
    // 🌍 PARSE DATE IN LOCAL TIMEZONE TO AVOID UTC ISSUES
    const [year, month, day] = dateString.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day); // month-1 because Date uses 0-based months
    const today = new Date();
    
    // 🕒 COMPARAR SOLO FECHAS - NO HORAS para permitir citas hoy y futuras
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    // ✅ VALIDATION: Allow today and future dates only
    return selectedDateOnly >= todayOnly;
  };

  // 🎯 HANDLERS ÉPICOS
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePatientSelect = (patient: any) => {
    const fullName = `${patient.first_name} ${patient.last_name}`;
    setFormData(prev => ({
      ...prev,
      patient_id: patient.id,
      patient_name: fullName
    }));
    setPatientSearch(fullName);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🛡️ VALIDACIONES PROFESIONALES
    if (!formData.patient_id) {
      alert('❌ Debes seleccionar un paciente registrado en el sistema');
      return;
    }
    
    if (!isValidDate(formData.date)) {
      alert('❌ No puedes programar citas en fechas pasadas');
      return;
    }
    
    try {
      const startDateTime = new Date(`${formData.date}T${formData.time}:00`);
      
      // 🎯 ESTRUCTURA EXACTA QUE ESPERA EL BACKEND
      const newAppointment = {
        patient_id: formData.patient_id,
        dentist_id: state?.user?.id || '',
        scheduled_date: startDateTime.toISOString(),
        duration_minutes: Number(formData.duration),
        appointment_type: formData.appointment_type,
        priority: formData.priority,
        title: formData.title,
        description: formData.description,
        notes: formData.notes
      };

      // ✅ CREATE APPOINTMENT: Send to backend
      if (onCreate) {
        await onCreate(newAppointment);
      } else {
        await createAppointment(newAppointment);
      }
      
      // 🧹 RESET LIMPIO
      setFormData({
        patient_id: '',
        patient_name: '',
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        duration: 30,
        appointment_type: 'consultation',
        priority: 'normal',
        description: '',
        notes: ''
      });
      setPatientSearch('');
      onClose();
    } catch (error: any) {
      console.error('❌ Error creating appointment:', error);
      
      // 🚨 MANEJO ESPECÍFICO DE CONFLICTOS DE HORARIO
      if (error?.response?.status === 409) {
        alert('⚠️ CONFLICTO DE HORARIOS\n\nYa existe una cita programada para ese horario.\nPor favor, selecciona una fecha/hora diferente.');
      } else if (error?.message?.includes('409') || error?.message?.includes('conflict')) {
        alert('⚠️ CONFLICTO DE HORARIOS\n\nYa existe una cita programada para ese horario.\nPor favor, selecciona una fecha/hora diferente.');
      } else {
        alert('❌ Error al crear la cita. Intenta nuevamente.');
      }
    }
  };

  if (!isOpen) return null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 🎨 HEADER ÉPICO CON MIS ICONOS CHULOS */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Nueva Cita Profesional</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 🎯 FORMULARIO PROFESIONAL */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 👤 BÚSQUEDA DE PACIENTE ÉPICA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                👤 Paciente Registrado *
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => handlePatientSearch(e.target.value)}
                  autoComplete="off"
                  required
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Buscar paciente registrado..."
                />
                
                {/* 🎯 AUTOCOMPLETADO PROFESIONAL */}
                {showSuggestions && filteredPatients.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-gray-200 rounded-lg w-full mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {filteredPatients.map((patient) => (
                      <li
                        key={patient.id}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center space-x-2"
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <UserIcon className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{patient.first_name} {patient.last_name}</span>
                        {patient.email && <span className="text-sm text-gray-500">• {patient.email}</span>}
                      </li>
                    ))}
                  </ul>
                )}
                
                {/* ✅ PACIENTE SELECCIONADO */}
                {formData.patient_id && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700 font-medium">✅ {formData.patient_name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🦷 Título de la Cita *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Limpieza dental, Consulta de rutina..."
              />
            </div>
          </div>

          {/* 📅 FECHA Y HORA PROFESIONAL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 Fecha *
              </label>
              <div className="relative">
                <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]} // No fechas pasadas
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🕐 Hora *
              </label>
              <div className="relative">
                <ClockIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3 z-10 pointer-events-none" />
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Selecciona hora</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.display}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ⏱️ Duración
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hora</option>
                <option value={90}>1.5 horas</option>
                <option value={120}>2 horas</option>
              </select>
            </div>
          </div>

          {/* 🎯 TIPO Y PRIORIDAD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🦷 Tipo de Consulta
              </label>
              <select
                name="appointment_type"
                value={formData.appointment_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <option value="checkup">Revisión</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ⚡ Prioridad
                <span className="text-xs text-gray-500 ml-2" title="🤖 Auto: Emergencias=Urgente, 'dolor' en notas=Alta. 👤 Manual: sobrescribe automático">
                  (Auto + Manual)
                </span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="🤖 Sistema Híbrido: Se auto-detecta por tipo/notas, pero puedes sobrescribir manualmente"
              >
                <option value="normal">🟢 Normal</option>
                <option value="high">🟠 Alta</option>
                <option value="urgent">🔴 Urgente</option>
              </select>
              <div className="text-xs text-gray-500 mt-1">
                🤖 Auto: Emergencias→Urgente, "dolor"/"urgente" en notas→Alta
              </div>
            </div>
          </div>

          {/* 📝 DESCRIPCIÓN Y NOTAS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📋 Descripción del Tratamiento
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Descripción opcional del tratamiento a realizar..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 Notas Internas
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Notas privadas para el equipo médico..."
            />
          </div>

          {/* 🎯 BOTONES ÉPICOS */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.patient_id}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <CalendarIcon className="w-4 h-4" />
                  <span>Crear Cita Profesional</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAppointmentModal;
