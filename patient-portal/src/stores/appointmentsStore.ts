import { create } from 'zustand';

// ============================================================================
// INTERFACES Y TIPOS - REAL-TIME APPOINTMENTS V3
// ============================================================================

export interface DentalAppointment {
  id: string;
  patientId: string;
  clinicId: string;
  dentistId: string;
  serviceType: 'cleaning' | 'filling' | 'extraction' | 'orthodontics' | 'checkup' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  scheduledDate: string;
  duration: number; // minutes
  price: number;
  currency: string;
  notes?: string;
  isEmergency: boolean;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentSlot {
  date: string;
  time: string;
  available: boolean;
  dentistId: string;
  clinicId: string;
}

export interface AppointmentsState {
  appointments: DentalAppointment[];
  availableSlots: AppointmentSlot[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setAppointments: (appointments: DentalAppointment[]) => void;
  addAppointment: (appointment: DentalAppointment) => void;
  updateAppointment: (id: string, updates: Partial<DentalAppointment>) => void;
  cancelAppointment: (id: string) => void;
  setAvailableSlots: (slots: AppointmentSlot[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed
  getUpcomingAppointments: () => DentalAppointment[];
  getTodayAppointments: () => DentalAppointment[];
  getAppointmentsByStatus: (status: string) => DentalAppointment[];
  getTotalUpcomingValue: () => number;
}

// ============================================================================
// ZUSTAND STORE - REAL-TIME APPOINTMENTS MANAGEMENT
// ============================================================================

export const useAppointmentsStore = create<AppointmentsState>((set, get) => ({
  appointments: [],
  availableSlots: [],
  isLoading: false,
  error: null,

  setAppointments: (appointments: DentalAppointment[]) => {
    set({
      appointments,
      isLoading: false,
      error: null,
    });
  },

  addAppointment: (appointment: DentalAppointment) => {
    set((state) => ({
      appointments: [...state.appointments, appointment],
    }));
  },

  updateAppointment: (id: string, updates: Partial<DentalAppointment>) => {
    set((state) => ({
      appointments: state.appointments.map(apt =>
        apt.id === id ? { ...apt, ...updates, updatedAt: new Date().toISOString() } : apt
      ),
    }));
  },

  cancelAppointment: (id: string) => {
    set((state) => ({
      appointments: state.appointments.map(apt =>
        apt.id === id ? { ...apt, status: 'cancelled', updatedAt: new Date().toISOString() } : apt
      ),
    }));
  },

  setAvailableSlots: (slots: AppointmentSlot[]) => {
    set({ availableSlots: slots });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error }),

  getUpcomingAppointments: () => {
    const now = new Date();
    return get().appointments
      .filter(apt => new Date(apt.scheduledDate) > now && apt.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  },

  getTodayAppointments: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return get().appointments
      .filter(apt => {
        const aptDate = new Date(apt.scheduledDate);
        return aptDate >= today && aptDate < tomorrow;
      })
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  },

  getAppointmentsByStatus: (status: string) => {
    return get().appointments.filter(apt => apt.status === status);
  },

  getTotalUpcomingValue: () => {
    return get().getUpcomingAppointments().reduce((total, apt) => total + apt.price, 0);
  },
}));

// ============================================================================
// APPOINTMENT SERVICE TYPES - TITAN V3 CATALOG
// ============================================================================

export const APPOINTMENT_TYPES = [
  {
    id: 'cleaning',
    name: 'Limpieza Dental',
    duration: 60,
    basePrice: 150,
    description: 'Limpieza profesional y profilaxis dental',
    color: 'neon-cyan',
  },
  {
    id: 'checkup',
    name: 'Control General',
    duration: 30,
    basePrice: 100,
    description: 'Revisión general y diagnóstico',
    color: 'neon-blue',
  },
  {
    id: 'filling',
    name: 'Obturación',
    duration: 45,
    basePrice: 200,
    description: 'Restauración dental con composite',
    color: 'neon-green',
  },
  {
    id: 'extraction',
    name: 'Extracción',
    duration: 30,
    basePrice: 180,
    description: 'Extracción dental simple',
    color: 'neon-red',
  },
  {
    id: 'orthodontics',
    name: 'Ortodoncia',
    duration: 90,
    basePrice: 350,
    description: 'Consulta de ortodoncia especializada',
    color: 'neon-purple',
  },
  {
    id: 'emergency',
    name: 'Emergencia',
    duration: 60,
    basePrice: 250,
    description: 'Atención dental de urgencia',
    color: 'neon-pink',
  },
];

// ============================================================================
// REAL-TIME SUBSCRIPTION QUERIES - GRAPHQL INTEGRATION
// ============================================================================

export const APPOINTMENT_SUBSCRIPTION = `
  subscription OnAppointmentUpdate($patientId: ID!) {
    appointmentUpdate(patientId: $patientId) {
      id
      status
      scheduledDate
      updatedAt
      notes
    }
  }
`;

export const AVAILABLE_SLOTS_QUERY = `
  query GetAvailableSlots($clinicId: ID!, $dentistId: ID, $date: Date!) {
    availableSlots(clinicId: $clinicId, dentistId: $dentistId, date: $date) {
      date
      time
      available
      dentistId
      clinicId
    }
  }
`;

export const CREATE_APPOINTMENT_MUTATION = `
  mutation CreateAppointment($input: CreateAppointmentInput!) {
    createAppointment(input: $input) {
      id
      patientId
      clinicId
      dentistId
      serviceType
      status
      scheduledDate
      duration
      price
      currency
      notes
      isEmergency
      createdAt
    }
  }
`;

export const UPDATE_APPOINTMENT_MUTATION = `
  mutation UpdateAppointment($id: ID!, $input: UpdateAppointmentInput!) {
    updateAppointment(id: $id, input: $input) {
      id
      status
      notes
      updatedAt
    }
  }
`;