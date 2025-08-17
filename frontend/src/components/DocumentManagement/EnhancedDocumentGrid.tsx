// ENHANCED_DOCUMENT_GRID: IAnarkalendar-inspired Document Layout
/**
 * EnhancedDocumentGrid Component - VISUAL HIERARCHY REVOLUTION
 * 
 * Layout inspirado en IAnarkalendar con mejoras punk:
 * ✅ Category-based visual sections (like calendar views)
 * ✅ Masonry grid for mixed content
 * ✅ Smart filtering with visual feedback
 * ✅ Legal framework awareness
 * ✅ AI features integration
 * ✅ Mobile-responsive design
 * ✅ Smooth animations and transitions
 * 
 * LAYOUT PHILOSOPHY:
 * - Section by legal category = instant organization
 * - Visual hierarchy = category colors + card design
 * - Smart spacing = professional but not corporate
 * - Responsive = works on tablets for consultations
 */

import React, { useState, useEffect } from 'react';
import { EnhancedDocumentCard } from './EnhancedDocumentCard';
// APOLLO NUCLEAR: CentralMappingService disabled
import { 
  LegalCategory, 
  DocumentCardThemes,
  SmartCategorization 
} from '../../types/UnifiedDocumentTypes';
import {
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

interface MedicalDocument {
  id: string;
  patient_id: string;
  title: string;
  description?: string;
  document_type: string;
  category: string;
  file_name: string;
  file_size: number;
  file_size_mb: number;
  mime_type: string;
  access_level: string;
  is_confidential: boolean;
  created_at: string;
  document_date?: string;
  
  // AI Analysis
  ai_analyzed: boolean;
  ai_confidence_scores?: any;
  ocr_extracted_text?: string;
  ai_tags?: string[];
  
  // Patient info
  patient?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  
  // Computed
  age_days: number;
  is_image: boolean;
  is_xray: boolean;
  download_url: string;
  thumbnail_url?: string;
}

interface EnhancedDocumentGridProps {
  documents: MedicalDocument[];
  loading?: boolean;
  selectedCategory?: LegalCategory;
  searchTerm?: string;
  viewMode?: 'grid' | 'list';
  onDocumentView?: (document: MedicalDocument) => void;
  onDocumentDownload?: (document: MedicalDocument) => void;
  onDocumentDelete?: (document: MedicalDocument) => void;
  className?: string;
}

export const EnhancedDocumentGrid: React.FC<EnhancedDocumentGridProps> = ({
  documents,
  loading = false,
  selectedCategory,
  searchTerm = '',
  viewMode = 'grid',
  onDocumentView,
  onDocumentDownload,
  onDocumentDelete,
  className = ''
}) => {
  
  const [filteredDocuments, setFilteredDocuments] = useState<MedicalDocument[]>([]);
  const [documentsByCategory, setDocumentsByCategory] = useState<Record<LegalCategory, MedicalDocument[]>>({
    [LegalCategory.MEDICAL]: [],
    [LegalCategory.ADMINISTRATIVE]: [],
    [LegalCategory.BILLING]: [],
    [LegalCategory.LEGAL]: []
  });

  // 🔍 FILTER & CATEGORIZE DOCUMENTS
  useEffect(() => {
    let filtered = documents;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.ai_tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(doc => {
        const mappingResult = centralMappingService.mapLegacyToCategory(doc.category);
        const docCategory = mappingResult.success && mappingResult.result ? mappingResult.result : LegalCategory.ADMINISTRATIVE;
        return docCategory === selectedCategory;
      });
    }
    
    setFilteredDocuments(filtered);
    
    // Group by category for section view
    const grouped = {
      [LegalCategory.MEDICAL]: [],
      [LegalCategory.ADMINISTRATIVE]: [],
      [LegalCategory.BILLING]: [],
      [LegalCategory.LEGAL]: []
    } as Record<LegalCategory, MedicalDocument[]>;
    
    filtered.forEach(doc => {
      const mappingResult = centralMappingService.mapLegacyToCategory(doc.category);
      const category = mappingResult.success && mappingResult.result ? mappingResult.result : LegalCategory.ADMINISTRATIVE;
      grouped[category].push(doc);
    });
    
    setDocumentsByCategory(grouped);
  }, [documents, searchTerm, selectedCategory]);

  // 🎨 GET SECTION HEADER STYLE
  const getSectionHeaderStyle = (category: LegalCategory) => {
    const theme = DocumentCardThemes[category];
    return {
      background: `linear-gradient(135deg, ${theme.primary}20, ${theme.primary}10)`,
      borderLeft: `4px solid ${theme.primary}`,
      color: theme.primary
    };
  };

  // 📊 GET CATEGORY STATS
  const getCategoryStats = (category: LegalCategory) => {
    const docs = documentsByCategory[category];
    const total = docs.length;
    const withAI = docs.filter(d => d.ai_analyzed).length;
    const recent = docs.filter(d => d.age_days <= 7).length;
    
    return { total, withAI, recent };
  };

  // 🎯 RENDER CATEGORY SECTION
  const renderCategorySection = (category: LegalCategory) => {
    const docs = documentsByCategory[category];
    const theme = DocumentCardThemes[category];
    const stats = getCategoryStats(category);
    
    if (docs.length === 0) return null;
    
    return (
      <div key={category} className="mb-8">
        {/* 📋 SECTION HEADER */}
        <div 
          className="flex items-center justify-between p-4 rounded-lg mb-4"
          style={getSectionHeaderStyle(category)}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{theme.icon}</span>
            <div>
              <h2 className="text-lg font-bold">{getCategoryDisplayName(category)}</h2>
              <p className="text-sm opacity-80">{theme.description}</p>
            </div>
          </div>
          
          {/* 📊 STATS BADGES */}
          <div className="flex space-x-2 text-xs">
            <span className="bg-white bg-opacity-30 px-2 py-1 rounded-full font-medium">
              📄 {stats.total}
            </span>
            {stats.withAI > 0 && (
              <span className="bg-white bg-opacity-30 px-2 py-1 rounded-full font-medium">
                🤖 {stats.withAI}
              </span>
            )}
            {stats.recent > 0 && (
              <span className="bg-white bg-opacity-30 px-2 py-1 rounded-full font-medium">
                🆕 {stats.recent}
              </span>
            )}
          </div>
        </div>
        
        {/* 🗂️ DOCUMENTS GRID */}
        <div className={`grid gap-4 ${getGridClasses()}`}>
          {docs.map(doc => (
            <EnhancedDocumentCard
              key={doc.id}
              document={doc}
              urgency={getDocumentUrgency(doc)}
              onView={onDocumentView}
              onDownload={onDocumentDownload}
              onDelete={onDocumentDelete}
            />
          ))}
        </div>
      </div>
    );
  };

  // 🎛️ GET GRID CLASSES BASED ON VIEW MODE
  const getGridClasses = () => {
    if (viewMode === 'list') {
      return 'grid-cols-1 lg:grid-cols-2';
    }
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  // 🚨 DETERMINE DOCUMENT URGENCY
  const getDocumentUrgency = (doc: MedicalDocument): 'urgent' | 'normal' | 'low' => {
    // AI-based urgency detection
    if (doc.ai_tags?.some(tag => tag.includes('urgente') || tag.includes('emergency'))) {
      return 'urgent';
    }
    
    // Recent medical documents
    if (doc.category === 'medical' && doc.age_days <= 1) {
      return 'urgent';
    }
    
    // Old documents might need attention
    if (doc.age_days > 365) {
      return 'low';
    }
    
    return 'normal';
  };

  // 🏷️ LOADING STATE
  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  // 📭 EMPTY STATE
  if (filteredDocuments.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 mb-4">
          <DocumentIcon className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No se encontraron documentos
        </h3>
        <p className="text-gray-500">
          {searchTerm 
            ? `No hay documentos que coincidan con "${searchTerm}"`
            : selectedCategory 
              ? `No hay documentos en la categoría ${getCategoryDisplayName(selectedCategory)}`
              : 'No hay documentos disponibles'
          }
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 📊 OVERVIEW STATS */}
      {!selectedCategory && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.values(LegalCategory).map(category => {
            const stats = getCategoryStats(category);
            const theme = DocumentCardThemes[category];
            
            if (stats.total === 0) return null;
            
            return (
              <div 
                key={category}
                className="p-4 rounded-lg border-l-4 bg-gray-50"
                style={{ borderLeftColor: theme.primary }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span>{theme.icon}</span>
                  <span className="font-medium text-sm">{getCategoryDisplayName(category)}</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: theme.primary }}>
                  {stats.total}
                </div>
                <div className="text-xs text-gray-500">
                  {stats.withAI > 0 && `${stats.withAI} con IA`}
                  {stats.recent > 0 && ` • ${stats.recent} recientes`}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* 🗂️ CATEGORY SECTIONS or MIXED GRID */}
      {selectedCategory ? (
        // Single category view
        <div className={`grid gap-4 ${getGridClasses()}`}>
          {filteredDocuments.map(doc => (
            <EnhancedDocumentCard
              key={doc.id}
              document={doc}
              urgency={getDocumentUrgency(doc)}
              onView={onDocumentView}
              onDownload={onDocumentDownload}
              onDelete={onDocumentDelete}
            />
          ))}
        </div>
      ) : (
        // Multi-category sections view
        <div>
          {Object.values(LegalCategory).map(category => 
            renderCategorySection(category)
          )}
        </div>
      )}
    </div>
  );
};

// 🗺️ HELPER FUNCTIONS
const getCategoryDisplayName = (category: LegalCategory): string => {
  switch (category) {
    case LegalCategory.MEDICAL: return 'Documentos Médicos';
    case LegalCategory.ADMINISTRATIVE: return 'Documentos Administrativos';
    case LegalCategory.BILLING: return 'Facturación';
    case LegalCategory.LEGAL: return 'Documentos Legales';
    default: return 'Documentos';
  }
};

export default EnhancedDocumentGrid;
