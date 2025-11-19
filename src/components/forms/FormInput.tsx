// @/components/forms/FormInput.tsx
"use client";

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // Ícones consistentes com o resto do projeto

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

/**
 * Componente de Input reutilizável para formulários.
 * Inclui lógica para mostrar/esconder senhas e estilo modernizado.
 */
const FormInput: React.FC<FormInputProps> = (props) => {
  const { label, type, value, ...rest } = props;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="w-full">
      {/* Label atualizada: Uppercase, menor e mais bold para hierarquia visual */}
      <label 
        htmlFor={props.id || props.name} 
        className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide"
      >
        {label}
      </label>
      
      <div className="relative w-full">
        <input
          {...rest}
          id={props.id || props.name}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value ?? ''}
          // CSS Modernizado: 
          // - rounded-xl (mais moderno)
          // - border-gray-200 (mais suave)
          // - focus:ring-gray-900 (foco escuro elegante)
          // - py-2.5 (melhor área de toque)
          className={`w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-sm
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${props.disabled ? 'bg-gray-50' : ''}
            ${isPassword ? 'pr-10' : ''}
          `}
        />
        
        {/* Botão de Toggle de Senha */}
        {isPassword && (
          <button
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default FormInput;