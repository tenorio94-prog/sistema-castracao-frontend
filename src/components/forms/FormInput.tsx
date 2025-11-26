"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Copy, RefreshCw, Check } from 'lucide-react';
import { toast } from 'sonner';

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

/**
 * Componente de Input reutilizável.
 * - Placeholder automático baseado na label.
 * - Funcionalidades avançadas para input de senha (Gerar, Copiar, Visualizar).
 */
const FormInput: React.FC<FormInputProps> = (props) => {
  const { label, type, value, onChange, placeholder, ...rest } = props;
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const isPassword = type === 'password';

  // Define o placeholder: usa o passado via props OU o próprio label
  const finalPlaceholder = placeholder || label;

  // Função para gerar senha aleatória
  const handleGeneratePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    let newPassword = "";
    // Ajustado para 8 caracteres conforme solicitado
    for (let i = 0; i < 8; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Cria um evento sintético para atualizar o estado do componente pai
    // Isso permite que o `onChange` do formulário pai funcione como se o usuário tivesse digitado
    if (onChange) {
      const syntheticEvent = {
        target: {
          value: newPassword,
          name: props.name,
          type: 'password'
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onChange(syntheticEvent);
    }
    
    // Mostra a senha gerada para o usuário ver
    setShowPassword(true);
    toast.success("Senha segura de 8 caracteres gerada!");
  };

  // Função para copiar senha
  const handleCopyPassword = () => {
    if (!value || value.toString().length === 0) return;
    
    navigator.clipboard.writeText(value.toString());
    setCopied(true);
    toast.success("Senha copiada para a área de transferência");
    
    // Reseta o ícone de check após 2 segundos
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
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
          onChange={onChange}
          placeholder={finalPlaceholder}
          // Se for senha, adicionamos padding extra na direita para caber os 3 botões
          className={`w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-sm
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${props.disabled ? 'bg-gray-50' : ''}
            ${isPassword ? 'pr-28' : ''} 
          `}
        />
        
        {/* Ações de Senha (Gerar, Copiar, Visualizar) */}
        {isPassword && !props.disabled && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
            
            {/* Botão Gerar Senha */}
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Gerar senha aleatória (8 chars)"
            >
              <RefreshCw size={16} />
            </button>

            {/* Botão Copiar Senha */}
            <button
              type="button"
              onClick={handleCopyPassword}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
              title="Copiar senha"
            >
              {copied ? <Check size={16} className="text-green-600"/> : <Copy size={16} />}
            </button>

            {/* Divisória Pequena */}
            <div className="h-4 w-px bg-gray-200 mx-0.5"></div>

            {/* Botão Toggle Visualizar */}
            <button
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title={showPassword ? "Esconder senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormInput;