// 🔥 APOLLO NUCLEAR GRAPHQL SUBSCRIPTIONS - FRONTEND
// Date: September 22, 2025
// Mission: Real-time GraphQL Subscriptions for Apollo Nuclear 3.0
// Target: Live updates in React components

import { gql } from '@apollo/client';
import { useEffect, useState } from 'react';
import apolloClient from '../apollo/graphql-client';
import { usePatientStore, useAppointmentStore, useUIStore } from '../stores';

// ============================================================================
// SUBSCRIPTION QUERIES
// ============================================================================

export const PATIENT_UPDATES = gql`
  subscription PatientUpdates($clinicId: String) {
    patientUpdates(clinicId: $clinicId) {
      patientId
      action
      patient {
        id
        firstName
        lastName
        fullName
        email
        phone
        phoneSecondary
        dateOfBirth
        age
        gender
        addressStreet
        addressCity
        addressState
        addressPostalCode
        addressCountry
        fullAddress
        emergencyContactName
        emergencyContactPhone
        emergencyContactRelationship
        medicalConditions
        medicationsCurrent
        allergies
        anxietyLevel
        specialNeeds
        insuranceProvider
        insurancePolicyNumber
        insuranceGroupNumber
        insuranceStatus
        consentToTreatment
        consentToContact
        preferredContactMethod
        notes
        isActive
        createdAt
        updatedAt
        hasInsurance
        requiresSpecialCare
      }
      timestamp
    }
  }
`;

export const APPOINTMENT_UPDATES = gql`
  subscription AppointmentUpdates($clinicId: String, $dentistId: String) {
    appointmentUpdates(clinicId: $clinicId, dentistId: $dentistId) {
      appointmentId
      action
      appointment {
        id
        patientId
        dentistId
        scheduledDate
        durationMinutes
        appointmentType
        priority
        title
        description
        notes
        status
        roomNumber
        estimatedCost
        insuranceCoverage
        preparationInstructions
        followUpRequired
        confirmationSent
        reminderSent
        cancelledAt
        completedAt
        createdAt
        updatedAt
        patientName
        patientPhone
        dentistName
        endTime
        patient {
          id
          firstName
          lastName
          phone
          email
          dateOfBirth
          medicalConditions
          allergies
          insuranceProvider
        }
        dentist {
          id
          firstName
          lastName
          fullName
        }
      }
      timestamp
    }
  }
`;

export const NEW_APPOINTMENTS = gql`
  subscription NewAppointments($clinicId: String) {
    newAppointments(clinicId: $clinicId) {
      appointmentId
      action
      appointment {
        id
        patientId
        dentistId
        scheduledDate
        durationMinutes
        appointmentType
        priority
        title
        description
        notes
        status
        roomNumber
        estimatedCost
        insuranceCoverage
        preparationInstructions
        followUpRequired
        confirmationSent
        reminderSent
        createdAt
        updatedAt
        patientName
        patientPhone
        dentistName
        endTime
        patient {
          id
          firstName
          lastName
          phone
          email
          dateOfBirth
          medicalConditions
          allergies
          insuranceProvider
        }
        dentist {
          id
          firstName
          lastName
          fullName
        }
      }
      timestamp
    }
  }
`;

export const INVENTORY_V3_CREATED = gql`
  subscription InventoryV3Created {
    inventoryV3Created {
      id
      itemName
      itemCode
      supplierId
      category
      quantity
      unitPrice
      description
      isActive
      createdAt
      updatedAt
      _veritas {
        itemName {
          verified
          confidence
          level
          certificate
          error
          verifiedAt
          algorithm
        }
        itemCode {
          verified
          confidence
          level
          certificate
          error
          verifiedAt
          algorithm
        }
        supplierId {
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

export const INVENTORY_V3_UPDATED = gql`
  subscription InventoryV3Updated {
    inventoryV3Updated {
      id
      itemName
      itemCode
      supplierId
      category
      quantity
      unitPrice
      description
      isActive
      createdAt
      updatedAt
      _veritas {
        itemName {
          verified
          confidence
          level
          certificate
          error
          verifiedAt
          algorithm
        }
        itemCode {
          verified
          confidence
          level
          certificate
          error
          verifiedAt
          algorithm
        }
        supplierId {
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

export const INVENTORY_V3_DELETED = gql`
  subscription InventoryV3Deleted {
    inventoryV3Deleted {
      id
      itemName
      itemCode
      supplierId
      category
      quantity
      unitPrice
      description
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const STOCK_LEVEL_CHANGED = gql`
  subscription StockLevelChanged($itemId: ID!, $threshold: Int!) {
    stockLevelChanged(itemId: $itemId, newQuantity: Int!, threshold: $threshold) {
      id
      itemName
      itemCode
      supplierId
      category
      quantity
      unitPrice
      description
      isActive
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// SUBSCRIPTION HOOKS
// ============================================================================

export const usePatientUpdates = (clinicId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const { addPatient, updatePatient, deletePatient } = usePatientStore();

  useEffect(() => {
    const subscription = apolloClient.subscribe({
      query: PATIENT_UPDATES,
      variables: { clinicId },
    }).subscribe({
      next: ({ data }: { data: any }) => {
        if (data?.patientUpdates) {
          console.log('📡 Patient update received:', data.patientUpdates);
          const update = data.patientUpdates;

          switch (update.action) {
            case 'CREATED':
              addPatient(update.patient);
              break;
            case 'UPDATED':
              updatePatient(update.patient.id, update.patient);
              break;
            case 'DELETED':
              deletePatient(update.patient.id);
              break;
          }
        }
      },
      error: (error: any) => {
        console.error('Patient subscription error:', error);
      },
    });

    setIsConnected(true);

    return () => {
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [clinicId, addPatient, updatePatient, deletePatient]);

  return { isConnected };
};

export const useAppointmentUpdates = (clinicId?: string, dentistId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const { addAppointment, updateAppointment, deleteAppointment } = useAppointmentStore();

  useEffect(() => {
    const subscription = apolloClient.subscribe({
      query: APPOINTMENT_UPDATES,
      variables: { clinicId, dentistId },
    }).subscribe({
      next: ({ data }: { data: any }) => {
        if (data?.appointmentUpdates) {
          console.log('📡 Appointment update received:', data.appointmentUpdates);
          const update = data.appointmentUpdates;

          switch (update.action) {
            case 'CREATED':
              addAppointment(update.appointment);
              break;
            case 'UPDATED':
              updateAppointment(update.appointment.id, update.appointment);
              break;
            case 'DELETED':
              deleteAppointment(update.appointment.id);
              break;
            case 'CONFIRMED':
              updateAppointment(update.appointment.id, { status: 'confirmed' });
              break;
            case 'COMPLETED':
              updateAppointment(update.appointment.id, { status: 'completed' });
              break;
            case 'CANCELLED':
              updateAppointment(update.appointment.id, { status: 'cancelled' });
              break;
          }
        }
      },
      error: (error: any) => {
        console.error('Appointment subscription error:', error);
      },
    });

    setIsConnected(true);

    return () => {
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [clinicId, dentistId, addAppointment, updateAppointment, deleteAppointment]);

  return { isConnected };
};

export const useNewAppointments = (clinicId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const { addAppointment } = useAppointmentStore();
  const { addNotification } = useUIStore();

  useEffect(() => {
    const subscription = apolloClient.subscribe({
      query: NEW_APPOINTMENTS,
      variables: { clinicId },
    }).subscribe({
      next: ({ data }: { data: any }) => {
        if (data?.newAppointments) {
          console.log('📡 New appointment received:', data.newAppointments);
          const newAppointment = data.newAppointments;

          addAppointment(newAppointment.appointment);

          addNotification({
            id: `new-appointment-${newAppointment.appointmentId}`,
            type: 'info',
            title: 'Nueva Cita Agendada',
            message: `${newAppointment.appointment.patientName} - ${newAppointment.appointment.title}`,
            timestamp: Date.now(),
            read: false
          });
        }
      },
      error: (error: any) => {
        console.error('New appointments subscription error:', error);
      },
    });

    setIsConnected(true);

    return () => {
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [clinicId, addAppointment, addNotification]);

  return { isConnected };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const checkWebSocketHealth = (): boolean => {
  // This would check if the WebSocket connection is active
  // For now, return a placeholder
  return true; // Implement actual WebSocket health check
};

export const reconnectWebSocket = async () => {
  try {
    await apolloClient.resetStore();
    console.log('🔄 WebSocket reconnected');
  } catch (error) {
    console.error('WebSocket reconnection failed:', error);
  }
};

// ============================================================================
// INVENTORY SUBSCRIPTION HOOKS - V3.0
// ============================================================================

export const useInventoryV3Created = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { addNotification } = useUIStore();

  useEffect(() => {
    const subscription = apolloClient.subscribe({
      query: INVENTORY_V3_CREATED,
    }).subscribe({
      next: ({ data }: { data: any }) => {
        if (data?.inventoryV3Created) {
          console.log('📦 Inventory item created:', data.inventoryV3Created);
          const newItem = data.inventoryV3Created;

          addNotification({
            id: `inventory-created-${newItem.id}`,
            type: 'success',
            title: 'Nuevo Material Agregado',
            message: `${newItem.itemName} (${newItem.itemCode})`,
            timestamp: Date.now(),
            read: false
          });
        }
      },
      error: (error: any) => {
        console.error('Inventory created subscription error:', error);
      },
    });

    setIsConnected(true);

    return () => {
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [addNotification]);

  return { isConnected };
};

export const useInventoryV3Updated = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { addNotification } = useUIStore();

  useEffect(() => {
    const subscription = apolloClient.subscribe({
      query: INVENTORY_V3_UPDATED,
    }).subscribe({
      next: ({ data }: { data: any }) => {
        if (data?.inventoryV3Updated) {
          console.log('📦 Inventory item updated:', data.inventoryV3Updated);
          const updatedItem = data.inventoryV3Updated;

          addNotification({
            id: `inventory-updated-${updatedItem.id}`,
            type: 'info',
            title: 'Material Actualizado',
            message: `${updatedItem.itemName} (${updatedItem.itemCode})`,
            timestamp: Date.now(),
            read: false
          });
        }
      },
      error: (error: any) => {
        console.error('Inventory updated subscription error:', error);
      },
    });

    setIsConnected(true);

    return () => {
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [addNotification]);

  return { isConnected };
};

export const useInventoryV3Deleted = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { addNotification } = useUIStore();

  useEffect(() => {
    const subscription = apolloClient.subscribe({
      query: INVENTORY_V3_DELETED,
    }).subscribe({
      next: ({ data }: { data: any }) => {
        if (data?.inventoryV3Deleted) {
          console.log('📦 Inventory item deleted:', data.inventoryV3Deleted);
          const deletedItem = data.inventoryV3Deleted;

          addNotification({
            id: `inventory-deleted-${deletedItem.id}`,
            type: 'warning',
            title: 'Material Eliminado',
            message: `${deletedItem.itemName} (${deletedItem.itemCode})`,
            timestamp: Date.now(),
            read: false
          });
        }
      },
      error: (error: any) => {
        console.error('Inventory deleted subscription error:', error);
      },
    });

    setIsConnected(true);

    return () => {
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [addNotification]);

  return { isConnected };
};

export const useStockLevelChanged = (itemId?: string, threshold: number = 10) => {
  const [isConnected, setIsConnected] = useState(false);
  const { addNotification } = useUIStore();

  useEffect(() => {
    const subscription = apolloClient.subscribe({
      query: STOCK_LEVEL_CHANGED,
      variables: { itemId, threshold },
    }).subscribe({
      next: ({ data }: { data: any }) => {
        if (data?.stockLevelChanged) {
          console.log('📦 Stock level changed:', data.stockLevelChanged);
          const item = data.stockLevelChanged;

          addNotification({
            id: `stock-alert-${item.id}`,
            type: 'warning',
            title: 'Alerta de Stock Bajo',
            message: `${item.itemName}: ${item.quantity} unidades restantes`,
            timestamp: Date.now(),
            read: false
          });
        }
      },
      error: (error: any) => {
        console.error('Stock level subscription error:', error);
      },
    });

    setIsConnected(true);

    return () => {
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [itemId, threshold, addNotification]);

  return { isConnected };
};

// ============================================================================
// MODERN SUBSCRIPTION HOOK V3.0 - UNIFIED REAL-TIME MANAGER
// ============================================================================

interface SubscriptionConfig {
  query: any;
  variables?: Record<string, any>;
  onData?: (data: any) => void;
  onError?: (error: any) => void;
  onComplete?: () => void;
  retryAttempts?: number;
  retryDelay?: number;
}

interface SubscriptionState {
  isConnected: boolean;
  isReconnecting: boolean;
  error: string | null;
  retryCount: number;
}

export const useSubscriptionV3 = (config: SubscriptionConfig) => {
  const [state, setState] = useState<SubscriptionState>({
    isConnected: false,
    isReconnecting: false,
    error: null,
    retryCount: 0
  });

  const { addNotification } = useUIStore();

  useEffect(() => {
    let subscription: any = null;
    let retryTimeout: NodeJS.Timeout | null = null;
    let isComponentMounted = true;

    const connect = () => {
      if (!isComponentMounted) return;

      setState(prev => ({ ...prev, isReconnecting: true, error: null }));

      try {
        subscription = apolloClient.subscribe({
          query: config.query,
          variables: config.variables,
        }).subscribe({
          next: ({ data }: { data: any }) => {
            if (!isComponentMounted) return;

            setState(prev => ({
              ...prev,
              isConnected: true,
              isReconnecting: false,
              error: null,
              retryCount: 0
            }));

            if (config.onData) {
              config.onData(data);
            }
          },
          error: (error: any) => {
            if (!isComponentMounted) return;

            console.error('Subscription error:', error);
            setState(prev => ({ ...prev, error: error.message, isConnected: false }));

            if (config.onError) {
              config.onError(error);
            }

            // Auto-retry logic
            const maxRetries = config.retryAttempts || 3;
            const retryDelay = config.retryDelay || 2000;

            setState(currentState => {
              if (currentState.retryCount < maxRetries) {
                retryTimeout = setTimeout(() => {
                  if (isComponentMounted) {
                    setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
                    connect();
                  }
                }, retryDelay * (currentState.retryCount + 1)); // Exponential backoff
                return { ...currentState, isReconnecting: true };
              } else {
                addNotification({
                  id: `subscription-error-${Date.now()}`,
                  type: 'error',
                  title: 'Error de Conexión',
                  message: 'No se pudo reconectar a las actualizaciones en tiempo real',
                  timestamp: Date.now(),
                  read: false
                });
                return { ...currentState, isReconnecting: false };
              }
            });
          },
          complete: () => {
            if (!isComponentMounted) return;

            setState(prev => ({ ...prev, isConnected: false }));

            if (config.onComplete) {
              config.onComplete();
            }
          }
        });
      } catch (error) {
        if (!isComponentMounted) return;

        console.error('Subscription setup error:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Error desconocido',
          isConnected: false,
          isReconnecting: false
        }));
      }
    };

    connect();

    return () => {
      isComponentMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [config, addNotification]);

  return {
    isConnected: state.isConnected,
    isReconnecting: state.isReconnecting,
    error: state.error,
    retryCount: state.retryCount,
    reconnect: () => {
      setState(prev => ({ ...prev, retryCount: 0 }));
      // The useEffect will trigger reconnection
    }
  };
};

// ============================================================================
// INVENTORY SUBSCRIPTION MANAGER V3.0
// ============================================================================

export const useInventorySubscriptionsV3 = () => {
  const created = useInventoryV3Created();
  const updated = useInventoryV3Updated();
  const deleted = useInventoryV3Deleted();

  const isConnected = created.isConnected && updated.isConnected && deleted.isConnected;

  useEffect(() => {
    if (isConnected) {
      console.log('📦🔗 Inventory V3.0 real-time subscriptions active');
    }
  }, [isConnected]);

  return {
    isConnected,
    created,
    updated,
    deleted
  };
};