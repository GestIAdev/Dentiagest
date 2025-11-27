/**
 * 🦷🎸💀 TREATMENT FORM SHEET - QUIRÓFANO DIGITAL
 * ================================================
 * By PunkClaude & GeminiPunk - November 2025
 * 
 * AXIOMAS:
 * - NO MOCKS: Mutations reales conectadas
 * - PATTERN: PatientFormSheet (Sheet + Tabs)
 * - SCHEMA MATCHED: Solo campos del backend V5
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '../ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { 
  CREATE_TREATMENT_V3, 
  UPDATE_TREATMENT_V3, 
  DELETE_TREATMENT,
  Treatment 
} from '../../graphql/queries/treatments';
import { GET_PATIENTS_V3 } from '../../graphql/queries/patients';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ============================================================================
// TYPES
// ============================================================================

interface TreatmentFormData {
  patientId: string;
  treatmentType: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  cost: number;
  toothNumber: number | null;
  notes: string;
}

interface TreatmentFormSheetProps {
  treatment?: Treatment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  preselectedPatientId?: string;
  preselectedToothNumber?: number;
}

// ============================================================================
// TREATMENT TYPES (FDI Classification)
// ============================================================================

// Treatment Types - Must match PostgreSQL procedurecategory ENUM exactly
const TREATMENT_TYPES = [
  { value: 'CONSULTATION', label: '📋 Consulta', category: 'general' },
  { value: 'PREVENTIVE', label: '🪥 Preventivo (Limpieza)', category: 'preventivo' },
  { value: 'RESTORATIVE', label: '💎 Restauración (Empaste)', category: 'restauracion' },
  { value: 'COSMETIC', label: '✨ Cosmético (Blanqueamiento)', category: 'estetica' },
  { value: 'ORTHODONTIC', label: '🦷 Ortodoncia', category: 'especialidad' },
  { value: 'PERIODONTAL', label: '🩺 Periodoncia', category: 'especialidad' },
  { value: 'ENDODONTIC', label: '💉 Endodoncia', category: 'especialidad' },
  { value: 'ORAL_SURGERY', label: '🔪 Cirugía Oral (Extracción)', category: 'cirugia' },
  { value: 'PROSTHODONTIC', label: '� Prostodoncia (Corona/Puente)', category: 'restauracion' },
  { value: 'EMERGENCY', label: '� Emergencia', category: 'urgente' },
];

// Treatment Status - Must match PostgreSQL treatmentstatus ENUM exactly
const TREATMENT_STATUSES = [
  { value: 'PLANNED', label: '📝 Planificado', color: 'purple' },
  { value: 'IN_PROGRESS', label: '🔄 En Progreso', color: 'amber' },
  { value: 'COMPLETED', label: '✅ Completado', color: 'emerald' },
  { value: 'CANCELLED', label: '❌ Cancelado', color: 'red' },
  { value: 'POSTPONED', label: '⏸️ Pospuesto', color: 'slate' },
  { value: 'FOLLOW_UP_REQUIRED', label: '🔔 Requiere Seguimiento', color: 'blue' },
];

// FDI Tooth Numbers (32 adult teeth)
const FDI_TEETH = [
  // Upper Right (Q1): 18-11
  18, 17, 16, 15, 14, 13, 12, 11,
  // Upper Left (Q2): 21-28
  21, 22, 23, 24, 25, 26, 27, 28,
  // Lower Left (Q3): 31-38
  31, 32, 33, 34, 35, 36, 37, 38,
  // Lower Right (Q4): 41-48
  41, 42, 43, 44, 45, 46, 47, 48,
];

// Styled select class
const selectClassName = `
  w-full h-10 px-3 py-2 rounded-md text-sm text-white
  bg-slate-800/50 border border-slate-700
  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900
  disabled:cursor-not-allowed disabled:opacity-50
  appearance-none cursor-pointer
`;

const textareaClassName = `
  w-full min-h-[100px] px-3 py-2 rounded-md text-sm text-white
  bg-slate-800/50 border border-slate-700
  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900
  disabled:cursor-not-allowed disabled:opacity-50
  resize-none
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TreatmentFormSheet: React.FC<TreatmentFormSheetProps> = ({
  treatment,
  isOpen,
  onClose,
  onSave,
  preselectedPatientId,
  preselectedToothNumber,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('general');
  
  // 🔐 Get current user for practitionerId
  const { state: authState } = useAuth();
  const currentUserId = authState?.user?.id || 'system-user';

  // Helper to parse dates that might be timestamps, ISO strings, or date strings
  const parseDateToYYYYMMDD = (dateValue: string | number | null | undefined): string => {
    if (!dateValue) return '';
    try {
      // If it's a number (timestamp), convert to Date
      if (typeof dateValue === 'number') {
        return new Date(dateValue).toISOString().split('T')[0];
      }
      // If it's a string that looks like a timestamp
      if (typeof dateValue === 'string' && /^\d+$/.test(dateValue)) {
        return new Date(parseInt(dateValue)).toISOString().split('T')[0];
      }
      // If it's an ISO string or date string
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      return '';
    } catch {
      return '';
    }
  };

  // Initial form state
  const getInitialFormData = (): TreatmentFormData => ({
    patientId: preselectedPatientId || treatment?.patientId || '',
    treatmentType: treatment?.treatmentType || '',
    description: treatment?.description || '',
    status: treatment?.status || 'PLANNED',
    startDate: parseDateToYYYYMMDD(treatment?.startDate) || new Date().toISOString().split('T')[0],
    endDate: parseDateToYYYYMMDD(treatment?.endDate),
    cost: treatment?.cost || 0,
    toothNumber: preselectedToothNumber || null,
    notes: treatment?.notes || '',
  });

  const [formData, setFormData] = useState<TreatmentFormData>(getInitialFormData());

  // Reset form when treatment changes
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setErrors({});
      setActiveTab('general');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, treatment, preselectedPatientId, preselectedToothNumber]);

  // 🔥 FETCH PATIENTS FOR SELECT
  const { data: patientsData } = useQuery(GET_PATIENTS_V3, {
    variables: { limit: 500 },
    fetchPolicy: 'cache-first',
  });

  const patients = (patientsData as { patientsV3?: { id: string; firstName: string; lastName: string; email: string }[] })?.patientsV3 || [];

  // 🔥 GRAPHQL MUTATIONS - SCHEMA V5 CLEAN
  const [createTreatment] = useMutation(CREATE_TREATMENT_V3, {
    refetchQueries: ['GetTreatmentsV3'],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast.success('✅ Tratamiento creado exitosamente');
      onSave();
      onClose();
    },
    onError: (error) => {
      console.error('❌ Error creating treatment:', error);
      toast.error(`❌ Error: ${error.message}`);
      setErrors({ submit: error.message });
    },
  });

  const [updateTreatment] = useMutation(UPDATE_TREATMENT_V3, {
    refetchQueries: ['GetTreatmentsV3'],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast.success('✅ Tratamiento actualizado exitosamente');
      onSave();
      onClose();
    },
    onError: (error) => {
      console.error('❌ Error updating treatment:', error);
      toast.error(`❌ Error: ${error.message}`);
      setErrors({ submit: error.message });
    },
  });

  const [deleteTreatment] = useMutation(DELETE_TREATMENT, {
    refetchQueries: ['GetTreatmentsV3'],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast.success('🗑️ Tratamiento eliminado');
      onSave();
      onClose();
    },
    onError: (error) => {
      console.error('❌ Error deleting treatment:', error);
      toast.error(`❌ Error: ${error.message}`);
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleChange = (field: keyof TreatmentFormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Selecciona un paciente';
    }
    if (!formData.treatmentType) {
      newErrors.treatmentType = 'Selecciona un tipo de tratamiento';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Fecha de inicio requerida';
    }
    if (formData.cost < 0) {
      newErrors.cost = 'El coste no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('❌ Corrige los errores del formulario');
      return;
    }

    setIsLoading(true);

    // Build description with tooth number if present
    let finalDescription = formData.description;
    if (formData.toothNumber) {
      if (!finalDescription.includes(`#${formData.toothNumber}`)) {
        finalDescription = `Diente #${formData.toothNumber}${finalDescription ? ': ' + finalDescription : ''}`;
      }
    }

    try {
      if (treatment?.id) {
        // UPDATE - includes status field
        const updateInput = {
          patientId: formData.patientId,
          practitionerId: currentUserId,
          treatmentType: formData.treatmentType,
          description: finalDescription,
          status: formData.status, // Only valid for UPDATE
          startDate: new Date(formData.startDate).toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          cost: parseFloat(String(formData.cost)) || 0,
          notes: formData.notes,
        };
        await updateTreatment({ variables: { id: treatment.id, input: updateInput } });
      } else {
        // CREATE - NO status field (backend sets default)
        const createInput = {
          patientId: formData.patientId,
          practitionerId: currentUserId,
          treatmentType: formData.treatmentType,
          description: finalDescription,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          cost: parseFloat(String(formData.cost)) || 0,
          notes: formData.notes,
        };
        await createTreatment({ variables: { input: createInput } });
      }
    } catch (error) {
      console.error('Mutation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!treatment?.id) return;

    const confirmed = window.confirm('¿Estás seguro de eliminar este tratamiento? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await deleteTreatment({ variables: { id: treatment.id } });
    } finally {
      setIsLoading(false);
    }
  };

  const getToothQuadrant = (tooth: number) => {
    if (tooth <= 18) return 'Superior Derecho';
    if (tooth <= 28) return 'Superior Izquierdo';
    if (tooth <= 38) return 'Inferior Izquierdo';
    return 'Inferior Derecho';
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        className="w-full sm:max-w-[540px] bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border-purple-500/30 overflow-y-auto"
        side="right"
      >
        <SheetHeader className="pb-4 border-b border-purple-500/30">
          <SheetTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center gap-3">
            🦷 {treatment ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            {treatment 
              ? 'Modifica los detalles del tratamiento existente'
              : 'Registra un nuevo tratamiento para el paciente'}
          </SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="w-full bg-slate-800/50 border border-purple-500/30 p-1">
            <TabsTrigger 
              value="general" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              📋 General
            </TabsTrigger>
            <TabsTrigger 
              value="detalles" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              🦷 Detalles
            </TabsTrigger>
            <TabsTrigger 
              value="notas" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              📝 Notas
            </TabsTrigger>
          </TabsList>

          {/* ============================================================ */}
          {/* TAB: GENERAL */}
          {/* ============================================================ */}
          <TabsContent value="general" className="mt-4 space-y-4">
            {/* Patient Select */}
            <div className="space-y-2">
              <Label htmlFor="patientId" className="text-slate-300">
                Paciente <span className="text-red-400">*</span>
              </Label>
              <select 
                id="patientId"
                value={formData.patientId}
                onChange={(e) => handleChange('patientId', e.target.value)}
                className={`${selectClassName} ${errors.patientId ? 'border-red-500' : ''}`}
              >
                <option value="" className="bg-slate-800">Seleccionar paciente...</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id} className="bg-slate-800">
                    {`${patient.firstName || ''} ${patient.lastName || ''}`.trim() || patient.email || 'Paciente sin nombre'}
                  </option>
                ))}
              </select>
              {errors.patientId && (
                <p className="text-red-400 text-sm">{errors.patientId}</p>
              )}
            </div>

            {/* Treatment Type */}
            <div className="space-y-2">
              <Label htmlFor="treatmentType" className="text-slate-300">
                Tipo de Tratamiento <span className="text-red-400">*</span>
              </Label>
              <select 
                id="treatmentType"
                value={formData.treatmentType}
                onChange={(e) => handleChange('treatmentType', e.target.value)}
                className={`${selectClassName} ${errors.treatmentType ? 'border-red-500' : ''}`}
              >
                <option value="" className="bg-slate-800">Seleccionar tipo...</option>
                {TREATMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value} className="bg-slate-800">
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.treatmentType && (
                <p className="text-red-400 text-sm">{errors.treatmentType}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-300">Estado</Label>
              <select 
                id="status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className={selectClassName}
              >
                {TREATMENT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value} className="bg-slate-800">
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-slate-300">
                  Fecha Inicio <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className={`bg-slate-800/50 border-slate-700 text-white ${errors.startDate ? 'border-red-500' : ''}`}
                />
                {errors.startDate && (
                  <p className="text-red-400 text-sm">{errors.startDate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-slate-300">Fecha Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </div>
          </TabsContent>

          {/* ============================================================ */}
          {/* TAB: DETALLES */}
          {/* ============================================================ */}
          <TabsContent value="detalles" className="mt-4 space-y-4">
            {/* Tooth Number */}
            <div className="space-y-2">
              <Label htmlFor="toothNumber" className="text-slate-300">
                Diente (Notación FDI)
              </Label>
              <select 
                id="toothNumber"
                value={formData.toothNumber?.toString() || ''}
                onChange={(e) => handleChange('toothNumber', e.target.value ? parseInt(e.target.value) : null)}
                className={selectClassName}
              >
                <option value="" className="bg-slate-800">Sin especificar</option>
                {FDI_TEETH.map((tooth) => (
                  <option key={tooth} value={tooth.toString()} className="bg-slate-800 font-mono">
                    #{tooth} - {getToothQuadrant(tooth)}
                  </option>
                ))}
              </select>
            </div>

            {/* Cost */}
            <div className="space-y-2">
              <Label htmlFor="cost" className="text-slate-300">
                Coste (€)
              </Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
                className={`bg-slate-800/50 border-slate-700 text-white font-mono ${errors.cost ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
              {errors.cost && (
                <p className="text-red-400 text-sm">{errors.cost}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">
                Descripción del Procedimiento
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={textareaClassName}
                placeholder="Describe el procedimiento realizado o planificado..."
              />
            </div>
          </TabsContent>

          {/* ============================================================ */}
          {/* TAB: NOTAS */}
          {/* ============================================================ */}
          <TabsContent value="notas" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-300">
                Notas Clínicas
              </Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className={`${textareaClassName} min-h-[200px]`}
                placeholder="Observaciones clínicas, seguimiento, indicaciones especiales..."
              />
            </div>

            {/* Quick Notes Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                '⚠️ Paciente con ansiedad',
                '💊 Medicación previa',
                '🔄 Requiere seguimiento',
                '📞 Llamar en 1 semana',
              ].map((note) => (
                <Button
                  key={note}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-purple-500/20"
                  onClick={() => {
                    const current = formData.notes;
                    handleChange('notes', current ? `${current}\n${note}` : note);
                  }}
                >
                  {note}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Error display */}
        {errors.submit && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 pt-4 border-t border-purple-500/30 space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold py-3"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </span>
            ) : (
              <span>💾 {treatment ? 'Actualizar Tratamiento' : 'Crear Tratamiento'}</span>
            )}
          </Button>

          {treatment && (
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              variant="outline"
              className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20"
            >
              🗑️ Eliminar Tratamiento
            </Button>
          )}

          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-slate-400 hover:text-white"
          >
            Cancelar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TreatmentFormSheet;
