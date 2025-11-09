/**
 * 🎨 THEME SWITCHER COMPONENT
 * By PunkClaude & Radwulf - November 9, 2025
 * 
 * 3 THEMES DISPONIBLES:
 * - Classic: Profesional blanco/gris
 * - Dark: Elegante negro
 * - Cyberpunk Medical: Tech + Medical (DEFAULT)
 */

import React from 'react';
import { useTheme } from './ThemeContext';
import { ThemeType } from './themes';
import { cn } from '../utils/cn';

interface ThemeOption {
  id: ThemeType;
  name: string;
  description: string;
  icon: string;
  preview: {
    primary: string;
    secondary: string;
    background: string;
  };
}

const themeOptions: ThemeOption[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Profesional blanco y azul',
    icon: '☀️',
    preview: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      background: '#FFFFFF',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Elegante y moderno',
    icon: '🌙',
    preview: {
      primary: '#0EA5E9',
      secondary: '#A78BFA',
      background: '#0F172A',
    },
  },
  {
    id: 'cyberpunk-medical',
    name: 'Cyberpunk Medical',
    description: 'Tech + Medical (Por defecto)',
    icon: '🤖',
    preview: {
      primary: '#06B6D4',
      secondary: '#A78BFA',
      background: '#0F172A',
    },
  },
];

export const ThemeSwitcher: React.FC = () => {
  const { themeId, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Tema de Interfaz
        </h3>
        <span className="text-sm text-[var(--text-secondary)]">
          {themeOptions.find(t => t.id === themeId)?.icon}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {themeOptions.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={cn(
              'relative p-4 rounded-lg border-2 text-left transition-all duration-200',
              'hover:shadow-lg',
              themeId === theme.id
                ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)]/10'
                : 'border-[var(--border-main)] bg-[var(--bg-secondary)] hover:border-[var(--border-dark)]'
            )}
          >
            {/* Selected indicator */}
            {themeId === theme.id && (
              <div className="absolute top-3 right-3">
                <div className="w-3 h-3 rounded-full bg-[var(--color-primary-500)]" />
              </div>
            )}

            <div className="flex items-start gap-3">
              {/* Theme preview */}
              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-[var(--border-light)]">
                <div className="w-full h-full" style={{ background: theme.preview.background }}>
                  <div className="flex h-full">
                    <div
                      className="w-1/2 h-full"
                      style={{ background: theme.preview.primary }}
                    />
                    <div
                      className="w-1/2 h-full"
                      style={{ background: theme.preview.secondary }}
                    />
                  </div>
                </div>
              </div>

              {/* Theme info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{theme.icon}</span>
                  <h4 className="font-semibold text-[var(--text-primary)]">
                    {theme.name}
                  </h4>
                  {theme.id === 'cyberpunk-medical' && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                      Por defecto
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {theme.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="pt-3 border-t border-[var(--border-light)]">
        <p className="text-xs text-[var(--text-secondary)]">
          💡 El tema se guarda automáticamente en tu navegador
        </p>
      </div>
    </div>
  );
};
