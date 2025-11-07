import React, { useState, useEffect } from 'react';

interface MidiRecording {
  id: string;
  filename: string;
  timestamp: number;
  notesCount: number;
  duration: number;
  quality: number;
  type: string;
  zodiacSign?: string | null;
  element?: string | null;
  proceduralProfile?: any;
}

interface MidiPanelProps {
  className?: string;
}

const MIDIPanel: React.FC<MidiPanelProps> = ({ className = '' }) => {
  const [recordings, setRecordings] = useState<MidiRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar grabaciones MIDI recientes
  const loadMidiRecordings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/midi/recent?limit=10&all=true');
      const data = await response.json();

      if (data.success) {
        setRecordings(data.data);
      } else {
        setError(data.error || 'Error al cargar grabaciones MIDI');
      }
    } catch (err) {
      setError('Error de conexión al cargar grabaciones MIDI');
      console.error('Error loading MIDI recordings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMidiRecordings();

    // Recargar cada 30 segundos para mantener datos actualizados
    const interval = setInterval(loadMidiRecordings, 30000);
    return () => clearInterval(interval);
  }, []);

  // Formatear duración en minutos:segundos
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Formatear timestamp
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Calcular color de calidad
  const getQualityColor = (quality: number): string => {
    if (quality >= 0.9) return 'text-green-400';
    if (quality >= 0.7) return 'text-yellow-400';
    if (quality >= 0.5) return 'text-orange-400';
    return 'text-red-400';
  };

  // Calcular barra de progreso de calidad
  const getQualityBarWidth = (quality: number): string => {
    return `${Math.min(100, quality * 100)}%`;
  };

  if (loading) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mr-3"></div>
          <span className="text-slate-300">Cargando grabaciones MIDI...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm border border-red-700 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="text-red-400 text-center">
            <span className="text-2xl mb-2 block">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 ${className}`}>
      {/* Header del panel */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-cyan-400 flex items-center">
          <span className="mr-2">🎵</span>
          GRABACIONES MIDI
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-slate-400 text-sm">Live</span>
        </div>
      </div>

      {/* Lista de grabaciones */}
      {recordings.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-slate-400">No hay grabaciones MIDI disponibles</span>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {recordings.map((recording) => (
            <div
              key={recording.id}
              className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 hover:bg-slate-700/50 transition-colors"
            >
              {/* Nombre del archivo y timestamp */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm truncate" title={recording.filename}>
                    {recording.filename}
                  </h4>
                  <p className="text-slate-400 text-xs">
                    {formatTimestamp(recording.timestamp)}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${getQualityColor(recording.quality)}`}>
                    {(recording.quality * 100).toFixed(1)}%
                  </div>
                  <div className="w-16 h-1 bg-slate-600 rounded-full mt-1">
                    <div
                      className={`h-full rounded-full ${
                        recording.quality >= 0.9 ? 'bg-green-400' :
                        recording.quality >= 0.7 ? 'bg-yellow-400' :
                        recording.quality >= 0.5 ? 'bg-orange-400' : 'bg-red-400'
                      }`}
                      style={{ width: getQualityBarWidth(recording.quality) }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Notas:</span>
                  <span className="text-cyan-400 font-medium">{recording.notesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duración:</span>
                  <span className="text-purple-400 font-medium">{formatDuration(recording.duration)}</span>
                </div>
              </div>

              {/* Información adicional (zodiac/element si existe) */}
              {(recording.zodiacSign || recording.element) && (
                <div className="mt-2 flex justify-between text-xs">
                  {recording.zodiacSign && (
                    <span className="text-amber-400">
                      {recording.zodiacSign}
                    </span>
                  )}
                  {recording.element && (
                    <span className="text-emerald-400">
                      {recording.element}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer con estadísticas */}
      {recordings.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-600">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-cyan-400 font-semibold">{recordings.length}</div>
              <div className="text-slate-400 text-xs">Total</div>
            </div>
            <div>
              <div className="text-green-400 font-semibold">
                {recordings.filter(r => r.quality >= 0.9).length}
              </div>
              <div className="text-slate-400 text-xs">Legendary</div>
            </div>
            <div>
              <div className="text-purple-400 font-semibold">
                {formatDuration(recordings.reduce((sum, r) => sum + r.duration, 0) / recordings.length)}
              </div>
              <div className="text-slate-400 text-xs">Avg Duration</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MIDIPanel;
