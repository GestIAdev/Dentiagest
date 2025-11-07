import React, { useState, useEffect } from 'react';
import { useDocumentLogger } from '../../utils/documentLogger';
import {
  CreditCardIcon,
  StarIcon,
  ClockIcon,
  SparklesIcon,
  ShieldCheckIcon,
  HeartIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon
} from '@heroicons/react/24/solid';
import { SubscriptionPlan, PatientSubscription } from '../../types/SubscriptionDentalCare';
import subscriptionService from '../../services/SubscriptionService';

interface SubscriptionPlansManagerProps {
  onPlanSelect?: (plan: SubscriptionPlan) => void;
  onSubscribe?: (planId: string) => void;
  currentSubscription?: PatientSubscription;
}

const SubscriptionPlansManager: React.FC<SubscriptionPlansManagerProps> = ({
  onPlanSelect,
  onSubscribe,
  currentSubscription
}) => {
  const logger = useDocumentLogger('SubscriptionPlansManager');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const availablePlans = await subscriptionService.getAllPlans();
      setPlans(availablePlans);
    } catch (error) {
      logger.logError(error as Error, { message: 'Error loading plans' });
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan.id);
    onPlanSelect?.(plan);
  };

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    try {
      // In a real app, this would redirect to payment processing
      onSubscribe?.(planId);
    } catch (error) {
      logger.logError(error as Error, { message: 'Error subscribing', planId });
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'basic': return <ShieldCheckIcon className="h-8 w-8 text-blue-600" />;
      case 'premium': return <StarIcon className="h-8 w-8 text-purple-600" />;
      case 'vip': return <SparklesIcon className="h-8 w-8 text-yellow-600" />;
      default: return <HeartIcon className="h-8 w-8 text-gray-600" />;
    }
  };

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'blue';
      case 'premium': return 'purple';
      case 'vip': return 'yellow';
      default: return 'gray';
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'basic': return '🌱 Básico';
      case 'premium': return '⭐ Premium';
      case 'vip': return '👑 VIP';
      default: return tier.toUpperCase();
    }
  };

  const calculateSavings = (monthly: number, yearly: number) => {
    const monthlyYearly = monthly * 12;
    const savings = monthlyYearly - yearly;
    const percentage = Math.round((savings / monthlyYearly) * 100);
    return { savings, percentage };
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
            <CreditCardIcon className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          💎 Suscripción Dental Care
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          El modelo Netflix para odontología - Cuidados predecibles, sin sorpresas
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            Mensual
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingCycle === 'yearly' ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${billingCycle === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Anual
            </span>
            {billingCycle === 'yearly' && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                💰 Ahorra hasta 20%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const isCurrentPlan = currentSubscription?.planId === plan.id;
          const color = getPlanColor(plan.tier);
          const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
          const savings = billingCycle === 'yearly' ?
            calculateSavings(plan.price.monthly, plan.price.yearly) : null;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-xl ${
                isSelected ? `border-${color}-500 shadow-lg` : 'border-gray-200 hover:border-gray-300'
              } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    🎯 Tu Plan Actual
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className={`p-6 border-b border-gray-100 bg-gradient-to-r ${
                plan.tier === 'basic' ? 'from-blue-50 to-blue-100' :
                plan.tier === 'premium' ? 'from-purple-50 to-purple-100' :
                'from-yellow-50 to-yellow-100'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  {getPlanIcon(plan.tier)}
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    plan.tier === 'basic' ? 'bg-blue-100 text-blue-800' :
                    plan.tier === 'premium' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getTierBadge(plan.tier)}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                {/* Price */}
                <div className="text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      €{price.toFixed(2)}
                    </span>
                    <span className="text-gray-500 ml-1">
                      /{billingCycle === 'monthly' ? 'mes' : 'año'}
                    </span>
                  </div>
                  {savings && (
                    <div className="mt-2">
                      <span className="text-green-600 text-sm font-medium">
                        💰 Ahorras €{savings.savings.toFixed(2)} ({savings.percentage}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">✨ Incluye:</h4>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature.id} className="flex items-start space-x-3">
                      <CheckCircleSolidIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                        <p className="text-xs text-gray-600">{feature.description}</p>
                        {feature.visitLimit && (
                          <p className="text-xs text-blue-600 font-medium">
                            {feature.visitLimit.type === 'unlimited' ? '✅ Ilimitadas' :
                             `${feature.visitLimit.count} visitas/${feature.visitLimit.type === 'monthly' ? 'mes' : 'año'}`}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">⚠️ Limitaciones:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation) => (
                        <li key={limitation.id} className="flex items-start space-x-2">
                          <ClockIcon className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-600">{limitation.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => isCurrentPlan ? null : handlePlanSelect(plan)}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    isCurrentPlan
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : isSelected
                        ? `bg-${color}-600 text-white hover:bg-${color}-700`
                        : `border-2 border-${color}-300 text-${color}-700 hover:bg-${color}-50`
                  }`}
                >
                  {isCurrentPlan ? (
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircleSolidIcon className="h-5 w-5" />
                      <span>Plan Actual</span>
                    </div>
                  ) : isSelected ? (
                    <div className="flex items-center justify-center space-x-2">
                      <BoltIcon className="h-5 w-5" />
                      <span>Suscribirse Ahora</span>
                    </div>
                  ) : (
                    <span>Seleccionar Plan</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">🎯 Plan Seleccionado</h3>
              <p className="text-purple-100">
                Estas a punto de revolucionar tu cuidado dental con pagos predecibles
              </p>
            </div>
            <button
              onClick={() => handleSubscribe(selectedPlan)}
              disabled={loading}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {loading ? 'Procesando...' : '🚀 Comenzar Revolución Dental'}
            </button>
          </div>
        </div>
      )}

      {/* Benefits Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🌟 ¿Por qué elegir Suscripción Dental Care?
          </h3>
          <p className="text-gray-600">
            La odontología del futuro - sin sorpresas, sin estrés
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Sin Sorpresas</h4>
            <p className="text-gray-600 text-sm">
              Pagos fijos mensuales, sin facturas inesperadas por tratamientos
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <StarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Atención Prioritaria</h4>
            <p className="text-gray-600 text-sm">
              Citas preferentes, atención 24/7 y tratamientos ilimitados
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <HeartIcon className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Salud Dental Premium</h4>
            <p className="text-gray-600 text-sm">
              Prevención, tratamientos y emergencias - todo cubierto
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansManager;
