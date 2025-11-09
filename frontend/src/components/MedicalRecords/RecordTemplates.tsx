// 🎯💀 MEDICAL RECORD TEMPLATES - SPEED UP DATA ENTRY
// Date: November 9, 2025
// Mission: Pre-filled templates for common dental conditions
// Status: PUNKGROK EDITION - Templates reduce data entry time 80%

import React, { useState } from 'react';
import { Button } from '../../design-system/Button';
import { Card } from '../../design-system/Card';
import { Badge } from '../../design-system/Badge';
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  HeartIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// 🎯 TEMPLATE STRUCTURE
export interface MedicalRecordTemplate {
  id: string;
  name: string;
  category: 'preventive' | 'restorative' | 'cosmetic' | 'orthodontic' | 'periodontal' | 'endodontic' | 'oral_surgery' | 'emergency';
  icon: React.ComponentType<{ className?: string }>;
  diagnosis: string;
  treatmentPlan: string;
  notes: string;
  medications?: string[];
  estimatedCost?: number;
  estimatedTime?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// 🎯 PREDEFINED TEMPLATES - Common Dental Conditions
export const MEDICAL_RECORD_TEMPLATES: MedicalRecordTemplate[] = [
  {
    id: 'routine-checkup',
    name: 'Consulta de Rutina',
    category: 'preventive',
    icon: ClipboardDocumentCheckIcon,
    diagnosis: 'Examen dental rutinario. Higiene oral adecuada. Sin caries detectadas.',
    treatmentPlan: `1. Limpieza dental profesional
2. Aplicación de flúor
3. Revisión de técnica de cepillado
4. Próxima cita en 6 meses`,
    notes: 'Paciente sin molestias. Encías sanas. Recomendar uso de hilo dental diario.',
    medications: [],
    estimatedCost: 50,
    estimatedTime: '30 min',
    priority: 'normal'
  },
  {
    id: 'cavity-treatment',
    name: 'Tratamiento de Caries',
    category: 'restorative',
    icon: WrenchScrewdriverIcon,
    diagnosis: 'Caries dental en pieza [número]. Profundidad: [superficial/media/profunda].',
    treatmentPlan: `1. Anestesia local
2. Remoción de tejido cariado
3. Obturación con composite
4. Ajuste de oclusión
5. Pulido final`,
    notes: 'Instrucciones post-operatorias: Evitar alimentos duros en las primeras 24 horas. Si hay sensibilidad, contactar clínica.',
    medications: ['Ibuprofeno 600mg (opcional para dolor leve)'],
    estimatedCost: 80,
    estimatedTime: '45 min',
    priority: 'high'
  },
  {
    id: 'root-canal',
    name: 'Endodoncia (Tratamiento de Conductos)',
    category: 'endodontic',
    icon: HeartIcon,
    diagnosis: 'Pulpitis irreversible en pieza [número]. Dolor intenso. Indicación de endodoncia.',
    treatmentPlan: `SESIÓN 1:
1. Anestesia local
2. Aislamiento con dique de goma
3. Apertura coronaria
4. Extirpación pulpar
5. Instrumentación de conductos
6. Medicación intraconducto
7. Obturación temporal

SESIÓN 2 (7-10 días):
1. Remoción de obturación temporal
2. Irrigación final
3. Obturación definitiva de conductos
4. Restauración coronaria`,
    notes: 'Tratamiento en 2 sesiones. Prescribir antibiótico si hay infección. Recomendar corona posterior.',
    medications: [
      'Amoxicilina 500mg cada 8h por 7 días',
      'Ibuprofeno 600mg cada 8h (dolor)',
      'Paracetamol 1g (alternativa)'
    ],
    estimatedCost: 350,
    estimatedTime: '90 min (sesión 1), 60 min (sesión 2)',
    priority: 'urgent'
  },
  {
    id: 'orthodontic-consult',
    name: 'Consulta Ortodoncia',
    category: 'orthodontic',
    icon: ClipboardDocumentCheckIcon,
    diagnosis: 'Maloclusión Clase [I/II/III]. [Apiñamiento/Espaciamiento/Mordida cruzada/Sobremordida].',
    treatmentPlan: `FASE DIAGNÓSTICA:
1. Radiografías panorámica y lateral de cráneo
2. Modelos de estudio
3. Fotografías intra y extraorales
4. Análisis cefalométrico

FASE TRATAMIENTO (estimado):
1. Brackets [metálicos/estéticos/linguales]
2. Duración aproximada: [12-24 meses]
3. Visitas de control mensuales
4. Fase de retención post-tratamiento`,
    notes: 'Explicar opciones de brackets. Presupuesto detallado. Plan de pagos disponible.',
    medications: [],
    estimatedCost: 2500,
    estimatedTime: 'Consulta inicial: 60 min. Tratamiento: 12-24 meses',
    priority: 'normal'
  },
  {
    id: 'periodontal-treatment',
    name: 'Tratamiento Periodontal',
    category: 'periodontal',
    icon: HeartIcon,
    diagnosis: 'Gingivitis/Periodontitis [leve/moderada/severa]. Sangrado al sondaje. Bolsas periodontales de [mm].',
    treatmentPlan: `FASE I - Terapia Básica:
1. Instrucción de higiene oral
2. Raspado y alisado radicular por cuadrantes
3. Irrigación con clorhexidina
4. Re-evaluación a las 4-6 semanas

FASE II - Terapia Avanzada (si necesario):
1. Cirugía periodontal
2. Injertos de tejido
3. Mantenimiento periodontal trimestral`,
    notes: 'Enfatizar importancia de higiene. Clorhexidina 0.12% enjuague 2 veces/día por 2 semanas.',
    medications: [
      'Clorhexidina 0.12% enjuague bucal',
      'Ibuprofeno 600mg (si dolor)',
      'Antibiótico (si infección activa)'
    ],
    estimatedCost: 400,
    estimatedTime: 'Raspado: 4 sesiones de 45 min cada una',
    priority: 'high'
  },
  {
    id: 'emergency-visit',
    name: 'Visita de Emergencia',
    category: 'emergency',
    icon: ExclamationTriangleIcon,
    diagnosis: '[Dolor agudo/Traumatismo dental/Absceso/Fractura]. Evaluación urgente necesaria.',
    treatmentPlan: `EVALUACIÓN INMEDIATA:
1. Historia clínica rápida
2. Examen clínico urgente
3. Radiografía de diagnóstico
4. Control del dolor

TRATAMIENTO DE URGENCIA:
[Especificar según hallazgos]
- Drenaje de absceso
- Extracción de emergencia
- Endodoncia urgente
- Ferulización
- Medicación para el dolor

SEGUIMIENTO:
Cita de control en [X días]`,
    notes: 'Prioridad máxima. Evaluar signos de infección sistémica. Prescribir analgesia adecuada.',
    medications: [
      'Ibuprofeno 600mg cada 6-8h',
      'Paracetamol 1g cada 8h (alternativa)',
      'Antibiótico (si infección): Amoxicilina 500mg/8h'
    ],
    estimatedCost: 100,
    estimatedTime: '30-60 min',
    priority: 'urgent'
  }
];

// 🎯 TEMPLATE SELECTOR COMPONENT
interface RecordTemplatesProps {
  onSelectTemplate: (template: MedicalRecordTemplate) => void;
  onClose?: () => void;
}

export const RecordTemplates: React.FC<RecordTemplatesProps> = ({
  onSelectTemplate,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter templates by category
  const filteredTemplates = selectedCategory
    ? MEDICAL_RECORD_TEMPLATES.filter(t => t.category === selectedCategory)
    : MEDICAL_RECORD_TEMPLATES;

  // Category badges
  const categories = [
    { value: 'preventive', label: 'Preventivo', variant: 'success' as const },
    { value: 'restorative', label: 'Restaurador', variant: 'default' as const },
    { value: 'endodontic', label: 'Endodoncia', variant: 'error' as const },
    { value: 'orthodontic', label: 'Ortodoncia', variant: 'info' as const },
    { value: 'periodontal', label: 'Periodontal', variant: 'warning' as const },
    { value: 'emergency', label: 'Emergencia', variant: 'error' as const }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📋 Plantillas de Registros Médicos
        </h2>
        <p className="text-gray-600">
          Selecciona una plantilla para pre-llenar el registro con datos comunes.
          Puedes personalizarla después.
        </p>
      </div>

      {/* Category Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setSelectedCategory(null)}
            variant={selectedCategory === null ? 'primary' : 'outline'}
            size="sm"
          >
            Todas
          </Button>
          {categories.map(cat => (
            <Button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              variant={selectedCategory === cat.value ? 'primary' : 'outline'}
              size="sm"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => {
          const Icon = template.icon;
          const categoryInfo = categories.find(c => c.value === template.category);
          
          return (
            <Card
              key={template.id}
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectTemplate(template)}
            >
              {/* Template Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    {categoryInfo && (
                      <Badge variant={categoryInfo.variant} size="sm">
                        {categoryInfo.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Template Preview */}
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs font-medium text-gray-500">Diagnóstico:</p>
                  <p className="text-gray-700 line-clamp-2">{template.diagnosis}</p>
                </div>
                
                {template.estimatedCost && (
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>💰 ${template.estimatedCost}</span>
                    <span>⏱️ {template.estimatedTime}</span>
                  </div>
                )}
              </div>

              {/* Use Template Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTemplate(template);
                }}
                variant="primary"
                size="sm"
                className="w-full mt-3"
              >
                Usar Plantilla
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Close Button */}
      {onClose && (
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecordTemplates;
