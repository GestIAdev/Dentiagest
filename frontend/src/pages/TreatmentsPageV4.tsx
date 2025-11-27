/**
 * 🦷🎸💀 TREATMENTS PAGE V4 - QUIRÓFANO DIGITAL
 * ================================================
 * By PunkClaude & GeminiPunk - November 2025
 * 
 * AXIOMAS:
 * - FULL BLEED: h-full w-full flex flex-col
 * - TABS: Planificación, Odontograma, Estética IA
 * - NO 3D OBJ: SVG 2D supremacy
 * - NO MOCKS: Mutations reales conectadas
 */

import React, { useState } from 'react';
import { useQuery, useSubscription } from '@apollo/client/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { GET_TREATMENTS_V3, TREATMENT_V3_UPDATED, Treatment } from '../graphql/queries/treatments';
import TreatmentFormSheet from '../components/Forms/TreatmentFormSheet';
import OdontogramV4 from '../components/Treatments/OdontogramV4';
import { PlusIcon, PencilIcon, CalendarIcon } from '@heroicons/react/24/outline';

// ============================================================================
// TYPES
// ============================================================================

interface TreatmentRow {
  id: string;
  patientId: string;
  patientName?: string;
  toothNumber?: number;
  treatmentType: string;
  description: string;
  status: string;
  cost: number;
  startDate: string;
  createdAt: string;
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    'PLANNING': { label: 'Planificado', className: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    'IN_PROGRESS': { label: 'En Progreso', className: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    'COMPLETED': { label: 'Completado', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    'CANCELLED': { label: 'Cancelado', className: 'bg-red-500/20 text-red-300 border-red-500/30' },
    'ON_HOLD': { label: 'En Espera', className: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
    'pending': { label: 'Pendiente', className: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
    'active': { label: 'Activo', className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    'completed': { label: 'Completado', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };

  return (
    <Badge variant="outline" className={`${config.className} border`}>
      {config.label}
    </Badge>
  );
};

// ============================================================================
// TREATMENT TYPE BADGE
// ============================================================================

const TreatmentTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const typeIcons: Record<string, string> = {
    'LIMPIEZA_DENTAL': '🪥',
    'EXTRACCION': '🦷',
    'ENDODONCIA': '💉',
    'IMPLANTE': '🔩',
    'CORONA': '👑',
    'PUENTE': '🌉',
    'ORTODONCIA': '🦷',
    'BLANQUEAMIENTO': '✨',
    'PERIODONCIA': '🩺',
    'PROTESIS': '🦴',
    'CONSULTA': '📋',
    'EMERGENCIA': '🚨',
    'general': '🦷',
  };

  const icon = typeIcons[type] || '🦷';
  const label = type.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());

  return (
    <span className="flex items-center gap-2">
      <span>{icon}</span>
      <span className="text-slate-300">{label}</span>
    </span>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TreatmentsPageV4: React.FC = () => {
  const [activeTab, setActiveTab] = useState('planificacion');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // 🔥 GRAPHQL QUERY
  const { data, loading, error, refetch } = useQuery(GET_TREATMENTS_V3, {
    variables: { limit: 50, offset: 0 },
    fetchPolicy: 'network-only',
  });

  // 🔔 REAL-TIME SUBSCRIPTION
  useSubscription(TREATMENT_V3_UPDATED, {
    onData: ({ data: subData }) => {
      const subDataTyped = subData as { data?: { treatmentV3Updated?: unknown } };
      if (subDataTyped?.data?.treatmentV3Updated) {
        console.log('🦷 Treatment updated via WebSocket:', subDataTyped.data.treatmentV3Updated);
        refetch();
      }
    },
  });

  const treatments: TreatmentRow[] = (data as { treatmentsV3?: TreatmentRow[] })?.treatmentsV3 || [];

  // Handlers
  const handleNewTreatment = () => {
    setEditingTreatment(null);
    setIsFormOpen(true);
  };

  const handleEditTreatment = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTreatment(null);
  };

  const handleFormSave = () => {
    refetch();
    handleFormClose();
  };

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Format cost
  const formatCost = (cost: number) => {
    if (!cost && cost !== 0) return '-';
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(cost);
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-900 via-purple-900/80 to-violet-900/60 overflow-hidden">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <header className="flex items-center justify-between px-6 py-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            🦷🎸 Quirófano Digital V4
          </h1>
          <p className="text-slate-400 text-sm">
            Gestión de tratamientos y odontograma
          </p>
        </div>
        <Button
          onClick={handleNewTreatment}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white shadow-lg shadow-purple-500/25"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Tratamiento
        </Button>
      </header>

      {/* ================================================================== */}
      {/* TABS */}
      {/* ================================================================== */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="flex-1 flex flex-col min-h-0 px-6 pb-6"
      >
        <TabsList className="bg-slate-900/50 border border-purple-500/30 p-1 shrink-0 mx-auto mb-4">
          <TabsTrigger 
            value="planificacion"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25"
          >
            📋 Planificación
          </TabsTrigger>
          <TabsTrigger 
            value="odontograma"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25"
          >
            🦷 Odontograma
          </TabsTrigger>
          <TabsTrigger 
            value="estetica"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-pink-500/25"
          >
            🎨 Estética IA
          </TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* TAB: PLANIFICACIÓN - DATA GRID */}
        {/* ============================================================== */}
        <TabsContent value="planificacion" className="flex-1 min-h-0">
          <Card className="h-full bg-slate-900/40 backdrop-blur-md border-purple-500/20 shadow-lg shadow-purple-500/10 flex flex-col">
            <CardHeader className="shrink-0 pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-white">
                  <CalendarIcon className="h-5 w-5 text-cyan-400" />
                  Tratamientos Registrados
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" title="Real-time"></span>
                </span>
                <span className="text-sm font-normal text-slate-400">
                  {treatments.length} tratamiento{treatments.length !== 1 ? 's' : ''}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                    <p className="text-slate-400">Cargando tratamientos...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">⚠️</span>
                    <p className="text-red-400">Error: {error.message}</p>
                    <Button onClick={() => refetch()} className="mt-4" size="sm">
                      🔄 Reintentar
                    </Button>
                  </div>
                </div>
              ) : treatments.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">🦷</span>
                    <p className="text-xl font-semibold text-slate-300">No hay tratamientos</p>
                    <p className="text-slate-500 mt-2">Crea el primer tratamiento para comenzar</p>
                    <Button onClick={handleNewTreatment} className="mt-4 bg-cyan-600 hover:bg-cyan-500">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Nuevo Tratamiento
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-transparent">
                      <TableHead className="text-cyan-400">Fecha</TableHead>
                      <TableHead className="text-cyan-400">Paciente</TableHead>
                      <TableHead className="text-cyan-400">Diente</TableHead>
                      <TableHead className="text-cyan-400">Procedimiento</TableHead>
                      <TableHead className="text-cyan-400 text-right">Coste</TableHead>
                      <TableHead className="text-cyan-400">Estado</TableHead>
                      <TableHead className="text-cyan-400 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {treatments.map((treatment) => (
                      <TableRow 
                        key={treatment.id} 
                        className="border-slate-700/50 hover:bg-purple-500/10 transition-colors"
                      >
                        <TableCell className="text-slate-300">
                          {formatDate(treatment.startDate || treatment.createdAt)}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {treatment.patientName || `#${treatment.patientId?.slice(0, 8) || 'N/A'}`}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {treatment.toothNumber ? (
                            <span className="font-mono bg-slate-800 px-2 py-1 rounded">
                              #{treatment.toothNumber}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <TreatmentTypeBadge type={treatment.treatmentType} />
                        </TableCell>
                        <TableCell className="text-right font-mono text-emerald-400">
                          {formatCost(treatment.cost)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={treatment.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditTreatment(treatment as unknown as Treatment)}
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB: ODONTOGRAMA */}
        {/* ============================================================== */}
        <TabsContent value="odontograma" className="flex-1 min-h-0">
          <OdontogramV4 
            patientId={selectedPatientId} 
            onPatientSelect={handlePatientSelect}
          />
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB: ESTÉTICA IA - PLACEHOLDER */}
        {/* ============================================================== */}
        <TabsContent value="estetica" className="flex-1 min-h-0">
          <Card className="h-full bg-slate-900/40 backdrop-blur-md border-purple-500/20 shadow-lg shadow-purple-500/10 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-8xl mb-6 animate-pulse">🎨✨</div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                IA Estética Dental
              </h2>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Visualización predictiva de tratamientos estéticos con inteligencia artificial. 
                Simula blanqueamientos, carillas y diseños de sonrisa antes del tratamiento.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Badge variant="outline" className="border-purple-500/50 text-purple-300 px-4 py-2">
                  🚧 Coming Soon
                </Badge>
                <Badge variant="outline" className="border-pink-500/50 text-pink-300 px-4 py-2">
                  Q1 2026
                </Badge>
              </div>
              <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                <p className="text-sm text-slate-500">
                  Powered by Ultra-Anonymizer + DALL-E/Stable Diffusion
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ================================================================== */}
      {/* TREATMENT FORM SHEET */}
      {/* ================================================================== */}
      <TreatmentFormSheet
        isOpen={isFormOpen}
        onClose={handleFormClose}
        treatment={editingTreatment}
        onSave={handleFormSave}
      />
    </div>
  );
};

export default TreatmentsPageV4;
