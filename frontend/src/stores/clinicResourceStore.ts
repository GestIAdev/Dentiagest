// 🏥 APOLLO CLINIC RESOURCE MANAGEMENT STORE
// Zustand Store for Complete Resource Optimization
// Date: September 22, 2025

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  TreatmentRoom,
  DentalEquipment,
  MaintenanceSchedule,
  RoomBooking,
  ResourceUtilization,
  ResourceConflict,
  ResourceRecommendation
} from '../types/ClinicResourceManagement';

// Types for the store
interface ClinicResourceState {
  // State
  treatmentRooms: TreatmentRoom[];
  dentalEquipment: DentalEquipment[];
  maintenanceSchedules: MaintenanceSchedule[];
  roomBookings: RoomBooking[];
  isLoading: boolean;
  error: string | null;
  selectedRoom: TreatmentRoom | null;
  selectedEquipment: DentalEquipment | null;

  // Analytics
  utilizationMetrics: ResourceUtilization | null;
  activeConflicts: ResourceConflict[];
  recommendations: ResourceRecommendation[];

  // UI State
  viewMode: 'grid' | 'list' | 'timeline';
  filterStatus: string[];
  searchQuery: string;

  // Actions - Rooms
  setTreatmentRooms: (rooms: TreatmentRoom[]) => void;
  addTreatmentRoom: (room: TreatmentRoom) => void;
  updateTreatmentRoom: (id: string, updates: Partial<TreatmentRoom>) => void;
  deleteTreatmentRoom: (id: string) => void;
  setSelectedRoom: (room: TreatmentRoom | null) => void;

  // Actions - Equipment
  setDentalEquipment: (equipment: DentalEquipment[]) => void;
  addDentalEquipment: (equipment: DentalEquipment) => void;
  updateDentalEquipment: (id: string, updates: Partial<DentalEquipment>) => void;
  deleteDentalEquipment: (id: string) => void;
  setSelectedEquipment: (equipment: DentalEquipment | null) => void;

  // Actions - Maintenance
  setMaintenanceSchedules: (schedules: MaintenanceSchedule[]) => void;
  addMaintenanceSchedule: (schedule: MaintenanceSchedule) => void;
  updateMaintenanceSchedule: (id: string, updates: Partial<MaintenanceSchedule>) => void;
  completeMaintenance: (id: string, notes?: string) => void;

  // Actions - Bookings
  setRoomBookings: (bookings: RoomBooking[]) => void;
  addRoomBooking: (booking: RoomBooking) => void;
  updateRoomBooking: (id: string, updates: Partial<RoomBooking>) => void;
  cancelRoomBooking: (id: string) => void;

  // Analytics Actions
  setUtilizationMetrics: (metrics: ResourceUtilization) => void;
  setActiveConflicts: (conflicts: ResourceConflict[]) => void;
  setRecommendations: (recommendations: ResourceRecommendation[]) => void;

  // UI Actions
  setViewMode: (mode: 'grid' | 'list' | 'timeline') => void;
  setFilterStatus: (status: string[]) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed getters
  getAvailableRooms: () => TreatmentRoom[];
  getOperationalEquipment: () => DentalEquipment[];
  getOverdueMaintenance: () => MaintenanceSchedule[];
  getRoomUtilization: (roomId: string) => number;
  getEquipmentUtilization: (equipmentId: string) => number;
}

export const useClinicResourceStore = create<ClinicResourceState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        treatmentRooms: [],
        dentalEquipment: [],
        maintenanceSchedules: [],
        roomBookings: [],
        isLoading: false,
        error: null,
        selectedRoom: null,
        selectedEquipment: null,
        utilizationMetrics: null,
        activeConflicts: [],
        recommendations: [],
        viewMode: 'grid',
        filterStatus: [],
        searchQuery: '',

        // Room actions
        setTreatmentRooms: (rooms) => set({ treatmentRooms: rooms }),
        addTreatmentRoom: (room) => set((state) => ({
          treatmentRooms: [...state.treatmentRooms, room]
        })),
        updateTreatmentRoom: (id, updates) => set((state) => ({
          treatmentRooms: state.treatmentRooms.map(room =>
            room.id === id ? { ...room, ...updates } : room
          ),
          selectedRoom: state.selectedRoom?.id === id
            ? { ...state.selectedRoom, ...updates }
            : state.selectedRoom
        })),
        deleteTreatmentRoom: (id) => set((state) => ({
          treatmentRooms: state.treatmentRooms.filter(room => room.id !== id),
          selectedRoom: state.selectedRoom?.id === id ? null : state.selectedRoom
        })),
        setSelectedRoom: (room) => set({ selectedRoom: room }),

        // Equipment actions
        setDentalEquipment: (equipment) => set({ dentalEquipment: equipment }),
        addDentalEquipment: (equipment) => set((state) => ({
          dentalEquipment: [...state.dentalEquipment, equipment]
        })),
        updateDentalEquipment: (id, updates) => set((state) => ({
          dentalEquipment: state.dentalEquipment.map(eq =>
            eq.id === id ? { ...eq, ...updates } : eq
          ),
          selectedEquipment: state.selectedEquipment?.id === id
            ? { ...state.selectedEquipment, ...updates }
            : state.selectedEquipment
        })),
        deleteDentalEquipment: (id) => set((state) => ({
          dentalEquipment: state.dentalEquipment.filter(eq => eq.id !== id),
          selectedEquipment: state.selectedEquipment?.id === id ? null : state.selectedEquipment
        })),
        setSelectedEquipment: (equipment) => set({ selectedEquipment: equipment }),

        // Maintenance actions
        setMaintenanceSchedules: (schedules) => set({ maintenanceSchedules: schedules }),
        addMaintenanceSchedule: (schedule) => set((state) => ({
          maintenanceSchedules: [...state.maintenanceSchedules, schedule]
        })),
        updateMaintenanceSchedule: (id, updates) => set((state) => ({
          maintenanceSchedules: state.maintenanceSchedules.map(schedule =>
            schedule.id === id ? { ...schedule, ...updates } : schedule
          )
        })),
        completeMaintenance: (id, notes) => set((state) => ({
          maintenanceSchedules: state.maintenanceSchedules.map(schedule =>
            schedule.id === id
              ? {
                  ...schedule,
                  status: 'completed' as const,
                  notes: notes || schedule.notes,
                  lastPerformed: new Date()
                }
              : schedule
          )
        })),

        // Booking actions
        setRoomBookings: (bookings) => set({ roomBookings: bookings }),
        addRoomBooking: (booking) => set((state) => ({
          roomBookings: [...state.roomBookings, booking]
        })),
        updateRoomBooking: (id, updates) => set((state) => ({
          roomBookings: state.roomBookings.map(booking =>
            booking.id === id ? { ...booking, ...updates } : booking
          )
        })),
        cancelRoomBooking: (id) => set((state) => ({
          roomBookings: state.roomBookings.map(booking =>
            booking.id === id
              ? { ...booking, status: 'cancelled' as const }
              : booking
          )
        })),

        // Analytics actions
        setUtilizationMetrics: (metrics) => set({ utilizationMetrics: metrics }),
        setActiveConflicts: (conflicts) => set({ activeConflicts: conflicts }),
        setRecommendations: (recommendations) => set({ recommendations }),

        // UI actions
        setViewMode: (viewMode) => set({ viewMode }),
        setFilterStatus: (filterStatus) => set({ filterStatus }),
        setSearchQuery: (searchQuery) => set({ searchQuery }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),

        // Computed getters
        getAvailableRooms: () => {
          const state = get();
          return state.treatmentRooms.filter(room => room.status === 'available');
        },

        getOperationalEquipment: () => {
          const state = get();
          return state.dentalEquipment.filter(eq => eq.status === 'operational');
        },

        getOverdueMaintenance: () => {
          const state = get();
          const now = new Date();
          return state.maintenanceSchedules.filter(schedule =>
            schedule.status === 'overdue' ||
            (schedule.nextDue < now && schedule.status === 'scheduled')
          );
        },

        getRoomUtilization: (roomId) => {
          const state = get();
          const room = state.treatmentRooms.find(r => r.id === roomId);
          return room?.utilizationRate || 0;
        },

        getEquipmentUtilization: (equipmentId) => {
          const state = get();
          const equipment = state.dentalEquipment.find(e => e.id === equipmentId);
          return equipment?.utilizationRate || 0;
        }
      }),
      {
        name: 'clinic-resource-store',
        partialize: (state) => ({
          treatmentRooms: state.treatmentRooms,
          dentalEquipment: state.dentalEquipment,
          viewMode: state.viewMode,
          filterStatus: state.filterStatus
        })
      }
    ),
    { name: 'clinic-resource-store' }
  )
);