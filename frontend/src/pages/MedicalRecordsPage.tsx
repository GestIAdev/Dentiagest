// MEDICAL_RECORDS: Página principal de historiales médicos
/**
 * Página que integra el módulo completo de historiales médicos.
 * Esta página se puede importar en el sistema de rutas principal.
 * 
 * PLATFORM_PATTERN: Este patrón se repetirá en otros verticales:
 * - VetGest: Página de historiales veterinarios
 * - MechaGest: Página de órdenes de servicio
 * - RestaurantGest: Página de pedidos
 */

import React from 'react';
import { MedicalRecordsContainer } from '../components/MedicalRecords';

const MedicalRecordsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la página */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                Historiales Médicos
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona todos los historiales médicos de los pacientes
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <nav className="flex space-x-4">
                <a
                  href="/patients"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Pacientes
                </a>
                <a
                  href="/appointments"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Citas
                </a>
                <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-md text-sm font-medium">
                  Historiales
                </span>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <MedicalRecordsContainer />
    </div>
  );
};

export default MedicalRecordsPage;

