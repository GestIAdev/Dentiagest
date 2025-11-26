/**
 * 🎮 DASHBOARD V4 - TORRE DE CONTROL CYBERPUNK
 * ============================================
 * By PunkClaude & GeminiPunk - November 2025
 * 
 * AXIOMAS:
 * - ZERO SCROLL: Todo cabe en 1080p (h-full)
 * - BENTO GRID: Cards organizadas en layout 3 columnas
 * - TABS: Comando (default), Finanzas, Clínica
 * 
 * 🔥 WAR ROOM ACTIVATED - Real-Time Selene Integration
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../context/AuthContext';
import { useWeb3Store } from '../stores/web3Store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import PatientFormSheet from '../components/Forms/PatientFormSheet';
import {
  GET_PENDING_SUGGESTIONS,
  APPROVE_SUGGESTION,
  REJECT_SUGGESTION,
  getUrgencyFromScore,
  POLL_INTERVAL,
  type AppointmentSuggestion,
  type GetPendingSuggestionsData,
  type GetPendingSuggestionsVars,
  type ApproveSuggestionVars,
  type RejectSuggestionVars
} from '../graphql/queries/dashboard';

// ============================================================================
// TYPES
// ============================================================================

interface SeleneRequest {
  id: string;
  patientName: string;
  requestType: 'appointment' | 'prescription' | 'document';
  timestamp: Date;
  urgency: 'low' | 'medium' | 'high';
  details: string;
  confidenceScore?: number; // Para el tooltip de score
}

// ============================================================================
// 🔄 DATA TRANSFORMER: AppointmentSuggestion → SeleneRequest
// ============================================================================

/**
 * Transforma los datos de GraphQL al formato que espera la UI.
 * Mantiene compatibilidad con el componente SeleneRequestItem existente.
 */
function transformSuggestionToRequest(suggestion: AppointmentSuggestion): SeleneRequest {
  const patientName = suggestion.patient 
    ? `${suggestion.patient.firstName} ${suggestion.patient.lastName}`.trim()
    : `Paciente #${suggestion.patient_id}`;

  return {
    id: suggestion.id,
    patientName,
    requestType: 'appointment', // Por ahora solo manejamos citas desde Selene
    timestamp: new Date(suggestion.created_at),
    urgency: getUrgencyFromScore(suggestion.confidence_score),
    details: suggestion.patient_request || suggestion.reasoning || 'Solicitud de cita vía Selene',
    confidenceScore: suggestion.confidence_score
  };
}

// ============================================================================
// MOCK DATA (Solo para stats - TODO: conectar con métricas reales)
// ============================================================================

const MOCK_TODAY_STATS = {
  totalAppointments: 8,
  completedAppointments: 3,
  estimatedRevenue: 2450,
  newPatients: 2
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// 🎯 Status Badge animado para solicitudes pendientes
const StatusBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) return null;
  
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-purple-500/40 rounded-lg shadow-lg shadow-purple-500/20">
      <span className="text-2xl">⚠️</span>
      <span className="text-amber-300 font-bold text-lg">
        {count} Solicitud{count !== 1 ? 'es' : ''} de Selene
      </span>
    </div>
  );
};

// 💰 KPI Card Component
const KPICard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
}> = ({ title, value, subtitle, icon, trend }) => (
  <Card className="bg-slate-900/40 backdrop-blur-md border-purple-500/20 shadow-lg shadow-purple-500/10">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      {trend && (
        <div className={`mt-2 text-xs ${
          trend === 'up' ? 'text-emerald-400' : 
          trend === 'down' ? 'text-red-400' : 'text-slate-400'
        }`}>
          {trend === 'up' ? '↑ +12%' : trend === 'down' ? '↓ -5%' : '→ Sin cambios'}
        </div>
      )}
    </CardContent>
  </Card>
);

// 🔗 Web3 Balance Card (Treasury + Hot Wallet)
const Web3BalanceCard: React.FC = () => {
  const { 
    treasuryBalance, 
    hotWalletBalance,
    hotWalletEth,
    isLoadingMetrics,
    metricsError,
    fetchTreasuryMetrics
  } = useWeb3Store();

  const [showDetails, setShowDetails] = React.useState(false);

  // Fetch metrics on mount
  React.useEffect(() => {
    fetchTreasuryMetrics();
  }, [fetchTreasuryMetrics]);
  
  return (
    <Card className="bg-slate-900/40 backdrop-blur-md border-purple-500/20 shadow-lg shadow-purple-500/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
          <span className="text-lg">🔗</span> Web3 Treasury
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingMetrics ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-slate-400">Cargando...</span>
          </div>
        ) : metricsError ? (
          <div>
            <p className="text-red-400 text-sm mb-2">⚠️ Error: {metricsError}</p>
            <Button
              size="sm"
              onClick={fetchTreasuryMetrics}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs"
            >
              🔄 Reintentar
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-emerald-400">On-Chain</p>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-slate-500 text-xs">Treasury Balance</p>
                <p className="text-lg font-bold text-cyan-300">{treasuryBalance}</p>
              </div>

              {showDetails && (
                <div className="space-y-2 pt-2 border-t border-slate-700/50">
                  <div>
                    <p className="text-slate-500 text-xs">Hot Wallet (DENTIA)</p>
                    <p className="text-lg font-bold text-amber-300">{hotWalletBalance}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Hot Wallet (Gas)</p>
                    <p className="text-lg font-bold text-purple-300">{hotWalletEth}</p>
                  </div>
                </div>
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="mt-3 w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 text-xs"
            >
              {showDetails ? '▼ Menos' : '▶ Ver Hot Wallet'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// 📋 Selene Request Item
const SeleneRequestItem: React.FC<{
  request: SeleneRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing?: boolean;
}> = ({ request, onApprove, onReject, isProcessing = false }) => {
  const urgencyColors = {
    high: 'border-l-red-500 bg-red-500/5',
    medium: 'border-l-amber-500 bg-amber-500/5',
    low: 'border-l-slate-500 bg-slate-500/5'
  };

  const urgencyLabels = {
    high: '🔴 Urgente',
    medium: '🟡 Moderado',
    low: '🔵 Normal'
  };

  const typeIcons = {
    appointment: '📅',
    prescription: '💊',
    document: '📄'
  };

  return (
    <div className={`border-l-4 ${urgencyColors[request.urgency]} rounded-r-lg p-3 mb-2 ${isProcessing ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span>{typeIcons[request.requestType]}</span>
            <span className="font-semibold text-white truncate">{request.patientName}</span>
            {/* Score badge */}
            {request.confidenceScore !== undefined && (
              <span 
                className={`text-xs px-1.5 py-0.5 rounded ${
                  request.urgency === 'high' ? 'bg-red-500/20 text-red-300' :
                  request.urgency === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-slate-500/20 text-slate-300'
                }`}
                title={urgencyLabels[request.urgency]}
              >
                {request.confidenceScore.toFixed(1)}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{request.details}</p>
          <p className="text-xs text-slate-500 mt-1">
            {request.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <Button
            size="sm"
            onClick={() => onApprove(request.id)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 h-7"
            disabled={isProcessing}
          >
            {isProcessing ? '⏳' : '✓'} Aprobar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReject(request.id)}
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs px-3 h-7"
            disabled={isProcessing}
          >
            ✕ Rechazar
          </Button>
        </div>
      </div>
    </div>
  );
};

// 🎯 Quick Action Button - Piano Neón
const QuickActionButton: React.FC<{
  icon: string;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'accent';
}> = ({ icon, label, onClick, variant = 'default' }) => (
  <Button
    onClick={onClick}
    className={`w-full h-16 flex items-center justify-start gap-4 px-6 text-base font-semibold transition-all ${
      variant === 'accent'
        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/40 hover:to-purple-500/40 border-purple-500/50 text-cyan-300 shadow-lg shadow-purple-500/20'
        : 'bg-slate-800/40 hover:bg-slate-700/40 border-purple-500/20 text-slate-200 hover:border-purple-500/40'
    } border backdrop-blur`}
    variant="outline"
  >
    <span className="text-2xl shrink-0">{icon}</span>
    <span className="text-left">{label}</span>
  </Button>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const DashboardPageV4: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string | null }>({ 
    open: false, 
    id: null 
  });
  const [rejectReason, setRejectReason] = useState('');

  // 🔥 WAR ROOM: Real-time GraphQL Query con polling
  const { 
    data: suggestionsData, 
    loading: suggestionsLoading, 
    error: suggestionsError,
    refetch: refetchSuggestions 
  } = useQuery<GetPendingSuggestionsData, GetPendingSuggestionsVars>(
    GET_PENDING_SUGGESTIONS,
    {
      pollInterval: POLL_INTERVAL, // 5 segundos para near real-time
      fetchPolicy: 'network-only'  // Siempre fresco, nunca cache
    }
  );

  // 🎬 Mutations para aprobar/rechazar
  const [approveSuggestion, { loading: approving }] = useMutation<unknown, ApproveSuggestionVars>(
    APPROVE_SUGGESTION,
    {
      onCompleted: () => {
        console.log('✅ Cita creada exitosamente desde sugerencia');
        refetchSuggestions();
      },
      onError: (error) => {
        console.error('❌ Error al aprobar sugerencia:', error);
        alert(`Error al aprobar: ${error.message}`);
      }
    }
  );

  const [rejectSuggestion, { loading: rejecting }] = useMutation<unknown, RejectSuggestionVars>(
    REJECT_SUGGESTION,
    {
      onCompleted: () => {
        console.log('❌ Sugerencia rechazada');
        setRejectModal({ open: false, id: null });
        setRejectReason('');
        refetchSuggestions();
      },
      onError: (error) => {
        console.error('❌ Error al rechazar sugerencia:', error);
        alert(`Error al rechazar: ${error.message}`);
      }
    }
  );

  // 🔄 Transform GraphQL data → UI format
  const requests: SeleneRequest[] = React.useMemo(() => {
    if (!suggestionsData?.appointmentSuggestionsV3) return [];
    return suggestionsData.appointmentSuggestionsV3.map(transformSuggestionToRequest);
  }, [suggestionsData]);

  // Handlers para solicitudes
  const handleApprove = async (id: string) => {
    console.log('✅ Aprobando solicitud:', id);
    await approveSuggestion({
      variables: {
        suggestionId: id
        // adjustments pueden añadirse después si queremos permitir editar antes de aprobar
      }
    });
  };

  const handleReject = (id: string) => {
    // Abrir modal para capturar razón
    setRejectModal({ open: true, id });
  };

  const confirmReject = async () => {
    if (!rejectModal.id || !rejectReason.trim()) {
      alert('Por favor, indica una razón para rechazar la solicitud');
      return;
    }
    
    await rejectSuggestion({
      variables: {
        suggestionId: rejectModal.id,
        reason: rejectReason.trim()
      }
    });
  };

  // Greeting basado en hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Buenos días';
    if (hour < 19) return '☀️ Buenas tardes';
    return '🌙 Buenas noches';
  };

  const userName = state.user?.firstName || state.user?.email?.split('@')[0] || 'Doctor';

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-900 via-purple-900/80 to-violet-900/60 overflow-hidden">
      {/* 🔥 REJECT MODAL */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-lg p-6 max-w-md w-full shadow-2xl shadow-red-500/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>❌</span> Rechazar Solicitud
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Indica la razón del rechazo (obligatorio)..."
              className="w-full h-24 bg-slate-800 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:border-red-500 focus:outline-none resize-none"
            />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => {
                  setRejectModal({ open: false, id: null });
                  setRejectReason('');
                }}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                disabled={rejecting}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmReject}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white"
                disabled={rejecting || !rejectReason.trim()}
              >
                {rejecting ? '⏳ Rechazando...' : '✕ Confirmar Rechazo'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* HEADER - HUD INTEGRADO */}
      {/* ================================================================== */}
      <header className="flex items-center justify-between px-6 py-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            {getGreeting()}, <span className="text-cyan-300">{userName}</span>
          </h1>
          <p className="text-slate-400 text-sm">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <StatusBadge count={requests.length} />
      </header>

      {/* ================================================================== */}
      {/* TABS - COMANDO / FINANZAS / CLÍNICA */}
      {/* ================================================================== */}
      <Tabs defaultValue="comando" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-slate-900/50 border border-purple-500/30 p-1 shrink-0 mx-auto">
          <TabsTrigger 
            value="comando" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25"
          >
            🎮 Comando
          </TabsTrigger>
          <TabsTrigger 
            value="finanzas"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25"
          >
            💰 Finanzas
          </TabsTrigger>
          <TabsTrigger 
            value="clinica"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-pink-500/25"
          >
            🏥 Clínica
          </TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* TAB: COMANDO (DEFAULT) */}
        {/* ============================================================== */}
        <TabsContent value="comando" className="flex-1 mt-4 min-h-0 px-6 pb-6">
          <div className="grid grid-cols-12 gap-4 h-full">
            
            {/* COLUMNA 1: ESTADO (3 cols) */}
            <div className="col-span-3 flex flex-col gap-4">
              <KPICard 
                title="Ingresos Hoy"
                value={`$${MOCK_TODAY_STATS.estimatedRevenue.toLocaleString()}`}
                subtitle="vs $2,100 ayer"
                icon="💵"
                trend="up"
              />
              <KPICard 
                title="Citas del Día"
                value={`${MOCK_TODAY_STATS.completedAppointments}/${MOCK_TODAY_STATS.totalAppointments}`}
                subtitle={`${MOCK_TODAY_STATS.totalAppointments - MOCK_TODAY_STATS.completedAppointments} pendientes`}
                icon="📅"
                trend="neutral"
              />
              <Web3BalanceCard />
            </div>

            {/* COLUMNA 2: WAR ROOM (6 cols) */}
            <div className="col-span-6">
              <Card className="bg-slate-900/40 backdrop-blur-md border-purple-500/20 shadow-lg shadow-purple-500/10 h-full flex flex-col">
                <CardHeader className="pb-3 shrink-0">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-white">
                      <span className="text-xl">📡</span>
                      Solicitudes Entrantes
                      {/* 🔥 Indicador de real-time */}
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" title="Actualizando cada 5s"></span>
                    </span>
                    {!suggestionsLoading && requests.length > 0 && (
                      <span className="bg-amber-500/20 text-amber-400 text-sm px-2 py-1 rounded">
                        {requests.length} pendiente{requests.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                  {/* 🔄 Estado de carga */}
                  {suggestionsLoading && requests.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-slate-400">Conectando con Selene...</p>
                    </div>
                  ) : suggestionsError ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-6xl mb-4">⚠️</span>
                      <p className="text-xl font-semibold text-red-400">
                        Error de conexión
                      </p>
                      <p className="text-slate-500 mt-2 text-sm max-w-xs">
                        {suggestionsError.message}
                      </p>
                      <Button
                        onClick={() => refetchSuggestions()}
                        className="mt-4 bg-cyan-600 hover:bg-cyan-500"
                        size="sm"
                      >
                        🔄 Reintentar
                      </Button>
                    </div>
                  ) : requests.length > 0 ? (
                    <div className="space-y-2">
                      {requests.map(request => (
                        <SeleneRequestItem
                          key={request.id}
                          request={request}
                          onApprove={handleApprove}
                          onReject={handleReject}
                          isProcessing={approving || rejecting}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-6xl mb-4">🧘</span>
                      <p className="text-xl font-semibold text-emerald-400">
                        ✅ Todo despejado
                      </p>
                      <p className="text-slate-500 mt-2">
                        No hay solicitudes pendientes de Selene
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* COLUMNA 3: QUICK ACTIONS (3 cols) - LISTA VERTICAL */}
            <div className="col-span-3 flex flex-col gap-2">
              <QuickActionButton
                icon="👤"
                label="+ Paciente Nuevo"
                onClick={() => setIsPatientFormOpen(true)}
                variant="accent"
              />
              <QuickActionButton
                icon="📅"
                label="+ Cita"
                onClick={() => navigate('/appointments')}
              />
              <QuickActionButton
                icon="💰"
                label="Cobrar / Facturación"
                onClick={() => navigate('/billing')}
              />
              <QuickActionButton
                icon="📦"
                label="Gestionar Stock"
                onClick={() => navigate('/inventory')}
              />
            </div>
          </div>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB: FINANZAS */}
        {/* ============================================================== */}
        <TabsContent value="finanzas" className="flex-1 mt-4 px-6 pb-6">
          <Card className="bg-slate-900/40 backdrop-blur-md border-purple-500/20 shadow-lg shadow-purple-500/10 h-full flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl">💰</span>
              <h2 className="text-2xl font-bold text-white mt-4">Panel Financiero</h2>
              <p className="text-slate-400 mt-2">Próximamente: Métricas, gráficos y reportes</p>
            </div>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB: CLÍNICA */}
        {/* ============================================================== */}
        <TabsContent value="clinica" className="flex-1 mt-4 px-6 pb-6">
          <Card className="bg-slate-900/40 backdrop-blur-md border-purple-500/20 shadow-lg shadow-purple-500/10 h-full flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl">🏥</span>
              <h2 className="text-2xl font-bold text-white mt-4">Panel Clínico</h2>
              <p className="text-slate-400 mt-2">Próximamente: Ocupación, recursos y estadísticas</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ================================================================== */}
      {/* SHEET: NUEVO PACIENTE */}
      {/* ================================================================== */}
      <PatientFormSheet
        isOpen={isPatientFormOpen}
        onClose={() => setIsPatientFormOpen(false)}
        patient={null}
        onSave={() => {
          setIsPatientFormOpen(false);
          console.log('✅ Paciente creado desde Dashboard');
        }}
      />
    </div>
  );
};

export default DashboardPageV4;
