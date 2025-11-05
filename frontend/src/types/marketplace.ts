// Marketplace Types
export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  manufacturer: string;
  sku: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images: string[];
  stock: number;
  minOrderQuantity: number;
  supplier: {
    id: string;
    name: string;
    rating: number;
    totalReviews: number;
    verified: boolean;
    location: string;
  };
  specifications: {
    [key: string]: string;
  };
  certifications: string[];
  warranty: string;
  shipping: {
    free: boolean;
    cost: number;
    estimatedDays: number;
  };
  bulkPricing?: {
    quantity: number;
    price: number;
  }[];
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;

  // Cyberpunk enhancements
  riskLevel?: 'low' | 'medium' | 'high';
  encryptedDelivery?: boolean;
  blackMarketPrice?: number;
  premiumFeatures?: string[];
}

export interface CartItem {
  id?: string;
  product: MarketplaceProduct;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  addedAt?: string;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  rating: number;
  totalReviews: number;
  verified: boolean;
  categories: string[];
  paymentTerms: string;
  minimumOrderValue: number;
  shippingMethods: string[];
  certifications: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceFilters {
  category?: string;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  supplierId?: string;
  verifiedOnly?: boolean;
}

export interface PurchaseOrderFilters {
  status?: string;
  supplierId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// API Response Types
export interface MarketplaceApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface CreatePurchaseOrderInput {
  supplierId: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
  shippingCost: number;
  notes?: string;
}

export interface UpdatePurchaseOrderStatusInput {
  id: string;
  status: string;
}

// Component Props Types
export interface SupplierManagerProps {
  onSupplierSelect?: (supplier: Supplier) => void;
  selectedSupplierId?: string;
}

export interface PurchaseOrderManagerProps {
  onOrderSelect?: (order: PurchaseOrder) => void;
}

export interface ShoppingCartProps {
  cart: CartItem[];
  onUpdateCart: (cart: CartItem[]) => void;
  onClose: () => void;
}

// Enums
export enum ProductCategory {
  RESTAURADORES = 'restauradores',
  ENDODONTICOS = 'endodonticos',
  IMPLANTES = 'implantes',
  ORTODONTICOS = 'ortodonticos',
  ESTETICA = 'estetica',
  HIGIENE = 'higiene',
  EQUIPOS = 'equipos',
  LABORATORIO = 'laboratorio'
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum ShippingMethod {
  STANDARD = 'standard',
  EXPRESS = 'express',
  PICKUP = 'pickup'
}

export enum PaymentMethod {
  TRANSFER = 'transfer',
  CREDIT = 'credit',
  CASH = 'cash'
}

// Utility Types
export type MarketplaceTab = 'products' | 'cart' | 'orders' | 'favorites' | 'suppliers' | 'cyber-market';
export type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
export type FilterOption = 'category' | 'price' | 'rating' | 'availability' | 'supplier';