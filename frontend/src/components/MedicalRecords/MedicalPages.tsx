// MEDICAL_PAGES: Páginas específicas para rutas de historiales médicos
/**
 * Componentes de página que integran los componentes médicos con el router.
 * Cada página maneja sexport const PatientMedicalRecordsPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  if (!patientId) {
    navigate('/dashboard/medical-records');  // 🔧 FIXED: Added /dashboard prefix
    return null;
  }

  const handleCreateNew = (selectedPatientId?: string) => {
    navigate(`/dashboard/medical-records/new?patientId=${patientId}`);  // 🔧 FIXED: Added /dashboard prefix
  };

  const handleViewDetail = (recordId: string) => {
    navigate(`/dashboard/medical-records/${recordId}`);  // 🔧 FIXED: Added /dashboard prefix
  };

  const handleEdit = (recordId: string, patientId?: string) => {
    navigate(`/dashboard/medical-records/${recordId}/edit`);  // 🔧 FIXED: Added /dashboard prefix
  };rámetros de URL.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import MedicalRecordsList from './MedicalRecordsList.tsx';
import MedicalRecordForm from './MedicalRecordForm.tsx';
import MedicalRecordDetail from './MedicalRecordDetail.tsx';
import { SensitiveDataWarning } from './MedicalSecurity.tsx';

// Página principal de lista de historiales
export const MedicalRecordsListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientId = searchParams.get('patientId') || undefined;

  const handleCreateNew = (selectedPatientId?: string) => {
    const params = selectedPatientId ? `?patientId=${selectedPatientId}` : '';
    navigate(`/dashboard/medical-records/new${params}`);  // 🔧 FIXED: Added /dashboard prefix
  };

  const handleViewDetail = (recordId: string) => {
    navigate(`/dashboard/medical-records/${recordId}`);  // 🔧 FIXED: Added /dashboard prefix
  };

  const handleEdit = (recordId: string, patientId?: string) => {
    navigate(`/dashboard/medical-records/${recordId}/edit`);  // 🔧 FIXED: Added /dashboard prefix
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          📋 Historiales Médicos
        </h1>
        <p className="text-gray-600 mt-2">
          {patientId 
            ? `Historiales del paciente seleccionado`
            : `Gestión de historiales clínicos del centro`
          }
        </p>
      </div>

      <SensitiveDataWarning />
      
      <MedicalRecordsList 
        onCreateNew={handleCreateNew}
        onViewDetail={handleViewDetail}
        onEdit={handleEdit}
      />
    </div>
  );
};

// Página para crear nuevo historial
export const NewMedicalRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId') || undefined;

  const handleSave = () => {
    // La lógica de guardado se maneja internamente en el componente MedicalRecordForm
    navigate('/dashboard/medical-records');  // 🔧 FIXED: Added /dashboard prefix
  };

  const handleClose = () => {
    navigate('/dashboard/medical-records');  // 🔧 FIXED: Added /dashboard prefix
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          ➕ Nuevo Historial Médico
        </h1>
        <p className="text-gray-600 mt-2">
          Crear un nuevo registro médico para el paciente
        </p>
      </div>

      <SensitiveDataWarning />
      
      <MedicalRecordForm
        isOpen={true}
        onClose={handleClose}
        onSave={handleSave}
        patientId={patientId}
      />
    </div>
  );
};

// Página para ver detalle de historial
export const MedicalRecordDetailPage: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();

  if (!recordId) {
    navigate('/dashboard/medical-records');  // 🔧 FIXED: Added /dashboard prefix
    return null;
  }

  const handleClose = () => {
    navigate('/dashboard/medical-records');  // 🔧 FIXED: Added /dashboard prefix
  };

  const handleEdit = () => {
    navigate(`/dashboard/medical-records/${recordId}/edit`);  // 🔧 FIXED: Added /dashboard prefix
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          📄 Detalle del Historial
        </h1>
        <p className="text-gray-600 mt-2">
          Información completa del registro médico
        </p>
      </div>

      <SensitiveDataWarning />
      
      <MedicalRecordDetail
        isOpen={true}
        onClose={handleClose}
        recordId={recordId}
        onEdit={handleEdit}
      />
    </div>
  );
};

// Página para editar historial
export const EditMedicalRecordPage: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();

  if (!recordId) {
    navigate('/dashboard/medical-records');  // 🔧 FIXED: Added /dashboard prefix
    return null;
  }

  const handleSave = () => {
    // La lógica de actualización se maneja internamente en el componente MedicalRecordForm
    navigate(`/dashboard/medical-records/${recordId}`);  // 🔧 FIXED: Added /dashboard prefix
  };

  const handleClose = () => {
    navigate(`/dashboard/medical-records/${recordId}`);  // 🔧 FIXED: Added /dashboard prefix
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          ✏️ Editar Historial Médico
        </h1>
        <p className="text-gray-600 mt-2">
          Modificar información del registro médico
        </p>
      </div>

      <SensitiveDataWarning />
      
      <MedicalRecordForm
        isOpen={true}
        onClose={handleClose}
        onSave={handleSave}
        recordId={recordId}
      />
    </div>
  );
};

// Página de información para pacientes específicos
export const PatientMedicalRecordsPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  if (!patientId) {
    navigate('/medical-records');
    return null;
  }

  const handleCreateNew = (selectedPatientId?: string) => {
    navigate(`/medical-records/new?patientId=${patientId}`);
  };

  const handleViewDetail = (recordId: string) => {
    navigate(`/medical-records/${recordId}`);
  };

  const handleEdit = (recordId: string, patientId?: string) => {
    navigate(`/medical-records/${recordId}/edit`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          🏥 Historiales del Paciente
        </h1>
        <p className="text-gray-600 mt-2">
          Todos los registros médicos asociados al paciente
        </p>
      </div>

      <SensitiveDataWarning />
      
      <MedicalRecordsList 
        onCreateNew={handleCreateNew}
        onViewDetail={handleViewDetail}
        onEdit={handleEdit}
      />
    </div>
  );
};
