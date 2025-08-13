// DOCUMENT_CATEGORIES: Role-Based Document Type Navigation
/**
 * DocumentCategories - Scherzo Punk Navigation System
 * 
 * Role-based document type tabs con neon vibes:
 * ✅ Doctor/Clinical: Medical + Admin + Legal + Billing
 * ✅ Admin/Reception: Admin + Legal + Billing (NO Medical)
 * ✅ Smooth tab transitions with punk aesthetics
 * ✅ Permission-aware navigation
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  HeartIcon,
  BuildingOfficeIcon,
  ScaleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export enum DocumentCategory {
  MEDICAL = 'medical',
  ADMINISTRATIVE = 'administrative', 
  LEGAL = 'legal',
  BILLING = 'billing'
}

interface DocumentCategoryTab {
  id: DocumentCategory;
  name: string;
  description: string;
  icon: React.ReactNode;
  requiredRoles: string[];
  color: string;
  neonColor: string;
}

interface DocumentCategoriesProps {
  activeCategory: DocumentCategory;
  onCategoryChange: (category: DocumentCategory) => void;
  className?: string;
}

const CATEGORY_TABS: DocumentCategoryTab[] = [
  {
    id: DocumentCategory.MEDICAL,
    name: 'Médicos',
    description: 'Historiales, radiografías, diagnósticos',
    icon: <HeartIcon className="h-5 w-5" />,
    requiredRoles: ['doctor', 'clinical_staff', 'professional'], // ← ADDED professional
    color: 'red',
    neonColor: 'shadow-red-500/50'
  },
  {
    id: DocumentCategory.ADMINISTRATIVE,
    name: 'Administrativos', 
    description: 'Formularios, certificados, reportes',
    icon: <BuildingOfficeIcon className="h-5 w-5" />,
    requiredRoles: ['doctor', 'clinical_staff', 'admin', 'receptionist', 'professional'], // ← ADDED professional
    color: 'blue',
    neonColor: 'shadow-blue-500/50'
  },
  {
    id: DocumentCategory.LEGAL,
    name: 'Legales',
    description: 'Consentimientos, contratos, licencias',
    icon: <ScaleIcon className="h-5 w-5" />,
    requiredRoles: ['doctor', 'clinical_staff', 'admin', 'receptionist', 'professional'], // ← ADDED professional
    color: 'purple',
    neonColor: 'shadow-purple-500/50'
  },
  {
    id: DocumentCategory.BILLING,
    name: 'Facturación',
    description: 'Facturas, pagos, presupuestos',
    icon: <CurrencyDollarIcon className="h-5 w-5" />,
    requiredRoles: ['doctor', 'clinical_staff', 'admin', 'receptionist', 'professional'], // ← ADDED professional
    color: 'green',
    neonColor: 'shadow-green-500/50'
  }
];

export const DocumentCategories: React.FC<DocumentCategoriesProps> = ({
  activeCategory,
  onCategoryChange,
  className = ''
}) => {
  const { state } = useAuth();
  const userRole = state.user?.role || 'doctor'; // 🔧 DEFAULT to doctor for now

  // 🔐 FILTER TABS BY USER PERMISSIONS
  const availableTabs = CATEGORY_TABS.filter(tab => 
    tab.requiredRoles.includes(userRole)
  );

  // 🎨 GET TAB STYLE (NEON PUNK AESTHETIC)
  const getTabStyle = (tab: DocumentCategoryTab, isActive: boolean) => {
    const baseStyle = "group relative flex items-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105";
    
    if (isActive) {
      return `${baseStyle} bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg ${tab.neonColor} shadow-xl`;
    }
    
    return `${baseStyle} bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-${tab.color}-300`;
  };

  // 🌈 NEON GLOW EFFECT
  const getNeonGlow = (tab: DocumentCategoryTab, isActive: boolean) => {
    if (!isActive) return '';
    
    return (
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-${tab.color}-400 to-${tab.color}-600 opacity-20 blur-xl animate-pulse`} />
    );
  };

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      {/* 🎚️ COMPACT CATEGORY TABS - Horizontal Strip */}
      <div className="flex items-center space-x-1 p-4">
        {availableTabs.map((tab) => {
          const isActive = activeCategory === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onCategoryChange(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isActive
                  ? `bg-${tab.color}-500 text-white shadow-lg transform scale-105`
                  : `text-gray-600 hover:bg-${tab.color}-50 hover:text-${tab.color}-600`
              }`}
            >
              {/* 📋 ICON */}
              <div className={isActive ? 'text-white' : `text-${tab.color}-500`}>
                {tab.icon}
              </div>
              
              {/* 📝 NAME */}
              <span className="font-medium">{tab.name}</span>
              
              {/* ⚡ ACTIVE INDICATOR */}
              {isActive && (
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
        
        {/* 📊 INFO BADGE */}
        <div className="ml-auto flex items-center space-x-2 text-xs text-gray-500">
          <span>•</span>
          <span>{availableTabs.length} categorías</span>
        </div>
      </div>
    </div>
  );
};
