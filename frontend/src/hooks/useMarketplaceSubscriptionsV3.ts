import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import apolloClient from '../apollo/graphql-client';
import { useUIStore } from '../stores';
import {
  PO_STATUS_UPDATED_SUB,
  MARKETPLACE_PRODUCT_CREATED_SUB,
  MARKETPLACE_PRODUCT_UPDATED_SUB,
  PURCHASE_ORDER_CREATED_SUB,
  PURCHASE_ORDER_UPDATED_SUB,
  SUPPLIER_CREATED_SUB,
  SUPPLIER_UPDATED_SUB
} from '../graphql/subscriptions/marketplace';

export const useMarketplaceSubscriptionsV3 = (
  orderId?: string,
  productId?: string,
  supplierId?: string
) => {
  const [poStatusData, setPoStatusData] = useState<any>(null);
  const [productCreatedData, setProductCreatedData] = useState<any>(null);
  const [productUpdatedData, setProductUpdatedData] = useState<any>(null);
  const [orderCreatedData, setOrderCreatedData] = useState<any>(null);
  const [orderUpdatedData, setOrderUpdatedData] = useState<any>(null);
  const [supplierCreatedData, setSupplierCreatedData] = useState<any>(null);
  const [supplierUpdatedData, setSupplierUpdatedData] = useState<any>(null);

  const [poStatusLoading, setPoStatusLoading] = useState(true);
  const [productCreatedLoading, setProductCreatedLoading] = useState(true);
  const [productUpdatedLoading, setProductUpdatedLoading] = useState(true);
  const [orderCreatedLoading, setOrderCreatedLoading] = useState(true);
  const [orderUpdatedLoading, setOrderUpdatedLoading] = useState(true);
  const [supplierCreatedLoading, setSupplierCreatedLoading] = useState(true);
  const [supplierUpdatedLoading, setSupplierUpdatedLoading] = useState(true);

  const [poStatusError, setPoStatusError] = useState<any>(null);
  const [productCreatedError, setProductCreatedError] = useState<any>(null);
  const [productUpdatedError, setProductUpdatedError] = useState<any>(null);
  const [orderCreatedError, setOrderCreatedError] = useState<any>(null);
  const [orderUpdatedError, setOrderUpdatedError] = useState<any>(null);
  const [supplierCreatedError, setSupplierCreatedError] = useState<any>(null);
  const [supplierUpdatedError, setSupplierUpdatedError] = useState<any>(null);

  const { addNotification } = useUIStore();

  // PO Status Updated subscription
  useEffect(() => {
    if (!orderId) {
      setPoStatusLoading(false);
      return;
    }

    setPoStatusLoading(true);
    const subscription = apolloClient.subscribe({
      query: PO_STATUS_UPDATED_SUB,
      variables: { orderId },
    }).subscribe({
      next: ({ data }: { data: any }) => {
        if (data?.poStatusUpdatedSub) {
          const order = data.poStatusUpdatedSub;
          setPoStatusData(order);
          setPoStatusLoading(false);

          const statusMessages = {
            PENDING: 'Orden pendiente de aprobación',
            APPROVED: 'Orden aprobada',
            ORDERED: 'Orden realizada al proveedor',
            SHIPPED: 'Orden en camino',
            DELIVERED: 'Orden entregada',
            CANCELLED: 'Orden cancelada'
          };

          toast.success(`Orden ${order.orderNumber}: ${statusMessages[order.status as keyof typeof statusMessages] || order.status}`, {
            duration: 5000,
            icon: '📋'
          });

          addNotification({
            id: `po-status-${order.id}`,
            type: 'info',
            title: 'Estado de Orden Actualizado',
            message: `Orden ${order.orderNumber}: ${statusMessages[order.status as keyof typeof statusMessages] || order.status}`,
            timestamp: Date.now(),
            read: false
          });
        }
      },
      error: (error: any) => {
        console.error('PO Status subscription error:', error);
        setPoStatusError(error);
        setPoStatusLoading(false);
        toast.error('Error al recibir actualizaciones de estado de orden');
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [orderId, addNotification]);

  // Marketplace Product Created subscription
  useEffect(() => {
    setProductCreatedLoading(true);
    const subscription = apolloClient.subscribe({
      query: MARKETPLACE_PRODUCT_CREATED_SUB,
    }).subscribe({
      next: ({ data }: { data: any }) => {
        if (data?.marketplaceProductCreatedSub) {
          const product = data.marketplaceProductCreatedSub;
          setProductCreatedData(product);
          setProductCreatedLoading(false);

          toast.success(`Nuevo producto en marketplace: ${product.name}`, {
            duration: 4000,
            icon: '🆕'
          });

          addNotification({
            id: `product-created-${product.id}`,
            type: 'info',
            title: 'Producto Creado en Marketplace',
            message: `Nuevo producto: ${product.name}`,
            timestamp: Date.now(),
            read: false
          });
        }
      },
      error: (error: any) => {
        console.error('Product created subscription error:', error);
        setProductCreatedError(error);
        setProductCreatedLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [addNotification]);

  // Marketplace Product Updated subscription
  useEffect(() => {
    if (!productId) {
      setProductUpdatedLoading(false);
      return;
    }

    setProductUpdatedLoading(true);
    const subscription = apolloClient.subscribe({
      query: MARKETPLACE_PRODUCT_UPDATED_SUB,
      variables: { productId },
    }).subscribe({
      next: ({ data }: { data: any }) => {
        if (data?.marketplaceProductUpdatedSub) {
          const product = data.marketplaceProductUpdatedSub;
          setProductUpdatedData(product);
          setProductUpdatedLoading(false);

          toast.success(`Producto actualizado: ${product.name}`, {
            duration: 4000,
            icon: '🔄'
          });

          addNotification({
            id: `product-updated-${product.id}`,
            type: 'info',
            title: 'Producto Actualizado en Marketplace',
            message: `Producto ${product.name} actualizado`,
            timestamp: Date.now(),
            read: false
          });
        }
      },
      error: (error: any) => {
        console.error('Product updated subscription error:', error);
        setProductUpdatedError(error);
        setProductUpdatedLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [productId, addNotification]);

  // Marketplace Order Created subscription
  useEffect(() => {
    setOrderCreatedLoading(true);
    const subscription = apolloClient.subscribe({
      query: PURCHASE_ORDER_CREATED_SUB,
    }).subscribe({
      next: ({ data }: { data: any }) => {
        if (data?.purchaseOrderCreatedSub) {
          const order = data.purchaseOrderCreatedSub;
          setOrderCreatedData(order);
          setOrderCreatedLoading(false);

          toast.success(`Nueva orden de marketplace: ${order.orderNumber}`, {
            duration: 4000,
            icon: '📦'
          });

          addNotification({
            id: `order-created-${order.id}`,
            type: 'info',
            title: 'Orden Creada en Marketplace',
            message: `Nueva orden: ${order.orderNumber}`,
            timestamp: Date.now(),
            read: false
          });
        }
      },
      error: (error: any) => {
        console.error('Order created subscription error:', error);
        setOrderCreatedError(error);
        setOrderCreatedLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [addNotification]);

  // Marketplace Order Updated subscription
  useEffect(() => {
    if (!orderId) {
      setOrderUpdatedLoading(false);
      return;
    }

    setOrderUpdatedLoading(true);
    const subscription = apolloClient.subscribe({
      query: PURCHASE_ORDER_UPDATED_SUB,
      variables: { orderId },
    }).subscribe({
      next: ({ data }: { data: any }) => {
        if (data?.purchaseOrderUpdatedSub) {
          const order = data.purchaseOrderUpdatedSub;
          setOrderUpdatedData(order);
          setOrderUpdatedLoading(false);

          toast.success(`Orden actualizada: ${order.orderNumber}`, {
            duration: 4000,
            icon: '🔄'
          });

          addNotification({
            id: `order-updated-${order.id}`,
            type: 'info',
            title: 'Orden Actualizada en Marketplace',
            message: `Orden ${order.orderNumber} actualizada`,
            timestamp: Date.now(),
            read: false
          });
        }
      },
      error: (error: any) => {
        console.error('Order updated subscription error:', error);
        setOrderUpdatedError(error);
        setOrderUpdatedLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [orderId, addNotification]);

  // Marketplace Supplier Created subscription
  useEffect(() => {
    setSupplierCreatedLoading(true);
    const subscription = apolloClient.subscribe({
      query: SUPPLIER_CREATED_SUB,
    }).subscribe({
      next: ({ data }: { data: any }) => {
        if (data?.supplierCreatedSub) {
          const supplier = data.supplierCreatedSub;
          setSupplierCreatedData(supplier);
          setSupplierCreatedLoading(false);

          toast.success(`Nuevo proveedor en marketplace: ${supplier.name}`, {
            duration: 4000,
            icon: '🏢'
          });

          addNotification({
            id: `supplier-created-${supplier.id}`,
            type: 'info',
            title: 'Proveedor Creado en Marketplace',
            message: `Nuevo proveedor: ${supplier.name}`,
            timestamp: Date.now(),
            read: false
          });
        }
      },
      error: (error: any) => {
        console.error('Supplier created subscription error:', error);
        setSupplierCreatedError(error);
        setSupplierCreatedLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [addNotification]);

  // Marketplace Supplier Updated subscription
  useEffect(() => {
    if (!supplierId) {
      setSupplierUpdatedLoading(false);
      return;
    }

    setSupplierUpdatedLoading(true);
    const subscription = apolloClient.subscribe({
      query: SUPPLIER_UPDATED_SUB,
      variables: { supplierId },
    }).subscribe({
      next: ({ data }: { data: any }) => {
        if (data?.supplierUpdatedSub) {
          const supplier = data.supplierUpdatedSub;
          setSupplierUpdatedData(supplier);
          setSupplierUpdatedLoading(false);

          toast.success(`Proveedor actualizado: ${supplier.name}`, {
            duration: 4000,
            icon: '🔄'
          });

          addNotification({
            id: `supplier-updated-${supplier.id}`,
            type: 'info',
            title: 'Proveedor Actualizado en Marketplace',
            message: `Proveedor ${supplier.name} actualizado`,
            timestamp: Date.now(),
            read: false
          });
        }
      },
      error: (error: any) => {
        console.error('Supplier updated subscription error:', error);
        setSupplierUpdatedError(error);
        setSupplierUpdatedLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supplierId, addNotification]);

  return {
    poStatusData,
    productCreatedData,
    productUpdatedData,
    orderCreatedData,
    orderUpdatedData,
    supplierCreatedData,
    supplierUpdatedData,
    poStatusLoading,
    productCreatedLoading,
    productUpdatedLoading,
    orderCreatedLoading,
    orderUpdatedLoading,
    supplierCreatedLoading,
    supplierUpdatedLoading,
    poStatusError,
    productCreatedError,
    productUpdatedError,
    orderCreatedError,
    orderUpdatedError,
    supplierCreatedError,
    supplierUpdatedError
  };
};