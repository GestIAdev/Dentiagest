// 🦷💀🎸 ODONTOGRAM V3 SVG - VISUAL SUPREMACY (Directiva #006)
// Date: November 17, 2025
// Version: V3.1 - SVG Interactive HUD (Cyberpunk Style)
// Mission: Replace 3D cubes with professional vector visualization
// Architect: PunkClaude (The Field Warrior)
// Status: ACTIVE - Economic Singularity Integration

import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { Card, CardHeader, CardBody } from '../../design-system/Card';
import { Button } from '../../design-system/Button';
import { Badge } from '../../design-system/Badge';
import { Spinner } from '../../design-system/Spinner';
import { GET_TREATMENTS_V3 } from '../../graphql/queries/treatments';
import { GET_BILLING_DATA_V3_LIST } from '../../graphql/queries/billingDataV3';

// ============================================================================
// 🎯 FDI TOOTH NUMBERING SYSTEM (Adult - 32 teeth)
// ============================================================================
// Quadrant 1 (Upper Right): 11-18
// Quadrant 2 (Upper Left):  21-28
// Quadrant 3 (Lower Left):  31-38
// Quadrant 4 (Lower Right): 41-48

const FDI_TEETH = [
  // Upper jaw (maxillary) - Right to Left
  18, 17, 16, 15, 14, 13, 12, 11, // Quadrant 1 (Upper Right)
  21, 22, 23, 24, 25, 26, 27, 28, // Quadrant 2 (Upper Left)
  // Lower jaw (mandibular) - Left to Right  
  38, 37, 36, 35, 34, 33, 32, 31, // Quadrant 3 (Lower Left)
  41, 42, 43, 44, 45, 46, 47, 48, // Quadrant 4 (Lower Right)
];

// ============================================================================
// 🎨 CYBERPUNK COLOR SCHEME (Economic Singularity)
// ============================================================================
const COLORS = {
  // Profit margin colors
  excellent: '#10B981',  // Green >50%
  good: '#FBBF24',       // Yellow 30-50%
  acceptable: '#F97316', // Orange 10-30%
  low: '#EF4444',        // Red <10%
  noData: '#64748B',     // Gray (no treatment)
  
  // Status colors
  inProgress: '#3B82F6', // Blue pulsing
  planned: '#8B5CF6',    // Purple
  completed: '#10B981',  // Green
  
  // UI colors
  primary: '#00FFFF',    // Cyan
  accent: '#EC4899',     // Pink
  background: '#0F172A', // Dark slate
  border: '#1E293B',     // Slate
  text: '#F1F5F9'        // Light gray
};

// ============================================================================
// 🎯 TYPES & INTERFACES
// ============================================================================
interface ToothData {
  toothNumber: number;
  treatments: Array<{
    id: string;
    type: string;
    status: string;
    date: string;
  }>;
  profitMargin: number | null; // Aggregate profit margin for this tooth
  totalRevenue: number;
  totalCost: number;
  lastTreatment: string | null;
}

interface OdontogramV3SVGProps {
  patientId?: string;
  className?: string;
  onToothSelect?: (tooth: ToothData) => void;
}

// ============================================================================
// 🎯 UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract tooth number from treatment description/notes
 * Regex patterns: "diente 14", "tooth 14", "#14", "14", etc.
 */
function extractToothNumber(text: string): number | null {
  if (!text) return null;
  
  const patterns = [
    /diente\s*#?(\d{2})/i,
    /tooth\s*#?(\d{2})/i,
    /pieza\s*#?(\d{2})/i,
    /#(\d{2})\b/,
    /\b(\d{2})\b/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      // Validate FDI notation (11-48)
      if (
        (num >= 11 && num <= 18) ||
        (num >= 21 && num <= 28) ||
        (num >= 31 && num <= 38) ||
        (num >= 41 && num <= 48)
      ) {
        return num;
      }
    }
  }
  
  return null;
}

/**
 * Get color based on profit margin (Economic Singularity)
 */
function getProfitColor(profitMargin: number | null): string {
  if (profitMargin === null) return COLORS.noData;
  
  if (profitMargin > 0.5) return COLORS.excellent;  // >50%
  if (profitMargin > 0.3) return COLORS.good;       // 30-50%
  if (profitMargin > 0.1) return COLORS.acceptable; // 10-30%
  return COLORS.low;                                 // <10%
}

/**
 * Get profit category badge
 */
function getProfitCategory(profitMargin: number | null): string {
  if (profitMargin === null) return 'SIN DATOS';
  
  if (profitMargin > 0.5) return 'EXCELENTE';
  if (profitMargin > 0.3) return 'BUENO';
  if (profitMargin > 0.1) return 'ACEPTABLE';
  return 'BAJO';
}

// ============================================================================
// 🦷 TOOTH SVG COMPONENT
// ============================================================================
interface ToothSVGProps {
  toothNumber: number;
  profitMargin: number | null;
  isSelected: boolean;
  onClick: () => void;
  position: { x: number; y: number };
}

const ToothSVG: React.FC<ToothSVGProps> = ({
  toothNumber,
  profitMargin,
  isSelected,
  onClick,
  position
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const color = getProfitColor(profitMargin);
  
  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'pointer' }}
      className="tooth-svg-group"
    >
      {/* Tooth shape (rounded rectangle = molar/premolar simplified) */}
      <rect
        x="-15"
        y="-20"
        width="30"
        height="40"
        rx="8"
        ry="8"
        fill={color}
        stroke={isSelected ? COLORS.primary : 'transparent'}
        strokeWidth={isSelected ? 3 : 0}
        className={`tooth-shape ${isHovered ? 'tooth-hovered' : ''} ${isSelected ? 'tooth-selected' : ''}`}
        style={{
          filter: isHovered || isSelected 
            ? `drop-shadow(0 0 ${isSelected ? 16 : 12}px ${color})` 
            : 'none',
          transition: 'all 0.3s ease'
        }}
      />
      
      {/* Tooth number label */}
      <text
        x="0"
        y="5"
        textAnchor="middle"
        fill={COLORS.background}
        fontSize="14"
        fontWeight="bold"
        style={{ pointerEvents: 'none' }}
      >
        {toothNumber}
      </text>
      
      {/* Profit indicator dot (if has data) */}
      {profitMargin !== null && (
        <circle
          cx="12"
          cy="-12"
          r="4"
          fill={color}
          stroke={COLORS.background}
          strokeWidth="1.5"
          className={isHovered ? 'profit-dot-pulse' : ''}
        />
      )}
    </g>
  );
};

// ============================================================================
// 🎯 MAIN ODONTOGRAM V3 SVG COMPONENT
// ============================================================================
const OdontogramV3SVG: React.FC<OdontogramV3SVGProps> = ({
  patientId,
  className = '',
  onToothSelect
}) => {
  const [selectedToothNumber, setSelectedToothNumber] = useState<number | null>(null);
  
  // ============================================================================
  // 📊 DATA FETCHING (Apollo GraphQL)
  // ============================================================================
  const { data: treatmentsData, loading: treatmentsLoading } = useQuery(GET_TREATMENTS_V3, {
    variables: { patientId, limit: 1000 },
    skip: !patientId
  });
  
  const { data: billingsData, loading: billingsLoading } = useQuery(GET_BILLING_DATA_V3_LIST, {
    variables: { patientId, limit: 1000 },
    skip: !patientId
  });
  
  // ============================================================================
  // 🧮 DATA PROCESSING (Economic Singularity Integration)
  // ============================================================================
  const teethData = useMemo(() => {
    const treatments = (treatmentsData as any)?.treatmentsV3 || [];
    const billings = (billingsData as any)?.getBillingDataV3 || [];
    
    // Create mapping: treatmentId -> billing data
    const billingMap = new Map();
    billings.forEach((billing: any) => {
      if (billing.treatmentId) {
        billingMap.set(billing.treatmentId, {
          profitMargin: billing.profitMargin,
          materialCost: billing.materialCost,
          totalAmount: billing.totalAmount
        });
      }
    });
    
    // Group treatments by tooth number
    const toothMap = new Map<number, ToothData>();
    
    // Initialize all teeth with no data
    FDI_TEETH.forEach(toothNumber => {
      toothMap.set(toothNumber, {
        toothNumber,
        treatments: [],
        profitMargin: null,
        totalRevenue: 0,
        totalCost: 0,
        lastTreatment: null
      });
    });
    
    // Process treatments
    treatments.forEach((treatment: any) => {
      // Extract tooth number from description or notes
      const toothNumber = extractToothNumber(
        `${treatment.description || ''} ${treatment.notes || ''}`
      );
      
      if (toothNumber && toothMap.has(toothNumber)) {
        const toothData = toothMap.get(toothNumber)!;
        
        // Add treatment to tooth
        toothData.treatments.push({
          id: treatment.id,
          type: treatment.treatmentType,
          status: treatment.status,
          date: treatment.startDate
        });
        
        // Update last treatment date
        if (!toothData.lastTreatment || treatment.startDate > toothData.lastTreatment) {
          toothData.lastTreatment = treatment.startDate;
        }
        
        // Get billing data for this treatment
        const billing = billingMap.get(treatment.id);
        if (billing) {
          toothData.totalRevenue += billing.totalAmount || 0;
          toothData.totalCost += billing.materialCost || 0;
        }
      }
    });
    
    // Calculate aggregate profit margin per tooth
    toothMap.forEach((toothData, toothNumber) => {
      if (toothData.totalRevenue > 0) {
        const profit = toothData.totalRevenue - toothData.totalCost;
        toothData.profitMargin = profit / toothData.totalRevenue;
      }
    });
    
    return Array.from(toothMap.values());
  }, [treatmentsData, billingsData]);
  
  // ============================================================================
  // 🎯 TOOTH POSITIONING (FDI Layout)
  // ============================================================================
  const getToothPosition = (toothNumber: number, index: number): { x: number; y: number } => {
    const spacing = 50;
    const offsetX = 400; // Center offset
    const offsetY = 250; // Center offset
    
    // Upper jaw (11-18, 21-28)
    if (toothNumber >= 11 && toothNumber <= 18) {
      // Quadrant 1 (Upper Right): 18 -> 11 (right to left)
      const position = 18 - toothNumber;
      return { x: offsetX + position * spacing, y: offsetY - 100 };
    }
    if (toothNumber >= 21 && toothNumber <= 28) {
      // Quadrant 2 (Upper Left): 21 -> 28 (left to right)
      const position = toothNumber - 21;
      return { x: offsetX - (position + 1) * spacing, y: offsetY - 100 };
    }
    
    // Lower jaw (31-38, 41-48)
    if (toothNumber >= 31 && toothNumber <= 38) {
      // Quadrant 3 (Lower Left): 38 -> 31 (left to right)
      const position = 38 - toothNumber;
      return { x: offsetX - (position + 1) * spacing, y: offsetY + 100 };
    }
    if (toothNumber >= 41 && toothNumber <= 48) {
      // Quadrant 4 (Lower Right): 41 -> 48 (right to left)
      const position = toothNumber - 41;
      return { x: offsetX + position * spacing, y: offsetY + 100 };
    }
    
    return { x: 0, y: 0 };
  };
  
  // ============================================================================
  // 🎯 EVENT HANDLERS
  // ============================================================================
  const handleToothClick = (tooth: ToothData) => {
    setSelectedToothNumber(tooth.toothNumber);
    onToothSelect?.(tooth);
  };
  
  const selectedTooth = teethData.find(t => t.toothNumber === selectedToothNumber);
  
  // ============================================================================
  // 🎯 LOADING STATE
  // ============================================================================
  if (treatmentsLoading || billingsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-cyan-400 mt-4">Cargando datos económicos...</p>
        </div>
      </div>
    );
  }
  
  // ============================================================================
  // 🎯 RENDER
  // ============================================================================
  return (
    <div className={`odontogram-v3-svg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white cyberpunk-glow">
            🦷💀 Odontograma V3 - Visual Supremacy
          </h2>
          <p className="text-gray-400 mt-2">
            Análisis de rentabilidad por diente (Economic Singularity)
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline">SVG Interactivo</Badge>
          <Badge variant="success">&lt;100KB</Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SVG Viewer */}
        <div className="lg:col-span-3">
          <Card className="cyberpunk-card">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center justify-between">
                <span>Visualización Vectorial (FDI Chart)</span>
                <div className="flex items-center space-x-4 text-sm font-normal">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded mr-1" style={{ backgroundColor: COLORS.excellent }}></div>
                    <span className="text-xs text-white">Excelente</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded mr-1" style={{ backgroundColor: COLORS.good }}></div>
                    <span className="text-xs text-white">Bueno</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded mr-1" style={{ backgroundColor: COLORS.acceptable }}></div>
                    <span className="text-xs text-white">Aceptable</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded mr-1" style={{ backgroundColor: COLORS.low }}></div>
                    <span className="text-xs text-white">Bajo</span>
                  </div>
                </div>
              </h3>
            </CardHeader>
            <CardBody>
              <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-cyan-900 rounded-lg p-8 shadow-2xl shadow-cyan-500/20">
                <svg
                  width="100%"
                  height="500"
                  viewBox="0 0 800 500"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ background: 'transparent' }}
                >
                  {/* Midline */}
                  <line
                    x1="400"
                    y1="50"
                    x2="400"
                    y2="450"
                    stroke={COLORS.primary}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.3"
                  />
                  
                  {/* Jaw separators */}
                  <line
                    x1="50"
                    y1="250"
                    x2="750"
                    y2="250"
                    stroke={COLORS.primary}
                    strokeWidth="2"
                    opacity="0.3"
                  />
                  
                  {/* Labels */}
                  <text x="400" y="30" textAnchor="middle" fill={COLORS.text} fontSize="14" fontWeight="bold">
                    MAXILAR SUPERIOR
                  </text>
                  <text x="400" y="480" textAnchor="middle" fill={COLORS.text} fontSize="14" fontWeight="bold">
                    MAXILAR INFERIOR
                  </text>
                  
                  {/* Render all teeth */}
                  {teethData.map((tooth, index) => (
                    <ToothSVG
                      key={tooth.toothNumber}
                      toothNumber={tooth.toothNumber}
                      profitMargin={tooth.profitMargin}
                      isSelected={selectedToothNumber === tooth.toothNumber}
                      onClick={() => handleToothClick(tooth)}
                      position={getToothPosition(tooth.toothNumber, index)}
                    />
                  ))}
                </svg>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Sidebar - Tooth Details */}
        <div>
          {selectedTooth ? (
            <Card className="cyberpunk-card">
              <CardHeader>
                <h3 className="text-lg font-semibold cyberpunk-text flex items-center justify-between">
                  <span>Diente #{selectedTooth.toothNumber}</span>
                  <Badge variant={selectedTooth.profitMargin !== null ? 'success' : 'secondary'}>
                    {getProfitCategory(selectedTooth.profitMargin)}
                  </Badge>
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                {/* Financial Metrics */}
                {selectedTooth.profitMargin !== null && (
                  <div className="bg-gray-700/50 rounded p-3 space-y-2">
                    <h4 className="font-medium text-cyan-400 text-sm">💰 Métricas Financieras</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Ingresos:</span>
                        <span className="text-white font-medium">€{selectedTooth.totalRevenue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Costes:</span>
                        <span className="text-white font-medium">€{selectedTooth.totalCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-600 pt-1">
                        <span className="text-gray-300">Beneficio:</span>
                        <span className="text-green-400 font-bold">
                          €{(selectedTooth.totalRevenue - selectedTooth.totalCost).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Margen:</span>
                        <span 
                          className="font-bold"
                          style={{ color: getProfitColor(selectedTooth.profitMargin) }}
                        >
                          {(selectedTooth.profitMargin * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Treatment History */}
                {selectedTooth.treatments.length > 0 ? (
                  <div>
                    <h4 className="font-medium text-cyan-400 mb-2 text-sm">📋 Historial de Tratamientos</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedTooth.treatments.map((treatment) => (
                        <div key={treatment.id} className="bg-gray-700/50 rounded p-2 text-xs">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-white">{treatment.type}</span>
                            <Badge variant="outline" className="text-xs">
                              {treatment.status}
                            </Badge>
                          </div>
                          <p className="text-gray-400 mt-1">
                            {new Date(treatment.date).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-2">🦷</div>
                    <p className="text-gray-400 text-sm">Sin tratamientos registrados</p>
                  </div>
                )}
                
                {/* Quick Actions */}
                <div className="pt-4 space-y-2">
                  <Button
                    className="w-full cyberpunk-button"
                    onClick={() => {
                      console.log('Nuevo tratamiento para diente', selectedTooth.toothNumber);
                      // TODO: Open treatment modal
                    }}
                  >
                    + Nuevo Tratamiento
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedToothNumber(null)}
                  >
                    Cerrar
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="cyberpunk-card">
              <CardBody className="text-center py-12">
                <div className="text-6xl mb-4 opacity-50">🦷</div>
                <p className="text-gray-400">
                  Selecciona un diente para ver detalles
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
      
      {/* Inline Styles for Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cyberpunk-glow {
          0%, 100% { text-shadow: 0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF; }
          50% { text-shadow: 0 0 20px #00FFFF, 0 0 30px #00FFFF, 0 0 40px #00FFFF; }
        }
        
        .cyberpunk-glow {
          animation: cyberpunk-glow 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .profit-dot-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .tooth-shape {
          transition: all 0.3s ease;
        }
        
        .tooth-hovered {
          transform: scale(1.1);
        }
        
        .tooth-selected {
          transform: scale(1.15);
        }
      ` }} />
    </div>
  );
};

export default OdontogramV3SVG;

// 🦷💀🎸 ODONTOGRAM V3 SVG - VISUAL SUPREMACY COMPLETE
// Status: DIRECTIVA #006 - Ready for testing
// Architecture: Apollo GraphQL + Economic Singularity + SVG HUD
// Features: FDI Chart, Profit coloring, Treatment history, <100KB weight
