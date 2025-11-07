// 🔥 APOLLO NUCLEAR GRAPHQL QUERIES - CLINIC RESOURCES
// Date: September 22, 2025
// Mission: GraphQL Queries for Clinic Resource Management
// Target: ClinicResourceManagerV3 Integration

import { gql } from '@apollo/client';

// ============================================================================
// TREATMENT ROOM QUERIES
// ============================================================================

// 🎯 GET TREATMENT ROOMS - Main room listing query
export const GET_TREATMENT_ROOMS = gql`
  query GetTreatmentRooms(
    $filters: TreatmentRoomFilters
  ) {
    treatmentRoomsV3(filters: $filters) {
      id
      name
      name_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      roomNumber
      roomNumber_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      type
      type_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      status
      status_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      capacity
      capacity_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      equipment {
        id
        name
        type
        status
        lastMaintenance
        nextMaintenanceDue
        manufacturer
        model
        serialNumber
        purchaseDate
        warrantyExpiry
        location
        assignedRoomId
        isActive
        notes
      }
      isActive
      lastCleaning
      nextCleaningDue
      notes
      notes_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      createdAt
      updatedAt
    }
  }
`;

// 🎯 GET TREATMENT ROOM - Single room query
export const GET_TREATMENT_ROOM = gql`
  query GetTreatmentRoom($id: UUID!) {
    treatmentRoomV3(id: $id) {
      id
      name
      name_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      roomNumber
      roomNumber_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      type
      type_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      status
      status_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      capacity
      capacity_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      equipment {
        id
        name
        type
        status
        lastMaintenance
        nextMaintenanceDue
        manufacturer
        model
        serialNumber
        purchaseDate
        warrantyExpiry
        location
        assignedRoomId
        isActive
        notes
      }
      isActive
      lastCleaning
      nextCleaningDue
      notes
      notes_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// DENTAL EQUIPMENT QUERIES
// ============================================================================

// 🎯 GET DENTAL EQUIPMENT - Main equipment listing query
export const GET_DENTAL_EQUIPMENT = gql`
  query GetDentalEquipment(
    $filters: DentalEquipmentFilters
  ) {
    dentalEquipmentV3(filters: $filters) {
      id
      name
      name_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      type
      type_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      status
      status_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      manufacturer
      manufacturer_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      model
      model_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      serialNumber
      serialNumber_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      purchaseDate
      purchaseDate_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      warrantyExpiry
      warrantyExpiry_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      lastMaintenance
      nextMaintenanceDue
      location
      assignedRoomId
      assignedRoom {
        id
        name
        roomNumber
      }
      isActive
      notes
      notes_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      createdAt
      updatedAt
    }
  }
`;

// 🎯 GET DENTAL EQUIPMENT ITEM - Single equipment query
export const GET_DENTAL_EQUIPMENT_ITEM = gql`
  query GetDentalEquipmentItem($id: UUID!) {
    dentalEquipmentItemV3(id: $id) {
      id
      name
      name_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      type
      type_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      status
      status_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      manufacturer
      manufacturer_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      model
      model_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      serialNumber
      serialNumber_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      purchaseDate
      purchaseDate_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      warrantyExpiry
      warrantyExpiry_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      lastMaintenance
      nextMaintenanceDue
      location
      assignedRoomId
      assignedRoom {
        id
        name
        roomNumber
      }
      isActive
      notes
      notes_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// MAINTENANCE QUERIES
// ============================================================================

// 🎯 GET MAINTENANCE SCHEDULE - Equipment maintenance tracking
export const GET_MAINTENANCE_SCHEDULE = gql`
  query GetMaintenanceSchedule(
    $filters: MaintenanceFilters
  ) {
    maintenanceSchedule(filters: $filters) {
      id
      equipmentId
      equipment {
        id
        name
        type
        manufacturer
        model
      }
      scheduledDate
      completedDate
      maintenanceType
      description
      technician
      cost
      status
      priority
      notes
      createdAt
      updatedAt
    }
  }
`;

// 🎯 GET ROOM CLEANING SCHEDULE - Room cleaning tracking
export const GET_ROOM_CLEANING_SCHEDULE = gql`
  query GetRoomCleaningSchedule(
    $filters: CleaningFilters
  ) {
    roomCleaningSchedule(filters: $filters) {
      id
      roomId
      room {
        id
        name
        roomNumber
      }
      scheduledDate
      completedDate
      cleaningType
      staffMember
      status
      notes
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

// 🎯 GET CLINIC RESOURCE STATS - Analytics and metrics
export const GET_CLINIC_RESOURCE_STATS = gql`
  query GetClinicResourceStats {
    clinicResourceStats {
      totalRooms
      activeRooms
      totalEquipment
      activeEquipment
      maintenanceOverdue
      cleaningOverdue
      equipmentUtilization
      roomUtilization
      maintenanceCosts
      equipmentAges
    }
  }
`;

// 🎯 GET RESOURCE UTILIZATION - Usage analytics
export const GET_RESOURCE_UTILIZATION = gql`
  query GetResourceUtilization($startDate: DateTime, $endDate: DateTime) {
    resourceUtilization(startDate: $startDate, endDate: $endDate) {
      date
      roomUtilization {
        roomId
        roomName
        utilizationPercentage
        totalAppointments
        averageDuration
      }
      equipmentUtilization {
        equipmentId
        equipmentName
        utilizationHours
        maintenanceHours
        downtimeHours
      }
    }
  }
`;

// ============================================================================
// TREATMENT ROOM MUTATIONS
// ============================================================================

// 🎯 CREATE TREATMENT ROOM - Add new room
export const CREATE_TREATMENT_ROOM = gql`
  mutation CreateTreatmentRoom($input: TreatmentRoomCreateInput!) {
    createTreatmentRoomV3(input: $input) {
      id
      name
      name_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      roomNumber
      roomNumber_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      type
      type_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      status
      status_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      capacity
      capacity_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      isActive
      notes
      notes_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      createdAt
      updatedAt
    }
  }
`;

// 🎯 UPDATE TREATMENT ROOM - Modify existing room
export const UPDATE_TREATMENT_ROOM = gql`
  mutation UpdateTreatmentRoom($id: UUID!, $input: TreatmentRoomUpdateInput!) {
    updateTreatmentRoomV3(id: $id, input: $input) {
      id
      name
      name_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      roomNumber
      roomNumber_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      type
      type_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      status
      status_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      capacity
      capacity_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      isActive
      lastCleaning
      nextCleaningDue
      notes
      notes_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      updatedAt
    }
  }
`;

// 🎯 DELETE TREATMENT ROOM - Remove room
export const DELETE_TREATMENT_ROOM = gql`
  mutation DeleteTreatmentRoom($id: UUID!) {
    deleteTreatmentRoom(id: $id)
  }
`;

// 🎯 UPDATE ROOM CLEANING - Mark cleaning as completed
export const UPDATE_ROOM_CLEANING = gql`
  mutation UpdateRoomCleaning($id: UUID!, $cleaningData: RoomCleaningUpdateInput!) {
    updateRoomCleaning(id: $id, cleaningData: $cleaningData) {
      id
      lastCleaning
      nextCleaningDue
      updatedAt
    }
  }
`;

// ============================================================================
// DENTAL EQUIPMENT MUTATIONS
// ============================================================================

// 🎯 CREATE DENTAL EQUIPMENT - Add new equipment
export const CREATE_DENTAL_EQUIPMENT = gql`
  mutation CreateDentalEquipment($input: DentalEquipmentCreateInput!) {
    createDentalEquipmentV3(input: $input) {
      id
      name
      name_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      type
      type_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      status
      status_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      manufacturer
      manufacturer_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      model
      model_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      serialNumber
      serialNumber_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      purchaseDate
      purchaseDate_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      warrantyExpiry
      warrantyExpiry_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      location
      assignedRoomId
      isActive
      notes
      notes_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      createdAt
      updatedAt
    }
  }
`;

// 🎯 UPDATE DENTAL EQUIPMENT - Modify existing equipment
export const UPDATE_DENTAL_EQUIPMENT = gql`
  mutation UpdateDentalEquipment($id: UUID!, $input: DentalEquipmentUpdateInput!) {
    updateDentalEquipmentV3(id: $id, input: $input) {
      id
      name
      name_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      type
      type_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      status
      status_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      manufacturer
      manufacturer_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      model
      model_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      serialNumber
      serialNumber_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      purchaseDate
      purchaseDate_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      warrantyExpiry
      warrantyExpiry_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      lastMaintenance
      nextMaintenanceDue
      location
      assignedRoomId
      isActive
      notes
      notes_veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
      updatedAt
    }
  }
`;

// 🎯 DELETE DENTAL EQUIPMENT - Remove equipment
export const DELETE_DENTAL_EQUIPMENT = gql`
  mutation DeleteDentalEquipment($id: UUID!) {
    deleteDentalEquipment(id: $id)
  }
`;

// 🎯 ASSIGN EQUIPMENT TO ROOM - Move equipment between rooms
export const ASSIGN_EQUIPMENT_TO_ROOM = gql`
  mutation AssignEquipmentToRoom($equipmentId: UUID!, $roomId: UUID) {
    assignEquipmentToRoom(equipmentId: $equipmentId, roomId: $roomId) {
      id
      assignedRoomId
      location
      updatedAt
    }
  }
`;

// 🎯 UPDATE EQUIPMENT MAINTENANCE - Mark maintenance as completed
export const UPDATE_EQUIPMENT_MAINTENANCE = gql`
  mutation UpdateEquipmentMaintenance($id: UUID!, $maintenanceData: EquipmentMaintenanceUpdateInput!) {
    updateEquipmentMaintenance(id: $id, maintenanceData: $maintenanceData) {
      id
      lastMaintenance
      nextMaintenanceDue
      status
      updatedAt
    }
  }
`;

// ============================================================================
// MAINTENANCE MUTATIONS
// ============================================================================

// 🎯 SCHEDULE MAINTENANCE - Create maintenance appointment
export const SCHEDULE_MAINTENANCE = gql`
  mutation ScheduleMaintenance($input: MaintenanceScheduleInput!) {
    scheduleMaintenance(input: $input) {
      id
      equipmentId
      scheduledDate
      maintenanceType
      description
      technician
      priority
      status
      createdAt
    }
  }
`;

// 🎯 COMPLETE MAINTENANCE - Mark maintenance as done
export const COMPLETE_MAINTENANCE = gql`
  mutation CompleteMaintenance($id: UUID!, $completionData: MaintenanceCompletionInput!) {
    completeMaintenance(id: $id, completionData: $completionData) {
      id
      completedDate
      cost
      status
      notes
      updatedAt
    }
  }
`;

// 🎯 SCHEDULE ROOM CLEANING - Create cleaning schedule
export const SCHEDULE_ROOM_CLEANING = gql`
  mutation ScheduleRoomCleaning($input: RoomCleaningScheduleInput!) {
    scheduleRoomCleaning(input: $input) {
      id
      roomId
      scheduledDate
      cleaningType
      status
      createdAt
    }
  }
`;

// 🎯 COMPLETE ROOM CLEANING - Mark cleaning as done
export const COMPLETE_ROOM_CLEANING = gql`
  mutation CompleteRoomCleaning($id: UUID!, $completionData: RoomCleaningCompletionInput!) {
    completeRoomCleaning(id: $id, completionData: $completionData) {
      id
      completedDate
      staffMember
      status
      notes
      updatedAt
    }
  }
`;
