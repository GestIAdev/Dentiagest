// 🚀 APOLLO CLINIC RESOURCE MANAGEMENT
// By PunkClaude & RaulVisionario - September 19, 2025
// MISSION: Complete clinic resource optimization and management

interface EquipmentConfig {
  maxUsage: number;
  requiresCalibration: boolean;
  costPerHour: number;
}

export const EQUIPMENT_TYPES = {
  chair: { maxUsage: 100, requiresCalibration: false, costPerHour: 25 },
  xray: { maxUsage: 50, requiresCalibration: true, costPerHour: 75 },
  scaler: { maxUsage: 200, requiresCalibration: false, costPerHour: 15 },
  drill: { maxUsage: 150, requiresCalibration: true, costPerHour: 35 },
  light: { maxUsage: 300, requiresCalibration: false, costPerHour: 10 },
  suction: { maxUsage: 400, requiresCalibration: false, costPerHour: 5 },
  sterilizer: { maxUsage: 100, requiresCalibration: true, costPerHour: 20 },
  scanner: { maxUsage: 80, requiresCalibration: true, costPerHour: 50 },
  laser: { maxUsage: 30, requiresCalibration: true, costPerHour: 100 },
  microscope: { maxUsage: 60, requiresCalibration: false, costPerHour: 40 }
} as const satisfies Record<string, EquipmentConfig>;

export type EquipmentType = keyof typeof EQUIPMENT_TYPES;

export interface TreatmentRoom {
  id: string;
  name: string;
  type: 'general' | 'surgical' | 'orthodontic' | 'pediatric' | 'cosmetic' | 'emergency';
  capacity: number; // Max patients simultaneously
  equipment: DentalEquipment[];
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'out_of_order';
  currentOccupancy: number;
  location: {
    floor: number;
    wing: string;
    roomNumber: string;
  };
  features: RoomFeature[];
  maintenanceSchedule: MaintenanceSchedule[];
  utilizationRate: number; // 0-100
  lastCleaned: Date;
  nextCleaningDue: Date;
  bookingSchedule: RoomBooking[];
}

export interface DentalEquipment {
  id: string;
  name: string;
  type: EquipmentType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  warrantyExpiration: Date;
  status: 'operational' | 'maintenance' | 'repair' | 'retired' | 'calibration_needed';
  location: {
    roomId: string;
    position: string; // e.g., "Chair 1", "Cabinet A"
  };
  maintenanceSchedule: MaintenanceSchedule[];
  usageHours: number;
  lastMaintenance: Date;
  nextMaintenanceDue: Date;
  calibrationRequired: boolean;
  lastCalibration: Date;
  nextCalibrationDue: Date;
  costPerHour: number;
  utilizationRate: number; // 0-100
  assignedTo?: string; // Dentist ID
}

export interface RoomFeature {
  id: string;
  name: string;
  type: 'equipment' | 'amenity' | 'safety' | 'technology';
  description: string;
  operational: boolean;
  lastChecked: Date;
}

export interface MaintenanceSchedule {
  id: string;
  resourceId: string; // Room or Equipment ID
  resourceType: 'room' | 'equipment';
  type: 'preventive' | 'corrective' | 'calibration' | 'cleaning';
  frequency: {
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'usage_based';
    interval: number; // e.g., every 3 months
    usageThreshold?: number; // for usage_based
  };
  estimatedDuration: number; // minutes
  requiredSkills: string[];
  partsRequired?: MaintenancePart[];
  cost: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastPerformed: Date;
  nextDue: Date;
  status: 'scheduled' | 'overdue' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string; // Technician ID
  notes?: string;
}

export interface MaintenancePart {
  partId: string;
  name: string;
  quantity: number;
  estimatedCost: number;
  supplier: string;
}

export interface RoomBooking {
  id: string;
  roomId: string;
  treatmentId: string;
  patientId: string;
  dentistId: string;
  startTime: Date;
  endTime: Date;
  status: 'confirmed' | 'tentative' | 'cancelled' | 'completed';
  notes?: string;
  equipmentRequired: string[]; // Equipment IDs
  specialRequirements?: string[];
}

export interface AvailableResources {
  availableRooms: TreatmentRoom[];
  availableEquipment: DentalEquipment[];
  timeSlots: TimeSlot[];
  conflicts: ResourceConflict[];
  recommendations: ResourceRecommendation[];
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  availableRooms: string[]; // Room IDs
  availableEquipment: string[]; // Equipment IDs
  utilizationRate: number;
}

export interface ResourceConflict {
  type: 'double_booking' | 'equipment_unavailable' | 'maintenance_scheduled' | 'staff_unavailable';
  severity: 'low' | 'medium' | 'high';
  affectedResources: string[];
  timePeriod: {
    start: Date;
    end: Date;
  };
  description: string;
  resolution?: string;
}

export interface ResourceRecommendation {
  type: 'room_suggestion' | 'equipment_alternative' | 'time_optimization' | 'staff_reassignment';
  priority: 'low' | 'medium' | 'high';
  description: string;
  alternativeResources: string[];
  benefits: string[];
}

export interface ResourceAllocation {
  optimalSchedule: OptimalSchedule;
  resourceUtilization: ResourceUtilization;
  costOptimization: CostOptimization;
  efficiencyMetrics: EfficiencyMetrics;
}

export interface OptimalSchedule {
  roomAssignments: RoomAssignment[];
  equipmentAssignments: EquipmentAssignment[];
  staffAssignments: StaffAssignment[];
  timeOptimization: TimeOptimization[];
}

export interface RoomAssignment {
  treatmentId: string;
  roomId: string;
  startTime: Date;
  endTime: Date;
  reason: string;
  priority: number;
}

export interface EquipmentAssignment {
  treatmentId: string;
  equipmentId: string;
  startTime: Date;
  endTime: Date;
  usage: 'primary' | 'backup' | 'optional';
}

export interface StaffAssignment {
  treatmentId: string;
  staffId: string;
  role: 'dentist' | 'assistant' | 'hygienist' | 'technician';
  startTime: Date;
  endTime: Date;
}

export interface TimeOptimization {
  originalDuration: number;
  optimizedDuration: number;
  timeSaved: number;
  efficiencyGain: number;
  bottleneckIdentified: string;
}

export interface ResourceUtilization {
  overallUtilization: number; // 0-100
  byRoom: { [roomId: string]: number };
  byEquipment: { [equipmentId: string]: number };
  byTimeSlot: { [timeSlot: string]: number };
  peakHours: { hour: number; utilization: number }[];
  underutilizedResources: string[];
  overutilizedResources: string[];
}

export interface CostOptimization {
  currentCost: number;
  optimizedCost: number;
  savings: number;
  costPerTreatment: number;
  roi: number; // Return on investment
  paybackPeriod: number; // months
}

export interface EfficiencyMetrics {
  averageTreatmentTime: number;
  patientWaitTime: number;
  resourceIdleTime: number;
  equipmentDowntime: number;
  staffUtilization: number;
  patientSatisfaction: number;
  costPerMinute: number;
}

export interface ClinicResourceManagement {
  // Gestión de equipamiento y salas
  treatmentRooms: TreatmentRoom[];
  dentalEquipment: DentalEquipment[];
  checkResourceAvailability(date: Date, duration: number): AvailableResources;
  maintenanceSchedule: MaintenanceSchedule[];
  optimizeResourceAllocation(): ResourceAllocation;

  // Core methods
  addTreatmentRoom(room: Omit<TreatmentRoom, 'id'>): Promise<TreatmentRoom>;
  updateTreatmentRoom(id: string, updates: Partial<TreatmentRoom>): Promise<TreatmentRoom>;
  removeTreatmentRoom(id: string): Promise<void>;

  addEquipment(equipment: Omit<DentalEquipment, 'id'>): Promise<DentalEquipment>;
  updateEquipment(id: string, updates: Partial<DentalEquipment>): Promise<DentalEquipment>;
  removeEquipment(id: string): Promise<void>;

  // Booking and scheduling
  bookRoom(booking: Omit<RoomBooking, 'id'>): Promise<RoomBooking>;
  cancelBooking(bookingId: string): Promise<void>;
  getRoomSchedule(roomId: string, date: Date): RoomBooking[];

  // Maintenance management
  scheduleMaintenance(schedule: Omit<MaintenanceSchedule, 'id'>): Promise<MaintenanceSchedule>;
  completeMaintenance(scheduleId: string, notes?: string): Promise<void>;
  getMaintenanceHistory(resourceId: string): MaintenanceSchedule[];

  // Resource optimization
  findOptimalResources(treatment: Treatment, preferredTime: Date): ResourceRecommendation;
  calculateResourceUtilization(period: { start: Date; end: Date }): ResourceUtilization;
  identifyBottlenecks(): ResourceConflict[];

  // Analytics and reporting
  getEfficiencyReport(period: { start: Date; end: Date }): EfficiencyMetrics;
  getCostAnalysis(period: { start: Date; end: Date }): CostOptimization;
  predictResourceNeeds(futurePeriod: { start: Date; end: Date }): ResourcePrediction;
}

export interface ResourcePrediction {
  predictedDemand: { [resourceType: string]: number };
  recommendedCapacity: { [resourceType: string]: number };
  investmentNeeded: number;
  expectedROI: number;
  timeline: number; // months
}

// Treatment interface for resource allocation
export interface Treatment {
  id: string;
  type: string;
  estimatedDuration: number;
  requiredEquipment: string[];
  requiredSkills: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  priority: 'low' | 'medium' | 'high' | 'emergency';
}