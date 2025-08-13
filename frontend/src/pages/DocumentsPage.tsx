// DOCUMENT_MANAGEMENT: Dedicated Documents Page
/**
 * DocumentsPage - Standalone document management interface
 * 
 * Full-featured document management page with:
 * ✅ Complete document management workflow
 * ✅ Patient context integration
 * ✅ Medical records association
 * ✅ AINARKLENDAR styling consistency
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { DocumentManagement } from '../components/DocumentManagement/DocumentManagement.tsx';
import { 
  FolderIcon,
  DocumentDuplicateIcon 
} from '@heroicons/react/24/outline';

export const DocumentsPage: React.FC = () => {
  const { patientId, recordId } = useParams<{ 
    patientId?: string; 
    recordId?: string; 
  }>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🎨 HEADER - PUNK HYBRID PERFECTION */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FolderIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold leading-tight text-gray-900">
                    Gestión de Documentos
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Sistema completo de documentos médicos con IA
                  </p>
                </div>
              </div>
              
              {/* 🎯 MINI FEATURES - Right Side */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">🤖 Upload Inteligente</span>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">🎯 Organización Avanzada</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">🧠 IA Integrada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📄 MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-6">
            {/* 🗂️ DOCUMENT MANAGEMENT COMPONENT - MAXIMUM WORKSPACE */}
            <DocumentManagement
              patientId={patientId}
              medicalRecordId={recordId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
