// 🔥 APOLLO NUCLEAR TYPES - CLINIC RESOURCE MANAGEMENT
// Date: September 22, 2025
// Mission: TypeScript Interfaces for Clinic Resource System
// Target: ClinicResourceManagerV3 Type Safety

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

export enum TreatmentRoomType {
  GENERAL = 'GENERAL',
  SURGERY = 'SURGERY',
  ORTHODONTICS = 'ORTHODONTICS',
  PEDIATRICS = 'PEDIATRICS',
  COSMETIC = 'COSMETIC',
  EMERGENCY = 'EMERGENCY'
}

export enum TreatmentRoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  CLEANING = 'CLEANING',
  OUT_OF_ORDER = 'OUT_OF_ORDER'
}

export enum DentalEquipmentType {
  XRAY_MACHINE = 'XRAY_MACHINE',
  ULTRASOUND = 'ULTRASOUND',
  LASER = 'LASER',
  SCALER = 'SCALER',
  DRILL = 'DRILL',
  LIGHT = 'LIGHT',
  STERILIZER = 'STERILIZER',
  SUCTION = 'SUCTION',
  COMPRESSOR = 'COMPRESSOR',
  MONITOR = 'MONITOR',
  CHAIR = 'CHAIR',
  INSTRUMENT = 'INSTRUMENT'
}

export enum DentalEquipmentStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_ORDER = 'OUT_OF_ORDER',
  DEPRECATED = 'DEPRECATED',
  DISPOSED = 'DISPOSED'
}

export enum MaintenanceType {
  ROUTINE = 'ROUTINE',
  REPAIR = 'REPAIR',
  CALIBRATION = 'CALIBRATION',
  SOFTWARE_UPDATE = 'SOFTWARE_UPDATE',
  HARDWARE_REPLACEMENT = 'HARDWARE_REPLACEMENT'
}

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE'
}

export enum CleaningType {
  DAILY = 'DAILY',
  DEEP = 'DEEP',
  STERILIZATION = 'STERILIZATION',
  DISINFECTION = 'DISINFECTION'
}

export enum CleaningStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE'
}

// ============================================================================
// TREATMENT ROOM INTERFACES
// ============================================================================

export interface TreatmentRoom {
  id: string;
  name: string;
  roomNumber: string;
  type: TreatmentRoomType;
  status: TreatmentRoomStatus;
  capacity: number;
  equipment: DentalEquipment[];
  isActive: boolean;
  lastCleaning?: Date;
  nextCleaningDue?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TreatmentRoomFilters {
  type?: TreatmentRoomType;
  status?: TreatmentRoomStatus;
  isActive?: boolean;
  search?: string;
}

export interface TreatmentRoomCreateInput {
  name: string;
  roomNumber: string;
  type: TreatmentRoomType;
  capacity: number;
  notes?: string;
}

export interface TreatmentRoomUpdateInput {
  name?: string;
  roomNumber?: string;
  type?: TreatmentRoomType;
  status?: TreatmentRoomStatus;
  capacity?: number;
  isActive?: boolean;
  lastCleaning?: Date;
  nextCleaningDue?: Date;
  notes?: string;
}

export interface RoomCleaningUpdateInput {
  lastCleaning: Date;
  nextCleaningDue: Date;
  notes?: string;
}

// ============================================================================
// DENTAL EQUIPMENT INTERFACES
// ============================================================================

export interface DentalEquipment {
  id: string;
  name: string;
  type: DentalEquipmentType;
  status: DentalEquipmentStatus;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  warrantyExpiry?: Date;
  lastMaintenance?: Date;
  nextMaintenanceDue?: Date;
  location: string;
  assignedRoomId?: string;
  assignedRoom?: {
    id: string;
    name: string;
    roomNumber: string;
  };
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DentalEquipmentFilters {
  type?: DentalEquipmentType;
  status?: DentalEquipmentStatus;
  assignedRoomId?: string;
  isActive?: boolean;
  search?: string;
  maintenanceOverdue?: boolean;
}

export interface DentalEquipmentCreateInput {
  name: string;
  type: DentalEquipmentType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  warrantyExpiry?: Date;
  location: string;
  assignedRoomId?: string;
  notes?: string;
}

export interface DentalEquipmentUpdateInput {
  name?: string;
  type?: DentalEquipmentType;
  status?: DentalEquipmentStatus;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  lastMaintenance?: Date;
  nextMaintenanceDue?: Date;
  location?: string;
  assignedRoomId?: string;
  isActive?: boolean;
  notes?: string;
}

export interface EquipmentMaintenanceUpdateInput {
  lastMaintenance: Date;
  nextMaintenanceDue: Date;
  status: DentalEquipmentStatus;
  notes?: string;
}

// ============================================================================
// MAINTENANCE INTERFACES
// ============================================================================

export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  equipment: {
    id: string;
    name: string;
    type: DentalEquipmentType;
    manufacturer: string;
    model: string;
  };
  scheduledDate: Date;
  completedDate?: Date;
  maintenanceType: MaintenanceType;
  description: string;
  technician?: string;
  cost?: number;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceFilters {
  equipmentId?: string;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  overdue?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface MaintenanceScheduleInput {
  equipmentId: string;
  scheduledDate: Date;
  maintenanceType: MaintenanceType;
  description: string;
  technician?: string;
  priority: MaintenancePriority;
  notes?: string;
}

export interface MaintenanceCompletionInput {
  completedDate: Date;
  cost?: number;
  notes?: string;
}

// ============================================================================
// ROOM CLEANING INTERFACES
// ============================================================================

export interface RoomCleaningSchedule {
  id: string;
  roomId: string;
  room: {
    id: string;
    name: string;
    roomNumber: string;
  };
  scheduledDate: Date;
  completedDate?: Date;
  cleaningType: CleaningType;
  staffMember?: string;
  status: CleaningStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CleaningFilters {
  roomId?: string;
  status?: CleaningStatus;
  overdue?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface RoomCleaningScheduleInput {
  roomId: string;
  scheduledDate: Date;
  cleaningType: CleaningType;
  notes?: string;
}

export interface RoomCleaningCompletionInput {
  completedDate: Date;
  staffMember: string;
  notes?: string;
}

// ============================================================================
// ANALYTICS INTERFACES
// ============================================================================

export interface ClinicResourceStats {
  totalRooms: number;
  activeRooms: number;
  totalEquipment: number;
  activeEquipment: number;
  maintenanceOverdue: number;
  cleaningOverdue: number;
  equipmentUtilization: number;
  roomUtilization: number;
  maintenanceCosts: number;
  equipmentAges: {
    average: number;
    oldest: number;
    newest: number;
  };
}

export interface ResourceUtilization {
  date: Date;
  roomUtilization: {
    roomId: string;
    roomName: string;
    utilizationPercentage: number;
    totalAppointments: number;
    averageDuration: number;
  }[];
  equipmentUtilization: {
    equipmentId: string;
    equipmentName: string;
    utilizationHours: number;
    maintenanceHours: number;
    downtimeHours: number;
  }[];
}

// ============================================================================
// STORE INTERFACES
// ============================================================================

export interface ClinicResourceState {
  // Treatment Rooms
  treatmentRooms: TreatmentRoom[];
  selectedRoom: TreatmentRoom | null;
  roomFilters: TreatmentRoomFilters;

  // Dental Equipment
  dentalEquipment: DentalEquipment[];
  selectedEquipment: DentalEquipment | null;
  equipmentFilters: DentalEquipmentFilters;

  // Maintenance
  maintenanceSchedule: MaintenanceSchedule[];
  cleaningSchedule: RoomCleaningSchedule[];

  // Analytics
  stats: ClinicResourceStats | null;
  utilization: ResourceUtilization[];

  // UI State
  loading: boolean;
  error: string | null;
  activeTab: 'rooms' | 'equipment' | 'maintenance' | 'analytics';

  // Actions
  setActiveTab: (tab: 'rooms' | 'equipment' | 'maintenance' | 'analytics') => void;
  setRoomFilters: (filters: TreatmentRoomFilters) => void;
  setEquipmentFilters: (filters: DentalEquipmentFilters) => void;
  selectRoom: (room: TreatmentRoom | null) => void;
  selectEquipment: (equipment: DentalEquipment | null) => void;

  // Data Operations
  loadTreatmentRooms: () => Promise<void>;
  loadDentalEquipment: () => Promise<void>;
  loadMaintenanceSchedule: () => Promise<void>;
  loadCleaningSchedule: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadUtilization: (startDate: Date, endDate: Date) => Promise<void>;

  // CRUD Operations - Rooms
  createTreatmentRoom: (input: TreatmentRoomCreateInput) => Promise<TreatmentRoom>;
  updateTreatmentRoom: (id: string, input: TreatmentRoomUpdateInput) => Promise<TreatmentRoom>;
  deleteTreatmentRoom: (id: string) => Promise<void>;
  updateRoomCleaning: (id: string, data: RoomCleaningUpdateInput) => Promise<void>;

  // CRUD Operations - Equipment
  createDentalEquipment: (input: DentalEquipmentCreateInput) => Promise<DentalEquipment>;
  updateDentalEquipment: (id: string, input: DentalEquipmentUpdateInput) => Promise<DentalEquipment>;
  deleteDentalEquipment: (id: string) => Promise<void>;
  assignEquipmentToRoom: (equipmentId: string, roomId: string | null) => Promise<void>;
  updateEquipmentMaintenance: (id: string, data: EquipmentMaintenanceUpdateInput) => Promise<void>;

  // Maintenance Operations
  scheduleMaintenance: (input: MaintenanceScheduleInput) => Promise<MaintenanceSchedule>;
  completeMaintenance: (id: string, data: MaintenanceCompletionInput) => Promise<void>;
  scheduleRoomCleaning: (input: RoomCleaningScheduleInput) => Promise<RoomCleaningSchedule>;
  completeRoomCleaning: (id: string, data: RoomCleaningCompletionInput) => Promise<void>;
}
