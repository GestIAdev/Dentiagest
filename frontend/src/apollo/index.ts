// 🔥 APOLLO NUCLEAR GRAPHQL API WRAPPER
// Date: September 22, 2025
// Mission: Unified GraphQL API interface for frontend components
// Target: Seamless integration with Zustand stores

import apolloClient from './graphql-client';
import {
  GET_PATIENTS,
  GET_PATIENT,
  CREATE_PATIENT,
  UPDATE_PATIENT,
  DELETE_PATIENT,
  ACTIVATE_PATIENT,
  DEACTIVATE_PATIENT
} from '../graphql/queries/patients';
import {
  GET_APPOINTMENTS,
  GET_APPOINTMENT,
  CREATE_APPOINTMENT,
  UPDATE_APPOINTMENT,
  DELETE_APPOINTMENT,
  CANCEL_APPOINTMENT,
  CONFIRM_APPOINTMENT,
  COMPLETE_APPOINTMENT
} from '../graphql/queries/appointments';
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
  GET_MEDICAL_RECORDS,
  GET_MEDICAL_RECORD,
  CREATE_MEDICAL_RECORD,
  UPDATE_MEDICAL_RECORD,
  DELETE_MEDICAL_RECORD
} from '../graphql/queries/medicalRecords';

// ============================================================================
// PATIENT API
// ============================================================================

export const patients = {
  // 🎯 List patients with filters
  async list(filters?: any) {
    try {
      const { data } = await apolloClient.query({
        query: GET_PATIENTS,
        variables: { filters },
        fetchPolicy: 'network-only'
      });

      const responseData = data as any;

      // Transform GraphQL response to match store interface
      const patients = responseData.patients.items.map((patient: any) => ({
        id: patient.id,
        first_name: patient.firstName,
        last_name: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        phone_secondary: patient.phoneSecondary,
        date_of_birth: patient.dateOfBirth,
        gender: patient.gender,
        address: patient.fullAddress,
        emergency_contact_name: patient.emergencyContactName,
        emergency_contact_phone: patient.emergencyContactPhone,
        medical_conditions: patient.medicalConditions,
        medications_current: patient.medicationsCurrent,
        allergies: patient.allergies,
        anxiety_level: patient.anxietyLevel,
        special_needs: patient.specialNeeds,
        insurance_provider: patient.insuranceProvider,
        insurance_number: patient.insurancePolicyNumber,
        insurance_group_number: patient.insuranceGroupNumber,
        insurance_status: patient.insuranceStatus,
        consent_to_treatment: patient.consentToTreatment,
        consent_to_contact: patient.consentToContact,
        preferred_contact_method: patient.preferredContactMethod,
        notes: patient.notes,
        is_active: patient.isActive,
        created_at: patient.createdAt,
        updated_at: patient.updatedAt
      }));

      return {
        patients,
        total: responseData.patients.total,
        page: responseData.patients.page,
        size: responseData.patients.size,
        pages: responseData.patients.pages,
        hasNext: responseData.patients.hasNext,
        hasPrev: responseData.patients.hasPrev
      };
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // 🎯 Get single patient
  async get(id: string) {
    try {
      const { data } = await apolloClient.query({
        query: GET_PATIENT,
        variables: { id }
      });

      const responseData = data as any;
      const patient = responseData.patient;
      return {
        id: patient.id,
        first_name: patient.firstName,
        last_name: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        phone_secondary: patient.phoneSecondary,
        date_of_birth: patient.dateOfBirth,
        gender: patient.gender,
        address: patient.fullAddress,
        emergency_contact_name: patient.emergencyContactName,
        emergency_contact_phone: patient.emergencyContactPhone,
        medical_conditions: patient.medicalConditions,
        medications_current: patient.medicationsCurrent,
        allergies: patient.allergies,
        anxiety_level: patient.anxietyLevel,
        special_needs: patient.specialNeeds,
        insurance_provider: patient.insuranceProvider,
        insurance_number: patient.insurancePolicyNumber,
        insurance_group_number: patient.insuranceGroupNumber,
        insurance_status: patient.insuranceStatus,
        consent_to_treatment: patient.consentToTreatment,
        consent_to_contact: patient.consentToContact,
        preferred_contact_method: patient.preferredContactMethod,
        notes: patient.notes,
        is_active: patient.isActive,
        created_at: patient.createdAt,
        updated_at: patient.updatedAt,
        appointments: patient.appointments || []
      };
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  },

  // 🎯 Create patient
  async create(patientData: any) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_PATIENT,
        variables: {
          input: {
            firstName: patientData.first_name,
            lastName: patientData.last_name,
            email: patientData.email,
            phone: patientData.phone,
            phoneSecondary: patientData.phone_secondary,
            dateOfBirth: patientData.date_of_birth,
            gender: patientData.gender,
            addressStreet: patientData.address_street,
            addressCity: patientData.address_city,
            addressState: patientData.address_state,
            addressPostalCode: patientData.address_postal_code,
            addressCountry: patientData.address_country,
            emergencyContactName: patientData.emergency_contact_name,
            emergencyContactPhone: patientData.emergency_contact_phone,
            emergencyContactRelationship: patientData.emergency_contact_relationship,
            medicalConditions: patientData.medical_conditions,
            medicationsCurrent: patientData.medications_current,
            allergies: patientData.allergies,
            anxietyLevel: patientData.anxiety_level,
            specialNeeds: patientData.special_needs,
            insuranceProvider: patientData.insurance_provider,
            insurancePolicyNumber: patientData.insurance_number,
            insuranceGroupNumber: patientData.insurance_group_number,
            consentToTreatment: patientData.consent_to_treatment,
            consentToContact: patientData.consent_to_contact,
            preferredContactMethod: patientData.preferred_contact_method,
            notes: patientData.notes
          }
        }
      });

      const responseData = data as any;
      const patient = responseData.createPatient;
      return {
        id: patient.id,
        first_name: patient.firstName,
        last_name: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        phone_secondary: patient.phoneSecondary,
        date_of_birth: patient.dateOfBirth,
        gender: patient.gender,
        address: patient.fullAddress,
        emergency_contact_name: patient.emergencyContactName,
        emergency_contact_phone: patient.emergencyContactPhone,
        medical_conditions: patient.medicalConditions,
        medications_current: patient.medicationsCurrent,
        allergies: patient.allergies,
        anxiety_level: patient.anxietyLevel,
        special_needs: patient.specialNeeds,
        insurance_provider: patient.insuranceProvider,
        insurance_number: patient.insurancePolicyNumber,
        insurance_group_number: patient.insuranceGroupNumber,
        insurance_status: patient.insuranceStatus,
        consent_to_treatment: patient.consentToTreatment,
        consent_to_contact: patient.consentToContact,
        preferred_contact_method: patient.preferredContactMethod,
        notes: patient.notes,
        is_active: patient.isActive,
        created_at: patient.createdAt,
        updated_at: patient.updatedAt
      };
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  // 🎯 Update patient
  async update(id: string, patientData: any) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_PATIENT,
        variables: {
          id,
          input: {
            firstName: patientData.first_name,
            lastName: patientData.last_name,
            email: patientData.email,
            phone: patientData.phone,
            phoneSecondary: patientData.phone_secondary,
            dateOfBirth: patientData.date_of_birth,
            gender: patientData.gender,
            addressStreet: patientData.address_street,
            addressCity: patientData.address_city,
            addressState: patientData.address_state,
            addressPostalCode: patientData.address_postal_code,
            addressCountry: patientData.address_country,
            emergencyContactName: patientData.emergency_contact_name,
            emergencyContactPhone: patientData.emergency_contact_phone,
            emergencyContactRelationship: patientData.emergency_contact_relationship,
            medicalConditions: patientData.medical_conditions,
            medicationsCurrent: patientData.medications_current,
            allergies: patientData.allergies,
            anxietyLevel: patientData.anxiety_level,
            specialNeeds: patientData.special_needs,
            insuranceProvider: patientData.insurance_provider,
            insurancePolicyNumber: patientData.insurance_number,
            insuranceGroupNumber: patientData.insurance_group_number,
            consentToTreatment: patientData.consent_to_treatment,
            consentToContact: patientData.consent_to_contact,
            preferredContactMethod: patientData.preferred_contact_method,
            notes: patientData.notes,
            isActive: patientData.is_active
          }
        }
      });

      const responseData = data as any;
      const patient = responseData.updatePatient;
      return {
        id: patient.id,
        first_name: patient.firstName,
        last_name: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        phone_secondary: patient.phoneSecondary,
        date_of_birth: patient.dateOfBirth,
        gender: patient.gender,
        address: patient.fullAddress,
        emergency_contact_name: patient.emergencyContactName,
        emergency_contact_phone: patient.emergencyContactPhone,
        medical_conditions: patient.medicalConditions,
        medications_current: patient.medicationsCurrent,
        allergies: patient.allergies,
        anxiety_level: patient.anxietyLevel,
        special_needs: patient.specialNeeds,
        insurance_provider: patient.insuranceProvider,
        insurance_number: patient.insurancePolicyNumber,
        insurance_group_number: patient.insuranceGroupNumber,
        insurance_status: patient.insuranceStatus,
        consent_to_treatment: patient.consentToTreatment,
        consent_to_contact: patient.consentToContact,
        preferred_contact_method: patient.preferredContactMethod,
        notes: patient.notes,
        is_active: patient.isActive,
        updated_at: patient.updatedAt
      };
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },

  // 🎯 Delete patient
  async delete(id: string) {
    try {
      await apolloClient.mutate({
        mutation: DELETE_PATIENT,
        variables: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }
};

// ============================================================================
// CLINIC RESOURCES API
// ============================================================================

export const clinicResources = {
  // 🎯 List treatment rooms with filters
  async listTreatmentRooms(filters?: any) {
    try {
      const { data } = await apolloClient.query({
        query: GET_TREATMENT_ROOMS,
        variables: { filters },
        fetchPolicy: 'network-only'
      });

      const responseData = data as any;
      return responseData.treatmentRooms || [];
    } catch (error) {
      console.error('Error fetching treatment rooms:', error);
      throw error;
    }
  },

  // 🎯 Get single treatment room
  async getTreatmentRoom(id: string) {
    try {
      const { data } = await apolloClient.query({
        query: GET_TREATMENT_ROOMS,
        variables: { filters: { id } }
      });

      const responseData = data as any;
      return responseData.treatmentRooms?.[0] || null;
    } catch (error) {
      console.error('Error fetching treatment room:', error);
      throw error;
    }
  },

  // 🎯 Create treatment room
  async createTreatmentRoom(roomData: any) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_TREATMENT_ROOM,
        variables: {
          input: {
            name: roomData.name,
            roomNumber: roomData.roomNumber,
            type: roomData.type,
            capacity: roomData.capacity,
            notes: roomData.notes
          }
        }
      });

      const responseData = data as any;
      return responseData.createTreatmentRoom;
    } catch (error) {
      console.error('Error creating treatment room:', error);
      throw error;
    }
  },

  // 🎯 Update treatment room
  async updateTreatmentRoom(id: string, roomData: any) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_TREATMENT_ROOM,
        variables: {
          id,
          input: {
            name: roomData.name,
            roomNumber: roomData.roomNumber,
            type: roomData.type,
            status: roomData.status,
            capacity: roomData.capacity,
            isActive: roomData.isActive,
            lastCleaning: roomData.lastCleaning,
            nextCleaningDue: roomData.nextCleaningDue,
            notes: roomData.notes
          }
        }
      });

      const responseData = data as any;
      return responseData.updateTreatmentRoom;
    } catch (error) {
      console.error('Error updating treatment room:', error);
      throw error;
    }
  },

  // 🎯 Delete treatment room
  async deleteTreatmentRoom(id: string) {
    try {
      await apolloClient.mutate({
        mutation: DELETE_TREATMENT_ROOM,
        variables: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting treatment room:', error);
      throw error;
    }
  },

  // 🎯 List dental equipment with filters
  async listDentalEquipment(filters?: any) {
    try {
      const { data } = await apolloClient.query({
        query: GET_DENTAL_EQUIPMENT,
        variables: { filters },
        fetchPolicy: 'network-only'
      });

      const responseData = data as any;
      return responseData.dentalEquipment || [];
    } catch (error) {
      console.error('Error fetching dental equipment:', error);
      throw error;
    }
  },

  // 🎯 Get single dental equipment
  async getDentalEquipment(id: string) {
    try {
      const { data } = await apolloClient.query({
        query: GET_DENTAL_EQUIPMENT,
        variables: { filters: { id } }
      });

      const responseData = data as any;
      return responseData.dentalEquipment?.[0] || null;
    } catch (error) {
      console.error('Error fetching dental equipment:', error);
      throw error;
    }
  },

  // 🎯 Create dental equipment
  async createDentalEquipment(equipmentData: any) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_DENTAL_EQUIPMENT,
        variables: {
          input: {
            name: equipmentData.name,
            type: equipmentData.type,
            manufacturer: equipmentData.manufacturer,
            model: equipmentData.model,
            serialNumber: equipmentData.serialNumber,
            purchaseDate: equipmentData.purchaseDate,
            warrantyExpiry: equipmentData.warrantyExpiry,
            location: equipmentData.location,
            assignedRoomId: equipmentData.assignedRoomId,
            notes: equipmentData.notes
          }
        }
      });

      const responseData = data as any;
      return responseData.createDentalEquipment;
    } catch (error) {
      console.error('Error creating dental equipment:', error);
      throw error;
    }
  },

  // 🎯 Update dental equipment
  async updateDentalEquipment(id: string, equipmentData: any) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_DENTAL_EQUIPMENT,
        variables: {
          id,
          input: {
            name: equipmentData.name,
            type: equipmentData.type,
            status: equipmentData.status,
            manufacturer: equipmentData.manufacturer,
            model: equipmentData.model,
            serialNumber: equipmentData.serialNumber,
            purchaseDate: equipmentData.purchaseDate,
            warrantyExpiry: equipmentData.warrantyExpiry,
            lastMaintenance: equipmentData.lastMaintenance,
            nextMaintenanceDue: equipmentData.nextMaintenanceDue,
            location: equipmentData.location,
            assignedRoomId: equipmentData.assignedRoomId,
            isActive: equipmentData.isActive,
            notes: equipmentData.notes
          }
        }
      });

      const responseData = data as any;
      return responseData.updateDentalEquipment;
    } catch (error) {
      console.error('Error updating dental equipment:', error);
      throw error;
    }
  },

  // 🎯 Delete dental equipment
  async deleteDentalEquipment(id: string) {
    try {
      await apolloClient.mutate({
        mutation: DELETE_DENTAL_EQUIPMENT,
        variables: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting dental equipment:', error);
      throw error;
    }
  },

  // 🎯 Assign equipment to room
  async assignEquipmentToRoom(equipmentId: string, roomId: string | null) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: ASSIGN_EQUIPMENT_TO_ROOM,
        variables: { equipmentId, roomId }
      });

      const responseData = data as any;
      return responseData.assignEquipmentToRoom;
    } catch (error) {
      console.error('Error assigning equipment to room:', error);
      throw error;
    }
  },

  // 🎯 Get maintenance schedule
  async getMaintenanceSchedule(filters?: any) {
    try {
      const { data } = await apolloClient.query({
        query: GET_MAINTENANCE_SCHEDULE,
        variables: { filters },
        fetchPolicy: 'network-only'
      });

      const responseData = data as any;
      return responseData.maintenanceSchedule || [];
    } catch (error) {
      console.error('Error fetching maintenance schedule:', error);
      throw error;
    }
  },

  // 🎯 Schedule maintenance
  async scheduleMaintenance(maintenanceData: any) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: SCHEDULE_MAINTENANCE,
        variables: {
          input: {
            equipmentId: maintenanceData.equipmentId,
            scheduledDate: maintenanceData.scheduledDate,
            maintenanceType: maintenanceData.maintenanceType,
            description: maintenanceData.description,
            technician: maintenanceData.technician,
            priority: maintenanceData.priority,
            notes: maintenanceData.notes
          }
        }
      });

      const responseData = data as any;
      return responseData.scheduleMaintenance;
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      throw error;
    }
  },

  // 🎯 Complete maintenance
  async completeMaintenance(id: string, completionData: any) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: COMPLETE_MAINTENANCE,
        variables: {
          id,
          completionData: {
            completedDate: completionData.completedDate,
            cost: completionData.cost,
            notes: completionData.notes
          }
        }
      });

      const responseData = data as any;
      return responseData.completeMaintenance;
    } catch (error) {
      console.error('Error completing maintenance:', error);
      throw error;
    }
  },

  // 🎯 Get cleaning schedule
  async getCleaningSchedule(filters?: any) {
    try {
      const { data } = await apolloClient.query({
        query: GET_ROOM_CLEANING_SCHEDULE,
        variables: { filters },
        fetchPolicy: 'network-only'
      });

      const responseData = data as any;
      return responseData.roomCleaningSchedule || [];
    } catch (error) {
      console.error('Error fetching cleaning schedule:', error);
      throw error;
    }
  },

  // 🎯 Schedule room cleaning
  async scheduleRoomCleaning(cleaningData: any) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: SCHEDULE_ROOM_CLEANING,
        variables: {
          input: {
            roomId: cleaningData.roomId,
            scheduledDate: cleaningData.scheduledDate,
            cleaningType: cleaningData.cleaningType,
            notes: cleaningData.notes
          }
        }
      });

      const responseData = data as any;
      return responseData.scheduleRoomCleaning;
    } catch (error) {
      console.error('Error scheduling room cleaning:', error);
      throw error;
    }
  },

  // 🎯 Complete room cleaning
  async completeRoomCleaning(id: string, completionData: any) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: COMPLETE_ROOM_CLEANING,
        variables: {
          id,
          completionData: {
            completedDate: completionData.completedDate,
            staffMember: completionData.staffMember,
            notes: completionData.notes
          }
        }
      });

      const responseData = data as any;
      return responseData.completeRoomCleaning;
    } catch (error) {
      console.error('Error completing room cleaning:', error);
      throw error;
    }
  },

  // 🎯 Get clinic resource stats
  async getStats() {
    try {
      const { data } = await apolloClient.query({
        query: GET_CLINIC_RESOURCE_STATS,
        fetchPolicy: 'network-only'
      });

      const responseData = data as any;
      return responseData.clinicResourceStats;
    } catch (error) {
      console.error('Error fetching clinic resource stats:', error);
      throw error;
    }
  },

  // 🎯 Get resource utilization
  async getUtilization(startDate: Date, endDate: Date) {
    try {
      const { data } = await apolloClient.query({
        query: GET_RESOURCE_UTILIZATION,
        variables: { startDate, endDate },
        fetchPolicy: 'network-only'
      });

      const responseData = data as any;
      return responseData.resourceUtilization || [];
    } catch (error) {
      console.error('Error fetching resource utilization:', error);
      throw error;
    }
  }
};

export const appointments = {
  // 🎯 List appointments with filters
  async list(filters?: any) {
    try {
      const { data } = await apolloClient.query({
        query: GET_APPOINTMENTS,
        variables: { filters },
        fetchPolicy: 'network-only'
      });

      const responseData = data as any;

      // Transform GraphQL response to match store interface
      const appointments = responseData.appointments.appointments.map((apt: any) => ({
        id: apt.id,
        patient_id: apt.patientId,
        dentist_id: apt.dentistId,
        scheduled_date: apt.scheduledDate,
        duration_minutes: apt.durationMinutes,
        appointment_type: apt.appointmentType,
        priority: apt.priority || 'normal',
        title: apt.title,
        description: apt.description,
        notes: apt.notes,
        status: apt.status,
        room_number: apt.roomNumber,
        estimated_cost: apt.estimatedCost,
        insurance_coverage: apt.insuranceCoverage,
        preparation_instructions: apt.preparationInstructions,
        follow_up_required: apt.followUpRequired,
        confirmation_sent: apt.confirmationSent,
        reminder_sent: apt.reminderSent,
        cancelled_at: apt.cancelledAt,
        completed_at: apt.completedAt,
        created_at: apt.createdAt,
        updated_at: apt.updatedAt,
        patient_name: apt.patientName,
        patient_phone: apt.patientPhone,
        dentist_name: apt.dentistName
      }));

      return {
        appointments,
        total: responseData.appointments.total,
        page: responseData.appointments.page,
        pages: responseData.appointments.pages,
        hasNext: responseData.appointments.hasNext,
        hasPrev: responseData.appointments.hasPrev
      };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // 🎯 Get single appointment
  async get(id: string) {
    try {
      const { data } = await apolloClient.query({
        query: GET_APPOINTMENT,
        variables: { id }
      });

      const responseData = data as any;
      const apt = responseData.appointment;
      return {
        id: apt.id,
        patient_id: apt.patientId,
        dentist_id: apt.dentistId,
        scheduled_date: apt.scheduledDate,
        duration_minutes: apt.durationMinutes,
        appointment_type: apt.appointmentType,
        priority: apt.priority || 'normal',
        title: apt.title,
        description: apt.description,
        notes: apt.notes,
        status: apt.status,
        room_number: apt.roomNumber,
        estimated_cost: apt.estimatedCost,
        insurance_coverage: apt.insuranceCoverage,
        preparation_instructions: apt.preparationInstructions,
        follow_up_required: apt.followUpRequired,
        confirmation_sent: apt.confirmationSent,
        reminder_sent: apt.reminderSent,
        cancelled_at: apt.cancelledAt,
        completed_at: apt.completedAt,
        created_at: apt.createdAt,
        updated_at: apt.updatedAt,
        patient_name: apt.patientName,
        patient_phone: apt.patientPhone,
        dentist_name: apt.dentistName,
        patient: apt.patient,
        dentist: apt.dentist
      };
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  },

  // 🎯 Create appointment
  async create(appointmentData: any) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_APPOINTMENT,
        variables: {
          input: {
            patientId: appointmentData.patient_id,
            dentistId: appointmentData.dentist_id,
            scheduledDate: appointmentData.scheduled_date,
            durationMinutes: appointmentData.duration_minutes,
            appointmentType: appointmentData.appointment_type,
            priority: appointmentData.priority || 'normal',
            title: appointmentData.title,
            description: appointmentData.description,
            notes: appointmentData.notes,
            roomNumber: appointmentData.room_number,
            estimatedCost: appointmentData.estimated_cost,
            insuranceCoverage: appointmentData.insurance_coverage,
            preparationInstructions: appointmentData.preparation_instructions,
            followUpRequired: appointmentData.follow_up_required
          }
        }
      });

      const responseData = data as any;
      const apt = responseData.createAppointment;
      return {
        id: apt.id,
        patient_id: apt.patientId,
        dentist_id: apt.dentistId,
        scheduled_date: apt.scheduledDate,
        duration_minutes: apt.durationMinutes,
        appointment_type: apt.appointmentType,
        priority: apt.priority || 'normal',
        title: apt.title,
        description: apt.description,
        notes: apt.notes,
        status: apt.status,
        room_number: apt.roomNumber,
        estimated_cost: apt.estimatedCost,
        insurance_coverage: apt.insuranceCoverage,
        preparation_instructions: apt.preparationInstructions,
        follow_up_required: apt.followUpRequired,
        confirmation_sent: apt.confirmationSent,
        reminder_sent: apt.reminderSent,
        created_at: apt.createdAt,
        updated_at: apt.updatedAt,
        patient_name: apt.patientName,
        patient_phone: apt.patientPhone,
        dentist_name: apt.dentistName
      };
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // 🎯 Update appointment
  async update(id: string, appointmentData: any) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_APPOINTMENT,
        variables: {
          id,
          input: {
            patientId: appointmentData.patient_id,
            dentistId: appointmentData.dentist_id,
            scheduledDate: appointmentData.scheduled_date,
            durationMinutes: appointmentData.duration_minutes,
            appointmentType: appointmentData.appointment_type,
            priority: appointmentData.priority || 'normal',
            title: appointmentData.title,
            description: appointmentData.description,
            notes: appointmentData.notes,
            status: appointmentData.status,
            roomNumber: appointmentData.room_number,
            estimatedCost: appointmentData.estimated_cost,
            insuranceCoverage: appointmentData.insurance_coverage,
            preparationInstructions: appointmentData.preparation_instructions,
            followUpRequired: appointmentData.follow_up_required,
            confirmationSent: appointmentData.confirmation_sent,
            reminderSent: appointmentData.reminder_sent
          }
        }
      });

      const responseData = data as any;
      const apt = responseData.updateAppointment;
      return {
        id: apt.id,
        patient_id: apt.patientId,
        dentist_id: apt.dentistId,
        scheduled_date: apt.scheduledDate,
        duration_minutes: apt.durationMinutes,
        appointment_type: apt.appointmentType,
        priority: apt.priority || 'normal',
        title: apt.title,
        description: apt.description,
        notes: apt.notes,
        status: apt.status,
        room_number: apt.roomNumber,
        estimated_cost: apt.estimatedCost,
        insurance_coverage: apt.insuranceCoverage,
        preparation_instructions: apt.preparationInstructions,
        follow_up_required: apt.followUpRequired,
        confirmation_sent: apt.confirmationSent,
        reminder_sent: apt.reminderSent,
        cancelled_at: apt.cancelledAt,
        completed_at: apt.completedAt,
        updated_at: apt.updatedAt,
        patient_name: apt.patientName,
        patient_phone: apt.patientPhone,
        dentist_name: apt.dentistName
      };
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  // 🎯 Delete appointment
  async delete(id: string) {
    try {
      await apolloClient.mutate({
        mutation: DELETE_APPOINTMENT,
        variables: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }
};

// ============================================================================
// MEDICAL RECORDS API
// ============================================================================

export const medicalRecords = {
  // 🎯 List medical records with filters
  async listMedicalRecords(filters?: any) {
    try {
      const { data } = await apolloClient.query({
        query: GET_MEDICAL_RECORDS,
        variables: { filters },
        fetchPolicy: 'network-only'
      });

      const responseData = data as any;

      // Transform GraphQL response to match store interface
      const records = responseData.medicalRecords.items.map((record: any) => ({
        id: record.id,
        patient_id: record.patientId,
        record_type: record.recordType,
        title: record.title,
        description: record.description,
        diagnosis: record.diagnosis,
        treatment_plan: record.treatmentPlan,
        medications: record.medications,
        notes: record.notes,
        vital_signs: record.vitalSigns,
        attachments: record.attachments,
        created_by: record.createdBy,
        created_at: record.createdAt,
        updated_at: record.updatedAt,
        tags: record.tags,
        priority: record.priority,
        status: record.status
      }));

      return {
        records,
        total: responseData.medicalRecords.total,
        page: responseData.medicalRecords.page,
        size: responseData.medicalRecords.size,
        pages: responseData.medicalRecords.pages,
        hasNext: responseData.medicalRecords.hasNext,
        hasPrev: responseData.medicalRecords.hasPrev
      };
    } catch (error) {
      console.error('Error fetching medical records:', error);
      throw error;
    }
  },

  // 🎯 Get single medical record
  async get(id: string) {
    try {
      const { data } = await apolloClient.query({
        query: GET_MEDICAL_RECORD,
        variables: { id }
      });

      const responseData = data as any;
      const record = responseData.medicalRecord;
      return {
        id: record.id,
        patient_id: record.patientId,
        record_type: record.recordType,
        title: record.title,
        description: record.description,
        diagnosis: record.diagnosis,
        treatment_plan: record.treatmentPlan,
        medications: record.medications,
        notes: record.notes,
        vital_signs: record.vitalSigns,
        attachments: record.attachments,
        created_by: record.createdBy,
        created_at: record.createdAt,
        updated_at: record.updatedAt,
        tags: record.tags,
        priority: record.priority,
        status: record.status
      };
    } catch (error) {
      console.error('Error fetching medical record:', error);
      throw error;
    }
  },

  // 🎯 Create medical record
  async create(recordData: any) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_MEDICAL_RECORD,
        variables: {
          input: {
            patientId: recordData.patient_id,
            recordType: recordData.record_type,
            title: recordData.title,
            description: recordData.description,
            diagnosis: recordData.diagnosis,
            treatmentPlan: recordData.treatment_plan,
            medications: recordData.medications,
            notes: recordData.notes,
            vitalSigns: recordData.vital_signs,
            attachments: recordData.attachments,
            tags: recordData.tags,
            priority: recordData.priority,
            status: recordData.status
          }
        }
      });

      const responseData = data as any;
      const record = responseData.createMedicalRecord;
      return {
        id: record.id,
        patient_id: record.patientId,
        record_type: record.recordType,
        title: record.title,
        description: record.description,
        diagnosis: record.diagnosis,
        treatment_plan: record.treatmentPlan,
        medications: record.medications,
        notes: record.notes,
        vital_signs: record.vitalSigns,
        attachments: record.attachments,
        created_by: record.createdBy,
        created_at: record.createdAt,
        updated_at: record.updatedAt,
        tags: record.tags,
        priority: record.priority,
        status: record.status
      };
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  },

  // 🎯 Update medical record
  async update(id: string, recordData: any) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_MEDICAL_RECORD,
        variables: {
          id,
          input: {
            recordType: recordData.record_type,
            title: recordData.title,
            description: recordData.description,
            diagnosis: recordData.diagnosis,
            treatmentPlan: recordData.treatment_plan,
            medications: recordData.medications,
            notes: recordData.notes,
            vitalSigns: recordData.vital_signs,
            attachments: recordData.attachments,
            tags: recordData.tags,
            priority: recordData.priority,
            status: recordData.status
          }
        }
      });

      const responseData = data as any;
      const record = responseData.updateMedicalRecord;
      return {
        id: record.id,
        patient_id: record.patientId,
        record_type: record.recordType,
        title: record.title,
        description: record.description,
        diagnosis: record.diagnosis,
        treatment_plan: record.treatmentPlan,
        medications: record.medications,
        notes: record.notes,
        vital_signs: record.vitalSigns,
        attachments: record.attachments,
        created_by: record.createdBy,
        created_at: record.createdAt,
        updated_at: record.updatedAt,
        tags: record.tags,
        priority: record.priority,
        status: record.status
      };
    } catch (error) {
      console.error('Error updating medical record:', error);
      throw error;
    }
  },

  // 🎯 Delete medical record
  async delete(id: string) {
    try {
      await apolloClient.mutate({
        mutation: DELETE_MEDICAL_RECORD,
        variables: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting medical record:', error);
      throw error;
    }
  }
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

const apollo = {
  client: apolloClient,
  patients,
  appointments,
  clinicResources,
  medicalRecords
};

export default apollo;