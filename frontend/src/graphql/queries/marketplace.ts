// 🎯🎸💀 MARKETPLACE GRAPHQL QUERIES V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 26, 2025
// Mission: Complete GraphQL integration for marketplace operations
// Status: V3.0 - Full marketplace system with @veritas quantum verification
// Challenge: Real-time marketplace operations with quantum truth verification
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on all marketplace transactions

import { gql } from '@apollo/client';

// 🎯 PURCHASE ORDER QUERIES - V3.0 Enhanced
export const GET_PURCHASE_ORDERS = gql`
  query GetPurchaseOrdersV3(
    $status: String
    $supplierId: String
    $search: String
    $limit: Int = 50
    $offset: Int = 0
  ) {
    purchaseOrdersV3(
      status: $status
      supplierId: $supplierId
      search: $search
      limit: $limit
      offset: $offset
    ) {
      id
      orderNumber
      orderNumber_veritas
      supplierId
      supplierName
      supplierName_veritas
      status
      status_veritas
      orderDate
      estimatedDeliveryDate
      actualDeliveryDate
      totalAmount
      totalAmount_veritas
      taxAmount
      shippingCost
      notes
      notes_veritas
      items {
        id
        productName
        productName_veritas
        quantity
        unitPrice
        totalPrice
        receivedQuantity
      }
      createdBy
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

export const GET_PURCHASE_ORDER = gql`
  query GetPurchaseOrderV3($id: ID!) {
    purchaseOrderV3(id: $id) {
      id
      orderNumber
      orderNumber_veritas
      supplierId
      supplierName
      supplierName_veritas
      status
      status_veritas
      orderDate
      estimatedDeliveryDate
      actualDeliveryDate
      totalAmount
      totalAmount_veritas
      taxAmount
      shippingCost
      notes
      notes_veritas
      items {
        id
        productName
        productName_veritas
        quantity
        unitPrice
        totalPrice
        receivedQuantity
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
      createdBy
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

// 🎯 PURCHASE ORDER MUTATIONS - V3.0 Enhanced
export const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrderV3($input: CreatePurchaseOrderInputV3!) {
    createPurchaseOrderV3(input: $input) {
      id
      orderNumber
      orderNumber_veritas
      supplierId
      supplierName
      supplierName_veritas
      status
      status_veritas
      orderDate
      estimatedDeliveryDate
      totalAmount
      totalAmount_veritas
      taxAmount
      shippingCost
      notes
      notes_veritas
      items {
        id
        productName
        productName_veritas
        quantity
        unitPrice
        totalPrice
      }
      createdBy
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
  mutation UpdatePurchaseOrderV3($id: ID!, $input: UpdatePurchaseOrderInputV3!) {
    updatePurchaseOrderV3(id: $id, input: $input) {
      id
      orderNumber
      orderNumber_veritas
      supplierId
      supplierName
      supplierName_veritas
      status
      status_veritas
      orderDate
      estimatedDeliveryDate
      actualDeliveryDate
      totalAmount
      totalAmount_veritas
      taxAmount
      shippingCost
      notes
      notes_veritas
      items {
        id
        productName
        productName_veritas
        quantity
        unitPrice
        totalPrice
        receivedQuantity
      }
      createdBy
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

export const DELETE_PURCHASE_ORDER = gql`
  mutation DeletePurchaseOrderV3($id: ID!) {
    deletePurchaseOrderV3(id: $id) {
      success
      message
    }
  }
`;

// 🎯 SUPPLIER QUERIES - V3.0 Enhanced
export const GET_SUPPLIERS = gql`
  query GetSuppliersV3($search: String, $limit: Int = 100, $offset: Int = 0) {
    suppliersV3(search: $search, limit: $limit, offset: $offset) {
      id
      name
      name_veritas
      contactName
      contactName_veritas
      email
      email_veritas
      phone
      phone_veritas
      address
      address_veritas
      taxId
      taxId_veritas
      paymentTerms
      paymentTerms_veritas
      creditLimit
      creditLimit_veritas
      isActive
      isActive_veritas
      categories
      categories_veritas
      rating
      rating_veritas
      lastOrderDate
      totalOrders
      totalSpent
      totalSpent_veritas
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

export const GET_SUPPLIER = gql`
  query GetSupplierV3($id: ID!) {
    supplierV3(id: $id) {
      id
      name
      name_veritas
      contactName
      contactName_veritas
      email
      email_veritas
      phone
      phone_veritas
      address
      address_veritas
      taxId
      taxId_veritas
      paymentTerms
      paymentTerms_veritas
      creditLimit
      creditLimit_veritas
      isActive
      isActive_veritas
      categories
      categories_veritas
      rating
      rating_veritas
      lastOrderDate
      totalOrders
      totalSpent
      totalSpent_veritas
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

// 🎯 SUPPLIER MUTATIONS - V3.0 Enhanced
export const CREATE_SUPPLIER = gql`
  mutation CreateSupplierV3($input: CreateSupplierInputV3!) {
    createSupplierV3(input: $input) {
      id
      name
      name_veritas
      contactName
      contactName_veritas
      email
      email_veritas
      phone
      phone_veritas
      address
      address_veritas
      taxId
      taxId_veritas
      paymentTerms
      paymentTerms_veritas
      creditLimit
      creditLimit_veritas
      isActive
      isActive_veritas
      categories
      categories_veritas
      rating
      rating_veritas
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
  mutation UpdateSupplierV3($input: UpdateSupplierInputV3!) {
    updateSupplierV3(input: $input) {
      id
      name
      name_veritas
      contactName
      contactName_veritas
      email
      email_veritas
      phone
      phone_veritas
      address
      address_veritas
      taxId
      taxId_veritas
      paymentTerms
      paymentTerms_veritas
      creditLimit
      creditLimit_veritas
      isActive
      isActive_veritas
      categories
      categories_veritas
      rating
      rating_veritas
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
  mutation DeleteSupplierV3($id: ID!) {
    deleteSupplierV3(id: $id) {
      success
      message
    }
  }
`;

// 🎯 SHOPPING CART QUERIES - V3.0 Enhanced
export const GET_SHOPPING_CART = gql`
  query GetShoppingCartV3($userId: ID!) {
    cartItemsV3(userId: $userId) {
      id
      userId
      productId
      quantity
      unitPrice
      totalPrice
      notes
      addedAt
      product {
        id
        name
        category
        sku
        price
      }
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

export const ADD_TO_CART = gql`
  mutation AddToCartV3($input: AddToCartInputV3!) {
    addToCartV3(input: $input) {
      id
      userId
      userId_veritas
      items {
        id
        productId
        productId_veritas
        productName
        productName_veritas
        quantity
        unitPrice
        unitPrice_veritas
        totalPrice
        totalPrice_veritas
        supplierId
        supplierId_veritas
        supplierName
        supplierName_veritas
        addedAt
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
      subtotal
      subtotal_veritas
      taxAmount
      taxAmount_veritas
      shippingCost
      shippingCost_veritas
      totalAmount
      totalAmount_veritas
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

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItemV3($cartId: ID!, $itemId: ID!, $input: UpdateCartItemInputV3!) {
    updateCartItemV3(cartId: $cartId, itemId: $itemId, input: $input) {
      id
      userId
      userId_veritas
      items {
        id
        productId
        productId_veritas
        productName
        productName_veritas
        quantity
        unitPrice
        unitPrice_veritas
        totalPrice
        totalPrice_veritas
        supplierId
        supplierId_veritas
        supplierName
        supplierName_veritas
        addedAt
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
      subtotal
      subtotal_veritas
      taxAmount
      taxAmount_veritas
      shippingCost
      shippingCost_veritas
      totalAmount
      totalAmount_veritas
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

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCartV3($cartId: ID!, $itemId: ID!) {
    removeFromCartV3(cartId: $cartId, itemId: $itemId) {
      success
      message
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCartV3($cartId: ID!) {
    clearCartV3(cartId: $cartId) {
      success
      message
    }
  }
`;

export const CHECKOUT_CART = gql`
  mutation CheckoutCartV3($cartId: ID!, $input: CheckoutCartInputV3!) {
    checkoutCartV3(cartId: $cartId, input: $input) {
      success
      message
      purchaseOrderId
      purchaseOrder {
        id
        orderNumber
        orderNumber_veritas
        status
        status_veritas
        totalAmount
        totalAmount_veritas
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
  }
`;

// 🎯 SUBSCRIPTIONS - Real-time Marketplace Updates
export const PURCHASE_ORDER_UPDATED_SUBSCRIPTION = gql`
  subscription PurchaseOrderUpdatedV3 {
    purchaseOrderUpdatedV3 {
      id
      orderNumber
      orderNumber_veritas
      supplierId
      supplierName
      supplierName_veritas
      status
      status_veritas
      orderDate
      estimatedDeliveryDate
      actualDeliveryDate
      totalAmount
      totalAmount_veritas
      taxAmount
      shippingCost
      notes
      notes_veritas
      items {
        id
        productName
        productName_veritas
        quantity
        unitPrice
        totalPrice
        receivedQuantity
      }
      createdBy
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

export const SUPPLIER_UPDATED_SUBSCRIPTION = gql`
  subscription SupplierUpdatedV3 {
    supplierUpdatedV3 {
      id
      name
      name_veritas
      contactName
      contactName_veritas
      email
      email_veritas
      phone
      phone_veritas
      address
      address_veritas
      taxId
      taxId_veritas
      paymentTerms
      paymentTerms_veritas
      creditLimit
      creditLimit_veritas
      isActive
      isActive_veritas
      categories
      categories_veritas
      rating
      rating_veritas
      lastOrderDate
      totalOrders
      totalSpent
      totalSpent_veritas
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

export const SHOPPING_CART_UPDATED_SUBSCRIPTION = gql`
  subscription ShoppingCartUpdatedV3($userId: ID!) {
    shoppingCartUpdatedV3(userId: $userId) {
      id
      userId
      userId_veritas
      items {
        id
        productId
        productId_veritas
        productName
        productName_veritas
        quantity
        unitPrice
        unitPrice_veritas
        totalPrice
        totalPrice_veritas
        supplierId
        supplierId_veritas
        supplierName
        supplierName_veritas
        addedAt
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
      subtotal
      subtotal_veritas
      taxAmount
      taxAmount_veritas
      shippingCost
      shippingCost_veritas
      totalAmount
      totalAmount_veritas
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

// 🎯 MARKETPLACE ANALYTICS QUERIES - V3.0 Enhanced
export const GET_MARKETPLACE_ANALYTICS = gql`
  query GetMarketplaceAnalyticsV3($period: String = "30d") {
    marketplaceAnalyticsV3(period: $period) {
      totalOrders
      totalOrders_veritas
      totalValue
      totalValue_veritas
      avgOrderValue
      avgOrderValue_veritas
      topSuppliers {
        supplierId
        supplierId_veritas
        supplierName
        supplierName_veritas
        orderCount
        orderCount_veritas
        totalValue
        totalValue_veritas
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
      orderStatusDistribution {
        status
        status_veritas
        count
        count_veritas
        percentage
        percentage_veritas
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
      monthlyTrends {
        month
        month_veritas
        orders
        orders_veritas
        value
        value_veritas
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

// 🎯 PRODUCT CATALOG QUERIES - V3.0 Enhanced
export const GET_PRODUCT_CATALOG = gql`
  query GetProductCatalogV3(
    $supplierId: ID
    $category: String
    $search: String
    $limit: Int = 100
    $offset: Int = 0
  ) {
    productCatalogV3(
      supplierId: $supplierId
      category: $category
      search: $search
      limit: $limit
      offset: $offset
    ) {
      id
      name
      name_veritas
      description
      description_veritas
      category
      category_veritas
      supplierId
      supplierId_veritas
      supplierName
      supplierName_veritas
      sku
      sku_veritas
      unitPrice
      unitPrice_veritas
      minOrderQuantity
      minOrderQuantity_veritas
      maxOrderQuantity
      maxOrderQuantity_veritas
      stockQuantity
      stockQuantity_veritas
      isActive
      isActive_veritas
      images
      images_veritas
      specifications
      specifications_veritas
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
