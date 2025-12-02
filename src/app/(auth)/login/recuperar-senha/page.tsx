"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import FormInput from '@/components/forms/FormInput'; 

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de email
    if (!email.trim()) {
      toast.warning('Por favor, informe seu e-mail.');
      return;
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.warning('Email inválido', {
        description: 'Por favor, insira um email válido.',
      });
      return;
    }

    setIsLoading(true);

    // ⚠️ MOCKADO - Simulação de envio de email
    setTimeout(() => {
      setIsSent(true);
      setIsLoading(false);
      
      toast.success('Solicitação recebida!', {
        description: 'Esta funcionalidade está em desenvolvimento. Entre em contato com o administrador.',
        duration: 6000,
      });
    }, 1500);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Recuperar Senha</h1>
          <p className="text-gray-500 mt-2 text-sm">
            {!isSent 
              ? "Informe seu e-mail cadastrado para receber as instruções."
              : "Verifique sua caixa de entrada."}
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Aviso de Funcionalidade Mockada */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Funcionalidade em Desenvolvimento
                </p>
                <p className="text-xs text-yellow-700">
                  O envio de emails está temporariamente desabilitado. Esta é uma simulação. 
                  Para recuperar sua senha, entre em contato com o administrador do sistema.
                </p>
              </div>
            </div>

            <FormInput 
              label="E-mail Cadastrado"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@veterinaria.com"
              required
              disabled={isLoading}
            />

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 shadow-md shadow-gray-200"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processando...</span>
                </span>
              ) : (
                <>
                  <Send size={18} />
                  <span>Solicitar Recuperação (Mock)</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6">
             <div className="bg-blue-50 text-blue-800 p-5 rounded-xl text-sm border border-blue-100 flex flex-col items-center gap-2">
               <AlertTriangle size={24} className="text-blue-600"/>
               <p className="font-medium">Funcionalidade em Desenvolvimento</p>
               <p>
                 Em um ambiente real, um email seria enviado para <strong>{email}</strong> com instruções de recuperação.
               </p>
               <p className="text-xs mt-2 text-blue-700">
                 Por favor, entre em contato com o administrador do sistema para recuperar sua senha.
               </p>
             </div>
             
             <button 
               onClick={() => setIsSent(false)}
               className="text-sm text-gray-500 hover:text-gray-900 underline font-medium"
             >
               Tentar outro email
             </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar para o Login
          </Link>
        </div>

      </div>
    </main>
  );
}