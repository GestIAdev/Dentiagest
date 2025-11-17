/**
 * 🧙 DOCUMENT UPLOADER V3 REDESIGNED - 3-Step Wizard
 * By PunkClaude - ENDER-D1-002
 * 
 * Deterministic document upload with impossible orphan rejection
 * Zero heuristics - explicit owner selection BEFORE upload
 * 
 * WIZARD FLOW:
 * Step 1 (Destino): Select owner type (Patient/Clinic/Appointment)
 * Step 2 (Meta): Add category and tags
 * Step 3 (Subida): Drag & Drop upload (ONLY enabled if Step 1+2 complete)
 */

import React, { useState, useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  Modal,
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Alert,
  Badge
} from '../../design-system';
import {
  CloudArrowUpIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CheckCircleIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { PatientSelectorModal } from '../Shared/Selectors/PatientSelectorModal';
import { AppointmentSelectorModal } from '../Shared/Selectors/AppointmentSelectorModal';

// 🎯 GRAPHQL MUTATION - Create document with owner validation
const CREATE_DOCUMENT_V3 = gql`
  mutation CreateDocumentV3($input: CreateDocumentInputV3!) {
    createDocumentV3(input: $input) {
      id
      file_name
      document_type
      file_path
      patient_id
      appointment_id
      is_virtual
      category
      tags
      _veritas {
        signature
        timestamp
        metadata {
          operation
          entityId
          entityType
        }
      }
    }
  }
`;

// 🎯 TYPES
type OwnerType = 'patient' | 'appointment' | 'clinic' | null;

interface SelectedOwner {
  type: OwnerType;
  id?: string;
  displayName?: string;
}

interface DocumentMetadata {
  category: string;
  tags: string[];
}

interface DocumentUploaderV3RedesignedProps {
  onUploadSuccess?: (document: any) => void;
  onCancel?: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'medical', label: 'Médico', icon: '🏥' },
  { value: 'administrative', label: 'Administrativo', icon: '📋' },
  { value: 'billing', label: 'Facturación', icon: '💰' },
  { value: 'legal', label: 'Legal', icon: '⚖️' }
];

export const DocumentUploaderV3Redesigned: React.FC<DocumentUploaderV3RedesignedProps> = ({
  onUploadSuccess,
  onCancel
}) => {
  // 🎯 WIZARD STATE
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedOwner, setSelectedOwner] = useState<SelectedOwner>({ type: null });
  const [metadata, setMetadata] = useState<DocumentMetadata>({
    category: 'medical',
    tags: []
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState('');

  // 🎯 MODAL STATE
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // 🎯 MUTATION
  const [createDocument, { loading, error }] = useMutation(CREATE_DOCUMENT_V3);

  // 🎯 STEP 1: OWNER SELECTION
  const handleSelectOwnerType = (type: OwnerType) => {
    if (type === 'patient') {
      setIsPatientModalOpen(true);
    } else if (type === 'appointment') {
      setIsPatientModalOpen(true); // First select patient, then appointment
    } else if (type === 'clinic') {
      setSelectedOwner({
        type: 'clinic',
        displayName: 'Documentos de Clínica (Virtual)'
      });
      setCurrentStep(2);
    }
  };

  const handlePatientSelected = (patient: any) => {
    if (selectedOwner.type === 'appointment') {
      // Open appointment selector for selected patient
      setSelectedOwner({
        type: 'patient', // Temporary, will switch to appointment
        id: patient.id,
        displayName: `${patient.first_name} ${patient.last_name}`
      });
      setIsAppointmentModalOpen(true);
    } else {
      setSelectedOwner({
        type: 'patient',
        id: patient.id,
        displayName: `${patient.first_name} ${patient.last_name}`
      });
      setCurrentStep(2);
    }
    setIsPatientModalOpen(false);
  };

  const handleAppointmentSelected = (appointment: any) => {
    const patientName = selectedOwner.displayName || 'Paciente';
    setSelectedOwner({
      type: 'appointment',
      id: appointment.id,
      displayName: `Cita: ${patientName} - ${new Date(appointment.scheduled_at).toLocaleDateString()}`
    });
    setIsAppointmentModalOpen(false);
    setCurrentStep(2);
  };

  // 🎯 STEP 2: METADATA
  const handleAddTag = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata({
        ...metadata,
        tags: [...metadata.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setMetadata({
      ...metadata,
      tags: metadata.tags.filter(t => t !== tag)
    });
  };

  const handleProceedToUpload = () => {
    if (metadata.category) {
      setCurrentStep(3);
    }
  };

  // 🎯 STEP 3: FILE UPLOAD
  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedOwner.type) {
      return;
    }

    try {
      // Build input based on owner type
      const input: any = {
        fileName: selectedFile.name,
        documentType: selectedFile.type,
        category: metadata.category,
        tags: metadata.tags,
        filePath: `/uploads/${Date.now()}-${selectedFile.name}`,
        fileSize: selectedFile.size
      };

      // 🎯 XOR OWNER LOGIC - EXACTLY ONE OWNER
      if (selectedOwner.type === 'patient') {
        input.patientId = selectedOwner.id;
      } else if (selectedOwner.type === 'appointment') {
        input.appointmentId = selectedOwner.id;
      } else if (selectedOwner.type === 'clinic') {
        input.isVirtual = true;
      }

      const { data } = await createDocument({ variables: { input } });

      if (data?.createDocumentV3) {
        onUploadSuccess?.(data.createDocumentV3);
        
        // Reset wizard
        setCurrentStep(1);
        setSelectedOwner({ type: null });
        setMetadata({ category: 'medical', tags: [] });
        setSelectedFile(null);
      }
    } catch (err) {
      console.error('❌ Upload failed:', err);
    }
  };

  // 🎯 RENDER HELPERS
  const renderStepIndicator = () => (
    <div className="flex justify-between mb-6">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={`flex items-center ${
            step < currentStep
              ? 'text-green-600'
              : step === currentStep
              ? 'text-blue-600 font-bold'
              : 'text-gray-400'
          }`}
        >
          {step < currentStep ? (
            <CheckCircleIcon className="w-6 h-6 mr-2" />
          ) : (
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 ${
              step === currentStep ? 'border-blue-600' : 'border-gray-300'
            }`}>
              {step}
            </div>
          )}
          <span>
            {step === 1 && 'Destino'}
            {step === 2 && 'Metadata'}
            {step === 3 && 'Subida'}
          </span>
        </div>
      ))}
    </div>
  );

  // 🎯 STEP 1 RENDER
  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Paso 1: Selecciona el Destino</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleSelectOwnerType('patient')}
        >
          <CardBody className="p-6 text-center">
            <UserIcon className="w-12 h-12 mx-auto mb-3 text-blue-600" />
            <h4 className="font-semibold">Paciente</h4>
            <p className="text-sm text-gray-500 mt-2">
              Documento asociado a un paciente específico
            </p>
          </CardBody>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleSelectOwnerType('clinic')}
        >
          <CardBody className="p-6 text-center">
            <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-3 text-green-600" />
            <h4 className="font-semibold">Clínica</h4>
            <p className="text-sm text-gray-500 mt-2">
              Documento general de la clínica (sin paciente)
            </p>
          </CardBody>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleSelectOwnerType('appointment')}
        >
          <CardBody className="p-6 text-center">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-purple-600" />
            <h4 className="font-semibold">Cita</h4>
            <p className="text-sm text-gray-500 mt-2">
              Documento específico de una cita
            </p>
          </CardBody>
        </Card>
      </div>

      {selectedOwner.type && (
        <Alert variant="success" title="✅ Destino Seleccionado">
          <strong>{selectedOwner.displayName}</strong>
        </Alert>
      )}
    </div>
  );

  // 🎯 STEP 2 RENDER
  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Paso 2: Agregar Metadata</h3>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Categoría *</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORY_OPTIONS.map((cat) => (
            <Button
              key={cat.value}
              variant={metadata.category === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMetadata({ ...metadata, category: cat.value })}
            >
              {cat.icon} {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tags Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Etiquetas (opcional)</label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Añadir etiqueta..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          />
          <Button onClick={handleAddTag} variant="outline">
            <TagIcon className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {metadata.tags.map((tag) => (
            <Badge key={tag} variant="info">
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          ← Volver
        </Button>
        <Button onClick={handleProceedToUpload} disabled={!metadata.category}>
          Continuar →
        </Button>
      </div>
    </div>
  );

  // 🎯 STEP 3 RENDER
  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Paso 3: Subir Archivo</h3>

      {/* File Drop Zone */}
      {!selectedFile ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <CloudArrowUpIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Arrastra y suelta tu archivo aquí</h3>
          <p className="text-sm text-gray-500 mb-4">o haz clic para seleccionar</p>
          <input
            type="file"
            onChange={handleFileInputChange}
            className="hidden"
            id="file-input"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            Seleccionar Archivo
          </Button>
        </div>
      ) : (
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{selectedFile.name}</h4>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                Cambiar
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="error" title="Error al subir documento">
          {error.message}
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setCurrentStep(2)}>
          ← Volver
        </Button>
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              <span className="ml-2">Subiendo...</span>
            </>
          ) : (
            'Subir Documento'
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold flex items-center">
            <CloudArrowUpIcon className="w-6 h-6 mr-2" />
            Document Uploader V3 - Redesigned
          </h2>
        </CardHeader>
        <CardBody className="p-6">
          {renderStepIndicator()}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </CardBody>
      </Card>

      {/* Modals */}
      <PatientSelectorModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSelectPatient={handlePatientSelected}
      />
      <AppointmentSelectorModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSelectAppointment={handleAppointmentSelected}
        patientId={selectedOwner.id || ''}
        patientName={selectedOwner.displayName}
      />
    </div>
  );
};
