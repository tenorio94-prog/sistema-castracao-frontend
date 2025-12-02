"use client"; 

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Loader2, LogIn, AlertCircle } from 'lucide-react';
import FormInput from '@/components/forms/FormInput'; 

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ email?: boolean; password?: boolean }>({});
    
    const emailInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Focar no campo de email ao montar
    useEffect(() => {
        emailInputRef.current?.focus();
    }, []);

    // Limpar erro quando usuário começa a digitar
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) setError(null);
        if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: false }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (error) setError(null);
        if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: false }));
    };

    const attemptLogin = async (attempt: number = 1): Promise<any> => {
        try {
            const response = await AuthService.login({ email, password });
            return response;
        } catch (err: any) {
            // Retry apenas para erros de servidor (não para credenciais inválidas)
            if ((err.message.includes('servidor') || err.message.includes('indisponível')) && attempt < 3) {
                toast.info(`Tentativa ${attempt} falhou`, {
                    description: `Servidor iniciando... Tentando novamente (${attempt}/3)`,
                });
                await new Promise(resolve => setTimeout(resolve, 3000));
                return attemptLogin(attempt + 1);
            }
            throw err;
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        // Reset estados de erro
        setError(null);
        setFieldErrors({});
        
        // Validação dos campos
        const newFieldErrors: { email?: boolean; password?: boolean } = {};
        
        if (!email?.trim()) {
            newFieldErrors.email = true;
            toast.warning('Email obrigatório', {
                description: 'Por favor, insira seu email.'
            });
        }
        
        if (!password?.trim()) {
            newFieldErrors.password = true;
            toast.warning('Senha obrigatória', {
                description: 'Por favor, insira sua senha.'
            });
        }
        
        if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            return;
        }

        setIsLoading(true);

        try {
            const response = await attemptLogin();
            const user = AuthService.saveTokens(response.accessToken, response.refreshToken);

            if (!user) {
                throw new Error('Falha ao processar resposta do servidor');
            }

            const redirectPath = AuthService.getRoleRoute(user.role);
            const userName = (user as any).completeName || (user as any).name || 'Usuário';
            
            toast.success(`Bem-vindo, ${userName.split(' ')[0]}!`, {
                description: 'Redirecionando para o painel...',
                duration: 2000,
            });

            // Usar router.push para SPA navigation, com fallback para window.location
            setTimeout(() => {
                router.push(redirectPath);
            }, 800);

        } catch (err: any) {
            console.error('Login error:', err);
            
            let errorMessage = 'Ocorreu um erro inesperado. Tente novamente.';
            let errorDescription = '';
            let shouldClearPassword = false;
            
            // Determinar tipo de erro e mensagem apropriada
            if (err.message.includes('credenciais') || err.message.includes('senha') || err.message.includes('401') || err.message.includes('incorretos')) {
                errorMessage = 'Email ou senha incorretos';
                errorDescription = 'Verifique suas credenciais e tente novamente.';
                shouldClearPassword = true;
                setFieldErrors({ email: true, password: true });
            } else if (err.message.includes('rede') || err.message.includes('Network') || err.message.includes('conexão')) {
                errorMessage = 'Erro de conexão';
                errorDescription = 'Verifique sua internet e tente novamente.';
            } else if (err.message.includes('servidor') || err.message.includes('500') || err.message.includes('indisponível')) {
                errorMessage = 'Servidor indisponível';
                errorDescription = 'O servidor está iniciando. Aguarde alguns segundos.';
            } else {
                errorMessage = 'Erro no login';
                errorDescription = err.message || 'Tente novamente em instantes.';
            }
            
            // Definir erro para exibir no formulário
            setError(errorMessage);
            
            // Mostrar toast de erro
            toast.error(errorMessage, { 
                description: errorDescription,
                duration: 5000,
            });
            
            // Limpar apenas a senha em caso de credenciais inválidas
            if (shouldClearPassword) {
                setPassword('');
            }
            
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            
            {/* Mensagem de erro inline */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}
            
            <FormInput 
                ref={emailInputRef}
                label="Email"
                id="email"
                name="email"
                type="email"
                placeholder="exemplo@veterinaria.com"
                value={email}
                onChange={handleEmailChange}
                disabled={isLoading}
                required
                autoComplete="email"
                className={fieldErrors.email ? 'border-red-300 focus:ring-red-500' : ''}
            />

            <div className="flex flex-col gap-1">
                <FormInput 
                    label="Senha"
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                    required
                    autoComplete="current-password"
                    hidePasswordGenerators={true}
                    className={fieldErrors.password ? 'border-red-300 focus:ring-red-500' : ''}
                />
                <div className="text-right">
                    <Link 
                        href="/login/recuperar-senha" 
                        className="text-xs font-medium text-green-700 hover:text-green-800 hover:underline"
                        tabIndex={isLoading ? -1 : 0}
                    >
                        Esqueceu sua senha?
                    </Link>
                </div>
            </div>
            
            <button 
                type="submit" 
                className="mt-2 w-full py-2.5 bg-gray-900 text-white font-bold rounded-xl 
                           hover:bg-gray-800 active:scale-[0.99] transition-all duration-200
                           disabled:bg-gray-300 disabled:cursor-not-allowed disabled:active:scale-100
                           flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                disabled={isLoading} 
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Autenticando...</span>
                    </>
                ) : (
                    <>
                        <LogIn className="h-5 w-5" />
                        <span>Acessar</span> 
                    </>
                )}
            </button>
        </form>
    );
}