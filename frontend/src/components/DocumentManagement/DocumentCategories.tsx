// DOCUMENT_CATEGORIES: Role-Based Document Type Navigation
/**
 * DocumentCategories - Unified System Navigation
 * 
 * Now uses the UNIFIED SYSTEM with 16 document types:
 * ✅ Synced with backend unified categories
 * ✅ Role-based access control maintained
 * ✅ Legal compliance categorization
 * ✅ AI-ready document types
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { centralMappingService } from '../../services/mapping/CentralMappingService';
import { 
  HeartIcon,
  BuildingOfficeIcon,
  ScaleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

// 🗂️ UNIFIED CATEGORIES - Synced with backend
export enum LegalCategory {
  MEDICAL = 'medical',           // GDPR Article 9 - Special category data
  ADMINISTRATIVE = 'administrative', // Standard administrative documents
  BILLING = 'billing',           // Financial and billing records
  LEGAL = 'legal'               // Legal documents and contracts
}

// 🗂️ UNIFIED DOCUMENT TYPES - The 16 unified types
export enum UnifiedDocumentType {
  // 🏥 MEDICAL TYPES (GDPR Art. 9 protected)
  XRAY = "xray",
  PHOTO_CLINICAL = "photo_clinical",
  VOICE_NOTE = "voice_note",
  TREATMENT_PLAN = "treatment_plan",
  LAB_REPORT = "lab_report",
  PRESCRIPTION = "prescription",
  SCAN_3D = "scan_3d",
  
  // 📋 ADMINISTRATIVE TYPES
  CONSENT_FORM = "consent_form",
  INSURANCE_FORM = "insurance_form",
  DOCUMENT_GENERAL = "document_general",
  
  // 💰 BILLING TYPES
  INVOICE = "invoice",
  BUDGET = "budget",
  PAYMENT_PROOF = "payment_proof",
  
  // ⚖️ LEGAL TYPES
  REFERRAL_LETTER = "referral_letter",
  LEGAL_DOCUMENT = "legal_document"
}

// Backward compatibility alias
export const DocumentCategory = LegalCategory;

interface DocumentCategoryTab {
  id: LegalCategory;
  name: string;
  description: string;
  icon: React.ReactNode;
  requiredRoles: string[];
  color: string;
  neonColor: string;
  documentTypes: UnifiedDocumentType[]; // 🆕 Associated unified types
}

interface DocumentCategoriesProps {
  activeCategory: LegalCategory;
  onCategoryChange: (category: LegalCategory) => void;
  className?: string;
}

const CATEGORY_TABS: DocumentCategoryTab[] = [
  {
    id: LegalCategory.MEDICAL,
    name: 'Médicos',
    description: 'Historiales, radiografías, diagnósticos',
    icon: <HeartIcon className="h-5 w-5" />,
    requiredRoles: ['doctor', 'clinical_staff', 'professional'],
    color: 'red',
    neonColor: 'shadow-red-500/50',
    documentTypes: [
      UnifiedDocumentType.XRAY,
      UnifiedDocumentType.PHOTO_CLINICAL,
      UnifiedDocumentType.VOICE_NOTE,
      UnifiedDocumentType.TREATMENT_PLAN,
      UnifiedDocumentType.LAB_REPORT,
      UnifiedDocumentType.PRESCRIPTION,
      UnifiedDocumentType.SCAN_3D
    ]
  },
  {
    id: LegalCategory.ADMINISTRATIVE,
    name: 'Administrativos', 
    description: 'Formularios, certificados, reportes',
    icon: <BuildingOfficeIcon className="h-5 w-5" />,
    requiredRoles: ['doctor', 'clinical_staff', 'admin', 'receptionist', 'professional'],
    color: 'blue',
    neonColor: 'shadow-blue-500/50',
    documentTypes: [
      UnifiedDocumentType.INSURANCE_FORM,
      UnifiedDocumentType.DOCUMENT_GENERAL
    ]
  },
  {
    id: LegalCategory.LEGAL,
    name: 'Legales',
    description: 'Consentimientos, contratos, licencias',
    icon: <ScaleIcon className="h-5 w-5" />,
    requiredRoles: ['doctor', 'clinical_staff', 'admin', 'receptionist', 'professional'],
    color: 'purple',
    neonColor: 'shadow-purple-500/50',
    documentTypes: [
      UnifiedDocumentType.CONSENT_FORM,
      UnifiedDocumentType.REFERRAL_LETTER,
      UnifiedDocumentType.LEGAL_DOCUMENT
    ]
  },
  {
    id: LegalCategory.BILLING,
    name: 'Facturación',
    description: 'Facturas, pagos, presupuestos',
    icon: <CurrencyDollarIcon className="h-5 w-5" />,
    requiredRoles: ['doctor', 'clinical_staff', 'admin', 'receptionist', 'professional'],
    color: 'green',
    neonColor: 'shadow-green-500/50',
    documentTypes: [
      UnifiedDocumentType.INVOICE,
      UnifiedDocumentType.BUDGET,
      UnifiedDocumentType.PAYMENT_PROOF
    ]
  }
];

// 🗂️ UTILITY FUNCTIONS

export const getUnifiedTypesForCategory = (category: LegalCategory): UnifiedDocumentType[] => {
  const tab = CATEGORY_TABS.find(t => t.id === category);
  return tab?.documentTypes || [];
};

export const getCategoryFromUnifiedType = (type: UnifiedDocumentType): LegalCategory => {
  for (const tab of CATEGORY_TABS) {
    if (tab.documentTypes.includes(type)) {
      return tab.id;
    }
  }
  return LegalCategory.ADMINISTRATIVE; // Default fallback
};

export const DocumentCategories: React.FC<DocumentCategoriesProps> = ({
  activeCategory,
  onCategoryChange,
  className = ''
}) => {
  const { state } = useAuth();
  const userRole = state.user?.role || 'doctor';

  // 🔐 FILTER TABS BY USER PERMISSIONS
  const availableTabs = CATEGORY_TABS.filter(tab => 
    tab.requiredRoles.includes(userRole)
  );

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      {/* 🎚️ UNIFIED CATEGORY TABS */}
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
              title={`${tab.description} (${tab.documentTypes.length} tipos)`}
            >
              {/* 📋 ICON */}
              <div className={isActive ? 'text-white' : `text-${tab.color}-500`}>
                {tab.icon}
              </div>
              
              {/* 📝 NAME */}
              <span className="font-medium">{tab.name}</span>
              
              {/* 📊 TYPE COUNT */}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : `bg-${tab.color}-100 text-${tab.color}-600`
              }`}>
                {tab.documentTypes.length}
              </span>
              
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
          <span>Sistema Unificado v2.0</span>
          <span>•</span>
          <span>{Object.keys(UnifiedDocumentType).length} tipos</span>
        </div>
      </div>
      
      {/* 🔍 ACTIVE CATEGORY DETAILS */}
      {activeCategory && (
        <div className="px-4 pb-3">
          <div className="text-xs text-gray-500">
            <span className="font-medium">Tipos incluidos:</span>{' '}
            {getUnifiedTypesForCategory(activeCategory)
              .map(type => {
                // 🚀 OPERACIÓN UNIFORM - Central Mapping Service for labels
                const mappingResult = centralMappingService.getUnifiedTypeLabel(type);
                return mappingResult.success && mappingResult.result ? mappingResult.result : type;
              })
              .join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};
