/**
 * ⚖️ COMPLIANCE PAGE V4 - PENTÁGONO LEGAL
 * ============================================================================
 * File: frontend/src/pages/CompliancePageV4.tsx
 * Created: November 28, 2025
 * Author: PunkClaude + Radwulf
 *
 * MISSION: AI Act 2026 Ready - Compliance as Strategic Weapon
 * 
 * 3 TABS:
 * 1. Dashboard - Score real calculado, mapa de riesgo
 * 2. Biblioteca Legal - Documentos desde DB (no hardcodeados)
 * 3. Auditoría Forense - Logs de acceso y cambios
 *
 * STATUS: PRODUCTION-READY
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_COMPLIANCE_SCORE_V4,
  GET_LEGAL_DOCUMENTS_V4,
  GET_AUDIT_LOGS_V4,
  GET_AUDIT_SUMMARY_V4,
  SEED_COMPLIANCE_DEFAULTS,
  RUN_COMPLIANCE_CHECK
} from '../graphql/queries/pentagonLegal';
import { StaffGuard } from '../components/StaffGuard';
import { createModuleLogger } from '../utils/logger';

// Icons
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  EyeIcon,
  ChartBarIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const l = createModuleLogger('CompliancePageV4');

// ============================================================================
// TYPES
// ============================================================================

interface ComplianceScore {
  overallScore: number;
  totalRules: number;
  rulesPassed: number;
  rulesFailed: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  breakdown: {
    dataPrivacy: number;
    security: number;
    patientRights: number;
    retention: number;
  };
  checks: Array<{
    ruleId: string;
    ruleCode: string;
    ruleName: string;
    passed: boolean;
    details: string;
    severity: string;
    weight: number;
    penalty: number;
  }>;
  calculatedAt: string;
}

interface LegalDocument {
  id: string;
  code: string;
  title: string;
  description: string;
  jurisdiction: string;
  category: string;
  documentType: string;
  contentMarkdown: string | null;
  filePath: string | null;
  externalUrl: string | null;
  version: string;
  effectiveDate: string | null;
  isMandatory: boolean;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  operation: string;
  userId: string;
  ipAddress: string;
  oldValues: string | null;
  newValues: string | null;
  changedFields: string[];
  integrityStatus: string;
  createdAt: string;
}

interface AuditSummary {
  totalOperations: number;
  operationsByType: string;
  operationsByEntity: string;
  integrityIssues: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TABS = [
  { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
  { id: 'library', name: 'Biblioteca Legal', icon: DocumentTextIcon },
  { id: 'forensic', name: 'Auditoría Forense', icon: MagnifyingGlassIcon }
] as const;

type TabId = typeof TABS[number]['id'];

const JURISDICTION_FLAGS: Record<string, string> = {
  'EU': '🇪🇺',
  'AR': '🇦🇷',
  'US': '🇺🇸',
  'ES': '🇪🇸',
  'GLOBAL': '🌍'
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'DATA_PRIVACY': LockClosedIcon,
  'DATA_CONSENT': LockClosedIcon,
  'SECURITY': ShieldCheckIcon,
  'PATIENT_RIGHTS': UserGroupIcon,
  'RETENTION': ArchiveBoxIcon
};

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'CRITICAL': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  'HIGH': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  'MEDIUM': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  'LOW': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' }
};

const OPERATION_COLORS: Record<string, string> = {
  'CREATE': 'text-green-400',
  'UPDATE': 'text-blue-400',
  'DELETE_SOFT': 'text-yellow-400',
  'DELETE_HARD': 'text-red-400'
};

// ============================================================================
// CIRCULAR SCORE COMPONENT
// ============================================================================

const CircularScore: React.FC<{ score: number; size?: number }> = ({ score, size = 200 }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  
  const getScoreColor = () => {
    if (score >= 90) return '#10B981'; // green
    if (score >= 70) return '#F59E0B'; // yellow
    if (score >= 50) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getScoreColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-white">{score}%</span>
        <span className="text-sm text-slate-400 mt-1">Compliance Score</span>
      </div>
    </div>
  );
};

// ============================================================================
// RISK MAP COMPONENT
// ============================================================================

const RiskMap: React.FC<{ breakdown: ComplianceScore['breakdown'] }> = ({ breakdown }) => {
  const areas = [
    { key: 'dataPrivacy', name: 'Privacidad de Datos', score: breakdown.dataPrivacy, icon: LockClosedIcon },
    { key: 'security', name: 'Seguridad', score: breakdown.security, icon: ShieldCheckIcon },
    { key: 'patientRights', name: 'Derechos del Paciente', score: breakdown.patientRights, icon: UserGroupIcon },
    { key: 'retention', name: 'Retención', score: breakdown.retention, icon: ArchiveBoxIcon }
  ];

  const getStatusColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusText = (score: number) => {
    if (score >= 90) return 'Óptimo';
    if (score >= 70) return 'Aceptable';
    if (score >= 50) return 'Riesgo';
    return 'Crítico';
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {areas.map(area => (
        <div
          key={area.key}
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/30 transition-colors"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${getStatusColor(area.score)}/20`}>
              <area.icon className={`w-5 h-5 ${getStatusColor(area.score).replace('bg-', 'text-')}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{area.name}</p>
              <p className="text-xs text-slate-400">{getStatusText(area.score)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getStatusColor(area.score)}`}
                style={{ width: `${area.score}%` }}
              />
            </div>
            <span className="text-sm font-medium text-white w-12 text-right">{area.score}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// ISSUES SUMMARY COMPONENT
// ============================================================================

const IssuesSummary: React.FC<{ score: ComplianceScore }> = ({ score }) => {
  const issues = [
    { label: 'Críticos', count: score.criticalIssues, color: 'text-red-400', bg: 'bg-red-500/20' },
    { label: 'Altos', count: score.highIssues, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    { label: 'Medios', count: score.mediumIssues, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { label: 'Bajos', count: score.lowIssues, color: 'text-blue-400', bg: 'bg-blue-500/20' }
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {issues.map(issue => (
        <div
          key={issue.label}
          className={`${issue.bg} border ${issue.color.replace('text-', 'border-')}/30 rounded-lg p-4 text-center`}
        >
          <p className={`text-3xl font-bold ${issue.color}`}>{issue.count}</p>
          <p className="text-sm text-slate-400 mt-1">{issue.label}</p>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// DOCUMENT CARD COMPONENT
// ============================================================================

const DocumentCard: React.FC<{
  doc: LegalDocument;
  onView: () => void;
  onDownload: () => void;
}> = ({ doc, onView, onDownload }) => {
  const CategoryIcon = CATEGORY_ICONS[doc.category] || DocumentTextIcon;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:border-cyan-500/30 transition-all hover:shadow-lg hover:shadow-cyan-500/5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <CategoryIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <span className="text-lg mr-2">{JURISDICTION_FLAGS[doc.jurisdiction] || '📄'}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              doc.isMandatory ? 'bg-red-500/20 text-red-400' : 'bg-slate-600 text-slate-300'
            }`}>
              {doc.isMandatory ? 'Obligatorio' : 'Opcional'}
            </span>
          </div>
        </div>
        <span className="text-xs text-slate-500">v{doc.version}</span>
      </div>
      
      <h3 className="text-white font-medium mb-2">{doc.title}</h3>
      <p className="text-sm text-slate-400 mb-4 line-clamp-2">{doc.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">
          {doc.effectiveDate && `Vigente: ${new Date(doc.effectiveDate).toLocaleDateString('es')}`}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            title="Ver documento"
          >
            <EyeIcon className="w-4 h-4 text-slate-300" />
          </button>
          {doc.isTemplate && (
            <button
              onClick={onDownload}
              className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition-colors"
              title="Descargar plantilla"
            >
              <ArrowDownTrayIcon className="w-4 h-4 text-cyan-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// AUDIT LOG ROW COMPONENT
// ============================================================================

const AuditLogRow: React.FC<{ log: AuditLog }> = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="border-b border-slate-700 last:border-0">
      <div
        className="flex items-center gap-4 py-3 px-4 hover:bg-slate-800/50 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`font-mono text-sm ${OPERATION_COLORS[log.operation] || 'text-slate-400'}`}>
          {log.operation}
        </span>
        <span className="text-sm text-slate-300 flex-1">{log.entityType}</span>
        <span className="text-xs text-slate-500 font-mono truncate max-w-[150px]">{log.entityId}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          log.integrityStatus === 'VALID' ? 'bg-green-500/20 text-green-400' :
          log.integrityStatus === 'FAILED' ? 'bg-red-500/20 text-red-400' :
          'bg-yellow-500/20 text-yellow-400'
        }`}>
          {log.integrityStatus}
        </span>
        <span className="text-xs text-slate-500">
          {new Date(log.createdAt).toLocaleString('es')}
        </span>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 bg-slate-900/50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Usuario / IP</p>
              <p className="text-slate-300 font-mono">{log.userId || 'N/A'} • {log.ipAddress}</p>
            </div>
            {log.changedFields && log.changedFields.length > 0 && (
              <div>
                <p className="text-slate-500 mb-1">Campos modificados</p>
                <p className="text-cyan-400">{log.changedFields.join(', ')}</p>
              </div>
            )}
          </div>
          {log.oldValues && (
            <div className="mt-3">
              <p className="text-slate-500 mb-1 text-xs">Valores anteriores</p>
              <pre className="text-xs bg-slate-800 p-2 rounded text-slate-400 overflow-x-auto">
                {log.oldValues}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LOGS_PER_PAGE = 25;

const CompliancePageV4: React.FC = () => {
  l.info('Rendering CompliancePageV4');
  
  // State
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [jurisdiction, setJurisdiction] = useState<string>('');
  const [documentCategory, setDocumentCategory] = useState<string>('');
  const [auditEntityType, setAuditEntityType] = useState<string>('');
  const [auditOperation, setAuditOperation] = useState<string>('');
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);
  const [auditPage, setAuditPage] = useState<number>(0); // Paginación

  // Queries
  const { data: scoreData, loading: scoreLoading } = useQuery<{ complianceScoreV4: ComplianceScore }>(GET_COMPLIANCE_SCORE_V4, {
    variables: { jurisdiction: jurisdiction || undefined }
  });

  const { data: docsData, loading: docsLoading } = useQuery<{ legalDocumentsV4: LegalDocument[] }>(GET_LEGAL_DOCUMENTS_V4, {
    variables: { 
      jurisdiction: jurisdiction || undefined,
      category: documentCategory || undefined
    }
  });

  const { data: auditData, loading: auditLoading } = useQuery<{ auditLogsV4: AuditLog[] }>(GET_AUDIT_LOGS_V4, {
    variables: {
      entityType: auditEntityType || undefined,
      operation: auditOperation || undefined,
      limit: LOGS_PER_PAGE,
      offset: auditPage * LOGS_PER_PAGE
    }
  });

  const { data: summaryData } = useQuery<{ auditSummaryV4: AuditSummary }>(GET_AUDIT_SUMMARY_V4, {
    variables: { days: 30 }
  });

  // ⚡ IGNITION MUTATIONS
  const [seedDefaults, { loading: seeding }] = useMutation(SEED_COMPLIANCE_DEFAULTS, {
    refetchQueries: [GET_COMPLIANCE_SCORE_V4, GET_LEGAL_DOCUMENTS_V4],
    onCompleted: (data: { seedComplianceDefaults: { message: string } }) => {
      l.info('⚡ Seed completed:', data.seedComplianceDefaults.message);
    }
  });

  const [runCheck, { loading: checking }] = useMutation(RUN_COMPLIANCE_CHECK, {
    variables: { jurisdiction: jurisdiction || undefined },
    refetchQueries: [GET_COMPLIANCE_SCORE_V4],
    onCompleted: (data: { runComplianceCheck: { message: string } }) => {
      l.info('✅ Check completed:', data.runComplianceCheck.message);
    }
  });

  // Processed data
  const score = scoreData?.complianceScoreV4;
  const documents = docsData?.legalDocumentsV4 || [];
  const auditLogs = auditData?.auditLogsV4 || [];
  const auditSummary = summaryData?.auditSummaryV4;
  
  // Check if system needs initialization
  const needsInitialization = !scoreLoading && (!score || score.totalRules === 0);

  // Handlers
  const handleIgnition = async () => {
    await seedDefaults();
    await runCheck();
  };

  const handleDownloadDocument = (doc: LegalDocument) => {
    if (doc.contentMarkdown) {
      const blob = new Blob([doc.contentMarkdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.code}_${doc.version}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <StaffGuard>
      <div className="flex flex-col h-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
              <ShieldCheckIcon className="w-10 h-10 text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white">Pentágono Legal</h1>
                <p className="text-purple-200">Centro de Mando de Compliance • AI Act 2026 Ready</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Fixed */}
        <div className="flex-shrink-0 bg-slate-800/50 border-b border-slate-700 z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="max-w-7xl mx-auto px-6 py-8">
          {/* ================================================================ */}
          {/* TAB 1: DASHBOARD */}
          {/* ================================================================ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {scoreLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" />
                </div>
              ) : score ? (
                <>
                  {/* Jurisdiction Selector */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-slate-400">Jurisdicción:</label>
                    <select
                      value={jurisdiction}
                      onChange={e => setJurisdiction(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Todas</option>
                      <option value="EU">🇪🇺 Unión Europea (GDPR)</option>
                      <option value="AR">🇦🇷 Argentina (Ley 25.326)</option>
                      <option value="US">🇺🇸 Estados Unidos (HIPAA)</option>
                    </select>
                    <span className="text-xs text-slate-500">
                      Calculado: {new Date(score.calculatedAt).toLocaleString('es')}
                    </span>
                  </div>

                  {/* Score + Issues */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Circular Score */}
                    <div className="flex flex-col items-center justify-center bg-slate-950/30 backdrop-blur border border-white/5 rounded-2xl p-8">
                      <CircularScore score={score.overallScore} />
                      <div className="mt-6 text-center">
                        <p className="text-slate-400">
                          <span className="text-green-400 font-medium">{score.rulesPassed}</span> de{' '}
                          <span className="text-white font-medium">{score.totalRules}</span> reglas cumplidas
                        </p>
                      </div>
                    </div>

                    {/* Risk Map */}
                    <div className="lg:col-span-2 bg-slate-950/30 backdrop-blur border border-white/5 rounded-2xl p-6">
                      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <GlobeAltIcon className="w-5 h-5 text-cyan-400" />
                        Mapa de Riesgo
                      </h2>
                      <RiskMap breakdown={score.breakdown} />
                    </div>
                  </div>

                  {/* Issues Summary */}
                  <div className="bg-slate-950/30 backdrop-blur border border-white/5 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                      Resumen de Incidencias
                    </h2>
                    <IssuesSummary score={score} />
                  </div>

                  {/* Checks Detail */}
                  <div className="bg-slate-950/30 backdrop-blur border border-white/5 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                      Detalle de Verificaciones ({score.checks.length})
                    </h2>
                    <div className="space-y-2">
                      {score.checks.map(check => {
                        const severityStyle = SEVERITY_COLORS[check.severity] || SEVERITY_COLORS.MEDIUM;
                        return (
                          <div
                            key={check.ruleId}
                            className={`flex items-center gap-4 p-4 rounded-lg border ${
                              check.passed
                                ? 'bg-green-500/5 border-green-500/20'
                                : `${severityStyle.bg} ${severityStyle.border}`
                            }`}
                          >
                            {check.passed ? (
                              <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                            ) : (
                              <XCircleIcon className={`w-5 h-5 ${severityStyle.text} flex-shrink-0`} />
                            )}
                            <div className="flex-1">
                              <p className="text-white font-medium">{check.ruleName}</p>
                              <p className="text-xs text-slate-500">{check.ruleCode}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${severityStyle.bg} ${severityStyle.text}`}>
                              {check.severity}
                            </span>
                            <span className="text-sm text-slate-400">
                              Peso: {check.weight}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-slate-950/30 backdrop-blur border border-white/5 rounded-2xl p-12 max-w-lg mx-auto">
                    <ShieldCheckIcon className="w-20 h-20 text-purple-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-3">Sistema Legal Sin Inicializar</h3>
                    <p className="text-slate-400 mb-8">
                      El Pentágono Legal requiere configuración inicial. 
                      Este proceso cargará las reglas GDPR, Ley 25.326 y documentos legales base.
                    </p>
                    <button
                      onClick={handleIgnition}
                      disabled={seeding || checking}
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 
                                 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/25
                                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                    >
                      {seeding || checking ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                          {seeding ? 'Cargando reglas...' : 'Calculando score...'}
                        </>
                      ) : (
                        <>
                          ⚡ Inicializar Sistema Legal
                        </>
                      )}
                    </button>
                    <p className="text-xs text-slate-500 mt-4">
                      AI Act 2026 Ready • GDPR • Ley 25.326
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: BIBLIOTECA LEGAL */}
          {/* ================================================================ */}
          {activeTab === 'library' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <select
                  value={jurisdiction}
                  onChange={e => setJurisdiction(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Todas las jurisdicciones</option>
                  <option value="EU">🇪🇺 Unión Europea</option>
                  <option value="AR">🇦🇷 Argentina</option>
                  <option value="US">🇺🇸 Estados Unidos</option>
                  <option value="GLOBAL">🌍 Global</option>
                </select>
                <select
                  value={documentCategory}
                  onChange={e => setDocumentCategory(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Todas las categorías</option>
                  <option value="DATA_PRIVACY">🔒 Privacidad de Datos</option>
                  <option value="DATA_CONSENT">✍️ Consentimiento</option>
                  <option value="SECURITY">🛡️ Seguridad</option>
                  <option value="PATIENT_RIGHTS">👥 Derechos del Paciente</option>
                  <option value="RETENTION">📦 Retención</option>
                </select>
              </div>

              {/* Documents Grid */}
              {docsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" />
                </div>
              ) : documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map(doc => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      onView={() => setSelectedDoc(doc)}
                      onDownload={() => handleDownloadDocument(doc)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <DocumentTextIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">Sin documentos legales</h3>
                  <p className="text-slate-400">Ejecuta la migración del Pentágono Legal primero</p>
                </div>
              )}

              {/* Document Preview Modal */}
              {selectedDoc && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
                  onClick={() => setSelectedDoc(null)}
                >
                  <div
                    className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedDoc.title}</h2>
                        <p className="text-sm text-slate-400">{selectedDoc.code} • v{selectedDoc.version}</p>
                      </div>
                      <button
                        onClick={() => setSelectedDoc(null)}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <XCircleIcon className="w-6 h-6 text-slate-400" />
                      </button>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                      {selectedDoc.contentMarkdown ? (
                        <pre className="whitespace-pre-wrap text-slate-300 font-sans text-sm leading-relaxed">
                          {selectedDoc.contentMarkdown}
                        </pre>
                      ) : selectedDoc.externalUrl ? (
                        <a
                          href={selectedDoc.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline"
                        >
                          Ver documento externo →
                        </a>
                      ) : (
                        <p className="text-slate-500 italic">Sin contenido disponible</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: AUDITORÍA FORENSE */}
          {/* ================================================================ */}
          {activeTab === 'forensic' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              {auditSummary && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <p className="text-3xl font-bold text-white">{auditSummary.totalOperations}</p>
                    <p className="text-sm text-slate-400">Operaciones (30 días)</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <p className="text-3xl font-bold text-yellow-400">{auditSummary.integrityIssues}</p>
                    <p className="text-sm text-slate-400">Incidencias de integridad</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <p className="text-3xl font-bold text-cyan-400">
                      {auditSummary.totalOperations > 0
                        ? ((1 - auditSummary.integrityIssues / auditSummary.totalOperations) * 100).toFixed(1)
                        : 100}%
                    </p>
                    <p className="text-sm text-slate-400">Integridad</p>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <FunnelIcon className="w-5 h-5 text-slate-400" />
                <select
                  value={auditEntityType}
                  onChange={e => { setAuditEntityType(e.target.value); setAuditPage(0); }}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Todas las entidades</option>
                  <option value="Patient">👤 Pacientes</option>
                  <option value="MedicalRecordV3">📋 Historia Clínica</option>
                  <option value="DocumentV3">📄 Documentos</option>
                  <option value="AppointmentV3">📅 Citas</option>
                  <option value="BillingDataV3">💳 Facturación</option>
                </select>
                <select
                  value={auditOperation}
                  onChange={e => { setAuditOperation(e.target.value); setAuditPage(0); }}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Todas las operaciones</option>
                  <option value="CREATE">➕ Creaciones</option>
                  <option value="UPDATE">✏️ Modificaciones</option>
                  <option value="DELETE_SOFT">🗑️ Borrados lógicos</option>
                  <option value="DELETE_HARD">❌ Borrados permanentes</option>
                </select>
              </div>

              {/* Audit Logs Table */}
              <div className="bg-slate-950/30 backdrop-blur border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-cyan-400" />
                    Registro de Auditoría
                  </h2>
                  {/* Pagination Info */}
                  <span className="text-sm text-slate-400">
                    Página {auditPage + 1} • {LOGS_PER_PAGE} por página
                  </span>
                </div>
                
                {auditLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" />
                  </div>
                ) : auditLogs.length > 0 ? (
                  <div className="divide-y divide-slate-700/50">
                    {auditLogs.map(log => (
                      <AuditLogRow key={log.id} log={log} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <MagnifyingGlassIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">Sin registros</h3>
                    <p className="text-slate-400">No hay logs de auditoría para los filtros seleccionados</p>
                  </div>
                )}

                {/* Pagination Controls */}
                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => setAuditPage(p => Math.max(0, p - 1))}
                    disabled={auditPage === 0}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    ← Anterior
                  </button>
                  <span className="text-slate-400">
                    Mostrando {auditLogs.length} registros
                  </span>
                  <button
                    onClick={() => setAuditPage(p => p + 1)}
                    disabled={auditLogs.length < LOGS_PER_PAGE}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </StaffGuard>
  );
};

export default CompliancePageV4;
