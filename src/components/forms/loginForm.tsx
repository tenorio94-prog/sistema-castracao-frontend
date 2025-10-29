"use client"; 

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useUsuarios';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error } = useAuth();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        try {
            await login({ email, password });
            // Redirecionamento é feito automaticamente no hook baseado no role
        } catch (err) {
            // Erro já é tratado e exibido pelo hook
            console.error('Erro no login:', err);
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
                
                {/* 5. Campo Email (em vez de CPF) */}
                <div className="flex flex-col text-left">
                    <label htmlFor="email" className="text-sm font-medium text-[#2f6b2f] mb-1">
                        Email
                    </label>
                    <input 
                        type="email" // Tipo mudado para 'email'
                        id="email" 
                        name="email"
                        placeholder="seuemail@exemplo.com" // Placeholder atualizado
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} // Estado atualizado
                        required
                        className="p-3 border border-[#3a773a] rounded-lg outline-none text-[#2e622e]
                                   focus:border-[#2e622e] focus:ring-1 focus:ring-[#2e622e] transition duration-150
                                   placeholder:text-[#3a773a] placeholder:opacity-80"
                        disabled={isLoading} 
                    />
                </div>

                {/* 6. Campo Senha (atualizado para 'password') */}
                <div className="flex flex-col text-left">
                    <label htmlFor="password" className="text-sm font-medium text-[#2f6b2f] mb-1">
                        Senha
                    </label>
                    <input 
                        type="password" 
                        id="password" // ID atualizado
                        name="password" // Name atualizado
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} // Estado atualizado
                        required
                        className="w-full p-3 border border-[#3a773a] rounded-lg outline-none text-[#2e622e]
                                   focus:border-[#2e622e] focus:ring-1 focus:ring-[#2e622e] transition duration-150"
                        disabled={isLoading}
                    />
                
                </div>

                {/* Mensagem de erro */}
                {error && (
                    <div className="text-red-600 text-sm text-center -mb-2">
                        {error}
                    </div>
                )}

                {/* Botão de Entrar */}
                <button 
                    type="submit" 
                    className="mt-4 p-3 bg-[#3a773a] text-white font-semibold 
                               rounded-lg hover:bg-[#2e622e] transition duration-200
                               disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={isLoading} 
                >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
            
        </div>
    );
}