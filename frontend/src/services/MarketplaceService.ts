import { gql } from '@apollo/client';
import {
  MarketplaceProduct,
  CartItem,
  PurchaseOrder,
  Supplier,
  CreatePurchaseOrderInput,
  MarketplaceApiResponse
} from '../types/marketplace';

// Re-export types for easier imports
export type { MarketplaceProduct, CartItem, PurchaseOrder, Supplier, CreatePurchaseOrderInput, MarketplaceApiResponse };

// GraphQL Queries
export const GET_MARKETPLACE_PRODUCTS = gql`
  query GetMarketplaceProducts(
    $category: String
    $searchTerm: String
    $minPrice: Float
    $maxPrice: Float
    $sortBy: String
    $limit: Int
    $offset: Int
  ) {
    marketplaceProducts(
      category: $category
      searchTerm: $searchTerm
      minPrice: $minPrice
      maxPrice: $maxPrice
      sortBy: $sortBy
      limit: $limit
      offset: $offset
    ) {
      id
      name
      description
      category
      subcategory
      brand
      manufacturer
      sku
      price
      originalPrice
      discount
      image
      images
      stock
      minOrderQuantity
      supplier {
        id
        name
        rating
        totalReviews
        verified
        location
      }
      specifications
      certifications
      warranty
      shipping {
        free
        cost
        estimatedDays
      }
      bulkPricing {
        quantity
        price
      }
      featured
      newArrival
      bestSeller
    }
  }
`;

export const GET_MARKETPLACE_PRODUCT = gql`
  query GetMarketplaceProduct($id: ID!) {
    marketplaceProduct(id: $id) {
      id
      name
      description
      category
      subcategory
      brand
      manufacturer
      sku
      price
      originalPrice
      discount
      image
      images
      stock
      minOrderQuantity
      supplier {
        id
        name
        rating
        totalReviews
        verified
        location
      }
      specifications
      certifications
      warranty
      shipping {
        free
        cost
        estimatedDays
      }
      bulkPricing {
        quantity
        price
      }
      featured
      newArrival
      bestSeller
    }
  }
`;

export const GET_SUPPLIERS = gql`
  query GetSuppliers(
    $category: String
    $verified: Boolean
    $limit: Int
    $offset: Int
  ) {
    suppliers(
      category: $category
      verified: $verified
      limit: $limit
      offset: $offset
    ) {
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
    }
  }
`;

export const GET_PURCHASE_ORDERS = gql`
  query GetPurchaseOrders(
    $status: String
    $supplierId: ID
    $limit: Int
    $offset: Int
  ) {
    purchaseOrders(
      status: $status
      supplierId: $supplierId
      limit: $limit
      offset: $offset
    ) {
      id
      orderNumber
      supplierId
      supplierName
      items {
        productId
        productName
        quantity
        unitPrice
        totalPrice
      }
      subtotal
      tax
      shippingCost
      total
      status
      orderDate
      estimatedDeliveryDate
      actualDeliveryDate
      notes
    }
  }
`;

export const GET_PURCHASE_ORDER = gql`
  query GetPurchaseOrder($id: ID!) {
    purchaseOrder(id: $id) {
      id
      orderNumber
      supplierId
      supplierName
      items {
        productId
        productName
        quantity
        unitPrice
        totalPrice
      }
      subtotal
      tax
      shippingCost
      total
      status
      orderDate
      estimatedDeliveryDate
      actualDeliveryDate
      notes
    }
  }
`;

// GraphQL Mutations
export const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrder($input: CreatePurchaseOrderInput!) {
    createPurchaseOrder(input: $input) {
      id
      orderNumber
      supplierId
      supplierName
      items {
        productId
        productName
        quantity
        unitPrice
        totalPrice
      }
      subtotal
      tax
      shippingCost
      total
      status
      orderDate
      estimatedDeliveryDate
      notes
    }
  }
`;

export const UPDATE_PURCHASE_ORDER_STATUS = gql`
  mutation UpdatePurchaseOrderStatus($id: ID!, $status: String!) {
    updatePurchaseOrderStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

export const ADD_TO_FAVORITES = gql`
  mutation AddToFavorites($productId: ID!) {
    addToFavorites(productId: $productId) {
      success
      message
    }
  }
`;

export const REMOVE_FROM_FAVORITES = gql`
  mutation RemoveFromFavorites($productId: ID!) {
    removeFromFavorites(productId: $productId) {
      success
      message
    }
  }
`;

export const GET_FAVORITES = gql`
  query GetFavorites {
    favorites {
      id
      name
      description
      category
      brand
      price
      image
      supplier {
        name
        rating
      }
    }
  }
`;

// Service class for marketplace operations
export class MarketplaceService {
  private static instance: MarketplaceService;

  private constructor() {}

  static getInstance(): MarketplaceService {
    if (!MarketplaceService.instance) {
      MarketplaceService.instance = new MarketplaceService();
    }
    return MarketplaceService.instance;
  }

  // Product operations
  async getProducts(filters?: {
    category?: string;
    searchTerm?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<MarketplaceProduct[]> {
    // Implementation will use Apollo Client
    // For now, return mock data
    return this.getMockProducts();
  }

  async getProduct(id: string): Promise<MarketplaceProduct | null> {
    // Implementation will use Apollo Client
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  // Supplier operations
  async getSuppliers(filters?: {
    category?: string;
    verified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Supplier[]> {
    // Implementation will use Apollo Client
    return this.getMockSuppliers();
  }

  async getSupplier(id: string): Promise<Supplier | null> {
    const suppliers = await this.getSuppliers();
    return suppliers.find(s => s.id === id) || null;
  }

  // Purchase order operations
  async createPurchaseOrder(orderData: {
    supplierId: string;
    items: {
      productId: string;
      quantity: number;
      unitPrice: number;
    }[];
    shippingCost: number;
    notes?: string;
  }): Promise<PurchaseOrder> {
    // Implementation will use Apollo Client
    return this.createMockPurchaseOrder(orderData);
  }

  async getPurchaseOrders(filters?: {
    status?: string;
    supplierId?: string;
    limit?: number;
    offset?: number;
  }): Promise<PurchaseOrder[]> {
    // Implementation will use Apollo Client
    return this.getMockPurchaseOrders();
  }

  async updatePurchaseOrderStatus(orderId: string, status: string): Promise<boolean> {
    // Implementation will use Apollo Client
    return true;
  }

  // Favorites operations
  async addToFavorites(productId: string): Promise<boolean> {
    // Implementation will use Apollo Client
    return true;
  }

  async removeFromFavorites(productId: string): Promise<boolean> {
    // Implementation will use Apollo Client
    return true;
  }

  async getFavorites(): Promise<MarketplaceProduct[]> {
    // Implementation will use Apollo Client
    return [];
  }

  // Mock data methods (will be replaced with actual API calls)
  private getMockProducts(): MarketplaceProduct[] {
    return [
      {
        id: '1',
        name: 'Resina Compuesta Premium A2',
        description: 'Resina compuesta fotopolimerizable de alta calidad para restauraciones anteriores.',
        category: 'restauradores',
        subcategory: 'resinas',
        brand: 'Dentsply Sirona',
        manufacturer: 'Dentsply Sirona',
        sku: 'COMP-A2-PREM-001',
        price: 8500,
        originalPrice: 9500,
        discount: 11,
        image: '/api/placeholder/300/300',
        images: ['/api/placeholder/300/300'],
        stock: 150,
        minOrderQuantity: 1,
        supplier: {
          id: 'sup1',
          name: 'Dental Supply Argentina',
          rating: 4.8,
          totalReviews: 1250,
          verified: true,
          location: 'Buenos Aires, Argentina'
        },
        specifications: {
          'Color': 'A2',
          'Presentación': 'Jeringa 4g',
          'Tiempo de trabajo': '2 minutos',
          'Tiempo de polimerización': '20 segundos'
        },
        certifications: ['ISO 13485', 'FDA Approved', 'CE Mark'],
        warranty: '2 años contra defectos de fabricación',
        shipping: {
          free: true,
          cost: 0,
          estimatedDays: 2
        },
        bulkPricing: [
          { quantity: 10, price: 7800 },
          { quantity: 25, price: 7500 }
        ],
        featured: true,
        newArrival: false,
        bestSeller: true
      }
      // Add more mock products as needed
    ];
  }

  private getMockSuppliers(): Supplier[] {
    return [
      {
        id: 'sup1',
        name: 'Dental Supply Argentina',
        email: 'ventas@dentalargentina.com',
        phone: '+54 11 1234-5678',
        address: {
          street: 'Av. Corrientes 1234',
          city: 'Buenos Aires',
          state: 'Buenos Aires',
          zipCode: 'C1043AAZ',
          country: 'Argentina'
        },
        rating: 4.8,
        totalReviews: 1250,
        verified: true,
        categories: ['restauradores', 'endodonticos', 'implantes'],
        paymentTerms: '30 días',
        minimumOrderValue: 5000,
        shippingMethods: ['Envío estándar', 'Envío express', 'Retiro en sucursal'],
        certifications: ['ISO 9001', 'ISO 13485'],
        active: true,
        createdAt: '2023-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      }
      // Add more mock suppliers as needed
    ];
  }

  private getMockPurchaseOrders(): PurchaseOrder[] {
    return [
      {
        id: 'po1',
        orderNumber: 'PO-2024-001',
        supplierId: 'sup1',
        supplierName: 'Dental Supply Argentina',
        items: [
          {
            productId: '1',
            productName: 'Resina Compuesta Premium A2',
            quantity: 10,
            unitPrice: 7800,
            totalPrice: 78000
          }
        ],
        subtotal: 78000,
        tax: 15600,
        shippingCost: 1200,
        total: 94800,
        status: 'pending',
        orderDate: '2024-01-15T10:30:00Z',
        estimatedDeliveryDate: '2024-01-20T00:00:00Z',
        notes: 'Pedido urgente para clínica central'
      }
      // Add more mock orders as needed
    ];
  }

  private createMockPurchaseOrder(orderData: {
    supplierId: string;
    items: { productId: string; quantity: number; unitPrice: number; }[];
    shippingCost: number;
    notes?: string;
  }): PurchaseOrder {
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.2; // 20% IVA
    const total = subtotal + tax + orderData.shippingCost;

    return {
      id: `po-${Date.now()}`,
      orderNumber: `PO-2024-${(Date.now() % 1000).toString().padStart(3, '0')}`,
      supplierId: orderData.supplierId,
      supplierName: 'Mock Supplier', // Would be fetched from supplier data
      items: orderData.items.map(item => ({
        ...item,
        productName: 'Mock Product', // Would be fetched from product data
        totalPrice: item.quantity * item.unitPrice
      })),
      subtotal,
      tax,
      shippingCost: orderData.shippingCost,
      total,
      status: 'pending',
      orderDate: new Date().toISOString(),
      estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      notes: orderData.notes
    };
  }
}

// Export singleton instance
export const marketplaceService = MarketplaceService.getInstance();
