import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, UserIcon } from '@heroicons/react/24/outline';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface PatientAutocompleteProps {
  patients: Patient[];
  value: string;
  onChange: (patientId: string) => void;
  placeholder?: string;
  className?: string;
  showDetectedIcon?: boolean;
}

export const PatientAutocomplete: React.FC<PatientAutocompleteProps> = ({
  patients,
  value,
  onChange,
  placeholder = "Buscar paciente...",
  className = "",
  showDetectedIcon = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find selected patient
  const selectedPatient = patients.find(p => p.id === value);
  
  // Filter patients based on search term
  const filteredPatients = patients
    .filter(patient => {
      if (!searchTerm) return true;
      const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    })
    .slice(0, 15); // Limit to 15 results max

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
    setSelectedIndex(-1);
    
    // If input is cleared, clear selection
    if (!term) {
      onChange('');
    }
  };

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    onChange(patient.id);
    setSearchTerm(`${patient.first_name} ${patient.last_name}`);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Handle special options
  const handleSpecialSelect = (value: string, label: string) => {
    onChange(value);
    setSearchTerm(label);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    const totalOptions = 2 + filteredPatients.length; // 2 special options + patients

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalOptions);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalOptions - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex === 0) {
          handleSpecialSelect('', 'Seleccionar paciente...');
        } else if (selectedIndex === 1) {
          handleSpecialSelect('virtual-clinic', '🏥 Clínica Virtual');
        } else if (selectedIndex >= 2 && selectedIndex < totalOptions) {
          const patient = filteredPatients[selectedIndex - 2];
          if (patient) handlePatientSelect(patient);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Update search term when value changes externally
  useEffect(() => {
    if (value === '') {
      setSearchTerm('');
    } else if (value === 'virtual-clinic') {
      setSearchTerm('🏥 Clínica Virtual');
    } else if (selectedPatient) {
      setSearchTerm(`${selectedPatient.first_name} ${selectedPatient.last_name}`);
    }
  }, [value, selectedPatient]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full text-sm border border-gray-300 rounded px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          {showDetectedIcon && value && value !== 'virtual-clinic' && (
            <span className="text-green-500 mr-1" title="Paciente detectado automáticamente">🎯</span>
          )}
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Special Options */}
          <button
            type="button"
            onClick={() => handleSpecialSelect('', 'Seleccionar paciente...')}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${
              selectedIndex === 0 ? 'bg-blue-100' : ''
            }`}
          >
            <UserIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Seleccionar paciente...</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleSpecialSelect('virtual-clinic', '🏥 Clínica Virtual')}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${
              selectedIndex === 1 ? 'bg-blue-100' : ''
            }`}
          >
            <span>🏥</span>
            <span>Clínica Virtual (sin paciente específico)</span>
          </button>

          {/* Patients */}
          {filteredPatients.length > 0 && (
            <>
              <div className="border-t border-gray-200"></div>
              {filteredPatients.map((patient, index) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => handlePatientSelect(patient)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                    selectedIndex === index + 2 ? 'bg-blue-100' : ''
                  }`}
                >
                  <UserIcon className="h-4 w-4 text-blue-500" />
                  <span>{patient.first_name} {patient.last_name}</span>
                  {showDetectedIcon && value === patient.id && (
                    <span className="text-green-500" title="Paciente detectado automáticamente">🎯</span>
                  )}
                </button>
              ))}
            </>
          )}

          {/* No results */}
          {searchTerm && filteredPatients.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              No se encontraron pacientes para "{searchTerm}"
            </div>
          )}

          {/* Results limit indicator */}
          {filteredPatients.length === 15 && (
            <div className="px-3 py-2 text-xs text-gray-400 text-center border-t">
              Mostrando primeros 15 resultados. Continúa escribiendo para refinar...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
