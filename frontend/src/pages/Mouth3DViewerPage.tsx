// 🎯🎸💀 MOUTH 3D VIEWER PAGE - DEPRECATED V142
// Date: September 26, 2025
// Status: DEPRECATED - Functionality moved to Treatments domain
// Reason: V142 Unification - All 3D functionality integrated into TreatmentManagementV3
// Redirect: Use Treatments page for Odontogram3DV3 and AestheticsPreviewV3

import React from 'react';
import { useNavigate } from 'react-router-dom';

// 🎯 DEPRECATED COMPONENT - Mouth3DViewerPage
const Mouth3DViewerPage: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Auto-redirect to Treatments page
    navigate('/treatments');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-cyan-900/20">
      <div className="text-center p-8 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-purple-500/20">
        <div className="text-6xl mb-4">🔄</div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          V142: UNIFICACIÓN COMPLETA
        </h1>
        <p className="text-gray-300 mb-4">
          La funcionalidad 3D se ha integrado en el dominio Treatments
        </p>
        <p className="text-sm text-cyan-300">
          Redirigiendo automáticamente...
        </p>
      </div>
    </div>
  );
};

export default Mouth3DViewerPage;

// 🎯🎸💀 MOUTH 3D VIEWER PAGE - DEPRECATED EXPORTS
// Status: V142_SUCCESS - Domain unified and reconstructed
