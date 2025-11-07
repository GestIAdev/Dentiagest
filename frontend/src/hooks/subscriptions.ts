import { gql, useSubscription } from '@apollo/client';

// MedicalRecords V3 Subscriptions
export const MEDICAL_RECORD_V3_CREATED = gql`
  subscription MedicalRecordV3Created {
    medicalRecordV3Created {
      id
      patientId
      diagnosis
      treatment
      notes
      createdAt
      updatedAt
    }
  }
`;

export const MEDICAL_RECORD_V3_UPDATED = gql`
  subscription MedicalRecordV3Updated {
    medicalRecordV3Updated {
      id
      patientId
      diagnosis
      treatment
      notes
      createdAt
      updatedAt
    }
  }
`;

export const MEDICAL_RECORD_V3_DELETED = gql`
  subscription MedicalRecordV3Deleted {
    medicalRecordV3Deleted
  }
`;

// Hooks for MedicalRecords V3
export const useMedicalRecordV3Created = () => useSubscription(MEDICAL_RECORD_V3_CREATED);
export const useMedicalRecordV3Updated = () => useSubscription(MEDICAL_RECORD_V3_UPDATED);
export const useMedicalRecordV3Deleted = () => useSubscription(MEDICAL_RECORD_V3_DELETED);

export const useMedicalRecordsSubscriptionsV3 = () => ({
  created: useMedicalRecordV3Created(),
  updated: useMedicalRecordV3Updated(),
  deleted: useMedicalRecordV3Deleted(),
});

// Inventory V3 Subscriptions (from V135)
export const INVENTORY_V3_CREATED = gql`
  subscription InventoryV3Created {
    inventoryV3Created {
      id
      name
      quantity
      unit
      createdAt
      updatedAt
    }
  }
`;

export const INVENTORY_V3_UPDATED = gql`
  subscription InventoryV3Updated {
    inventoryV3Updated {
      id
      name
      quantity
      unit
      createdAt
      updatedAt
    }
  }
`;

export const INVENTORY_V3_DELETED = gql`
  subscription InventoryV3Deleted {
    inventoryV3Deleted
  }
`;

export const STOCK_LEVEL_CHANGED = gql`
  subscription StockLevelChanged {
    stockLevelChanged {
      itemId
      oldQuantity
      newQuantity
      threshold
    }
  }
`;

// Hooks for Inventory V3
export const useInventoryV3Created = () => useSubscription(INVENTORY_V3_CREATED);
export const useInventoryV3Updated = () => useSubscription(INVENTORY_V3_UPDATED);
export const useInventoryV3Deleted = () => useSubscription(INVENTORY_V3_DELETED);
export const useStockLevelChanged = () => useSubscription(STOCK_LEVEL_CHANGED);

export const useInventorySubscriptionsV3 = () => ({
  created: useInventoryV3Created(),
  updated: useInventoryV3Updated(),
  deleted: useInventoryV3Deleted(),
});
