"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import FormInput from '@/components/forms/FormInput';

function RedefinirSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Validar se há token na URL
  useEffect(() => {
    if (!token) {
      toast.error('Token inválido', {
        description: 'Link de recuperação inválido ou expirado.',
      });
      setTimeout(() => router.push('/login/recuperar-senha'), 2000);
    }
  }, [token, router]);

  // Avaliar força da senha
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength('weak');
      return;
    }

    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (newPassword.length >= 12) strength++;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^a-zA-Z0-9]/.test(newPassword)) strength++;

    if (strength <= 2) setPasswordStrength('weak');
    else if (strength <= 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  }, [newPassword]);

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'Fraca';
      case 'medium': return 'Média';
      case 'strong': return 'Forte';
    }
  };

  const validatePassword = () => {
    if (!newPassword || newPassword.length < 6) {
      toast.warning('Senha muito curta', {
        description: 'A senha deve ter no mínimo 6 caracteres.',
      });
      return false;
    }

    if (newPassword !== confirmPassword) {
      toast.warning('Senhas não conferem', {
        description: 'As senhas digitadas não são iguais.',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) return;

    setIsLoading(true);

    // ⚠️ MOCKADO - Simulação de redefinição de senha
    setTimeout(() => {
      setIsSuccess(true);
      setIsLoading(false);
      
      toast.info('Funcionalidade em desenvolvimento', {
        description: 'Esta é uma simulação. Entre em contato com o administrador para alterar sua senha.',
        duration: 6000,
      });

      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }, 1500);
  };

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link Inválido</h2>
          <p className="text-gray-500 text-sm">
            Este link é inválido ou já foi utilizado.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-700'} rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300`}>
            {isSuccess ? <CheckCircle size={32} /> : <Lock size={32} />}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isSuccess ? 'Senha Redefinida!' : 'Nova Senha'}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {isSuccess 
              ? "Sua senha foi alterada com sucesso."
              : "Digite sua nova senha abaixo."}
          </p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Aviso de Funcionalidade Mockada */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Funcionalidade em Desenvolvimento
                </p>
                <p className="text-xs text-yellow-700">
                  A redefinição de senha está temporariamente desabilitada. Entre em contato com o administrador.
                </p>
              </div>
            </div>

            {/* Nova Senha */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  disabled={isLoading}
                  required
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Indicador de força da senha */}
              {newPassword && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded ${newPassword.length > 0 ? getStrengthColor() : 'bg-gray-200'}`}></div>
                    <div className={`h-1 flex-1 rounded ${passwordStrength !== 'weak' ? getStrengthColor() : 'bg-gray-200'}`}></div>
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? getStrengthColor() : 'bg-gray-200'}`}></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Força da senha: <span className="font-medium">{getStrengthText()}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite novamente sua senha"
                  disabled={isLoading}
                  required
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Validação visual de senha igual */}
              {confirmPassword && (
                <div className="flex items-center gap-2 text-xs">
                  {newPassword === confirmPassword ? (
                    <>
                      <CheckCircle size={14} className="text-green-600" />
                      <span className="text-green-600 font-medium">Senhas conferem</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} className="text-red-600" />
                      <span className="text-red-600 font-medium">Senhas não conferem</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Dicas de senha */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-xs text-blue-800 font-medium mb-2">💡 Dicas para uma senha forte:</p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>Mínimo de 6 caracteres (recomendado 8+)</li>
                <li>Combine letras maiúsculas e minúsculas</li>
                <li>Inclua números e caracteres especiais</li>
              </ul>
            </div>

            <button 
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md shadow-gray-200"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">Processando...</span>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Redefinir Senha (Mock)</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-blue-50 text-blue-800 p-5 rounded-xl text-sm border border-blue-100 flex flex-col items-center gap-2">
              <AlertCircle size={24} className="text-blue-600"/>
              <p className="font-medium">Funcionalidade em Desenvolvimento</p>
              <p>
                Em um ambiente real, sua senha seria alterada neste momento.
              </p>
              <p className="text-xs mt-2 text-blue-700">
                Entre em contato com o administrador do sistema para alterar sua senha.
              </p>
            </div>
            
            <Link 
              href="/login"
              className="inline-block text-sm text-gray-500 hover:text-gray-900 underline font-medium"
            >
              Voltar para o login
            </Link>
          </div>
        )}        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
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

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Lock size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Carregando...</h2>
          <p className="text-gray-500 text-sm">
            Aguarde enquanto validamos seu link.
          </p>
        </div>
      </main>
    }>
      <RedefinirSenhaContent />
    </Suspense>
  );
}
