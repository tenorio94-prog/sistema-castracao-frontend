"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Copy, RefreshCw, Check } from 'lucide-react';
import { toast } from 'sonner';

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hidePasswordGenerators?: boolean; // Nova prop para esconder botões de gerar/copiar
};

const FormInput: React.FC<FormInputProps> = (props) => {
  const { label, type, value, onChange, placeholder, hidePasswordGenerators, ...rest } = props;
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const isPassword = type === 'password';
  const finalPlaceholder = placeholder || label;

  const handleGeneratePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    let newPassword = "";
    for (let i = 0; i < 8; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    if (onChange) {
      const syntheticEvent = {
        target: { value: newPassword, name: props.name, type: 'password' }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
    
    setShowPassword(true);
    toast.success("Senha segura de 8 caracteres gerada!");
  };

  const handleCopyPassword = () => {
    if (!value || value.toString().length === 0) return;
    navigator.clipboard.writeText(value.toString());
    setCopied(true);
    toast.success("Senha copiada!");
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
          // Ajusta o padding dependendo se mostra os botões extras ou só o olho
          className={`w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-sm
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${props.disabled ? 'bg-gray-50' : ''}
            ${isPassword ? (hidePasswordGenerators ? 'pr-10' : 'pr-28') : ''} 
          `}
        />
        
        {isPassword && !props.disabled && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
            
            {/* Botões de Gerar/Copiar (Só aparecem se hidePasswordGenerators for false/undefined) */}
            {!hidePasswordGenerators && (
              <>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Gerar senha"
                >
                  <RefreshCw size={16} />
                </button>

                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                  title="Copiar senha"
                >
                  {copied ? <Check size={16} className="text-green-600"/> : <Copy size={16} />}
                </button>

                <div className="h-4 w-px bg-gray-200 mx-0.5"></div>
              </>
            )}

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