// 🎸💀 CYBERPUNK EXPORT UTILITIES - V2.0 REVOLUTION
/**
 * Cyberpunk Export Utilities - Professional Document Export System
 *
 * 🎯 MISSION: Export documents to PDF, Excel, and other formats with cyberpunk styling
 * ✅ PDF Export with custom styling
 * ✅ Excel Export with structured data
 * ✅ Metadata export capabilities
 * ✅ Professional formatting
 */

import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

export interface ExportDocument {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_size_mb: number;
  mime_type: string;
  is_image: boolean;
  is_xray: boolean;
  ai_analyzed: boolean;
  ai_confidence_scores?: any;
  ocr_extracted_text?: string;
  ai_tags?: string[];
  ai_analysis_results?: any;
  created_at: string;
  document_date?: string;
  unified_type?: string;
  legal_category?: string;
  smart_tags?: string[];
  compliance_status?: string;
  patient?: {
    first_name: string;
    last_name: string;
  };
}

/**
 * 🎯 EXPORT TO PDF - Cyberpunk Styled Document Export
 */
export const exportToPDF = async (document: ExportDocument): Promise<void> => {
  try {
    const pdf = new jsPDF();

    // 🎨 CYBERPUNK HEADER
    pdf.setFillColor(30, 30, 46); // Cyberpunk dark background
    pdf.rect(0, 0, 210, 40, 'F');

    // Title with cyberpunk styling
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('🩻 DENTIAGEST - DOCUMENTO MÉDICO', 20, 15);

    pdf.setFontSize(12);
    pdf.text(`Paciente: ${document.patient ? `${document.patient.first_name} ${document.patient.last_name}` : 'Sin paciente'}`, 20, 25);
    pdf.text(`Fecha: ${new Date(document.created_at).toLocaleDateString('es-ES')}`, 20, 32);

    let yPosition = 50;

    // 🎯 DOCUMENT INFORMATION
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.text('📋 INFORMACIÓN DEL DOCUMENTO', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(11);
    const docInfo = [
      `Título: ${document.title}`,
      `Archivo: ${document.file_name}`,
      `Tamaño: ${document.file_size_mb < 1 ? `${Math.round(document.file_size_mb * 1024)} KB` : `${document.file_size_mb.toFixed(1)} MB`}`,
      `Tipo: ${document.mime_type}`,
      `Tipo Unificado: ${getUnifiedTypeLabel(document.unified_type)}`,
      `Categoría Legal: ${document.legal_category || 'Sin especificar'}`,
      `Estado de Cumplimiento: ${document.compliance_status || 'Sin especificar'}`
    ];

    docInfo.forEach(line => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 20, yPosition);
      yPosition += 8;
    });

    // 🎯 AI ANALYSIS SECTION
    if (document.ai_analyzed) {
      yPosition += 10;
      pdf.setFontSize(16);
      pdf.text('🤖 ANÁLISIS DE INTELIGENCIA ARTIFICIAL', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(11);
      if (document.ai_confidence_scores) {
        pdf.text('Puntuaciones de Confianza:', 20, yPosition);
        yPosition += 10;

        Object.entries(document.ai_confidence_scores).forEach(([key, value]: [string, any]) => {
          const confidence = typeof value === 'number' ? `${Math.round(value * 100)}%` : value;
          pdf.text(`  ${key.replace(/_/g, ' ')}: ${confidence}`, 30, yPosition);
          yPosition += 8;
        });
      }

      if (document.ai_tags && document.ai_tags.length > 0) {
        yPosition += 5;
        pdf.text('Etiquetas IA:', 20, yPosition);
        yPosition += 10;

        document.ai_tags.forEach(tag => {
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(`  🏷️ ${tag}`, 30, yPosition);
          yPosition += 8;
        });
      }
    }

    // 🎯 OCR TEXT SECTION
    if (document.ocr_extracted_text) {
      yPosition += 10;
      pdf.setFontSize(16);
      pdf.text('📝 TEXTO EXTRAÍDO (OCR)', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(10);
      const ocrLines = pdf.splitTextToSize(document.ocr_extracted_text, 170);

      ocrLines.forEach((line: string) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      });
    }

    // 🎨 CYBERPUNK FOOTER
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFillColor(30, 30, 46);
      pdf.rect(0, 280, 210, 20, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text('🩻 DENTIAGEST - Sistema de Gestión Dental Avanzado', 20, 290);
      pdf.text(`Página ${i} de ${pageCount}`, 170, 290);
    }

    // Save the PDF
    const fileName = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.pdf`;
    pdf.save(fileName);

  } catch (error) {
    throw new Error('Error al exportar a PDF');
  }
};

/**
 * 🎯 EXPORT TO EXCEL - Structured Data Export
 */
export const exportToExcel = (document: ExportDocument): void => {
  try {
    const workbook = XLSX.utils.book_new();

    // 🎯 MAIN DOCUMENT INFO SHEET
    const mainData = [
      ['Campo', 'Valor'],
      ['ID', document.id],
      ['Título', document.title],
      ['Descripción', document.description || ''],
      ['Nombre del Archivo', document.file_name],
      ['Tamaño (MB)', document.file_size_mb],
      ['Tipo MIME', document.mime_type],
      ['Es Imagen', document.is_image ? 'Sí' : 'No'],
      ['Es Radiografía', document.is_xray ? 'Sí' : 'No'],
      ['Analizado por IA', document.ai_analyzed ? 'Sí' : 'No'],
      ['Tipo Unificado', getUnifiedTypeLabel(document.unified_type)],
      ['Categoría Legal', document.legal_category || ''],
      ['Estado de Cumplimiento', document.compliance_status || ''],
      ['Fecha de Creación', new Date(document.created_at).toLocaleString('es-ES')],
      ['Fecha del Documento', document.document_date ? new Date(document.document_date).toLocaleString('es-ES') : ''],
      ['Paciente', document.patient ? `${document.patient.first_name} ${document.patient.last_name}` : '']
    ];

    const mainSheet = XLSX.utils.aoa_to_sheet(mainData);
    XLSX.utils.book_append_sheet(workbook, mainSheet, 'Información Principal');

    // 🎯 AI ANALYSIS SHEET
    if (document.ai_analyzed) {
      const aiData = [
        ['Campo', 'Valor']
      ];

      if (document.ai_confidence_scores) {
        aiData.push(['Puntuaciones de Confianza', '']);
        Object.entries(document.ai_confidence_scores).forEach(([key, value]: [string, any]) => {
          aiData.push([key.replace(/_/g, ' '), typeof value === 'number' ? `${Math.round(value * 100)}%` : value]);
        });
      }

      if (document.ai_tags && document.ai_tags.length > 0) {
        aiData.push(['', '']);
        aiData.push(['Etiquetas IA', '']);
        document.ai_tags.forEach(tag => {
          aiData.push(['Etiqueta', tag]);
        });
      }

      const aiSheet = XLSX.utils.aoa_to_sheet(aiData);
      XLSX.utils.book_append_sheet(workbook, aiSheet, 'Análisis IA');
    }

    // 🎯 OCR TEXT SHEET
    if (document.ocr_extracted_text) {
      const ocrData = [
        ['Texto Extraído (OCR)'],
        [document.ocr_extracted_text]
      ];
      const ocrSheet = XLSX.utils.aoa_to_sheet(ocrData);
      XLSX.utils.book_append_sheet(workbook, ocrSheet, 'Texto OCR');
    }

    // 🎯 SMART TAGS SHEET
    if (document.smart_tags && document.smart_tags.length > 0) {
      const tagsData = [
        ['Etiqueta Inteligente']
      ];
      document.smart_tags.forEach(tag => {
        tagsData.push([tag]);
      });
      const tagsSheet = XLSX.utils.aoa_to_sheet(tagsData);
      XLSX.utils.book_append_sheet(workbook, tagsSheet, 'Etiquetas Inteligentes');
    }

    // Save the Excel file
    const fileName = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.xlsx`;
    XLSX.writeFile(workbook, fileName);

  } catch (error) {
    throw new Error('Error al exportar a Excel');
  }
};

/**
 * 🎯 EXPORT METADATA - JSON Format
 */
export const exportMetadata = (document: ExportDocument): void => {
  try {
    const metadata = {
      export_timestamp: new Date().toISOString(),
      document: {
        id: document.id,
        title: document.title,
        file_name: document.file_name,
        technical_info: {
          mime_type: document.mime_type,
          file_size_mb: document.file_size_mb,
          is_image: document.is_image,
          is_xray: document.is_xray
        },
        classification: {
          unified_type: document.unified_type,
          legal_category: document.legal_category,
          compliance_status: document.compliance_status
        },
        ai_analysis: document.ai_analyzed ? {
          confidence_scores: document.ai_confidence_scores,
          tags: document.ai_tags,
          has_ocr_text: !!document.ocr_extracted_text,
          analysis_results: document.ai_analysis_results
        } : null,
        dates: {
          created_at: document.created_at,
          document_date: document.document_date
        },
        patient: document.patient,
        smart_tags: document.smart_tags
      }
    };

    const dataStr = JSON.stringify(metadata, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const fileName = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_metadata.json`;
    saveAs(dataBlob, fileName);

  } catch (error) {
    throw new Error('Error al exportar metadatos');
  }
};

/**
 * 🎯 EXPORT DOCUMENT AS IMAGE - Screenshot Export
 */
export const exportAsImage = async (elementId: string, documentData: ExportDocument): Promise<void> => {
  try {
    const element = window.document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found for screenshot');
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const fileName = `${documentData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_screenshot.png`;
        saveAs(blob, fileName);
      }
    });

  } catch (error) {
    throw new Error('Error al exportar como imagen');
  }
};

/**
 * 🎯 UTILITY FUNCTIONS
 */
const getUnifiedTypeLabel = (type?: string): string => {
  const typeMap: { [key: string]: string } = {
    'medical_record': 'Historia Clínica',
    'lab_results': 'Resultados Laboratorio',
    'xray': 'Radiografía',
    'prescription': 'Receta Médica',
    'discharge_summary': 'Informe de Alta',
    'consent_form': 'Formulario de Consentimiento',
    'insurance_claim': 'Reclamo de Seguro',
    'billing_statement': 'Estado de Cuenta',
    'invoice': 'Factura',
    'contract': 'Contrato',
    'legal_document': 'Documento Legal',
    'policy': 'Política',
    'regulation': 'Reglamento'
  };

  return typeMap[type || ''] || (type || 'Documento');
};

/**
 * 🎯 BATCH EXPORT - Multiple Documents
 */
export const exportMultipleDocuments = async (
  documents: ExportDocument[],
  format: 'pdf' | 'excel' | 'metadata'
): Promise<void> => {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

    switch (format) {
      case 'pdf':
        // For multiple PDFs, we'd need to create a combined PDF or zip
        throw new Error('Exportación múltiple a PDF no implementada aún');

      case 'excel':
        const workbook = XLSX.utils.book_new();

        // Summary sheet
        const summaryData = [
          ['Resumen de Documentos Exportados'],
          ['Fecha de Exportación', new Date().toLocaleString('es-ES')],
          ['Total de Documentos', documents.length],
          [''],
          ['ID', 'Título', 'Tipo', 'Paciente', 'Fecha de Creación']
        ];

        documents.forEach(doc => {
          summaryData.push([
            doc.id,
            doc.title,
            getUnifiedTypeLabel(doc.unified_type),
            doc.patient ? `${doc.patient.first_name} ${doc.patient.last_name}` : '',
            new Date(doc.created_at).toLocaleDateString('es-ES')
          ]);
        });

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

        // Individual sheets for each document
        documents.forEach(doc => {
          const docData = [
            ['Campo', 'Valor'],
            ['ID', doc.id],
            ['Título', doc.title],
            ['Tipo Unificado', getUnifiedTypeLabel(doc.unified_type)],
            ['Paciente', doc.patient ? `${doc.patient.first_name} ${doc.patient.last_name}` : '']
          ];

          const docSheet = XLSX.utils.aoa_to_sheet(docData);
          XLSX.utils.book_append_sheet(workbook, docSheet, doc.title.substring(0, 30));
        });

        XLSX.writeFile(workbook, `documentos_export_${timestamp}.xlsx`);
        break;

      case 'metadata':
        const allMetadata = {
          export_timestamp: new Date().toISOString(),
          total_documents: documents.length,
          documents: documents.map(doc => ({
            id: doc.id,
            title: doc.title,
            unified_type: doc.unified_type,
            patient: doc.patient,
            created_at: doc.created_at
          }))
        };

        const dataStr = JSON.stringify(allMetadata, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        saveAs(dataBlob, `documentos_metadata_${timestamp}.json`);
        break;
    }

  } catch (error) {
    throw new Error(`Error en exportación múltiple: ${error}`);
  }
};
