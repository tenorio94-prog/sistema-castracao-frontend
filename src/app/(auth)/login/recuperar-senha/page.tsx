"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import FormInput from '@/components/forms/FormInput'; 

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.warning('Por favor, informe seu e-mail.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulação de envio (Delay para parecer real)
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      setIsSent(true);
      toast.success('Link enviado com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar solicitação.');
    } finally {
      setIsLoading(false);
    }
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
                <span className="flex items-center gap-2">Enviando...</span>
              ) : (
                <>
                  <Send size={18} />
                  <span>Enviar Link</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6">
             <div className="bg-green-50 text-green-800 p-5 rounded-xl text-sm border border-green-100 flex flex-col items-center gap-2">
               <CheckCircle size={24} className="text-green-600"/>
               <p>
                 Um e-mail foi enviado para <strong>{email}</strong> com um link seguro para criar uma nova senha.
               </p>
             </div>
             
             <button 
               onClick={() => setIsSent(false)}
               className="text-sm text-gray-500 hover:text-gray-900 underline font-medium"
             >
               Não recebeu? Tentar novamente
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