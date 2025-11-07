//  APOLLO NUCLEAR ZUSTAND STORE - CLINIC RESOURCE MANAGEMENT
// Date: September 22, 2025
// Mission: Zustand Store for Clinic Resource State Management
// Target: ClinicResourceManagerV3 Integration with GraphQL

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import apolloClient from '../apollo/graphql-client';
import {
  GET_TREATMENT_ROOMS,
  GET_DENTAL_EQUIPMENT,
  GET_MAINTENANCE_SCHEDULE,
  GET_ROOM_CLEANING_SCHEDULE,
  GET_CLINIC_RESOURCE_STATS,
  GET_RESOURCE_UTILIZATION,
  CREATE_TREATMENT_ROOM,
  UPDATE_TREATMENT_ROOM,
  DELETE_TREATMENT_ROOM,
  UPDATE_ROOM_CLEANING,
  CREATE_DENTAL_EQUIPMENT,
  UPDATE_DENTAL_EQUIPMENT,
  DELETE_DENTAL_EQUIPMENT,
  ASSIGN_EQUIPMENT_TO_ROOM,
  UPDATE_EQUIPMENT_MAINTENANCE,
  SCHEDULE_MAINTENANCE,
  COMPLETE_MAINTENANCE,
  SCHEDULE_ROOM_CLEANING,
  COMPLETE_ROOM_CLEANING
} from '../graphql/queries/clinicResources';
import {
  ClinicResourceState,
  TreatmentRoom,
  DentalEquipment,
  TreatmentRoomFilters,
  DentalEquipmentFilters,
  TreatmentRoomCreateInput,
  TreatmentRoomUpdateInput,
  RoomCleaningUpdateInput,
  DentalEquipmentCreateInput,
  DentalEquipmentUpdateInput,
  EquipmentMaintenanceUpdateInput,
  MaintenanceScheduleInput,
  MaintenanceCompletionInput,
  RoomCleaningScheduleInput,
  RoomCleaningCompletionInput,
  MaintenanceSchedule,
  RoomCleaningSchedule,
  ClinicResourceStats,
  ResourceUtilization
} from '../types/clinicResourceTypes';
import { createModuleLogger } from '../utils/logger';

const l = createModuleLogger('useClinicResourceStore');

export const useClinicResourceStore = create<ClinicResourceState>()(
  devtools(
    persist(
      (set, get) => ({
        // ============================================================================
        // INITIAL STATE
        // ============================================================================
        treatmentRooms: [],
        selectedRoom: null,
        roomFilters: {},
        dentalEquipment: [],
        selectedEquipment: null,
        equipmentFilters: {},
        maintenanceSchedule: [],
        cleaningSchedule: [],
        stats: null,
        utilization: [],
        loading: false,
        error: null,
        activeTab: 'rooms',

        // ============================================================================
        // UI STATE ACTIONS
        // ============================================================================
        setActiveTab: (tab: 'rooms' | 'equipment' | 'maintenance' | 'analytics') => set({ activeTab: tab }),
        setRoomFilters: (filters: TreatmentRoomFilters) => set({ roomFilters: filters }),
        setEquipmentFilters: (filters: DentalEquipmentFilters) => set({ equipmentFilters: filters }),
        selectRoom: (room: TreatmentRoom | null) => set({ selectedRoom: room }),
        selectEquipment: (equipment: DentalEquipment | null) => set({ selectedEquipment: equipment }),

        // ============================================================================
        // DATA LOADING ACTIONS
        // ============================================================================
        loadTreatmentRooms: async () => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Loading treatment rooms');
            const { data } = await apolloClient.query({
              query: GET_TREATMENT_ROOMS,
              variables: { filters: get().roomFilters },
              fetchPolicy: 'network-only'
            });
            const responseData = data as any;
            set({
              treatmentRooms: responseData.treatmentRooms || [],
              loading: false
            });
            l.info && l.info(`Loaded ${responseData.treatmentRooms?.length || 0} treatment rooms`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load treatment rooms';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
          }
        },

        loadDentalEquipment: async () => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Loading dental equipment');
            const { data } = await apolloClient.query({
              query: GET_DENTAL_EQUIPMENT,
              variables: { filters: get().equipmentFilters },
              fetchPolicy: 'network-only'
            });
            const responseData = data as any;
            set({
              dentalEquipment: responseData.dentalEquipment || [],
              loading: false
            });
            l.info && l.info(`Loaded ${responseData.dentalEquipment?.length || 0} dental equipment items`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load dental equipment';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
          }
        },

        loadMaintenanceSchedule: async () => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Loading maintenance schedule');
            const { data } = await apolloClient.query({
              query: GET_MAINTENANCE_SCHEDULE,
              fetchPolicy: 'network-only'
            });
            const responseData = data as any;
            set({
              maintenanceSchedule: responseData.maintenanceSchedule || [],
              loading: false
            });
            l.info && l.info(`Loaded ${responseData.maintenanceSchedule?.length || 0} maintenance items`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load maintenance schedule';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
          }
        },

        loadCleaningSchedule: async () => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Loading cleaning schedule');
            const { data } = await apolloClient.query({
              query: GET_ROOM_CLEANING_SCHEDULE,
              fetchPolicy: 'network-only'
            });
            const responseData = data as any;
            set({
              cleaningSchedule: responseData.roomCleaningSchedule || [],
              loading: false
            });
            l.info && l.info(`Loaded ${responseData.roomCleaningSchedule?.length || 0} cleaning items`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load cleaning schedule';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
          }
        },

        loadStats: async () => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Loading clinic resource stats');
            const { data } = await apolloClient.query({
              query: GET_CLINIC_RESOURCE_STATS,
              fetchPolicy: 'network-only'
            });
            const responseData = data as any;
            set({
              stats: responseData.clinicResourceStats,
              loading: false
            });
            l.info && l.info('Loaded clinic resource stats');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load clinic resource stats';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
          }
        },

        loadUtilization: async (startDate: Date, endDate: Date) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Loading resource utilization data');
            const { data } = await apolloClient.query({
              query: GET_RESOURCE_UTILIZATION,
              variables: { startDate, endDate },
              fetchPolicy: 'network-only'
            });
            const responseData = data as any;
            set({
              utilization: responseData.resourceUtilization || [],
              loading: false
            });
            l.info && l.info(`Loaded utilization data for ${responseData.resourceUtilization?.length || 0} days`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load resource utilization';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
          }
        },

        // ============================================================================
        // TREATMENT ROOM CRUD OPERATIONS
        // ============================================================================
        createTreatmentRoom: async (input: TreatmentRoomCreateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Creating treatment room', { input });
            const { data } = await apolloClient.mutate({
              mutation: CREATE_TREATMENT_ROOM,
              variables: { input }
            });
            const responseData = data as any;
            const newRoom = responseData.createTreatmentRoom;
            set(state => ({
              treatmentRooms: [...state.treatmentRooms, newRoom],
              loading: false
            }));
            l.info && l.info('Treatment room created successfully', { roomId: newRoom.id });
            return newRoom;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create treatment room';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        updateTreatmentRoom: async (id: string, input: TreatmentRoomUpdateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Updating treatment room', { id, input });
            const { data } = await apolloClient.mutate({
              mutation: UPDATE_TREATMENT_ROOM,
              variables: { id, input }
            });
            const responseData = data as any;
            const updatedRoom = responseData.updateTreatmentRoom;
            set(state => ({
              treatmentRooms: state.treatmentRooms.map(room =>
                room.id === id ? updatedRoom : room
              ),
              selectedRoom: state.selectedRoom?.id === id ? updatedRoom : state.selectedRoom,
              loading: false
            }));
            l.info && l.info('Treatment room updated successfully', { roomId: id });
            return updatedRoom;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update treatment room';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        deleteTreatmentRoom: async (id: string) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Deleting treatment room', { id });
            await apolloClient.mutate({
              mutation: DELETE_TREATMENT_ROOM,
              variables: { id }
            });
            set(state => ({
              treatmentRooms: state.treatmentRooms.filter(room => room.id !== id),
              selectedRoom: state.selectedRoom?.id === id ? null : state.selectedRoom,
              loading: false
            }));
            l.info && l.info('Treatment room deleted successfully', { roomId: id });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete treatment room';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        updateRoomCleaning: async (id: string, data: RoomCleaningUpdateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Updating room cleaning', { id, data });
            const result = await apolloClient.mutate({
              mutation: UPDATE_ROOM_CLEANING,
              variables: { id, cleaningData: data }
            });
            // Reload cleaning schedule to get updated data
            await get().loadCleaningSchedule();
            set({ loading: false });
            l.info && l.info('Room cleaning updated successfully', { roomId: id });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update room cleaning';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        // ============================================================================
        // DENTAL EQUIPMENT CRUD OPERATIONS
        // ============================================================================
        createDentalEquipment: async (input: DentalEquipmentCreateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Creating dental equipment', { input });
            const { data } = await apolloClient.mutate({
              mutation: CREATE_DENTAL_EQUIPMENT,
              variables: { input }
            });
            const responseData = data as any;
            const newEquipment = responseData.createDentalEquipment;
            set(state => ({
              dentalEquipment: [...state.dentalEquipment, newEquipment],
              loading: false
            }));
            l.info && l.info('Dental equipment created successfully', { equipmentId: newEquipment.id });
            return newEquipment;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create dental equipment';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        updateDentalEquipment: async (id: string, input: DentalEquipmentUpdateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Updating dental equipment', { id, input });
            const { data } = await apolloClient.mutate({
              mutation: UPDATE_DENTAL_EQUIPMENT,
              variables: { id, input }
            });
            const responseData = data as any;
            const updatedEquipment = responseData.updateDentalEquipment;
            set(state => ({
              dentalEquipment: state.dentalEquipment.map(equipment =>
                equipment.id === id ? updatedEquipment : equipment
              ),
              selectedEquipment: state.selectedEquipment?.id === id ? updatedEquipment : state.selectedEquipment,
              loading: false
            }));
            l.info && l.info('Dental equipment updated successfully', { equipmentId: id });
            return updatedEquipment;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update dental equipment';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        deleteDentalEquipment: async (id: string) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Deleting dental equipment', { id });
            await apolloClient.mutate({
              mutation: DELETE_DENTAL_EQUIPMENT,
              variables: { id }
            });
            set(state => ({
              dentalEquipment: state.dentalEquipment.filter(equipment => equipment.id !== id),
              selectedEquipment: state.selectedEquipment?.id === id ? null : state.selectedEquipment,
              loading: false
            }));
            l.info && l.info('Dental equipment deleted successfully', { equipmentId: id });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete dental equipment';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        assignEquipmentToRoom: async (equipmentId: string, roomId: string | null) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Assigning equipment to room', { equipmentId, roomId });
            const { data } = await apolloClient.mutate({
              mutation: ASSIGN_EQUIPMENT_TO_ROOM,
              variables: { equipmentId, roomId }
            });
            const responseData = data as any;
            const updatedEquipment = responseData.assignEquipmentToRoom;
            set(state => ({
              dentalEquipment: state.dentalEquipment.map(equipment =>
                equipment.id === equipmentId ? { ...equipment, ...updatedEquipment } : equipment
              ),
              selectedEquipment: state.selectedEquipment?.id === equipmentId
                ? { ...state.selectedEquipment, ...updatedEquipment }
                : state.selectedEquipment,
              loading: false
            }));
            l.info && l.info('Equipment assigned to room successfully', { equipmentId, roomId });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to assign equipment to room';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        updateEquipmentMaintenance: async (id: string, data: EquipmentMaintenanceUpdateInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Updating equipment maintenance', { id, data });
            const result = await apolloClient.mutate({
              mutation: UPDATE_EQUIPMENT_MAINTENANCE,
              variables: { id, maintenanceData: data }
            });
            // Reload maintenance schedule to get updated data
            await get().loadMaintenanceSchedule();
            set({ loading: false });
            l.info && l.info('Equipment maintenance updated successfully', { equipmentId: id });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update equipment maintenance';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        // ============================================================================
        // MAINTENANCE OPERATIONS
        // ============================================================================
        scheduleMaintenance: async (input: MaintenanceScheduleInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Scheduling maintenance', { input });
            const { data } = await apolloClient.mutate({
              mutation: SCHEDULE_MAINTENANCE,
              variables: { input }
            });
            const responseData = data as any;
            const newMaintenance = responseData.scheduleMaintenance;
            set(state => ({
              maintenanceSchedule: [...state.maintenanceSchedule, newMaintenance],
              loading: false
            }));
            l.info && l.info('Maintenance scheduled successfully', { maintenanceId: newMaintenance.id });
            return newMaintenance;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to schedule maintenance';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        completeMaintenance: async (id: string, data: MaintenanceCompletionInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Completing maintenance', { id, data });
            const result = await apolloClient.mutate({
              mutation: COMPLETE_MAINTENANCE,
              variables: { id, completionData: data }
            });
            // Reload maintenance schedule to get updated data
            await get().loadMaintenanceSchedule();
            set({ loading: false });
            l.info && l.info('Maintenance completed successfully', { maintenanceId: id });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to complete maintenance';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        scheduleRoomCleaning: async (input: RoomCleaningScheduleInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Scheduling room cleaning', { input });
            const { data } = await apolloClient.mutate({
              mutation: SCHEDULE_ROOM_CLEANING,
              variables: { input }
            });
            const responseData = data as any;
            const newCleaning = responseData.scheduleRoomCleaning;
            set(state => ({
              cleaningSchedule: [...state.cleaningSchedule, newCleaning],
              loading: false
            }));
            l.info && l.info('Room cleaning scheduled successfully', { cleaningId: newCleaning.id });
            return newCleaning;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to schedule room cleaning';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        },

        completeRoomCleaning: async (id: string, data: RoomCleaningCompletionInput) => {
          try {
            set({ loading: true, error: null });
            l.info && l.info('Completing room cleaning', { id, data });
            const result = await apolloClient.mutate({
              mutation: COMPLETE_ROOM_CLEANING,
              variables: { id, completionData: data }
            });
            // Reload cleaning schedule to get updated data
            await get().loadCleaningSchedule();
            set({ loading: false });
            l.info && l.info('Room cleaning completed successfully', { cleaningId: id });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to complete room cleaning';
            l.error && l.error(errorMessage);
            set({ error: errorMessage, loading: false });
            throw error;
          }
        }
      }),
      {
        name: 'clinic-resource-store',
        partialize: (state) => ({
          activeTab: state.activeTab,
          roomFilters: state.roomFilters,
          equipmentFilters: state.equipmentFilters
        })
      }
    ),
    {
      name: 'clinic-resource-store'
    }
  )
);

