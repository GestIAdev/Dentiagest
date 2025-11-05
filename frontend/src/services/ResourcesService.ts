/**
 * 🏥 RESOURCES SERVICE - REMOVED IN V130 PURGE
 * Servicio temporal vacío - migrar a GraphQL
 */

// ============================================================================
// RESOURCES SERVICE CLASS - PURGED
// ============================================================================

class ResourcesService {
  // REMOVED: All methods purged in V130 - migrate to GraphQL
  async getResourcesOverview() { return {}; }
  async checkResourceAvailability() { return {}; }
  async getMaintenanceSchedule() { return []; }
  async scheduleEquipmentMaintenance() { return {}; }
  async completeMaintenance() { return {}; }
  async optimizeResourceAllocation() { return {}; }
  async getResourcesReport() { return {}; }
  async hasOverdueMaintenance() { return false; }
  async getDashboardMetrics() { return {}; }
  async getRooms() { return []; }
  async getRoomById() { return {}; }
  async createRoom() { return {}; }
  async updateRoom() { return {}; }
  async deleteRoom() { return; }
  async getEquipment() { return []; }
  async getEquipmentById() { return {}; }
  async createEquipment() { return {}; }
  async updateEquipment() { return {}; }
  async deleteEquipment() { return; }
  async createMaintenance() { return {}; }
  async getMaintenances() { return []; }
  async getMaintenanceById() { return {}; }
  async updateMaintenance() { return {}; }
  async deleteMaintenance() { return; }
  async completeScheduledMaintenance() { return {}; }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const resourcesService = new ResourcesService();
export default resourcesService;