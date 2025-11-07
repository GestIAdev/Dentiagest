// DOCUMENT_MANAGEMENT: Drag & Drop Upload Component
/**
 * DocumentUpload Component - Professional Anarchist Style
 * 
 * Features that make corporate devs cry:
 * ✅ Drag & Drop with visual feedback
 * ✅ Multiple file types (images, PDFs, voice notes)
 * ✅ AI-ready metadata extraction
 * ✅ GDPR Article 9 compliance
 * ✅ Real-time upload progress
 * ✅ File type validation & security
 * 
 * PLATFORM_PATTERN: Adaptable to other ve        // 🔒 COMPLIANCE CRITICAL: Respect Smart Store access level detection
        // NEVER downgrade medical to administrative - GDPR/HIPAA violation risk!
        const backendAccessLevel = uploadFile.accessLevel || 'administrative';
        
        // 🚨 COMPLIANCE VALIDATION: Prevent medical documents in virtual patient
        const VIRTUAL_PATIENT_ID = "d76a8a03-1411-4143-85ba-6f064c7b564b";
        if (patientId === VIRTUAL_PATIENT_ID && backendAccessLevel === 'medical') {
          setError('⚠️ COMPLIANCE ERROR: No se pueden subir documentos médicos a "Documentos Clínica". Use un paciente real para fotos clínicas.');
          setUploading(false);
          return;
        }
        
        console.log('🔍 DEBUG final backendAccessLevel:', backendAccessLevel);
        console.log('🔒 COMPLIANCE: Smart detected accessLevel:', uploadFile.accessLevel);
 * - VetGest: Pet photos, vaccination certificates
 * - MechaGest: Vehicle photos, repair manuals
 * - RestaurantGest: Food photos, invoices
 */

import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LegalCategory, UnifiedDocumentType, getCategoryFromUnifiedType } from './DocumentCategories';
// // APOLLO NUCLEAR: CentralMappingService disabled
import apolloGraphQL from '../../services/apolloGraphQL'; // 🥷 STEALTH GRAPHQL NINJA MODE
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  CameraIcon,
  MicrophoneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';

// 🗂️ UNIFIED SYSTEM: Now using UnifiedDocumentType from DocumentCategories
// Legacy DocumentType enum removed - using UnifiedDocumentType instead
// 🔐 ACCESS_LEVEL: LEGAL COMPLIANCE - Spanish Medical Data Law
export enum AccessLevel {
  MEDICAL = 'medical',                    // Medical professionals only (doctors + qualified assistants)
  ADMINISTRATIVE = 'administrative'      // All staff can access (receptionists + admins + doctors)
}

// Re-export UnifiedDocumentType for backward compatibility
export { UnifiedDocumentType };

// 🤖 SMART CATEGORIZATION ENGINE - UNIFIED SYSTEM
const detectDocumentCategory = (file: File): { 
  documentType: UnifiedDocumentType; 
  category: LegalCategory; 
  confidence: number; 
  accessLevel: AccessLevel 
} => {
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  
  // 🦷 DENTAL X-RAYS DETECTION → UNIFIED: XRAY
  if (name.includes('rayos') || name.includes('xray') || name.includes('radiografia') || name.includes('rx') ||
      name.includes('panoramica') || name.includes('panoramic') || name.includes('periapical') || name.includes('bitewing')) {
    return { 
      documentType: UnifiedDocumentType.XRAY, 
      category: LegalCategory.MEDICAL, 
      confidence: 0.95, 
      accessLevel: AccessLevel.MEDICAL 
    };
  }
  
  // 🎵 AUDIO FILES DETECTION → UNIFIED: VOICE_NOTE
  if (mime.includes('audio') || name.includes('nota') || name.includes('voice') || name.includes('grabacion')) {
    return { 
      documentType: UnifiedDocumentType.VOICE_NOTE, 
      category: LegalCategory.MEDICAL, 
      confidence: 0.9, 
      accessLevel: AccessLevel.MEDICAL 
    };
  }
  
  // 💰 BILLING DOCUMENTS DETECTION → UNIFIED: INVOICE/BUDGET
  if (name.includes('factura') || name.includes('invoice')) {
    return { 
      documentType: UnifiedDocumentType.INVOICE, 
      category: LegalCategory.BILLING, 
      confidence: 0.9, 
      accessLevel: AccessLevel.ADMINISTRATIVE 
    };
  }
  if (name.includes('presupuesto') || name.includes('budget')) {
    return { 
      documentType: UnifiedDocumentType.BUDGET, 
      category: LegalCategory.BILLING, 
      confidence: 0.9, 
      accessLevel: AccessLevel.ADMINISTRATIVE 
    };
  }
  
  // � LEGAL DOCUMENTS DETECTION → UNIFIED: CONSENT_FORM/LEGAL_DOCUMENT
  if (name.includes('consentimiento') || name.includes('consent')) {
    return { 
      documentType: UnifiedDocumentType.CONSENT_FORM, 
      category: LegalCategory.LEGAL, 
      confidence: 0.9, 
      accessLevel: AccessLevel.ADMINISTRATIVE 
    };
  }
  if (name.includes('contrato') || name.includes('legal')) {
    return { 
      documentType: UnifiedDocumentType.LEGAL_DOCUMENT, 
      category: LegalCategory.LEGAL, 
      confidence: 0.9, 
      accessLevel: AccessLevel.ADMINISTRATIVE 
    };
  }
  
  // 📊 TREATMENT PLANS DETECTION → UNIFIED: TREATMENT_PLAN
  if (name.includes('plan') || name.includes('tratamiento') || name.includes('treatment')) {
    return { 
      documentType: UnifiedDocumentType.TREATMENT_PLAN, 
      category: LegalCategory.MEDICAL, 
      confidence: 0.85, 
      accessLevel: AccessLevel.MEDICAL 
    };
  }
  
  // 🧪 LAB REPORTS DETECTION → UNIFIED: LAB_REPORT
  if (name.includes('laboratorio') || name.includes('lab') || name.includes('reporte') || name.includes('analisis')) {
    return { 
      documentType: UnifiedDocumentType.LAB_REPORT, 
      category: LegalCategory.MEDICAL, 
      confidence: 0.85, 
      accessLevel: AccessLevel.MEDICAL 
    };
  }
  
  // 💊 PRESCRIPTION DETECTION → UNIFIED: PRESCRIPTION
  if (name.includes('receta') || name.includes('prescription') || name.includes('medicamento')) {
    return { 
      documentType: UnifiedDocumentType.PRESCRIPTION, 
      category: LegalCategory.MEDICAL, 
      confidence: 0.9, 
      accessLevel: AccessLevel.MEDICAL 
    };
  }
  
  // � PHOTO DETECTION → UNIFIED: PHOTO_CLINICAL
  if (mime.includes('image')) {
    return { 
      documentType: UnifiedDocumentType.PHOTO_CLINICAL, 
      category: LegalCategory.MEDICAL, 
      confidence: 0.8, 
      accessLevel: AccessLevel.MEDICAL 
    };
  }
  
  // 🏥 INSURANCE FORMS → UNIFIED: INSURANCE_FORM
  if (name.includes('seguro') || name.includes('insurance') || name.includes('obra') || name.includes('social')) {
    return { 
      documentType: UnifiedDocumentType.INSURANCE_FORM, 
      category: LegalCategory.ADMINISTRATIVE, 
      confidence: 0.9, 
      accessLevel: AccessLevel.ADMINISTRATIVE 
    };
  }
  
  // 📄 PDF DETECTION (general) → UNIFIED: DOCUMENT_GENERAL
  if (mime.includes('pdf') || mime.includes('msword') || mime.includes('wordprocessingml') || 
      name.endsWith('.doc') || name.endsWith('.docx')) {
    return { 
      documentType: UnifiedDocumentType.DOCUMENT_GENERAL, 
      category: LegalCategory.ADMINISTRATIVE, 
      confidence: 0.75, 
      accessLevel: AccessLevel.ADMINISTRATIVE 
    };
  }
  
  // 📊 DEFAULT FALLBACK → UNIFIED: DOCUMENT_GENERAL
  return { 
    documentType: UnifiedDocumentType.DOCUMENT_GENERAL, 
    category: LegalCategory.ADMINISTRATIVE, 
    confidence: 0.5, 
    accessLevel: AccessLevel.ADMINISTRATIVE 
  };
};

// 🎨 CONFIDENCE LEVEL STYLING
const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.9) return 'text-green-600 bg-green-100';
  if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

// 🎯 UNIFIED DOCUMENT TYPE LABELS (SPANISH)
const getDocumentTypeLabel = (type: UnifiedDocumentType): string => {
  const labels: Record<UnifiedDocumentType, string> = {
    [UnifiedDocumentType.XRAY]: 'Rayos X',
    [UnifiedDocumentType.PHOTO_CLINICAL]: 'Foto Clínica',
    [UnifiedDocumentType.VOICE_NOTE]: 'Nota de Voz',
    [UnifiedDocumentType.INVOICE]: 'Factura',
    [UnifiedDocumentType.BUDGET]: 'Presupuesto',
    [UnifiedDocumentType.CONSENT_FORM]: 'Consentimiento Informado',
    [UnifiedDocumentType.LEGAL_DOCUMENT]: 'Documento Legal',
    [UnifiedDocumentType.TREATMENT_PLAN]: 'Plan de Tratamiento',
    [UnifiedDocumentType.LAB_REPORT]: 'Reporte de Laboratorio',
    [UnifiedDocumentType.PRESCRIPTION]: 'Receta Médica',
    [UnifiedDocumentType.INSURANCE_FORM]: 'Formulario de Seguro',
    [UnifiedDocumentType.SCAN_3D]: 'Escáner 3D',
    [UnifiedDocumentType.PAYMENT_PROOF]: 'Comprobante de Pago',
    [UnifiedDocumentType.REFERRAL_LETTER]: 'Carta de Derivación',
    [UnifiedDocumentType.DOCUMENT_GENERAL]: 'Documento General'
  };
  // Completar tipos faltantes en enum
  return labels[type] || 'Documento';
};

// 🏷️ CATEGORY LABELS (SPANISH)
const getCategoryLabel = (category: LegalCategory): string => {
  const labels: Record<LegalCategory, string> = {
    [LegalCategory.MEDICAL]: 'Médico',
    [LegalCategory.ADMINISTRATIVE]: 'Administrativo',
    [LegalCategory.LEGAL]: 'Legal',
    [LegalCategory.BILLING]: 'Facturación'
  };
  return labels[category] || category;
};

interface DocumentUploadProps {
  patientId?: string;  // 🤘 ANARCHIST: Optional for global mode
  medicalRecordId?: string;
  appointmentId?: string;
  onUploadComplete?: (documents: any[]) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // MB
  className?: string;
  disableSmartDetection?: boolean; // 🧠 NEW: Disable smart detection in manual mode
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  documentType?: UnifiedDocumentType;
  accessLevel?: AccessLevel;
  preview?: string;
  // 🤖 SMART CATEGORIZATION FIELDS
  detectedCategory?: LegalCategory;
  detectedConfidence?: number;
  categoryOverride?: boolean; // User manually changed category
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  patientId,
  medicalRecordId,
  appointmentId,
  onUploadComplete,
  onUploadError,
  acceptedTypes = [
    // 🖼️ IMAGES
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff',
    // 📄 DOCUMENTS  
    'application/pdf',
    // 📝 MICROSOFT OFFICE
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    // 📋 TEXT FILES
    'text/plain', // .txt
    'text/markdown', // .md
    'text/csv', // .csv
    'application/rtf', // .rtf
    // 🎵 AUDIO
    'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg', 'audio/mp4'
  ],
  maxFileSize = 50, // 50MB default
  className = '',
  disableSmartDetection = false // 🧠 Default: smart detection enabled
}) => {
  const { state } = useAuth();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔥 ANARCHIST VISUAL CONTEXT
  const getUploadContext = () => {
    if (patientId) {
      return {
        mode: '👤 PACIENTE ESPECÍFICO',
        icon: '🎯',
        description: 'Los archivos se vincularán directamente al paciente seleccionado',
        bgColor: 'from-blue-500/10 to-purple-500/10',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-700',
        badgeColor: 'bg-blue-100 text-blue-800'
      };
    } else {
      return {
        mode: '� DOCUMENTOS CLÍNICA',
        icon: '�️',
        description: 'Documentos administrativos de la clínica - facturas, contratos, etc.',
        bgColor: 'from-blue-500/10 to-cyan-500/10',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-700',
        badgeColor: 'bg-blue-100 text-blue-800'
      };
    }
  };

  // 🎨 FILE PREVIEW: Generate preview for different file types
  const generatePreview = (file: File): string | undefined => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return undefined;
  };

  // 🧹 FILE VALIDATION: Type and size checks
  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de archivo no soportado: ${file.type}`;
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      return `Archivo muy grande: ${(file.size / 1024 / 1024).toFixed(1)}MB (máximo: ${maxFileSize}MB)`;
    }

    return null;
  }, [acceptedTypes, maxFileSize]);

  // 📁 ADD FILES: Process selected files
  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: UploadFile[] = [];

    fileArray.forEach(file => {
      const validationError = validateFile(file);
      
      // 🤖 SMART CATEGORIZATION: Only in Smart Mode (not in manual mode)
      let detection: ReturnType<typeof detectDocumentCategory> | null = null;
      if (!disableSmartDetection) {
        detection = detectDocumentCategory(file);
        console.log('🤖 Smart categorization result:', detection);
      } else {
        console.log('🧠 Manual mode: Smart detection disabled');
      }
      
      const uploadFile: UploadFile = {
        file,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        progress: 0,
        status: validationError ? 'error' : 'pending',
        error: validationError || undefined,
        preview: generatePreview(file),
        // 🎯 AUTO-DETECTED VALUES (or defaults when smart detection disabled)
        documentType: detection?.documentType || UnifiedDocumentType.DOCUMENT_GENERAL,
        accessLevel: detection?.accessLevel || AccessLevel.ADMINISTRATIVE,  // Default to administrative
        detectedCategory: detection?.category || LegalCategory.ADMINISTRATIVE,
        detectedConfidence: detection?.confidence || 0,
        categoryOverride: !disableSmartDetection ? false : true // Manual mode = override mode
      };
      console.log('📁 Created uploadFile with accessLevel:', uploadFile.accessLevel);
      validFiles.push(uploadFile);
    });

    setFiles(prev => [...prev, ...validFiles]);
  }, [disableSmartDetection, validateFile]);

  // 🖱️ DRAG & DROP HANDLERS
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [addFiles]);

  // 📂 FILE INPUT HANDLER
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
  }, [addFiles]);

  // 🗑️ REMOVE FILE
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // 📊 UPDATE FILE METADATA
  const updateFileMetadata = useCallback((fileId: string, updates: Partial<UploadFile>) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, ...updates } : f
    ));
  }, []);

  // 🚀 UPLOAD PROCESS
  const handleUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      // 📤 UPLOAD EACH FILE
      for (const uploadFile of pendingFiles) {
        updateFileMetadata(uploadFile.id, { status: 'uploading', progress: 0 });

        // � OPERACIÓN UNIFORM - mapToBackendType() eliminated
        // Function replaced by centralMappingService.mapUnifiedToLegacy()
        // This eliminates 25+ lines of duplicated mapping logic!

        // 🚀 OPERACIÓN UNIFORM - All mapping functions eliminated
        // mapToBackendType() → centralMappingService.mapUnifiedToLegacy()
        // mapToBackendAccessLevel() → centralMappingService.mapAccessLevelToBackend()

        console.log('🔍 DEBUG uploadFile.accessLevel:', uploadFile.accessLevel);
        
        // 🚀 APOLLO NUCLEAR - Legacy mapping disabled for compilation
        // const mappingResult = centralMappingService.mapUnifiedToLegacy(
        //   uploadFile.documentType || UnifiedDocumentType.PHOTO_CLINICAL
        // );
        
        // TODO: Implement Apollo direct mapping
        const mappingResult = { 
          success: true,
          legacy_type: uploadFile.documentType === 'photo_clinical' ? 'clinical_photo' : (uploadFile.documentType || 'other_document'),
          requires_conversion: false 
        };
        
        if (!mappingResult.success) {
          console.error('❌ Apollo stub - mapping failed');
          updateFileMetadata(uploadFile.id, { 
            status: 'error', 
            error: 'Error en tipo de documento. Por favor, inténtalo de nuevo.'
          });
          continue; // Skip this file and continue with next one
        }
        
        const backendDocumentType = mappingResult.legacy_type || 'other_document';
        
        // � COMPLIANCE CRITICAL: Respect Smart Store access level detection
        // NEVER downgrade medical to administrative - GDPR/HIPAA violation risk!
        const backendAccessLevel = uploadFile.accessLevel || 'administrative';
        
        console.log('🔍 DEBUG final backendAccessLevel:', backendAccessLevel);
        console.log('� COMPLIANCE: Smart detected accessLevel:', uploadFile.accessLevel);

        const formData = new FormData();
        formData.append('file', uploadFile.file);
        formData.append('title', uploadFile.file.name); // 🔧 FIX: Add required title
        formData.append('document_type', backendDocumentType);
        formData.append('access_level_str', backendAccessLevel); // 🔧 FIX: Backend expects access_level_str
        
        // 🎯 CONDITIONAL PARAMETERS: Only append if they exist
        if (patientId) {
          formData.append('patient_id', patientId);
        }
        // 🌍 GLOBAL MODE: Allow uploads without patient (administrative docs, general files)
        if (medicalRecordId) formData.append('medical_record_id', medicalRecordId);
        if (appointmentId) formData.append('appointment_id', appointmentId);

        try {
          // 🚀 OPERACIÓN APOLLO - Using centralized API service with FormData
          // Pass the constructed FormData directly to Apollo
          const result = await apolloGraphQL.docs.upload(formData);

          updateFileMetadata(uploadFile.id, { status: 'success', progress: 100 });
          
        } catch (error) {
          updateFileMetadata(uploadFile.id, { 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Upload failed'
          });
        }
      }

      // 🎉 SUCCESS CALLBACK
      const successFiles = files.filter(f => f.status === 'success');
      if (successFiles.length > 0 && onUploadComplete) {
        onUploadComplete(successFiles);
      }

    } catch (error) {
      console.error('Upload process error:', error);
      if (onUploadError) {
        onUploadError(error instanceof Error ? error.message : 'Upload process failed');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const hasValidFiles = files.some(f => f.status === 'pending');
  const hasErrors = files.some(f => f.status === 'error');
  
  // 🎯 Get upload context information
  const contextInfo = getUploadContext();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 🎯 UPLOAD CONTEXT HEADER - ANARCHIST STYLE */}
      <div className={`relative overflow-hidden rounded-lg border-2 ${contextInfo.borderColor} bg-gradient-to-r ${contextInfo.bgColor} p-4 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`text-2xl ${contextInfo.textColor}`}>
              {contextInfo.icon}
            </div>
            <div>
              <h3 className={`font-bold text-lg ${contextInfo.textColor}`}>
                {contextInfo.mode}
              </h3>
              <p className={`text-sm ${contextInfo.textColor} opacity-80`}>
                {contextInfo.description}
              </p>
            </div>
          </div>
          {patientId && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${contextInfo.badgeColor}`}>
              Paciente ID: {patientId}
            </div>
          )}
        </div>
        {/* Anarchist decorative elements */}
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-white bg-opacity-20 rounded-full"></div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white bg-opacity-10 rounded-full"></div>
      </div>

      {/* 📤 UPLOAD ZONE - AINARKLENDAR Style */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Arrastra archivos aquí o haz clic para seleccionar
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Soporta: Imágenes, PDFs, notas de voz (máx. {maxFileSize}MB)
        </p>
        
        {/* 🎯 QUICK ACTION BUTTONS */}
        <div className="flex justify-center space-x-4">
          <button 
            type="button"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <DocumentIcon className="w-5 h-5" />
            <span>Documentos</span>
          </button>
          
          <button 
            type="button"
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Camera capture functionality
            }}
          >
            <CameraIcon className="w-5 h-5" />
            <span>Cámara</span>
          </button>
          
          <button 
            type="button"
            className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Voice recording functionality
            }}
          >
            <MicrophoneIcon className="w-5 h-5" />
            <span>Audio</span>
          </button>
        </div>
      </div>

      {/* 📋 FILE LIST */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700">Archivos seleccionados:</h4>
          {files.map((file) => (
            <div 
              key={file.id} 
              className={`
                flex items-center space-x-4 p-4 rounded-lg border
                ${file.status === 'error' ? 'border-red-200 bg-red-50' : 
                  file.status === 'success' ? 'border-green-200 bg-green-50' :
                  file.status === 'uploading' ? 'border-blue-200 bg-blue-50' :
                  'border-gray-200 bg-gray-50'}
              `}
            >
              {/* 🖼️ PREVIEW */}
              <div className="flex-shrink-0">
                {file.preview ? (
                  <img 
                    src={file.preview} 
                    alt="Preview" 
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <DocumentIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>

              {/* 📄 FILE INFO */}
              <div className="flex-grow min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {file.file.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(file.file.size / 1024 / 1024).toFixed(1)} MB
                </p>
                
                {/* 🤖 SMART CATEGORIZATION PREVIEW */}
                {file.detectedCategory && file.detectedConfidence && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-600">
                      🤖 Detectado:
                    </span>
                    <span 
                      className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(file.detectedConfidence)}`}
                    >
                      {getCategoryLabel(file.detectedCategory)} • {getDocumentTypeLabel(file.documentType || UnifiedDocumentType.PHOTO_CLINICAL)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({Math.round(file.detectedConfidence * 100)}% confianza)
                    </span>
                    {!file.categoryOverride && (
                      <button
                        onClick={() => updateFileMetadata(file.id, { categoryOverride: true })}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Cambiar
                      </button>
                    )}
                  </div>
                )}
                
                {/* 📊 PROGRESS BAR */}
                {file.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    ></div>
                  </div>
                )}
                
                {/* ❌ ERROR MESSAGE */}
                {file.error && (
                  <p className="text-sm text-red-600 mt-1">{file.error}</p>
                )}
                
                {/* 🎛️ MANUAL CATEGORY & DOCUMENT TYPE OVERRIDE */}
                {file.categoryOverride && (
                  <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                    <div className="space-y-3">
                      {/* Category Selection */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Seleccionar categoría:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.values(LegalCategory).map((category) => (
                            <button
                              key={category}
                              onClick={() => updateFileMetadata(file.id, { 
                                detectedCategory: category,
                                categoryOverride: false 
                              })}
                              className={`
                                text-xs px-3 py-2 rounded border transition-colors
                                ${file.detectedCategory === category
                                  ? 'bg-blue-100 border-blue-300 text-blue-800'
                                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                }
                              `}
                            >
                              {getCategoryLabel(category)}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Document Type Selection - Same as Smart Mode */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Tipo de documento:
                        </p>
                        <select
                          value={file.documentType}
                          onChange={(e) => updateFileMetadata(file.id, { 
                            documentType: e.target.value as UnifiedDocumentType
                          })}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          {/* 🏥 MEDICAL OPTIONS */}
                          <optgroup label="🏥 Médico">
                            <option value="xray">📻 Radiografía (todos los tipos)</option>
                            <option value="photo_clinical">📸 Foto clínica</option>
                            <option value="voice_note">🎤 Nota de voz</option>
                            <option value="treatment_plan">📋 Plan de tratamiento</option>
                            <option value="lab_report">🧪 Resultado laboratorio</option>
                            <option value="prescription">💊 Prescripción</option>
                            <option value="scan_3d">🔬 Escaneo 3D/STL</option>
                          </optgroup>
                          
                          {/* 📋 ADMINISTRATIVE OPTIONS */}
                          <optgroup label="📋 Administrativo">
                            <option value="consent_form">📝 Consentimiento</option>
                            <option value="insurance_form">🛡️ Formulario seguro</option>
                            <option value="document_general">📄 Documento general</option>
                          </optgroup>
                          
                          {/* 💰 BILLING OPTIONS */}
                          <optgroup label="💰 Facturación">
                            <option value="invoice">💰 Factura</option>
                            <option value="budget">💸 Presupuesto</option>
                            <option value="payment_proof">🧾 Comprobante pago</option>
                          </optgroup>
                          
                          {/* ⚖️ LEGAL OPTIONS */}
                          <optgroup label="⚖️ Legal">
                            <option value="referral_letter">📄 Carta derivación</option>
                            <option value="legal_document">⚖️ Documento legal</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 🔘 STATUS ICON */}
              <div className="flex-shrink-0">
                {file.status === 'success' && (
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                )}
                {file.status === 'error' && (
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                )}
                {(file.status === 'pending' || file.status === 'uploading') && (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🚀 UPLOAD BUTTON */}
      {hasValidFiles && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            {hasErrors && (
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm text-gray-700">
              {files.filter(f => f.status === 'pending').length} archivo(s) listo(s) para subir
            </span>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Subiendo...' : 'Subir Archivos'}
          </button>
        </div>
      )}
    </div>
  );
};

