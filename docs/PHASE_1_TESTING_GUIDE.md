# 🧪 PHASE 1 - QUICK VERIFICATION GUIDE

## Test Inventory Field Resolvers in GraphQL

### Paso 1: Open GraphQL Playground
```
http://localhost:4000/graphql
```

### Paso 2: Test Each Type

#### ✅ Test InventoryV3
```graphql
query TestInventoryV3 {
  inventoriesV3(limit: 5) {
    id
    itemName
    itemCode
    category
    quantity
    unitPrice
    isActive
    createdAt
  }
}
```

**Expected Result**: Returns array of inventory items (or empty if no data in DB)  
**Field Mapping**: item_name → itemName, item_code → itemCode, is_active → isActive

---

#### ✅ Test MaterialV3
```graphql
query TestMaterialV3 {
  materialsV3(limit: 5) {
    id
    name
    category
    unitCost
    quantityInStock
    supplier {
      id
      name
      email
    }
  }
}
```

**Expected Result**: Returns materials with nested supplier data  
**Field Mapping**: unit_cost → unitCost, quantity_in_stock → quantityInStock

---

#### ✅ Test EquipmentV3
```graphql
query TestEquipmentV3 {
  equipmentsV3(limit: 5) {
    id
    name
    model
    serialNumber
    equipmentType
    status
    purchaseDate
    lastMaintenance
  }
}
```

**Expected Result**: Returns equipment list  
**Field Mapping**: serial_number → serialNumber, equipment_type → equipmentType

---

#### ✅ Test MaintenanceV3
```graphql
query TestMaintenanceV3 {
  maintenancesV3(limit: 5) {
    id
    maintenanceType
    description
    cost
    status
    completedDate
    equipment {
      id
      name
      status
    }
  }
}
```

**Expected Result**: Returns maintenance records with nested equipment  
**Field Mapping**: maintenance_type → maintenanceType, completed_date → completedDate

---

#### ✅ Test SupplierV3
```graphql
query TestSupplierV3 {
  suppliersV3(limit: 5) {
    id
    name
    contactPerson
    email
    phone
    paymentTerms
    materials {
      id
      name
    }
    purchaseOrders(limit: 3) {
      id
      orderNumber
      status
    }
  }
}
```

**Expected Result**: Returns suppliers with nested materials and POs  
**Field Mapping**: contact_person → contactPerson, payment_terms → paymentTerms

---

#### ✅ Test PurchaseOrderV3
```graphql
query TestPurchaseOrderV3 {
  purchaseOrdersV3(limit: 5) {
    id
    orderNumber
    status
    totalAmount
    orderDate
    supplier {
      id
      name
    }
    items {
      id
      productId
      quantity
      unitPrice
      totalPrice
    }
  }
}
```

**Expected Result**: Returns POs with nested supplier and items  
**Field Mapping**: order_number → orderNumber, total_amount → totalAmount

---

#### ✅ Test InventoryDashboardV3
```graphql
query TestDashboard {
  inventoryDashboardV3 {
    totalMaterials
    totalEquipment
    lowStockMaterials
    expiredMaterials
    maintenanceDueEquipment
    totalInventoryValue
    recentPurchaseOrders(limit: 3) {
      id
      orderNumber
      totalAmount
    }
    topSuppliers(limit: 3) {
      id
      name
      rating
    }
  }
}
```

**Expected Result**: Returns dashboard statistics  
**Field Mapping**: total_materials → totalMaterials, total_equipment → totalEquipment

---

### Paso 3: Test Mutations

#### ✅ Create Inventory
```graphql
mutation CreateInventory {
  createInventoryV3(input: {
    itemName: "Test Item"
    itemCode: "TEST-001"
    supplierId: "supplier-1"
    category: "Test"
    quantity: 100
    unitPrice: 10.50
    description: "Test Description"
    isActive: true
  }) {
    id
    itemName
    quantity
    createdAt
  }
}
```

**Expected Result**: Returns created inventory record  
**Key Check**: All fields properly mapped from input

---

#### ✅ Update Inventory
```graphql
mutation UpdateInventory {
  updateInventoryV3(id: "inventory-id-here", input: {
    quantity: 95
    unitPrice: 12.00
  }) {
    id
    itemName
    quantity
    unitPrice
    updatedAt
  }
}
```

**Expected Result**: Returns updated inventory record  
**Key Check**: updatedAt timestamp updated

---

#### ✅ Delete Inventory
```graphql
mutation DeleteInventory {
  deleteInventoryV3(id: "inventory-id-here")
}
```

**Expected Result**: Returns true on success

---

## 🔍 What to Check

### ✅ Field Name Conversion
- [ ] snake_case from DB converts to camelCase in GraphQL
- [ ] Example: `item_name` → `itemName`
- [ ] Example: `unit_price` → `unitPrice`

### ✅ Nested Resolution
- [ ] MaterialV3.supplier returns SupplierV3 object
- [ ] PurchaseOrderV3.items returns [PurchaseOrderItemV3] array
- [ ] SupplierV3.materials returns [MaterialV3] array

### ✅ Field Availability
- [ ] All 11 fields in InventoryV3 present
- [ ] All 20 fields in EquipmentV3 present
- [ ] All 14 fields in PurchaseOrderV3 present

### ✅ No GraphQL Errors
- [ ] No "undefined is not a function" errors
- [ ] No "Cannot read property 'X' of undefined" errors
- [ ] No "_veritas defined in resolvers, but not in schema" errors

---

## 🚨 Troubleshooting

### If queries return empty arrays
- Check database has sample data for that type
- Look in PM2 logs for database query errors
- Verify database connection with: `SELECT COUNT(*) FROM table_name;`

### If fields are undefined
- Check snake_case/camelCase conversion in resolver
- Verify database column names match expected naming
- Add console.log in resolver to debug parent object

### If nested resolvers fail
- Check database method exists in InventoryDatabase
- Verify foreign key IDs are populated
- Check database constraints and relationships

---

## ✨ Success Indicators

✅ **All queries return data (or empty arrays)**  
✅ **All mutations create/update/delete records**  
✅ **All field names properly converted (camelCase)**  
✅ **All nested resolvers return correct objects**  
✅ **No error messages in GraphQL or PM2 logs**  
✅ **All 3 nodes show online status in PM2**

---

**Last Updated**: November 10, 2025, 16:45 UTC  
**Status**: 🟢 PHASE 1 COMPLETE  
**Ready for Phase 2**: ✅ YES
