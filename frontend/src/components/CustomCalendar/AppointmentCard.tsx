/**
 * 🏥 DENTIAGEST APPOINTMENT CARD - PHASE 2.5
 * 
 * Purpose: Draggable appointment component for calendar grid
 * Created: August 9, 2025 - Phase 2.5 - DRAG & DROP MAGIC
 * Status: IN DEVELOPMENT
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
  id: string;
  patientName: string;
  patientId: string;
  patientPhone?: string;
  patientEmail?: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  type: 'consultation' | 'cleaning' | 'treatment' | 'emergency';
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  priority: 'normal' | 'high' | 'urgent';
  notes?: string;
  phone?: string;
  doctorName?: string;
  treatmentCode?: string;
  estimatedCost?: number;
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
  className?: string;
}

// 🎨 DENTIAGEST COLOR SYSTEM (Following style guide)
const APPOINTMENT_COLORS = {
  consultation: {
    bg: 'bg-green-100',
    border: 'border-green-300',
    text: 'text-green-800',
    dot: 'bg-green-500',
    shadow: 'shadow-green-100'
  },
  cleaning: {
    bg: 'bg-blue-100', 
    border: 'border-blue-300',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
    shadow: 'shadow-blue-100'
  },
  treatment: {
    bg: 'bg-orange-100',
    border: 'border-orange-300', 
    text: 'text-orange-800',
    dot: 'bg-orange-500',
    shadow: 'shadow-orange-100'
  },
  emergency: {
    bg: 'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-800',
    dot: 'bg-red-500',
    shadow: 'shadow-red-100'
  }
};

// 🌐 DISPLAY LABELS - Values en inglés → Labels en español
const TYPE_LABELS = {
  consultation: 'Consulta',
  cleaning: 'Limpieza',
  treatment: 'Tratamiento',
  emergency: 'Emergencia'
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
  className = ''
}: AppointmentCardProps) {

  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 🎪 ANIMATION HOOKS
  // const microInteractions = useMicroInteractions();
  // const responsive = useResponsiveAnimations();
  
  const colors = APPOINTMENT_COLORS[appointment.type];
  const priorityIcon = PRIORITY_INDICATORS[appointment.priority || 'normal'];  const handleDragStart = (e: React.DragEvent) => {
    // Store appointment data for drop handler
    e.dataTransfer.setData('application/json', JSON.stringify(appointment));
    e.dataTransfer.effectAllowed = 'move';
    
    // ⚡ Trigger drag animation
    if (cardRef.current) {
      cardRef.current.classList.add('dragging');
    }
    
    // Create drag image (optional - for better UX)
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.opacity = '0.8';
    e.dataTransfer.setDragImage(dragImage, 10, 10);
    
    if (onDragStart) {
      onDragStart(appointment);
    }
  };

  const handleDragEnd = () => {
    // ⚡ Remove drag animation
    if (cardRef.current) {
      cardRef.current.classList.remove('dragging');
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
      draggable={false}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        appointment-card cursor-pointer transition-all duration-200 relative
        ${colors.bg} ${colors.border} ${colors.text}
        border-l-4 rounded-md shadow-sm
        ${isDragging ? 'opacity-50 transform rotate-3 z-50' : ''}
        ${isHovered ? `shadow-md transform scale-102 ${colors.shadow}` : ''}
        ${isCompact ? 'p-1' : 'p-2'}
        ${className}
      `}
      title={`${appointment.patientName} - ${TYPE_LABELS[appointment.type] || appointment.type} (${formatDuration(appointment.duration)})`}
    >
      {/* 🚨 PRIORITY INDICATOR - FLOATING ABSOLUTE POSITION */}
      {priorityIcon && (
        <div
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-lg z-[200]"
          style={{
            backgroundColor: appointment.priority === 'urgent' ? '#dc2626' : 
                           appointment.priority === 'high' ? '#ea580c' : '#6b7280',
            position: 'absolute',
            zIndex: 200,
            pointerEvents: 'none'
          }}
          title={`Prioridad: ${appointment.priority}${
            // Check if this is auto-detected priority
            (appointment.type === 'emergency' && appointment.priority === 'urgent') ||
            (appointment.notes?.toLowerCase().includes('urgente') && appointment.priority === 'high') ||
            (appointment.notes?.toLowerCase().includes('dolor') && appointment.priority === 'high') 
            ? ' 🤖 (Auto-detectada)' 
            : ' 👤 (Manual)'
          }`}
        >
          {priorityIcon}
          {/* 🤖 Auto-detection indicator */}
          {((appointment.type === 'emergency' && appointment.priority === 'urgent') ||
            (appointment.notes?.toLowerCase().includes('urgente') && appointment.priority === 'high') ||
            (appointment.notes?.toLowerCase().includes('dolor') && appointment.priority === 'high')) && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
              🤖
            </div>
          )}
        </div>
      )}

      {/* Quick Actions (only show on hover) */}
      {showQuickActions && isHovered && !isDragging && (
        <div className="quick-actions absolute top-1 right-1 flex space-x-1 z-10">
          <button
            onClick={(e) => handleQuickAction(e, 'edit')}
            className="w-5 h-5 bg-white rounded-full shadow text-xs flex items-center justify-center hover:bg-gray-50"
            title="Editar cita"
          >
            ✏️
          </button>
          <button
            onClick={(e) => handleQuickAction(e, 'call')}
            className="w-5 h-5 bg-white rounded-full shadow text-xs flex items-center justify-center hover:bg-gray-50"
            title="Llamar paciente"
          >
            📞
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
            <div className={`
              ${isCompact ? 'text-xs px-1 py-0.5' : 'text-xs px-2 py-1'} rounded-full font-medium
              ${appointment.status === 'confirmed' ? 'bg-green-200 text-green-800' : ''}
              ${appointment.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : ''}
              ${appointment.status === 'cancelled' ? 'bg-red-200 text-red-800' : ''}
              ${appointment.status === 'completed' ? 'bg-gray-200 text-gray-800' : ''}
            `}>
              {STATUS_LABELS[appointment.status] || appointment.status}
            </div>
            
            {/* Compact time display */}
            {isCompact && (
              <div className="text-xs text-gray-500">
                {format(appointment.startTime, 'HH:mm')}
              </div>
            )}
            
            {/* Cost (only if not compact) */}
            {!isCompact && appointment.estimatedCost && (
              <span className="text-xs text-green-600 font-medium">
                €{appointment.estimatedCost}
              </span>
            )}
          </div>
        </>
      )}

      {/* Treatment code (if any) */}
      {appointment.treatmentCode && (
        <div className="text-xs text-gray-500 mt-1 font-mono">
          #{appointment.treatmentCode}
        </div>
      )}

      {/* Notes preview (if any) */}
      {appointment.notes && !isCompact && (
        <div className="text-xs text-gray-500 mt-1 truncate">
          💬 {appointment.notes}
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
