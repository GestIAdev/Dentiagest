// ============================================================================
// SUBSCRIPTION PLAN MANAGER V3 - CRUD FOR STAFF DASHBOARD
// By PunkClaude - Directiva #007.1 - "LA FÁBRICA"
// Purpose: Create, Edit, Delete subscription plans with multi-currency support
// ============================================================================

import React, { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import apolloClient from '../../apollo/graphql-client';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

// ============================================================================
// TYPES
// ============================================================================

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'EUR' | 'USD' | 'ARS';
  consultas_incluidas: number;
  is_active: boolean;
  features: string[];
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  description: string;
  price: number;
  currency: 'EUR' | 'USD' | 'ARS';
  consultas_incluidas: number;
  is_active: boolean;
  features: string[];
}

// ============================================================================
// GRAPHQL QUERIES & MUTATIONS
// ============================================================================

const GET_SUBSCRIPTION_PLANS = gql`
  query GetSubscriptionPlans($clinicId: ID!) {
    subscriptionPlansV3(clinicId: $clinicId) {
      id
      name
      description
      price
      currency
      consultas_incluidas
      is_active
      features
      created_at
      updated_at
    }
  }
`;

const CREATE_SUBSCRIPTION_PLAN = gql`
  mutation CreateSubscriptionPlan($input: CreateSubscriptionPlanInputV3!) {
    createSubscriptionPlanV3(input: $input) {
      id
      name
      price
      currency
    }
  }
`;

const UPDATE_SUBSCRIPTION_PLAN = gql`
  mutation UpdateSubscriptionPlan($id: ID!, $input: UpdateSubscriptionPlanInputV3!) {
    updateSubscriptionPlanV3(id: $id, input: $input) {
      id
      name
      price
      currency
    }
  }
`;

const DELETE_SUBSCRIPTION_PLAN = gql`
  mutation DeleteSubscriptionPlan($id: ID!) {
    deleteSubscriptionPlanV3(id: $id) {
      success
    }
  }
`;

// ============================================================================
// EXCHANGE RATES (2025-11-19)
// ============================================================================

const EXCHANGE_RATES = {
  EUR_TO_USD: 1.15,
  USD_TO_ARS: 1350,
  EUR_TO_ARS: 1552.5, // 1.15 * 1350
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (amount: number, currency: string): string => {
  const symbols: Record<string, string> = {
    EUR: '€',
    USD: '$',
    ARS: '$',
  };

  const formatted = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return currency === 'EUR'
    ? `${symbols[currency]}${formatted}`
    : `${symbols[currency]}${formatted} ${currency}`;
};

const getCurrencyEquivalents = (price: number, currency: string) => {
  const equivalents: Record<string, number> = {};
  
  if (currency === 'EUR') {
    equivalents.USD = price * EXCHANGE_RATES.EUR_TO_USD;
    equivalents.ARS = price * EXCHANGE_RATES.EUR_TO_ARS;
  } else if (currency === 'USD') {
    equivalents.EUR = price / EXCHANGE_RATES.EUR_TO_USD;
    equivalents.ARS = price * EXCHANGE_RATES.USD_TO_ARS;
  } else if (currency === 'ARS') {
    equivalents.EUR = price / EXCHANGE_RATES.EUR_TO_ARS;
    equivalents.USD = price / EXCHANGE_RATES.USD_TO_ARS;
  }
  
  return equivalents;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SubscriptionPlanManagerV3: React.FC = () => {
  const { state } = useAuth();
  // TODO: Get clinicId from user context or localStorage
  const clinicId = localStorage.getItem('clinicId') || '1'; // Default clinic

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const { data } = await apolloClient.query({
        query: GET_SUBSCRIPTION_PLANS,
        variables: { clinicId },
        fetchPolicy: 'network-only',
      });

      const plansData = (data as any).subscriptionPlansV3 || [];
      setPlans(plansData);
      console.log('✅ Plans loaded:', plansData.length);
    } catch (err) {
      console.error('❌ Error loading plans:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar planes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setShowModal(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este plan?')) return;

    try {
      await apolloClient.mutate({
        mutation: DELETE_SUBSCRIPTION_PLAN,
        variables: { id },
      });

      alert('Plan eliminado exitosamente');
      loadPlans();
    } catch (err) {
      console.error('❌ Error deleting plan:', err);
      alert('Error al eliminar plan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold cyberpunk-text">Gestión de Planes de Suscripción</h1>
          <p className="text-gray-400 mt-1">Configura los planes Netflix Dental de tu clínica</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-neon-cyan hover:bg-neon-cyan/80 text-cyber-black px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Crear Plan Nuevo
        </button>
      </div>

      {/* Exchange Rates Info */}
      <div className="bg-cyber-dark border border-neon-blue/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CurrencyDollarIcon className="w-5 h-5 text-neon-blue" />
          <h3 className="text-sm font-semibold text-white">Tipos de Cambio (2025-11-19)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-cyber-light">
          <div>1 EUR = $1.15 USD</div>
          <div>1 USD = $1,350 ARS</div>
          <div>1 EUR = $1,552.50 ARS</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          ❌ {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
          <p className="text-cyber-light mt-4">Cargando planes...</p>
        </div>
      )}

      {/* Plans Table */}
      {!loading && plans.length > 0 && (
        <div className="bg-cyber-dark rounded-xl border border-cyber-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-neon-cyan/10 to-neon-blue/10">
                <tr>
                  <th className="text-left px-6 py-4 text-neon-cyan font-semibold">Nombre</th>
                  <th className="text-left px-6 py-4 text-neon-cyan font-semibold">Precio</th>
                  <th className="text-left px-6 py-4 text-neon-cyan font-semibold hidden sm:table-cell">Consultas</th>
                  <th className="text-center px-6 py-4 text-neon-cyan font-semibold">Estado</th>
                  <th className="text-right px-6 py-4 text-neon-cyan font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-light/20">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-neon-cyan/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-white">{plan.name}</div>
                        <div className="text-xs text-cyber-light">{plan.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-neon-cyan font-bold">
                        {formatCurrency(plan.price, plan.currency)}
                      </div>
                      <div className="text-xs text-cyber-light">
                        {plan.currency === 'EUR' && `≈ ${formatCurrency(plan.price * EXCHANGE_RATES.EUR_TO_USD, 'USD')}`}
                        {plan.currency === 'USD' && `≈ ${formatCurrency(plan.price / EXCHANGE_RATES.EUR_TO_USD, 'EUR')}`}
                        {plan.currency === 'ARS' && `≈ ${formatCurrency(plan.price / EXCHANGE_RATES.EUR_TO_ARS, 'EUR')}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-white">
                        {plan.consultas_incluidas === 0 ? '♾️ Ilimitadas' : `${plan.consultas_incluidas} /mes`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {plan.is_active ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-900/30 text-green-400 border border-green-500/30">
                          <CheckCircleIcon className="w-4 h-4" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-900/30 text-red-400 border border-red-500/30">
                          <XCircleIcon className="w-4 h-4" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(plan)}
                          className="p-2 text-neon-blue hover:bg-neon-blue/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && plans.length === 0 && (
        <div className="text-center py-12 bg-cyber-dark rounded-xl border border-cyber-light">
          <SparklesIcon className="w-16 h-16 text-cyber-light mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No hay planes creados</h3>
          <p className="text-cyber-light mb-6">Crea tu primer plan de suscripción Netflix Dental</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 bg-neon-cyan hover:bg-neon-cyan/80 text-cyber-black px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Crear Primer Plan
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <PlanFormModal
          plan={editingPlan}
          clinicId={clinicId}
          onClose={() => {
            setShowModal(false);
            setEditingPlan(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingPlan(null);
            loadPlans();
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// FORM MODAL COMPONENT
// ============================================================================

interface PlanFormModalProps {
  plan: SubscriptionPlan | null;
  clinicId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PlanFormModal: React.FC<PlanFormModalProps> = ({ plan, clinicId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    name: plan?.name || '',
    description: plan?.description || '',
    price: plan?.price || 29.99,
    currency: plan?.currency || 'EUR',
    consultas_incluidas: plan?.consultas_incluidas || 0,
    is_active: plan?.is_active ?? true,
    features: plan?.features || [],
  });

  const [loading, setLoading] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (plan) {
        // Update existing plan
        await apolloClient.mutate({
          mutation: UPDATE_SUBSCRIPTION_PLAN,
          variables: {
            id: plan.id,
            input: formData,
          },
        });
        alert('Plan actualizado exitosamente');
      } else {
        // Create new plan
        await apolloClient.mutate({
          mutation: CREATE_SUBSCRIPTION_PLAN,
          variables: {
            input: {
              ...formData,
              clinic_id: clinicId,
            },
          },
        });
        alert('Plan creado exitosamente');
      }

      onSuccess();
    } catch (err) {
      console.error('❌ Error saving plan:', err);
      alert('Error al guardar plan: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const equivalents = getCurrencyEquivalents(formData.price, formData.currency);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-cyber-dark rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-neon-cyan shadow-neon-cyan">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-neon-cyan to-neon-blue p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold text-cyber-black">
            {plan ? '✏️ Editar Plan' : '➕ Crear Plan Nuevo'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-white font-semibold mb-2">Nombre del Plan *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Dental Basic"
              className="w-full bg-cyber-black border border-neon-cyan/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-cyan"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-semibold mb-2">Descripción *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Essential preventive care for healthy smiles"
              rows={3}
              className="w-full bg-cyber-black border border-neon-cyan/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-cyan"
            />
          </div>

          {/* Price + Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">Precio Mensual *</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full bg-cyber-black border border-neon-cyan/30 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-neon-cyan"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Moneda *</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'EUR' | 'USD' | 'ARS' })}
                className="w-full bg-cyber-black border border-neon-cyan/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-cyan"
              >
                <option value="EUR">EUR (€) - Europa</option>
                <option value="USD">USD ($) - Estados Unidos</option>
                <option value="ARS">ARS ($) - Argentina</option>
              </select>
            </div>
          </div>

          {/* Currency Equivalents */}
          <div className="bg-neon-blue/10 border border-neon-blue/30 rounded-lg p-4">
            <div className="text-sm text-neon-blue font-semibold mb-2">💱 Equivalencias Aproximadas:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-cyber-light">
              {formData.currency !== 'EUR' && <div>EUR: {formatCurrency(equivalents.EUR || 0, 'EUR')}</div>}
              {formData.currency !== 'USD' && <div>USD: {formatCurrency(equivalents.USD || 0, 'USD')}</div>}
              {formData.currency !== 'ARS' && <div>ARS: {formatCurrency(equivalents.ARS || 0, 'ARS')}</div>}
            </div>
          </div>

          {/* Consultas Incluidas */}
          <div>
            <label className="block text-white font-semibold mb-2">Consultas Incluidas por Mes</label>
            <input
              type="number"
              min="0"
              value={formData.consultas_incluidas}
              onChange={(e) => setFormData({ ...formData, consultas_incluidas: parseInt(e.target.value) })}
              className="w-full bg-cyber-black border border-neon-cyan/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-cyan"
            />
            <p className="text-xs text-cyber-light mt-1">💡 Usa 0 para consultas ilimitadas</p>
          </div>

          {/* Features */}
          <div>
            <label className="block text-white font-semibold mb-2">Características Incluidas</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                placeholder="Ej: Preventive Care (limpiezas, revisiones)"
                className="flex-1 bg-cyber-black border border-neon-cyan/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-cyan"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-neon-blue hover:bg-neon-blue/80 text-white rounded-lg font-semibold transition-colors"
              >
                Agregar
              </button>
            </div>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between bg-cyber-black border border-neon-cyan/20 rounded-lg px-4 py-2">
                  <span className="text-white">✓ {feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 text-neon-cyan bg-cyber-black border-neon-cyan/30 rounded focus:ring-neon-cyan"
            />
            <label htmlFor="is_active" className="text-white font-semibold">
              Plan Activo (visible para pacientes)
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-cyber-light/20">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-cyber-light hover:bg-cyber-light/80 text-cyber-black rounded-lg font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-neon-cyan hover:bg-neon-cyan/80 text-cyber-black rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (plan ? 'Actualizar Plan' : 'Crear Plan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionPlanManagerV3;
