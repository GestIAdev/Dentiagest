/**
 * 📝🎸💀 MEDICAL RECORD SHEET - FORMULARIO UNIFICADO
 * ===================================================
 * By PunkClaude & Radwulf - November 2025
 * 
 * Sheet lateral estándar V4 para crear/editar registros médicos.
 * Selector de tipo + campos dinámicos según el tipo seleccionado.
 */

import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../ui/sheet';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  CREATE_MEDICAL_RECORD_V3,
  UPDATE_MEDICAL_RECORD_V3,
  DELETE_MEDICAL_RECORD_V3,
} from '../../graphql/queries/medicalRecords';
import toast from 'react-hot-toast';
import {
  ClipboardDocumentListIcon,
  BeakerIcon,
  DocumentDuplicateIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// TYPES
// ============================================================================

interface MedicalRecord {
  id: string;
  patientId: string;
  recordType: string;
  title: string;
  content?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  createdAt: string;
  updatedAt: string;
}

interface MedicalRecordSheetProps {
  record?: MedicalRecord | null;
  patientId?: string | null;
  patientName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const RECORD_TYPES = [
  {
    value: 'CONSULTATION',
    label: 'Consulta',
    icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
    color: 'cyan',
    description: 'Registro de visita o consulta médica',
  },
  {
    value: 'TREATMENT',
    label: 'Tratamiento',
    icon: <BeakerIcon className="h-5 w-5" />,
    color: 'purple',
    description: 'Procedimiento o tratamiento dental',
  },
  {
    value: 'PRESCRIPTION',
    label: 'Receta',
    icon: <DocumentDuplicateIcon className="h-5 w-5" />,
    color: 'amber',
    description: 'Prescripción de medicamentos',
  },
  {
    value: 'NOTE',
    label: 'Nota Clínica',
    icon: <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />,
    color: 'emerald',
    description: 'Observación o nota del profesional',
  },
  {
    value: 'DIAGNOSIS',
    label: 'Diagnóstico',
    icon: <ExclamationTriangleIcon className="h-5 w-5" />,
    color: 'rose',
    description: 'Diagnóstico formal del paciente',
  },
  {
    value: 'DOCUMENT',
    label: 'Documento',
    icon: <DocumentTextIcon className="h-5 w-5" />,
    color: 'blue',
    description: 'Consentimiento, informe u otro documento',
  },
];

// ============================================================================
// STYLES
// ============================================================================

const inputClassName = `
  w-full px-4 py-2.5 rounded-lg text-sm text-white
  bg-gray-800/50 border border-gray-700
  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900
  disabled:cursor-not-allowed disabled:opacity-50
  placeholder:text-gray-500
`;

const textareaClassName = `
  w-full min-h-[120px] px-4 py-3 rounded-lg text-sm text-white
  bg-gray-800/50 border border-gray-700
  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900
  disabled:cursor-not-allowed disabled:opacity-50
  placeholder:text-gray-500 resize-none
`;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MedicalRecordSheet: React.FC<MedicalRecordSheetProps> = ({
  record,
  patientId,
  patientName,
  isOpen,
  onClose,
  onSave,
}) => {
  const isEditing = !!record;
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    recordType: 'CONSULTATION',
    title: '',
    content: '',
    diagnosis: '',
    treatment: '',
    medications: '',
  });

  // ========================================================================
  // MUTATIONS
  // ========================================================================

  const [createRecord] = useMutation(CREATE_MEDICAL_RECORD_V3);
  const [updateRecord] = useMutation(UPDATE_MEDICAL_RECORD_V3);
  const [deleteRecord] = useMutation(DELETE_MEDICAL_RECORD_V3);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    if (record) {
      setFormData({
        recordType: record.recordType || 'CONSULTATION',
        title: record.title || '',
        content: record.content || '',
        diagnosis: record.diagnosis || '',
        treatment: record.treatment || '',
        medications: record.medications || '',
      });
    } else {
      // Reset for new record
      setFormData({
        recordType: 'CONSULTATION',
        title: '',
        content: '',
        diagnosis: '',
        treatment: '',
        medications: '',
      });
    }
    setShowDeleteConfirm(false);
  }, [record, isOpen]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, recordType: type }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    if (!patientId && !record?.patientId) {
      toast.error('No hay paciente seleccionado');
      return;
    }

    setIsLoading(true);

    try {
      const input = {
        patientId: patientId || record?.patientId,
        recordType: formData.recordType,
        title: formData.title.trim(),
        content: formData.content.trim() || null,
        diagnosis: formData.diagnosis.trim() || null,
        treatment: formData.treatment.trim() || null,
        medications: formData.medications.trim() || null,
      };

      if (isEditing && record) {
        await updateRecord({
          variables: { id: record.id, input },
        });
        toast.success('✅ Registro actualizado');
      } else {
        await createRecord({
          variables: { input },
        });
        toast.success('✅ Registro creado');
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving medical record:', error);
      toast.error(error.message || 'Error al guardar el registro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!record) return;

    setIsLoading(true);

    try {
      await deleteRecord({
        variables: { id: record.id },
      });
      toast.success('🗑️ Registro eliminado');
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error deleting medical record:', error);
      toast.error(error.message || 'Error al eliminar el registro');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Get current type config
  const currentType = RECORD_TYPES.find((t) => t.value === formData.recordType) || RECORD_TYPES[0];

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[800px] bg-gray-900 border-l border-cyan-500/30 overflow-y-auto"
      >
        <SheetHeader className="space-y-1 pb-4 border-b border-gray-700/50 mb-6">
          <SheetTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-6 w-6 text-cyan-400" />
            {isEditing ? 'Editar Registro' : 'Nuevo Registro Médico'}
          </SheetTitle>
          <SheetDescription className="text-gray-500">
            {patientName ? (
              <>Paciente: <span className="text-white font-medium">{patientName}</span></>
            ) : (
              'Añade un nuevo registro al historial clínico'
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ============================================================ */}
          {/* COLUMNA IZQUIERDA */}
          {/* ============================================================ */}
          <div className="space-y-5">
            {/* Type Selector */}
            <div>
              <Label className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                📋 Tipo de Registro *
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {RECORD_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeSelect(type.value)}
                    className={`
                      p-3 rounded-lg text-left transition-all duration-200 border
                      ${formData.recordType === type.value
                        ? `bg-${type.color}-500/20 border-${type.color}-500/50 text-white`
                        : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className={formData.recordType === type.value ? `text-${type.color}-400` : ''}>
                        {type.icon}
                      </span>
                      <span className="font-medium text-sm">{type.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">{currentType.description}</p>
            </div>

            {/* Title */}
            <div>
              <Label className="text-gray-300 text-sm mb-1.5 flex items-center gap-2">
                ✏️ Título *
              </Label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ej: Consulta de revisión trimestral"
                className={inputClassName}
              />
            </div>

            {/* Content */}
            <div>
              <Label className="text-gray-300 text-sm mb-1.5 flex items-center gap-2">
                📝 Descripción / Contenido
              </Label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Describe el registro con detalle..."
                className={textareaClassName}
              />
            </div>
          </div>

          {/* ============================================================ */}
          {/* COLUMNA DERECHA */}
          {/* ============================================================ */}
          <div className="space-y-5">
            {/* Diagnosis - Show for CONSULTATION, DIAGNOSIS, TREATMENT */}
            {['CONSULTATION', 'DIAGNOSIS', 'TREATMENT'].includes(formData.recordType) && (
              <div>
                <Label className="text-gray-300 text-sm mb-1.5 flex items-center gap-2">
                  🔬 Diagnóstico
                </Label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  placeholder="Diagnóstico clínico..."
                  className={textareaClassName}
                  style={{ minHeight: '100px' }}
                />
              </div>
            )}

            {/* Treatment - Show for CONSULTATION, TREATMENT */}
            {['CONSULTATION', 'TREATMENT'].includes(formData.recordType) && (
              <div>
                <Label className="text-gray-300 text-sm mb-1.5 flex items-center gap-2">
                  💊 Plan de Tratamiento
                </Label>
                <textarea
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleInputChange}
                  placeholder="Tratamiento recomendado o realizado..."
                  className={textareaClassName}
                  style={{ minHeight: '100px' }}
                />
              </div>
            )}

            {/* Medications - Show for PRESCRIPTION, TREATMENT */}
            {['PRESCRIPTION', 'TREATMENT', 'CONSULTATION'].includes(formData.recordType) && (
              <div>
                <Label className="text-gray-300 text-sm mb-1.5 flex items-center gap-2">
                  💉 Medicamentos
                </Label>
                <textarea
                  name="medications"
                  value={formData.medications}
                  onChange={handleInputChange}
                  placeholder="Lista de medicamentos prescritos..."
                  className={textareaClassName}
                  style={{ minHeight: '80px' }}
                />
              </div>
            )}

            {/* Empty state for NOTE and DOCUMENT types */}
            {['NOTE', 'DOCUMENT'].includes(formData.recordType) && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-6 rounded-xl bg-gray-800/30 border border-gray-700/50">
                  <CheckCircleIcon className="h-10 w-10 text-emerald-400/50 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">
                    {formData.recordType === 'NOTE'
                      ? 'Las notas clínicas solo requieren título y descripción.'
                      : 'Los documentos pueden incluir archivos adjuntos (próximamente).'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* FOOTER ACTIONS */}
        {/* ================================================================ */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
          {isEditing ? (
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !formData.title.trim()}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : isEditing ? (
                '💾 Guardar Cambios'
              ) : (
                '✨ Crear Registro'
              )}
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-800 border border-red-500/30 rounded-xl p-6 max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-6 w-6" />
                ¿Eliminar Registro?
              </h3>
              <p className="text-slate-300 mb-6">
                Estás a punto de eliminar <strong className="text-white">"{record?.title}"</strong>.
                Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border-slate-600 text-slate-300"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-500 text-white"
                >
                  {isLoading ? 'Eliminando...' : '🗑️ Sí, Eliminar'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MedicalRecordSheet;
