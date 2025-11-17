// @/components/forms/TipoResponsavelRadio.tsx
"use client";

import React from 'react';

// 1. Definição das Props
type TipoResponsavelProps = {
  tipo: 'PF' | 'ONG';
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

/**
 * Componente de Rádio para selecionar PF (Pessoa Física) ou ONG.
 */
const TipoResponsavelRadio: React.FC<TipoResponsavelProps> = ({ tipo, onChange, disabled = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-600">Tipo de Responsável</label>
    <div className="flex gap-6">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="tipoResponsavel"
          value="PF"
          checked={tipo === 'PF'}
          onChange={onChange}
          disabled={disabled}
          className="w-4 h-4 text-green-600 focus:ring-green-500"
        />
        Pessoa Física
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="tipoResponsavel"
          value="ONG"
          checked={tipo === 'ONG'}
          onChange={onChange}
          disabled={disabled}
          className="w-4 h-4 text-green-600 focus:ring-green-500"
        />
        ONG
      </label>
    </div>
  </div>
);

export default TipoResponsavelRadio;