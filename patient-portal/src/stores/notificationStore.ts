import { create } from 'zustand';

// ============================================================================
// INTERFACES Y TIPOS - NOTIFICATION SYSTEM V3
// ============================================================================

export interface Notification {
  id: string;
  patientId: string;
  clinicId: string;
  type: 'appointment_reminder' | 'billing_alert' | 'payment_confirmation' | 'treatment_update' | 'system_alert';
  channel: 'sms' | 'email' | 'push' | 'in_app';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  scheduledFor?: string;
  sentAt?: string;
  readAt?: string;
  metadata?: {
    appointmentId?: string;
    paymentId?: string;
    treatmentId?: string;
    amount?: number;
    dueDate?: string;
  };
  veritasSignature: string; // @veritas quantum signature
  createdAt: string;
}

export interface NotificationPreferences {
  patientId: string;
  smsEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  appointmentReminders: boolean;
  billingAlerts: boolean;
  paymentConfirmations: boolean;
  treatmentUpdates: boolean;
  reminderHours: number; // hours before appointment
  quietHours: {
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  language: 'es' | 'en' | 'ca';
}

export interface NotificationTemplate {
  id: string;
  type: string;
  language: string;
  subject: string;
  smsBody: string;
  emailBody: string;
  variables: string[]; // Available template variables
}

export interface NotificationState {
  notifications: Notification[];
  preferences: NotificationPreferences | null;
  templates: NotificationTemplate[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setPreferences: (preferences: NotificationPreferences) => void;
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;
  setTemplates: (templates: NotificationTemplate[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed
  getUnreadNotifications: () => Notification[];
  getNotificationsByType: (type: string) => Notification[];
  getRecentNotifications: (limit?: number) => Notification[];
  getPendingNotifications: () => Notification[];
}

// ============================================================================
// ZUSTAND STORE - NOTIFICATION MANAGEMENT
// ============================================================================

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  preferences: null,
  templates: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  setNotifications: (notifications: Notification[]) => {
    const unreadCount = notifications.filter(n => n.status !== 'read').length;
    set({
      notifications,
      unreadCount,
      isLoading: false,
      error: null,
    });
  },

  addNotification: (notification: Notification) => {
    set((state) => {
      const newNotifications = [notification, ...state.notifications];
      const unreadCount = newNotifications.filter(n => n.status !== 'read').length;
      return {
        notifications: newNotifications,
        unreadCount,
      };
    });
  },

  updateNotification: (id: string, updates: Partial<Notification>) => {
    set((state) => {
      const notifications = state.notifications.map(n =>
        n.id === id ? { ...n, ...updates } : n
      );
      const unreadCount = notifications.filter(n => n.status !== 'read').length;
      return { notifications, unreadCount };
    });
  },

  markAsRead: (id: string) => {
    get().updateNotification(id, { status: 'read', readAt: new Date().toISOString() });
  },

  markAllAsRead: () => {
    set((state) => {
      const notifications = state.notifications.map(n => ({
        ...n,
        status: 'read' as const,
        readAt: new Date().toISOString(),
      }));
      return { notifications, unreadCount: 0 };
    });
  },

  setPreferences: (preferences: NotificationPreferences) => {
    set({
      preferences,
      isLoading: false,
      error: null,
    });
  },

  updatePreferences: (updates: Partial<NotificationPreferences>) => {
    set((state) => ({
      preferences: state.preferences ? { ...state.preferences, ...updates } : null,
    }));
  },

  setTemplates: (templates: NotificationTemplate[]) => {
    set({
      templates,
      isLoading: false,
      error: null,
    });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error }),

  getUnreadNotifications: () => {
    return get().notifications.filter(n => n.status !== 'read');
  },

  getNotificationsByType: (type: string) => {
    return get().notifications.filter(n => n.type === type);
  },

  getRecentNotifications: (limit = 10) => {
    return get().notifications.slice(0, limit);
  },

  getPendingNotifications: () => {
    return get().notifications.filter(n => n.status === 'pending');
  },
}));

// ============================================================================
// NOTIFICATION PROCESSING - GRAPHQL MUTATIONS & QUERIES
// ============================================================================

export const SEND_NOTIFICATION_MUTATION = `
  mutation SendNotification($input: NotificationInput!) {
    sendNotification(input: $input) {
      id
      patientId
      clinicId
      type
      channel
      title
      message
      priority
      status
      scheduledFor
      sentAt
      metadata
      veritasSignature
      createdAt
    }
  }
`;

export const SCHEDULE_NOTIFICATION_MUTATION = `
  mutation ScheduleNotification($input: ScheduledNotificationInput!) {
    scheduleNotification(input: $input) {
      id
      patientId
      clinicId
      type
      channel
      title
      message
      priority
      status
      scheduledFor
      metadata
      veritasSignature
      createdAt
    }
  }
`;

export const GET_NOTIFICATIONS_QUERY = `
  query GetNotifications($patientId: ID!, $limit: Int, $offset: Int, $status: String) {
    notifications(patientId: $patientId, limit: $limit, offset: $offset, status: $status) {
      id
      patientId
      clinicId
      type
      channel
      title
      message
      priority
      status
      scheduledFor
      sentAt
      readAt
      metadata
      veritasSignature
      createdAt
    }
  }
`;

export const GET_NOTIFICATION_PREFERENCES_QUERY = `
  query GetNotificationPreferences($patientId: ID!) {
    notificationPreferences(patientId: $patientId) {
      patientId
      smsEnabled
      emailEnabled
      pushEnabled
      appointmentReminders
      billingAlerts
      paymentConfirmations
      treatmentUpdates
      reminderHours
      quietHours {
        start
        end
      }
      language
    }
  }
`;

export const UPDATE_NOTIFICATION_PREFERENCES_MUTATION = `
  mutation UpdateNotificationPreferences($input: NotificationPreferencesInput!) {
    updateNotificationPreferences(input: $input) {
      patientId
      smsEnabled
      emailEnabled
      pushEnabled
      appointmentReminders
      billingAlerts
      paymentConfirmations
      treatmentUpdates
      reminderHours
      quietHours {
        start
        end
      }
      language
    }
  }
`;

// ============================================================================
// NOTIFICATION UTILITIES - @VERITAS SIGNATURES
// ============================================================================

export const generateNotificationSignature = (data: any): string => {
  // Simulate @veritas quantum signature generation
  const dataString = JSON.stringify(data);
  const mockSignature = btoa(dataString).substring(0, 64);
  return `veritas:notification:${mockSignature}`;
};

export const validateNotificationSignature = (notification: Notification): boolean => {
  const expectedSignature = generateNotificationSignature({
    id: notification.id,
    patientId: notification.patientId,
    clinicId: notification.clinicId,
    type: notification.type,
    message: notification.message,
  });

  return notification.veritasSignature === expectedSignature;
};

export const createAppointmentReminder = (
  patientId: string,
  clinicId: string,
  appointmentId: string,
  appointmentDate: string,
  clinicName: string,
  doctorName: string
): Notification => {
  const reminderTime = new Date(appointmentDate);
  reminderTime.setHours(reminderTime.getHours() - 24); // 24 hours before

  return {
    id: `reminder-${Date.now()}`,
    patientId,
    clinicId,
    type: 'appointment_reminder',
    channel: 'sms',
    title: 'Recordatorio de Cita Dental',
    message: `Hola! Tienes una cita dental mañana ${reminderTime.toLocaleDateString('es-ES')} en ${clinicName} con el Dr. ${doctorName}. Confirma tu asistencia.`,
    priority: 'high',
    status: 'pending',
    scheduledFor: reminderTime.toISOString(),
    metadata: { appointmentId },
    veritasSignature: generateNotificationSignature({
      id: `reminder-${Date.now()}`,
      patientId,
      clinicId,
      appointmentId,
    }),
    createdAt: new Date().toISOString(),
  };
};

export const createBillingAlert = (
  patientId: string,
  clinicId: string,
  paymentId: string,
  amount: number,
  dueDate: string
): Notification => {
  return {
    id: `billing-${Date.now()}`,
    patientId,
    clinicId,
    type: 'billing_alert',
    channel: 'email',
    title: 'Alerta de Facturación Dental',
    message: `Tienes un pago pendiente de €${amount.toFixed(2)} con fecha límite ${new Date(dueDate).toLocaleDateString('es-ES')}. Evita recargos procesando el pago a tiempo.`,
    priority: 'medium',
    status: 'pending',
    metadata: { paymentId, amount, dueDate },
    veritasSignature: generateNotificationSignature({
      id: `billing-${Date.now()}`,
      patientId,
      clinicId,
      amount,
    }),
    createdAt: new Date().toISOString(),
  };
};

export const createPaymentConfirmation = (
  patientId: string,
  clinicId: string,
  paymentId: string,
  amount: number,
  method: string
): Notification => {
  return {
    id: `payment-confirm-${Date.now()}`,
    patientId,
    clinicId,
    type: 'payment_confirmation',
    channel: 'email',
    title: 'Confirmación de Pago Dental',
    message: `Tu pago de €${amount.toFixed(2)} ha sido procesado exitosamente mediante ${method}. Gracias por confiar en nuestros servicios dentales.`,
    priority: 'low',
    status: 'pending',
    metadata: { paymentId, amount },
    veritasSignature: generateNotificationSignature({
      id: `payment-confirm-${Date.now()}`,
      patientId,
      clinicId,
      amount,
    }),
    createdAt: new Date().toISOString(),
  };
};

// ============================================================================
// NOTIFICATION SCHEDULER - AUTOMATED REMINDERS
// ============================================================================

export const scheduleAppointmentReminders = async (
  appointments: any[]
): Promise<Notification[]> => {
  const reminders: Notification[] = [];

  for (const appointment of appointments) {
    // 24-hour reminder
    const reminder24h = createAppointmentReminder(
      appointment.patientId,
      appointment.clinicId,
      appointment.id,
      appointment.date,
      appointment.clinicName,
      appointment.doctorName
    );

    // 1-hour reminder
    const reminder1h = {
      ...reminder24h,
      id: `reminder-1h-${Date.now()}`,
      title: 'Recordatorio Urgente - Cita en 1 hora',
      message: `¡URGENTE! Tu cita dental es en 1 hora en ${appointment.clinicName} con el Dr. ${appointment.doctorName}.`,
      scheduledFor: new Date(new Date(appointment.date).getTime() - 60 * 60 * 1000).toISOString(),
      priority: 'urgent' as const,
    };

    reminders.push(reminder24h, reminder1h);
  }

  return reminders;
};

export const scheduleBillingAlerts = async (
  pendingPayments: any[]
): Promise<Notification[]> => {
  const alerts: Notification[] = [];

  for (const payment of pendingPayments) {
    const dueDate = new Date(payment.dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue <= 7 && daysUntilDue > 0) {
      const alert = createBillingAlert(
        payment.patientId,
        payment.clinicId,
        payment.id,
        payment.amount,
        payment.dueDate
      );

      // Adjust priority based on urgency
      if (daysUntilDue <= 1) {
        alert.priority = 'urgent';
        alert.title = '¡URGENTE! Pago pendiente - Vence hoy';
      } else if (daysUntilDue <= 3) {
        alert.priority = 'high';
        alert.title = 'Pago pendiente - Vence pronto';
      }

      alerts.push(alert);
    }
  }

  return alerts;
};