"use client"; 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
            // Se for erro 500/502/503 e ainda temos tentativas, retry após delay
            if (err.message.includes('servidor') && attempt < 3) {
                toast.info(`Tentativa ${attempt} falhou`, {
                    description: `Tentando novamente em 3 segundos... (${attempt + 1}/3)`,
                    duration: 3000,
                });
                await new Promise(resolve => setTimeout(resolve, 3000));
                return attemptLogin(attempt + 1);
            }
            throw err;
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); 
        
        // Validações básicas
        if (!email || !email.trim()) {
            toast.error('Email obrigatório', {
                description: 'Por favor, informe seu email.',
                duration: 3000,
            });
            return;
        }

        if (!password || !password.trim()) {
            toast.error('Senha obrigatória', {
                description: 'Por favor, informe sua senha.',
                duration: 3000,
            });
            return;
        }

        // Validação de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Email inválido', {
                description: 'Por favor, informe um email válido.',
                duration: 3000,
            });
            return;
        }

        setIsLoading(true);

        try {
            // Tenta fazer login com retry automático
            const response = await attemptLogin();

            console.log('✅ Login bem-sucedido:', response);

            // Salvar tokens e obter informações do usuário
            const user = AuthService.saveTokens(response.accessToken, response.refreshToken);

            console.log('👤 Usuário decodificado:', user);

            if (!user) {
                throw new Error('Não foi possível decodificar as informações do usuário');
            }

            // Redirecionar baseado no role do usuário
            const redirectPath = AuthService.getRoleRoute(user.role);
            
            console.log('🔀 Redirecionando para:', redirectPath);
            console.log('🔑 Role do usuário:', user.role);

            // Toast de sucesso
            toast.success('Login realizado com sucesso!', {
                description: `Bem-vindo! Redirecionando...`,
                duration: 2000,
            });

            // Limpar o formulário
            setEmail('');
            setPassword('');

            // Usar window.location.href para garantir o redirecionamento
            setTimeout(() => {
                console.log('🚀 Executando redirecionamento...');
                window.location.href = redirectPath;
            }, 1000);

        } catch (err: any) {
            console.error('❌ Erro no login:', err);
            
            // Toast de erro específico baseado no tipo de erro
            if (err.message.includes('credenciais') || err.message.includes('senha') || err.message.includes('incorretos')) {
                toast.error('Credenciais inválidas', {
                    description: 'Email ou senha incorretos. Verifique e tente novamente.',
                    duration: 4000,
                });
            } else if (err.message.includes('rede') || err.message.includes('Network')) {
                toast.error('Erro de conexão', {
                    description: 'Verifique sua internet e tente novamente.',
                    duration: 4000,
                });
            } else if (err.message.includes('servidor') || err.message.includes('timeout')) {
                toast.error('Servidor indisponível', {
                    description: 'O servidor pode estar iniciando. Aguarde 30 segundos e tente novamente.',
                    duration: 5000,
                });
            } else {
                toast.error('Erro ao fazer login', {
                    description: err.message || 'Tente novamente mais tarde.',
                    duration: 4000,
                });
            }

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 w-full max-w-sm text-center 
                        bg-white/40 border-2 border-[#3a773a] 
                        rounded-lg text-[#2e622e] backdrop-blur-sm shadow-md">
            
            <h2 className="text-2xl font-semibold text-[#2f6b2f] mb-1">
                Log In
            </h2>
            
            <p className="mt-1 mb-4 text-gray-800">
                Insira os dados abaixo e acesse o sistema
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                
                {/* Campo Email */}
                <div className="flex flex-col text-left">
                    <label htmlFor="email" className="text-sm font-medium text-[#2f6b2f] mb-1">
                        Email
                    </label>
                    <input 
                        type="email"
                        id="email" 
                        name="email"
                        placeholder="seuemail@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="p-3 border border-[#3a773a] rounded-lg outline-none text-[#2e622e]
                                   focus:border-[#2e622e] focus:ring-1 focus:ring-[#2e622e] transition duration-150
                                   placeholder:text-[#3a773a] placeholder:opacity-80"
                        disabled={isLoading} 
                    />
                </div>

                {/* Campo Senha */}
                <div className="flex flex-col text-left">
                    <label htmlFor="password" className="text-sm font-medium text-[#2f6b2f] mb-1">
                        Senha
                    </label>
                    <input 
                        type="password" 
                        id="password"
                        name="password"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 border border-[#3a773a] rounded-lg outline-none text-[#2e622e]
                                   focus:border-[#2e622e] focus:ring-1 focus:ring-[#2e622e] transition duration-150"
                        disabled={isLoading}
                    />
                </div>
                
                {/* Botão de Entrar */}
                <button 
                    type="submit" 
                    className="mt-4 p-3 bg-[#3a773a] text-white font-semibold 
                               rounded-lg hover:bg-[#2e622e] transition duration-200
                               disabled:bg-gray-400 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2"
                    disabled={isLoading} 
                >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
            
        </div>
    );
}