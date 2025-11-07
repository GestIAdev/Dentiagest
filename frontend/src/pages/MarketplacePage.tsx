import React, { useState, useEffect } from 'react';
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  PlusIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid';
import SupplierManagerV3 from '../components/MarketplacePage/SupplierManagerV3';
import PurchaseOrderManagerV3 from '../components/MarketplacePage/PurchaseOrderManagerV3';
import ShoppingCartV3 from '../components/MarketplacePage/ShoppingCartV3';
import { MarketplaceProduct, CartItem, MarketplaceTab } from '../types/marketplace';

const MarketplacePage: React.FC = () => {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<MarketplaceProduct[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [activeTab, setActiveTab] = useState<MarketplaceTab>('products');
  const [showCart, setShowCart] = useState(false);

  // Mock data for dental marketplace
  useEffect(() => {
    const mockProducts: MarketplaceProduct[] = [
      {
        id: '1',
        name: 'Resina Compuesta Premium A2',
        description: 'Resina compuesta fotopolimerizable de alta calidad para restauraciones anteriores. Excelente estética y durabilidad.',
        category: 'restauradores',
        subcategory: 'resinas',
        brand: 'Dentsply Sirona',
        manufacturer: 'Dentsply Sirona',
        sku: 'COMP-A2-PREM-001',
        price: 8500,
        originalPrice: 9500,
        discount: 11,
        image: '/api/placeholder/300/300',
        images: ['/api/placeholder/300/300', '/api/placeholder/300/300'],
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
          'Tiempo de polimerización': '20 segundos',
          'Vida útil': '3 años'
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
          { quantity: 25, price: 7500 },
          { quantity: 50, price: 7200 }
        ],
        featured: true,
        newArrival: false,
        bestSeller: true
      },
      {
        id: '2',
        name: 'Sistema de Limas Endodónticas Rotatorias',
        description: 'Sistema completo de limas endodónticas rotatorias de níquel-titanio para tratamientos de conductos eficientes.',
        category: 'endodonticos',
        subcategory: 'limas',
        brand: 'Dentsply Sirona',
        manufacturer: 'Dentsply Sirona',
        sku: 'ENDO-ROT-002',
        price: 22000,
        image: '/api/placeholder/300/300',
        images: ['/api/placeholder/300/300'],
        stock: 45,
        minOrderQuantity: 1,
        supplier: {
          id: 'sup2',
          name: 'EndoTech Solutions',
          rating: 4.6,
          totalReviews: 890,
          verified: true,
          location: 'Córdoba, Argentina'
        },
        specifications: {
          'Material': 'Níquel-Titanio',
          'Conicidad': '0.04 - 0.06',
          'Longitud': '21mm, 25mm, 31mm',
          'Sistema': '6 limas por paquete',
          'Velocidad': '300-400 RPM'
        },
        certifications: ['ISO 13485', 'CE Mark'],
        warranty: '1 año contra defectos',
        shipping: {
          free: false,
          cost: 850,
          estimatedDays: 3
        },
        featured: true,
        newArrival: true,
        bestSeller: false
      },
      {
        id: '3',
        name: 'Kit de Blanqueamiento Dental Profesional',
        description: 'Kit completo para tratamientos de blanqueamiento dental con peróxido de hidrógeno al 35%.',
        category: 'estetica',
        subcategory: 'blanqueamiento',
        brand: 'Whiteness',
        manufacturer: 'Whiteness',
        sku: 'BLEACH-PRO-003',
        price: 12500,
        originalPrice: 15000,
        discount: 17,
        image: '/api/placeholder/300/300',
        images: ['/api/placeholder/300/300'],
        stock: 78,
        minOrderQuantity: 1,
        supplier: {
          id: 'sup3',
          name: 'Esthetic Dental',
          rating: 4.9,
          totalReviews: 2100,
          verified: true,
          location: 'Rosario, Argentina'
        },
        specifications: {
          'Concentración': '35% Peróxido de Hidrógeno',
          'Presentación': 'Jeringas 1.5g x 3',
          'Tiempo de aplicación': '30-45 minutos',
          'Sesiones recomendadas': '2-3 sesiones',
          'Resultado esperado': '8-12 tonos más blanco'
        },
        certifications: ['ANMAT', 'ISO 13485', 'CE Mark'],
        warranty: '6 meses',
        shipping: {
          free: true,
          cost: 0,
          estimatedDays: 1
        },
        featured: false,
        newArrival: true,
        bestSeller: true
      },
      {
        id: '4',
        name: 'Implante Dental Premium',
        description: 'Implante dental de titanio grado 4 con conexión cónica. Diseño innovador para máxima oseointegración.',
        category: 'implantes',
        subcategory: 'implantes',
        brand: 'Straumann',
        manufacturer: 'Straumann',
        sku: 'IMPLANT-PREM-004',
        price: 45000,
        image: '/api/placeholder/300/300',
        images: ['/api/placeholder/300/300'],
        stock: 25,
        minOrderQuantity: 1,
        supplier: {
          id: 'sup4',
          name: 'Implant Solutions SA',
          rating: 4.7,
          totalReviews: 567,
          verified: true,
          location: 'Buenos Aires, Argentina'
        },
        specifications: {
          'Material': 'Titanio Grado 4',
          'Diámetro': '4.1mm',
          'Longitud': '10mm, 12mm, 14mm',
          'Conexión': 'Cónica interna',
          'Superficie': 'Tratamiento SLA'
        },
        certifications: ['FDA', 'CE Mark', 'ISO 13485'],
        warranty: '10 años',
        shipping: {
          free: false,
          cost: 1200,
          estimatedDays: 5
        },
        bulkPricing: [
          { quantity: 5, price: 42000 },
          { quantity: 10, price: 39500 }
        ],
        featured: true,
        newArrival: false,
        bestSeller: false
      }
    ];

    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  }, []);

  // Filter and sort products
  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesCategory && matchesSearch && matchesPrice;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.supplier.rating - a.supplier.rating;
        case 'newest':
          return b.newArrival ? 1 : -1;
        case 'featured':
        default:
          return b.featured ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, sortBy, priceRange]);

  const categories = [
    { value: 'all', label: 'Todos los Productos', icon: ShoppingBagIcon },
    { value: 'restauradores', label: 'Restauradores', icon: ShieldCheckIcon },
    { value: 'endodonticos', label: 'Endodónticos', icon: AdjustmentsHorizontalIcon },
    { value: 'implantes', label: 'Implantes', icon: StarIcon },
    { value: 'ortodonticos', label: 'Ortodonticos', icon: AdjustmentsHorizontalIcon },
    { value: 'estetica', label: 'Estética', icon: HeartIcon },
    { value: 'higiene', label: 'Higiene', icon: ShieldCheckIcon },
    { value: 'equipos', label: 'Equipos', icon: AdjustmentsHorizontalIcon }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const addToCart = (product: MarketplaceProduct, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <ShoppingBagIcon className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">🛒 Dental Marketplace</h1>
                <p className="text-blue-100 text-sm">Todo lo que necesitas para tu clínica dental</p>
              </div>
            </div>

            {/* Cart */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
                <HeartIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {favorites.size}
                </span>
              </button>

              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              </button>

              {getCartItemsCount() > 0 && (
                <div className="text-right">
                  <div className="text-sm text-blue-100">Total</div>
                  <div className="font-bold">{formatCurrency(getCartTotal())}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ShoppingBagIcon className="h-5 w-5 inline mr-2" />
              Productos
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'suppliers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BuildingStorefrontIcon className="h-5 w-5 inline mr-2" />
              Proveedores
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClipboardDocumentListIcon className="h-5 w-5 inline mr-2" />
              Pedidos
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'products' && (
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar productos, marcas, proveedores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div className="w-full lg:w-48">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="featured">Destacados</option>
                    <option value="price-low">Precio: Menor a Mayor</option>
                    <option value="price-high">Precio: Mayor a Menor</option>
                    <option value="rating">Mejor Calificados</option>
                    <option value="newest">Nuevos Llegados</option>
                  </select>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  <span>Filtros</span>
                </button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rango de Precio
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="Mínimo"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Máximo"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-8">
              {/* Sidebar Categories */}
              <div className="w-64 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías</h3>
                  <div className="space-y-2">
                    {categories.map(category => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.value}
                          onClick={() => setSelectedCategory(category.value)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            selectedCategory === category.value
                              ? 'bg-blue-100 text-blue-700'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-sm">{category.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      {/* Product Image */}
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                        {product.discount && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                            -{product.discount}%
                          </div>
                        )}
                        {product.newArrival && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                            Nuevo
                          </div>
                        )}
                        <button
                          onClick={() => toggleFavorite(product.id)}
                          className="absolute bottom-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
                        >
                          {favorites.has(product.id) ? (
                            <HeartIconSolid className="h-5 w-5 text-red-500" />
                          ) : (
                            <HeartIcon className="h-5 w-5 text-gray-600" />
                          )}
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {product.category}
                          </span>
                          {product.bestSeller && (
                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                              Más Vendido
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>

                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIconSolid
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.supplier.rating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            ({product.supplier.totalReviews})
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-lg font-bold text-gray-900">
                              {formatCurrency(product.price)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through ml-2">
                                {formatCurrency(product.originalPrice)}
                              </span>
                            )}
                          </div>
                          <span className={`text-sm ${
                            product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {product.stock > 10 ? 'En Stock' : product.stock > 0 ? `Solo ${product.stock}` : 'Agotado'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <TruckIcon className="h-4 w-4" />
                            <span>
                              {product.shipping.free ? 'Envío Gratis' : `Envío ${formatCurrency(product.shipping.cost)}`}
                            </span>
                          </div>
                          <span>{product.shipping.estimatedDays} días</span>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowProductModal(true);
                            }}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                          >
                            <EyeIcon className="h-4 w-4" />
                            <span>Ver</span>
                          </button>
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                          >
                            <PlusIcon className="h-4 w-4" />
                            <span>Agregar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron productos</h3>
                    <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'suppliers' && (
          <SupplierManagerV3 />
        )}

        {activeTab === 'orders' && (
          <PurchaseOrderManagerV3 />
        )}
      </div>

      {/* Shopping Cart Section */}
      {showCart && (
        <div className="mt-8">
          <ShoppingCartV3 userId="current-user-id" />
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Images */}
                <div>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <div className="flex space-x-2">
                    {selectedProduct.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${selectedProduct.name} ${index + 1}`}
                        className="w-16 h-16 object-cover rounded border cursor-pointer"
                      />
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatCurrency(selectedProduct.price)}
                    </span>
                    {selectedProduct.originalPrice && (
                      <span className="text-xl text-gray-500 line-through ml-2">
                        {formatCurrency(selectedProduct.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      selectedProduct.stock > 10 ? 'bg-green-100 text-green-800' :
                      selectedProduct.stock > 0 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedProduct.stock > 10 ? 'En Stock' : selectedProduct.stock > 0 ? `Solo ${selectedProduct.stock} disponibles` : 'Agotado'}
                    </span>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                    <p className="text-gray-600">{selectedProduct.description}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Especificaciones</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-sm font-medium text-gray-700">{key}:</span>
                          <span className="text-sm text-gray-600 ml-2">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => addToCart(selectedProduct)}
                      disabled={selectedProduct.stock === 0}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Agregar al Carrito
                    </button>
                    <button
                      onClick={() => toggleFavorite(selectedProduct.id)}
                      className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {favorites.has(selectedProduct.id) ? (
                        <HeartIconSolid className="h-6 w-6 text-red-500" />
                      ) : (
                        <HeartIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
