// 🎯 SUBSCRIPTION MANAGEMENT V3 - SAAS PRICING & BILLING
// Date: November 8, 2025
// Mission: Complete subscription management with @veritas verification
// Status: V3 - Full Apollo Nuclear Integration

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_SUBSCRIPTION_PLANS_V3,
  GET_SUBSCRIPTIONS_V3,
  GET_SUBSCRIPTION_V3,
  CREATE_SUBSCRIPTION_V3,
  UPDATE_SUBSCRIPTION_V3,
  CANCEL_SUBSCRIPTION_V3,
  REACTIVATE_SUBSCRIPTION_V3
} from '../../graphql/queries/subscriptions';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Spinner } from '../../design-system';
import { createModuleLogger } from '../../utils/logger';

const l = createModuleLogger('SubscriptionManagementV3');

// ============================================================================
// VERITAS BADGE HELPER
// ============================================================================

const getVeritasBadge = (veritasData: any) => {
  if (!veritasData || !veritasData.verified) {
    return (
      <Badge variant="destructive" className="ml-2">
        ⚠️ No Verificado
      </Badge>
    );
  }

  const level = veritasData.level || 'UNKNOWN';
  const confidence = veritasData.confidence || 0;

  let variant: 'success' | 'warning' | 'destructive' = 'success';
  let icon = '✅';

  if (level === 'CRITICAL' || level === 'HIGH') {
    variant = confidence > 0.8 ? 'success' : 'warning';
    icon = confidence > 0.8 ? '🛡️' : '⚠️';
  } else if (level === 'MEDIUM') {
    variant = confidence > 0.6 ? 'success' : 'warning';
    icon = confidence > 0.6 ? '🔒' : '⚠️';
  } else {
    variant = 'destructive';
    icon = '❌';
  }

  return (
    <Badge variant={variant} className="ml-2">
      {icon} {level} ({Math.round(confidence * 100)}%)
    </Badge>
  );
};

// ============================================================================
// TYPES
// ============================================================================

interface SubscriptionPlan {
  id: string;
  name: string;
  name_veritas?: any;
  description?: string;
  price: number;
  price_veritas?: any;
  billingCycle: string;
  features: string[];
  limits: any;
  active: boolean;
  _veritas?: any;
}

interface Subscription {
  id: string;
  clinicId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: string;
  status_veritas?: any;
  startDate: string;
  startDate_veritas?: any;
  endDate?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  _veritas?: any;
}

interface SubscriptionManagementV3Props {
  clinicId?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SubscriptionManagementV3: React.FC<SubscriptionManagementV3Props> = ({ clinicId }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  // 🎯 GRAPHQL QUERIES
  const { data: plansData, loading: plansLoading } = useQuery(GET_SUBSCRIPTION_PLANS_V3, {
    variables: { filters: { active: true } },
    fetchPolicy: 'cache-and-network'
  });

  const { data: subscriptionsData, loading: subscriptionsLoading, refetch: refetchSubscriptions } = useQuery(
    GET_SUBSCRIPTIONS_V3,
    {
      variables: { filters: clinicId ? { clinicId } : {} },
      fetchPolicy: 'cache-and-network',
      skip: !clinicId
    }
  );

  // 🎯 MUTATIONS
  const [createSubscriptionMutation, { loading: createLoading }] = useMutation(CREATE_SUBSCRIPTION_V3);
  const [cancelSubscriptionMutation, { loading: cancelLoading }] = useMutation(CANCEL_SUBSCRIPTION_V3);
  const [reactivateSubscriptionMutation, { loading: reactivateLoading }] = useMutation(REACTIVATE_SUBSCRIPTION_V3);

  // 🎯 DATA EXTRACTION
  const plans = (plansData as any)?.subscriptionPlansV3 || [];
  const subscriptions = (subscriptionsData as any)?.subscriptionsV3 || [];

  const activeSubscription = useMemo(() => {
    return subscriptions.find((sub: Subscription) => sub.status === 'active');
  }, [subscriptions]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubscribe = async (planId: string) => {
    if (!clinicId) {
      l.error && l.error('Clinic ID required for subscription', new Error('No clinic ID'));
      return;
    }

    try {
      l.info('Creating subscription', { planId, clinicId });
      await createSubscriptionMutation({
        variables: {
          input: {
            clinicId,
            planId,
            status: 'active',
            startDate: new Date().toISOString()
          }
        }
      });

      refetchSubscriptions();
      l.info('Subscription created successfully');
    } catch (error) {
      l.error && l.error('Subscription creation failed', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const handleCancelSubscription = async (subscriptionId: string, cancelAtPeriodEnd: boolean = true) => {
    if (!window.confirm(`¿Cancelar suscripción ${cancelAtPeriodEnd ? 'al final del período' : 'inmediatamente'}?`))
      return;

    try {
      l.info('Canceling subscription', { subscriptionId, cancelAtPeriodEnd });
      await cancelSubscriptionMutation({
        variables: { id: subscriptionId, cancelAtPeriodEnd }
      });

      refetchSubscriptions();
      l.info('Subscription cancelled successfully');
    } catch (error) {
      l.error && l.error('Subscription cancellation failed', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const handleReactivateSubscription = async (subscriptionId: string) => {
    try {
      l.info('Reactivating subscription', { subscriptionId });
      await reactivateSubscriptionMutation({
        variables: { id: subscriptionId }
      });

      refetchSubscriptions();
      l.info('Subscription reactivated successfully');
    } catch (error) {
      l.error &&
        l.error('Subscription reactivation failed', error instanceof Error ? error : new Error(String(error)));
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Suscripciones</h1>
        <div className="flex space-x-2">
          <Button variant={activeTab === 'plans' ? 'default' : 'outline'} onClick={() => setActiveTab('plans')}>
            Planes
          </Button>
          {clinicId && (
            <Button
              variant={activeTab === 'subscriptions' ? 'default' : 'outline'}
              onClick={() => setActiveTab('subscriptions')}
            >
              Mis Suscripciones
            </Button>
          )}
        </div>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Planes Disponibles</h2>
          {plansLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan: SubscriptionPlan) => (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{plan.name}</span>
                      {plan.name_veritas && getVeritasBadge(plan.name_veritas)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-3xl font-bold text-blue-600">
                          €{plan.price}
                          <span className="text-sm font-normal text-gray-600">/{plan.billingCycle}</span>
                        </p>
                        {plan.price_veritas && getVeritasBadge(plan.price_veritas)}
                      </div>

                      {plan.description && <p className="text-sm text-gray-600">{plan.description}</p>}

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Características:</h4>
                        <ul className="space-y-1">
                          {plan.features.map((feature: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={!clinicId || createLoading || !!activeSubscription}
                      >
                        {activeSubscription ? 'Ya tienes suscripción activa' : 'Suscribirse'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && clinicId && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Mis Suscripciones</h2>
          {subscriptionsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : subscriptions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No tienes suscripciones activas</p>
                <Button className="mt-4" onClick={() => setActiveTab('plans')}>
                  Ver Planes
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription: Subscription) => (
                <Card key={subscription.id}>
                  <CardContent className="py-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{subscription.plan.name}</h3>
                          <Badge
                            variant={
                              subscription.status === 'active'
                                ? 'success'
                                : subscription.status === 'cancelled'
                                  ? 'destructive'
                                  : 'warning'
                            }
                          >
                            {subscription.status}
                          </Badge>
                          {subscription.status_veritas && getVeritasBadge(subscription.status_veritas)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-gray-600">Precio:</p>
                            <p className="font-semibold">
                              €{subscription.plan.price}/{subscription.plan.billingCycle}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Inicio:</p>
                            <p className="font-semibold">{new Date(subscription.startDate).toLocaleDateString()}</p>
                            {subscription.startDate_veritas && getVeritasBadge(subscription.startDate_veritas)}
                          </div>
                          <div>
                            <p className="text-gray-600">Período actual:</p>
                            <p className="font-semibold">
                              {new Date(subscription.currentPeriodStart).toLocaleDateString()} -{' '}
                              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Cancelar al finalizar período:</p>
                            <p className="font-semibold">{subscription.cancelAtPeriodEnd ? 'Sí' : 'No'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancelSubscription(subscription.id, true)}
                            disabled={cancelLoading}
                          >
                            Cancelar
                          </Button>
                        )}
                        {subscription.cancelAtPeriodEnd && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleReactivateSubscription(subscription.id)}
                            disabled={reactivateLoading}
                          >
                            Reactivar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagementV3;
