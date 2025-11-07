import { gql } from '@apollo/client';

// ===== MARKETPLACE QUERIES =====
export const GET_PURCHASE_ORDERS = gql`
  query GetPurchaseOrders($clinicId: ID!, $status: String, $limit: Int, $offset: Int) {
    purchaseOrders(clinicId: $clinicId, status: $status, limit: $limit, offset: $offset) {
      id
      orderNumber
      supplierId
      supplierName
      items {
        id
        productId
        productName
        quantity
        unitPrice
        totalPrice
        veritasVerification {
          level
          status
          timestamp
          quantumHash
        }
      }
      totalAmount
      status
      orderDate
      expectedDeliveryDate
      actualDeliveryDate
      notes
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_PURCHASE_ORDER_BY_ID = gql`
  query GetPurchaseOrderById($id: ID!) {
    purchaseOrder(id: $id) {
      id
      orderNumber
      supplierId
      supplierName
      items {
        id
        productId
        productName
        quantity
        unitPrice
        totalPrice
        veritasVerification {
          level
          status
          timestamp
          quantumHash
        }
      }
      totalAmount
      status
      orderDate
      expectedDeliveryDate
      actualDeliveryDate
      notes
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_SUPPLIERS = gql`
  query GetSuppliers($clinicId: ID!, $active: Boolean, $limit: Int, $offset: Int) {
    suppliers(clinicId: $clinicId, active: $active, limit: $limit, offset: $offset) {
      id
      name
      contactPerson
      email
      phone
      address {
        street
        city
        state
        zipCode
        country
      }
      taxId
      paymentTerms
      active
      rating
      totalOrders
      totalSpent
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_SUPPLIER_BY_ID = gql`
  query GetSupplierById($id: ID!) {
    supplier(id: $id) {
      id
      name
      contactPerson
      email
      phone
      address {
        street
        city
        state
        zipCode
        country
      }
      taxId
      paymentTerms
      active
      rating
      totalOrders
      totalSpent
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_SHOPPING_CART = gql`
  query GetShoppingCart($clinicId: ID!) {
    shoppingCart(clinicId: $clinicId) {
      id
      clinicId
      items {
        id
        productId
        productName
        supplierId
        supplierName
        quantity
        unitPrice
        totalPrice
        veritasVerification {
          level
          status
          timestamp
          quantumHash
        }
      }
      totalAmount
      itemCount
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

// ===== MARKETPLACE MUTATIONS =====
export const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrder($input: CreatePurchaseOrderInput!) {
    createPurchaseOrder(input: $input) {
      id
      orderNumber
      supplierId
      supplierName
      items {
        id
        productId
        productName
        quantity
        unitPrice
        totalPrice
        veritasVerification {
          level
          status
          timestamp
          quantumHash
        }
      }
      totalAmount
      status
      orderDate
      expectedDeliveryDate
      notes
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PURCHASE_ORDER = gql`
  mutation UpdatePurchaseOrder($id: ID!, $input: UpdatePurchaseOrderInput!) {
    updatePurchaseOrder(id: $id, input: $input) {
      id
      orderNumber
      supplierId
      supplierName
      items {
        id
        productId
        productName
        quantity
        unitPrice
        totalPrice
        veritasVerification {
          level
          status
          timestamp
          quantumHash
        }
      }
      totalAmount
      status
      orderDate
      expectedDeliveryDate
      actualDeliveryDate
      notes
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PURCHASE_ORDER = gql`
  mutation DeletePurchaseOrder($id: ID!) {
    deletePurchaseOrder(id: $id) {
      success
      message
    }
  }
`;

export const CREATE_SUPPLIER = gql`
  mutation CreateSupplier($input: CreateSupplierInput!) {
    createSupplier(input: $input) {
      id
      name
      contactPerson
      email
      phone
      address {
        street
        city
        state
        zipCode
        country
      }
      taxId
      paymentTerms
      active
      rating
      totalOrders
      totalSpent
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SUPPLIER = gql`
  mutation UpdateSupplier($id: ID!, $input: UpdateSupplierInput!) {
    updateSupplier(id: $id, input: $input) {
      id
      name
      contactPerson
      email
      phone
      address {
        street
        city
        state
        zipCode
        country
      }
      taxId
      paymentTerms
      active
      rating
      totalOrders
      totalSpent
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SUPPLIER = gql`
  mutation DeleteSupplier($id: ID!) {
    deleteSupplier(id: $id) {
      success
      message
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      id
      clinicId
      items {
        id
        productId
        productName
        supplierId
        supplierName
        quantity
        unitPrice
        totalPrice
        veritasVerification {
          level
          status
          timestamp
          quantumHash
        }
      }
      totalAmount
      itemCount
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($id: ID!, $quantity: Int!) {
    updateCartItem(id: $id, quantity: $quantity) {
      id
      clinicId
      items {
        id
        productId
        productName
        supplierId
        supplierName
        quantity
        unitPrice
        totalPrice
        veritasVerification {
          level
          status
          timestamp
          quantumHash
        }
      }
      totalAmount
      itemCount
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($id: ID!) {
    removeFromCart(id: $id) {
      id
      clinicId
      items {
        id
        productId
        productName
        supplierId
        supplierName
        quantity
        unitPrice
        totalPrice
        veritasVerification {
          level
          status
          timestamp
          quantumHash
        }
      }
      totalAmount
      itemCount
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart($clinicId: ID!) {
    clearCart(clinicId: $clinicId) {
      success
      message
    }
  }
`;

export const CHECKOUT_CART = gql`
  mutation CheckoutCart($clinicId: ID!, $input: CheckoutCartInput!) {
    checkoutCart(clinicId: $clinicId, input: $input) {
      id
      orderNumber
      supplierId
      supplierName
      items {
        id
        productId
        productName
        quantity
        unitPrice
        totalPrice
        veritasVerification {
          level
          status
          timestamp
          quantumHash
        }
      }
      totalAmount
      status
      orderDate
      expectedDeliveryDate
      notes
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

// ===== MARKETPLACE SUBSCRIPTIONS =====
export const PURCHASE_ORDER_UPDATED_SUBSCRIPTION = gql`
  subscription OnPurchaseOrderUpdated($clinicId: ID!) {
    purchaseOrderUpdated(clinicId: $clinicId) {
      id
      orderNumber
      supplierId
      supplierName
      items {
        id
        productId
        productName
        quantity
        unitPrice
        totalPrice
        veritasVerification {
          level
          status
          timestamp
          quantumHash
        }
      }
      totalAmount
      status
      orderDate
      expectedDeliveryDate
      actualDeliveryDate
      notes
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

export const SUPPLIER_UPDATED_SUBSCRIPTION = gql`
  subscription OnSupplierUpdated($clinicId: ID!) {
    supplierUpdated(clinicId: $clinicId) {
      id
      name
      contactPerson
      email
      phone
      address {
        street
        city
        state
        zipCode
        country
      }
      taxId
      paymentTerms
      active
      rating
      totalOrders
      totalSpent
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

export const SHOPPING_CART_UPDATED_SUBSCRIPTION = gql`
  subscription OnShoppingCartUpdated($clinicId: ID!) {
    shoppingCartUpdated(clinicId: $clinicId) {
      id
      clinicId
      items {
        id
        productId
        productName
        supplierId
        supplierName
        quantity
        unitPrice
        totalPrice
        veritasVerification {
          level
          status
          timestamp
          quantumHash
        }
      }
      totalAmount
      itemCount
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

// ===== BILLING SUBSCRIPTIONS =====
export const BILLING_INVOICE_UPDATED_SUBSCRIPTION = gql`
  subscription OnBillingInvoiceUpdated($clinicId: ID!) {
    billingInvoiceUpdated(clinicId: $clinicId) {
      id
      invoiceNumber
      patientId
      patientName
      amount
      status
      dueDate
      paidDate
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

export const BILLING_PAYMENT_UPDATED_SUBSCRIPTION = gql`
  subscription OnBillingPaymentUpdated($clinicId: ID!) {
    billingPaymentUpdated(clinicId: $clinicId) {
      id
      invoiceId
      amount
      paymentMethod
      status
      processedAt
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

// ===== COMPLIANCE SUBSCRIPTIONS =====
export const COMPLIANCE_AUDIT_UPDATED_SUBSCRIPTION = gql`
  subscription OnComplianceAuditUpdated($clinicId: ID!) {
    complianceAuditUpdated(clinicId: $clinicId) {
      id
      auditType
      status
      findings
      recommendations
      complianceScore
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;

export const COMPLIANCE_REGULATION_UPDATED_SUBSCRIPTION = gql`
  subscription OnComplianceRegulationUpdated($clinicId: ID!) {
    complianceRegulationUpdated(clinicId: $clinicId) {
      id
      regulationType
      title
      description
      effectiveDate
      complianceDeadline
      status
      veritasVerification {
        level
        status
        timestamp
        quantumHash
      }
      createdAt
      updatedAt
    }
  }
`;
