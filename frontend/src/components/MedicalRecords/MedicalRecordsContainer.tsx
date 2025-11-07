// MEDICAL_RECORDS: Contenedor principal para la gestión de historiales médicos
/**
 * Componente contenedor que integra todos los subcomponentes de historiales médicos.
 * Gestiona el estado global y las interacciones entre componentes.
 * 
 * PLATFORM_PATTERN: Este patrón se repetirá en otros verticales:
 * - VetGest: Contenedor de historiales veterinarios
 * - MechaGest: Contenedor de órdenes de servicio
 * - RestaurantGest: Contenedor de pedidos
 */

import React, { useState, useCallback } from 'react';
import MedicalRecordsList from './MedicalRecordsList';
import MedicalRecordForm from './MedicalRecordForm';
import MedicalRecordDetail from './MedicalRecordDetail';

// Types para el estado del contenedor
interface MedicalRecordsContainerState {
  showForm: boolean;
  showDetail: boolean;
  editingRecordId: string | null;
  selectedRecordId: string | null;
  selectedPatientId: string | null;
  refreshList: boolean;
}

const MedicalRecordsContainer: React.FC = () => {
  // Estado del contenedor
  const [state, setState] = useState<MedicalRecordsContainerState>({
    showForm: false,
    showDetail: false,
    editingRecordId: null,
    selectedRecordId: null,
    selectedPatientId: null,
    refreshList: false
  });

  // Funciones para manejar el formulario
  const handleOpenForm = useCallback((patientId?: string, recordId?: string) => {
    setState(prev => ({
      ...prev,
      showForm: true,
      editingRecordId: recordId || null,
      selectedPatientId: patientId || null,
      showDetail: false
    }));
  }, []);

  const handleCloseForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      showForm: false,
      editingRecordId: null,
      selectedPatientId: null
    }));
  }, []);

  const handleSaveForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      showForm: false,
      editingRecordId: null,
      selectedPatientId: null,
      refreshList: !prev.refreshList // Trigger refresh
    }));
  }, []);

  // Funciones para manejar la vista de detalle
  const handleOpenDetail = useCallback((recordId: string) => {
    setState(prev => ({
      ...prev,
      showDetail: true,
      selectedRecordId: recordId,
      showForm: false
    }));
  }, []);

  const handleCloseDetail = useCallback(() => {
    setState(prev => ({
      ...prev,
      showDetail: false,
      selectedRecordId: null
    }));
  }, []);

  const handleEditFromDetail = useCallback(() => {
    if (state.selectedRecordId) {
      setState(prev => ({
        ...prev,
        showForm: true,
        showDetail: false,
        editingRecordId: prev.selectedRecordId
      }));
    }
  }, [state.selectedRecordId]);

  // Función para refrescar la lista
  const handleRefreshList = useCallback(() => {
    setState(prev => ({
      ...prev,
      refreshList: !prev.refreshList
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Lista de historiales médicos */}
        <MedicalRecordsList
          key={state.refreshList.toString()} // Force refresh when this changes
          onCreateNew={(patientId) => handleOpenForm(patientId)}
          onViewDetail={handleOpenDetail}
          onEdit={(recordId, patientId) => handleOpenForm(patientId, recordId)}
          onRefresh={handleRefreshList}
        />

        {/* Modal de formulario */}
        {state.showForm && (
          <MedicalRecordForm
            isOpen={state.showForm}
            onClose={handleCloseForm}
            recordId={state.editingRecordId}
            patientId={state.selectedPatientId || undefined}
            onSave={handleSaveForm}
          />
        )}

        {/* Modal de detalle */}
        {state.showDetail && (
          <MedicalRecordDetail
            isOpen={state.showDetail}
            onClose={handleCloseDetail}
            recordId={state.selectedRecordId}
            onEdit={handleEditFromDetail}
          />
        )}
      </div>
    </div>
  );
};

export default MedicalRecordsContainer;

