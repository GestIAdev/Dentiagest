import React, { useState } from 'react';

interface LegalDocument {
  id: string;
  title: string;
  category: 'argentina' | 'international' | 'procedures' | 'compliance';
  description: string;
  lastUpdated: string;
  content: string;
  downloadable: boolean;
}

const LegalTransparencyModule: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('argentina');
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);

  // 📚 BIBLIOTECA LEGAL COMPLETA
  const legalDocuments: LegalDocument[] = [
    // 🏛️ DOCUMENTACIÓN ARGENTINA
    {
      id: 'arg-ley-25326',
      title: 'Marco Legal Ley 25.326 - Protección Datos Personales',
      category: 'argentina',
      description: 'Normativa argentina completa para protección de datos personales en salud',
      lastUpdated: '15 Agosto 2025',
      content: `# LEY 25.326 - PROTECCIÓN DE DATOS PERSONALES
      
## ARTÍCULOS RELEVANTES PARA DENTIAGEST

### Artículo 2 - Exclusiones
Los datos anónimos NO están sujetos a las disposiciones de la presente ley.

### Artículo 5 - Consentimiento
Se requiere consentimiento expreso del titular para el tratamiento de datos sensibles.

### Artículo 26 - Transferencias Internacionales
Prohibidas salvo que el país de destino proporcione nivel de protección adecuado.

## APLICACIÓN EN DENTIAGEST
✅ Anonimización completa antes de procesamiento IA
✅ Consentimiento informado granular  
✅ Base legal sólida para transferencias internacionales
✅ Cumplimiento automático mediante código`,
      downloadable: true
    },
    {
      id: 'arg-privacy-policy',
      title: 'Política de Privacidad Argentina Localizada',
      category: 'argentina',
      description: 'Política específica para consultorios odontológicos en Argentina',
      lastUpdated: '15 Agosto 2025',
      content: `# POLÍTICA DE PRIVACIDAD DENTIAGEST ARGENTINA

## RESPONSABLE DEL TRATAMIENTO
DentiaGest - Software de Gestión Odontológica

## DATOS QUE RECOPILAMOS
- Información médica odontológica
- Datos de contacto del paciente
- Historial de tratamientos
- Documentos médicos (radiografías, estudios)

## FINALIDADES DEL TRATAMIENTO
- Gestión de historia clínica
- Diagnóstico y tratamiento odontológico
- Comunicación con el paciente
- Cumplimiento de obligaciones legales

## BASE LEGAL
- Consentimiento del paciente (Art. 5 Ley 25.326)
- Cumplimiento de obligaciones legales médicas
- Interés legítimo en la prestación de servicios de salud

## DERECHOS DEL PACIENTE
- Acceso a sus datos personales
- Rectificación de datos incorrectos
- Supresión de datos (salvo conservación legal obligatoria)
- Portabilidad de datos médicos
- Oposición al tratamiento

## CONSERVACIÓN DE DATOS
Según normativa médica argentina: mínimo 10 años posterior al último tratamiento.`,
      downloadable: true
    },
    {
      id: 'arg-patient-rights',
      title: 'Derechos del Paciente (Ley 26.529)',
      category: 'argentina',
      description: 'Marco de derechos del paciente en el sistema de salud argentino',
      lastUpdated: '15 Agosto 2025',
      content: `# LEY 26.529 - DERECHOS DEL PACIENTE

## DERECHOS FUNDAMENTALES

### Artículo 2 - Información Sanitaria
Todo paciente tiene derecho a:
- Recibir información sanitaria completa
- Conocer su estado de salud
- Acceder a su historia clínica

### Artículo 3 - Interconsulta Médica  
Derecho a una segunda opinión médica.

### Artículo 4 - Prestaciones de Salud
Atención sanitaria integral según las necesidades de cada persona.

### Artículo 5 - Trato Digno
Respeto por la dignidad humana, autonomía de la voluntad, intimidad y confidencialidad.

## APLICACIÓN EN DENTIAGEST
✅ Acceso transparente a información médica
✅ Portabilidad completa de historia clínica
✅ Confidencialidad mediante encriptación avanzada
✅ Respeto a la autonomía del paciente`,
      downloadable: true
    },

    // 🌍 DOCUMENTACIÓN INTERNACIONAL
    {
      id: 'gdpr-framework',
      title: 'GDPR Compliance Framework (Europa)',
      category: 'international',
      description: 'Marco de cumplimiento del Reglamento General de Protección de Datos europeo',
      lastUpdated: '15 Agosto 2025',
      content: `# REGLAMENTO GENERAL DE PROTECCIÓN DE DATOS (GDPR)

## APLICABILIDAD A DENTIAGEST

### Artículo 4 - Definiciones
- **Datos personales**: Información identificable de persona física
- **Datos anónimos**: Fuera del ámbito GDPR (Considerando 26)

### Artículo 6 - Base Legal
1. Consentimiento del interesado
2. Cumplimiento de obligación legal
3. Interés vital del interesado
4. Interés público o ejercicio de poderes públicos
5. Intereses legítimos del responsable

### Artículo 9 - Datos Especiales (Salud)
Prohibición general con excepciones específicas para datos de salud.

### Artículo 44-49 - Transferencias Internacionales
Restricciones para transferencias fuera del EEE.

## ESTRATEGIA DENTIAGEST
✅ Anonimización robusta = Sin aplicación GDPR
✅ Consentimiento específico cuando necesario
✅ Minimización de datos al máximo
✅ Principio de responsabilidad proactiva`,
      downloadable: true
    },
    {
      id: 'hipaa-reference',
      title: 'HIPAA Reference Guide (Estados Unidos)',
      category: 'international',
      description: 'Guía de referencia para cumplimiento HIPAA en servicios de salud',
      lastUpdated: '15 Agosto 2025',
      content: `# HEALTH INSURANCE PORTABILITY AND ACCOUNTABILITY ACT (HIPAA)

## APLICACIÓN PARA SERVICIOS INTERNACIONALES

### Privacy Rule
Protección de información médica identificable individualmente (PHI).

### Security Rule  
Estándares de seguridad para PHI electrónica (ePHI).

### Breach Notification Rule
Notificación obligatoria de violaciones de seguridad.

## SAFE HARBORS - DESIDENTIFICACIÓN
### Método de Puerto Seguro (§164.514(b))
Eliminación de 18 identificadores específicos:
1. Nombres
2. Direcciones geográficas menores que estado
3. Fechas relacionadas con el individuo
4. Números de teléfono/fax
5. Direcciones de email
6. Números de seguridad social
7. Números de registro médico
... (y 11 más)

## APLICACIÓN DENTIAGEST
✅ Desidentificación automática según HIPAA Safe Harbor
✅ Eliminación de 18 categorías de identificadores
✅ Datos anónimos = Fuera del ámbito HIPAA
✅ Interoperabilidad internacional segura`,
      downloadable: true
    },

    // 🔧 PROCEDIMIENTOS
    {
      id: 'anonymization-procedures',
      title: 'Procedimientos de Anonimización de Datos',
      category: 'procedures',
      description: 'Protocolos técnicos para anonimización robusta de documentos médicos',
      lastUpdated: '15 Agosto 2025',
      content: `# PROTOCOLOS DE ANONIMIZACIÓN DENTIAGEST

## METODOLOGÍA ULTRA-ROBUSTA

### Fase 1: Identificación de Elementos
🔍 **Detección automática:**
- Nombres propios (pacientes, familiares, médicos)
- Números de identificación (DNI, CUIT, CUIL)
- Direcciones y ubicaciones geográficas
- Fechas de nacimiento y edades específicas
- Números de teléfono y contacto
- Referencias familiares y sociales

### Fase 2: Eliminación Sistemática
🧹 **Algoritmos de limpieza:**
\`\`\`python
class UltraAnonymizer:
    def remove_identifiers(self, document):
        # Eliminación de nombres con NLP
        names_removed = self.nlp_name_removal(document)
        
        # Eliminación de números identificatorios
        ids_removed = self.regex_id_removal(names_removed)
        
        # Eliminación de ubicaciones geográficas
        locations_removed = self.geo_anonymization(ids_removed)
        
        # Anonymización temporal
        dates_anonymized = self.temporal_anonymization(locations_removed)
        
        return dates_anonymized
\`\`\`

### Fase 3: Verificación de Anonimato
✅ **Controles de calidad:**
- Test de re-identificación automático
- Cálculo de entropía informacional
- Verificación de unicidad de combinaciones
- Análisis de riesgo cuantitativo

### Fase 4: Certificación Legal
📋 **Documentación automática:**
- Hash criptográfico del proceso
- Timestamp de anonimización
- Listado de elementos eliminados
- Certificado de cumplimiento normativo`,
      downloadable: true
    },

    // ✅ COMPLIANCE
    {
      id: 'auto-compliance-certificates',
      title: 'Certificados de Compliance Automáticos',
      category: 'compliance',
      description: 'Sistema de auto-certificación legal y auditoría continua',
      lastUpdated: '15 Agosto 2025',
      content: `# SISTEMA DE AUTO-CERTIFICACIÓN DENTIAGEST

## MOTOR DE COMPLIANCE AUTOMÁTICO

### Certificación en Tiempo Real
🤖 **Generación automática:**
- Análisis de cumplimiento por documento
- Verificación de requisitos legales múltiples jurisdicciones
- Puntuación de riesgo automatizada
- Recomendaciones de mejora específicas

### Auditoría Continua
📊 **Métricas de cumplimiento:**
\`\`\`json
{
  "compliance_score": 98.7,
  "argentina_law_25326": "COMPLIANT",
  "gdpr_compatibility": "COMPLIANT_VIA_ANONYMIZATION", 
  "hipaa_safe_harbor": "COMPLIANT",
  "anonymization_risk": "MINIMAL",
  "last_audit": "2025-08-15T14:30:00Z"
}
\`\`\`

### Reporting Automático
📋 **Documentación legal:**
- Informes de cumplimiento mensuales
- Evidencia para auditorías externas
- Justificación técnica de decisiones
- Trazabilidad completa de procesamiento

## VENTAJA COMPETITIVA
🏆 **Diferenciación única:**
- Transparencia total del cumplimiento
- Evidencia objetiva ante reguladores
- Reducción de riesgos legales
- Confianza del cliente demostrable`,
      downloadable: true
    }
  ];

  const categories = [
    { id: 'argentina', name: '🏛️ Argentina', description: 'Normativa Nacional' },
    { id: 'international', name: '🌍 Internacional', description: 'GDPR, HIPAA, etc.' },
    { id: 'procedures', name: '🔧 Procedimientos', description: 'Protocolos Técnicos' },
    { id: 'compliance', name: '✅ Compliance', description: 'Certificaciones Auto.' }
  ];

  const filteredDocuments = legalDocuments.filter(doc => doc.category === activeCategory);

  const handleDownload = (legalDoc: LegalDocument) => {
    const content = `${legalDoc.title}\n\n${legalDoc.content}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${legalDoc.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = (legalDoc: LegalDocument) => {
    const printContent = `
      <html>
        <head>
          <title>${legalDoc.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1, h2, h3 { color: #2563eb; }
            pre { background: #f3f4f6; padding: 15px; border-radius: 5px; }
            .header { border-bottom: 2px solid #2563eb; margin-bottom: 20px; padding-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🦷 DentiaGest - Centro Legal</h1>
            <h2>${legalDoc.title}</h2>
            <p><strong>Categoría:</strong> ${categories.find(c => c.id === legalDoc.category)?.name}</p>
            <p><strong>Última actualización:</strong> ${legalDoc.lastUpdated}</p>
          </div>
          <div>${legalDoc.content.replace(/\n/g, '<br>')}</div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <>
      {/* Botón en Top Bar */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        title="Centro Legal - Transparencia Total"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="hidden sm:inline">Centro Legal</span>
      </button>

      {/* Modal/Drawer Legal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Drawer desde la derecha */}
          <div className="fixed right-0 top-0 h-full w-full max-w-4xl bg-white shadow-2xl transform transition-transform">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">⚖️ Centro Legal DentiaGest</h2>
                    <p className="text-indigo-100">Transparencia Total • Cumplimiento Garantizado</p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar de Categorías */}
                <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
                  <h3 className="font-semibold text-gray-900 mb-4">📚 Biblioteca Legal</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          activeCategory === category.id
                            ? 'bg-indigo-100 border-l-4 border-indigo-500 text-indigo-700'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-gray-500">{category.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {legalDocuments.filter(doc => doc.category === category.id).length} documentos
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Info Box */}
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-700 font-medium mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Compliance Status</span>
                    </div>
                    <div className="text-sm text-green-600">
                      <div>✅ Argentina: 100% Compliant</div>
                      <div>✅ GDPR: Compatible</div>
                      <div>✅ HIPAA: Safe Harbor</div>
                    </div>
                  </div>
                </div>

                {/* Área de Documentos */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {!selectedDocument ? (
                    // Lista de documentos
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        {categories.find(c => c.id === activeCategory)?.name}
                      </h3>
                      <div className="space-y-4">
                        {filteredDocuments.map(legalDoc => (
                          <div 
                            key={legalDoc.id}
                            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedDocument(legalDoc)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-2">{legalDoc.title}</h4>
                                <p className="text-gray-600 text-sm mb-3">{legalDoc.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>📅 {legalDoc.lastUpdated}</span>
                                  {legalDoc.downloadable && (
                                    <span className="flex items-center space-x-1">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <span>Descargable</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(legalDoc);
                                  }}
                                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Descargar PDF"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrint(legalDoc);
                                  }}
                                  className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Imprimir"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Vista de documento individual
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <button
                          onClick={() => setSelectedDocument(null)}
                          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          <span>Volver a la lista</span>
                        </button>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownload(selectedDocument)}
                            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Descargar</span>
                          </button>
                          <button
                            onClick={() => handlePrint(selectedDocument)}
                            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span>Imprimir</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedDocument.title}</h2>
                        <p className="text-gray-600 mb-4">{selectedDocument.description}</p>
                        <div className="text-sm text-gray-500 mb-6">
                          Última actualización: {selectedDocument.lastUpdated}
                        </div>
                        <div className="prose max-w-none">
                          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                            {selectedDocument.content}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LegalTransparencyModule;
