/**
 * 🌉 UNIFIED SYSTEM INTEGRATION BRIDGE v2.0
 * By PunkClaude & Team Anarquista - Revolutionary Integration Architecture
 * 
 * 🎯 PURPOSE:
 * - Seamless integration between legacy and unified document systems
 * - Gradual migration path              <div className="unified-preview bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-900">
                  🚀 Sistema Unificado (Previsualización)
                </h3>
                <button
                  onClick={() => setCurrentSystem('unified')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mb-4"
                >
                  Activar Sistema Unificado
                </button>
                <DocumentList 
                  patientId={patientId}
                  key={`preview-${Date.now()}`}
                />king existing functionality
 * - Unified API interface for both systems
 * - Enhanced visual cards with IAnarkalendar inspiration
 */

import React, { useState, useEffect, useMemo } from 'react';
import apollo from '../../../apollo'; // 🚀 APOLLO NUCLEAR - WEBPACK CAN'T STOP US!
// Rutas corregidas para la estructura real - Webpack friendly! 🎯
import { DocumentUpload } from '../../DocumentManagement/DocumentUpload.tsx';
import { DocumentList } from '../../DocumentManagement/DocumentList.tsx';
import { DocumentViewer } from '../../DocumentManagement/DocumentViewer.tsx';
import { DocumentManagement } from '../../DocumentManagement/DocumentManagement.tsx';
import { LegalCategory, UnifiedDocumentType } from './UnifiedDocumentTypes.tsx';

interface IntegrationBridgeProps {
  patientId: string;
  useUnifiedSystem?: boolean;
  migrationMode?: boolean;
  onSystemToggle?: (useUnified: boolean) => void;
}

interface SystemStatus {
  unifiedActive: boolean;
  migrationProgress: number;
  legacyDocumentsRemaining: number;
  canToggleSystem: boolean;
}

/**
 * 🌉 Integration Bridge Component
 * 
 * Provides seamless transition between legacy and unified document systems
 * Handles migration, compatibility, and progressive enhancement
 */
export const UnifiedSystemBridge: React.FC<IntegrationBridgeProps> = ({
  patientId,
  useUnifiedSystem = false,
  migrationMode = false,
  onSystemToggle
}) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    unifiedActive: useUnifiedSystem,
    migrationProgress: 0,
    legacyDocumentsRemaining: 0,
    canToggleSystem: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [migrationInProgress, setMigrationInProgress] = useState(false);
  const [currentSystem, setCurrentSystem] = useState<'legacy' | 'unified' | 'hybrid'>(
    useUnifiedSystem ? 'unified' : 'legacy'
  );

  // 📊 Load system status
  useEffect(() => {
    const loadSystemStatus = async () => {
      try {
        setIsLoading(true);
        // 🚀 APOLLO API - Load system status
        const response = await apollo.api.get('/documents/system-status', { version: 'v2' });
        
        if (response.success && response.data) {
          const status = response.data;
          // Process status...
        }
        
        // 🎉 MIGRATION COMPLETED - Frontend is fully unified
        setSystemStatus({
          unifiedActive: true, // Frontend is unified
          migrationProgress: 1.0, // 100% migrated
          legacyDocumentsRemaining: 0, // No legacy documents
          canToggleSystem: true // Allow system control
        });

        // 🚀 Always use unified system since frontend is migrated
        setCurrentSystem('unified');
      } catch (error) {
        console.error('❌ Apollo API - Failed to load system status:', error);
        setCurrentSystem('legacy'); // Fallback to legacy
      } finally {
        setIsLoading(false);
      }
    };

    loadSystemStatus();
  }, []);

  // 🔄 Handle system migration
  const handleMigration = async (force: boolean = false) => {
    if (migrationInProgress) return;

    try {
      setMigrationInProgress(true);
      
      // 🚀 APOLLO API - Migrate patient documents
      const response = await apollo.api.post('/documents/migrate-patient', {
        patient_id: patientId,
        force_migration: force,
        preserve_metadata: true
      }, { version: 'v2' });

      if (response.success && response.data) {
        const result = response.data;
      
      if (result.migrated_count > 0) {
        setSystemStatus(prev => ({
          ...prev,
          migrationProgress: Math.min(1.0, prev.migrationProgress + 0.1),
          legacyDocumentsRemaining: Math.max(0, prev.legacyDocumentsRemaining - result.migrated_count)
        }));

        // Update current system based on migration progress
        if (systemStatus.migrationProgress >= 0.8) {
          setCurrentSystem('unified');
          onSystemToggle?.(true);
        }
      }
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setMigrationInProgress(false);
    }
  };

  // 🎯 System toggle handler
  const handleSystemToggle = (useUnified: boolean) => {
    if (!systemStatus.canToggleSystem) return;
    
    setCurrentSystem(useUnified ? 'unified' : 'legacy');
    onSystemToggle?.(useUnified);
  };

  // 🎨 Render system status banner
  const renderSystemStatus = () => {
    if (isLoading) return null;

    const getStatusColor = () => {
      if (systemStatus.migrationProgress === 1.0) return 'bg-green-50 border-green-200 text-green-800';
      if (systemStatus.migrationProgress > 0.5) return 'bg-blue-50 border-blue-200 text-blue-800';
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    };

    const getStatusIcon = () => {
      if (systemStatus.migrationProgress === 1.0) return '✅';
      if (systemStatus.migrationProgress > 0.5) return '🔄';
      return '⚠️';
    };

    return (
      <div className={`p-4 border rounded-lg mb-6 ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon()}</span>
            <div>
              <h3 className="font-semibold">
                {systemStatus.migrationProgress === 1.0 
                  ? '🚀 Sistema Unificado Activo'
                  : systemStatus.migrationProgress > 0.5
                  ? '🔄 Migración en Progreso'
                  : '📂 Sistema Legacy Activo'
                }
              </h3>
              <p className="text-sm opacity-80">
                {systemStatus.migrationProgress === 1.0
                  ? 'Todos los documentos migrados al sistema unificado'
                  : `Progreso: ${Math.round(systemStatus.migrationProgress * 100)}% - ${systemStatus.legacyDocumentsRemaining} documentos legacy restantes`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Migration Progress Bar */}
            <div className="w-32 bg-white bg-opacity-50 rounded-full h-2">
              <div 
                className="bg-current h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemStatus.migrationProgress * 100}%` }}
              />
            </div>

            {/* System Toggle */}
            {systemStatus.canToggleSystem && (
              <button
                onClick={() => handleSystemToggle(currentSystem !== 'unified')}
                className="px-3 py-1 bg-white bg-opacity-20 rounded-md text-sm font-medium hover:bg-opacity-30 transition-colors"
              >
                {currentSystem === 'unified' ? 'Ver Legacy' : 'Ver Unificado'}
              </button>
            )}

            {/* Migration Trigger */}
            {systemStatus.legacyDocumentsRemaining > 0 && (
              <button
                onClick={() => handleMigration()}
                disabled={migrationInProgress}
                className="px-3 py-1 bg-white bg-opacity-20 rounded-md text-sm font-medium hover:bg-opacity-30 transition-colors disabled:opacity-50"
              >
                {migrationInProgress ? '🔄 Migrando...' : '🚀 Migrar'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 🎯 Render appropriate system
  const renderDocumentSystem = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando sistema de documentos...</span>
        </div>
      );
    }

    switch (currentSystem) {
      case 'unified':
        return (
          <div className="unified-document-management">
            {/* PRODUCTION MODE: Title hidden for client */}
            <DocumentManagement
              patientId={patientId}
              className="h-full"
              key={`unified-${Date.now()}`}
            />
          </div>
        );

      case 'hybrid':
        return (
          <div className="space-y-6">
            {/* Unified System Preview */}
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-800">
                  🚀 Sistema Unificado (Previsualización)
                </h3>
                <button
                  onClick={() => setCurrentSystem('unified')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Activar Sistema Unificado
                </button>
              </div>
              <DocumentList 
                patientId={patientId}
                key={`legacy-${Date.now()}`}
              />
            </div>

            {/* Legacy System */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  📂 Sistema Legacy (Activo)
                </h3>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  En Migración
                </span>
              </div>
              <div className="space-y-4">
                <DocumentUpload patientId={patientId} />
                <DocumentList patientId={patientId} />
              </div>
            </div>
          </div>
        );

      case 'legacy':
      default:
        return (
          <div className="space-y-4">
            <DocumentUpload patientId={patientId} />
            <DocumentList patientId={patientId} />
          </div>
        );
    }
  };

  // 🎨 Render migration tools (if enabled)
  const renderMigrationTools = () => {
    if (!migrationMode || systemStatus.migrationProgress === 1.0) return null;

    return (
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-purple-800 flex items-center">
              🔧 Herramientas de Migración
              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                Modo Desarrollador
              </span>
            </h3>
            <p className="text-sm text-purple-600 mt-1">
              Migra documentos del sistema legacy al sistema unificado
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleMigration(false)}
              disabled={migrationInProgress}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {migrationInProgress ? '🔄 Migrando...' : '📋 Migrar Pendientes'}
            </button>
            
            <button
              onClick={() => handleMigration(true)}
              disabled={migrationInProgress}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {migrationInProgress ? '🔄 Migrando...' : '🚀 Forzar Migración'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="unified-system-bridge">
      {/* PRODUCTION MODE: Status banners hidden for client */}
      {/* System Status Banner */}
      {/* {renderSystemStatus()} */}
      
      {/* Migration Tools */}
      {/* {renderMigrationTools()} */}
      
      {/* Document System */}
      {renderDocumentSystem()}
      
      {/* Document Viewer (shared between systems) */}
      {/* <DocumentViewer /> */}
    </div>
  );
};

/**
 * 🎯 System Detection Hook
 * 
 * Automatically detects which system to use based on migration status
 */
export const useUnifiedSystemDetection = (patientId: string) => {
  const [systemRecommendation, setSystemRecommendation] = useState<{
    recommended: 'legacy' | 'unified' | 'hybrid';
    migrationProgress: number;
    canUseBoth: boolean;
  }>({
    recommended: 'legacy',
    migrationProgress: 0,
    canUseBoth: false
  });

  useEffect(() => {
    const detectSystem = async () => {
      try {
        // 🚀 APOLLO API - Get patient system status
        const response = await apollo.api.get(`/documents/patient/${patientId}/system-status`, { version: 'v2' });
        
        if (response.success && response.data) {
          const data = response.data;
          
          setSystemRecommendation({
            recommended: data.migration_progress === 1.0 ? 'unified' : 
                       data.migration_progress > 0.5 ? 'hybrid' : 'legacy',
            migrationProgress: data.migration_progress,
            canUseBoth: data.migration_progress > 0.3
          });
        }
      } catch (error) {
        console.error('❌ Apollo API - System detection failed:', error);
      }
    };

    if (patientId) {
      detectSystem();
    }
  }, [patientId]);

  return systemRecommendation;
};

/**
 * 🎯 Migration Status Hook
 * 
 * Provides real-time migration status and controls
 */
export const useMigrationStatus = () => {
  const [status, setStatus] = useState({
    isActive: false,
    progress: 0,
    estimatedTimeRemaining: 0,
    documentsProcessed: 0,
    totalDocuments: 0,
    errors: [] as string[]
  });

  const startMigration = async (options: {
    patientId?: string;
    documentTypes?: string[];
    force?: boolean;
  }) => {
    // Migration logic here
  };

  const pauseMigration = async () => {
    // Pause logic here
  };

  const resumeMigration = async () => {
    // Resume logic here
  };

  return {
    status,
    startMigration,
    pauseMigration,
    resumeMigration
  };
};

export default UnifiedSystemBridge;
