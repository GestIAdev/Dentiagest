// 🎯🎸💀 GRAPHQL MUTATIONS - INVENTORY MANAGEMENT V3.0
/**
 * GraphQL Mutations for Inventory Management V3.0
 *
 * 🎯 MISSION: Provide unified inventory mutations with V3.0 features
 * ✅ Materials management (Inventory operations)
 * ✅ Equipment tracking and maintenance
 * ✅ Supplier management
 * ✅ Purchase orders and procurement
 */

import { gql } from '@apollo/client';

// ============================================================================
// INVENTORY (MATERIALS) MUTATIONS
// ============================================================================

export const CREATE_MATERIAL = gql`
  mutation CreateMaterial($input: DentalMaterialV3Input!) {
    createMaterialV3(input: $input) {
      id
      name
      name_veritas
      description
      category
      sku
      currentStock
      minimumStock
      maximumStock
      unitPrice
      totalValue
      supplierId
      expiryDate
      batchNumber
      location
      status
      createdAt
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const UPDATE_MATERIAL = gql`
  mutation UpdateMaterial($id: ID!, $input: UpdateDentalMaterialV3Input!) {
    updateMaterialV3(id: $id, input: $input) {
      id
      name
      name_veritas
      description
      category
      sku
      currentStock
      minimumStock
      maximumStock
      unitPrice
      totalValue
      status
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const DELETE_MATERIAL = gql`
  mutation DeleteMaterial($id: ID!) {
    deleteMaterialV3(id: $id)
  }
`;

// Compatibility aliases
export const CREATE_DENTAL_MATERIAL = CREATE_MATERIAL;
export const UPDATE_DENTAL_MATERIAL = UPDATE_MATERIAL;
export const DELETE_DENTAL_MATERIAL = DELETE_MATERIAL;

// ============================================================================
// EQUIPMENT MUTATIONS
// ============================================================================

export const CREATE_EQUIPMENT = gql`
  mutation CreateEquipment($input: EquipmentV3Input!) {
    createEquipmentV3(input: $input) {
      id
      name
      name_veritas
      description
      category
      serialNumber
      model
      manufacturer
      purchaseDate
      warrantyExpiry
      location
      status
      condition
      purchasePrice
      createdAt
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const UPDATE_EQUIPMENT = gql`
  mutation UpdateEquipment($id: ID!, $input: UpdateEquipmentV3Input!) {
    updateEquipmentV3(id: $id, input: $input) {
      id
      name
      category
      status
      condition
      location
      lastMaintenance
      nextMaintenance
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const DELETE_EQUIPMENT = gql`
  mutation DeleteEquipment($id: ID!) {
    deleteEquipmentV3(id: $id)
  }
`;

// ============================================================================
// MAINTENANCE MUTATIONS
// ============================================================================

export const CREATE_MAINTENANCE = gql`
  mutation CreateMaintenance($input: MaintenanceV3Input!) {
    createMaintenanceV3(input: $input) {
      id
      equipmentId
      scheduledDate
      maintenanceType
      description
      priority
      estimatedCost
      estimatedDuration
      technician
      status
      notes
      createdAt
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const UPDATE_MAINTENANCE = gql`
  mutation UpdateMaintenance($id: ID!, $input: UpdateMaintenanceV3Input!) {
    updateMaintenanceV3(id: $id, input: $input) {
      id
      scheduledDate
      maintenanceType
      description
      priority
      estimatedCost
      technician
      status
      notes
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const DELETE_MAINTENANCE = gql`
  mutation DeleteMaintenance($id: ID!) {
    deleteMaintenanceV3(id: $id)
  }
`;

// ============================================================================
// SUPPLIER MUTATIONS
// ============================================================================

export const CREATE_SUPPLIER = gql`
  mutation CreateSupplier($input: SupplierV3CreateInput!) {
    createSupplierV3(input: $input) {
      id
      name
      email
      phone
      address {
        street
        city
        state
        zipCode
        country
      }
      rating
      totalReviews
      verified
      categories
      paymentTerms
      minimumOrderValue
      shippingMethods
      certifications
      active
      createdAt
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const UPDATE_SUPPLIER = gql`
  mutation UpdateSupplier($id: ID!, $input: SupplierV3UpdateInput!) {
    updateSupplierV3(id: $id, input: $input) {
      id
      name
      email
      phone
      address {
        street
        city
        state
        zipCode
        country
      }
      rating
      paymentTerms
      active
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const DELETE_SUPPLIER = gql`
  mutation DeleteSupplier($id: ID!) {
    deleteSupplierV3(id: $id)
  }
`;

// ============================================================================
// PURCHASE ORDER MUTATIONS
// ============================================================================

export const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrder($input: PurchaseOrderV3CreateInput!) {
    createPurchaseOrderV3(input: $input) {
      id
      orderNumber
      supplierId
      status
      orderDate
      estimatedDeliveryDate
      actualDeliveryDate
      subtotal
      tax
      shippingCost
      total
      notes
      items {
        id
        productId
        quantity
        unitPrice
        totalPrice
      }
      createdAt
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const UPDATE_PURCHASE_ORDER = gql`
  mutation UpdatePurchaseOrder($id: ID!, $input: PurchaseOrderV3UpdateInput!) {
    updatePurchaseOrderV3(id: $id, input: $input) {
      id
      status
      estimatedDeliveryDate
      actualDeliveryDate
      notes
      updatedAt
      _veritas {
        verified
        confidence
        level
        certificate
        error
        verifiedAt
        algorithm
      }
    }
  }
`;

export const DELETE_PURCHASE_ORDER = gql`
  mutation DeletePurchaseOrder($id: ID!) {
    deletePurchaseOrderV3(id: $id)
  }
`;
