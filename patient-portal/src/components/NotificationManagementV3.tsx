import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNotificationStore } from '../stores/notificationStore';
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
// COMPONENTE: NOTIFICATION MANAGEMENT V3 - SMS/EMAIL SYSTEM
// ============================================================================

const NotificationManagementV3: React.FC = () => {
  const {
    notifications,
    preferences,
    unreadCount,
    isLoading,
    error,
    setNotifications,
    addNotification,
    updateNotification,
    markAsRead,
    markAllAsRead,
    setPreferences,
    updatePreferences,
    setLoading,
    setError,
    getUnreadNotifications,
    getNotificationsByType,
    getRecentNotifications,
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<'inbox' | 'preferences' | 'history'>('inbox');
  const [showPreferences, setShowPreferences] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockNotifications: any[] = [
      {
        id: 'notif-1',
        patientId: 'patient-1',
        clinicId: 'clinic-1',
        type: 'appointment_reminder',
        channel: 'sms',
        title: 'Recordatorio de Cita Dental',
        message: 'Hola! Tienes una cita dental mañana 15/01/2024 en Clínica Dental Central con el Dr. García.',
        priority: 'high',
        status: 'unread',
        scheduledFor: '2024-01-14T10:00:00Z',
        sentAt: '2024-01-14T10:00:00Z',
        metadata: { appointmentId: 'appt-123' },
        veritasSignature: 'veritas:notification:abc123...',
        createdAt: '2024-01-14T09:00:00Z',
      },
      {
        id: 'notif-2',
        patientId: 'patient-1',
        clinicId: 'clinic-1',
        type: 'billing_alert',
        channel: 'email',
        title: 'Alerta de Facturación Dental',
        message: 'Tienes un pago pendiente de €75.00 con fecha límite 20/01/2024.',
        priority: 'medium',
        status: 'read',
        sentAt: '2024-01-10T14:00:00Z',
        metadata: { paymentId: 'pay-456', amount: 75.00, dueDate: '2024-01-20' },
        veritasSignature: 'veritas:notification:def456...',
        createdAt: '2024-01-10T13:00:00Z',
      },
      {
        id: 'notif-3',
        patientId: 'patient-1',
        clinicId: 'clinic-1',
        type: 'payment_confirmation',
        channel: 'email',
        title: 'Confirmación de Pago Dental',
        message: 'Tu pago de €150.00 ha sido procesado exitosamente mediante VISA ****4242.',
        priority: 'low',
        status: 'unread',
        sentAt: '2024-01-08T16:30:00Z',
        metadata: { paymentId: 'pay-789', amount: 150.00 },
        veritasSignature: 'veritas:notification:ghi789...',
        createdAt: '2024-01-08T16:25:00Z',
      },
    ];

    const mockPreferences: any = {
      patientId: 'patient-1',
      smsEnabled: true,
      emailEnabled: true,
      pushEnabled: false,
      appointmentReminders: true,
      billingAlerts: true,
      paymentConfirmations: true,
      treatmentUpdates: false,
      reminderHours: 24,
      quietHours: { start: '22:00', end: '08:00' },
      language: 'es',
    };

    setNotifications(mockNotifications);
    setPreferences(mockPreferences);
  }, [setNotifications, setPreferences]);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleUpdatePreferences = (updates: any) => {
    updatePreferences(updates);
  };

  const handleSendTestNotification = async (type: string) => {
    setLoading(true);
    setError(null);

    try {
      let testNotification: any;

      switch (type) {
        case 'appointment_reminder':
          testNotification = {
            id: `test-${Date.now()}`,
            patientId: 'patient-1',
            clinicId: 'clinic-1',
            type: 'appointment_reminder',
            channel: 'sms',
            title: 'TEST - Recordatorio de Cita',
            message: 'Esta es una notificación de prueba para recordatorio de cita.',
            priority: 'low',
            status: 'sent',
            sentAt: new Date().toISOString(),
            veritasSignature: 'veritas:test:123',
            createdAt: new Date().toISOString(),
          };
          break;

        case 'billing_alert':
          testNotification = {
            id: `test-${Date.now()}`,
            patientId: 'patient-1',
            clinicId: 'clinic-1',
            type: 'billing_alert',
            channel: 'email',
            title: 'TEST - Alerta de Facturación',
            message: 'Esta es una notificación de prueba para alerta de facturación.',
            priority: 'low',
            status: 'sent',
            sentAt: new Date().toISOString(),
            veritasSignature: 'veritas:test:456',
            createdAt: new Date().toISOString(),
          };
          break;

        default:
          throw new Error('Tipo de notificación no válido');
      }

      addNotification(testNotification);
      alert('Notificación de prueba enviada exitosamente');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_reminder':
        return <ClockIcon className="h-5 w-5 text-blue-400" />;
      case 'billing_alert':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'payment_confirmation':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms':
        return <DevicePhoneMobileIcon className="h-4 w-4 text-green-400" />;
      case 'email':
        return <EnvelopeIcon className="h-4 w-4 text-blue-400" />;
      case 'push':
        return <BellIcon className="h-4 w-4 text-purple-400" />;
      default:
        return <InformationCircleIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'high':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'low':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const filteredNotifications = filterType === 'all'
    ? notifications
    : notifications.filter(n => n.type === filterType);

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
              onClick={() => setShowPreferences(true)}
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
            {/* Filter and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm"
                >
                  <option value="all">Todas las notificaciones</option>
                  <option value="appointment_reminder">Recordatorios de cita</option>
                  <option value="billing_alert">Alertas de facturación</option>
                  <option value="payment_confirmation">Confirmaciones de pago</option>
                </select>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSendTestNotification('appointment_reminder')}
                  disabled={isLoading}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded-md transition-colors"
                >
                  Test Recordatorio
                </button>
                <button
                  onClick={() => handleSendTestNotification('billing_alert')}
                  disabled={isLoading}
                  className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white text-sm rounded-md transition-colors"
                >
                  Test Facturación
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-gray-800/50 rounded-lg p-4 border transition-all ${
                    notification.status !== 'read'
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
                            {notification.priority.toUpperCase()}
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
                      {notification.status !== 'read' && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
                          title="Marcar como leída"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      )}
                      {notification.status === 'read' && (
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
            <h3 className="text-lg font-semibold text-purple-100">Historial de Notificaciones</h3>
            <div className="space-y-4">
              {notifications
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((notification) => (
                  <div key={notification.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div>
                          <div className="font-medium text-white">{notification.title}</div>
                          <div className="text-sm text-gray-400">
                            {new Date(notification.createdAt).toLocaleDateString('es-ES')} •
                            {notification.channel} •
                            {notification.status}
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                        {notification.priority.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && preferences && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-purple-100">Preferencias de Notificación</h3>

            {/* Channel Preferences */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
              <h4 className="font-medium text-white mb-4">Canales de Comunicación</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.smsEnabled}
                    onChange={(e) => handleUpdatePreferences({ smsEnabled: e.target.checked })}
                    className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <DevicePhoneMobileIcon className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">SMS</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.emailEnabled}
                    onChange={(e) => handleUpdatePreferences({ emailEnabled: e.target.checked })}
                    className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <EnvelopeIcon className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">Email</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.pushEnabled}
                    onChange={(e) => handleUpdatePreferences({ pushEnabled: e.target.checked })}
                    className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
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
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.appointmentReminders}
                    onChange={(e) => handleUpdatePreferences({ appointmentReminders: e.target.checked })}
                    className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Recordatorios de citas (24h antes)</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.billingAlerts}
                    onChange={(e) => handleUpdatePreferences({ billingAlerts: e.target.checked })}
                    className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Alertas de facturación</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.paymentConfirmations}
                    onChange={(e) => handleUpdatePreferences({ paymentConfirmations: e.target.checked })}
                    className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Confirmaciones de pago</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={preferences.treatmentUpdates}
                    onChange={(e) => handleUpdatePreferences({ treatmentUpdates: e.target.checked })}
                    className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-300">Actualizaciones de tratamientos</span>
                </label>
              </div>
            </div>

            {/* Timing Preferences */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
              <h4 className="font-medium text-white mb-4">Configuración de Tiempo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Horas de antelación para recordatorios
                  </label>
                  <select
                    value={preferences.reminderHours}
                    onChange={(e) => handleUpdatePreferences({ reminderHours: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value={1}>1 hora</option>
                    <option value={2}>2 horas</option>
                    <option value={6}>6 horas</option>
                    <option value={12}>12 horas</option>
                    <option value={24}>24 horas</option>
                    <option value={48}>48 horas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Idioma
                  </label>
                  <select
                    value={preferences.language}
                    onChange={(e) => handleUpdatePreferences({ language: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="ca">Català</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Horas de silencio (no enviar notificaciones)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) => handleUpdatePreferences({
                      quietHours: { ...preferences.quietHours, start: e.target.value }
                    })}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
                  <span className="text-gray-400">a</span>
                  <input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) => handleUpdatePreferences({
                      quietHours: { ...preferences.quietHours, end: e.target.value }
                    })}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-purple-100">Preferencias de Notificación</h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Quick Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <div className="font-medium text-white">Notificaciones SMS</div>
                  <div className="text-sm text-gray-400">Recordatorios por mensaje de texto</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences?.smsEnabled || false}
                    onChange={(e) => handleUpdatePreferences({ smsEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <div className="font-medium text-white">Notificaciones Email</div>
                  <div className="text-sm text-gray-400">Alertas por correo electrónico</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences?.emailEnabled || false}
                    onChange={(e) => handleUpdatePreferences({ emailEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <div className="font-medium text-white">Recordatorios de Citas</div>
                  <div className="text-sm text-gray-400">Notificaciones 24h antes de la cita</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences?.appointmentReminders || false}
                    onChange={(e) => handleUpdatePreferences({ appointmentReminders: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
              >
                Guardar Preferencias
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManagementV3;