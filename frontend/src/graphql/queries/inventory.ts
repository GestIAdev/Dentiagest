// 🎯🎸💀 GRAPHQL QUERIES - INVENTORY MANAGEMENT V3.0
/**
 * GraphQL Queries for Inventory Management V3.0
 *
 * 🎯 MISSION: Provide unified inventory queries with V3.0 features and @veritas
 * ✅ Materials management with AI insights
 * ✅ Equipment tracking and maintenance
 * ✅ Supplier management and contracts
 * ✅ Purchase orders and procurement
 * ✅ Real-time inventory analytics
 * ✅ @veritas quantum truth verification
 */

import { gql } from '@apollo/client';

// ============================================================================
// INVENTORY DASHBOARD QUERIES
// ============================================================================

export const GET_INVENTORY_DASHBOARD = gql`
  query GetInventoryDashboard {
    inventoryDashboardV3 {
      totalMaterials
      lowStockAlerts
      activeEquipment
      maintenanceDue
      totalSuppliers
      pendingOrders
      totalValue
      totalValue_veritas

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

// ============================================================================
// DENTAL MATERIALS QUERIES
// ============================================================================

export const GET_DENTAL_MATERIALS = gql`
  query GetDentalMaterials(
    $category: String
    $searchTerm: String
    $lowStockOnly: Boolean
    $limit: Int
    $offset: Int
  ) {
    dentalMaterialsV3(
      category: $category
      searchTerm: $searchTerm
      lowStockOnly: $lowStockOnly
      limit: $limit
      offset: $offset
    ) {
      id
      name
      name_veritas
      description
      description_veritas
      category
      sku
      currentStock
      minimumStock
      maximumStock
      unitPrice
      totalValue
      totalValue_veritas
      supplierId
      expiryDate
      batchNumber
      location
      status
      status_veritas
      lastUpdated
      createdAt

      # RELATIONS
      supplier {
        id
        name
        contactInfo
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const GET_DENTAL_MATERIAL = gql`
  query GetDentalMaterial($id: ID!) {
    dentalMaterialV3(id: $id) {
      id
      name
      name_veritas
      description
      description_veritas
      category
      sku
      currentStock
      minimumStock
      maximumStock
      unitPrice
      totalValue
      totalValue_veritas
      supplierId
      expiryDate
      batchNumber
      location
      status
      status_veritas
      lastUpdated
      createdAt

      # RELATIONS
      supplier {
        id
        name
        contactInfo
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const CREATE_DENTAL_MATERIAL = gql`
  mutation CreateDentalMaterial($input: CreateDentalMaterialInput!) {
    createDentalMaterialV3(input: $input) {
      id
      name
      name_veritas
      description
      description_veritas
      category
      sku
      currentStock
      minimumStock
      maximumStock
      unitPrice
      totalValue
      totalValue_veritas
      supplierId
      expiryDate
      batchNumber
      location
      status
      status_veritas
      lastUpdated
      createdAt

      # RELATIONS
      supplier {
        id
        name
        contactInfo
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const UPDATE_DENTAL_MATERIAL = gql`
  mutation UpdateDentalMaterial($id: ID!, $input: UpdateDentalMaterialInput!) {
    updateDentalMaterialV3(id: $id, input: $input) {
      id
      name
      name_veritas
      description
      description_veritas
      category
      sku
      currentStock
      minimumStock
      maximumStock
      unitPrice
      totalValue
      totalValue_veritas
      supplierId
      expiryDate
      batchNumber
      location
      status
      status_veritas
      lastUpdated
      createdAt

      # RELATIONS
      supplier {
        id
        name
        contactInfo
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const DELETE_DENTAL_MATERIAL = gql`
  mutation DeleteDentalMaterial($id: ID!) {
    deleteDentalMaterialV3(id: $id) {
      id
      name
      name_veritas
      status
      status_veritas

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

// ============================================================================
// EQUIPMENT QUERIES
// ============================================================================

export const GET_EQUIPMENT = gql`
  query GetEquipment(
    $category: String
    $status: String
    $maintenanceDue: Boolean
    $limit: Int
    $offset: Int
  ) {
    equipmentV3(
      category: $category
      status: $status
      maintenanceDue: $maintenanceDue
      limit: $limit
      offset: $offset
    ) {
      id
      name
      name_veritas
      description
      description_veritas
      category
      serialNumber
      model
      manufacturer
      purchaseDate
      warrantyExpiry
      location
      status
      status_veritas
      condition
      lastMaintenance
      nextMaintenance
      maintenanceInterval
      supplierId
      purchasePrice
      currentValue
      currentValue_veritas
      depreciationRate
      createdAt
      updatedAt

      # RELATIONS
      supplier {
        id
        name
        contactInfo
      }

      # MAINTENANCE HISTORY
      maintenanceHistory {
        id
        date
        type
        description
        cost
        technician
        nextDue
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const GET_EQUIPMENT_ITEM = gql`
  query GetEquipmentItem($id: ID!) {
    equipmentItemV3(id: $id) {
      id
      name
      name_veritas
      description
      description_veritas
      category
      serialNumber
      model
      manufacturer
      purchaseDate
      warrantyExpiry
      location
      status
      status_veritas
      condition
      lastMaintenance
      nextMaintenance
      maintenanceInterval
      supplierId
      purchasePrice
      currentValue
      currentValue_veritas
      depreciationRate
      createdAt
      updatedAt

      # RELATIONS
      supplier {
        id
        name
        contactInfo
      }

      # MAINTENANCE HISTORY
      maintenanceHistory {
        id
        date
        type
        description
        cost
        technician
        nextDue
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const CREATE_EQUIPMENT = gql`
  mutation CreateEquipment($input: CreateEquipmentInput!) {
    createEquipmentV3(input: $input) {
      id
      name
      name_veritas
      description
      description_veritas
      category
      serialNumber
      model
      manufacturer
      purchaseDate
      warrantyExpiry
      location
      status
      status_veritas
      condition
      lastMaintenance
      nextMaintenance
      maintenanceInterval
      supplierId
      purchasePrice
      currentValue
      currentValue_veritas
      depreciationRate
      createdAt
      updatedAt

      # RELATIONS
      supplier {
        id
        name
        contactInfo
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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
  mutation UpdateEquipment($id: ID!, $input: UpdateEquipmentInput!) {
    updateEquipmentV3(id: $id, input: $input) {
      id
      name
      name_veritas
      description
      description_veritas
      category
      serialNumber
      model
      manufacturer
      purchaseDate
      warrantyExpiry
      location
      status
      status_veritas
      condition
      lastMaintenance
      nextMaintenance
      maintenanceInterval
      supplierId
      purchasePrice
      currentValue
      currentValue_veritas
      depreciationRate
      createdAt
      updatedAt

      # RELATIONS
      supplier {
        id
        name
        contactInfo
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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
    deleteEquipmentV3(id: $id) {
      id
      name
      name_veritas
      status
      status_veritas

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

// ============================================================================
// SUPPLIERS QUERIES
// ============================================================================

export const GET_SUPPLIERS = gql`
  query GetSuppliers(
    $activeOnly: Boolean
    $searchTerm: String
    $limit: Int
    $offset: Int
  ) {
    suppliersV3(
      activeOnly: $activeOnly
      searchTerm: $searchTerm
      limit: $limit
      offset: $offset
    ) {
      id
      name
      name_veritas
      contactPerson
      email
      phone
      address
      taxId
      paymentTerms
      creditLimit
      currentBalance
      currentBalance_veritas
      status
      status_veritas
      rating
      categories
      contractStart
      contractEnd
      notes
      notes_veritas
      createdAt
      updatedAt

      # PERFORMANCE METRICS
      performanceMetrics {
        onTimeDelivery
        qualityRating
        responseTime
        overallScore
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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
  query GetSupplier($id: ID!) {
    supplierV3(id: $id) {
      id
      name
      name_veritas
      contactPerson
      email
      phone
      address
      taxId
      paymentTerms
      creditLimit
      currentBalance
      currentBalance_veritas
      status
      status_veritas
      rating
      categories
      contractStart
      contractEnd
      notes
      notes_veritas
      createdAt
      updatedAt

      # PERFORMANCE METRICS
      performanceMetrics {
        onTimeDelivery
        qualityRating
        responseTime
        overallScore
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const CREATE_SUPPLIER = gql`
  mutation CreateSupplier($input: CreateSupplierInput!) {
    createSupplierV3(input: $input) {
      id
      name
      name_veritas
      contactPerson
      email
      phone
      address
      taxId
      paymentTerms
      creditLimit
      currentBalance
      currentBalance_veritas
      status
      status_veritas
      rating
      categories
      contractStart
      contractEnd
      notes
      notes_veritas
      createdAt
      updatedAt

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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
  mutation UpdateSupplier($id: ID!, $input: UpdateSupplierInput!) {
    updateSupplierV3(id: $id, input: $input) {
      id
      name
      name_veritas
      contactPerson
      email
      phone
      address
      taxId
      paymentTerms
      creditLimit
      currentBalance
      currentBalance_veritas
      status
      status_veritas
      rating
      categories
      contractStart
      contractEnd
      notes
      notes_veritas
      createdAt
      updatedAt

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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
    deleteSupplierV3(id: $id) {
      id
      name
      name_veritas
      status
      status_veritas

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

// ============================================================================
// PURCHASE ORDERS QUERIES
// ============================================================================

export const GET_PURCHASE_ORDERS = gql`
  query GetPurchaseOrders(
    $status: String
    $supplierId: String
    $dateFrom: DateTime
    $dateTo: DateTime
    $limit: Int
    $offset: Int
  ) {
    purchaseOrdersV3(
      status: $status
      supplierId: $supplierId
      dateFrom: $dateFrom
      dateTo: $dateTo
      limit: $limit
      offset: $offset
    ) {
      id
      orderNumber
      orderNumber_veritas
      supplierId
      status
      status_veritas
      orderDate
      expectedDelivery
      actualDelivery
      totalAmount
      totalAmount_veritas
      taxAmount
      discountAmount
      notes
      notes_veritas
      createdBy
      approvedBy
      createdAt
      updatedAt

      # RELATIONS
      supplier {
        id
        name
        contactInfo
      }

      # ORDER ITEMS
      items {
        id
        materialId
        equipmentId
        quantity
        unitPrice
        totalPrice
        description
        status
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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
  query GetPurchaseOrder($id: ID!) {
    purchaseOrderV3(id: $id) {
      id
      orderNumber
      orderNumber_veritas
      supplierId
      status
      status_veritas
      orderDate
      expectedDelivery
      actualDelivery
      totalAmount
      totalAmount_veritas
      taxAmount
      discountAmount
      notes
      notes_veritas
      createdBy
      approvedBy
      createdAt
      updatedAt

      # RELATIONS
      supplier {
        id
        name
        contactInfo
      }

      # ORDER ITEMS
      items {
        id
        materialId
        equipmentId
        quantity
        unitPrice
        totalPrice
        description
        status
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrder($input: CreatePurchaseOrderInput!) {
    createPurchaseOrderV3(input: $input) {
      id
      orderNumber
      orderNumber_veritas
      supplierId
      status
      status_veritas
      orderDate
      expectedDelivery
      actualDelivery
      totalAmount
      totalAmount_veritas
      taxAmount
      discountAmount
      notes
      notes_veritas
      createdBy
      approvedBy
      createdAt
      updatedAt

      # RELATIONS
      supplier {
        id
        name
        contactInfo
      }

      # ORDER ITEMS
      items {
        id
        materialId
        equipmentId
        quantity
        unitPrice
        totalPrice
        description
        status
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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
  mutation UpdatePurchaseOrder($id: ID!, $input: UpdatePurchaseOrderInput!) {
    updatePurchaseOrderV3(id: $id, input: $input) {
      id
      orderNumber
      orderNumber_veritas
      supplierId
      status
      status_veritas
      orderDate
      expectedDelivery
      actualDelivery
      totalAmount
      totalAmount_veritas
      taxAmount
      discountAmount
      notes
      notes_veritas
      createdBy
      approvedBy
      createdAt
      updatedAt

      # RELATIONS
      supplier {
        id
        name
        contactInfo
      }

      # ORDER ITEMS
      items {
        id
        materialId
        equipmentId
        quantity
        unitPrice
        totalPrice
        description
        status
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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
    deletePurchaseOrderV3(id: $id) {
      id
      orderNumber
      orderNumber_veritas
      status
      status_veritas

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

// ============================================================================
// INVENTORY ANALYTICS QUERIES
// ============================================================================

export const GET_INVENTORY_ANALYTICS = gql`
  query GetInventoryAnalytics(
    $dateFrom: DateTime
    $dateTo: DateTime
    $category: String
  ) {
    inventoryAnalyticsV3(
      dateFrom: $dateFrom
      dateTo: $dateTo
      category: $category
    ) {
      totalValue
      totalValue_veritas
      stockTurnover
      lowStockItems
      expiringItems
      maintenanceCosts
      supplierPerformance
      categoryBreakdown {
        category
        value
        percentage
      }
      monthlyTrends {
        month
        value
        transactions
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export const BULK_UPDATE_INVENTORY = gql`
  mutation BulkUpdateInventory(
    $operation: String!
    $itemIds: [ID!]!
    $data: JSON
  ) {
    bulkUpdateInventoryV3(
      operation: $operation
      itemIds: $itemIds
      data: $data
    ) {
      success
      message
      affectedCount
      updatedItems {
        id
        name
        name_veritas
        status
        status_veritas
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

// ============================================================================
// MAINTENANCE QUERIES
// ============================================================================

export const GET_MAINTENANCE_SCHEDULE = gql`
  query GetMaintenanceSchedule($equipmentId: ID!) {
    maintenanceScheduleV3(equipmentId: $equipmentId) {
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
      status_veritas
      notes
      notes_veritas
      createdAt
      updatedAt

      # EQUIPMENT RELATION
      equipment {
        id
        name
        name_veritas
        category
        serialNumber
        location
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const CREATE_MAINTENANCE_RECORD = gql`
  mutation CreateMaintenanceRecord($input: CreateMaintenanceRecordInput!) {
    createMaintenanceRecordV3(input: $input) {
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
      status_veritas
      notes
      notes_veritas
      createdAt
      updatedAt

      # EQUIPMENT RELATION
      equipment {
        id
        name
        name_veritas
        category
        serialNumber
        location
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const UPDATE_MAINTENANCE_RECORD = gql`
  mutation UpdateMaintenanceRecord($id: ID!, $input: UpdateMaintenanceRecordInput!) {
    updateMaintenanceRecordV3(id: $id, input: $input) {
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
      status_veritas
      notes
      notes_veritas
      createdAt
      updatedAt

      # EQUIPMENT RELATION
      equipment {
        id
        name
        name_veritas
        category
        serialNumber
        location
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

// ============================================================================
// AI-POWERED INVENTORY INSIGHTS
// ============================================================================

export const GET_INVENTORY_AI_INSIGHTS = gql`
  query GetInventoryAIInsights($context: String) {
    inventoryAIInsightsV3(context: $context) {
      insights {
        id
        type
        title
        description
        confidence
        impact
        recommendation
        priority
      }
      predictions {
        itemId
        predictedDemand
        confidence
        timeFrame
      }
      optimizations {
        type
        description
        potentialSavings
        implementationEffort
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

// ============================================================================
// AUTO-ORDER RULES QUERIES - V3.0 AI-POWERED INVENTORY
// ============================================================================

export const GET_AUTO_ORDER_RULES = gql`
  query GetAutoOrderRules(
    $materialId: ID
    $activeOnly: Boolean
    $limit: Int
    $offset: Int
  ) {
    autoOrderRulesV3(
      materialId: $materialId
      activeOnly: $activeOnly
      limit: $limit
      offset: $offset
    ) {
      id
      materialId
      materialName
      materialName_veritas
      supplier
      supplier_veritas
      reorderPoint
      reorderQuantity
      frequency
      isActive
      lastOrderDate
      nextOrderDate
      averageUsage
      predictedDemand
      confidence
      budgetLimit
      priority
      createdAt
      updatedAt

      # MATERIAL RELATION
      material {
        id
        name
        name_veritas
        currentStock
        minimumStock
        category
        sku
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const GET_AUTO_ORDER_RULE = gql`
  query GetAutoOrderRule($id: ID!) {
    autoOrderRuleV3(id: $id) {
      id
      materialId
      materialName
      materialName_veritas
      supplier
      supplier_veritas
      reorderPoint
      reorderQuantity
      frequency
      isActive
      lastOrderDate
      nextOrderDate
      averageUsage
      predictedDemand
      confidence
      budgetLimit
      priority
      createdAt
      updatedAt

      # MATERIAL RELATION
      material {
        id
        name
        name_veritas
        currentStock
        minimumStock
        category
        sku
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const CREATE_AUTO_ORDER_RULE = gql`
  mutation CreateAutoOrderRule($input: CreateAutoOrderRuleInput!) {
    createAutoOrderRuleV3(input: $input) {
      id
      materialId
      materialName
      materialName_veritas
      supplier
      supplier_veritas
      reorderPoint
      reorderQuantity
      frequency
      isActive
      lastOrderDate
      nextOrderDate
      averageUsage
      predictedDemand
      confidence
      budgetLimit
      priority
      createdAt
      updatedAt

      # MATERIAL RELATION
      material {
        id
        name
        name_veritas
        currentStock
        minimumStock
        category
        sku
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const UPDATE_AUTO_ORDER_RULE = gql`
  mutation UpdateAutoOrderRule($id: ID!, $input: UpdateAutoOrderRuleInput!) {
    updateAutoOrderRuleV3(id: $id, input: $input) {
      id
      materialId
      materialName
      materialName_veritas
      supplier
      supplier_veritas
      reorderPoint
      reorderQuantity
      frequency
      isActive
      lastOrderDate
      nextOrderDate
      averageUsage
      predictedDemand
      confidence
      budgetLimit
      priority
      createdAt
      updatedAt

      # MATERIAL RELATION
      material {
        id
        name
        name_veritas
        currentStock
        minimumStock
        category
        sku
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const DELETE_AUTO_ORDER_RULE = gql`
  mutation DeleteAutoOrderRule($id: ID!) {
    deleteAutoOrderRuleV3(id: $id) {
      id
      materialName
      materialName_veritas
      isActive

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const TOGGLE_AUTO_ORDER_RULE = gql`
  mutation ToggleAutoOrderRule($id: ID!, $isActive: Boolean!) {
    toggleAutoOrderRuleV3(id: $id, isActive: $isActive) {
      id
      isActive
      materialName
      materialName_veritas
      updatedAt

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

// ============================================================================
// PENDING ORDERS QUERIES - V3.0 AI-GENERATED ORDERS
// ============================================================================

export const GET_PENDING_ORDERS = gql`
  query GetPendingOrders(
    $materialId: ID
    $supplier: String
    $priority: String
    $limit: Int
    $offset: Int
  ) {
    pendingOrdersV3(
      materialId: $materialId
      supplier: $supplier
      priority: $priority
      limit: $limit
      offset: $offset
    ) {
      id
      materialId
      materialName
      materialName_veritas
      supplier
      supplier_veritas
      quantity
      estimatedCost
      estimatedCost_veritas
      reason
      priority
      createdAt
      updatedAt
      ruleId

      # MATERIAL RELATION
      material {
        id
        name
        name_veritas
        currentStock
        minimumStock
        unitPrice
        category
        sku
      }

      # RULE RELATION
      rule {
        id
        reorderPoint
        reorderQuantity
        frequency
        priority
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const EXECUTE_PENDING_ORDER = gql`
  mutation ExecutePendingOrder($id: ID!) {
    executePendingOrderV3(id: $id) {
      id
      status
      executedAt
      materialName
      materialName_veritas
      quantity
      estimatedCost
      estimatedCost_veritas

      # GENERATED PURCHASE ORDER
      purchaseOrder {
        id
        orderNumber
        orderNumber_veritas
        status
        status_veritas
        totalAmount
        totalAmount_veritas
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

export const CANCEL_PENDING_ORDER = gql`
  mutation CancelPendingOrder($id: ID!) {
    cancelPendingOrderV3(id: $id) {
      id
      status
      cancelledAt
      materialName
      materialName_veritas

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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

// ============================================================================
// AUTO-ORDER ANALYTICS QUERIES - V3.0 AI INSIGHTS
// ============================================================================

export const GET_AUTO_ORDER_ANALYTICS = gql`
  query GetAutoOrderAnalytics(
    $dateFrom: DateTime
    $dateTo: DateTime
    $materialId: ID
  ) {
    autoOrderAnalyticsV3(
      dateFrom: $dateFrom
      dateTo: $dateTo
      materialId: $materialId
    ) {
      totalRules
      activeRules
      totalOrdersGenerated
      totalOrdersExecuted
      successRate
      averageResponseTime
      totalSavings
      totalSavings_veritas
      aiAccuracy
      rulePerformance {
        ruleId
        materialName
        materialName_veritas
        executions
        successRate
        averageDelay
        savings
      }
      supplierPerformance {
        supplier
        supplier_veritas
        ordersPlaced
        onTimeDelivery
        averageCost
      }

      # V3.0 @veritas QUANTUM TRUTH VERIFICATION
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
