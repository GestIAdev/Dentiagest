/**
 * 🔍 PATIENT SELECTOR MODAL - Design System Component
 * By PunkClaude - ENDER-D1-002
 * 
 * Modal for searching and selecting patients with real-time debounce
 * Zero heuristics - pure deterministic selection
 */

import React, { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  Modal,
  Input,
  Button,
  Card,
  CardBody,
  Spinner,
  Alert,
  Badge
} from '../../../design-system';
import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';

// 🎯 GRAPHQL QUERY - Search patients by name
const GET_PATIENTS_SEARCH = gql`
  query SearchPatients($searchTerm: String!) {
    patientsV3(
      where: {
        OR: [
          { first_name: { _ilike: $searchTerm } }
          { last_name: { _ilike: $searchTerm } }
          { email: { _ilike: $searchTerm } }
        ]
      }
      order_by: { last_name: asc }
      limit: 20
    ) {
      id
      first_name
      last_name
      email
      phone
      status
    }
  }
`;

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status: string;
}

interface PatientSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patient: Patient) => void;
}

export const PatientSelectorModal: React.FC<PatientSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectPatient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // 🎯 LAZY QUERY - Execute only when user types
  const [searchPatients, { data, loading, error }] = useLazyQuery(GET_PATIENTS_SEARCH);

  // 🎯 DEBOUNCE EFFECT - 500ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 🎯 TRIGGER SEARCH - When debounced value changes
  useEffect(() => {
    if (debouncedSearch.trim().length >= 2) {
      searchPatients({
        variables: {
          searchTerm: `%${debouncedSearch}%`
        }
      });
    }
  }, [debouncedSearch, searchPatients]);

  const patients: Patient[] = data?.patientsV3 || [];

  const handleSelectPatient = (patient: Patient) => {
    onSelectPatient(patient);
    onClose();
    setSearchTerm(''); // Reset search
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🔍 Buscar Paciente"
      size="lg"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, apellido o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
            <span className="ml-2 text-gray-600">Buscando pacientes...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="error" title="Error de búsqueda">
            {error.message}
          </Alert>
        )}

        {/* Empty State */}
        {!loading && !error && searchTerm.length > 0 && searchTerm.length < 2 && (
          <Alert variant="info">
            Escribe al menos 2 caracteres para buscar
          </Alert>
        )}

        {/* No Results */}
        {!loading && !error && debouncedSearch.length >= 2 && patients.length === 0 && (
          <Alert variant="warning">
            No se encontraron pacientes con el término "{debouncedSearch}"
          </Alert>
        )}

        {/* Results List */}
        {!loading && !error && patients.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {patients.map((patient) => (
              <Card
                key={patient.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectPatient(patient)}
              >
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserIcon className="h-10 w-10 text-gray-400" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {patient.email || 'Sin email'}
                        </p>
                        {patient.phone && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            📞 {patient.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={patient.status === 'active' ? 'success' : 'default'}
                    >
                      {patient.status}
                    </Badge>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
