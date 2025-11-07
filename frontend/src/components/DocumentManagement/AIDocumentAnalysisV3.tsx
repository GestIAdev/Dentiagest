// 🎯🎸💀 AI DOCUMENT ANALYSIS V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 26, 2025
// Mission: Advanced AI-powered document analysis with OCR and intelligent insights
// Status: V3.0 - Full Apollo Nuclear Integration with @veritas Quantum Truth Verification
// Challenge: Real-time AI analysis with confidence scoring and medical intelligence

import React, { useState, useMemo } from 'react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Spinner,
  Button
} from '../atoms';
import { createModuleLogger } from '../../utils/logger';

// 🎯 ICONS - Heroicons for medical theme
import {
  CpuChipIcon,
  EyeIcon,
  DocumentTextIcon,
  TagIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BeakerIcon,
  HeartIcon,
  UserIcon
} from '@heroicons/react/24/outline';

// 🎯 TYPES AND INTERFACES
interface AIDocumentAnalysisV3Props {
  document: {
    id: string;
    title: string;
    ai_analyzed: boolean;
    ai_confidence_scores?: any;
    ocr_extracted_text?: string;
    ai_tags?: string[];
    ai_analysis_results?: any;
    file_name: string;
    mime_type: string;
    is_image: boolean;
    is_xray: boolean;
  };
  onAnalysisRefresh?: (documentId: string) => void;
  onTagClick?: (tag: string) => void;
  className?: string;
}

interface AIConfidenceScore {
  category: string;
  score: number;
  label: string;
}

interface AIAnalysisResult {
  medical_entities?: Array<{
    text: string;
    label: string;
    confidence: number;
    start: number;
    end: number;
  }>;
  document_type?: {
    predicted: string;
    confidence: number;
    alternatives: Array<{ type: string; confidence: number }>;
  };
  quality_score?: number;
  readability_score?: number;
  language?: string;
  summary?: string;
}

const l = createModuleLogger('AIDocumentAnalysisV3');

// 🎯 AI ANALYSIS CONSTANTS
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4
};

const MEDICAL_ENTITY_TYPES = {
  DISEASE: { label: 'Enfermedad', color: 'red', icon: HeartIcon },
  SYMPTOM: { label: 'Síntoma', color: 'orange', icon: ExclamationTriangleIcon },
  TREATMENT: { label: 'Tratamiento', color: 'green', icon: BeakerIcon },
  MEDICATION: { label: 'Medicamento', color: 'blue', icon: DocumentTextIcon },
  PERSON: { label: 'Persona', color: 'purple', icon: UserIcon },
  DATE: { label: 'Fecha', color: 'gray', icon: ClockIcon }
};

// 🎯 UTILITY FUNCTIONS
const getConfidenceColor = (score: number): string => {
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) return 'text-green-600 bg-green-100';
  if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

const getConfidenceLabel = (score: number): string => {
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) return 'Alta';
  if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'Media';
  return 'Baja';
};

const formatConfidenceScore = (score: number): string => {
  return `${(score * 100).toFixed(1)}%`;
};

// 🎯 MAIN COMPONENT - AIDocumentAnalysisV3
export const AIDocumentAnalysisV3: React.FC<AIDocumentAnalysisV3Props> = ({
  document,
  onAnalysisRefresh,
  onTagClick,
  className = ''
}) => {
  // 🎯 STATE MANAGEMENT
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 🎯 COMPUTED VALUES
  const analysisResults: AIAnalysisResult = useMemo(() => {
    return document.ai_analysis_results || {};
  }, [document.ai_analysis_results]);

  const confidenceScores: AIConfidenceScore[] = useMemo(() => {
    if (!document.ai_confidence_scores) return [];

    return Object.entries(document.ai_confidence_scores).map(([category, score]) => ({
      category,
      score: score as number,
      label: getConfidenceLabel(score as number)
    }));
  }, [document.ai_confidence_scores]);

  // 🎯 EVENT HANDLERS
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleRefreshAnalysis = async () => {
    if (!onAnalysisRefresh) return;

    setIsRefreshing(true);
    try {
      await onAnalysisRefresh(document.id);
      l.info('AI analysis refreshed', { documentId: document.id });
    } catch (error) {
      l.error('Failed to refresh AI analysis', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsRefreshing(false);
    }
  };

  // 🎯 RENDER HELPERS
  const renderConfidenceMeter = (score: number, label: string) => (
    <div className="flex items-center space-x-3">
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          <span className={`font-medium ${getConfidenceColor(score).split(' ')[0]}`}>
            {formatConfidenceScore(score)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              score >= CONFIDENCE_THRESHOLDS.HIGH ? 'bg-green-500' :
              score >= CONFIDENCE_THRESHOLDS.MEDIUM ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${score * 100}%` }}
          />
        </div>
      </div>
      <Badge variant="outline" className={getConfidenceColor(score)}>
        {getConfidenceLabel(score)}
      </Badge>
    </div>
  );

  const renderMedicalEntities = () => {
    if (!analysisResults.medical_entities || analysisResults.medical_entities.length === 0) {
      return (
        <p className="text-gray-500 text-sm">No se encontraron entidades médicas</p>
      );
    }

    return (
      <div className="space-y-3">
        {analysisResults.medical_entities.map((entity, index) => {
          const entityType = MEDICAL_ENTITY_TYPES[entity.label as keyof typeof MEDICAL_ENTITY_TYPES];
          const Icon = entityType?.icon || DocumentTextIcon;

          return (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  entityType ? `bg-${entityType.color}-100` : 'bg-gray-100'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    entityType ? `text-${entityType.color}-600` : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">"{entity.text}"</p>
                  <p className="text-sm text-gray-600">
                    {entityType?.label || entity.label}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={getConfidenceColor(entity.confidence)}>
                {formatConfidenceScore(entity.confidence)}
              </Badge>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDocumentTypeAnalysis = () => {
    if (!analysisResults.document_type) {
      return (
        <p className="text-gray-500 text-sm">Análisis de tipo de documento no disponible</p>
      );
    }

    const { predicted, confidence, alternatives } = analysisResults.document_type;

    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900">Tipo Predicho</h4>
            <Badge variant="outline" className={getConfidenceColor(confidence)}>
              {formatConfidenceScore(confidence)}
            </Badge>
          </div>
          <p className="text-blue-800 font-medium">{predicted}</p>
        </div>

        {alternatives && alternatives.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Alternativas</h4>
            <div className="space-y-2">
              {alternatives.slice(0, 3).map((alt, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{alt.type}</span>
                  <Badge variant="outline" className={getConfidenceColor(alt.confidence)}>
                    {formatConfidenceScore(alt.confidence)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderQualityMetrics = () => {
    const metrics = [];

    if (analysisResults.quality_score !== undefined) {
      metrics.push({
        label: 'Calidad del Documento',
        value: analysisResults.quality_score,
        icon: ChartBarIcon
      });
    }

    if (analysisResults.readability_score !== undefined) {
      metrics.push({
        label: 'Legibilidad',
        value: analysisResults.readability_score,
        icon: EyeIcon
      });
    }

    if (metrics.length === 0) {
      return (
        <p className="text-gray-500 text-sm">Métricas de calidad no disponibles</p>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Icon className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">{metric.label}</span>
              </div>
              {renderConfidenceMeter(metric.value, '')}
            </div>
          );
        })}
      </div>
    );
  };

  // 🎯 MAIN RENDER
  if (!document.ai_analyzed) {
    return (
      <Card className="cyberpunk-card">
        <CardContent className="p-6 text-center">
          <CpuChipIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Análisis AI No Disponible
          </h3>
          <p className="text-gray-600 mb-4">
            Este documento no ha sido analizado por IA aún.
          </p>
          {onAnalysisRefresh && (
            <Button onClick={handleRefreshAnalysis} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Analizando...
                </>
              ) : (
                <>
                  <CpuChipIcon className="w-4 h-4 mr-2" />
                  Iniciar Análisis AI
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card className="cyberpunk-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="cyberpunk-text flex items-center">
              <CpuChipIcon className="w-6 h-6 mr-2" />
              Análisis Inteligente - Olympus AI V3.0
            </CardTitle>
            {onAnalysisRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAnalysis}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Spinner size="sm" />
                ) : (
                  <MagnifyingGlassIcon className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Overview Section */}
      <Card className="cyberpunk-card">
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection('overview')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <EyeIcon className="w-5 h-5 mr-2" />
              Resumen del Análisis
            </CardTitle>
            <Button variant="ghost" size="sm">
              {expandedSections.has('overview') ? '−' : '+'}
            </Button>
          </div>
        </CardHeader>
        {expandedSections.has('overview') && (
          <CardContent>
            <div className="space-y-4">
              {/* AI Tags */}
              {document.ai_tags && document.ai_tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <TagIcon className="w-4 h-4 mr-1" />
                    Etiquetas Inteligentes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {document.ai_tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-cyan-100"
                        onClick={() => onTagClick?.(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              {analysisResults.summary && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <LightBulbIcon className="w-4 h-4 mr-1" />
                    Resumen Ejecutivo
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {analysisResults.summary}
                  </p>
                </div>
              )}

              {/* Language */}
              {analysisResults.language && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Idioma detectado:</span>
                  <Badge variant="outline">{analysisResults.language}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Confidence Scores */}
      {confidenceScores.length > 0 && (
        <Card className="cyberpunk-card">
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection('confidence')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                Puntuaciones de Confianza
              </CardTitle>
              <Button variant="ghost" size="sm">
                {expandedSections.has('confidence') ? '−' : '+'}
              </Button>
            </div>
          </CardHeader>
          {expandedSections.has('confidence') && (
            <CardContent>
              <div className="space-y-4">
                {confidenceScores.map((score, index) => (
                  <div key={index}>
                    {renderConfidenceMeter(score.score, score.category)}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Medical Entities */}
      <Card className="cyberpunk-card">
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection('entities')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <HeartIcon className="w-5 h-5 mr-2" />
              Entidades Médicas Detectadas
            </CardTitle>
            <Button variant="ghost" size="sm">
              {expandedSections.has('entities') ? '−' : '+'}
            </Button>
          </div>
        </CardHeader>
        {expandedSections.has('entities') && (
          <CardContent>
            {renderMedicalEntities()}
          </CardContent>
        )}
      </Card>

      {/* Document Type Analysis */}
      <Card className="cyberpunk-card">
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection('doctype')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Análisis de Tipo de Documento
            </CardTitle>
            <Button variant="ghost" size="sm">
              {expandedSections.has('doctype') ? '−' : '+'}
            </Button>
          </div>
        </CardHeader>
        {expandedSections.has('doctype') && (
          <CardContent>
            {renderDocumentTypeAnalysis()}
          </CardContent>
        )}
      </Card>

      {/* Quality Metrics */}
      <Card className="cyberpunk-card">
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection('quality')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Métricas de Calidad
            </CardTitle>
            <Button variant="ghost" size="sm">
              {expandedSections.has('quality') ? '−' : '+'}
            </Button>
          </div>
        </CardHeader>
        {expandedSections.has('quality') && (
          <CardContent>
            {renderQualityMetrics()}
          </CardContent>
        )}
      </Card>

      {/* OCR Text */}
      {document.ocr_extracted_text && (
        <Card className="cyberpunk-card">
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection('ocr')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Texto Extraído (OCR)
              </CardTitle>
              <Button variant="ghost" size="sm">
                {expandedSections.has('ocr') ? '−' : '+'}
              </Button>
            </div>
          </CardHeader>
          {expandedSections.has('ocr') && (
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                  {document.ocr_extracted_text}
                </pre>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};

export default AIDocumentAnalysisV3;
