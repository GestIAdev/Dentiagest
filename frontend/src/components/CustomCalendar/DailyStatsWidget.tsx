/**
 * 🏥 DENTIAGEST DAILY STATS WIDGET - PHASE 2.7
 * 
 * Purpose: Real-time appointment statistics and daily overview
 * Created: August 9, 2025 - Phase 2.7 - APPOINTMENT VISUALIZATION
 * Status: IN DEVELOPMENT
 * 
 * Key Features:
 * - Real-time appointment counts by status
 * - Revenue estimation for the day
 * - Appointment type distribution
 * - Quick visual indicators
 * - Responsive design
 * 
 * PlatformGest Extraction Notes:
 * - Universal daily stats pattern for all business types
 * - DentiaGest: patient counts, treatment types, revenue
 * - VetGest: animal counts, vaccination schedules, medical revenue
 * - MechaGest: vehicle counts, repair types, parts revenue
 * - RestaurantGest: reservation counts, table turnover, food revenue
 * 
 * Dependencies:
 * - AppointmentData: Type definitions
 * - getDailyStats: Utility function
 * 
 * @author Punk Claude & Platform Gestia Developer
 */

import React from 'react';
import { AppointmentData } from './AppointmentCard';
import { getDailyStats } from './utils/mockAppointments';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DailyStatsWidgetProps {
  appointments: AppointmentData[];
  selectedDate: Date;
  onStatClick?: (statType: string, value: any) => void;
  className?: string;
}

export function DailyStatsWidget({
  appointments,
  selectedDate,
  onStatClick,
  className = ''
}: DailyStatsWidgetProps) {

  const stats = getDailyStats(appointments);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getTotalRevenue = () => {
    return appointments
      .filter(apt => apt.status === 'confirmed' || apt.status === 'completed')
      .reduce((sum, apt) => sum + (apt.estimatedCost || 0), 0);
  };

  const getCompletionRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  const handleStatClick = (statType: string, value: any) => {
    if (onStatClick) {
      onStatClick(statType, value);
    }
  };

  return (
    <div className={`daily-stats-widget ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          📊 Resumen del Día
        </h3>
        <p className="text-sm text-gray-600">
          {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
        </p>
      </div>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Total appointments */}
        <div 
          className="stat-card bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => handleStatClick('total', stats.total)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">Total Citas</p>
              <p className="text-xl font-bold text-blue-800">{stats.total}</p>
            </div>
            <div className="text-2xl">📅</div>
          </div>
        </div>

        {/* Confirmed appointments */}
        <div 
          className="stat-card bg-green-50 border border-green-200 rounded-lg p-3 cursor-pointer hover:bg-green-100 transition-colors"
          onClick={() => handleStatClick('confirmed', stats.confirmed)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">Confirmadas</p>
              <p className="text-xl font-bold text-green-800">{stats.confirmed}</p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>

        {/* Pending appointments */}
        <div 
          className="stat-card bg-yellow-50 border border-yellow-200 rounded-lg p-3 cursor-pointer hover:bg-yellow-100 transition-colors"
          onClick={() => handleStatClick('pending', stats.pending)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600 font-medium">Pendientes</p>
              <p className="text-xl font-bold text-yellow-800">{stats.pending}</p>
            </div>
            <div className="text-2xl">⏳</div>
          </div>
        </div>

        {/* Daily revenue */}
        <div 
          className="stat-card bg-purple-50 border border-purple-200 rounded-lg p-3 cursor-pointer hover:bg-purple-100 transition-colors"
          onClick={() => handleStatClick('revenue', getTotalRevenue())}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium">Ingresos</p>
              <p className="text-lg font-bold text-purple-800">
                {formatCurrency(getTotalRevenue())}
              </p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
        </div>
      </div>

      {/* Appointment types breakdown */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Por Tipo de Cita</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between bg-green-50 rounded p-2">
            <span className="text-sm text-green-700">🩺 Consultas</span>
            <span className="font-semibold text-green-800">{stats.byType.consultation}</span>
          </div>
          <div className="flex items-center justify-between bg-blue-50 rounded p-2">
            <span className="text-sm text-blue-700">🦷 Limpiezas</span>
            <span className="font-semibold text-blue-800">{stats.byType.cleaning}</span>
          </div>
          <div className="flex items-center justify-between bg-orange-50 rounded p-2">
            <span className="text-sm text-orange-700">🔧 Tratamientos</span>
            <span className="font-semibold text-orange-800">{stats.byType.treatment}</span>
          </div>
          <div className="flex items-center justify-between bg-red-50 rounded p-2">
            <span className="text-sm text-red-700">🚨 Emergencias</span>
            <span className="font-semibold text-red-800">{stats.byType.emergency}</span>
          </div>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Progreso del Día</h4>
        
        {/* Completion rate */}
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Citas Completadas</span>
            <span>{getCompletionRate()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getCompletionRate()}%` }}
            ></div>
          </div>
        </div>

        {/* Duration utilization */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Tiempo Programado</span>
            <span>{Math.round(stats.totalDuration / 60)}h {stats.totalDuration % 60}m</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((stats.totalDuration / (14 * 60)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="border-t pt-3">
        <div className="grid grid-cols-2 gap-2">
          <button 
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            onClick={() => handleStatClick('action', 'new_appointment')}
          >
            ➕ Nueva Cita
          </button>
          <button 
            className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
            onClick={() => handleStatClick('action', 'view_all')}
          >
            📋 Ver Todas
          </button>
        </div>
      </div>
    </div>
  );
}

export default DailyStatsWidget;

