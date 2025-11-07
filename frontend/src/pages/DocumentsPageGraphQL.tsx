import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  GET_DOCUMENTS,
  CREATE_DOCUMENT,
  UPDATE_DOCUMENT,
  DELETE_DOCUMENT,
  Document,
  GetDocumentsData,
  CreateDocumentData,
  UpdateDocumentData,
  DeleteDocumentData,
} from "../graphql/queries/documents";

const DocumentsPageGraphQL: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedDocType, setSelectedDocType] = useState<string>("");

  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;

  // GraphQL Hooks
  const { data, loading, error, refetch } = useQuery<GetDocumentsData>(GET_DOCUMENTS, {
    variables: {
      limit: itemsPerPage,
      offset: offset,
      patientId: selectedPatientId || undefined,
      documentType: selectedDocType || undefined,
    },
  });

  const [createDocumentMutation] = useMutation<CreateDocumentData>(CREATE_DOCUMENT, {
    refetchQueries: [{ query: GET_DOCUMENTS }],
  });

  const [updateDocumentMutation] = useMutation<UpdateDocumentData>(UPDATE_DOCUMENT, {
    refetchQueries: [{ query: GET_DOCUMENTS }],
  });

  const [deleteDocumentMutation] = useMutation<DeleteDocumentData>(DELETE_DOCUMENT, {
    refetchQueries: [{ query: GET_DOCUMENTS }],
  });

  // Form State
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    documentType: "other",
    title: "",
    description: "",
    fileName: "",
    filePath: "",
    fileSize: "",
    mimeType: "",
    tags: "",
    uploadedBy: "",
  });

  // Form Handlers
  const handleCreate = () => {
    setEditingDocument(null);
    setFormData({
      patientId: "",
      patientName: "",
      documentType: "other",
      title: "",
      description: "",
      fileName: "",
      filePath: "",
      fileSize: "",
      mimeType: "",
      tags: "",
      uploadedBy: "",
    });
    setShowModal(true);
  };

  const handleEdit = (doc: Document) => {
    setEditingDocument(doc);
    setFormData({
      patientId: doc.patientId || "",
      patientName: doc.patientName || "",
      documentType: doc.documentType || "other",
      title: doc.title || "",
      description: doc.description || "",
      fileName: doc.fileName || "",
      filePath: doc.filePath || "",
      fileSize: doc.fileSize?.toString() || "",
      mimeType: doc.mimeType || "",
      tags: doc.tags?.join(", ") || "",
      uploadedBy: doc.uploadedBy || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input = {
      patientId: formData.patientId,
      patientName: formData.patientName,
      documentType: formData.documentType,
      title: formData.title,
      description: formData.description,
      fileName: formData.fileName,
      filePath: formData.filePath,
      fileSize: parseInt(formData.fileSize) || 0,
      mimeType: formData.mimeType || "application/octet-stream",
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      metadata: {},
      uploadedBy: formData.uploadedBy,
    };

    try {
      if (editingDocument) {
        await updateDocumentMutation({
          variables: { id: editingDocument.id, input },
        });
      } else {
        await createDocumentMutation({ variables: { input } });
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      console.error("Error saving document:", err);
      alert("Error al guardar documento");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este documento?")) return;

    try {
      await deleteDocumentMutation({ variables: { id } });
      refetch();
    } catch (err) {
      console.error("Error deleting document:", err);
      alert("Error al eliminar documento");
    }
  };

  const documents = data?.documents || [];
  const totalPages = Math.ceil(documents.length / itemsPerPage);

  if (loading) return <div className="p-4">Cargando documentos...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Documentos (GraphQL)</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Nuevo Documento
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
          value={selectedDocType}
          onChange={(e) => setSelectedDocType(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Todos los tipos</option>
          <option value="medical_report">Medical Report</option>
          <option value="prescription">Prescription</option>
          <option value="lab_result">Lab Result</option>
          <option value="imaging">Imaging</option>
          <option value="consent">Consent</option>
          <option value="invoice">Invoice</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Patient</th>
              <th className="border px-4 py-2">Type</th>
              <th className="border px-4 py-2">Title</th>
              <th className="border px-4 py-2">File Name</th>
              <th className="border px-4 py-2">Size (KB)</th>
              <th className="border px-4 py-2">Uploaded</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{doc.id.slice(0, 8)}</td>
                <td className="border px-4 py-2">
                  {doc.patientName || doc.patientId.slice(0, 8)}
                </td>
                <td className="border px-4 py-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {doc.documentType}
                  </span>
                </td>
                <td className="border px-4 py-2">{doc.title}</td>
                <td className="border px-4 py-2">{doc.fileName}</td>
                <td className="border px-4 py-2">{Math.round(doc.fileSize / 1024)}</td>
                <td className="border px-4 py-2">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleEdit(doc)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingDocument ? "Edit Document" : "New Document"}
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
                  <label className="block mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Document Type *</label>
                  <select
                    required
                    value={formData.documentType}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="medical_report">Medical Report</option>
                    <option value="prescription">Prescription</option>
                    <option value="lab_result">Lab Result</option>
                    <option value="imaging">Imaging</option>
                    <option value="consent">Consent</option>
                    <option value="invoice">Invoice</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">File Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fileName}
                    onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">File Path *</label>
                  <input
                    type="text"
                    required
                    value={formData.filePath}
                    onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">File Size (bytes)</label>
                  <input
                    type="number"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">MIME Type</label>
                  <input
                    type="text"
                    value={formData.mimeType}
                    onChange={(e) => setFormData({ ...formData, mimeType: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="e.g. application/pdf"
                  />
                </div>
                <div>
                  <label className="block mb-1">Uploaded By *</label>
                  <input
                    type="text"
                    required
                    value={formData.uploadedBy}
                    onChange={(e) => setFormData({ ...formData, uploadedBy: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="e.g. urgent, radiology"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

export default DocumentsPageGraphQL;
