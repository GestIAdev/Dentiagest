// ✅ APPOINTMENTS PAGE - GraphQL Migration v1.0
// Date: November 6, 2025
// Pattern: Following MIGRATION_GRAPHQL_PLAYBOOK.md

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_APPOINTMENTS,
  CREATE_APPOINTMENT,
  UPDATE_APPOINTMENT,
  DELETE_APPOINTMENT,
  Appointment,
  AppointmentInput,
  UpdateAppointmentInput,
} from '../graphql/queries/appointments';

export function AppointmentsPageGraphQL() {
  const [page, setPage] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<AppointmentInput>({
    patientId: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: 30,
    type: 'regular',
    status: 'scheduled',
    notes: '',
  });

  const pageSize = 10;

  // Query
  const { data, loading, error, refetch } = useQuery(GET_APPOINTMENTS, {
    variables: { limit: pageSize, offset: page * pageSize },
    fetchPolicy: 'network-only',
  });

  // Mutations
  const [createAppointment] = useMutation(CREATE_APPOINTMENT, {
    onCompleted: () => {
      refetch();
      closeForm();
    },
    onError: (err) => console.error('Create error:', err),
  });

  const [updateAppointment] = useMutation(UPDATE_APPOINTMENT, {
    onCompleted: () => {
      refetch();
      closeForm();
    },
    onError: (err) => console.error('Update error:', err),
  });

  const [deleteAppointment] = useMutation(DELETE_APPOINTMENT, {
    onCompleted: () => refetch(),
    onError: (err) => console.error('Delete error:', err),
  });

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAppointment) {
      await updateAppointment({
        variables: { id: editingAppointment.id, input: formData as UpdateAppointmentInput },
      });
    } else {
      await createAppointment({ variables: { input: formData } });
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patientId || '',
      appointmentDate: appointment.appointmentDate || '',
      appointmentTime: appointment.appointmentTime || '',
      duration: appointment.duration || 30,
      type: appointment.type || 'regular',
      status: appointment.status || 'scheduled',
      notes: appointment.notes || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar cita?')) {
      await deleteAppointment({ variables: { id } });
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAppointment(null);
    setFormData({
      patientId: '',
      appointmentDate: '',
      appointmentTime: '',
      duration: 30,
      type: 'regular',
      status: 'scheduled',
      notes: '',
    });
  };

  const appointments = (data as any)?.appointments || [];

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
          <h2 className="text-red-500 font-bold">GraphQL Error</h2>
          <p className="text-red-300">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-cyan-400">Appointments (GraphQL)</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg"
        >
          + New Appointment
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500"></div>
        </div>
      )}

      {/* Appointments list */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map((appointment: Appointment) => (
              <div
                key={appointment.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {appointment.patient?.firstName} {appointment.patient?.lastName}
                    </h3>
                    <p className="text-sm text-gray-400">{appointment.type}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      appointment.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : appointment.status === 'scheduled'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-300">
                  <p>📅 {appointment.appointmentDate}</p>
                  <p>🕐 {appointment.appointmentTime}</p>
                  <p>⏱️ {appointment.duration} min</p>
                  {appointment.notes && <p className="text-gray-400">📝 {appointment.notes}</p>}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(appointment)}
                    className="flex-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(appointment.id)}
                    className="flex-1 px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-white">Page {page + 1}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={appointments.length < pageSize}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Patient ID
                </label>
                <input
                  type="text"
                  value={formData.patientId || ''}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.appointmentDate || ''}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
                <input
                  type="time"
                  value={formData.appointmentTime || ''}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Duration (min)
                </label>
                <input
                  type="number"
                  value={formData.duration || 30}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                <select
                  value={formData.type || 'regular'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="regular">Regular</option>
                  <option value="emergency">Emergency</option>
                  <option value="followup">Follow-up</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select
                  value={formData.status || 'scheduled'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded"
                >
                  {editingAppointment ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
