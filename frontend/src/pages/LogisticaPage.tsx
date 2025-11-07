import React, { useState } from 'react';
import { CubeIcon, BuildingOfficeIcon, TruckIcon, CheckCircleIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { DentalMaterialManagerV3 } from '../components/Inventory/DentalMaterialManagerV3';

// import EquipmentTest from '../components/Resources/EquipmentTest'; // REMOVED: EquipmentTest import
import { AutoOrderManagerV3 } from '../components/Inventory/AutoOrderManagerV3';
import { EquipmentManagerV3 } from '../components/Inventory/EquipmentManagerV3';
// Removed unused types TreatmentRoom, DentalEquipment
// Removed unused types AutoOrderRule, AutoOrderExecution and logger

const LogisticaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'resources' | 'auto-orders'>('inventory');
  const [showAutoOrderModal, setShowAutoOrderModal] = useState(false);

  // Removed unused handlers to reduce warnings

  const tabs = [
    {
      id: 'inventory' as const,
      name: 'Inventario',
      description: 'Gestión de Materiales Dentales',
      icon: CubeIcon,
      color: 'purple',
      component: (
        <DentalMaterialManagerV3 />
      )
    },
    {
      id: 'resources' as const,
      name: 'Recursos',
      description: 'Salas y Equipamiento',
      icon: BuildingOfficeIcon,
      color: 'blue',
      component: (
        <div className="space-y-6">
          <EquipmentManagerV3 />
          {/* REMOVED: Debug Tools section with EquipmentTest */}
        </div>
      )
    },
    {
      id: 'auto-orders' as const,
      name: '🤖 Auto-Orders Punk',
      description: 'Sistema Cuántico de Pedidos Automáticos',
      icon: CpuChipIcon,
      color: 'cyberpunk',
      component: (
        <div>
          <button
            onClick={() => setShowAutoOrderModal(true)}
            className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-cyan-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-cyan-500/25"
          >
            🤖 Abrir Gestión de Auto-Orders
          </button>
          <AutoOrderManagerV3
            isOpen={showAutoOrderModal}
            onClose={() => setShowAutoOrderModal(false)}
          />
        </div>
      )
    }
  ];

  const getTabColorClasses = (color: string, isActive: boolean) => {
    switch (color) {
      case 'purple':
        return isActive
          ? 'bg-purple-600 text-white border-purple-600'
          : 'bg-white text-purple-600 border-purple-300 hover:bg-purple-50';
      case 'blue':
        return isActive
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50';
      case 'cyberpunk':
        return isActive
          ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white border-cyan-600 shadow-lg shadow-cyan-500/25'
          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-cyan-600 border-cyan-300 hover:from-cyan-50 hover:to-purple-50';
      default:
        return isActive
          ? 'bg-gray-600 text-white border-gray-600'
          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Santuario de Logística */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <TruckIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">🏭 Santuario de Logística</h1>
            <p className="text-purple-100 mt-1">Centro de Operaciones Back-Office</p>
          </div>
        </div>
      </div>

      {/* Sistema de Pestañas */}
      <div className="bg-white rounded-lg shadow-soft">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    getTabColorClasses(tab.color, isActive)
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-left">
                    <div>{tab.name}</div>
                    <div className="text-xs opacity-75">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenido de la Pestaña Activa */}
      <div className="space-y-6">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>

      {/* Footer con Información del Sistema */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2">🏭 Santuario de Logística - NIVEL 2</h3>
            <p className="text-purple-100 mb-4">
              Centro de operaciones back-office con gestión integral de inventario y recursos
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4" />
                <span>Inventario Dental</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4" />
                <span>Gestión de Recursos</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4" />
                <span>🤖 Auto-Orders Cuánticos</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4" />
                <span>Mantenimiento</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold mb-1">€90/mes</div>
            <div className="text-sm text-purple-100">vs $800-1200/mes competencia</div>
            <div className="text-lg font-semibold mt-2">98% más barato</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticaPage;
