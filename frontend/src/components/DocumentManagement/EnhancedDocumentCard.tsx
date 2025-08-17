// ENHANCED_DOCUMENT_CARD: IAnarkalendar-inspired Visual Cards
/**
 * EnhancedDocumentCard Component - CYBERPUNK VISUAL REVOLUTION
 * 
 * Features que harían llorar a los diseñadores corporativos:
 * ✅ IAnarkalendar-inspired visual hierarchy
 * ✅ Legal category color coding (like calendar event types)
 * ✅ AI features badges and indicators
 * ✅ Legal framework compliance visual cues
 * ✅ Smart urgency indicators
 * ✅ Smooth animations and transitions
 * ✅ Mobile-responsive professional design
 * 
 * VISUAL PHILOSOPHY:
 * - Color = Instant recognition (like IAnarkalendar)
 * - Gradients = Premium feel without corporate blandness
 * - Badges = Information density with style
 * - Animations = Purposeful, not distracting
 */

import React from 'react';
import { 
  LegalCategory, 
  UnifiedDocumentType,
  DocumentCardThemes,
  UnifiedTypeLabels,
  getAdvancedCardStyle,
  SmartTag,
  VoiceTags,
  AIAnalysisResult,
  AestheticTags,
  ProstheticTags,
  LegalRetentionPolicies 
} from '../../types/UnifiedDocumentTypes';
import { centralMappingService } from '../../services/mapping/CentralMappingService';
import {
  DocumentIcon,
  PhotoIcon,
  MicrophoneIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface MedicalDocument {
  id: string;
  patient_id: string;
  title: string;
  description?: string;
  document_type: string; // Legacy type
  unified_type?: UnifiedDocumentType; // New unified type
  category: string; // Legacy category
  legal_category?: LegalCategory; // New legal category
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

interface EnhancedDocumentCardProps {
  document: MedicalDocument;
  smartTags?: SmartTag;
  aiFeatures?: {
    voiceTags?: VoiceTags;           // 🎤 Voice dictation data
    analysisResult?: AIAnalysisResult;     // 🖼️ Image analysis result  
    aestheticSim?: AestheticTags;    // 🎨 DALL-E simulations
    prostheticData?: ProstheticTags; // 🔬 3D prosthetics
  };
  urgency?: 'urgent' | 'normal' | 'low';
  onView?: (document: MedicalDocument) => void;
  onDownload?: (document: MedicalDocument) => void;
  onDelete?: (document: MedicalDocument) => void;
  className?: string;
}

export const EnhancedDocumentCard: React.FC<EnhancedDocumentCardProps> = ({
  document,
  smartTags,
  aiFeatures,
  urgency = 'normal',
  onView,
  onDownload,
  onDelete,
  className = ''
}) => {
  
  // 🗂️ DETERMINE LEGAL CATEGORY (unified system)
  let legalCategory = document.legal_category;
  if (!legalCategory) {
    const mappingResult = centralMappingService.mapLegacyToCategory(document.category);
    legalCategory = mappingResult.success && mappingResult.result ? mappingResult.result : LegalCategory.ADMINISTRATIVE;
  }
  
  // Use centralized mapping with error handling
  let unifiedType: UnifiedDocumentType = document.unified_type || UnifiedDocumentType.DOCUMENT_GENERAL;
  if (!document.unified_type) {
    try {
      const mappingResult = centralMappingService.mapLegacyToUnified(document.document_type);
      if (mappingResult.success && mappingResult.result) {
        // Map from central service enum to local enum
        unifiedType = mappingResult.result as any;
      }
    } catch (error) {
      console.warn('EnhancedDocumentCard: Mapping failed, using fallback', error);
    }
  }
  
  // 🎨 GET THEME AND STYLING
  const theme = DocumentCardThemes[legalCategory];
  const cardStyle = getAdvancedCardStyle(legalCategory, urgency, smartTags?.ai_confidence);
  
  // 🏛️ LEGAL PROTECTION STATUS
  const retentionPolicy = LegalRetentionPolicies[legalCategory];
  const isDeletable = retentionPolicy.deletable && document.age_days > (retentionPolicy.retention_years * 365);
  
  // 🎯 FORMAT HELPERS
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const getDocumentIcon = () => {
    if (document.is_image) return <PhotoIcon className="h-5 w-5" />;
    if (document.document_type.includes('voice')) return <MicrophoneIcon className="h-5 w-5" />;
    return <DocumentIcon className="h-5 w-5" />;
  };

  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 
        hover:scale-105 hover:shadow-2xl transform cursor-pointer
        ${className}
      `}
      style={cardStyle}
    >
      {/* 🚨 URGENCY INDICATOR */}
      {urgency === 'urgent' && (
        <div className="absolute top-2 left-2 z-20">
          <div className="flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            <ExclamationTriangleIcon className="h-3 w-3" />
            <span>URGENTE</span>
          </div>
        </div>
      )}
      
      {/* 🛡️ LEGAL PROTECTION INDICATOR */}
      {!retentionPolicy.deletable && (
        <div className="absolute top-2 right-2 z-20">
          <div className="flex items-center space-x-1 bg-black bg-opacity-30 text-white px-2 py-1 rounded-full text-xs">
            <ShieldCheckIcon className="h-3 w-3" />
            <span>PROTEGIDO</span>
          </div>
        </div>
      )}

      {/* 📋 HEADER WITH CATEGORY & TYPE */}
      <div className="p-4 border-b border-white border-opacity-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{theme.icon}</span>
            <div>
              <h3 className="font-bold text-sm">{UnifiedTypeLabels[unifiedType]}</h3>
              <p className="text-xs opacity-80">{theme.description}</p>
            </div>
          </div>
          
          {/* 🤖 AI FEATURES BADGES */}
          <div className="flex space-x-1">
            {aiFeatures?.voiceTags && (
              <div className="bg-white bg-opacity-20 rounded-full p-1" title="Dictado por voz">
                <MicrophoneIcon className="h-4 w-4" />
              </div>
            )}
            
            {aiFeatures?.analysisResult && (
              <div className="bg-white bg-opacity-20 rounded-full p-1" title="Análisis IA">
                <SparklesIcon className="h-4 w-4" />
              </div>
            )}
            
            {aiFeatures?.aestheticSim && (
              <div className="bg-white bg-opacity-20 rounded-full p-1" title="Simulación estética">
                <span className="text-xs">🎨</span>
              </div>
            )}
            
            {aiFeatures?.prostheticData && (
              <div className="bg-white bg-opacity-20 rounded-full p-1" title="Diseño 3D">
                <span className="text-xs">🔬</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📄 DOCUMENT CONTENT */}
      <div className="p-4 space-y-3">
        {/* TITLE & DESCRIPTION */}
        <div>
          <h4 className="font-semibold text-sm truncate">{document.title}</h4>
          {document.description && (
            <p className="text-xs opacity-80 line-clamp-2 mt-1">{document.description}</p>
          )}
        </div>
        
        {/* META INFO */}
        <div className="flex items-center justify-between text-xs opacity-90">
          <div className="flex items-center space-x-2">
            {getDocumentIcon()}
            <span>{formatFileSize(document.file_size)}</span>
          </div>
          <span>{formatDate(document.created_at)}</span>
        </div>
        
        {/* 🎯 PATIENT INFO */}
        {document.patient && (
          <div className="text-xs opacity-80">
            <span>👤 {document.patient.first_name} {document.patient.last_name}</span>
          </div>
        )}
        
        {/* 🏷️ SMART TAGS PREVIEW */}
        {smartTags?.searchable_tags && smartTags.searchable_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {smartTags.searchable_tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index}
                className="inline-block bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {smartTags.searchable_tags.length > 2 && (
              <span className="text-xs opacity-70">
                +{smartTags.searchable_tags.length - 2} más
              </span>
            )}
          </div>
        )}
        
        {/* 🚀 AI INSIGHTS PREVIEW */}
        {aiFeatures?.analysisResult?.detected_anomalies && aiFeatures.analysisResult.detected_anomalies.length > 0 && (
          <div className="bg-white bg-opacity-20 rounded-lg p-2">
            <div className="text-xs font-semibold mb-1">⚠️ AI Detectó:</div>
            <div className="text-xs opacity-90">
              {aiFeatures.analysisResult.detected_anomalies.slice(0, 2).join(', ')}
              {aiFeatures.analysisResult.detected_anomalies.length > 2 && '...'}
            </div>
          </div>
        )}
        
        {/* 🎨 AESTHETIC SIMULATION PREVIEW */}
        {aiFeatures?.aestheticSim && (
          <div className="bg-white bg-opacity-20 rounded-lg p-2">
            <div className="flex items-center space-x-2 text-xs">
              <span>✨</span>
              <span>Simulación {aiFeatures.aestheticSim.treatment_type}</span>
              {aiFeatures.aestheticSim.patient_approval && (
                <CheckCircleIcon className="h-4 w-4 text-green-300" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🔧 ACTIONS FOOTER */}
      <div className="p-4 border-t border-white border-opacity-20">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button 
              onClick={() => onView?.(document)}
              className="flex items-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-lg text-xs font-medium transition-all"
            >
              <EyeIcon className="h-4 w-4" />
              <span>Ver</span>
            </button>
            
            <button 
              onClick={() => onDownload?.(document)}
              className="flex items-center space-x-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-lg text-xs font-medium transition-all"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Descargar</span>
            </button>
          </div>
          
          {/* 🗑️ DELETE BUTTON (Legal Protection Aware) */}
          {isDeletable && onDelete && (
            <button 
              onClick={() => onDelete(document)}
              className="flex items-center space-x-1 bg-red-500 bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-lg text-xs font-medium transition-all text-red-100"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Eliminar</span>
            </button>
          )}
          
          {!isDeletable && (
            <div className="text-xs opacity-60">
              🛡️ Protegido legalmente
            </div>
          )}
        </div>
        
        {/* 🚀 AI-SPECIFIC ACTIONS */}
        {(aiFeatures?.prostheticData?.laboratory_ready || aiFeatures?.aestheticSim) && (
          <div className="flex space-x-2 mt-2">
            {aiFeatures.prostheticData?.laboratory_ready && (
              <button className="text-xs bg-blue-500 bg-opacity-20 px-2 py-1 rounded">
                🏭 Enviar Laboratorio
              </button>
            )}
            
            {aiFeatures.aestheticSim && (
              <button className="text-xs bg-purple-500 bg-opacity-20 px-2 py-1 rounded">
                👤 Mostrar a Paciente
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* 🤖 AI CONFIDENCE INDICATOR */}
      {smartTags?.ai_confidence && smartTags.ai_confidence > 0.9 && (
        <div className="absolute bottom-2 right-2">
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            🤖 {Math.round(smartTags.ai_confidence * 100)}%
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDocumentCard;
