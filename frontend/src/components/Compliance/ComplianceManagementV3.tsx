// 🎯🎸🛡️ COMPLIANCE MANAGEMENT V3.0 - TITAN PATTERN IMPLEMENTATION
// Date: September 25, 2025
// Mission: Complete compliance management with @veritas quantum verification
// Status: V3.0 - Full compliance system with quantum truth verification
// Challenge: Regulatory compliance and audit management with AI insights
// 🎨 THEME: Cyberpunk Medical - Cyan/Purple/Pink gradients with quantum effects
// 🔒 SECURITY: @veritas quantum truth verification on compliance data

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';

// 🎯 TITAN PATTERN IMPORTS - Core Dependencies
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge, Spinner } from '../atoms/index';
import { createModuleLogger } from '../../utils/logger';

// 🎯 GRAPHQL QUERIES - V3.0 Integration
import {
  GET_COMPLIANCE_DASHBOARD_STATS,
  GET_COMPLIANCE_REGULATIONS,
  GET_COMPLIANCE_AUDITS,
  GET_COMPLIANCE_FINDINGS,
  GET_COMPLIANCE_CERTIFICATIONS,
  GET_COMPLIANCE_POLICIES,
  GET_COMPLIANCE_TRAININGS,
  GET_COMPLIANCE_ALERTS,
  CREATE_COMPLIANCE_REGULATION,
  CREATE_COMPLIANCE_AUDIT,
  UPDATE_COMPLIANCE_FINDING,
  ACKNOWLEDGE_COMPLIANCE_ALERT
} from '../../graphql/queries/compliance';

// 🎯 SUBCOMPONENTS - Modular Architecture
import RegulationFormModalV3 from './RegulationFormModalV3';
import AuditFormModalV3 from './AuditFormModalV3';
import RegulationDetailViewV3 from './RegulationDetailViewV3';
import AuditDetailViewV3 from './AuditDetailViewV3';
import FindingDetailViewV3 from './FindingDetailViewV3';
import ComplianceAnalyticsV3 from './ComplianceAnalyticsV3';

// 🎯 ICONS - Heroicons for compliance theme
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ChartBarIcon,
  UserGroupIcon,
  BuildingLibraryIcon,
  BoltIcon,
  CpuChipIcon,
  ScaleIcon,
  ClipboardDocumentCheckIcon,
  AcademicCapIcon,
  BellAlertIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

// 🎯 COMPLIANCE MANAGEMENT V3.0 INTERFACE
interface ComplianceManagementV3Props {
  className?: string;
}

// 🎯 COMPLIANCE INTERFACES - @veritas Enhanced
interface ComplianceRegulation {
  id: string;
  name: string;
  name_veritas?: string;
  description: string;
  description_veritas?: string;
  category: string;
  version: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  status_veritas?: string;
  complianceDeadline: string;
  complianceScore: number;
  complianceScore_veritas?: number;
  responsibleParty: string;
  _veritas?: {
    verified: boolean;
    confidence: number;
    level: string;
    certificate: string;
    error?: string;
    verifiedAt: string;
    algorithm: string;
  };
}

interface ComplianceAudit {
  id: string;
  title: string;
  title_veritas?: string;
  type: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  status_veritas?: string;
  scheduledDate: string;
  auditor: string;
  overallScore?: number;
  overallScore_veritas?: number;
  findings: ComplianceFinding[];
  _veritas?: {
    verified: boolean;
    confidence: number;
    level: string;
    certificate: string;
    error?: string;
    verifiedAt: string;
    algorithm: string;
  };
}

interface ComplianceFinding {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  severity_veritas?: string;
  category: string;
  description: string;
  description_veritas?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  status_veritas?: string;
  assignedTo: string;
  dueDate: string;
  _veritas?: {
    verified: boolean;
    confidence: number;
    level: string;
    certificate: string;
    error?: string;
    verifiedAt: string;
    algorithm: string;
  };
}

// 🎯 STATUS CONFIGURATION - Cyberpunk Theme
const REGULATION_STATUS_CONFIG = {
  ACTIVE: { label: 'Activa', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30', icon: CheckCircleIcon },
  INACTIVE: { label: 'Inactiva', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30', icon: XCircleIcon },
  EXPIRED: { label: 'Expirada', bgColor: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30', icon: ExclamationTriangleIcon }
};

const AUDIT_STATUS_CONFIG = {
  SCHEDULED: { label: 'Programada', bgColor: 'bg-blue-500/20', textColor: 'text-blue-300', borderColor: 'border-blue-500/30', icon: ClockIcon },
  IN_PROGRESS: { label: 'En Progreso', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30', icon: BoltIcon },
  COMPLETED: { label: 'Completada', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30', icon: CheckCircleIcon },
  CANCELLED: { label: 'Cancelada', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30', icon: XCircleIcon }
};

const FINDING_SEVERITY_CONFIG = {
  CRITICAL: { label: 'Crítico', bgColor: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30', icon: ExclamationTriangleIcon },
  HIGH: { label: 'Alto', bgColor: 'bg-orange-500/20', textColor: 'text-orange-300', borderColor: 'border-orange-500/30', icon: ExclamationTriangleIcon },
  MEDIUM: { label: 'Medio', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30', icon: ClockIcon },
  LOW: { label: 'Bajo', bgColor: 'bg-blue-500/20', textColor: 'text-blue-300', borderColor: 'border-blue-500/30', icon: EyeIcon }
};

const FINDING_STATUS_CONFIG = {
  OPEN: { label: 'Abierto', bgColor: 'bg-red-500/20', textColor: 'text-red-300', borderColor: 'border-red-500/30', icon: XCircleIcon },
  IN_PROGRESS: { label: 'En Progreso', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', borderColor: 'border-yellow-500/30', icon: ClockIcon },
  RESOLVED: { label: 'Resuelto', bgColor: 'bg-green-500/20', textColor: 'text-green-300', borderColor: 'border-green-500/30', icon: CheckCircleIcon },
  CLOSED: { label: 'Cerrado', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300', borderColor: 'border-gray-500/30', icon: CheckCircleIcon }
};

// 🎯 LOGGER - Module specific logger
const l = createModuleLogger('ComplianceManagementV3');

export const ComplianceManagementV3: React.FC<ComplianceManagementV3Props> = ({
  className = ''
}) => {
  // 🎯 STATE MANAGEMENT - Advanced State
  const [searchTerm, setSearchTerm] = useState('');
  const [regulationStatusFilter, setRegulationStatusFilter] = useState<string>('all');
  const [auditStatusFilter, setAuditStatusFilter] = useState<string>('all');
  const [findingSeverityFilter, setFindingSeverityFilter] = useState<string>('all');
  const [findingStatusFilter, setFindingStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'regulations' | 'audits' | 'findings' | 'analytics'>('dashboard');

  // 🎯 MODAL STATE
  const [showRegulationForm, setShowRegulationForm] = useState(false);
  const [showAuditForm, setShowAuditForm] = useState(false);
  const [selectedRegulation, setSelectedRegulation] = useState<ComplianceRegulation | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<ComplianceAudit | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<ComplianceFinding | null>(null);
  const [showRegulationDetail, setShowRegulationDetail] = useState(false);
  const [showAuditDetail, setShowAuditDetail] = useState(false);
  const [showFindingDetail, setShowFindingDetail] = useState(false);

  // 🎯 GRAPHQL QUERIES
  const { data: dashboardData, loading: dashboardLoading, refetch: refetchDashboard } = useQuery(GET_COMPLIANCE_DASHBOARD_STATS);

  const { data: regulationsData, loading: regulationsLoading, refetch: refetchRegulations } = useQuery(GET_COMPLIANCE_REGULATIONS, {
    variables: {
      filters: {
        status: regulationStatusFilter !== 'all' ? regulationStatusFilter : undefined,
        search: searchTerm || undefined
      }
    }
  });

  const { data: auditsData, loading: auditsLoading, refetch: refetchAudits } = useQuery(GET_COMPLIANCE_AUDITS, {
    variables: {
      filters: {
        status: auditStatusFilter !== 'all' ? auditStatusFilter : undefined,
        search: searchTerm || undefined
      }
    }
  });

  const { data: findingsData, loading: findingsLoading, refetch: refetchFindings } = useQuery(GET_COMPLIANCE_FINDINGS, {
    variables: {
      filters: {
        severity: findingSeverityFilter !== 'all' ? findingSeverityFilter : undefined,
        status: findingStatusFilter !== 'all' ? findingStatusFilter : undefined,
        search: searchTerm || undefined
      }
    }
  });

  // 🎯 GRAPHQL MUTATIONS
  const [acknowledgeAlert] = useMutation(ACKNOWLEDGE_COMPLIANCE_ALERT);

  // 🎯 PROCESSED DATA - @veritas Enhanced
  const dashboardStats = useMemo(() => {
    return dashboardData?.complianceDashboardStats || {
      totalRegulations: 0,
      activeRegulations: 0,
      expiringRegulations: 0,
      overdueAudits: 0,
      upcomingAudits: 0,
      complianceScore: 0,
      openFindings: 0,
      criticalFindings: 0,
      trainingCompletionRate: 0,
      activeAlerts: 0
    };
  }, [dashboardData]);

  const regulations = useMemo(() => {
    return regulationsData?.complianceRegulations || [];
  }, [regulationsData]);

  const audits = useMemo(() => {
    return auditsData?.complianceAudits || [];
  }, [auditsData]);

  const findings = useMemo(() => {
    return findingsData?.complianceFindings || [];
  }, [findingsData]);

  // 🎯 FILTERED DATA - Advanced Filtering
  const filteredRegulations = useMemo(() => {
    return regulations.filter((regulation: ComplianceRegulation) => {
      const matchesSearch = !searchTerm ||
        regulation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        regulation.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = regulationStatusFilter === 'all' || regulation.status === regulationStatusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a: ComplianceRegulation, b: ComplianceRegulation) => {
      // Sort by status priority, then by compliance score
      const statusOrder = { ACTIVE: 1, INACTIVE: 2, EXPIRED: 3 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return b.complianceScore - a.complianceScore;
    });
  }, [regulations, searchTerm, regulationStatusFilter]);

  const filteredAudits = useMemo(() => {
    return audits.filter((audit: ComplianceAudit) => {
      const matchesSearch = !searchTerm ||
        audit.title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = auditStatusFilter === 'all' || audit.status === auditStatusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a: ComplianceAudit, b: ComplianceAudit) => {
      // Sort by status priority, then by scheduled date
      const statusOrder = { IN_PROGRESS: 1, SCHEDULED: 2, COMPLETED: 3, CANCELLED: 4 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    });
  }, [audits, searchTerm, auditStatusFilter]);

  const filteredFindings = useMemo(() => {
    return findings.filter((finding: ComplianceFinding) => {
      const matchesSearch = !searchTerm ||
        finding.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeverity = findingSeverityFilter === 'all' || finding.severity === findingSeverityFilter;
      const matchesStatus = findingStatusFilter === 'all' || finding.status === findingStatusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    }).sort((a: ComplianceFinding, b: ComplianceFinding) => {
      // Sort by severity priority, then by status
      const severityOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;

      const statusOrder = { OPEN: 1, IN_PROGRESS: 2, RESOLVED: 3, CLOSED: 4 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [findings, searchTerm, findingSeverityFilter, findingStatusFilter]);

  // 🎯 HANDLERS - Advanced Event Handling
  const handleCreateRegulation = () => {
    setSelectedRegulation(null);
    setShowRegulationForm(true);
  };

  const handleCreateAudit = () => {
    setSelectedAudit(null);
    setShowAuditForm(true);
  };

  const handleEditRegulation = (regulation: ComplianceRegulation) => {
    setSelectedRegulation(regulation);
    setShowRegulationForm(true);
  };

  const handleEditAudit = (audit: ComplianceAudit) => {
    setSelectedAudit(audit);
    setShowAuditForm(true);
  };

  const handleViewRegulation = (regulation: ComplianceRegulation) => {
    setSelectedRegulation(regulation);
    setShowRegulationDetail(true);
  };

  const handleViewAudit = (audit: ComplianceAudit) => {
    setSelectedAudit(audit);
    setShowAuditDetail(true);
  };

  const handleViewFinding = (finding: ComplianceFinding) => {
    setSelectedFinding(finding);
    setShowFindingDetail(true);
  };

  const handleFormSuccess = () => {
    setShowRegulationForm(false);
    setShowAuditForm(false);
    setSelectedRegulation(null);
    setSelectedAudit(null);
    refetchRegulations();
    refetchAudits();
    refetchFindings();
    refetchDashboard();
  };

  const handleCloseModals = () => {
    setShowRegulationForm(false);
    setShowAuditForm(false);
    setShowRegulationDetail(false);
    setShowAuditDetail(false);
    setShowFindingDetail(false);
    setSelectedRegulation(null);
    setSelectedAudit(null);
    setSelectedFinding(null);
  };

  // 🎯 GET STATUS INFO - Cyberpunk Themed
  const getRegulationStatusInfo = (status: string) => {
    return REGULATION_STATUS_CONFIG[status as keyof typeof REGULATION_STATUS_CONFIG] || REGULATION_STATUS_CONFIG.ACTIVE;
  };

  const getAuditStatusInfo = (status: string) => {
    return AUDIT_STATUS_CONFIG[status as keyof typeof AUDIT_STATUS_CONFIG] || AUDIT_STATUS_CONFIG.SCHEDULED;
  };

  const getFindingSeverityInfo = (severity: string) => {
    return FINDING_SEVERITY_CONFIG[severity as keyof typeof FINDING_SEVERITY_CONFIG] || FINDING_SEVERITY_CONFIG.LOW;
  };

  const getFindingStatusInfo = (status: string) => {
    return FINDING_STATUS_CONFIG[status as keyof typeof FINDING_STATUS_CONFIG] || FINDING_STATUS_CONFIG.OPEN;
  };

  // 🎯 FORMAT FUNCTIONS
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 🎯 HEADER SECTION - Cyberpunk Medical Theme */}
      <Card className="relative bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 backdrop-blur-sm border border-cyan-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        <CardHeader className="relative border-b border-gray-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🎯 Gestión de Cumplimiento V3.0
                </CardTitle>
                <p className="text-gray-300 text-sm mt-1">
                  Sistema de cumplimiento normativo con verificación cuántica @veritas
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setActiveTab(activeTab === 'analytics' ? 'dashboard' : 'analytics')}
                variant="ghost"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                {activeTab === 'analytics' ? 'Dashboard' : 'Analytics'}
              </Button>
              <div className="flex space-x-2">
                <Button
                  onClick={handleCreateRegulation}
                  className="bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-lg shadow-pink-500/25"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Nueva Regulación
                </Button>
                <Button
                  onClick={handleCreateAudit}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                >
                  <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
                  Nueva Auditoría
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* 🎯 DASHBOARD SUMMARY - @veritas Enhanced */}
        {activeTab === 'dashboard' && (
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{dashboardStats.totalRegulations}</div>
                <div className="text-xs text-gray-400">Regulaciones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{dashboardStats.activeRegulations}</div>
                <div className="text-xs text-gray-400">Activas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{dashboardStats.upcomingAudits}</div>
                <div className="text-xs text-gray-400">Auditorías</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{dashboardStats.criticalFindings}</div>
                <div className="text-xs text-gray-400">Críticos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{formatPercentage(dashboardStats.complianceScore)}</div>
                <div className="text-xs text-gray-400">Puntuación</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 🎯 NAVIGATION TABS - Cyberpunk Theme */}
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30">
        <CardContent className="p-4">
          <div className="flex space-x-1">
            <Button
              onClick={() => setActiveTab('dashboard')}
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              className={`flex-1 ${activeTab === 'dashboard' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Dashboard ({dashboardStats.activeAlerts})
            </Button>
            <Button
              onClick={() => setActiveTab('regulations')}
              variant={activeTab === 'regulations' ? 'default' : 'ghost'}
              className={`flex-1 ${activeTab === 'regulations' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
              <ScaleIcon className="w-4 h-4 mr-2" />
              Regulaciones ({filteredRegulations.length})
            </Button>
            <Button
              onClick={() => setActiveTab('audits')}
              variant={activeTab === 'audits' ? 'default' : 'ghost'}
              className={`flex-1 ${activeTab === 'audits' ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
              <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
              Auditorías ({filteredAudits.length})
            </Button>
            <Button
              onClick={() => setActiveTab('findings')}
              variant={activeTab === 'findings' ? 'default' : 'ghost'}
              className={`flex-1 ${activeTab === 'findings' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
              <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
              Hallazgos ({filteredFindings.length})
            </Button>
            <Button
              onClick={() => setActiveTab('analytics')}
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              className={`flex-1 ${activeTab === 'analytics' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
              <BoltIcon className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 🎯 FILTERS SECTION - Advanced Filtering */}
      {activeTab !== 'dashboard' && activeTab !== 'analytics' && (
        <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
                />
              </div>

              {activeTab === 'regulations' && (
                <select
                  value={regulationStatusFilter}
                  onChange={(e) => setRegulationStatusFilter(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="ACTIVE">Activa</option>
                  <option value="INACTIVE">Inactiva</option>
                  <option value="EXPIRED">Expirada</option>
                </select>
              )}

              {activeTab === 'audits' && (
                <select
                  value={auditStatusFilter}
                  onChange={(e) => setAuditStatusFilter(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="SCHEDULED">Programada</option>
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="COMPLETED">Completada</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>
              )}

              {activeTab === 'findings' && (
                <>
                  <select
                    value={findingSeverityFilter}
                    onChange={(e) => setFindingSeverityFilter(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                  >
                    <option value="all">Toda Severidad</option>
                    <option value="CRITICAL">Crítico</option>
                    <option value="HIGH">Alto</option>
                    <option value="MEDIUM">Medio</option>
                    <option value="LOW">Bajo</option>
                  </select>

                  <select
                    value={findingStatusFilter}
                    onChange={(e) => setFindingStatusFilter(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-purple-500/50 focus:ring-purple-500/20"
                  >
                    <option value="all">Todos los Estados</option>
                    <option value="OPEN">Abierto</option>
                    <option value="IN_PROGRESS">En Progreso</option>
                    <option value="RESOLVED">Resuelto</option>
                    <option value="CLOSED">Cerrado</option>
                  </select>
                </>
              )}

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setRegulationStatusFilter('all');
                    setAuditStatusFilter('all');
                    setFindingSeverityFilter('all');
                    setFindingStatusFilter('all');
                  }}
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50"
                >
                  <FunnelIcon className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🎯 MAIN CONTENT - Modular Architecture */}
      {activeTab === 'dashboard' && (
        /* Dashboard View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Audits */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-cyan-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-cyan-300 flex items-center space-x-2">
                <ClipboardDocumentCheckIcon className="w-5 h-5" />
                <span>Auditorías Recientes</span>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                  {filteredAudits.slice(0, 3).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="sm" />
                  <span className="ml-2 text-gray-300">Cargando auditorías...</span>
                </div>
              ) : filteredAudits.slice(0, 3).length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardDocumentCheckIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No hay auditorías recientes</h3>
                  <p className="text-gray-500">Programa una nueva auditoría para comenzar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAudits.slice(0, 3).map((audit: ComplianceAudit) => {
                    const statusInfo = getAuditStatusInfo(audit.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <Card key={audit.id} className="bg-gray-800/30 border border-gray-600/30 hover:border-purple-500/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                <StatusIcon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="text-white font-semibold flex items-center space-x-2">
                                  <span>{audit.title}</span>
                                  {audit._veritas && (
                                    <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                  )}
                                </h4>
                                <p className="text-gray-400 text-sm">
                                  {audit.type} • {audit.auditor}
                                </p>
                              </div>
                            </div>
                            <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                              {statusInfo.label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-400">Programada:</span>
                              <p className="text-white">{formatDate(audit.scheduledDate)}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Hallazgos:</span>
                              <p className="text-white">{audit.findings.length}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-600/30">
                            <div className="flex items-center space-x-2">
                              {audit._veritas && (
                                <div className="flex items-center space-x-1">
                                  <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                  <span className="text-green-400 text-xs font-mono">
                                    @veritas {audit._veritas.confidence}%
                                  </span>
                                </div>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewAudit(audit)}
                              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Critical Findings */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-red-300 flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span>Hallazgos Críticos</span>
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                  {filteredFindings.filter((f: ComplianceFinding) => f.severity === 'CRITICAL').length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {findingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="sm" />
                  <span className="ml-2 text-gray-300">Cargando hallazgos...</span>
                </div>
              ) : filteredFindings.filter((f: ComplianceFinding) => f.severity === 'CRITICAL').length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-green-300 mb-2">Sin hallazgos críticos</h3>
                  <p className="text-green-400/80">El cumplimiento está en buen estado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFindings.filter((f: ComplianceFinding) => f.severity === 'CRITICAL').slice(0, 3).map((finding: ComplianceFinding) => {
                    const severityInfo = getFindingSeverityInfo(finding.severity);
                    const statusInfo = getFindingStatusInfo(finding.status);
                    const SeverityIcon = severityInfo.icon;

                    return (
                      <Card key={finding.id} className="bg-gray-800/30 border border-gray-600/30 hover:border-red-500/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <SeverityIcon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="text-white font-semibold flex items-center space-x-2">
                                  <span>{finding.category}</span>
                                  {finding._veritas && (
                                    <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                  )}
                                </h4>
                                <p className="text-gray-400 text-sm">
                                  Asignado a: {finding.assignedTo}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={`${severityInfo.bgColor} ${severityInfo.textColor} border ${severityInfo.borderColor}`}>
                                {severityInfo.label}
                              </Badge>
                              <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{finding.description}</p>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-600/30">
                            <div className="text-sm text-gray-400">
                              Vence: {formatDate(finding.dueDate)}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewFinding(finding)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'regulations' && (
        /* Regulations View */
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-cyan-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-cyan-300 flex items-center space-x-2">
              <ScaleIcon className="w-5 h-5" />
              <span>Lista de Regulaciones</span>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                {filteredRegulations.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {regulationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" />
                <span className="ml-2 text-gray-300">Cargando regulaciones...</span>
              </div>
            ) : filteredRegulations.length === 0 ? (
              <div className="text-center py-8">
                <ScaleIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No se encontraron regulaciones</h3>
                <p className="text-gray-500">Crea una nueva regulación para comenzar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRegulations.map((regulation: ComplianceRegulation) => {
                  const statusInfo = getRegulationStatusInfo(regulation.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <Card key={regulation.id} className="bg-gray-800/30 border border-gray-600/30 hover:border-purple-500/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                              <StatusIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white font-semibold flex items-center space-x-2">
                                <span>{regulation.name}</span>
                                {regulation._veritas && (
                                  <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                )}
                              </h4>
                              <p className="text-gray-400 text-sm">
                                {regulation.category} • v{regulation.version}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                              {statusInfo.label}
                            </Badge>
                            <span className="text-white font-bold text-lg">
                              {formatPercentage(regulation.complianceScore)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-400">Estado:</span>
                            <p className="text-white">{statusInfo.label}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Responsable:</span>
                            <p className="text-white">{regulation.responsibleParty}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Vence:</span>
                            <p className="text-white">{formatDate(regulation.complianceDeadline)}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Puntuación:</span>
                            <p className="text-white">{formatPercentage(regulation.complianceScore)}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-600/30">
                          <div className="flex items-center space-x-2">
                            {regulation._veritas && (
                              <div className="flex items-center space-x-1">
                                <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-xs font-mono">
                                  @veritas {regulation._veritas.confidence}%
                                </span>
                              </div>
                            )}
                            {regulation.status === 'EXPIRED' && (
                              <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                                ¡Expirada!
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewRegulation(regulation)}
                              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRegulation(regulation)}
                              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'audits' && (
        /* Audits View */
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-300 flex items-center space-x-2">
              <ClipboardDocumentCheckIcon className="w-5 h-5" />
              <span>Lista de Auditorías</span>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                {filteredAudits.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {auditsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" />
                <span className="ml-2 text-gray-300">Cargando auditorías...</span>
              </div>
            ) : filteredAudits.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardDocumentCheckIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No se encontraron auditorías</h3>
                <p className="text-gray-500">Programa una nueva auditoría para comenzar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAudits.map((audit: ComplianceAudit) => {
                  const statusInfo = getAuditStatusInfo(audit.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <Card key={audit.id} className="bg-gray-800/30 border border-gray-600/30 hover:border-pink-500/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <StatusIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white font-semibold flex items-center space-x-2">
                                <span>{audit.title}</span>
                                {audit._veritas && (
                                  <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                )}
                              </h4>
                              <p className="text-gray-400 text-sm">
                                {audit.type} • {audit.auditor}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                              {statusInfo.label}
                            </Badge>
                            {audit.overallScore && (
                              <span className="text-white font-bold text-lg">
                                {formatPercentage(audit.overallScore)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-400">Estado:</span>
                            <p className="text-white">{statusInfo.label}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Programada:</span>
                            <p className="text-white">{formatDate(audit.scheduledDate)}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Hallazgos:</span>
                            <p className="text-white">{audit.findings.length}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Puntuación:</span>
                            <p className="text-white">{audit.overallScore ? formatPercentage(audit.overallScore) : 'N/A'}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-600/30">
                          <div className="flex items-center space-x-2">
                            {audit._veritas && (
                              <div className="flex items-center space-x-1">
                                <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-xs font-mono">
                                  @veritas {audit._veritas.confidence}%
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewAudit(audit)}
                              className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/20"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAudit(audit)}
                              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'findings' && (
        /* Findings View */
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-300 flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>Lista de Hallazgos</span>
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                {filteredFindings.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {findingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" />
                <span className="ml-2 text-gray-300">Cargando hallazgos...</span>
              </div>
            ) : filteredFindings.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-green-300 mb-2">Sin hallazgos encontrados</h3>
                <p className="text-green-400/80">El cumplimiento está en buen estado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFindings.map((finding: ComplianceFinding) => {
                  const severityInfo = getFindingSeverityInfo(finding.severity);
                  const statusInfo = getFindingStatusInfo(finding.status);
                  const SeverityIcon = severityInfo.icon;

                  return (
                    <Card key={finding.id} className="bg-gray-800/30 border border-gray-600/30 hover:border-orange-500/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                              <SeverityIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white font-semibold flex items-center space-x-2">
                                <span>{finding.category}</span>
                                {finding._veritas && (
                                  <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                )}
                              </h4>
                              <p className="text-gray-400 text-sm">
                                Asignado a: {finding.assignedTo}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${severityInfo.bgColor} ${severityInfo.textColor} border ${severityInfo.borderColor}`}>
                              {severityInfo.label}
                            </Badge>
                            <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{finding.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-400">Vence:</span>
                            <p className="text-white">{formatDate(finding.dueDate)}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Estado:</span>
                            <p className="text-white">{statusInfo.label}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-600/30">
                          <div className="flex items-center space-x-2">
                            {finding._veritas && (
                              <div className="flex items-center space-x-1">
                                <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-xs font-mono">
                                  @veritas {finding._veritas.confidence}%
                                </span>
                              </div>
                            )}
                            {finding.status === 'OPEN' && finding.severity === 'CRITICAL' && (
                              <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                                ¡Acción Requerida!
                              </Badge>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewFinding(finding)}
                            className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/20"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        /* Analytics View */
        <ComplianceAnalyticsV3
          regulations={regulations}
          audits={audits}
          findings={findings}
          isLoading={regulationsLoading || auditsLoading || findingsLoading}
        />
      )}

      {/* 🎯 MODALS - Modular Architecture */}
      {showRegulationForm && (
        <RegulationFormModalV3
          isOpen={showRegulationForm}
          regulation={selectedRegulation}
          onClose={handleCloseModals}
          onSuccess={handleFormSuccess}
        />
      )}

      {showAuditForm && (
        <AuditFormModalV3
          isOpen={showAuditForm}
          audit={selectedAudit}
          onClose={handleCloseModals}
          onSuccess={handleFormSuccess}
        />
      )}

      {showRegulationDetail && selectedRegulation && (
        <RegulationDetailViewV3
          regulation={selectedRegulation}
          onClose={handleCloseModals}
        />
      )}

      {showAuditDetail && selectedAudit && (
        <AuditDetailViewV3
          audit={selectedAudit}
          onClose={handleCloseModals}
        />
      )}

      {showFindingDetail && selectedFinding && (
        <FindingDetailViewV3
          finding={selectedFinding}
          onClose={handleCloseModals}
        />
      )}
    </div>
  );
};

export default ComplianceManagementV3;
