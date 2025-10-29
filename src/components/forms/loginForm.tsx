"use client"; 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    // 1. Mudamos de 'cpf' para 'email' e 'senha' para 'password'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); 
        setIsLoading(true);     
        setError(null);         

        // 2. URL da API definida corretamente
        const API_URL = "https://sistema-castracao-backend.onrender.com/api/auth/login"; 

        try {
            const response = await fetch(API_URL, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                // 3. Enviando 'email' e 'password' (como a API espera)
                body: JSON.stringify({ 
                    email: email, 
                    password: password 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Tenta pegar a mensagem de erro da API (se houver)
                throw new Error(data.message || 'Email ou senha incorretos.');
            }

            // --- SUCESSO! ---
            console.log('Login bem-sucedido:', data);

            // Exemplo: Salvar o token de acesso (retornado pela API) no localStorage
            // para usar em outras requisições autenticadas.
            if (data.accessToken) {
                 localStorage.setItem('accessToken', data.accessToken); 
            }
             if (data.refreshToken) {
                 localStorage.setItem('refreshToken', data.refreshToken);
             }

            // 4. Redirecionar o usuário para a rota /adm
            router.push('/adm'); 

        } catch (err: any) {
            console.error('Erro no login:', err);
            setError(err.message); 

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