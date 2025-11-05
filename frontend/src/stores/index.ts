// 🧠 APOLLO NUCLEAR STATE MANAGEMENT
// Zustand Stores for Global State
// Date: September 22, 2025

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { apolloClient } from '../apollo/graphql-client';
import {
  GET_UNIFIED_DOCUMENTS,
  UPLOAD_DOCUMENT_MUTATION,
  DELETE_DOCUMENT
} from '../graphql/queries/documents';

// Types
export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  insurance_provider?: string;
  insurance_number?: string;
  medical_conditions?: string;
  allergies?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  dentist_id: string;
  scheduled_date: string;
  duration_minutes: number;
  appointment_type: string;
  priority: string;
  title: string;
  description?: string;
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  patient_name: string;
  patient_phone?: string;
  dentist_name: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  patient_id: number;
  document_type: string;
  title: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  uploaded_at: string;
  is_encrypted: boolean;
  tags: string[];
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  record_type: 'consultation' | 'treatment' | 'diagnosis' | 'follow_up' | 'emergency' | 'preventive';
  title: string;
  description: string;
  diagnosis?: string;
  treatment_plan?: string;
  medications?: string;
  notes?: string;
  vital_signs?: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  attachments?: MedicalDocument[];
  created_by: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'active' | 'completed' | 'archived';
}

export interface MedicalDocument {
  id: string;
  medical_record_id: string;
  document_type: 'x_ray' | 'photo' | 'scan' | 'report' | 'prescription' | 'other';
  title: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_at: string;
  is_encrypted: boolean;
  tags?: string[];
}

// Patient Store
interface PatientState {
  patients: Patient[];
  currentPatient: Patient | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPatients: (patients: Patient[]) => void;
  addPatient: (patient: Patient) => void;
  updatePatient: (id: number, updates: Partial<Patient>) => void;
  deletePatient: (id: number) => void;
  setCurrentPatient: (patient: Patient | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 🔥 APOLLO NUCLEAR ENHANCED METHODS
  fetchPatients: (filters?: any) => Promise<Patient[]>;
  createPatient: (patientData: Partial<Patient>) => Promise<Patient>;
  updatePatientAsync: (id: number, patientData: Partial<Patient>) => Promise<Patient>;
  deletePatientAsync: (id: number) => Promise<void>;
}

export const usePatientStore = create<PatientState>()(
  devtools(
    persist(
      (set, get) => ({
        patients: [],
        currentPatient: null,
        isLoading: false,
        error: null,

        setPatients: (patients) => set({ patients }),
        addPatient: (patient) => set((state) => ({
          patients: [...state.patients, patient]
        })),
        updatePatient: (id, updates) => set((state) => ({
          patients: state.patients.map(p => p.id === id ? { ...p, ...updates } : p),
          currentPatient: state.currentPatient?.id === id ? { ...state.currentPatient, ...updates } : state.currentPatient
        })),
        deletePatient: (id) => set((state) => ({
          patients: state.patients.filter(p => p.id !== id),
          currentPatient: state.currentPatient?.id === id ? null : state.currentPatient
        })),
        setCurrentPatient: (patient) => set({ currentPatient: patient }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),

        // 🔥 APOLLO NUCLEAR ENHANCED METHODS
        fetchPatients: async (filters?: any) => {
          const { setLoading, setError, setPatients } = get();
          setLoading(true);
          setError(null);

          try {
            // Import apollo dynamically to avoid circular dependencies
            const apollo = (await import('../apollo')).default;

            const result = await apollo.patients.list(filters);
            const patientsArray: Patient[] = (result as any).patients || [];

            setPatients(patientsArray);
            return patientsArray;
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            return [];
          } finally {
            setLoading(false);
          }
        },

        createPatient: async (patientData: Partial<Patient>) => {
          const { setLoading, setError, addPatient } = get();
          setLoading(true);
          setError(null);

          try {
            const apollo = (await import('../apollo')).default;

            const newPatient = await apollo.patients.create(patientData);

            const mappedPatient = {
              ...(newPatient as any),
              id: parseInt((newPatient as any).id) // Ensure id is number
            };

            addPatient(mappedPatient);
            return mappedPatient;
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
          } finally {
            setLoading(false);
          }
        },

        updatePatientAsync: async (id: number, patientData: Partial<Patient>) => {
          const { setLoading, setError, updatePatient } = get();
          setLoading(true);
          setError(null);

          try {
            const apollo = (await import('../apollo')).default;

            const updatedPatient = await apollo.patients.update(id.toString(), patientData);

            const mappedPatient = {
              ...(updatedPatient as any),
              id: parseInt((updatedPatient as any).id) // Ensure id is number
            };

            updatePatient(id, mappedPatient);
            return mappedPatient;
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
          } finally {
            setLoading(false);
          }
        },

        deletePatientAsync: async (id: number) => {
          const { setLoading, setError, deletePatient } = get();
          setLoading(true);
          setError(null);

          try {
            const apollo = (await import('../apollo')).default;

            await apollo.patients.delete(id.toString());
            deletePatient(id);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
          } finally {
            setLoading(false);
          }
        }
      }),
      {
        name: 'patient-store',
        partialize: (state) => ({
          currentPatient: state.currentPatient,
          patients: state.patients.slice(0, 50) // Limit persisted patients
        })
      }
    ),
    { name: 'patient-store' }
  )
);

// Appointment Store
interface AppointmentState {
  appointments: Appointment[];
  upcomingAppointments: Appointment[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setAppointments: (appointments: Appointment[]) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  setUpcomingAppointments: (appointments: Appointment[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 🔥 APOLLO NUCLEAR ENHANCED METHODS
  fetchAppointments: () => Promise<Appointment[]>;
  createAppointment: (appointmentData: Partial<Appointment>) => Promise<Appointment>;
  updateAppointmentAsync: (id: string, appointmentData: Partial<Appointment>) => Promise<Appointment>;
  deleteAppointmentAsync: (id: string) => Promise<void>;

  // 🎨 Computed getters
  getUpcomingAppointments: () => Appointment[];
  getTodayAppointments: () => Appointment[];
  getAppointmentsByStatus: (status: Appointment['status']) => Appointment[];
  getAppointmentsByDateRange: (startDate: Date, endDate: Date) => Appointment[];
}

export const useAppointmentStore = create<AppointmentState>()(
  devtools(
    persist(
      (set, get) => ({
        appointments: [],
        upcomingAppointments: [],
        isLoading: false,
        error: null,

        setAppointments: (appointments) => set({ appointments }),
        addAppointment: (appointment) => set((state) => ({
          appointments: [...state.appointments, appointment]
        })),
        updateAppointment: (id, updates) => set((state) => ({
          appointments: state.appointments.map(a => a.id === id ? { ...a, ...updates } : a),
          upcomingAppointments: state.upcomingAppointments.map(a => a.id === id ? { ...a, ...updates } : a)
        })),
        deleteAppointment: (id) => set((state) => ({
          appointments: state.appointments.filter(a => a.id !== id),
          upcomingAppointments: state.upcomingAppointments.filter(a => a.id !== id)
        })),
        setUpcomingAppointments: (appointments) => set({ upcomingAppointments: appointments }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),

        // 🔥 APOLLO NUCLEAR ENHANCED METHODS
        fetchAppointments: async () => {
          const { setLoading, setError, setAppointments } = get();
          setLoading(true);
          setError(null);

          try {
            // Import apollo dynamically to avoid circular dependencies
            const apollo = (await import('../apollo')).default;

            const result = await apollo.appointments.list();
            const appointmentsArray: Appointment[] = result.appointments || [];

            const allAppointments = appointmentsArray.map((apt: any) => ({
              ...apt,
              priority: apt.priority || 'normal'
            }));

            setAppointments(allAppointments);
            return allAppointments;
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            return [];
          } finally {
            setLoading(false);
          }
        },

        createAppointment: async (appointmentData: Partial<Appointment>) => {
          const { setLoading, setError, addAppointment } = get();
          setLoading(true);
          setError(null);

          try {
            const apollo = (await import('../apollo')).default;

            const newAppointment = await apollo.appointments.create(appointmentData);

            const mappedAppointment = {
              ...(newAppointment as any),
              priority: (newAppointment as any).priority || 'normal'
            };

            addAppointment(mappedAppointment);
            return mappedAppointment;
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
          } finally {
            setLoading(false);
          }
        },

        updateAppointmentAsync: async (id: string, appointmentData: Partial<Appointment>) => {
          const { setLoading, setError, updateAppointment } = get();
          setLoading(true);
          setError(null);

          try {
            const apollo = (await import('../apollo')).default;

            const updatedAppointment = await apollo.appointments.update(id, appointmentData);

            const mappedAppointment = {
              ...(updatedAppointment as any),
              priority: (updatedAppointment as any).priority || 'normal'
            };

            updateAppointment(id, mappedAppointment);
            return mappedAppointment;
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
          } finally {
            setLoading(false);
          }
        },

        deleteAppointmentAsync: async (id: string) => {
          const { setLoading, setError, deleteAppointment } = get();
          setLoading(true);
          setError(null);

          try {
            const apollo = (await import('../apollo')).default;

            await apollo.appointments.delete(id);
            deleteAppointment(id);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
          } finally {
            setLoading(false);
          }
        },

        // 🎨 Computed getters
        getUpcomingAppointments: () => {
          const { appointments } = get();
          const now = new Date();
          return appointments
            .filter(apt => new Date(apt.scheduled_date) > now)
            .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());
        },

        getTodayAppointments: () => {
          const { appointments } = get();
          const today = new Date().toDateString();
          return appointments.filter(apt => new Date(apt.scheduled_date).toDateString() === today);
        },

        getAppointmentsByStatus: (status: Appointment['status']) => {
          const { appointments } = get();
          return appointments.filter(apt => apt.status === status);
        },

        getAppointmentsByDateRange: (startDate: Date, endDate: Date) => {
          const { appointments } = get();
          return appointments.filter(apt => {
            const aptDate = new Date(apt.scheduled_date);
            return aptDate >= startDate && aptDate <= endDate;
          });
        }
      }),
      {
        name: 'appointment-store',
        partialize: (state) => ({
          upcomingAppointments: state.upcomingAppointments
        })
      }
    ),
    { name: 'appointment-store' }
  )
);

// Document Store
interface DocumentState {
  documents: Document[];
  patientDocuments: Record<number, Document[]>;
  isLoading: boolean;
  error: string | null;

  // Actions
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: number, updates: Partial<Document>) => void;
  deleteDocument: (id: number) => void;
  setPatientDocuments: (patientId: number, documents: Document[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 🔥 APOLLO NUCLEAR ENHANCED METHODS
  fetchDocuments: (filters?: any) => Promise<Document[]>;
  fetchPatientDocuments: (patientId: number) => Promise<Document[]>;
  uploadDocument: (documentData: FormData) => Promise<Document>;
  downloadDocument: (documentId: number) => Promise<Blob>;
  deleteDocumentAsync: (documentId: number) => Promise<void>;
  getUnifiedTypes: () => Promise<any[]>;
  getLegalCategories: () => Promise<any[]>;
  getSystemStatus: () => Promise<any>;
}

export const useDocumentStore = create<DocumentState>()(
  devtools(
    persist(
      (set, get) => ({
        documents: [],
        patientDocuments: {},
        isLoading: false,
        error: null,

        setDocuments: (documents) => set({ documents }),
        addDocument: (document) => set((state) => ({
          documents: [...state.documents, document],
          patientDocuments: {
            ...state.patientDocuments,
            [document.patient_id]: [
              ...(state.patientDocuments[document.patient_id] || []),
              document
            ]
          }
        })),
        updateDocument: (id, updates) => set((state) => ({
          documents: state.documents.map(d => d.id === id ? { ...d, ...updates } : d),
          patientDocuments: Object.fromEntries(
            Object.entries(state.patientDocuments).map(([patientId, docs]) => [
              patientId,
              docs.map(d => d.id === id ? { ...d, ...updates } : d)
            ])
          )
        })),
        deleteDocument: (id) => set((state) => ({
          documents: state.documents.filter(d => d.id !== id),
          patientDocuments: Object.fromEntries(
            Object.entries(state.patientDocuments).map(([patientId, docs]) => [
              patientId,
              docs.filter(d => d.id !== id)
            ])
          )
        })),
        setPatientDocuments: (patientId, documents) => set((state) => ({
          patientDocuments: {
            ...state.patientDocuments,
            [patientId]: documents
          }
        })),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),

        // 🔥 APOLLO NUCLEAR ENHANCED METHODS - GRAPHQL INTEGRATION
        fetchDocuments: async (filters?: any) => {
          const { setLoading, setError, setDocuments } = get();
          setLoading(true);
          setError(null);

          try {
            // Use GraphQL query instead of REST
            const { data, error } = await apolloClient.query({
              query: GET_UNIFIED_DOCUMENTS,
              variables: filters,
              fetchPolicy: 'network-only'
            });

            if (error) throw error;

            const documentsArray: Document[] = (data as any)?.unifiedDocuments || [];
            setDocuments(documentsArray);
            return documentsArray;
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            return [];
          } finally {
            setLoading(false);
          }
        },

        fetchPatientDocuments: async (patientId: number) => {
          const { setLoading, setError, setPatientDocuments } = get();
          setLoading(true);
          setError(null);

          try {
            const apollo = (await import('../apollo')).default;

            const result = await apollo.docs.list({ patientId: patientId.toString() });
            const documentsArray: Document[] = result.items || [];

            setPatientDocuments(patientId, documentsArray);
            return documentsArray;
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            return [];
          } finally {
            setLoading(false);
          }
        },

        uploadDocument: async (documentData: FormData) => {
          const { setLoading, setError, addDocument } = get();
          setLoading(true);
          setError(null);

          try {
            // Use GraphQL mutation instead of REST
            const result = await apolloClient.mutate({
              mutation: UPLOAD_DOCUMENT_MUTATION,
              variables: {
                file: documentData.get('file'),
                patientId: documentData.get('patientId'),
                title: documentData.get('title'),
                description: documentData.get('description'),
                category: documentData.get('category')
              }
            });

            const newDocument = (result.data as any)?.uploadDocument;

            const mappedDocument = {
              ...(newDocument as any),
              id: parseInt((newDocument as any).id),
              patient_id: parseInt((newDocument as any).patient_id),
              uploaded_by: parseInt((newDocument as any).uploaded_by),
              file_size: parseInt((newDocument as any).file_size),
              is_encrypted: Boolean((newDocument as any).is_encrypted),
              tags: Array.isArray((newDocument as any).tags) ? (newDocument as any).tags : []
            };

            addDocument(mappedDocument);
            return mappedDocument;
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
          } finally {
            setLoading(false);
          }
        },

        downloadDocument: async (documentId: number) => {
          const { setLoading, setError } = get();
          setLoading(true);
          setError(null);

          try {
            const apollo = (await import('../apollo')).default;

            const blob = await apollo.docs.download(documentId.toString());
            return blob;
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
          } finally {
            setLoading(false);
          }
        },

        deleteDocumentAsync: async (documentId: number) => {
          const { setLoading, setError, deleteDocument } = get();
          setLoading(true);
          setError(null);

          try {
            // Use GraphQL mutation instead of REST
            await apolloClient.mutate({
              mutation: DELETE_DOCUMENT,
              variables: { documentId: documentId.toString() }
            });

            deleteDocument(documentId);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
          } finally {
            setLoading(false);
          }
        },

        getUnifiedTypes: async () => {
          const { setLoading, setError } = get();
          setLoading(true);
          setError(null);

          try {
            const apollo = (await import('../apollo')).default;

            const result = await apollo.docs.getUnifiedTypes();
            return result || [];
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            return [];
          } finally {
            setLoading(false);
          }
        },

        getLegalCategories: async () => {
          const { setLoading, setError } = get();
          setLoading(true);
          setError(null);

          try {
            const apollo = (await import('../apollo')).default;

            const result = await apollo.docs.getLegalCategories();
            return result || [];
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            return [];
          } finally {
            setLoading(false);
          }
        },

        getSystemStatus: async () => {
          const { setLoading, setError } = get();
          setLoading(true);
          setError(null);

          try {
            const apollo = (await import('../apollo')).default;

            const result = await apollo.docs.getSystemStatus();
            return result;
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
          } finally {
            setLoading(false);
          }
        }
      }),
      {
        name: 'document-store',
        partialize: (state) => ({
          patientDocuments: state.patientDocuments
        })
      }
    ),
    { name: 'document-store' }
  )
);

// Medical Record Store
interface MedicalRecordState {
  medicalRecords: MedicalRecord[];
  patientMedicalRecords: Record<string, MedicalRecord[]>;
  currentRecord: MedicalRecord | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setMedicalRecords: (records: MedicalRecord[]) => void;
  addMedicalRecord: (record: MedicalRecord) => void;
  updateMedicalRecord: (id: string, updates: Partial<MedicalRecord>) => void;
  deleteMedicalRecord: (id: string) => void;
  setPatientMedicalRecords: (patientId: string, records: MedicalRecord[]) => void;
  setCurrentRecord: (record: MedicalRecord | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 🔥 APOLLO NUCLEAR ENHANCED METHODS
  fetchMedicalRecords: (filters?: any) => Promise<MedicalRecord[]>;
  fetchPatientMedicalRecords: (patientId: string) => Promise<MedicalRecord[]>;
  createMedicalRecord: (recordData: Partial<MedicalRecord>) => Promise<MedicalRecord>;
  updateMedicalRecordAsync: (id: string, recordData: Partial<MedicalRecord>) => Promise<MedicalRecord>;
  deleteMedicalRecordAsync: (id: string) => Promise<void>;
  getMedicalRecordTimeline: (patientId: string) => MedicalRecord[];
}

export const useMedicalRecordStore = create<MedicalRecordState>()(
  devtools(
    persist(
      (set, get) => ({
        medicalRecords: [],
        patientMedicalRecords: {},
        currentRecord: null,
        isLoading: false,
        error: null,

        setMedicalRecords: (records) => set({ medicalRecords: records }),
        addMedicalRecord: (record) => set((state) => ({
          medicalRecords: [...state.medicalRecords, record],
          patientMedicalRecords: {
            ...state.patientMedicalRecords,
            [record.patient_id]: [
              ...(state.patientMedicalRecords[record.patient_id] || []),
              record
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          }
        })),
        updateMedicalRecord: (id, updates) => set((state) => ({
          medicalRecords: state.medicalRecords.map(r => r.id === id ? { ...r, ...updates } : r),
          patientMedicalRecords: Object.fromEntries(
            Object.entries(state.patientMedicalRecords).map(([patientId, records]) => [
              patientId,
              records.map(r => r.id === id ? { ...r, ...updates } : r)
            ])
          ),
          currentRecord: state.currentRecord?.id === id ? { ...state.currentRecord, ...updates } : state.currentRecord
        })),
        deleteMedicalRecord: (id) => set((state) => ({
          medicalRecords: state.medicalRecords.filter(r => r.id !== id),
          patientMedicalRecords: Object.fromEntries(
            Object.entries(state.patientMedicalRecords).map(([patientId, records]) => [
              patientId,
              records.filter(r => r.id !== id)
            ])
          ),
          currentRecord: state.currentRecord?.id === id ? null : state.currentRecord
        })),
        setPatientMedicalRecords: (patientId, records) => set((state) => ({
          patientMedicalRecords: {
            ...state.patientMedicalRecords,
            [patientId]: records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          }
        })),
        setCurrentRecord: (record) => set({ currentRecord: record }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),

        // 🔥 APOLLO NUCLEAR ENHANCED METHODS
        fetchMedicalRecords: async (filters?: any) => {
          const { setLoading, setError, setMedicalRecords } = get();
          setLoading(true);
          setError(null);

          try {
            const apollo = (await import('../apollo')).default;

            const result = await apollo.medicalRecords.list(filters);
            const recordsArray: MedicalRecord[] = (result as any).records || [];

            setMedicalRecords(recordsArray);
            return recordsArray;
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            return [];
          } finally {
            setLoading(false);
          }
        },

        fetchPatientMedicalRecords: async (patientId: string) => {
          const { setLoading, setError, setPatientMedicalRecords } = get();
          setLoading(true);
          setError(null);

          try {
            const apollo = (await import('../apollo')).default;

            const result = await (apollo as any).medicalRecords.listMedicalRecords({ patientId: patientId });
            const recordsArray: MedicalRecord[] = (result as any).records || [];

            setPatientMedicalRecords(patientId, recordsArray);
            return recordsArray;
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            return [];
          } finally {
            setLoading(false);
          }
        },

        createMedicalRecord: async (recordData: Partial<MedicalRecord>) => {
          const { setLoading, setError, addMedicalRecord } = get();
          setLoading(true);
          setError(null);

          try {
            const apollo = (await import('../apollo')).default;

            const newRecord = await apollo.medicalRecords.create(recordData);

            const mappedRecord = {
              ...(newRecord as any),
              id: (newRecord as any).id || `temp_${Date.now()}`,
              vital_signs: (newRecord as any).vital_signs || {},
              attachments: (newRecord as any).attachments || [],
              tags: Array.isArray((newRecord as any).tags) ? (newRecord as any).tags : []
            };

            addMedicalRecord(mappedRecord);
            return mappedRecord;
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
          } finally {
            setLoading(false);
          }
        },

        updateMedicalRecordAsync: async (id: string, recordData: Partial<MedicalRecord>) => {
          const { setLoading, setError, updateMedicalRecord } = get();
          setLoading(true);
          setError(null);

          try {
            const apollo = (await import('../apollo')).default;

            const updatedRecord = await apollo.medicalRecords.update(id, recordData);

            const mappedRecord = {
              ...(updatedRecord as any),
              vital_signs: (updatedRecord as any).vital_signs || {},
              attachments: (updatedRecord as any).attachments || [],
              tags: Array.isArray((updatedRecord as any).tags) ? (updatedRecord as any).tags : []
            };

            updateMedicalRecord(id, mappedRecord);
            return mappedRecord;
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
          } finally {
            setLoading(false);
          }
        },

        deleteMedicalRecordAsync: async (id: string) => {
          const { setLoading, setError, deleteMedicalRecord } = get();
          setLoading(true);
          setError(null);

          try {
            const apollo = (await import('../apollo')).default;

            await apollo.medicalRecords.delete(id);
            deleteMedicalRecord(id);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            throw err;
          } finally {
            setLoading(false);
          }
        },

        // 🎨 Computed getters
        getMedicalRecordTimeline: (patientId: string) => {
          const { patientMedicalRecords } = get();
          return (patientMedicalRecords[patientId] || []).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
      }),
      {
        name: 'medical-record-store',
        partialize: (state) => ({
          patientMedicalRecords: state.patientMedicalRecords,
          currentRecord: state.currentRecord
        })
      }
    ),
    { name: 'medical-record-store' }
  )
);

// UI State Store
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'es' | 'en';
  notifications: Notification[];
  isLoading: boolean;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setLanguage: (language: 'es' | 'en') => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        sidebarOpen: true,
        theme: 'auto',
        language: 'es',
        notifications: [],
        isLoading: false,

        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
        setTheme: (theme) => set({ theme }),
        setLanguage: (language) => set({ language }),
        addNotification: (notification) => set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, 50) // Keep last 50
        })),
        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),
        setLoading: (isLoading) => set({ isLoading })
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          sidebarOpen: state.sidebarOpen
        })
      }
    ),
    { name: 'ui-store' }
  )
);

// Apollo Nuclear Global Store
interface ApolloState {
  isOnline: boolean;
  lastSync: string | null;
  pendingChanges: any[];
  consciousness: {
    awareness: number; // 0-100
    prediction_accuracy: number; // 0-100
    auto_healing_active: boolean;
  };

  // Actions
  setOnline: (online: boolean) => void;
  setLastSync: (timestamp: string) => void;
  addPendingChange: (change: any) => void;
  clearPendingChanges: () => void;
  updateConsciousness: (updates: Partial<ApolloState['consciousness']>) => void;
}

export const useApolloStore = create<ApolloState>()(
  devtools(
    persist(
      (set, get) => ({
        isOnline: navigator.onLine,
        lastSync: null,
        pendingChanges: [],
        consciousness: {
          awareness: 85,
          prediction_accuracy: 94,
          auto_healing_active: true
        },

        setOnline: (isOnline) => set({ isOnline }),
        setLastSync: (lastSync) => set({ lastSync }),
        addPendingChange: (change) => set((state) => ({
          pendingChanges: [...state.pendingChanges, change]
        })),
        clearPendingChanges: () => set({ pendingChanges: [] }),
        updateConsciousness: (updates) => set((state) => ({
          consciousness: { ...state.consciousness, ...updates }
        }))
      }),
      {
        name: 'apollo-store',
        partialize: (state) => ({
          consciousness: state.consciousness,
          lastSync: state.lastSync
        })
      }
    ),
    { name: 'apollo-store' }
  )
);

// Export all stores
export { useClinicResourceStore } from './clinicResourceStore';
export { useFinancialStore } from './useFinancialStore';
export { useComplianceStore } from './useComplianceStore';