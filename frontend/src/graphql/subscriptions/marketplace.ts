import { gql } from '@apollo/client';

// 🛒 MARKETPLACE V3 - WebSocket Subscriptions
// Sistema completo de suscripciones real-time para marketplace B2B

export const PO_STATUS_UPDATED_SUB = gql`
  subscription PO_STATUS_UPDATED_V3($orderId: ID) {
    PO_STATUS_UPDATED_V3(orderId: $orderId) {
      id
      orderNumber
      status
      updatedAt
      supplier {
        id
        name
        email
      }
      items {
        id
        product {
          id
          name
          sku
        }
        quantity
        unitPrice
        totalPrice
      }
      subtotal
      tax
      shippingCost
      total
    }
  }
`;

export const MARKETPLACE_PRODUCT_CREATED_SUB = gql`
  subscription marketplaceProductV3Created {
    marketplaceProductV3Created {
      id
      name
      description
      category
      price
      stock
      featured
      newArrival
      createdAt
    }
  }
`;

export const MARKETPLACE_PRODUCT_UPDATED_SUB = gql`
  subscription marketplaceProductV3Updated {
    marketplaceProductV3Updated {
      id
      name
      description
      category
      price
      stock
      featured
      newArrival
      updatedAt
    }
  }
`;

export const PURCHASE_ORDER_CREATED_SUB = gql`
  subscription purchaseOrderV3Created {
    purchaseOrderV3Created {
      id
      orderNumber
      status
      orderDate
      supplier {
        id
        name
        email
      }
      total
      createdAt
    }
  }
`;

export const PURCHASE_ORDER_UPDATED_SUB = gql`
  subscription purchaseOrderV3Updated {
    purchaseOrderV3Updated {
      id
      orderNumber
      status
      estimatedDeliveryDate
      actualDeliveryDate
      supplier {
        id
        name
        email
      }
      total
      updatedAt
    }
  }
`;

export const SUPPLIER_CREATED_SUB = gql`
  subscription supplierV3Created {
    supplierV3Created {
      id
      name
      email
      phone
      rating
      totalReviews
      verified
      categories
      active
      createdAt
    }
  }
`;

export const SUPPLIER_UPDATED_SUB = gql`
  subscription supplierV3Updated {
    supplierV3Updated {
      id
      name
      email
      phone
      rating
      totalReviews
      verified
      categories
      active
      updatedAt
    }
  }
`;