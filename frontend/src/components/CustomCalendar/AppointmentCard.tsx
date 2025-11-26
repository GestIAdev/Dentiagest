/**
 * �‍☠️ IAnarkalendar © GestIA Dev + PunkClaude 2025
 * 
 * Purpose: Draggable appointment component for calendar grid
 * Created: August 9, 2025 - Phase 2.5 - DRAG & DROP MAGIC
 * Status: PRODUCTION READY
 * 
 * Key Features:
 * - Native HTML5 drag & drop (NO EXTERNAL LIBS!)
 * - Smart visual feedback during drag
 * - Appointment type color coding (Consulta, Limpieza, Tratamiento, Emergencia)
 * - Mobile-friendly touch support
 * - PlatformGest Pattern: Universal appointment entity
 * 
 * PlatformGest Extraction Notes:
 * - This pattern applies to: VetGest (appointments), MechaGest (repair slots), RestaurantGest (reservations)
 * - Universal appointment properties: id, client, time, duration, type, status
 * - Sector-specific: dental procedures vs vet treatments vs auto repairs
 * 
 * Dependencies:
 * - date-fns: Time calculations
 * 
 * @author Punk Claude & Platform Gestia Developer
 */

import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
// import { useMicroInteractions, useResponsiveAnimations } from './hooks';
import './styles/animations.css';

export interface AppointmentData {
  id?: string;
  patientName: string;
  patientId: string;
  patientPhone?: string;
  patientEmail?: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  type: 'consultation' | 'cleaning' | 'treatment' | 'emergency' | 'filling' | 'extraction' | 'checkup' | 'orthodontics' | 'surgery';
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  priority: 'normal' | 'high' | 'urgent';
  notes?: string;
  phone?: string;
  doctorName?: string;
  treatmentCode?: string;
  estimatedCost?: number;
  
  // 💀 @VERITAS QUANTUM VERIFICATION - PHASE 5
  _veritas?: {
    verified: boolean;
    confidence: number;
    level: string;
    certificate?: string;
  };
}

interface AppointmentCardProps {
  appointment: AppointmentData;
  onDragStart?: (appointment: AppointmentData) => void;
  onDragEnd?: () => void;
  onClick?: (appointment: AppointmentData) => void;
  onQuickAction?: (action: 'edit' | 'delete' | 'complete' | 'call', appointment: AppointmentData) => void;
  isDragging?: boolean;
  isCompact?: boolean;
  showQuickActions?: boolean;
  showDuration?: boolean; // 🎯 CONTROL ESPECÍFICO PARA DURACIÓN
  showNotes?: boolean; // 🎯 CONTROL ESPECÍFICO PARA NOTAS (false en vista diaria)
  className?: string;
}

// 🎨 DENTIAGEST COLOR SYSTEM (Following style guide)
const APPOINTMENT_COLORS = {
  // 🟢 CONSULTAS Y REVISIONES - Cyberpunk
  consultation: {
    bg: 'bg-slate-800/80',
    border: 'border-l-4 border-l-emerald-400 border-slate-700',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
    shadow: 'shadow-lg shadow-emerald-500/20'
  },
  checkup: {
    bg: 'bg-slate-800/80',
    border: 'border-l-4 border-l-green-400 border-slate-700',
    text: 'text-green-300',
    dot: 'bg-green-400',
    shadow: 'shadow-lg shadow-green-500/20'
  },
  
  // 🔵 LIMPIEZAS E HIGIENE - Cyberpunk
  cleaning: {
    bg: 'bg-slate-800/80', 
    border: 'border-l-4 border-l-cyan-400 border-slate-700',
    text: 'text-cyan-300',
    dot: 'bg-cyan-400',
    shadow: 'shadow-lg shadow-cyan-500/20'
  },
  
  // 🟠 TRATAMIENTOS - Cyberpunk
  treatment: {
    bg: 'bg-slate-800/80',
    border: 'border-l-4 border-l-amber-400 border-slate-700', 
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    shadow: 'shadow-lg shadow-amber-500/20'
  },
  filling: {
    bg: 'bg-slate-800/80',
    border: 'border-l-4 border-l-purple-400 border-slate-700',
    text: 'text-purple-300',
    dot: 'bg-purple-400',
    shadow: 'shadow-lg shadow-purple-500/20'
  },
  orthodontics: {
    bg: 'bg-slate-800/80',
    border: 'border-l-4 border-l-yellow-400 border-slate-700',
    text: 'text-yellow-300',
    dot: 'bg-yellow-400',
    shadow: 'shadow-lg shadow-yellow-500/20'
  },
  
  // 🔴 EMERGENCIAS Y CIRUGÍAS - Cyberpunk
  emergency: {
    bg: 'bg-slate-800/80',
    border: 'border-l-4 border-l-red-400 border-slate-700',
    text: 'text-red-300',
    dot: 'bg-red-400',
    shadow: 'shadow-lg shadow-red-500/20'
  },
  extraction: {
    bg: 'bg-slate-800/80',
    border: 'border-l-4 border-l-red-500 border-slate-700',
    text: 'text-red-300',
    dot: 'bg-red-500',
    shadow: 'shadow-lg shadow-red-500/25'
  },
  surgery: {
    bg: 'bg-slate-800/80',
    border: 'border-l-4 border-l-red-600 border-slate-700',
    text: 'text-red-200',
    dot: 'bg-red-600',
    shadow: 'shadow-lg shadow-red-500/30'
  }
};

// 🌐 DISPLAY LABELS - Values en inglés → Labels en español
const TYPE_LABELS = {
  // Consultas y revisiones
  consultation: 'Consulta',
  checkup: 'Revisión',
  
  // Limpiezas e higiene
  cleaning: 'Limpieza',
  
  // Tratamientos
  treatment: 'Tratamiento',
  filling: 'Empaste',
  orthodontics: 'Ortodoncia',
  
  // Emergencias y cirugías
  emergency: 'Emergencia',
  extraction: 'Extracción',
  surgery: 'Cirugía'
};

const STATUS_LABELS = {
  confirmed: 'Confirmada',
  pending: 'Pendiente', 
  cancelled: 'Cancelada',
  completed: 'Completada'
};

// 🚨 PRIORITY INDICATORS - Simple but effective
const PRIORITY_INDICATORS = {
  normal: '',
  high: '⚡',
  urgent: '🚨'
};

export function AppointmentCard({
  appointment,
  onDragStart,
  onDragEnd,
  onClick,
  onQuickAction,
  isDragging = false,
  isCompact = false,
  showQuickActions = false,
  showDuration = false, // 🎯 DEFAULT: NO MOSTRAR DURACIÓN
  showNotes = true, // 🎯 DEFAULT: SÍ MOSTRAR NOTAS (excepto en vista diaria)
  className = ''
}: AppointmentCardProps) {

  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 🎪 ANIMATION HOOKS
  // const microInteractions = useMicroInteractions();
  // const responsive = useResponsiveAnimations();
  
  // 🎨 RAUL'S DIRECT COLOR LOGIC (same as monthly view!)
  const getAppointmentColors = () => {
    const type = appointment.type?.toLowerCase() || '';
    
    // � PRIORITY OVERRIDE: Urgent priority makes ANY type red!
    if (appointment.priority === 'urgent') {
      return {
        bg: 'bg-red-100',
        border: 'border-red-300',
        text: 'text-red-800',
        dot: 'bg-red-500',
        shadow: 'shadow-red-100'
      };
    }
    
    // � AZUL - Limpiezas únicamente
    if (type.includes('limpieza') || type.includes('higiene') || type.includes('cleaning')) {
      return {
        bg: 'bg-blue-100',
        border: 'border-blue-300',
        text: 'text-blue-800',
        dot: 'bg-blue-500',
        shadow: 'shadow-blue-100'
      };
    }
    
    // 🚫 REMOVED: Emergency type check (now handled by priority)
    
    // 🟡 AMARILLO LIMÓN - TODO TRATAMIENTO
    if (type.includes('endodoncia') || type.includes('corona') || type.includes('crown') ||
        type.includes('extraccion') || type.includes('empaste') || type.includes('ortodoncia') || 
        type.includes('orthodontics') || type.includes('implante') || type.includes('implant') ||
        type.includes('cirugia') || type.includes('tratamiento') || type.includes('filling') || 
        type.includes('surgery') || type.includes('treatment') || type.includes('brackets') || 
        type.includes('root_canal') || type.includes('extraction')) {
      return {
        bg: 'bg-yellow-100',
        border: 'border-yellow-300',
        text: 'text-yellow-800',
        dot: 'bg-yellow-500',
        shadow: 'shadow-yellow-100'
      };
    }
    
    // 🟢 VERDE - TODO LO DEMÁS (consultas, seguimientos, revisiones)
    return {
      bg: 'bg-green-100',
      border: 'border-green-300',
      text: 'text-green-800',
      dot: 'bg-green-500',
      shadow: 'shadow-green-100'
    };
  };
  
  const colors = getAppointmentColors();
  const priorityIcon = PRIORITY_INDICATORS[appointment.priority || 'normal'];
  
  const handleDragStart = (e: React.DragEvent) => {
    // Store appointment data for drop handler
    e.dataTransfer.setData('application/json', JSON.stringify(appointment));
    e.dataTransfer.effectAllowed = 'move';
    
    // 🎪 CYBERPUNK DRAG GHOST
    if (cardRef.current) {
      cardRef.current.classList.add('dragging');
      // Cyberpunk elevation
      cardRef.current.style.transform = 'scale(1.05)';
      cardRef.current.style.zIndex = '1000';
      cardRef.current.style.filter = 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))';
    }
    
    // 🎨 Cyberpunk drag image - semitransparente con borde punteado neón
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.7';
    dragImage.style.border = '2px dashed #a855f7'; // purple-500 neón
    dragImage.style.backgroundColor = 'rgba(30, 41, 59, 0.9)'; // slate-800/90
    dragImage.style.filter = 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.5))';
    dragImage.style.borderRadius = '8px';
    e.dataTransfer.setDragImage(dragImage, 10, 10);
    
    if (onDragStart) {
      onDragStart(appointment);
    }
  };

  const handleDragEnd = () => {
    // 🎬 SMOOTH LANDING ANIMATION
    if (cardRef.current) {
      cardRef.current.classList.remove('dragging');
      
      // Reset transforms with smooth transition
      cardRef.current.style.transform = '';
      cardRef.current.style.zIndex = '';
      cardRef.current.style.filter = '';
      
      // Brief success pulse
      cardRef.current.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.transition = '';
        }
      }, 300);
    }
    
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // ⚡ Trigger click animation
    if (cardRef.current) {
      // microInteractions.triggerClick(cardRef.current, 'success');
      cardRef.current.classList.add('micro-success');
      setTimeout(() => {
        cardRef.current?.classList.remove('micro-success');
      }, 200);
    }
    
    if (onClick) {
      onClick(appointment);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // microInteractions.triggerHover(appointment.id);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // microInteractions.clearHover();
  };

  const handleQuickAction = (e: React.MouseEvent, action: 'edit' | 'delete' | 'complete' | 'call') => {
    e.stopPropagation();
    e.preventDefault();
    if (onQuickAction) {
      onQuickAction(action, appointment);
    }
  };

  const getPatientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  return (
    <div
      ref={cardRef}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        appointment-card cursor-pointer relative
        ${colors.bg} ${colors.border} ${colors.text}
        border-l-4 rounded-md shadow-sm
        transition-all duration-300 ease-out
        hover:shadow-lg hover:scale-105 hover:-translate-y-1
        ${isDragging ? 'opacity-60 z-50' : ''}
        ${isHovered ? `shadow-md ${colors.shadow}` : ''}
        ${isCompact ? 'p-1' : 'p-2'}
        ${className}
        transform-gpu
      `}
      title={`${appointment.patientName} - ${TYPE_LABELS[appointment.type] || appointment.type} (${formatDuration(appointment.duration)})`}
    >
      {/* 🚨 PRIORITY INDICATOR - FLOATING ABSOLUTE POSITION */}
      {priorityIcon && (
        <div
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-lg z-10"
          style={{
            backgroundColor: appointment.priority === 'urgent' ? '#dc2626' : 
                           appointment.priority === 'high' ? '#ea580c' : '#6b7280',
            position: 'absolute',
            zIndex: 10,
            pointerEvents: 'none'
          }}
          title={`Prioridad: ${appointment.priority}${
            // Check if this is auto-detected priority
            (appointment.notes?.toLowerCase().includes('urgente') && appointment.priority === 'high') ||
            (appointment.notes?.toLowerCase().includes('dolor') && appointment.priority === 'high') 
            ? ' 🤖 (Auto-detectada)' 
            : ' 👤 (Manual)'
          }`}
        >
          {priorityIcon}
          {/* 🤖 Auto-detection indicator */}
          {((appointment.notes?.toLowerCase().includes('urgente') && appointment.priority === 'high') ||
            (appointment.notes?.toLowerCase().includes('dolor') && appointment.priority === 'high')) && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
              🤖
            </div>
          )}
        </div>
      )}

      {/* Quick Actions (only show on hover) - PHASE 5 ENHANCED */}
      {showQuickActions && isHovered && !isDragging && (
        <div className="quick-actions absolute top-1 right-1 flex space-x-1 z-10">
          <button
            onClick={(e) => handleQuickAction(e, 'edit')}
            className="w-6 h-6 bg-white rounded-full shadow text-xs flex items-center justify-center hover:bg-blue-50 transition-colors"
            title="Editar cita"
          >
            ✏️
          </button>
          <button
            onClick={(e) => handleQuickAction(e, 'complete')}
            className="w-6 h-6 bg-white rounded-full shadow text-xs flex items-center justify-center hover:bg-green-50 transition-colors"
            title="Marcar completada"
          >
            ✓
          </button>
          <button
            onClick={(e) => handleQuickAction(e, 'call')}
            className="w-6 h-6 bg-white rounded-full shadow text-xs flex items-center justify-center hover:bg-yellow-50 transition-colors"
            title="Llamar paciente"
          >
            📞
          </button>
          <button
            onClick={(e) => handleQuickAction(e, 'delete')}
            className="w-6 h-6 bg-white rounded-full shadow text-xs flex items-center justify-center hover:bg-red-50 transition-colors"
            title="Eliminar cita"
          >
            🗑️
          </button>
        </div>
      )}

      {/* 🎯 COMPACT LAYOUT OPTIMIZATION - Patient name FIRST */}
      {isCompact ? (
        <>
          {/* COMPACT: Patient name as MAIN title */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1 flex-1 min-w-0">
              {/* Patient initials circle */}
              <div className={`w-4 h-4 rounded-full ${colors.dot} text-white flex items-center justify-center font-bold text-xs`}>
                {getPatientInitials(appointment.patientName)}
              </div>
              {/* Patient name - PROMINENT */}
              <span className="font-bold text-sm truncate text-gray-800">
                {appointment.patientName.split(' ')[0]} {/* First name only for space */}
              </span>
            </div>
            {/* Time in corner */}
            <span className="text-xs text-gray-500 ml-1">
              {format(appointment.startTime, 'HH:mm')}
            </span>
          </div>

          {/* COMPACT: Type + Status row */}
          <div className="flex items-center justify-between">
            {/* Type with icon */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
              <span className={`text-xs font-medium uppercase tracking-wide ${colors.text}`}>
                {TYPE_LABELS[appointment.type] || appointment.type}
              </span>
            </div>
            
            {/* Status badge - VISIBLE */}
            <div className={`
              text-xs px-1.5 py-0.5 rounded-full font-bold
              ${appointment.status === 'confirmed' ? 'bg-green-500 text-white' : ''}
              ${appointment.status === 'pending' ? 'bg-yellow-500 text-white' : ''}
              ${appointment.status === 'cancelled' ? 'bg-red-500 text-white' : ''}
              ${appointment.status === 'completed' ? 'bg-gray-500 text-white' : ''}
            `}>
              {appointment.status === 'confirmed' ? '✓' : 
               appointment.status === 'pending' ? '⏳' : 
               appointment.status === 'cancelled' ? '✗' : 
               appointment.status === 'completed' ? '✓' : '?'}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* FULL LAYOUT - Keep existing */}
          {/* Appointment header */}
          <div className={`flex items-center justify-between ${isCompact ? 'mb-0' : 'mb-1'}`}>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
              <span className={`${isCompact ? 'text-xs' : 'text-xs'} font-medium uppercase tracking-wide`}>
                {TYPE_LABELS[appointment.type] || appointment.type}
              </span>
            </div>
            {!isCompact && (
              <span className="text-xs text-gray-500">
                {formatDuration(appointment.duration)}
              </span>
            )}
          </div>

          {/* Patient info section */}
          <div className={`flex items-center space-x-2 ${isCompact ? 'mb-0' : 'mb-1'}`}>
            {/* Patient avatar/initials */}
            <div className={`
              ${isCompact ? 'w-4 h-4 text-xs' : 'w-6 h-6 text-xs'} 
              rounded-full ${colors.dot} text-white 
              flex items-center justify-center font-bold
            `}>
              {getPatientInitials(appointment.patientName)}
            </div>
            
            {/* Patient name */}
            <div className="flex-1 min-w-0">
              <div className={`font-semibold ${isCompact ? 'text-xs' : 'text-sm'} truncate`}>
                {appointment.patientName}
              </div>
            </div>
          </div>

          {/* Time range */}
          {!isCompact && (
            <div className="text-xs text-gray-600 mb-1 flex items-center justify-between">
              <span>{format(appointment.startTime, 'HH:mm')} - {format(appointment.endTime, 'HH:mm')}</span>
              {appointment.doctorName && (
                <span className="text-xs text-gray-500 truncate ml-1">
                  Dr. {appointment.doctorName}
                </span>
              )}
            </div>
          )}

          {/* Status and actions row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {/* Status Badge */}
              <div className={`
                ${isCompact ? 'text-xs px-1 py-0.5' : 'text-xs px-2 py-1'} rounded-full font-medium
                ${appointment.status === 'confirmed' ? 'bg-green-200 text-green-800' : ''}
                ${appointment.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : ''}
                ${appointment.status === 'cancelled' ? 'bg-red-200 text-red-800' : ''}
                ${appointment.status === 'completed' ? 'bg-gray-200 text-gray-800' : ''}
              `}>
                {STATUS_LABELS[appointment.status] || appointment.status}
              </div>
              
              {/* 💀 @VERITAS TRUST BADGE - PHASE 5 */}
              {appointment._veritas?.verified && appointment._veritas.confidence >= 0.7 && (
                <div 
                  className={`
                    text-xs px-1.5 py-0.5 rounded-full font-bold flex items-center space-x-0.5
                    ${appointment._veritas.confidence >= 0.9 ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' : 
                      appointment._veritas.confidence >= 0.7 ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 
                      'bg-gray-100 text-gray-600'}
                  `}
                  title={`@veritas verified: ${(appointment._veritas.confidence * 100).toFixed(1)}% confidence`}
                >
                  <span>✓</span>
                  {!isCompact && <span>Verificado</span>}
                </div>
              )}
            </div>
            
            {/* Compact time display */}
            {isCompact && (
              <div className="text-xs text-gray-500">
                {format(appointment.startTime, 'HH:mm')}
              </div>
            )}
            
            {/* Cost (only if not compact and has valid cost) */}
            {!isCompact && appointment.estimatedCost != null && 
             appointment.estimatedCost > 0 && (
              <span className="text-xs text-green-600 font-medium">
                €{appointment.estimatedCost}
              </span>
            )}
          </div>
        </>
      )}

      {/* Treatment code (if any and not empty) */}
      {appointment.treatmentCode && appointment.treatmentCode.trim() !== '' && appointment.treatmentCode !== '0' && (
        <div className="text-xs text-gray-500 mt-1 font-mono">
          #{appointment.treatmentCode}
        </div>
      )}

      {/* Notes preview (if any and allowed) */}
      {appointment.notes && !isCompact && showNotes && (
        <div className="text-xs text-gray-500 mt-1 truncate">
          💬 {appointment.notes}
        </div>
      )}

      {/* Patient phone (very useful for dentists!) */}
      {appointment.phone && !isCompact && (
        <div className="text-xs text-blue-600 mt-1 flex items-center space-x-1">
          <span>📞</span>
          <span className="font-medium">{appointment.phone}</span>
        </div>
      )}



      {/* Tooltip for detailed info */}
      {showTooltip && (
        <div className="tooltip absolute bottom-full left-0 mb-2 p-2 bg-black text-white text-xs rounded shadow-lg z-20 w-48">
          <div><strong>{appointment.patientName}</strong></div>
          <div>{TYPE_LABELS[appointment.type] || appointment.type} - {formatDuration(appointment.duration)}</div>
          <div>{format(appointment.startTime, 'HH:mm')} - {format(appointment.endTime, 'HH:mm')}</div>
          {appointment.patientPhone && <div>📞 {appointment.patientPhone}</div>}
          {appointment.notes && <div>💬 {appointment.notes}</div>}
        </div>
      )}
    </div>
  );
}

export default AppointmentCard;

