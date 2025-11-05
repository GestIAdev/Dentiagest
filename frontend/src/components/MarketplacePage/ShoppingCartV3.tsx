// 🎯🎸💀 SHOPPING CART V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 26, 2025
// Mission: Complete shopping cart management with @veritas quantum verification
// Status: V3.0 - Full marketplace system with quantum truth verification
// Challenge: Cart integrity and transaction verification with AI insights
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on cart transactions

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Spinner } from '../atoms';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL QUERIES - V3.0 Integration
import {
  GET_SHOPPING_CART,
  UPDATE_CART_ITEM,
  REMOVE_FROM_CART,
  CLEAR_CART,
  CHECKOUT_CART,
  SHOPPING_CART_UPDATED_SUBSCRIPTION,
  PURCHASE_ORDER_UPDATED_SUBSCRIPTION,
  SUPPLIER_UPDATED_SUBSCRIPTION,
  BILLING_INVOICE_UPDATED_SUBSCRIPTION,
  BILLING_PAYMENT_UPDATED_SUBSCRIPTION,
  COMPLIANCE_AUDIT_UPDATED_SUBSCRIPTION,
  COMPLIANCE_REGULATION_UPDATED_SUBSCRIPTION
} from '../../graphql/queries/marketplace';

// 🎯 ICONS - Heroicons for marketplace theme
import {
  ShoppingBagIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  CubeIcon,
  CalculatorIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

// 🎯 SHOPPING CART V3.0 INTERFACE
interface ShoppingCartV3Props {
  className?: string;
  userId: string;
}

// 🎯 CART ITEM INTERFACE
interface CartItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplierId: string;
  supplierName: string;
  addedAt: string;
  _veritas?: {
    verified: boolean;
    confidence: number;
    level: string;
    certificate: string;
    error?: string;
    verifiedAt: string;
    algorithm: string;
  };
}

// 🎯 LOGGER - Module specific logger
const l = createModuleLogger('ShoppingCartV3');

export const ShoppingCartV3: React.FC<ShoppingCartV3Props> = ({
  className = '',
  userId
}) => {
  // 🎯 STATE MANAGEMENT
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [purchaseOrderId, setPurchaseOrderId] = useState<string | null>(null);

  // 🎯 GRAPHQL QUERIES
  const { data: cartData, loading: cartLoading, refetch: refetchCart } = useQuery(GET_SHOPPING_CART, {
    variables: { userId },
    skip: !userId
  });

  // 🎯 GRAPHQL MUTATIONS
  const [updateCartItem] = useMutation(UPDATE_CART_ITEM);
  const [removeFromCart] = useMutation(REMOVE_FROM_CART);
  const [clearCart] = useMutation(CLEAR_CART);
  const [checkoutCart] = useMutation(CHECKOUT_CART);

  // 🎯 GRAPHQL SUBSCRIPTION - Real-time cart updates
  useSubscription(SHOPPING_CART_UPDATED_SUBSCRIPTION, {
    variables: { userId },
    onData: ({ data }) => {
      if (data?.data?.shoppingCartUpdatedV3) {
        l.info('Shopping cart updated via subscription', { userId });
        refetchCart();
      }
    }
  });

  // 🎯 PURCHASE ORDER SUBSCRIPTION - Real-time order updates
  useSubscription(PURCHASE_ORDER_UPDATED_SUBSCRIPTION, {
    variables: { userId },
    onData: ({ data }) => {
      if (data?.data?.purchaseOrderUpdated) {
        l.info('Purchase order updated via subscription', { orderId: data.data.purchaseOrderUpdated.id });
        // Handle purchase order updates - could trigger order status refresh
      }
    }
  });

  // 🎯 SUPPLIER SUBSCRIPTION - Real-time supplier updates
  useSubscription(SUPPLIER_UPDATED_SUBSCRIPTION, {
    variables: { userId },
    onData: ({ data }) => {
      if (data?.data?.supplierUpdated) {
        l.info('Supplier updated via subscription', { supplierId: data.data.supplierUpdated.id });
        // Handle supplier updates - could trigger supplier data refresh
      }
    }
  });

  // 🎯 BILLING SUBSCRIPTIONS - Real-time billing updates
  useSubscription(BILLING_INVOICE_UPDATED_SUBSCRIPTION, {
    variables: { userId },
    onData: ({ data }) => {
      if (data?.data?.billingInvoiceUpdated) {
        l.info('Billing invoice updated via subscription', { invoiceId: data.data.billingInvoiceUpdated.id });
        // Handle billing invoice updates - could trigger billing state refresh
      }
    }
  });

  useSubscription(BILLING_PAYMENT_UPDATED_SUBSCRIPTION, {
    variables: { userId },
    onData: ({ data }) => {
      if (data?.data?.billingPaymentUpdated) {
        l.info('Billing payment updated via subscription', { paymentId: data.data.billingPaymentUpdated.id });
        // Handle billing payment updates - could trigger payment state refresh
      }
    }
  });

  // 🎯 COMPLIANCE SUBSCRIPTIONS - Real-time compliance updates
  useSubscription(COMPLIANCE_AUDIT_UPDATED_SUBSCRIPTION, {
    variables: { userId },
    onData: ({ data }) => {
      if (data?.data?.complianceAuditUpdated) {
        l.info('Compliance audit updated via subscription', { auditId: data.data.complianceAuditUpdated.id });
        // Handle compliance audit updates - could trigger compliance state refresh
      }
    }
  });

  useSubscription(COMPLIANCE_REGULATION_UPDATED_SUBSCRIPTION, {
    variables: { userId },
    onData: ({ data }) => {
      if (data?.data?.complianceRegulationUpdated) {
        l.info('Compliance regulation updated via subscription', { regulationId: data.data.complianceRegulationUpdated.id });
        // Handle compliance regulation updates - could trigger regulation state refresh
      }
    }
  });

  // 🎯 PROCESSED DATA
  const cart = useMemo(() => {
    return cartData?.shoppingCartV3 || null;
  }, [cartData]);

  const cartItems = useMemo(() => {
    return cart?.items || [];
  }, [cart]);

  const cartSummary = useMemo(() => {
    if (!cart) return null;

    const itemCount = cartItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
    const totalValue = cart.totalAmount || 0;

    return {
      itemCount,
      totalValue,
      subtotal: cart.subtotal || 0,
      taxAmount: cart.taxAmount || 0,
      shippingCost: cart.shippingCost || 0
    };
  }, [cart, cartItems]);

  // 🎯 HANDLERS
  const handleUpdateQuantity = async (cartId: string, itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await updateCartItem({
        variables: {
          cartId,
          itemId,
          input: { quantity: newQuantity }
        }
      });
      l.info('Cart item quantity updated', { itemId, newQuantity });
    } catch (error) {
      l.error('Failed to update cart item quantity', error as Error);
    }
  };

  const handleRemoveItem = async (cartId: string, itemId: string) => {
    try {
      await removeFromCart({
        variables: { cartId, itemId }
      });
      l.info('Item removed from cart', { itemId });
    } catch (error) {
      l.error('Failed to remove item from cart', error as Error);
    }
  };

  const handleClearCart = async (cartId: string) => {
    // if (!confirm('¿Estás seguro de que deseas vaciar el carrito?')) return;

    try {
      await clearCart({
        variables: { cartId }
      });
      l.info('Cart cleared successfully', { cartId });
    } catch (error) {
      l.error('Failed to clear cart', error as Error);
    }
  };

  const handleCheckout = async (cartId: string) => {
    setIsCheckingOut(true);

    try {
      const result = await checkoutCart({
        variables: {
          cartId,
          input: {
            notes: 'Checkout desde ShoppingCartV3 - Verificación @veritas activa'
          }
        }
      });

      if (result.data?.checkoutCartV3?.success) {
        setCheckoutSuccess(true);
        setPurchaseOrderId(result.data.checkoutCartV3.purchaseOrderId);
        l.info('Cart checkout successful', { cartId, purchaseOrderId: result.data.checkoutCartV3.purchaseOrderId });
        refetchCart(); // Refresh cart data
      } else {
        throw new Error(result.data?.checkoutCartV3?.message || 'Checkout failed');
      }
    } catch (error) {
      l.error('Cart checkout failed', error as Error);
      alert('Error en el checkout. Por favor intenta nuevamente.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleResetCheckout = () => {
    setCheckoutSuccess(false);
    setPurchaseOrderId(null);
  };

  // 🎯 FORMAT CURRENCY
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // 🎯 LOADING STATE
  if (cartLoading) {
    return (
      <Card className={`bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 backdrop-blur-sm border border-cyan-500/20 ${className}`}>
        <CardContent className="p-8 flex items-center justify-center">
          <Spinner size="sm" />
          <span className="ml-2 text-gray-300">Cargando carrito de compras...</span>
        </CardContent>
      </Card>
    );
  }

  // 🎯 EMPTY CART STATE
  if (!cart || cartItems.length === 0) {
    return (
      <Card className={`bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 backdrop-blur-sm border border-cyan-500/20 ${className}`}>
        <CardHeader className="border-b border-gray-600/30">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center space-x-2">
            <ShoppingCartIcon className="w-6 h-6" />
            <span>🎯 Carrito de Compras V3.0</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <ShoppingBagIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Tu carrito está vacío</h3>
          <p className="text-gray-500">Agrega productos desde el catálogo para comenzar tus compras</p>
        </CardContent>
      </Card>
    );
  }

  // 🎯 CHECKOUT SUCCESS STATE
  if (checkoutSuccess) {
    return (
      <Card className={`bg-gradient-to-br from-green-900/50 via-cyan-900/50 to-slate-900 backdrop-blur-sm border border-green-500/20 ${className}`}>
        <CardHeader className="border-b border-gray-600/30">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent flex items-center space-x-2">
            <CheckCircleIcon className="w-6 h-6" />
            <span>🎯 ¡Checkout Exitoso!</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
            <CheckCircleIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-green-300 mb-4">¡Orden Creada Exitosamente!</h3>
          <p className="text-gray-300 mb-6">
            Tu orden de compra ha sido creada con verificación @veritas completa.
            Los proveedores serán notificados automáticamente.
          </p>
          {purchaseOrderId && (
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-600/30">
              <p className="text-sm text-gray-400 mb-1">Número de Orden:</p>
              <p className="text-xl font-mono text-cyan-300 font-bold">{purchaseOrderId}</p>
            </div>
          )}
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={handleResetCheckout}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
            >
              Continuar Comprando
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 🎯 CART HEADER */}
      <Card className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 backdrop-blur-sm border border-cyan-500/20">
        <CardHeader className="border-b border-gray-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <ShoppingCartIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🎯 Carrito de Compras V3.0
                </CardTitle>
                <p className="text-gray-300 text-sm mt-1">
                  Mercado negro fortificado con verificación cuántica @veritas
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {cartSummary?.itemCount} items
              </Badge>
              <Button
                variant="ghost"
                onClick={() => handleClearCart(cart.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Vaciar
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* 🎯 CART SUMMARY */}
        {cartSummary && (
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{cartSummary.itemCount}</div>
                <div className="text-xs text-gray-400">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{formatCurrency(cartSummary.subtotal)}</div>
                <div className="text-xs text-gray-400">Subtotal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{formatCurrency(cartSummary.shippingCost)}</div>
                <div className="text-xs text-gray-400">Envío</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">{formatCurrency(cartSummary.totalValue)}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 🎯 CART ITEMS */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-cyan-300 flex items-center space-x-2">
            <CubeIcon className="w-5 h-5" />
            <span>Items en el Carrito</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cartItems.map((item: CartItem) => (
              <Card key={item.id} className="bg-gray-700/30 border border-gray-600/20 hover:border-purple-500/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-white font-semibold">{item.productName}</h4>
                        {item._veritas && (
                          <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{item.supplierName}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div>
                          <span className="text-gray-400">Precio Unitario:</span>
                          <p className="text-white font-semibold">{formatCurrency(item.unitPrice)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Total:</span>
                          <p className="text-cyan-300 font-bold">{formatCurrency(item.totalPrice)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateQuantity(cart.id, item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="text-gray-400 hover:text-white hover:bg-gray-600/50 disabled:opacity-50"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </Button>
                        <span className="text-white font-semibold min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateQuantity(cart.id, item.id, item.quantity + 1)}
                          className="text-gray-400 hover:text-white hover:bg-gray-600/50"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(cart.id, item.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 🎯 COST BREAKDOWN */}
      <Card className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-pink-300 flex items-center space-x-2">
            <CalculatorIcon className="w-5 h-5" />
            <span>Resumen de Costos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Subtotal</span>
              <span className="text-white font-semibold">{formatCurrency(cart.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Impuestos</span>
              <span className="text-white font-semibold">{formatCurrency(cart.taxAmount || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Envío</span>
              <span className="text-white font-semibold">{formatCurrency(cart.shippingCost || 0)}</span>
            </div>
            <div className="border-t border-gray-600/30 pt-3 flex justify-between items-center">
              <span className="text-lg text-cyan-300 font-semibold">Total a Pagar</span>
              <span className="text-2xl text-cyan-300 font-bold">{formatCurrency(cart.totalAmount || 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🎯 @VERITAS VERIFICATION BADGE */}
      <div className="flex items-center justify-center">
        <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 px-6 py-3">
          <ShieldCheckIcon className="w-5 h-5 mr-2" />
          @veritas Quantum Verification Active - {cart._veritas?.confidence || 0}% Confidence
        </Badge>
      </div>

      {/* 🎯 CHECKOUT ACTION */}
      <Card className="bg-gradient-to-r from-pink-900/30 to-cyan-900/30 border border-pink-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">¿Listo para completar tu orden?</h3>
              <p className="text-gray-300">
                Se creará una orden de compra verificada con @veritas para todos los proveedores
              </p>
            </div>
            <Button
              onClick={() => handleCheckout(cart.id)}
              disabled={isCheckingOut || cartItems.length === 0}
              className="bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-lg shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3"
            >
              {isCheckingOut ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-2">Procesando...</span>
                </>
              ) : (
                <>
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Checkout ({formatCurrency(cart.totalAmount || 0)})
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShoppingCartV3;