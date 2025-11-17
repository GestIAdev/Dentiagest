/**
 * 📅 APPOINTMENT SELECTOR MODAL - Design System Component
 * By PunkClaude - ENDER-D1-002
 * 
 * Modal for listing and selecting appointments by patient
 * Filterable by status with deterministic selection
 */

import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  Modal,
  Button,
  Card,
  CardBody,
  Spinner,
  Alert,
  Badge
} from '../../../design-system';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

// 🎯 GRAPHQL QUERY - Get appointments by patient
const GET_APPOINTMENTS_BY_PATIENT = gql`
  query GetAppointmentsByPatient($patientId: uuid!) {
    appointmentsV3(
      where: { patient_id: { _eq: $patientId } }
      order_by: { scheduled_at: desc }
      limit: 50
    ) {
      id
      scheduled_at
      status
      reason
      notes
      duration_minutes
      dentist_id
    }
  }
`;

interface Appointment {
  id: string;
  scheduled_at: string;
  status: string;
  reason?: string;
  notes?: string;
  duration_minutes?: number;
  dentist_id?: string;
}

interface AppointmentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAppointment: (appointment: Appointment) => void;
  patientId: string;
  patientName?: string;
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Todas', variant: 'default' as const },
  { value: 'SCHEDULED', label: 'Programadas', variant: 'info' as const },
  { value: 'COMPLETED', label: 'Completadas', variant: 'success' as const },
  { value: 'CANCELLED', label: 'Canceladas', variant: 'error' as const }
];

export const AppointmentSelectorModal: React.FC<AppointmentSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectAppointment,
  patientId,
  patientName
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 🎯 QUERY - Fetch appointments for patient
  const { data, loading, error } = useQuery(GET_APPOINTMENTS_BY_PATIENT, {
    variables: { patientId },
    skip: !isOpen || !patientId
  });

  const appointments: Appointment[] = data?.appointmentsV3 || [];

  // 🎯 FILTER - Apply status filter
  const filteredAppointments = appointments.filter((apt) =>
    statusFilter === 'all' || apt.status === statusFilter
  );

  const handleSelectAppointment = (appointment: Appointment) => {
    onSelectAppointment(appointment);
    onClose();
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`📅 Citas de ${patientName || 'Paciente'}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
            <span className="ml-2 text-gray-600">Cargando citas...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="error" title="Error al cargar citas">
            {error.message}
          </Alert>
        )}

        {/* Empty State */}
        {!loading && !error && filteredAppointments.length === 0 && (
          <Alert variant="info">
            {statusFilter === 'all'
              ? 'Este paciente no tiene citas registradas'
              : `No hay citas con estado "${STATUS_FILTERS.find(f => f.value === statusFilter)?.label}"`
            }
          </Alert>
        )}

        {/* Appointments List */}
        {!loading && !error && filteredAppointments.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredAppointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectAppointment(appointment)}
              >
                <CardBody className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="h-8 w-8 text-gray-400 flex-shrink-0 mt-1" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {appointment.reason || 'Cita general'}
                          </h3>
                          <Badge variant={getStatusBadgeVariant(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <ClockIcon className="h-4 w-4" />
                          <span>{formatDate(appointment.scheduled_at)}</span>
                          {appointment.duration_minutes && (
                            <span className="text-xs">
                              ({appointment.duration_minutes} min)
                            </span>
                          )}
                        </div>
                        {appointment.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {appointment.notes.substring(0, 80)}
                            {appointment.notes.length > 80 && '...'}
                          </p>
                        )}
                      </div>
                    </div>
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
