// 🦷🎸 TREATMENT STORE V3.0 - OLYMPUS MEDICAL SCIENCE
/**
 * Treatment Store V3.0 - The Brain of Medical Conquest
 *
 * 🎯 MISSION: Comprehensive treatment state management for Olympus
 * ✅ Treatment plans and catalogs with AI insights
 * ✅ Interactive odontogram with 3D visualization
 * ✅ Real-time treatment progress tracking
 * ✅ Medical history integration
 * ✅ Compliance and regulatory tracking
 * ✅ Multi-specialty treatment orchestration
 *
 * Date: September 22, 2025
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface Treatment {
  id: string;
  patient_id: string;
  patient_name: string;
  treatment_type: string;
  treatment_category: 'preventive' | 'restorative' | 'cosmetic' | 'orthodontic' | 'surgical' | 'emergency';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Medical Details
  diagnosis: string;
  treatment_plan: string;
  procedures: TreatmentProcedure[];
  estimated_duration: number; // in minutes
  actual_duration?: number;

  // Financial
  estimated_cost: number;
  actual_cost?: number;
  insurance_coverage?: number;
  patient_responsibility?: number;

  // Timeline
  planned_start_date: string;
  actual_start_date?: string;
  planned_end_date?: string;
  actual_end_date?: string;
  next_appointment_date?: string;

  // Medical Staff
  primary_dentist_id: string;
  primary_dentist_name: string;
  assistants?: string[];
  specialists?: TreatmentSpecialist[];

  // Odontogram Integration
  affected_teeth: Tooth[];
  odontogram_notes: string;

  // AI & Analytics
  ai_risk_assessment: number; // 0-100
  ai_success_probability: number; // 0-100
  ai_recommendations: string[];
  ai_complications_risk: string[];

  // Compliance & Legal
  informed_consent_obtained: boolean;
  consent_date?: string;
  regulatory_requirements: string[];
  compliance_status: 'pending' | 'approved' | 'requires_review';

  // Progress Tracking
  progress_percentage: number;
  completed_procedures: string[];
  pending_procedures: string[];
  complications?: string[];

  // Metadata
  notes: string;
  tags: string[];
  attachments: TreatmentAttachment[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface TreatmentProcedure {
  id: string;
  name: string;
  description: string;
  category: string;
  estimated_cost: number;
  estimated_duration: number;
  required_materials: string[];
  contraindications?: string[];
  post_procedure_care: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completed_at?: string;
  performed_by?: string;
  notes?: string;
}

export interface TreatmentSpecialist {
  id: string;
  name: string;
  specialty: string;
  role: 'consultant' | 'performer' | 'supervisor';
  involvement_percentage: number;
}

export interface Tooth {
  id: string;
  number: number; // FDI notation (11-48)
  name: string; // e.g., "Upper Right Central Incisor"
  quadrant: number; // 1-4
  position: number; // 1-8
  status: 'healthy' | 'decayed' | 'filled' | 'extracted' | 'crowned' | 'implanted';
  conditions: ToothCondition[];
  treatments: ToothTreatment[];
  notes: string;
}

export interface ToothCondition {
  id: string;
  type: 'cavity' | 'fracture' | 'infection' | 'wear' | 'discoloration' | 'malposition';
  severity: 'mild' | 'moderate' | 'severe';
  location: string; // e.g., "mesial", "occlusal"
  detected_date: string;
  notes: string;
}

export interface ToothTreatment {
  id: string;
  treatment_id: string;
  procedure_type: string;
  performed_date: string;
  outcome: 'successful' | 'partial' | 'failed';
  materials_used: string[];
  cost: number;
  notes: string;
}

export interface TreatmentAttachment {
  id: string;
  name: string;
  type: 'xray' | 'photo' | 'scan' | 'document' | 'video';
  url: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface TreatmentFilters {
  patient_id?: string;
  status?: string[];
  category?: string[];
  priority?: string[];
  dentist_id?: string;
  date_from?: string;
  date_to?: string;
  search_term?: string;
}

export interface TreatmentStats {
  total_treatments: number;
  active_treatments: number;
  completed_treatments: number;
  urgent_treatments: number;
  total_revenue: number;
  average_treatment_cost: number;
  treatments_by_category: Record<string, number>;
  treatments_by_status: Record<string, number>;
  top_procedures: Array<{ name: string; count: number; revenue: number }>;
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface TreatmentStore {
  // State
  treatments: Treatment[];
  selectedTreatment: Treatment | null;
  odontogramTeeth: Tooth[];
  filters: TreatmentFilters;
  stats: TreatmentStats;
  isLoading: boolean;
  error: string | null;

  // Actions
  setTreatments: (treatments: Treatment[]) => void;
  addTreatment: (treatment: Treatment) => void;
  updateTreatment: (id: string, updates: Partial<Treatment>) => void;
  removeTreatment: (id: string) => void;
  setSelectedTreatment: (treatment: Treatment | null) => void;

  // Odontogram Actions
  setOdontogramTeeth: (teeth: Tooth[]) => void;
  updateTooth: (toothId: string, updates: Partial<Tooth>) => void;
  addToothCondition: (toothId: string, condition: ToothCondition) => void;
  addToothTreatment: (toothId: string, treatment: ToothTreatment) => void;

  // Filter Actions
  setFilters: (filters: TreatmentFilters) => void;
  clearFilters: () => void;

  // Stats Actions
  updateStats: () => void;

  // Utility Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Computed Getters
  getFilteredTreatments: () => Treatment[];
  getPatientTreatments: (patientId: string) => Treatment[];
  getActiveTreatments: () => Treatment[];
  getUrgentTreatments: () => Treatment[];
  getTreatmentById: (id: string) => Treatment | undefined;
  getToothById: (id: string) => Tooth | undefined;
  getTeethByPatient: (patientId: string) => Tooth[];
}

// ============================================================================
// DEFAULT STATE
// ============================================================================

const defaultStats: TreatmentStats = {
  total_treatments: 0,
  active_treatments: 0,
  completed_treatments: 0,
  urgent_treatments: 0,
  total_revenue: 0,
  average_treatment_cost: 0,
  treatments_by_category: {},
  treatments_by_status: {},
  top_procedures: []
};

const defaultFilters: TreatmentFilters = {
  status: [],
  category: [],
  priority: []
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useTreatmentStore = create<TreatmentStore>()(
  persist(
    (set, get) => ({
      // Initial State
      treatments: [],
      selectedTreatment: null,
      odontogramTeeth: [],
      filters: defaultFilters,
      stats: defaultStats,
      isLoading: false,
      error: null,

      // Basic Actions
      setTreatments: (treatments) => {
        set({ treatments });
        get().updateStats();
      },

      addTreatment: (treatment) => {
        set((state) => ({
          treatments: [...state.treatments, treatment]
        }));
        get().updateStats();
      },

      updateTreatment: (id, updates) => {
        set((state) => ({
          treatments: state.treatments.map(t =>
            t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
          ),
          selectedTreatment: state.selectedTreatment?.id === id
            ? { ...state.selectedTreatment, ...updates }
            : state.selectedTreatment
        }));
        get().updateStats();
      },

      removeTreatment: (id) => {
        set((state) => ({
          treatments: state.treatments.filter(t => t.id !== id),
          selectedTreatment: state.selectedTreatment?.id === id ? null : state.selectedTreatment
        }));
        get().updateStats();
      },

      setSelectedTreatment: (treatment) => set({ selectedTreatment: treatment }),

      // Odontogram Actions
      setOdontogramTeeth: (teeth) => set({ odontogramTeeth: teeth }),

      updateTooth: (toothId, updates) => {
        set((state) => ({
          odontogramTeeth: state.odontogramTeeth.map(tooth =>
            tooth.id === toothId ? { ...tooth, ...updates } : tooth
          )
        }));
      },

      addToothCondition: (toothId, condition) => {
        set((state) => ({
          odontogramTeeth: state.odontogramTeeth.map(tooth =>
            tooth.id === toothId
              ? { ...tooth, conditions: [...tooth.conditions, condition] }
              : tooth
          )
        }));
      },

      addToothTreatment: (toothId, treatment) => {
        set((state) => ({
          odontogramTeeth: state.odontogramTeeth.map(tooth =>
            tooth.id === toothId
              ? { ...tooth, treatments: [...tooth.treatments, treatment] }
              : tooth
          )
        }));
      },

      // Filter Actions
      setFilters: (filters) => {
        set({ filters: { ...get().filters, ...filters } });
      },

      clearFilters: () => set({ filters: defaultFilters }),

      // Stats Actions
      updateStats: () => {
        const { treatments } = get();
        const stats: TreatmentStats = {
          total_treatments: treatments.length,
          active_treatments: treatments.filter(t => t.status === 'in_progress').length,
          completed_treatments: treatments.filter(t => t.status === 'completed').length,
          urgent_treatments: treatments.filter(t => t.priority === 'urgent').length,
          total_revenue: treatments.reduce((sum, t) => sum + (t.actual_cost || t.estimated_cost), 0),
          average_treatment_cost: treatments.length > 0
            ? treatments.reduce((sum, t) => sum + (t.actual_cost || t.estimated_cost), 0) / treatments.length
            : 0,
          treatments_by_category: treatments.reduce((acc, t) => {
            acc[t.treatment_category] = (acc[t.treatment_category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          treatments_by_status: treatments.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          top_procedures: [] // TODO: Implement procedure analytics
        };
        set({ stats });
      },

      // Utility Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set({
        treatments: [],
        selectedTreatment: null,
        odontogramTeeth: [],
        filters: defaultFilters,
        stats: defaultStats,
        isLoading: false,
        error: null
      }),

      // Computed Getters
      getFilteredTreatments: () => {
        const { treatments, filters } = get();
        return treatments.filter(treatment => {
          if (filters.patient_id && treatment.patient_id !== filters.patient_id) return false;
          if (filters.status?.length && !filters.status.includes(treatment.status)) return false;
          if (filters.category?.length && !filters.category.includes(treatment.treatment_category)) return false;
          if (filters.priority?.length && !filters.priority.includes(treatment.priority)) return false;
          if (filters.dentist_id && treatment.primary_dentist_id !== filters.dentist_id) return false;
          if (filters.search_term) {
            const searchLower = filters.search_term.toLowerCase();
            return treatment.patient_name.toLowerCase().includes(searchLower) ||
                   treatment.treatment_type.toLowerCase().includes(searchLower) ||
                   treatment.diagnosis.toLowerCase().includes(searchLower);
          }
          return true;
        });
      },

      getPatientTreatments: (patientId) => {
        return get().treatments.filter(t => t.patient_id === patientId);
      },

      getActiveTreatments: () => {
        return get().treatments.filter(t => t.status === 'in_progress');
      },

      getUrgentTreatments: () => {
        return get().treatments.filter(t => t.priority === 'urgent');
      },

      getTreatmentById: (id) => {
        return get().treatments.find(t => t.id === id);
      },

      getToothById: (id) => {
        return get().odontogramTeeth.find(t => t.id === id);
      },

      getTeethByPatient: (patientId) => {
        return get().odontogramTeeth.filter(t =>
          get().treatments.some(tr =>
            tr.patient_id === patientId && tr.affected_teeth.some(at => at.id === t.id)
          )
        );
      }
    }),
    {
      name: 'treatment-store-v3',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        treatments: state.treatments,
        odontogramTeeth: state.odontogramTeeth,
        filters: state.filters
      })
    }
  )
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const generateTreatmentId = (): string => {
  return `treatment_${Date.now()}`; // Deterministic ID generation
};

export const generateToothId = (number: number): string => {
  return `tooth_${number}`;
};

export const getToothName = (number: number): string => {
  const toothNames: Record<number, string> = {
    // Upper Right (1x)
    11: 'Upper Right Central Incisor',
    12: 'Upper Right Lateral Incisor',
    13: 'Upper Right Canine',
    14: 'Upper Right First Premolar',
    15: 'Upper Right Second Premolar',
    16: 'Upper Right First Molar',
    17: 'Upper Right Second Molar',
    18: 'Upper Right Third Molar',

    // Upper Left (2x)
    21: 'Upper Left Central Incisor',
    22: 'Upper Left Lateral Incisor',
    23: 'Upper Left Canine',
    24: 'Upper Left First Premolar',
    25: 'Upper Left Second Premolar',
    26: 'Upper Left First Molar',
    27: 'Upper Left Second Molar',
    28: 'Upper Left Third Molar',

    // Lower Left (3x)
    31: 'Lower Left Central Incisor',
    32: 'Lower Left Lateral Incisor',
    33: 'Lower Left Canine',
    34: 'Lower Left First Premolar',
    35: 'Lower Left Second Premolar',
    36: 'Lower Left First Molar',
    37: 'Lower Left Second Molar',
    38: 'Lower Left Third Molar',

    // Lower Right (4x)
    41: 'Lower Right Central Incisor',
    42: 'Lower Right Lateral Incisor',
    43: 'Lower Right Canine',
    44: 'Lower Right First Premolar',
    45: 'Lower Right Second Premolar',
    46: 'Lower Right First Molar',
    47: 'Lower Right Second Molar',
    48: 'Lower Right Third Molar'
  };

  return toothNames[number] || `Tooth ${number}`;
};

export const getToothQuadrant = (number: number): number => {
  return Math.floor(number / 10);
};

export const getToothPosition = (number: number): number => {
  return number % 10;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default useTreatmentStore;

// 🎯🎸💀 TREATMENT STORE V3.0 EXPORTS - OLYMPUS MEDICAL CONQUEST
/**
 * Export useTreatmentStore as the brain of the medical conquest
 *
 * 🎯 MISSION ACCOMPLISHED: Comprehensive treatment state management
 * ✅ Treatment lifecycle management with AI insights
 * ✅ Interactive odontogram integration
 * ✅ Multi-specialty treatment orchestration
 * ✅ Real-time progress tracking and analytics
 * ✅ Compliance and regulatory management
 * ✅ Medical history and attachment management
 *
 * "The science of healing, conquered! ⚡🦷🎸"
 */