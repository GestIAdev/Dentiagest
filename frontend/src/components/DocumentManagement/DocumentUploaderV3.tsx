// 🎯🎸💀 DOCUMENT UPLOADER V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 26, 2025
// Mission: Advanced document upload component with validation and progress tracking
// Status: V3.0 - Full Apollo Nuclear Integration with @veritas Quantum Truth Verification
// Challenge: Secure document upload with real-time validation and progress feedback

import React, { useState, useCallback, useRef } from 'react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Spinner
} from '../../design-system';
import { createModuleLogger } from '../../utils/logger';

// 🎯 ICONS - Heroicons for medical theme
import {
  CloudArrowUpIcon,
  DocumentIcon,
  PhotoIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// 🎯 TYPES AND INTERFACES
interface DocumentFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface DocumentUploaderV3Props {
  patientId?: string;
  medicalRecordId?: string;
  appointmentId?: string;
  onUploadSuccess?: (document: any) => void;
  onUploadError?: (error: string) => void;
  onCancel?: () => void;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  className?: string;
}

interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// 🎯 CONSTANTS
const DEFAULT_MAX_FILE_SIZE = 50; // MB
const DEFAULT_ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const CATEGORY_OPTIONS = [
  { value: 'medical', label: 'Médico', icon: '🏥' },
  { value: 'administrative', label: 'Administrativo', icon: '📋' },
  { value: 'billing', label: 'Facturación', icon: '💰' },
  { value: 'legal', label: 'Legal', icon: '⚖️' }
];

const l = createModuleLogger('DocumentUploaderV3');

// 🎯 FILE VALIDATION UTILITIES
const validateFile = (
  file: File,
  maxFileSize: number = DEFAULT_MAX_FILE_SIZE,
  allowedTypes: string[] = DEFAULT_ALLOWED_TYPES
): FileValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxFileSize) {
    errors.push(`El archivo es demasiado grande. Tamaño máximo: ${maxFileSize}MB`);
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`);
  }

  // Check for suspicious file names
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    errors.push('Nombre de archivo no válido');
  }

  // Warnings for large files
  if (fileSizeMB > 10) {
    warnings.push('Archivo grande detectado. La subida puede tomar tiempo.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// 🎯 MAIN COMPONENT - DocumentUploaderV3
export const DocumentUploaderV3: React.FC<DocumentUploaderV3Props> = ({
  patientId,
  medicalRecordId,
  appointmentId,
  onUploadSuccess,
  onUploadError,
  onCancel,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  className = ''
}) => {
  // 🎯 STATE MANAGEMENT
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    description: '',
    category: 'medical',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [validationResult, setValidationResult] = useState<FileValidationResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // 🎯 REFS
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🎯 EVENT HANDLERS
  const handleFileSelect = useCallback((file: File) => {
    l.info('File selected for upload', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    const validation = validateFile(file, maxFileSize, allowedTypes);
    setValidationResult(validation);

    if (validation.isValid) {
      setSelectedFile(file);
      // Auto-fill title if empty
      if (!formData.title.trim()) {
        const titleWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ ...prev, title: titleWithoutExt }));
      }
    }
  }, [maxFileSize, allowedTypes, formData.title]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFormChange = (field: keyof DocumentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.title.trim()) return;

    setIsUploading(true);
    setUploadProgress({ loaded: 0, total: selectedFile.size, percentage: 0 });

    try {
      l.info('Starting document upload', {
        fileName: selectedFile.name,
        title: formData.title,
        category: formData.category,
        patientId,
        medicalRecordId,
        appointmentId
      });

      // 🔥 REAL FILE UPLOAD - NO MORE MOCKS!
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('patientId', patientId || '');
      uploadFormData.append('uploaderId', 'current-user-id'); // TODO: Get from auth context
      uploadFormData.append('documentType', formData.category.toUpperCase());
      uploadFormData.append('description', formData.description || '');
      uploadFormData.append('category', formData.category);
      uploadFormData.append('tags', JSON.stringify(formData.tags));
      
      if (medicalRecordId) {
        uploadFormData.append('medicalRecordId', medicalRecordId);
      }
      if (appointmentId) {
        uploadFormData.append('appointmentId', appointmentId);
      }

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      // Progress handler
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentage = (e.loaded / e.total) * 100;
          setUploadProgress({
            loaded: e.loaded,
            total: e.total,
            percentage
          });
        }
      });

      // Create promise for XHR
      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });
        
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });
      });

      // Send request
      const apiUrl = 'http://localhost:4000'; // TODO: Move to config/environment
      xhr.open('POST', `${apiUrl}/api/documents/upload`);
      xhr.send(uploadFormData);

      // Wait for completion
      const response = await uploadPromise;

      if (response.success) {
        setUploadProgress({ 
          loaded: selectedFile.size, 
          total: selectedFile.size, 
          percentage: 100 
        });

        l.info('Document upload successful', { documentId: response.document.id });
        onUploadSuccess?.(response.document);

        // Reset form
        resetForm();
      } else {
        throw new Error(response.error || 'Upload failed');
      }

    } catch (error: any) {
      l.error('Document upload failed', error);
      onUploadError?.(error.message || 'Error al subir el documento');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFormData({
      title: '',
      description: '',
      category: 'medical',
      tags: []
    });
    setTagInput('');
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };

  // 🎯 RENDER HELPERS
  const renderFilePreview = () => {
    if (!selectedFile) return null;

    const isImage = selectedFile.type.startsWith('image/');

    return (
      <Card className="border-green-200 bg-green-50">
        <CardBody className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {isImage ? (
                <PhotoIcon className="w-8 h-8 text-green-600" />
              ) : (
                <DocumentIcon className="w-8 h-8 text-green-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-green-700">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
              className="text-green-700 hover:text-green-900"
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  };

  const renderValidationMessages = () => {
    if (!validationResult) return null;

    return (
      <div className="space-y-2">
        {validationResult.errors.map((error, index) => (
          <div key={`error-${index}`} className="flex items-center space-x-2 text-red-600 text-sm">
            <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ))}
        {validationResult.warnings.map((warning, index) => (
          <div key={`warning-${index}`} className="flex items-center space-x-2 text-yellow-600 text-sm">
            <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
            <span>{warning}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderUploadProgress = () => {
    if (!uploadProgress) return null;

    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardBody className="p-4">
          <div className="flex items-center space-x-3">
            <ArrowPathIcon className="w-5 h-5 text-blue-600 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Subiendo documento...
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
              <p className="text-xs text-blue-700 mt-1">
                {uploadProgress.percentage.toFixed(1)}% completado
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  // 🎯 MAIN RENDER
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="cyberpunk-card">
        <CardHeader>
          <h2 className="cyberpunk-text text-lg font-bold flex items-center">
            <CloudArrowUpIcon className="w-6 h-6 mr-2" />
            Subir Documento - Olympus V3.0
          </h2>
        </CardHeader>
      </Card>

      {/* File Drop Zone */}
      {!selectedFile && (
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragOver
              ? 'border-cyan-400 bg-cyan-50'
              : 'border-gray-300 hover:border-cyan-400 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardBody className="p-8 text-center">
            <CloudArrowUpIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Arrastra y suelta tu archivo aquí
            </h3>
            <p className="text-gray-600 mb-4">
              o <button
                type="button"
                className="text-cyan-600 hover:text-cyan-800 font-medium"
                onClick={() => fileInputRef.current?.click()}
              >
                selecciona un archivo
              </button>
            </p>
            <p className="text-sm text-gray-500">
              Tamaño máximo: {maxFileSize}MB • Tipos permitidos: PDF, imágenes, documentos
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
              accept={allowedTypes.join(',')}
            />
          </CardBody>
        </Card>
      )}

      {/* File Preview */}
      {renderFilePreview()}

      {/* Validation Messages */}
      {validationResult && !validationResult.isValid && renderValidationMessages()}

      {/* Upload Progress */}
      {renderUploadProgress()}

      {/* Form */}
      {selectedFile && validationResult?.isValid && (
        <Card className="cyberpunk-card">
          <CardHeader>
            <h2 className="cyberpunk-text text-lg font-bold">Información del Documento</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="Título del documento"
                className={formData.title.trim() ? '' : 'border-red-300'}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                rows={3}
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Descripción opcional..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">Categoría</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleFormChange('category', option.value)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      formData.category === option.value
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{option.icon}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">Etiquetas</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Agregar etiqueta..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                  size="sm"
                >
                  Agregar
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="warning" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Actions */}
      {selectedFile && validationResult?.isValid && (
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !formData.title.trim()}
          >
            {isUploading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Subiendo...
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                Subir Documento
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentUploaderV3;
