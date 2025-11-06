import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentIcon, PhotoIcon, FilmIcon, MicrophoneIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { PatientAutocomplete } from './PatientAutocomplete';
import apollo from '../../apollo'; // 🚀 Apollo Nuclear Core integration

// 🌌 SMART DOCUMENT FLOW - PURE MAGIC
// Philosophy: "Documents find their home"
// Rural code meets AI consciousness

interface SmartDocument {
  id: string;
  file: File;
  smartAnalysis: {
    category: 'medical' | 'administrative' | 'legal' | 'billing';
    confidence: number;
    suggestedPatient?: string;
    documentType: string;
    reasoning: string;
  };
  preview?: string;
  userOverride?: boolean;
}

interface SmartDocumentFlowProps {
  onUploadComplete: (documents: SmartDocument[]) => void;
  patients: any[];
  // 🌌 UNIFIED SMART FLOW props
  effectivePatientId?: string;
  globalPatientId?: string;
  isGlobalMode?: boolean;
}

const SmartDocumentFlow: React.FC<SmartDocumentFlowProps> = ({
  onUploadComplete,
  patients,
  effectivePatientId,
  globalPatientId,
  isGlobalMode = false
}) => {
  const [smartDocuments, setSmartDocuments] = useState<SmartDocument[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);

  // 🏠 PATIENT NAME HELPER - Get patient name from ID
  const getPatientName = useCallback((patientId: string) => {
    if (patientId === 'virtual-clinic') return 'Documentos Administrativos';
    
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      return `${patient.first_name} ${patient.last_name}`;
    }
    
    // If we have an effective patient ID but no patient data, show a placeholder
    if (effectivePatientId === patientId) {
      return 'Paciente seleccionado';
    }
    
    return `Paciente ID: ${patientId}`;
  }, [patients, effectivePatientId]);

    // Helper function to check if patient was detected by filename - ENHANCED
  const wasDetectedByFilename = useCallback((smartDoc: SmartDocument): boolean => {
    if (!smartDoc.smartAnalysis.suggestedPatient || smartDoc.smartAnalysis.suggestedPatient === 'virtual-clinic') {
      return false;
    }
    
    const filename = smartDoc.file.name.toLowerCase();
    const patient = patients?.find(p => p.id === smartDoc.smartAnalysis.suggestedPatient);
    
    if (!patient) return false;
    
    const firstName = patient.first_name?.toLowerCase();
    const lastName = patient.last_name?.toLowerCase();
    
    // Enhanced detection logic - same as in analyzeDocument
    const checkFullMatch = (name: string) => {
      return filename.includes(` ${name} `) ||
             filename.includes(`_${name}_`) ||
             filename.includes(`-${name}-`) ||
             filename.startsWith(`${name}_`) ||
             filename.startsWith(`${name}-`) ||
             filename.endsWith(`_${name}`) ||
             filename.endsWith(`-${name}`) ||
             filename === name;
    };
    
    return (firstName && checkFullMatch(firstName)) || 
           (lastName && checkFullMatch(lastName));
  }, [patients]);

  // 🧠 SMART ANALYSIS ENGINE - Enhanced Intelligence
  const analyzeDocument = useCallback(async (file: File): Promise<SmartDocument['smartAnalysis']> => {
    const filename = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    const fileSize = file.size;
    
    // 🎯 SMART PATIENT DETECTION - Enhanced with apellido priority
    let detectedPatient: string | undefined;
    
    // Search for patient names in filename (if we have patients data)
    if (patients && patients.length > 0) {
      let bestMatch: { patient: any; matchType: 'lastName' | 'firstName'; matchLength: number } | null = null;
      
      for (const patient of patients) {
        const firstName = patient.first_name?.toLowerCase();
        const lastName = patient.last_name?.toLowerCase();
        
        // 🎯 PRIORIDAD 1: Apellidos (más únicos y profesionales)
        if (lastName && filename.includes(lastName)) {
          // Verificar que no sea parte de otra palabra (ej: "ana" en "analisis")
          const isFullMatch = 
            filename.includes(` ${lastName} `) ||  // Rodeado de espacios
            filename.includes(`_${lastName}_`) ||  // Rodeado de guiones bajos
            filename.includes(`-${lastName}-`) ||  // Rodeado de guiones
            filename.startsWith(`${lastName}_`) || // Al inicio con separador
            filename.startsWith(`${lastName}-`) || // Al inicio con guión
            filename.endsWith(`_${lastName}`) ||   // Al final con separador
            filename.endsWith(`-${lastName}`) ||   // Al final con guión
            filename === lastName;                 // Coincidencia exacta
            
          if (isFullMatch && (!bestMatch || bestMatch.matchType === 'firstName' || lastName.length > bestMatch.matchLength)) {
            bestMatch = { patient, matchType: 'lastName', matchLength: lastName.length };
          }
        }
        
        // 🎯 PRIORIDAD 2: Nombres (solo si no hay apellido match)
        if (firstName && filename.includes(firstName) && (!bestMatch || bestMatch.matchType === 'firstName')) {
          const isFullMatch = 
            filename.includes(` ${firstName} `) ||
            filename.includes(`_${firstName}_`) ||
            filename.includes(`-${firstName}-`) ||
            filename.startsWith(`${firstName}_`) ||
            filename.startsWith(`${firstName}-`) ||
            filename.endsWith(`_${firstName}`) ||
            filename.endsWith(`-${firstName}`) ||
            filename === firstName;
            
          if (isFullMatch && (!bestMatch || firstName.length > bestMatch.matchLength)) {
            bestMatch = { patient, matchType: 'firstName', matchLength: firstName.length };
          }
        }
      }
      
      detectedPatient = bestMatch?.patient.id;
    }
    
    // 🎯 KEYWORD ANALYSIS SYSTEM
    const medicalKeywords = [
      'radiografia', 'rx', 'xray', 'x-ray', 'dental', 'molar', 'endodoncia',
      'ortodoncia', 'implant', 'corona', 'bracket', 'retenedor', 'protesis',
      'biopsia', 'histologia', 'patologia', 'cirugia', 'extraccion',
      'periodontal', 'gingivitis', 'caries', 'tratamiento', 'clinico', 'clinica'
    ];
    
    const legalKeywords = [
      'contrato', 'contract', 'consent', 'consentimiento', 'legal', 'firma',
      'autorizacion', 'authorization', 'terminos', 'terms', 'clausula',
      'acuerdo', 'agreement', 'documento', 'certificado', 'licencia'
    ];
    
    const billingKeywords = [
      'factura', 'invoice', 'presupuesto', 'budget', 'cobro', 'pago',
      'payment', 'recibo', 'receipt', 'tarifa', 'precio', 'coste'
    ];
    
    const labKeywords = [
      'laboratorio', 'lab', 'analisis', 'cultivo', 'sangre', 'orina',
      'hemograma', 'bioquimica', 'microbiologia', 'resultado', 'report'
    ];

    // 🏆 SCORING SYSTEM
    let medicalScore = 0;
    let legalScore = 0;
    let billingScore = 0;
    let labScore = 0;
    let administrativeScore = 10; // Base score for fallback

    // Filename keyword matching
    medicalKeywords.forEach(keyword => {
      if (filename.includes(keyword)) medicalScore += 25;
    });
    legalKeywords.forEach(keyword => {
      if (filename.includes(keyword)) legalScore += 25;
    });
    billingKeywords.forEach(keyword => {
      if (filename.includes(keyword)) billingScore += 25;
    });
    labKeywords.forEach(keyword => {
      if (filename.includes(keyword)) labScore += 25;
    });

    // 📁 FILE TYPE SCORING
    if (fileType.includes('image/')) {
      medicalScore += 40; // Images usually medical in dental context
      if (fileType.includes('dicom')) medicalScore += 50;
    } else if (fileType.includes('pdf')) {
      if (fileSize > 5 * 1024 * 1024) { // Large PDFs (>5MB) likely scanned medical docs
        medicalScore += 20;
      } else if (fileSize < 500 * 1024) { // Small PDFs (<500KB) likely forms/invoices
        billingScore += 15;
        legalScore += 15;
      }
    }

    // 📏 SIZE HEURISTICS
    if (fileSize > 10 * 1024 * 1024) { // >10MB = likely high-res medical images
      medicalScore += 30;
    }

    // 🎯 DETERMINE WINNER
    const scores = { medical: medicalScore, legal: legalScore, billing: billingScore, lab: labScore, administrative: administrativeScore };
    const winner = Object.entries(scores).reduce((a, b) => scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b);
    const confidence = Math.min(winner[1] / 100, 0.95); // Convert to 0-1 scale, cap at 95%

    // 🏆 RESULTADO MAPPING con UnifiedDocumentType
    let category: SmartDocument['smartAnalysis']['category'] = 'administrative';
    let documentType = 'document_general'; // Default to unified type
    let reasoning = 'Análisis por defecto';
    let suggestedPatient: string | undefined;

    switch (winner[0]) {
      case 'medical':
        category = 'medical';
        // ⚡ DETECCIÓN INTELIGENTE DE PACIENTES PARA DOCUMENTOS MÉDICOS
        // En el caso médico, el detectedPatient ya fue detectado arriba en la función
        
        // Use enhanced medical detection
        if (fileType.includes('image/')) {
          if (filename.includes('rx') || filename.includes('radiografia') || filename.includes('xray')) {
            documentType = 'xray';
            reasoning = `Radiografía detectada (${medicalScore} puntos) - tipo de imagen médica`;
          } else {
            documentType = 'photo_clinical';
            reasoning = `Foto clínica detectada (${medicalScore} puntos) - imagen médica`;
          }
        } else if (filename.includes('voice') || filename.includes('audio') || fileType.includes('audio/')) {
          documentType = 'voice_note';
          reasoning = `Nota de voz médica detectada (${medicalScore} puntos)`;
        } else if (filename.includes('plan') || filename.includes('tratamiento')) {
          documentType = 'treatment_plan';
          reasoning = `Plan de tratamiento detectado (${medicalScore} puntos)`;
        } else if (filename.includes('stl') || filename.includes('3d') || filename.includes('scan')) {
          documentType = 'scan_3d';
          reasoning = `Escaneo 3D detectado (${medicalScore} puntos)`;
        } else if (filename.includes('receta') || filename.includes('prescription')) {
          documentType = 'prescription';
          reasoning = `Prescripción médica detectada (${medicalScore} puntos)`;
        } else {
          documentType = 'photo_clinical'; // Default medical
          reasoning = `Contenido médico detectado (${medicalScore} puntos)`;
        }
        // Medical documents go to detected patient (highest priority) or effective patient
        suggestedPatient = detectedPatient || effectivePatientId;
        break;
        
      case 'billing':
        category = 'billing';
        if (filename.includes('presupuesto') || filename.includes('budget')) {
          documentType = 'budget';
          reasoning = `Presupuesto detectado (${billingScore} puntos)`;
        } else if (filename.includes('comprobante') || filename.includes('pago') || filename.includes('payment')) {
          documentType = 'payment_proof';
          reasoning = `Comprobante de pago detectado (${billingScore} puntos)`;
        } else {
          documentType = 'invoice';
          reasoning = `Factura detectada (${billingScore} puntos)`;
        }
        // Billing documents go to detected patient or virtual clinic
        suggestedPatient = detectedPatient || 'virtual-clinic';
        break;
        
      case 'legal':
        category = 'administrative'; // Legal goes under administrative category
        if (filename.includes('derivacion') || filename.includes('referral')) {
          documentType = 'referral_letter';
          reasoning = `Carta de derivación detectada (${legalScore} puntos)`;
        } else if (filename.includes('consentimiento') || filename.includes('consent')) {
          documentType = 'consent_form';
          reasoning = `Formulario de consentimiento detectado (${legalScore} puntos)`;
        } else {
          documentType = 'legal_document';
          reasoning = `Documento legal detectado (${legalScore} puntos)`;
        }
        suggestedPatient = detectedPatient || 'virtual-clinic';
        break;
        
      case 'lab':
        category = 'medical';
        documentType = 'lab_report';
        reasoning = `Resultado de laboratorio detectado (${labScore} puntos)`;
        // Lab reports go to detected patient (highest priority) or effective patient
        suggestedPatient = detectedPatient || effectivePatientId;
        break;
        
      default:
        category = 'administrative';
        if (filename.includes('seguro') || filename.includes('insurance')) {
          documentType = 'insurance_form';
          reasoning = 'Formulario de seguro detectado';
        } else {
          documentType = 'document_general';
          reasoning = 'Categorización por defecto - tipo no reconocido';
        }
        suggestedPatient = detectedPatient || 'virtual-clinic';
    }
    
    return {
      category,
      confidence,
      documentType,
      reasoning,
      suggestedPatient
    };
  }, [patients, effectivePatientId]);

  // 🌊 DROPZONE MAGIC
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setAnalyzing(true);
    
    const analyzed: SmartDocument[] = [];
    
    for (const file of acceptedFiles) {
      const smartAnalysis = await analyzeDocument(file);
      
      analyzed.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        smartAnalysis,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      });
    }
    
    setSmartDocuments(prev => [...prev, ...analyzed]);
    setAnalyzing(false);
  }, [analyzeDocument]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'audio/*': ['.mp3', '.wav', '.m4a'],
      'text/*': ['.txt', '.doc', '.docx']
    }
  });

  // 🎨 CATEGORY COLORS (like IAnarkalendar)
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medical': return 'bg-red-500';
      case 'administrative': return 'bg-blue-500';
      case 'legal': return 'bg-purple-500';
      case 'billing': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <PhotoIcon className="w-8 h-8" />;
    if (file.type.startsWith('audio/')) return <MicrophoneIcon className="w-8 h-8" />;
    if (file.type.startsWith('video/')) return <FilmIcon className="w-8 h-8" />;
    return <DocumentIcon className="w-8 h-8" />;
  };

  // 🔧 MANUAL CONFIRMATION SYSTEM
  const handleCategoryChange = (documentId: string, newCategory: SmartDocument['smartAnalysis']['category']) => {
    setSmartDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? {
            ...doc,
            smartAnalysis: {
              ...doc.smartAnalysis,
              category: newCategory,
              confidence: 0.95, // High confidence for manual selection
              reasoning: `Categoría seleccionada manualmente por el usuario`
            }
          }
        : doc
    ));
  };

  const handleDocumentTypeChange = (documentId: string, newType: string) => {
    setSmartDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? {
            ...doc,
            smartAnalysis: {
              ...doc.smartAnalysis,
              documentType: newType,
              confidence: 0.95,
              reasoning: `Tipo de documento seleccionado manualmente`
            }
          }
        : doc
    ));
  };

  const handlePatientChange = (documentId: string, patientId: string) => {
    setSmartDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? {
            ...doc,
            smartAnalysis: {
              ...doc.smartAnalysis,
              suggestedPatient: patientId,
              reasoning: `Paciente seleccionado manualmente`
            }
          }
        : doc
    ));
  };

  const removeDocument = (documentId: string) => {
    setSmartDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const confirmAllDocuments = async () => {
    console.log('🚀 Starting Smart upload process:', smartDocuments);
    
    try {
      // Convert SmartDocuments to actual upload format
      const uploadPromises = smartDocuments.map(async (smartDoc) => {
        const formData = new FormData();
        formData.append('file', smartDoc.file);
        
        // Map smart analysis to backend format
        const unifiedType = smartDoc.smartAnalysis.documentType;
        const category = smartDoc.smartAnalysis.category;
        
        // Add metadata
        formData.append('document_type', unifiedType);
        formData.append('category', category);
        formData.append('access_level_str', category === 'medical' ? 'medical' : 'administrative');
        
        // Add patient info if medical
        if (category === 'medical' && smartDoc.smartAnalysis.suggestedPatient) {
          formData.append('patient_id', smartDoc.smartAnalysis.suggestedPatient);
        } else if (category !== 'medical') {
          // Use virtual patient for administrative docs
          formData.append('patient_id', 'd76a8a03-1411-4143-85ba-6f064c7b564b');
        }
        
        console.log('🔮 Smart uploading:', smartDoc.file.name, 'as', unifiedType);
        
        // Use Apollo for upload - correct method access
        return apollo.api.post('/medical-records/documents/upload', formData);
      });
      
      // Wait for all uploads
      const results = await Promise.all(uploadPromises);
      console.log('✅ All smart uploads completed:', results);
      
      // Call onUploadComplete callback
      if (onUploadComplete) {
        // Pass the actual SmartDocuments array
        onUploadComplete(smartDocuments);
      }
      
      // Clear documents after successful upload
      setSmartDocuments([]);
      
    } catch (error) {
      console.error('❌ Smart upload failed:', error);
      // TODO: Show error notification to user
    }
  };

  return (
    <div className="space-y-6">
      {/* 🌌 MAGIC DROPZONE */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <SparklesIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
          ✨ Arrastra archivos aquí o haz clic para seleccionar
        </p>
        <p className="text-sm text-gray-500 mt-2">
          El sistema analizará automáticamente cada archivo y sugerirá su ubicación óptima
        </p>
        
        {analyzing && (
          <div className="mt-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-blue-600">Analizando con IA...</span>
          </div>
        )}
      </div>

      {/* 🎯 SMART DOCUMENT CARDS */}
      {smartDocuments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            📋 Documentos Analizados ({smartDocuments.length})
          </h3>
          
          <div className="grid gap-4">
            {smartDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-start space-x-4">
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {doc.preview ? (
                      <img src={doc.preview} alt="" className="w-16 h-16 rounded object-cover" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                        {getFileIcon(doc.file)}
                      </div>
                    )}
                  </div>
                  
                  {/* Document Info */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {doc.file.name}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {Math.round(doc.smartAnalysis.confidence * 100)}% confianza
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      🧠 {doc.smartAnalysis.reasoning}
                    </p>
                    
                    {/* 🏠 HOGAR SUGERIDO - ENHANCED SMART DETECTION */}
                    {doc.smartAnalysis.suggestedPatient && (
                      <div className={`flex items-center space-x-2 p-2 rounded border ${
                        wasDetectedByFilename(doc)
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      }`}>
                        <div className={`${
                          wasDetectedByFilename(doc) 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {wasDetectedByFilename(doc) ? '🎯' : '🏠'}
                        </div>
                        <div className="flex-1">
                          <span className={`text-sm font-medium ${
                            wasDetectedByFilename(doc)
                              ? 'text-emerald-800 dark:text-emerald-200'
                              : 'text-blue-800 dark:text-blue-200'
                          }`}>
                            {wasDetectedByFilename(doc) 
                              ? 'Paciente detectado automáticamente:' 
                              : 'Hogar sugerido:'
                            }
                          </span>
                          <span className={`text-sm ml-1 ${
                            wasDetectedByFilename(doc)
                              ? 'text-emerald-700 dark:text-emerald-300 font-medium'
                              : 'text-blue-700 dark:text-blue-300'
                          }`}>
                            {getPatientName(doc.smartAnalysis.suggestedPatient)}
                          </span>
                        </div>
                        <div className={`text-xs font-medium ${
                          wasDetectedByFilename(doc)
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {Math.round(doc.smartAnalysis.confidence * 100)}%
                        </div>
                      </div>
                    )}
                    
                    {/* 🔧 MANUAL EDITOR - ENHANCED INTERFACE */}
                    {editingDocumentId === doc.id ? (
                      <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg shadow-sm">
                        <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 font-medium text-sm">
                          <span>⚡</span>
                          <span>Editor Manual - {doc.file.name}</span>
                        </div>
                        {/* Category Selection - ENHANCED */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            📂 Categoría:
                          </label>
                          <select
                            value={doc.smartAnalysis.category}
                            onChange={(e) => handleCategoryChange(doc.id, e.target.value as any)}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="medical">🏥 Médico</option>
                            <option value="administrative">📋 Administrativo</option>
                            <option value="billing">💰 Facturación</option>
                            <option value="legal">⚖️ Legal</option>
                          </select>
                        </div>
                        
                        {/* Document Type Selection - ENHANCED */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            📄 Tipo de documento:
                          </label>
                          <select
                            value={doc.smartAnalysis.documentType}
                            onChange={(e) => handleDocumentTypeChange(doc.id, e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {/* 🏥 MEDICAL OPTIONS */}
                            <optgroup label="🏥 Médico">
                              <option value="xray">📻 Radiografía (todos los tipos)</option>
                              <option value="photo_clinical">📸 Foto clínica</option>
                              <option value="voice_note">🎤 Nota de voz</option>
                              <option value="treatment_plan">📋 Plan de tratamiento</option>
                              <option value="lab_report">🧪 Resultado laboratorio</option>
                              <option value="prescription">💊 Prescripción</option>
                              <option value="scan_3d">🔬 Escaneo 3D/STL</option>
                            </optgroup>
                            
                            {/* 📋 ADMINISTRATIVE OPTIONS */}
                            <optgroup label="📋 Administrativo">
                              <option value="consent_form">📝 Consentimiento</option>
                              <option value="insurance_form">🛡️ Formulario seguro</option>
                              <option value="document_general">📄 Documento general</option>
                            </optgroup>
                            
                            {/* 💰 BILLING OPTIONS */}
                            <optgroup label="💰 Facturación">
                              <option value="invoice">💰 Factura</option>
                              <option value="budget">💸 Presupuesto</option>
                              <option value="payment_proof">🧾 Comprobante pago</option>
                            </optgroup>
                            
                            {/* ⚖️ LEGAL OPTIONS */}
                            <optgroup label="⚖️ Legal">
                              <option value="referral_letter">📄 Carta derivación</option>
                              <option value="legal_document">⚖️ Documento legal</option>
                            </optgroup>
                          </select>
                        </div>
                        
                        {/* Patient Selection - AUTOCOMPLETADO INTELIGENTE */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            🎯 Paciente: 
                            {doc.smartAnalysis.category !== 'medical' && (
                              <span className="text-xs text-gray-500 ml-1">(opcional para no-médicos)</span>
                            )}
                          </label>
                          <PatientAutocomplete
                            patients={patients || []}
                            value={doc.smartAnalysis.suggestedPatient || ''}
                            onChange={(patientId) => handlePatientChange(doc.id, patientId)}
                            placeholder="Buscar paciente por nombre o apellido..."
                            showDetectedIcon={wasDetectedByFilename(doc)}
                          />
                        </div>
                        
                        {/* 🎮 ACTION BUTTONS - ENHANCED UX */}
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={() => setEditingDocumentId(null)}
                            className="flex-1 px-3 py-2 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
                          >
                            <span>✓</span>
                            <span>Confirmar cambios</span>
                          </button>
                          <button
                            onClick={() => setEditingDocumentId(null)}
                            className="px-3 py-2 text-xs bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                          >
                            ↶ Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(doc.smartAnalysis.category)}`}>
                            {doc.smartAnalysis.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            📄 {doc.smartAnalysis.documentType}
                          </span>
                          <span className="text-xs text-gray-500">
                            📦 {(doc.file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setEditingDocumentId(doc.id)}
                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center space-x-1"
                            title="Editar categorización"
                          >
                            <span>✏️</span>
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => removeDocument(doc.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Eliminar documento"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 🚀 CONFIRMATION & UPLOAD CONTROLS */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              📋 {smartDocuments.length} documento{smartDocuments.length !== 1 ? 's' : ''} listo{smartDocuments.length !== 1 ? 's' : ''} para subir
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSmartDocuments([])}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                �️ Limpiar todo
              </button>
              <button
                onClick={confirmAllDocuments}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                disabled={smartDocuments.length === 0}
              >
                ✓ Confirmar y Subir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartDocumentFlow;
