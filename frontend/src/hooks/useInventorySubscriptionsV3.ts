/**
 * 🔌 INVENTORY SUBSCRIPTIONS V3 HOOK
 * Real-time WebSocket subscriptions for inventory updates
 * Philosophy: NO POLLING - Pure event-driven architecture
 * ALIGNED WITH BACKEND SCHEMA
 */

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import apolloClient from '../apollo/graphql-client';
import { useUIStore } from '../stores';
import {
  INVENTORY_V3_CREATED,
  INVENTORY_V3_UPDATED,
  INVENTORY_V3_DELETED,
  STOCK_LEVEL_CHANGED
} from '../graphql/subscriptions/inventory';

interface InventorySubscriptionData {
  id: string;
  itemName: string;
  itemCode: string;
  quantity: number;
  category: string;
  unitPrice: number;
  isActive: boolean;
  deleted?: boolean;
}

interface UseInventorySubscriptionsV3Return {
  isConnected: boolean;
  lastCreated: InventorySubscriptionData | null;
  lastUpdated: InventorySubscriptionData | null;
  lastDeleted: InventorySubscriptionData | null;
  lastStockChange: InventorySubscriptionData | null;
}

export const useInventorySubscriptionsV3 = (): UseInventorySubscriptionsV3Return => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastCreated, setLastCreated] = useState<InventorySubscriptionData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<InventorySubscriptionData | null>(null);
  const [lastDeleted, setLastDeleted] = useState<InventorySubscriptionData | null>(null);
  const [lastStockChange, setLastStockChange] = useState<InventorySubscriptionData | null>(null);

  const { addNotification } = useUIStore();

  // ============================================================================
  // SUBSCRIPTION: INVENTORY CREATED
  // ============================================================================
  useEffect(() => {
    const subscription = apolloClient.subscribe({
      query: INVENTORY_V3_CREATED,
    }).subscribe({
      next: ({ data }: { data: any }) => {
        if (data?.inventoryV3Created) {
          const item = data.inventoryV3Created;
          setLastCreated(item);
          setIsConnected(true);

          toast.success(`✅ Nuevo ítem: ${item.itemName} (${item.quantity} unidades)`, {
            duration: 4000,
            icon: '📦'
          });

          addNotification({
            id: `inventory-created-${item.id}`,
            type: 'success',
            title: 'Inventario Creado',
            message: `${item.itemName} - Cantidad: ${item.quantity}`,
            timestamp: Date.now(),
            read: false
          });

          console.log('✅ Inventory item created:', item);
        }
      },
      error: (error: any) => {
        console.error('❌ Inventory created subscription error:', error);
        setIsConnected(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [addNotification]);

  // ============================================================================
  // SUBSCRIPTION: INVENTORY UPDATED
  // ============================================================================
  useEffect(() => {
    const subscription = apolloClient.subscribe({
      query: INVENTORY_V3_UPDATED,
    }).subscribe({
      next: ({ data }: { data: any }) => {
        if (data?.inventoryV3Updated) {
          const item = data.inventoryV3Updated;
          setLastUpdated(item);
          setIsConnected(true);

          toast.success(`📝 Actualizado: ${item.itemName} - Qty: ${item.quantity}`, {
            duration: 4000,
            icon: '🔄'
          });

          addNotification({
            id: `inventory-updated-${item.id}`,
            type: 'info',
            title: 'Inventario Actualizado',
            message: `${item.itemName} - Cantidad: ${item.quantity}`,
            timestamp: Date.now(),
            read: false
          });

          console.log('✅ Inventory item updated:', item);
        }
      },
      error: (error: any) => {
        console.error('❌ Inventory updated subscription error:', error);
        setIsConnected(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [addNotification]);

  // ============================================================================
  // SUBSCRIPTION: INVENTORY DELETED
  // ============================================================================
  useEffect(() => {
    const subscription = apolloClient.subscribe({
      query: INVENTORY_V3_DELETED,
    }).subscribe({
      next: ({ data }: { data: any }) => {
        if (data?.inventoryV3Deleted) {
          const item = data.inventoryV3Deleted;
          setLastDeleted(item);
          setIsConnected(true);

          toast.error(`🗑️ Eliminado: Ítem ID ${item.id}`, {
            duration: 3000,
            icon: '❌'
          });

          addNotification({
            id: `inventory-deleted-${item.id}`,
            type: 'warning',
            title: 'Inventario Eliminado',
            message: `Ítem ${item.id} ha sido eliminado`,
            timestamp: Date.now(),
            read: false
          });

          console.log('✅ Inventory item deleted:', item);
        }
      },
      error: (error: any) => {
        console.error('❌ Inventory deleted subscription error:', error);
        setIsConnected(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [addNotification]);

  return {
    isConnected,
    lastCreated,
    lastUpdated,
    lastDeleted,
    lastStockChange
  };
};
