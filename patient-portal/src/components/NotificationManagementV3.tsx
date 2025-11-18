import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useAuthStore } from '../stores/authStore';
import {
  GET_PATIENT_NOTIFICATIONS,
  GET_NOTIFICATION_PREFERENCES,
  MARK_NOTIFICATION_AS_READ,
  UPDATE_NOTIFICATION_PREFERENCES,
  type Notification,
  type NotificationPreferences,
  type NotificationType,
  type NotificationChannel,
  type NotificationPriority,
  type NotificationStatus,
} from '../graphql/notifications';
import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

// ============================================================================
// COMPONENTE: NOTIFICATION MANAGEMENT V3 - SMS/EMAIL REAL DATA SYSTEM
// ============================================================================

const NotificationManagementV3: React.FC = () => {
  // Auth context - get patientId
  const { auth } = useAuthStore();
  const patientId = auth?.patientId || '';

  // State management
  const [activeTab, setActiveTab] = useState<'inbox' | 'preferences' | 'history'>('inbox');
  const [filterType, setFilterType] = useState<string>('all');

  // GraphQL Queries
  const {
    data: notificationsData,
    loading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery(GET_PATIENT_NOTIFICATIONS, {
    variables: { patientId, limit: 50, offset: 0 },
    skip: !patientId,
    fetchPolicy: 'network-only',
    pollInterval: 30000, // Auto-refresh every 30s
  });

  const {
    data: preferencesData,
    loading: preferencesLoading,
    error: preferencesError,
    refetch: refetchPreferences,
  } = useQuery(GET_NOTIFICATION_PREFERENCES, {
    variables: { patientId },
    skip: !patientId,
    fetchPolicy: 'network-only',
  });

  // GraphQL Mutations
  const [markAsReadMutation, { loading: markingAsRead }] = useMutation(
    MARK_NOTIFICATION_AS_READ,
    {
      onCompleted: () => {
        refetchNotifications();
        console.log('✅ Notificación marcada como leída');
      },
      onError: (error) => {
        console.error('❌ Error al marcar como leída:', error);
      },
    }
  );

  const [updatePreferencesMutation, { loading: updatingPreferences }] = useMutation(
    UPDATE_NOTIFICATION_PREFERENCES,
    {
      onCompleted: () => {
        refetchPreferences();
        console.log('✅ Preferencias actualizadas');
      },
      onError: (error) => {
        console.error('❌ Error al actualizar preferencias:', error);
      },
    }
  );

  // Extract data from GraphQL responses
  const notifications: Notification[] = useMemo(
    () => notificationsData?.patientNotifications || [],
    [notificationsData]
  );

  const preferences: NotificationPreferences | null = useMemo(
    () => preferencesData?.notificationPreferences || null,
    [preferencesData]
  );

  // Calculate unread count
  const unreadCount = useMemo(
    () => notifications.filter((n) => n.status === 'PENDING').length,
    [notifications]
  );

  // Combined loading/error state
  const error = notificationsError?.message || preferencesError?.message || null;

  // Handlers
  const handleMarkAsRead = useCallback(
    async (id: string) => {
      try {
        await markAsReadMutation({
          variables: { id },
        });
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    },
    [markAsReadMutation]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications
        .filter((n) => n.status === 'PENDING')
        .map((n) => n.id);

      for (const id of unreadIds) {
        await markAsReadMutation({
          variables: { id },
        });
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [notifications, markAsReadMutation]);

  const handleUpdatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      try {
        await updatePreferencesMutation({
          variables: {
            patientId,
            input: updates,
          },
        });
      } catch (err) {
        console.error('Error updating preferences:', err);
      }
    },
    [patientId, updatePreferencesMutation]
  );

  // UI Helpers
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'APPOINTMENT_REMINDER':
      case 'APPOINTMENT_CONFIRMED':
      case 'APPOINTMENT_CANCELLED':
        return <ClockIcon className="h-5 w-5 text-blue-400" />;
      case 'BILLING_DUE':
      case 'BILLING_PAID':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'TREATMENT_UPDATED':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'DOCUMENT_SHARED':
        return <InformationCircleIcon className="h-5 w-5 text-purple-400" />;
      case 'PRESCRIPTION_READY':
        return <CheckCircleIcon className="h-5 w-5 text-blue-400" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'SMS':
        return <DevicePhoneMobileIcon className="h-4 w-4 text-green-400" />;
      case 'EMAIL':
        return <EnvelopeIcon className="h-4 w-4 text-blue-400" />;
      case 'PUSH':
        return <BellIcon className="h-4 w-4 text-purple-400" />;
      case 'IN_APP':
        return <BellIconSolid className="h-4 w-4 text-yellow-400" />;
      default:
        return <InformationCircleIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'HIGH':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'NORMAL':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'LOW':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  // Filter notifications based on active tab and filter
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    if (filterType !== 'all') {
      filtered = filtered.filter((n) => n.type === filterType);
    }

    if (activeTab === 'inbox') {
      filtered = filtered.filter((n) => n.status !== 'READ');
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications, filterType, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-6 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-purple-100 mb-2">🔔 Sistema de Notificaciones V3</h2>
            <p className="text-purple-300">SMS/Email automatizados - Recordatorios 24h + Alertas</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-purple-400">
              No leídas: <span className="font-bold text-red-400">{unreadCount}</span>
            </div>
            <button
              onClick={() => setActiveTab('preferences')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Cog6ToothIcon className="h-4 w-4" />
              <span>Preferencias</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
        {[
          { id: 'inbox', label: 'Bandeja', icon: BellIcon },
          { id: 'history', label: 'Historial', icon: ClockIcon },
          { id: 'preferences', label: 'Preferencias', icon: Cog6ToothIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 p-6">
        {activeTab === 'inbox' && (
          <div className="space-y-6">
            {/* Loading State */}
            {notificationsLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-300">Cargando notificaciones...</span>
              </div>
            )}

            {/* Filter and Actions */}
            {!notificationsLoading && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm"
                  >
                    <option value="all">Todas las notificaciones</option>
                    <option value="APPOINTMENT_REMINDER">Recordatorios de cita</option>
                    <option value="APPOINTMENT_CONFIRMED">Citas confirmadas</option>
                    <option value="APPOINTMENT_CANCELLED">Citas canceladas</option>
                    <option value="BILLING_DUE">Facturas pendientes</option>
                    <option value="BILLING_PAID">Pagos confirmados</option>
                    <option value="TREATMENT_UPDATED">Actualizaciones de tratamiento</option>
                    <option value="DOCUMENT_SHARED">Documentos compartidos</option>
                  </select>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={markingAsRead}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-md transition-colors"
                    >
                      Marcar todas como leídas
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Notifications List */}
            {!notificationsLoading && filteredNotifications.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <BellIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay notificaciones pendientes</p>
              </div>
            )}

            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-gray-800/50 rounded-lg p-4 border transition-all ${
                    notification.status !== 'READ'
                      ? 'border-purple-500/50 bg-purple-900/10'
                      : 'border-gray-600/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-white">{notification.title}</h4>
                          {getChannelIcon(notification.channel)}
                          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{notification.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>{new Date(notification.createdAt).toLocaleString('es-ES')}</span>
                          {notification.sentAt && (
                            <span>Enviado: {new Date(notification.sentAt).toLocaleString('es-ES')}</span>
                          )}
                          <span className="capitalize">{notification.channel}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {notification.status !== 'READ' && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markingAsRead}
                          className="p-1 text-purple-400 hover:text-purple-300 disabled:text-gray-600 transition-colors"
                          title="Marcar como leída"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      )}
                      {notification.status === 'READ' && (
                        <EyeSlashIcon className="h-4 w-4 text-gray-500" title="Leída" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-100 mb-4">Historial de Notificaciones</h3>

            {notificationsLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600"></div>
                <span className="ml-3 text-gray-300">Cargando historial...</span>
              </div>
            )}

            {!notificationsLoading && notifications.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <ClockIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay historial de notificaciones</p>
              </div>
            )}

            <div className="space-y-4">
              {notifications
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                .map((notification) => (
                  <div
                    key={notification.id}
                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div>
                          <div className="font-medium text-white">{notification.title}</div>
                          <div className="text-sm text-gray-400">
                            {new Date(notification.createdAt).toLocaleDateString(
                              'es-ES'
                            )} • {notification.channel} • {notification.status}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                          notification.priority
                        )}`}
                      >
                        {notification.priority}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-100">Preferencias de Notificación</h3>
              {preferencesLoading && <span className="text-sm text-gray-400">Cargando...</span>}
            </div>

            {preferencesError && (
              <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300">Error al cargar preferencias: {preferencesError.message}</p>
              </div>
            )}

            {!preferencesLoading && preferences && (
              <>
                {/* Channel Preferences */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                  <h4 className="font-medium text-white mb-4">Canales de Comunicación</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.smsEnabled}
                        onChange={(e) =>
                          handleUpdatePreferences({ smsEnabled: e.target.checked })
                        }
                        disabled={updatingPreferences}
                        className="rounded border-gray-600 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                      />
                      <DevicePhoneMobileIcon className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300">SMS</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.emailEnabled}
                        onChange={(e) =>
                          handleUpdatePreferences({ emailEnabled: e.target.checked })
                        }
                        disabled={updatingPreferences}
                        className="rounded border-gray-600 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                      />
                      <EnvelopeIcon className="h-5 w-5 text-blue-400" />
                      <span className="text-gray-300">Email</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.pushEnabled}
                        onChange={(e) =>
                          handleUpdatePreferences({ pushEnabled: e.target.checked })
                        }
                        disabled={updatingPreferences}
                        className="rounded border-gray-600 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                      />
                      <BellIcon className="h-5 w-5 text-purple-400" />
                      <span className="text-gray-300">Push Notifications</span>
                    </label>
                  </div>
                </div>

                {/* Notification Types */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                  <h4 className="font-medium text-white mb-4">Tipos de Notificación</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.appointmentReminders}
                        onChange={(e) =>
                          handleUpdatePreferences({ appointmentReminders: e.target.checked })
                        }
                        disabled={updatingPreferences}
                        className="rounded border-gray-600 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                      />
                      <span className="text-gray-300">Recordatorios de citas</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.billingAlerts}
                        onChange={(e) =>
                          handleUpdatePreferences({ billingAlerts: e.target.checked })
                        }
                        disabled={updatingPreferences}
                        className="rounded border-gray-600 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                      />
                      <span className="text-gray-300">Alertas de facturación</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.treatmentUpdates}
                        onChange={(e) =>
                          handleUpdatePreferences({ treatmentUpdates: e.target.checked })
                        }
                        disabled={updatingPreferences}
                        className="rounded border-gray-600 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                      />
                      <span className="text-gray-300">Actualizaciones de tratamientos</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketingEmails}
                        onChange={(e) =>
                          handleUpdatePreferences({ marketingEmails: e.target.checked })
                        }
                        disabled={updatingPreferences}
                        className="rounded border-gray-600 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                      />
                      <span className="text-gray-300">Emails de marketing</span>
                    </label>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    ℹ️ Las preferencias se actualizan automáticamente. Los cambios se sincronizarán con tu cuenta en Selene.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Preferences Modal - REMOVED: Duplicated in Preferences Tab */}
    </div>
  );
};

export default NotificationManagementV3;