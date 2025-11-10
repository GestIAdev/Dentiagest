import { gql } from '@apollo/client';

// ============================================================================
// INVENTORY V3 SUBSCRIPTIONS - ALIGNED WITH BACKEND SCHEMA
// ============================================================================

export const INVENTORY_V3_CREATED = gql`
  subscription InventoryV3Created {
    inventoryV3Created {
      id
      itemName
      itemCode
      supplierId
      category
      quantity
      unitPrice
      description
      isActive
      createdAt
      updatedAt
      _veritas {
        itemName {
          verified
          confidence
          level
          certificate
          error
          verifiedAt
          algorithm
        }
        itemCode {
          verified
          confidence
          level
          certificate
          error
          verifiedAt
          algorithm
        }
        supplierId {
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
  }
`;

export const INVENTORY_V3_UPDATED = gql`
  subscription InventoryV3Updated {
    inventoryV3Updated {
      id
      itemName
      itemCode
      supplierId
      category
      quantity
      unitPrice
      description
      isActive
      createdAt
      updatedAt
      _veritas {
        itemName {
          verified
          confidence
          level
          certificate
          verifiedAt
          algorithm
        }
        itemCode {
          verified
          confidence
          level
          certificate
          verifiedAt
          algorithm
        }
        supplierId {
          verified
          confidence
          level
          certificate
          verifiedAt
          algorithm
        }
      }
    }
  }
`;

export const INVENTORY_V3_DELETED = gql`
  subscription InventoryV3Deleted {
    inventoryV3Deleted {
      id
      deleted
    }
  }
`;

export const STOCK_LEVEL_CHANGED = gql`
  subscription StockLevelChanged($itemId: ID!, $newQuantity: Int!, $threshold: Int!) {
    stockLevelChanged(itemId: $itemId, newQuantity: $newQuantity, threshold: $threshold) {
      id
      itemName
      itemCode
      quantity
      category
      unitPrice
      isActive
      createdAt
      updatedAt
    }
  }
`;