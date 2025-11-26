"use client"; 

import React, { useState } from 'react';
import Link from 'next/link'; // Importado para o link de esqueceu a senha
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Loader2, LogIn } from 'lucide-react';
import FormInput from '@/components/forms/FormInput'; 

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const attemptLogin = async (attempt: number = 1): Promise<any> => {
        try {
            const response = await AuthService.login({ email, password });
            return response;
        } catch (err: any) {
            if (err.message.includes('servidor') && attempt < 3) {
                toast.info(`Tentativa ${attempt} falhou`, {
                    description: `Tentando novamente em 3 segundos... (${attempt + 1}/3)`,
                });
                await new Promise(resolve => setTimeout(resolve, 3000));
                return attemptLogin(attempt + 1);
            }
            throw err;
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); 
        
        if (!email?.trim()) {
            toast.warning('Email obrigatório');
            return;
        }
        if (!password?.trim()) {
            toast.warning('Senha obrigatória');
            return;
        }

        setIsLoading(true);

        try {
            const response = await attemptLogin();
            const user = AuthService.saveTokens(response.accessToken, response.refreshToken);

            if (!user) throw new Error('Falha ao decodificar usuário');

            const redirectPath = AuthService.getRoleRoute(user.role);
            
            const userName = (user as any).completeName || (user as any).name || 'Usuário';
            
            toast.success(`Bem-vindo, ${userName.split(' ')[0]}!`, {
                description: 'Redirecionando para o painel...',
                duration: 2000,
            });

            setTimeout(() => {
                window.location.href = redirectPath;
            }, 800);

        } catch (err: any) {
            console.error('Login error:', err);
            
            if (err.message.includes('credenciais') || err.message.includes('senha') || err.message.includes('401')) {
                toast.error('Acesso Negado', { description: 'Email ou senha incorretos.' });
            } else if (err.message.includes('rede') || err.message.includes('Network')) {
                toast.error('Erro de Conexão', { description: 'Verifique sua internet.' });
            } else {
                toast.error('Erro no Login', { description: 'Ocorreu um erro inesperado. Tente novamente.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            
            <FormInput 
                label="Email"
                id="email"
                name="email"
                type="email"
                placeholder="exemplo@veterinaria.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
            />

            <div className="flex flex-col gap-1">
                <FormInput 
                    label="Senha"
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    hidePasswordGenerators={true} // Esconde botões de gerar/copiar
                />
                <div className="text-right">
                    <Link 
                        href="/login/recuperar-senha" 
                        className="text-xs font-medium text-green-700 hover:text-green-800 hover:underline"
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