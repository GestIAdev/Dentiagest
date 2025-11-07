// 🎯🎸🛡️ AUDIT FORM MODAL V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 25, 2025
// Mission: Audit form modal with @veritas quantum verification
// Status: V3.0 - Full audit management with quantum truth verification
// Challenge: Regulatory audit form with AI insights and quantum validation
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on audit data

import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Spinner } from '../atoms/index';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL MUTATIONS - V3.0 Integration
import {
  CREATE_COMPLIANCE_AUDIT,
  UPDATE_COMPLIANCE_AUDIT
} from '../../graphql/queries/compliance';

// 🎯 ICONS - Heroicons for compliance theme
import {
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  CpuChipIcon,
  BoltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// 🎯 AUDIT FORM MODAL V3.0 INTERFACE
interface AuditFormModalV3Props {
  isOpen: boolean;
  audit?: ComplianceAudit | null;
  onClose: () => void;
  onSuccess: () => void;
}

// 🎯 COMPLIANCE AUDIT INTERFACE - @veritas Enhanced
interface ComplianceAudit {
  id: string;
  title: string;
  title_veritas?: string;
  type: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  status_veritas?: string;
  scheduledDate: string;
  auditor: string;
  overallScore?: number;
  overallScore_veritas?: number;
  findings: ComplianceFinding[];
  _veritas?: {
    verified: boolean;
    confidence: number;
    level: string;
    certificate: string;
    error?: string;
    verifiedAt: string;
    algorithm: string;
  };
}

interface ComplianceFinding {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}

// 🎯 FORM DATA INTERFACE
interface AuditFormData {
  title: string;
  type: string;
  scheduledDate: string;
  auditor: string;
  description?: string;
}

// 🎯 LOGGER - Module specific logger
const l = createModuleLogger('AuditFormModalV3');

export const AuditFormModalV3: React.FC<AuditFormModalV3Props> = ({
  isOpen,
  audit,
  onClose,
  onSuccess
}) => {
  // 🎯 FORM STATE - Advanced State Management
  const [formData, setFormData] = useState<AuditFormData>({
    title: '',
    type: '',
    scheduledDate: '',
    auditor: '',
    description: ''
  });

  const [errors, setErrors] = useState<Partial<AuditFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🎯 GRAPHQL MUTATIONS
  const [createAudit] = useMutation(CREATE_COMPLIANCE_AUDIT);
  const [updateAudit] = useMutation(UPDATE_COMPLIANCE_AUDIT);

  // 🎯 EFFECTS - Initialize form data
  useEffect(() => {
    if (audit) {
      setFormData({
        title: audit.title || '',
        type: audit.type || '',
        scheduledDate: audit.scheduledDate || '',
        auditor: audit.auditor || '',
        description: ''
      });
    } else {
      setFormData({
        title: '',
        type: '',
        scheduledDate: '',
        auditor: '',
        description: ''
      });
    }
    setErrors({});
  }, [audit, isOpen]);

  // 🎯 HANDLERS - Advanced Event Handling
  const handleInputChange = (field: keyof AuditFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AuditFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'El tipo es requerido';
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'La fecha programada es requerida';
    } else {
      const scheduledDate = new Date(formData.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (scheduledDate < today) {
        newErrors.scheduledDate = 'La fecha programada debe ser futura o hoy';
      }
    }

    if (!formData.auditor.trim()) {
      newErrors.auditor = 'El auditor es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const variables = {
        input: {
          ...formData,
          status: 'SCHEDULED' // New audits start as scheduled
        }
      };

      if (audit) {
        await updateAudit({
          variables: {
            id: audit.id,
            input: formData
          }
        });
        l.info('Audit updated successfully', { auditId: audit.id });
      } else {
        await createAudit({ variables });
        l.info('Audit created successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      l.error('Failed to save audit', error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🎯 RENDER - Cyberpunk Medical Theme
  if (!isOpen) return null;

  const isEditing = !!audit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 🎯 BACKDROP - Quantum Effect */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* 🎯 MODAL - Cyberpunk Medical Theme */}
      <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 backdrop-blur-sm border border-purple-500/20 shadow-2xl shadow-purple-500/25">
        {/* 🎯 HEADER - Quantum Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse pointer-events-none"></div>

        <CardHeader className="relative border-b border-gray-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <ClipboardDocumentCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🎯 {isEditing ? 'Editar' : 'Crear'} Auditoría V3.0
                </CardTitle>
                <p className="text-gray-300 text-sm mt-1">
                  Gestión de auditorías de cumplimiento con verificación cuántica @veritas
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-700/50"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        {/* 🎯 FORM CONTENT - Modular Layout */}
        <CardContent className="relative p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 🎯 BASIC INFORMATION - Primary Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-300 flex items-center space-x-2">
                <ClipboardDocumentCheckIcon className="w-5 h-5" />
                <span>Información Básica</span>
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título de la Auditoría *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: Auditoría de Privacidad 2025, Revisión de Seguridad Q1..."
                  className={`w-full bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 ${errors.title ? 'border-red-500/50' : ''}`}
                />
                {errors.title && (
                  <p className="text-red-400 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Auditoría *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className={`w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20 ${errors.type ? 'border-red-500/50' : ''}`}
                  >
                    <option value="">Seleccionar tipo...</option>
                    <option value="INTERNAL">Interna</option>
                    <option value="EXTERNAL">Externa</option>
                    <option value="REGULATORY">Regulatoria</option>
                    <option value="COMPLIANCE">Cumplimiento</option>
                    <option value="SECURITY">Seguridad</option>
                    <option value="QUALITY">Calidad</option>
                    <option value="FINANCIAL">Financiera</option>
                    <option value="OTHER">Otra</option>
                  </select>
                  {errors.type && (
                    <p className="text-red-400 text-xs mt-1">{errors.type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Auditor Responsable *
                  </label>
                  <Input
                    type="text"
                    value={formData.auditor}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('auditor', e.target.value)}
                    placeholder="Nombre del auditor"
                    className={`w-full bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 ${errors.auditor ? 'border-red-500/50' : ''}`}
                  />
                  {errors.auditor && (
                    <p className="text-red-400 text-xs mt-1">{errors.auditor}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha Programada *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('scheduledDate', e.target.value)}
                  className={`w-full bg-gray-800/50 border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 ${errors.scheduledDate ? 'border-red-500/50' : ''}`}
                />
                {errors.scheduledDate && (
                  <p className="text-red-400 text-xs mt-1">{errors.scheduledDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción (Opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                  placeholder="Describe el alcance y objetivos de la auditoría..."
                  rows={3}
                  className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* 🎯 @VERITAS VERIFICATION - Quantum Section */}
            <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <BoltIcon className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-sm font-semibold text-purple-300">
                  Verificación Cuántica @veritas
                </h4>
              </div>
              <p className="text-gray-300 text-sm">
                Los datos de esta auditoría serán verificados automáticamente con algoritmos cuánticos
                para asegurar la integridad y confianza de la información de auditoría.
              </p>
            </div>
          </form>
        </CardContent>

        {/* 🎯 FOOTER - Action Buttons */}
        <div className="relative border-t border-gray-600/30 p-6">
          <div className="flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-white hover:bg-gray-700/50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  {isEditing ? 'Actualizar Auditoría' : 'Crear Auditoría'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuditFormModalV3;
