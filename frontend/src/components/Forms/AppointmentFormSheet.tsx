/**
 * 🗓️ APPOINTMENT FORM SHEET - STANDARD DE ORO V4
 * 
 * ARCHITECT: PunkClaude + Radwulf
 * DATE: 2025-11-25
 * MISSION: Agendar citas con la misma densidad/perfección que PatientFormSheet
 * REFERENCE: PatientFormSheet.tsx (Sheet lateral, React Hook Form, Zod)
 */

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { 
  CREATE_APPOINTMENT_V3,
  UPDATE_APPOINTMENT_V3,
  GET_APPOINTMENTS_V3
} from '../../graphql/queries/appointments';
import { GET_PATIENTS } from '../../graphql/queries/patients';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';

// 🔥 TYPES
interface AppointmentFormData {
  patientId: string;
  appointmentDate: string;  // YYYY-MM-DD
  appointmentTime: string;  // HH:MM
  duration: number;
  type: string;
  status: string;
  notes?: string;
  treatmentDetails?: string;
}

interface AppointmentFormSheetProps {
  appointment?: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  prefilledDate?: Date;  // 🎯 Prefill desde click en calendario
  prefilledTime?: string;
}

const AppointmentFormSheet: React.FC<AppointmentFormSheetProps> = ({
  appointment,
  isOpen,
  onClose,
  onSave,
  prefilledDate,
  prefilledTime
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('details');
  
  // 🔍 PATIENT SEARCH STATE
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  
  // ⏰ FORM STATE
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: appointment?.patientId || '',
    appointmentDate: appointment?.appointmentDate || (prefilledDate ? prefilledDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
    appointmentTime: appointment?.appointmentTime || prefilledTime || '09:00',
    duration: appointment?.duration || 30,
    type: appointment?.type || 'consultation',
    status: appointment?.status || 'scheduled',
    notes: appointment?.notes || '',
    treatmentDetails: appointment?.treatmentDetails || ''
  });

  // 🔌 GRAPHQL - Fetch Patients for Autocomplete (NO skip, limit 1000)
  const { data: patientsData, loading: patientsLoading } = useQuery(GET_PATIENTS, {
    variables: { limit: 1000, offset: 0 },
    fetchPolicy: 'cache-first' // Cache for performance
  });

  // 🔌 GRAPHQL MUTATIONS
  const [createAppointment] = useMutation(CREATE_APPOINTMENT_V3, {
    refetchQueries: [{ 
      query: GET_APPOINTMENTS_V3,
      variables: { limit: 1000, offset: 0 }  // Refetch all appointments for calendar
    }]
  });

  const [updateAppointment] = useMutation(UPDATE_APPOINTMENT_V3, {
    refetchQueries: [{ 
      query: GET_APPOINTMENTS_V3,
      variables: { limit: 1000, offset: 0 }
    }]
  });

  // 🔄 UPDATE FORM WHEN APPOINTMENT CHANGES
  useEffect(() => {
    if (appointment) {
      setFormData({
        patientId: appointment.patientId || '',
        appointmentDate: appointment.appointmentDate || new Date().toISOString().split('T')[0],
        appointmentTime: appointment.appointmentTime || '09:00',
        duration: appointment.duration || 30,
        type: appointment.type || 'consultation',
        status: appointment.status || 'scheduled',
        notes: appointment.notes || '',
        treatmentDetails: appointment.treatmentDetails || ''
      });
      
      // Set patient name for display
      if (appointment.patient) {
        const name = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
        setSelectedPatientName(name);
        setPatientSearch(name);
      }
    } else {
      // Reset for new appointment
      setFormData({
        patientId: '',
        appointmentDate: prefilledDate ? prefilledDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        appointmentTime: prefilledTime || '09:00',
        duration: 30,
        type: 'consultation',
        status: 'scheduled',
        notes: '',
        treatmentDetails: ''
      });
      setSelectedPatientName('');
      setPatientSearch('');
    }
  }, [appointment, prefilledDate, prefilledTime]);

  // 🎯 HANDLERS
  const handleInputChange = (field: keyof AppointmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleInputChange(name as keyof AppointmentFormData, value);
  };
  
  // 🔍 PATIENT SEARCH HANDLERS
  const handlePatientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientSearch(e.target.value);
    setShowPatientDropdown(true);
    
    // Clear selection if user types
    if (formData.patientId && e.target.value !== selectedPatientName) {
      handleInputChange('patientId', '');
      setSelectedPatientName('');
    }
  };
  
  const handlePatientSelect = (patient: any) => {
    handleInputChange('patientId', patient.id);
    // FIX: Use camelCase firstName/lastName
    const name = `${patient.firstName} ${patient.lastName}`;
    setSelectedPatientName(name);
    setPatientSearch(name);
    setShowPatientDropdown(false);
  };

  // 🔥 VALIDATION
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Paciente es requerido';
    }
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Fecha es requerida';
    }
    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Hora es requerida';
    }
    if (!formData.type) {
      newErrors.type = 'Tipo de cita es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 💾 SAVE
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setIsLoading(true);

    try {
      if (appointment?.id) {
        // UPDATE
        const payload = {
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          duration: parseInt(formData.duration.toString()),
          type: formData.type.toUpperCase(), // ENUM UPPERCASE
          status: formData.status.toUpperCase(), // ENUM UPPERCASE
          notes: formData.notes || ''
        };
        
        console.log('🚀 UPDATE PAYLOAD:', { id: appointment.id, input: payload });
        
        await updateAppointment({
          variables: {
            id: appointment.id,
            input: payload
          }
        });
        toast.success('✅ Cita actualizada');
      } else {
        // CREATE
        const payload = {
          patientId: formData.patientId,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          duration: parseInt(formData.duration.toString()), // ENSURE INT
          type: formData.type.toUpperCase(), // ENUM UPPERCASE (CONSULTATION, CLEANING, etc.)
          status: (formData.status || 'SCHEDULED').toUpperCase(), // ENUM UPPERCASE (SCHEDULED, CONFIRMED, etc.)
          notes: formData.notes || ''
        };
        
        console.log('🚀 PAYLOAD FINAL:', { input: payload });
        
        await createAppointment({
          variables: {
            input: payload
          }
        });
        toast.success('✅ Cita creada');
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('❌ Error saving appointment:', error);
      console.error('❌ GraphQL errors:', error.graphQLErrors);
      console.error('❌ Network error:', error.networkError);
      
      // 🔍 DEBUGGING: Check authentication
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      console.log('🔐 Token exists:', !!token);
      if (!token) {
        console.error('❌ NO TOKEN FOUND - User not authenticated!');
      }
      
      // Extract detailed error message
      let errorMessage = error.message;
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors.map((e: any) => e.message).join(', ');
        console.error('❌ GraphQL Error Messages:', errorMessage);
      } else if (error.networkError) {
        errorMessage = `Network error: ${error.networkError.message}`;
      }
      
      toast.error(`❌ Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 🎨 PATIENTS LIST - FILTERED BY SEARCH
  const patients = (patientsData as any)?.patients || [];
  const filteredPatients = patientSearch.trim()
    ? patients.filter((p: any) => {
        // FIX: GraphQL returns firstName/lastName (camelCase), not first_name/last_name
        const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
        const phone = p.phone || '';
        const searchLower = patientSearch.toLowerCase();
        return fullName.includes(searchLower) || phone.includes(searchLower);
      }).slice(0, 10) // Max 10 results
    : [];

  // ⏰ TIME SLOTS (15 min intervals from 7am to 9pm)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour < 21; hour++) {
      for (let minute of [0, 15, 30, 45]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-[800px] sm:max-w-[800px] bg-slate-900 border-purple-500/20 overflow-y-auto"
      >
        <SheetHeader className="border-b border-purple-500/20 pb-4 mb-4">
          <SheetTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            {appointment ? '✏️ Editar Cita' : '➕ Nueva Cita'}
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            {appointment ? 'Modifica los detalles de la cita' : 'Completa el formulario para agendar una nueva cita'}
          </SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/60 border border-purple-500/20 mb-6">
            <TabsTrigger 
              value="details"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              📋 Detalles
            </TabsTrigger>
            <TabsTrigger 
              value="notes"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              📝 Notas
            </TabsTrigger>
          </TabsList>

          {/* ==================== TAB 1: DETALLES ==================== */}
          <TabsContent value="details" className="space-y-6">
            {/* 🔍 PATIENT AUTOCOMPLETE */}
            <div className="space-y-2 relative">
              <Label htmlFor="patientSearch" className="text-slate-200 font-medium">
                Paciente <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="patientSearch"
                  type="text"
                  value={patientSearch}
                  onChange={handlePatientSearchChange}
                  onFocus={() => setShowPatientDropdown(true)}
                  placeholder="Escribe nombre o teléfono..."
                  className={`bg-slate-800/60 border-slate-700 text-slate-200 ${
                    errors.patientId ? 'border-red-500' : ''
                  }`}
                  autoComplete="off"
                />
                
                {/* Dropdown results */}
                {showPatientDropdown && filteredPatients.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-purple-500/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredPatients.map((patient: any) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => handlePatientSelect(patient)}
                        className="w-full px-4 py-2 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-0"
                      >
                        <div className="text-slate-200 font-medium">
                          {patient.firstName} {patient.lastName}
                        </div>
                        {patient.phone && (
                          <div className="text-xs text-slate-400">
                            📞 {patient.phone}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* No results message */}
                {showPatientDropdown && patientSearch.trim() && filteredPatients.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-purple-500/20 rounded-lg shadow-lg p-4 text-center text-slate-400">
                    No se encontraron pacientes
                  </div>
                )}
              </div>
              {errors.patientId && (
                <p className="text-red-400 text-sm">{errors.patientId}</p>
              )}
            </div>

            {/* 🗓️ FECHA Y HORA (Grid 2 Cols) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="appointmentDate" className="text-slate-200 font-medium">
                  Fecha <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                  className={`bg-slate-800/60 border-slate-700 text-slate-200 ${
                    errors.appointmentDate ? 'border-red-500' : ''
                  }`}
                />
                {errors.appointmentDate && (
                  <p className="text-red-400 text-sm">{errors.appointmentDate}</p>
                )}
              </div>

              {/* Hora */}
              <div className="space-y-2">
                <Label htmlFor="appointmentTime" className="text-slate-200 font-medium">
                  Hora <span className="text-red-400">*</span>
                </Label>
                <select
                  id="appointmentTime"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleSelectChange}
                  className={`flex h-9 w-full rounded-md border bg-slate-800/60 border-slate-700 px-3 py-1 text-sm text-slate-200 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 ${
                    errors.appointmentTime ? 'border-red-500' : ''
                  }`}
                >
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {errors.appointmentTime && (
                  <p className="text-red-400 text-sm">{errors.appointmentTime}</p>
                )}
              </div>
            </div>

            {/* ⏱️ DURACIÓN */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-slate-200 font-medium">
                Duración (minutos)
              </Label>
              <select
                id="duration"
                name="duration"
                value={formData.duration.toString()}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                className="flex h-9 w-full rounded-md border bg-slate-800/60 border-slate-700 px-3 py-1 text-sm text-slate-200 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1 hora</option>
                <option value="90">1.5 horas</option>
                <option value="120">2 horas</option>
              </select>
            </div>

            {/* 🏥 TIPO Y ESTADO (Grid 2 Cols) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="type" className="text-slate-200 font-medium">
                  Tipo <span className="text-red-400">*</span>
                </Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleSelectChange}
                  className={`flex h-9 w-full rounded-md border bg-slate-800/60 border-slate-700 px-3 py-1 text-sm text-slate-200 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 ${
                    errors.type ? 'border-red-500' : ''
                  }`}
                >
                  <option value="consultation">Consulta</option>
                  <option value="cleaning">Limpieza</option>
                  <option value="treatment">Tratamiento</option>
                  <option value="emergency">Emergencia</option>
                  <option value="followup">Seguimiento</option>
                  <option value="orthodontics">Ortodoncia</option>
                  <option value="endodontics">Endodoncia</option>
                </select>
                {errors.type && (
                  <p className="text-red-400 text-sm">{errors.type}</p>
                )}
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-slate-200 font-medium">
                  Estado
                </Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  className="flex h-9 w-full rounded-md border bg-slate-800/60 border-slate-700 px-3 py-1 text-sm text-slate-200 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
                >
                  <option value="scheduled">Programada</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="in_progress">En curso</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="no_show">No asistió</option>
                </select>
              </div>
            </div>
          </TabsContent>

          {/* ==================== TAB 2: NOTAS ==================== */}
          <TabsContent value="notes" className="space-y-6">
            {/* Notas Generales */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-200 font-medium">
                Notas de la Cita
              </Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-md text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="Motivo de consulta, síntomas, observaciones..."
              />
            </div>

            {/* Detalles de Tratamiento */}
            <div className="space-y-2">
              <Label htmlFor="treatmentDetails" className="text-slate-200 font-medium">
                Detalles del Tratamiento
              </Label>
              <textarea
                id="treatmentDetails"
                value={formData.treatmentDetails}
                onChange={(e) => handleInputChange('treatmentDetails', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 bg-slate-800/60 border border-slate-700 rounded-md text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                placeholder="Procedimientos planificados, materiales necesarios, instrucciones..."
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* 🎯 ACTIONS */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-purple-500/20">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600"
          >
            {isLoading ? 'Guardando...' : appointment ? 'Actualizar' : 'Crear Cita'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AppointmentFormSheet;
