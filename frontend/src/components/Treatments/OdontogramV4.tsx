/**
 * 🦷🎸💀 ODONTOGRAM V4 - VISUAL SUPREMACY REBORN
 * ===============================================
 * By PunkClaude & GeminiPunk - November 2025
 * 
 * AXIOMAS:
 * - SVG 2D: No 3D OBJ (35MB monster killed)
 * - NEON STROKES: Cyberpunk aesthetic
 * - SHEET LATERAL: Tooth details on click
 * - NO MOCKS: Real mutations connected
 * 
 * Based on: OdontogramV3SVG.tsx (Directiva #006)
 */

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from '../ui/sheet';
import { GET_TREATMENTS_V3 } from '../../graphql/queries/treatments';
import { GET_PATIENTS_V3 } from '../../graphql/queries/patients';
import TreatmentFormSheet from '../Forms/TreatmentFormSheet';

// ============================================================================
// 🎯 FDI TOOTH NUMBERING SYSTEM (Adult - 32 teeth)
// ============================================================================
// Quadrant 1 (Upper Right): 11-18
// Quadrant 2 (Upper Left):  21-28
// Quadrant 3 (Lower Left):  31-38
// Quadrant 4 (Lower Right): 41-48

const FDI_TEETH = {
  upper: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  lower: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
};

// ============================================================================
// 🎨 CYBERPUNK COLOR SCHEME
// ============================================================================
const COLORS = {
  // Status colors
  healthy: '#10B981',     // Emerald - No treatments
  inProgress: '#FBBF24',  // Amber - Active treatment
  completed: '#3B82F6',   // Blue - Completed treatment
  planned: '#8B5CF6',     // Purple - Planned
  urgent: '#EF4444',      // Red - Needs attention
  noData: '#64748B',      // Gray - No data
  
  // UI colors
  primary: '#00FFFF',     // Cyan neon
  accent: '#EC4899',      // Pink
  background: '#0F172A',  // Dark slate
  text: '#F1F5F9',        // Light gray
};

// ============================================================================
// 🎯 TYPES
// ============================================================================
interface ToothData {
  toothNumber: number;
  treatments: Array<{
    id: string;
    type: string;
    status: string;
    date: string;
    description: string;
    cost: number;
  }>;
  status: 'healthy' | 'inProgress' | 'completed' | 'planned' | 'urgent' | 'noData';
  lastTreatment: string | null;
}

interface OdontogramV4Props {
  patientId?: string | null;
  onPatientSelect?: (patientId: string) => void;
}

// ============================================================================
// 🦷 UTILITY FUNCTIONS
// ============================================================================

function extractToothNumber(text: string): number | null {
  if (!text) return null;
  
  const patterns = [
    /diente\s*#?(\d{2})/i,
    /tooth\s*#?(\d{2})/i,
    /pieza\s*#?(\d{2})/i,
    /#(\d{2})\b/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if ((num >= 11 && num <= 18) || (num >= 21 && num <= 28) ||
          (num >= 31 && num <= 38) || (num >= 41 && num <= 48)) {
        return num;
      }
    }
  }
  return null;
}

function getToothStatus(treatments: ToothData['treatments']): ToothData['status'] {
  // 🦷 Sin tratamientos = Diente SANO (verde), no "sin datos" (gris)
  if (treatments.length === 0) return 'healthy';
  
  const hasUrgent = treatments.some(t => t.status === 'URGENT' || t.type === 'EMERGENCY');
  const hasInProgress = treatments.some(t => t.status === 'IN_PROGRESS');
  const hasPlanned = treatments.some(t => t.status === 'PLANNED' || t.status === 'FOLLOW_UP_REQUIRED');
  const hasCompleted = treatments.some(t => t.status === 'COMPLETED');
  
  // 🎨 PRIORIDAD: Urgente > En Progreso > Planificado > Completado
  if (hasUrgent) return 'urgent';
  if (hasInProgress) return 'inProgress';
  if (hasPlanned) return 'planned';
  if (hasCompleted) return 'completed';
  return 'healthy';
}

function getStatusColor(status: ToothData['status']): string {
  return COLORS[status] || COLORS.noData;
}

function getQuadrantName(tooth: number): string {
  if (tooth >= 11 && tooth <= 18) return 'Superior Derecho (Q1)';
  if (tooth >= 21 && tooth <= 28) return 'Superior Izquierdo (Q2)';
  if (tooth >= 31 && tooth <= 38) return 'Inferior Izquierdo (Q3)';
  return 'Inferior Derecho (Q4)';
}

// ============================================================================
// 🦷 TOOTH SVG COMPONENT
// ============================================================================
interface ToothSVGProps {
  toothNumber: number;
  status: ToothData['status'];
  treatmentCount: number;
  isSelected: boolean;
  onClick: () => void;
  position: { x: number; y: number };
}

const ToothSVG: React.FC<ToothSVGProps> = ({
  toothNumber,
  status,
  treatmentCount,
  isSelected,
  onClick,
  position
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const color = getStatusColor(status);
  
  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Glow effect for selected/hovered */}
      {(isSelected || isHovered) && (
        <rect
          x="-18"
          y="-23"
          width="36"
          height="46"
          rx="10"
          ry="10"
          fill="none"
          stroke={COLORS.primary}
          strokeWidth="2"
          opacity="0.8"
          className="animate-pulse"
        />
      )}
      
      {/* Tooth shape */}
      <rect
        x="-15"
        y="-20"
        width="30"
        height="40"
        rx="8"
        ry="8"
        fill={color}
        stroke={isSelected ? COLORS.primary : 'rgba(255,255,255,0.2)'}
        strokeWidth={isSelected ? 3 : 1}
        style={{
          filter: isHovered || isSelected 
            ? `drop-shadow(0 0 ${isSelected ? 16 : 10}px ${color})` 
            : 'none',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        }}
      />
      
      {/* Tooth number */}
      <text
        x="0"
        y="5"
        textAnchor="middle"
        fill={status === 'noData' ? '#fff' : COLORS.background}
        fontSize="12"
        fontWeight="bold"
        style={{ pointerEvents: 'none' }}
      >
        {toothNumber}
      </text>
      
      {/* Treatment count indicator */}
      {treatmentCount > 0 && (
        <circle
          cx="12"
          cy="-15"
          r="8"
          fill={COLORS.primary}
          stroke={COLORS.background}
          strokeWidth="2"
        />
      )}
      {treatmentCount > 0 && (
        <text
          x="12"
          y="-12"
          textAnchor="middle"
          fill={COLORS.background}
          fontSize="9"
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          {treatmentCount}
        </text>
      )}
    </g>
  );
};

// ============================================================================
// 🎯 MAIN COMPONENT
// ============================================================================
const OdontogramV4: React.FC<OdontogramV4Props> = ({
  patientId,
  onPatientSelect,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patientId || null);
  const [selectedTooth, setSelectedTooth] = useState<ToothData | null>(null);
  const [isToothSheetOpen, setIsToothSheetOpen] = useState(false);
  const [isTreatmentFormOpen, setIsTreatmentFormOpen] = useState(false);
  
  // ============================================================================
  // 📊 DATA FETCHING
  // ============================================================================
  const { data: patientsData } = useQuery(GET_PATIENTS_V3, {
    variables: { limit: 500 },
    fetchPolicy: 'cache-first',
  });
  
  const patients = (patientsData as { patientsV3?: { id: string; firstName: string; lastName: string }[] })?.patientsV3 || [];
  
  const { data: treatmentsData, loading, refetch } = useQuery(GET_TREATMENTS_V3, {
    variables: { patientId: selectedPatientId, limit: 1000 },
    skip: !selectedPatientId,
    fetchPolicy: 'network-only',
  });
  
  // ============================================================================
  // 🧮 DATA PROCESSING
  // ============================================================================
  const teethData = useMemo(() => {
    const treatments = (treatmentsData as { treatmentsV3?: any[] })?.treatmentsV3 || [];
    
    // Create tooth map
    const toothMap = new Map<number, ToothData>();
    
    // Initialize all teeth as HEALTHY (not noData)
    [...FDI_TEETH.upper, ...FDI_TEETH.lower].forEach(toothNumber => {
      toothMap.set(toothNumber, {
        toothNumber,
        treatments: [],
        status: 'healthy',  // 🦷 Default = sano
        lastTreatment: null,
      });
    });
    
    // Process treatments
    treatments.forEach((treatment: any) => {
      const toothNumber = extractToothNumber(
        `${treatment.description || ''} ${treatment.notes || ''}`
      );
      
      if (toothNumber && toothMap.has(toothNumber)) {
        const toothData = toothMap.get(toothNumber)!;
        
        toothData.treatments.push({
          id: treatment.id,
          type: treatment.treatmentType,
          status: treatment.status,
          date: treatment.startDate,
          description: treatment.description || '',
          cost: treatment.cost || 0,
        });
        
        if (!toothData.lastTreatment || treatment.startDate > toothData.lastTreatment) {
          toothData.lastTreatment = treatment.startDate;
        }
      }
    });
    
    // Calculate status for each tooth
    toothMap.forEach((toothData) => {
      toothData.status = getToothStatus(toothData.treatments);
    });
    
    return toothMap;
  }, [treatmentsData]);
  
  // ============================================================================
  // 🎯 HANDLERS
  // ============================================================================
  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedPatientId(id || null);
    onPatientSelect?.(id);
    setSelectedTooth(null);
  };
  
  const handleToothClick = (tooth: ToothData) => {
    setSelectedTooth(tooth);
    setIsToothSheetOpen(true);
  };
  
  const handleNewTreatment = () => {
    setIsToothSheetOpen(false);
    setIsTreatmentFormOpen(true);
  };
  
  const getToothPosition = (toothNumber: number, isUpper: boolean): { x: number; y: number } => {
    const allTeeth = isUpper ? FDI_TEETH.upper : FDI_TEETH.lower;
    const index = allTeeth.indexOf(toothNumber);
    const spacing = 45;
    const centerOffset = 360;
    const x = centerOffset + (index - 8) * spacing + (index >= 8 ? 20 : 0);
    const y = isUpper ? 80 : 200;
    return { x, y };
  };
  
  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  
  // ============================================================================
  // 🎯 RENDER
  // ============================================================================
  return (
    <Card className="h-full bg-slate-900/40 backdrop-blur-md border-purple-500/20 shadow-lg shadow-purple-500/10 flex flex-col">
      <CardHeader className="shrink-0 pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-3 text-white">
            🦷 Odontograma Interactivo V4
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">SVG</Badge>
          </span>
          
          {/* Patient Selector */}
          <div className="flex items-center gap-3">
            <select
              value={selectedPatientId || ''}
              onChange={handlePatientChange}
              className="h-9 px-3 py-1 rounded-md text-sm text-white bg-slate-800/50 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="" className="bg-slate-800">Seleccionar paciente...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id} className="bg-slate-800">
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
          </div>
        </CardTitle>
        
        {selectedPatient && (
          <p className="text-slate-400 text-sm">
            Paciente: <span className="text-cyan-400">{selectedPatient.firstName} {selectedPatient.lastName}</span>
          </p>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto">
        {!selectedPatientId ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <span className="text-8xl mb-4 block opacity-50">🦷</span>
              <p className="text-xl font-semibold text-slate-300">Selecciona un paciente</p>
              <p className="text-slate-500 mt-2">para visualizar su odontograma</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
              <p className="text-slate-400">Cargando odontograma...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Legend - Ordenada por frecuencia/importancia */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {[
                { status: 'healthy', label: 'Sano' },
                { status: 'planned', label: 'Planificado' },
                { status: 'inProgress', label: 'En progreso' },
                { status: 'completed', label: 'Completado' },
                { status: 'urgent', label: 'Urgente' },
              ].map(({ status, label }) => (
                <div key={status} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: COLORS[status as keyof typeof COLORS] }}
                  />
                  <span className="text-slate-300">{label}</span>
                </div>
              ))}
            </div>
            
            {/* SVG Odontogram */}
            <div className="bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 rounded-xl p-4 shadow-inner">
              <svg
                width="100%"
                height="300"
                viewBox="0 0 720 300"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Midline */}
                <line
                  x1="360"
                  y1="30"
                  x2="360"
                  y2="270"
                  stroke={COLORS.primary}
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.3"
                />
                
                {/* Jaw separator */}
                <line
                  x1="30"
                  y1="140"
                  x2="690"
                  y2="140"
                  stroke={COLORS.primary}
                  strokeWidth="1"
                  opacity="0.3"
                />
                
                {/* Labels */}
                <text x="360" y="20" textAnchor="middle" fill={COLORS.text} fontSize="12" fontWeight="bold">
                  MAXILAR SUPERIOR
                </text>
                <text x="360" y="290" textAnchor="middle" fill={COLORS.text} fontSize="12" fontWeight="bold">
                  MAXILAR INFERIOR
                </text>
                
                {/* Quadrant labels */}
                <text x="180" y="50" textAnchor="middle" fill={COLORS.primary} fontSize="10" opacity="0.6">Q1 (Derecho)</text>
                <text x="540" y="50" textAnchor="middle" fill={COLORS.primary} fontSize="10" opacity="0.6">Q2 (Izquierdo)</text>
                <text x="180" y="240" textAnchor="middle" fill={COLORS.primary} fontSize="10" opacity="0.6">Q4 (Derecho)</text>
                <text x="540" y="240" textAnchor="middle" fill={COLORS.primary} fontSize="10" opacity="0.6">Q3 (Izquierdo)</text>
                
                {/* Upper teeth */}
                {FDI_TEETH.upper.map((toothNumber) => {
                  const tooth = teethData.get(toothNumber)!;
                  return (
                    <ToothSVG
                      key={toothNumber}
                      toothNumber={toothNumber}
                      status={tooth.status}
                      treatmentCount={tooth.treatments.length}
                      isSelected={selectedTooth?.toothNumber === toothNumber}
                      onClick={() => handleToothClick(tooth)}
                      position={getToothPosition(toothNumber, true)}
                    />
                  );
                })}
                
                {/* Lower teeth */}
                {FDI_TEETH.lower.map((toothNumber) => {
                  const tooth = teethData.get(toothNumber)!;
                  return (
                    <ToothSVG
                      key={toothNumber}
                      toothNumber={toothNumber}
                      status={tooth.status}
                      treatmentCount={tooth.treatments.length}
                      isSelected={selectedTooth?.toothNumber === toothNumber}
                      onClick={() => handleToothClick(tooth)}
                      position={getToothPosition(toothNumber, false)}
                    />
                  );
                })}
              </svg>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total dientes', value: 32, icon: '🦷' },
                { label: 'Con tratamientos', value: Array.from(teethData.values()).filter(t => t.treatments.length > 0).length, icon: '💉' },
                { label: 'En progreso', value: Array.from(teethData.values()).filter(t => t.status === 'inProgress').length, icon: '🔄' },
                { label: 'Completados', value: Array.from(teethData.values()).filter(t => t.status === 'completed').length, icon: '✅' },
              ].map((stat) => (
                <div 
                  key={stat.label} 
                  className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 text-center"
                >
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-xl font-bold text-cyan-400">{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      {/* ================================================================ */}
      {/* TOOTH DETAILS SHEET */}
      {/* ================================================================ */}
      <Sheet open={isToothSheetOpen} onOpenChange={setIsToothSheetOpen}>
        <SheetContent 
          side="right" 
          className="w-full sm:max-w-md bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border-purple-500/30"
        >
          {selectedTooth && (
            <>
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center gap-3">
                  🦷 Diente #{selectedTooth.toothNumber}
                </SheetTitle>
                <SheetDescription className="text-slate-400">
                  {getQuadrantName(selectedTooth.toothNumber)}
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  <span className="text-slate-300">Estado:</span>
                  <Badge 
                    className="px-3 py-1"
                    style={{ backgroundColor: getStatusColor(selectedTooth.status) + '30', color: getStatusColor(selectedTooth.status) }}
                  >
                    {selectedTooth.status === 'noData' ? 'Sin datos' :
                     selectedTooth.status === 'healthy' ? 'Sano' :
                     selectedTooth.status === 'inProgress' ? 'En progreso' :
                     selectedTooth.status === 'planned' ? 'Planificado' :
                     selectedTooth.status === 'completed' ? 'Completado' : 'Urgente'}
                  </Badge>
                </div>
                
                {/* Treatments List */}
                <div>
                  <h4 className="text-sm font-medium text-cyan-400 mb-3">
                    📋 Historial de Tratamientos ({selectedTooth.treatments.length})
                  </h4>
                  
                  {selectedTooth.treatments.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-4xl mb-2 block opacity-50">📭</span>
                      <p className="text-slate-400">Sin tratamientos registrados</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {selectedTooth.treatments.map((treatment) => (
                        <div 
                          key={treatment.id} 
                          className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-white">
                              {treatment.type.replace(/_/g, ' ')}
                            </span>
                            <Badge variant="outline" className="text-xs border-slate-600">
                              {treatment.status}
                            </Badge>
                          </div>
                          {treatment.description && (
                            <p className="text-sm text-slate-400 mb-2">{treatment.description}</p>
                          )}
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>{new Date(treatment.date).toLocaleDateString('es-ES')}</span>
                            {treatment.cost > 0 && (
                              <span className="text-emerald-400 font-medium">
                                €{treatment.cost.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="pt-4 border-t border-purple-500/30 space-y-3">
                  <Button
                    onClick={handleNewTreatment}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
                  >
                    ➕ Nuevo Tratamiento para este diente
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsToothSheetOpen(false)}
                    className="w-full border-slate-600 text-slate-300"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      
      {/* ================================================================ */}
      {/* TREATMENT FORM SHEET */}
      {/* ================================================================ */}
      <TreatmentFormSheet
        isOpen={isTreatmentFormOpen}
        onClose={() => setIsTreatmentFormOpen(false)}
        onSave={() => {
          refetch();
          setIsTreatmentFormOpen(false);
        }}
        preselectedPatientId={selectedPatientId || undefined}
        preselectedToothNumber={selectedTooth?.toothNumber}
      />
    </Card>
  );
};

export default OdontogramV4;
