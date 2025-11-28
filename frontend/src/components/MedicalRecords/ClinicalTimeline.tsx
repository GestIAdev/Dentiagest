/**
 * 🕐🎸💀 CLINICAL TIMELINE - STORYTELLING VISUAL
 * ===============================================
 * By PunkClaude & Radwulf - November 2025
 * 
 * La joya de la corona: Historia clínica contada cronológicamente
 * con iconos neón y cards interactivas.
 */

import React, { useMemo } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  EyeIcon,
  PencilIcon,
  DocumentTextIcon,
  BeakerIcon,
  ClipboardDocumentListIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentDuplicateIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// TYPES
// ============================================================================

interface MedicalRecord {
  id: string;
  patientId: string;
  recordType: string;
  title: string;
  content?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  createdAt: string;
  updatedAt: string;
  _veritas?: {
    verified: boolean;
    confidence: number;
    level: string;
  };
}

interface ClinicalTimelineProps {
  records: MedicalRecord[];
  filters: string[];
  onEditRecord: (record: MedicalRecord) => void;
  patientName: string;
}

// ============================================================================
// RECORD TYPE CONFIG
// ============================================================================

interface RecordTypeConfig {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
}

const RECORD_TYPE_CONFIG: Record<string, RecordTypeConfig> = {
  CONSULTATION: {
    icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
    label: 'Consulta',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/50',
    glowColor: 'shadow-cyan-500/30',
  },
  TREATMENT: {
    icon: <BeakerIcon className="h-5 w-5" />,
    label: 'Tratamiento',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    glowColor: 'shadow-purple-500/30',
  },
  PRESCRIPTION: {
    icon: <DocumentDuplicateIcon className="h-5 w-5" />,
    label: 'Receta',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/50',
    glowColor: 'shadow-amber-500/30',
  },
  NOTE: {
    icon: <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />,
    label: 'Nota',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/50',
    glowColor: 'shadow-emerald-500/30',
  },
  DOCUMENT: {
    icon: <DocumentTextIcon className="h-5 w-5" />,
    label: 'Documento',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
    glowColor: 'shadow-blue-500/30',
  },
  INVOICE: {
    icon: <CurrencyDollarIcon className="h-5 w-5" />,
    label: 'Factura',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    glowColor: 'shadow-green-500/30',
  },
  DIAGNOSIS: {
    icon: <ExclamationTriangleIcon className="h-5 w-5" />,
    label: 'Diagnóstico',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
    borderColor: 'border-rose-500/50',
    glowColor: 'shadow-rose-500/30',
  },
};

const getRecordConfig = (type: string): RecordTypeConfig => {
  return RECORD_TYPE_CONFIG[type] || {
    icon: <DocumentTextIcon className="h-5 w-5" />,
    label: type || 'Registro',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    borderColor: 'border-slate-500/50',
    glowColor: 'shadow-slate-500/30',
  };
};

// ============================================================================
// DATE UTILITIES
// ============================================================================

const formatDateTime = (date: string): { date: string; time: string } => {
  try {
    const d = new Date(date);
    return {
      date: d.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: d.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
  } catch {
    return { date: 'Fecha inválida', time: '' };
  }
};

const groupByMonth = (records: MedicalRecord[]): Map<string, MedicalRecord[]> => {
  const groups = new Map<string, MedicalRecord[]>();
  
  records.forEach((record) => {
    try {
      const date = new Date(record.createdAt);
      const monthKey = date.toLocaleDateString('es-ES', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      if (!groups.has(monthKey)) {
        groups.set(monthKey, []);
      }
      groups.get(monthKey)!.push(record);
    } catch {
      // Ignore invalid dates
    }
  });
  
  return groups;
};

// ============================================================================
// VERITAS BADGE
// ============================================================================

const VeritasBadge: React.FC<{ veritas?: MedicalRecord['_veritas'] }> = ({ veritas }) => {
  if (!veritas || !veritas.verified) {
    return null;
  }

  const confidence = Math.round(veritas.confidence * 100);
  const isHigh = confidence >= 80;

  return (
    <Badge
      variant="outline"
      className={`text-xs ${
        isHigh
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      }`}
    >
      <ShieldCheckIcon className="h-3 w-3 mr-1" />
      {confidence}% verificado
    </Badge>
  );
};

// ============================================================================
// TIMELINE ITEM COMPONENT
// ============================================================================

interface TimelineItemProps {
  record: MedicalRecord;
  onEdit: () => void;
  isLast: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ record, onEdit, isLast }) => {
  const config = getRecordConfig(record.recordType);
  const { date, time } = formatDateTime(record.createdAt);

  return (
    <div className="relative flex gap-4">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-slate-600 to-transparent" />
      )}

      {/* Icon Node */}
      <div className={`
        relative z-10 w-10 h-10 rounded-full shrink-0
        ${config.bgColor} ${config.borderColor} border-2
        flex items-center justify-center
        shadow-lg ${config.glowColor}
      `}>
        <span className={config.color}>{config.icon}</span>
      </div>

      {/* Content Card */}
      <div className={`
        flex-1 mb-6 p-4 rounded-xl
        bg-slate-800/60 backdrop-blur-sm
        border ${config.borderColor}
        hover:bg-slate-800/80 transition-all duration-200
        group cursor-pointer
      `}
        onClick={onEdit}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`${config.bgColor} ${config.color} ${config.borderColor}`}>
              {config.label}
            </Badge>
            <VeritasBadge veritas={record._veritas} />
          </div>
          <div className="text-right text-xs text-slate-400">
            <div>{date}</div>
            <div>{time}</div>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-white font-semibold mb-2 group-hover:text-cyan-300 transition-colors">
          {record.title}
        </h4>

        {/* Content Preview */}
        {record.content && (
          <p className="text-sm text-slate-400 line-clamp-2 mb-3">
            {record.content}
          </p>
        )}

        {/* Diagnosis/Treatment Pills */}
        <div className="flex flex-wrap gap-2">
          {record.diagnosis && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-500/10 text-rose-300 text-xs">
              🔬 {record.diagnosis.substring(0, 50)}{record.diagnosis.length > 50 ? '...' : ''}
            </span>
          )}
          {record.treatment && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/10 text-purple-300 text-xs">
              💊 {record.treatment.substring(0, 50)}{record.treatment.length > 50 ? '...' : ''}
            </span>
          )}
          {record.medications && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 text-amber-300 text-xs">
              💉 {record.medications.substring(0, 40)}{record.medications.length > 40 ? '...' : ''}
            </span>
          )}
        </div>

        {/* Actions (visible on hover) */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-slate-400 hover:text-cyan-400"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            Ver Detalle
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-slate-400 hover:text-purple-400"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ClinicalTimeline: React.FC<ClinicalTimelineProps> = ({
  records,
  filters,
  onEditRecord,
  patientName,
}) => {
  // Filter records
  const filteredRecords = useMemo(() => {
    let result = [...records];
    
    // Apply type filters
    if (filters.length > 0) {
      result = result.filter((r) => filters.includes(r.recordType));
    }
    
    // Sort by date descending (newest first)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return result;
  }, [records, filters]);

  // Group by month
  const groupedRecords = useMemo(() => {
    return groupByMonth(filteredRecords);
  }, [filteredRecords]);

  // ========================================================================
  // RENDER
  // ========================================================================

  if (filteredRecords.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
            <ClipboardDocumentListIcon className="h-10 w-10 text-cyan-400/50" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {filters.length > 0 ? 'Sin Resultados' : 'Historial Vacío'}
          </h3>
          <p className="text-slate-400">
            {filters.length > 0
              ? 'No hay registros que coincidan con los filtros seleccionados.'
              : `${patientName} aún no tiene registros médicos.`}
          </p>
          {filters.length > 0 && (
            <p className="text-sm text-slate-500 mt-2">
              Intenta quitar algunos filtros para ver más resultados.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Stats Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">
            📊 {filteredRecords.length} registro{filteredRecords.length !== 1 ? 's' : ''}
          </span>
          {filters.length > 0 && (
            <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              {filters.length} filtro{filters.length !== 1 ? 's' : ''} activo{filters.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <span className="text-xs text-slate-500">
          Ordenado por fecha (más reciente primero)
        </span>
      </div>

      {/* Timeline by Month */}
      {Array.from(groupedRecords.entries()).map(([month, monthRecords]) => (
        <div key={month} className="mb-8">
          {/* Month Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-3">
              📅 {month}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
          </div>

          {/* Month Records */}
          <div className="ml-2">
            {monthRecords.map((record, index) => (
              <TimelineItem
                key={record.id}
                record={record}
                onEdit={() => onEditRecord(record)}
                isLast={index === monthRecords.length - 1}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClinicalTimeline;
