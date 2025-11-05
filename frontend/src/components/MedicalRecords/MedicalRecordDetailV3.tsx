// 🎯🎸💀 MEDICAL RECORD DETAIL V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 22, 2025
// Mission: Complete medical record detail view with timeline integration
// Status: V3.0 - Full detail view with atomic components and GraphQL
// Challenge: Comprehensive medical data visualization with timeline context

import React, { useState, useMemo } from 'react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { useMedicalRecordStore } from '../../stores';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Spinner } from '../atoms';
import { createModuleLogger } from '../../utils/logger';

// 🎯 ICONS - Heroicons for medical theme
import {
  EyeIcon,
  DocumentTextIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PhotoIcon,
  TagIcon,
  UserIcon,
  ClockIcon,
  HeartIcon as HeartPulseIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// 🎯 TYPES AND INTERFACES
interface MedicalRecordDetailV3Props {
  recordId?: string | null;
  isOpen?: boolean;
  onClose: () => void;
  onEdit?: (record: any) => void;
  onDelete?: (recordId: string) => void;
  className?: string;
}


const l = createModuleLogger('MedicalRecordDetailV3');

// 🎯 RECORD TYPE CONFIGURATION
const RECORD_TYPE_CONFIG = {
  consultation: { icon: UserIcon, color: 'blue', label: 'Consulta', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  treatment: { icon: HeartIcon, color: 'green', label: 'Tratamiento', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  diagnosis: { icon: ExclamationTriangleIcon, color: 'red', label: 'Diagnóstico', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  follow_up: { icon: ClockIcon, color: 'yellow', label: 'Seguimiento', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  emergency: { icon: ExclamationTriangleIcon, color: 'red', label: 'Emergencia', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  preventive: { icon: CheckCircleIcon, color: 'green', label: 'Preventivo', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
};

const PRIORITY_CONFIG = {
  low: { color: 'gray', label: 'Baja', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
  normal: { color: 'blue', label: 'Normal', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  high: { color: 'yellow', label: 'Alta', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  urgent: { color: 'red', label: 'Urgente', bgColor: 'bg-red-100', textColor: 'text-red-800' }
};

export const MedicalRecordDetailV3: React.FC<MedicalRecordDetailV3Props> = ({
  recordId,
  isOpen = true,
  onClose,
  onEdit,
  onDelete,
  className = ''
}) => {
  // 🎯 MEDICAL RECORD STORE - Apollo Nuclear State Management
  const { patientMedicalRecords, getMedicalRecordTimeline } = useMedicalRecordStore();

  // 🎯 LOCAL STATE - Always call hooks first
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'attachments'>('overview');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // 🎯 FIND CURRENT RECORD
  const currentRecord = useMemo(() => {
    if (!recordId) return null;
    // Search through all patient records to find the one with matching ID
    for (const patientId in patientMedicalRecords) {
      const record = patientMedicalRecords[patientId].find(r => r.id === recordId);
      if (record) return record;
    }
    return null;
  }, [patientMedicalRecords, recordId]);

  // 🎯 TIMELINE CONTEXT - Records around this one
  const timelineContext = useMemo(() => {
    if (!currentRecord || !recordId) return { before: [], after: [] };

    const allRecords = getMedicalRecordTimeline(currentRecord.patient_id);
    const currentIndex = allRecords.findIndex(r => r.id === recordId);

    return {
      before: allRecords.slice(Math.max(0, currentIndex - 2), currentIndex).reverse(),
      after: allRecords.slice(currentIndex + 1, currentIndex + 3)
    };
  }, [currentRecord, getMedicalRecordTimeline, recordId]);

  // 🎯 EARLY RETURN - If not open, don't render anything (after all hooks)
  if (!isOpen) {
    return null;
  }

  // 🎯 VALIDATION - Check after all hooks are called
  if (!recordId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600">No se pudo cargar el registro médico. ID de registro faltante.</p>
            <Button onClick={onClose} className="mt-4">
              Cerrar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 🎯 LOADING STATE
  if (!currentRecord) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-12 text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Cargando detalles del registro médico...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = RECORD_TYPE_CONFIG[currentRecord.record_type];
  const Icon = config.icon;
  const priorityConfig = PRIORITY_CONFIG[currentRecord.priority];

  // 🎯 HANDLERS
  const handlePrevious = () => {
    if (timelineContext.before.length > 0) {
      // Navigate to previous record (would need to be implemented)
      l.info('Navigate to previous record', timelineContext.before[0].id);
    }
  };

  const handleNext = () => {
    if (timelineContext.after.length > 0) {
      // Navigate to next record (would need to be implemented)
      l.info('Navigate to next record', timelineContext.after[0].id);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('¿Está seguro de que desea eliminar este registro médico?')) {
      onDelete(recordId);
      onClose();
    }
  };

  // 🎯 ATTACHMENT VIEWER
  const AttachmentViewer: React.FC<{ attachments: any[], onClose: () => void }> = ({ attachments, onClose }) => {
    if (selectedImageIndex === null) return null;

    const attachment = attachments[selectedImageIndex];
    const isImage = attachment.name?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="max-w-4xl max-h-full relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100"
          >
            <XMarkIcon className="w-5 h-5" />
          </Button>

          {isImage ? (
            <img
              src={attachment.url || '#'}
              alt={attachment.name || 'Archivo'}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="bg-white p-8 rounded-lg">
              <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-center text-gray-600">{attachment.name || 'Archivo sin nombre'}</p>
              <Button
                variant="secondary"
                className="mt-4 mx-auto block"
                onClick={() => window.open(attachment.url || '#', '_blank')}
              >
                Descargar Archivo
              </Button>
            </div>
          )}

          {/* Navigation */}
          {attachments.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedImageIndex(prev => prev !== null && prev > 0 ? prev - 1 : attachments.length - 1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100"
                disabled={attachments.length <= 1}
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedImageIndex(prev => prev !== null && prev < attachments.length - 1 ? prev + 1 : 0)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-100"
                disabled={attachments.length <= 1}
              >
                <ArrowRightIcon className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </Button>

                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${config.bgColor} border ${config.borderColor}`}>
                  <Icon className={`w-6 h-6 text-${config.color}-600`} />
                </div>

                <div>
                  <CardTitle className="text-xl">{currentRecord.title}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={config.color as any}>
                      {config.label}
                    </Badge>
                    <Badge variant={priorityConfig.color as any}>
                      {priorityConfig.label}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(currentRecord.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Timeline Navigation */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={timelineContext.before.length === 0}
                  title="Registro anterior"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  disabled={timelineContext.after.length === 0}
                  title="Registro siguiente"
                >
                  <ArrowRightIcon className="w-4 h-4" />
                </Button>

                {/* Actions */}
                {onEdit && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(currentRecord)}
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Tabs */}
          <div className="border-b bg-gray-50">
            <div className="px-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Resumen', icon: EyeIcon },
                  { id: 'timeline', label: 'Contexto', icon: ClockIcon },
                  { id: 'attachments', label: 'Archivos', icon: PhotoIcon }
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <TabIcon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-6 overflow-y-auto max-h-96">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    Información del Registro
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Tipo:</span>
                      <span className="ml-2">{config.label}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Prioridad:</span>
                      <Badge variant={priorityConfig.color as any} className="ml-2">
                        {priorityConfig.label}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fecha de creación:</span>
                      <span className="ml-2">{new Date(currentRecord.created_at).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Última actualización:</span>
                      <span className="ml-2">{new Date(currentRecord.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed">{currentRecord.description}</p>
                </div>

                {/* Medical Information */}
                {(currentRecord.diagnosis || currentRecord.treatment_plan || currentRecord.medications) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {currentRecord.diagnosis && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          Diagnóstico
                        </h4>
                        <p className="text-red-800 text-sm">{currentRecord.diagnosis}</p>
                      </div>
                    )}

                    {currentRecord.treatment_plan && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                          <HeartIcon className="w-4 h-4 mr-1" />
                          Plan de Tratamiento
                        </h4>
                        <p className="text-green-800 text-sm">{currentRecord.treatment_plan}</p>
                      </div>
                    )}

                    {currentRecord.medications && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                          <DocumentTextIcon className="w-4 h-4 mr-1" />
                          Medicamentos
                        </h4>
                        <p className="text-blue-800 text-sm">{currentRecord.medications}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Vital Signs */}
                {currentRecord.vital_signs && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <HeartPulseIcon className="w-5 h-5 mr-2" />
                      Signos Vitales
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {currentRecord.vital_signs.blood_pressure && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{currentRecord.vital_signs.blood_pressure}</div>
                          <div className="text-sm text-gray-600">Presión Arterial</div>
                        </div>
                      )}
                      {currentRecord.vital_signs.heart_rate && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{currentRecord.vital_signs.heart_rate}</div>
                          <div className="text-sm text-gray-600">Ritmo Cardíaco</div>
                        </div>
                      )}
                      {currentRecord.vital_signs.temperature && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{currentRecord.vital_signs.temperature}°C</div>
                          <div className="text-sm text-gray-600">Temperatura</div>
                        </div>
                      )}
                      {currentRecord.vital_signs.weight && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{currentRecord.vital_signs.weight}kg</div>
                          <div className="text-sm text-gray-600">Peso</div>
                        </div>
                      )}
                      {currentRecord.vital_signs.height && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{currentRecord.vital_signs.height}cm</div>
                          <div className="text-sm text-gray-600">Altura</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {currentRecord.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas Adicionales</h3>
                    <p className="text-gray-700 leading-relaxed">{currentRecord.notes}</p>
                  </div>
                )}

                {/* Tags */}
                {currentRecord.tags && currentRecord.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <TagIcon className="w-5 h-5 mr-2" />
                      Etiquetas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentRecord.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Timeline Context Tab */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contexto en la Línea de Tiempo</h3>

                {/* Previous Records */}
                {timelineContext.before.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">Registros Anteriores</h4>
                    <div className="space-y-3">
                      {timelineContext.before.map((record) => {
                        const recordConfig = RECORD_TYPE_CONFIG[record.record_type];
                        const RecordIcon = recordConfig.icon;
                        return (
                          <div key={record.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${recordConfig.bgColor}`}>
                              <RecordIcon className={`w-4 h-4 text-${recordConfig.color}-600`} />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{record.title}</h5>
                              <p className="text-sm text-gray-600">{new Date(record.created_at).toLocaleDateString()}</p>
                            </div>
                            <Badge variant={recordConfig.color as any}>
                              {recordConfig.label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Current Record */}
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bgColor} border-2 border-blue-500`}>
                      <Icon className={`w-5 h-5 text-${config.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{currentRecord.title}</h4>
                      <p className="text-sm text-gray-600">{currentRecord.description}</p>
                      <p className="text-xs text-blue-600 mt-1">Registro actual</p>
                    </div>
                  </div>
                </div>

                {/* Next Records */}
                {timelineContext.after.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-3">Registros Posteriores</h4>
                    <div className="space-y-3">
                      {timelineContext.after.map((record) => {
                        const recordConfig = RECORD_TYPE_CONFIG[record.record_type];
                        const RecordIcon = recordConfig.icon;
                        return (
                          <div key={record.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${recordConfig.bgColor}`}>
                              <RecordIcon className={`w-4 h-4 text-${recordConfig.color}-600`} />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{record.title}</h5>
                              <p className="text-sm text-gray-600">{new Date(record.created_at).toLocaleDateString()}</p>
                            </div>
                            <Badge variant={recordConfig.color as any}>
                              {recordConfig.label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Attachments Tab */}
            {activeTab === 'attachments' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PhotoIcon className="w-5 h-5 mr-2" />
                  Archivos Adjuntos
                </h3>

                {currentRecord.attachments && (currentRecord.attachments as any[]).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(currentRecord.attachments as any[]).map((attachment, index) => {
                      const isImage = attachment.name?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
                      return (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <div className="flex items-center space-x-3">
                            {isImage ? (
                              <img
                                src={attachment.url || '#'}
                                alt={attachment.name || 'Archivo'}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <DocumentTextIcon className="w-12 h-12 text-gray-400" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {attachment.name || 'Archivo sin nombre'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : 'Tamaño desconocido'}
                              </p>
                            </div>
                            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PhotoIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No hay archivos adjuntos</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attachment Viewer */}
      {selectedImageIndex !== null && currentRecord.attachments && (
        <AttachmentViewer
          attachments={currentRecord.attachments as any[]}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </>
  );
};

export default MedicalRecordDetailV3;