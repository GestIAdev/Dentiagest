import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  GET_TREATMENTS,
  CREATE_TREATMENT,
  UPDATE_TREATMENT,
  DELETE_TREATMENT,
  Treatment,
  GetTreatmentsData,
  CreateTreatmentData,
  UpdateTreatmentData,
  DeleteTreatmentData,
} from "../graphql/queries/treatments";

const TreatmentsPageGraphQL: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;

  // GraphQL Hooks
  const { data, loading, error, refetch } = useQuery<GetTreatmentsData>(GET_TREATMENTS, {
    variables: {
      limit: itemsPerPage,
      offset: offset,
      patientId: selectedPatientId || undefined,
      status: selectedStatus || undefined,
    },
  });

  const [createTreatmentMutation] = useMutation<CreateTreatmentData>(CREATE_TREATMENT, {
    refetchQueries: [{ query: GET_TREATMENTS }],
  });

  const [updateTreatmentMutation] = useMutation<UpdateTreatmentData>(UPDATE_TREATMENT, {
    refetchQueries: [{ query: GET_TREATMENTS }],
  });

  const [deleteTreatmentMutation] = useMutation<DeleteTreatmentData>(DELETE_TREATMENT, {
    refetchQueries: [{ query: GET_TREATMENTS }],
  });

  // Form State
  const [formData, setFormData] = useState({
    patientId: "",
    practitionerId: "",
    treatmentType: "",
    description: "",
    status: "pending",
    startDate: "",
    endDate: "",
    cost: "",
    notes: "",
  });

  // Form Handlers
  const handleCreate = () => {
    setEditingTreatment(null);
    setFormData({
      patientId: "",
      practitionerId: "",
      treatmentType: "",
      description: "",
      status: "pending",
      startDate: "",
      endDate: "",
      cost: "",
      notes: "",
    });
    setShowModal(true);
  };

  const handleEdit = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setFormData({
      patientId: treatment.patientId || "",
      practitionerId: treatment.practitionerId || "",
      treatmentType: treatment.treatmentType || "",
      description: treatment.description || "",
      status: treatment.status || "pending",
      startDate: treatment.startDate || "",
      endDate: treatment.endDate || "",
      cost: treatment.cost?.toString() || "",
      notes: treatment.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input = {
      patientId: formData.patientId,
      practitionerId: formData.practitionerId,
      treatmentType: formData.treatmentType,
      description: formData.description,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate || null,
      cost: parseFloat(formData.cost) || 0,
      notes: formData.notes,
    };

    try {
      if (editingTreatment) {
        await updateTreatmentMutation({
          variables: { id: editingTreatment.id, input },
        });
      } else {
        await createTreatmentMutation({ variables: { input } });
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      console.error("Error saving treatment:", err);
      alert("Error al guardar tratamiento");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este tratamiento?")) return;

    try {
      await deleteTreatmentMutation({ variables: { id } });
      refetch();
    } catch (err) {
      console.error("Error deleting treatment:", err);
      alert("Error al eliminar tratamiento");
    }
  };

  const treatments = data?.treatments || [];
  const totalPages = Math.ceil(treatments.length / itemsPerPage);

  if (loading) return <div className="p-4">Cargando tratamientos...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Tratamientos (GraphQL)</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Nuevo Tratamiento
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Filtrar por Patient ID..."
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Patient ID</th>
              <th className="border px-4 py-2">Type</th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Start Date</th>
              <th className="border px-4 py-2">Cost</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {treatments.map((treatment) => (
              <tr key={treatment.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{treatment.id.slice(0, 8)}</td>
                <td className="border px-4 py-2">{treatment.patientId.slice(0, 8)}</td>
                <td className="border px-4 py-2">{treatment.treatmentType}</td>
                <td className="border px-4 py-2">{treatment.description}</td>
                <td className="border px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      treatment.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : treatment.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : treatment.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {treatment.status}
                  </span>
                </td>
                <td className="border px-4 py-2">
                  {new Date(treatment.startDate).toLocaleDateString()}
                </td>
                <td className="border px-4 py-2">${treatment.cost}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleEdit(treatment)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(treatment.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-center gap-2 mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTreatment ? "Edit Treatment" : "New Treatment"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Patient ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Practitioner ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.practitionerId}
                    onChange={(e) =>
                      setFormData({ ...formData, practitionerId: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Treatment Type *</label>
                  <input
                    type="text"
                    required
                    value={formData.treatmentType}
                    onChange={(e) => setFormData({ ...formData, treatmentType: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  rows={2}
                />
              </div>
              <div className="mt-4">
                <label className="block mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentsPageGraphQL;
