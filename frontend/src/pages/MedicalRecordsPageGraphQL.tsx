// ✅ MEDICAL RECORDS PAGE - GraphQL Migration v1.0
// Date: November 6, 2025
// Pattern: Following MIGRATION_GRAPHQL_PLAYBOOK.md

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_MEDICAL_RECORDS,
  CREATE_MEDICAL_RECORD,
  UPDATE_MEDICAL_RECORD,
  DELETE_MEDICAL_RECORD,
  MedicalRecord,
  MedicalRecordInput,
} from '../graphql/queries/medicalRecords';

export function MedicalRecordsPageGraphQL() {
  const [page, setPage] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [formData, setFormData] = useState<MedicalRecordInput>({
    patientId: '',
    recordType: 'general',
    title: '',
    content: '',
    diagnosis: '',
    treatment: '',
    medications: [],
  });

  const pageSize = 10;

  // Query
  const { data, loading, error, refetch } = useQuery(GET_MEDICAL_RECORDS, {
    variables: { limit: pageSize, offset: page * pageSize },
    fetchPolicy: 'network-only',
  });

  // Mutations
  const [createRecord] = useMutation(CREATE_MEDICAL_RECORD, {
    onCompleted: () => {
      refetch();
      closeForm();
    },
  });

  const [updateRecord] = useMutation(UPDATE_MEDICAL_RECORD, {
    onCompleted: () => {
      refetch();
      closeForm();
    },
  });

  const [deleteRecord] = useMutation(DELETE_MEDICAL_RECORD, {
    onCompleted: () => refetch(),
  });

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRecord) {
      await updateRecord({ variables: { id: editingRecord.id, input: formData } });
    } else {
      await createRecord({ variables: { input: formData } });
    }
  };

  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
    setFormData({
      patientId: record.patientId || '',
      recordType: record.recordType || 'general',
      title: record.title || '',
      content: record.content || '',
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      medications: record.medications || [],
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar historial médico?')) {
      await deleteRecord({ variables: { id } });
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRecord(null);
    setFormData({
      patientId: '',
      recordType: 'general',
      title: '',
      content: '',
      diagnosis: '',
      treatment: '',
      medications: [],
    });
  };

  const records = (data as any)?.medicalRecords || [];

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
        <h1 className="text-3xl font-bold text-cyan-400">Medical Records (GraphQL)</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg"
        >
          + New Record
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500"></div>
        </div>
      )}

      {/* Records list */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map((record: MedicalRecord) => (
              <div key={record.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{record.title}</h3>
                    <p className="text-sm text-gray-400">
                      {record.patient?.firstName} {record.patient?.lastName}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-bold bg-purple-500/20 text-purple-400">
                    {record.recordType}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-300">
                  <p className="font-semibold text-white">Diagnosis:</p>
                  <p className="text-gray-400">{record.diagnosis || 'N/A'}</p>

                  {record.treatment && (
                    <>
                      <p className="font-semibold text-white mt-2">Treatment:</p>
                      <p className="text-gray-400">{record.treatment}</p>
                    </>
                  )}

                  {record.medications.length > 0 && (
                    <>
                      <p className="font-semibold text-white mt-2">Medications:</p>
                      <ul className="list-disc list-inside text-gray-400">
                        {record.medications.map((med, i) => (
                          <li key={i}>{med}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(record)}
                    className="flex-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
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
              disabled={records.length < pageSize}
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
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              {editingRecord ? 'Edit Medical Record' : 'New Medical Record'}
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
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Record Type
                </label>
                <select
                  value={formData.recordType || 'general'}
                  onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="general">General</option>
                  <option value="consultation">Consultation</option>
                  <option value="treatment">Treatment</option>
                  <option value="followup">Follow-up</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Diagnosis</label>
                <textarea
                  value={formData.diagnosis || ''}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Treatment</label>
                <textarea
                  value={formData.treatment || ''}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                <textarea
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded"
                >
                  {editingRecord ? 'Update' : 'Create'}
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
