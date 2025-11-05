import React, { useEffect, useState } from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  StarIcon,
  CalendarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useSubscriptionStore, AVAILABLE_PLANS, type PatientSubscription } from '../stores/subscriptionStore';
import { useAuthStore } from '../stores/authStore';

// ============================================================================
// COMPONENTE: SUBSCRIPTION DASHBOARD V3 - NETFLIX DENTAL MODEL
// ============================================================================

const SubscriptionDashboardV3: React.FC = () => {
  const { auth } = useAuthStore();
  const {
    subscriptions,
    currentPlan,
    isLoading,
    error,
    setSubscriptions,
    getActiveSubscriptions,
    getTotalSpent,
    getUpcomingRenewals,
  } = useSubscriptionStore();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Mock data loading (replace with GraphQL query)
  useEffect(() => {
    if (auth?.isAuthenticated) {
      // Simulate loading subscriptions from Apollo Nuclear
      setTimeout(() => {
        const mockSubscriptions: PatientSubscription[] = [
          {
            id: 'sub-001',
            planId: 'premium-care',
            status: 'active',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            autoRenew: true,
            remainingAppointments: 2,
            usedAppointments: 2,
            plan: AVAILABLE_PLANS[1], // Premium Care
          },
        ];
        setSubscriptions(mockSubscriptions);
      }, 1000);
    }
  }, [auth, setSubscriptions]);

  const activeSubscriptions = getActiveSubscriptions();
  const totalSpent = getTotalSpent();
  const upcomingRenewals = getUpcomingRenewals();

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency === 'ARS' ? 'ARS' : 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!auth?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <div className="text-center">
          <ShieldCheckIcon className="w-16 h-16 text-neon-cyan mx-auto mb-4 animate-pulse-neon" />
          <h2 className="text-2xl font-bold text-neon-cyan mb-2">Acceso Requerido</h2>
          <p className="text-cyber-light">Debes iniciar sesión para ver tus suscripciones</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-gradient text-white">
      {/* Header */}
      <div className="bg-cyber-dark border-b border-neon-cyan/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
                Dashboard de Suscripciones
              </h1>
              <p className="text-cyber-light mt-1">Modelo Netflix Dental - Titan V3</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-cyber-light">Paciente ID</p>
                <p className="text-neon-cyan font-mono">{auth.patientId}</p>
              </div>
              <div className="w-12 h-12 bg-neon-cyan/20 rounded-full flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-neon-cyan" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
            <span className="ml-4 text-neon-cyan">Cargando suscripciones...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Current Plan Highlight */}
        {currentPlan && (
          <div className="bg-gradient-to-r from-neon-cyan/10 to-neon-blue/10 border border-neon-cyan/30 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neon-cyan mb-2">
                  Plan Actual: {currentPlan.plan.name}
                </h2>
                <p className="text-cyber-light mb-4">{currentPlan.plan.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-cyber-light">Consultas Restantes</p>
                    <p className="text-2xl font-bold text-neon-green">
                      {currentPlan.remainingAppointments}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-cyber-light">Días Restantes</p>
                    <p className="text-2xl font-bold text-neon-yellow">
                      {getDaysUntilExpiry(currentPlan.endDate)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-cyber-light">Renovación</p>
                    <p className="text-lg font-bold text-neon-purple">
                      {currentPlan.autoRenew ? 'Automática' : 'Manual'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-cyber-light">Vence</p>
                    <p className="text-lg font-bold text-neon-pink">
                      {formatDate(currentPlan.endDate)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-neon-cyan">
                  {formatCurrency(currentPlan.plan.price, currentPlan.plan.currency)}
                </p>
                <p className="text-sm text-cyber-light">por año</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-cyber-gray rounded-lg p-6 border border-cyber-light">
            <div className="flex items-center">
              <CreditCardIcon className="w-8 h-8 text-neon-green mr-3" />
              <div>
                <p className="text-sm text-cyber-light">Total Invertido</p>
                <p className="text-2xl font-bold text-neon-green">
                  {formatCurrency(totalSpent, 'ARS')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-cyber-gray rounded-lg p-6 border border-cyber-light">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-neon-blue mr-3" />
              <div>
                <p className="text-sm text-cyber-light">Suscripciones Activas</p>
                <p className="text-2xl font-bold text-neon-blue">
                  {activeSubscriptions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-cyber-gray rounded-lg p-6 border border-cyber-light">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-neon-yellow mr-3" />
              <div>
                <p className="text-sm text-cyber-light">Próximas Renovaciones</p>
                <p className="text-2xl font-bold text-neon-yellow">
                  {upcomingRenewals.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Planes Disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AVAILABLE_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`bg-cyber-gray rounded-lg p-6 border transition-all duration-300 cursor-pointer ${
                  plan.isPopular
                    ? 'border-neon-cyan shadow-neon-cyan'
                    : 'border-cyber-light hover:border-neon-blue'
                } ${selectedPlan === plan.id ? 'ring-2 ring-neon-cyan' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.isPopular && (
                  <div className="flex items-center mb-3">
                    <StarIcon className="w-5 h-5 text-neon-yellow mr-2" />
                    <span className="text-sm text-neon-yellow font-semibold">Más Popular</span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-cyber-light text-sm mb-4">{plan.description}</p>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-neon-cyan">
                    {formatCurrency(plan.price, plan.currency)}
                  </span>
                  <span className="text-cyber-light text-sm"> / año</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-cyber-light">
                      <CheckCircleIcon className="w-4 h-4 text-neon-green mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                    plan.isPopular
                      ? 'bg-neon-cyan text-cyber-black hover:bg-neon-cyan/80'
                      : 'bg-cyber-dark text-neon-blue border border-neon-blue hover:bg-neon-blue hover:text-cyber-black'
                  }`}
                >
                  {activeSubscriptions.some(sub => sub.planId === plan.id)
                    ? 'Plan Actual'
                    : 'Seleccionar Plan'
                  }
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription History */}
        <div className="bg-cyber-gray rounded-lg p-6 border border-cyber-light">
          <h2 className="text-2xl font-bold text-white mb-6">Historial de Suscripciones</h2>

          {subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-cyber-light mx-auto mb-4" />
              <p className="text-cyber-light">No hay suscripciones registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-4 bg-cyber-dark rounded-lg border border-cyber-light"
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-4 ${
                      subscription.status === 'active' ? 'bg-neon-green' :
                      subscription.status === 'cancelled' ? 'bg-red-500' :
                      'bg-cyber-light'
                    }`}></div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {subscription.plan.name}
                      </h3>
                      <p className="text-sm text-cyber-light">
                        {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-neon-cyan">
                      {formatCurrency(subscription.plan.price, subscription.plan.currency)}
                    </p>
                    <p className={`text-sm capitalize ${
                      subscription.status === 'active' ? 'text-neon-green' :
                      subscription.status === 'cancelled' ? 'text-red-500' :
                      'text-cyber-light'
                    }`}>
                      {subscription.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDashboardV3;