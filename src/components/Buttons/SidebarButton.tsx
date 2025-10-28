// @/components/forms/loginForm.tsx

"use client"; 

import React, { useState } from 'react';

export default function LoginForm() {
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    
    // 1. Novo estado para controlar a visibilidade da senha
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('Formulário de login submetido com:', { 
            cpf: cpf, 
            senha: senha 
        });
        // ...lógica de autenticação
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
                
                {/* Campo CPF */}
                <div className="flex flex-col text-left">
                    <label htmlFor="cpf" className="text-sm font-medium text-[#2f6b2f] mb-1">
                        CPF
                    </label>
                    <input 
                        type="text" 
                        id="cpf" 
                        name="cpf"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        required
                        className="p-3 border border-[#3a773a] rounded-lg outline-none text-[#2e622e]
                                   focus:border-[#2e622e] focus:ring-1 focus:ring-[#2e622e] transition duration-150
                                   placeholder:text-[#3a773a] placeholder:opacity-80"
                    />
                </div>

                {/* Campo Senha (Atualizado) */}
                <div className="flex flex-col text-left">
                    <label htmlFor="senha" className="text-sm font-medium text-[#2f6b2f] mb-1">
                        Senha
                    </label>
                    {/* 3. Wrapper com 'relative' para posicionar o botão */}
                    <div className="relative">
                        <input 
                            // 2. 'type' dinâmico
                            type={showPassword ? 'text' : 'password'} 
                            id="senha" 
                            name="senha"
                            placeholder="Digite sua senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                            // Adicionado 'pr-10' (padding-right) para o texto não ficar atrás do ícone
                            className="w-full p-3 border border-[#3a773a] rounded-lg outline-none text-[#2e622e]
                                       focus:border-[#2e622e] focus:ring-1 focus:ring-[#2e622e] transition duration-150
                                       pr-10" // Espaço para o ícone
                        />
                        {/* 3. Botão do ícone */}
                        <button
                            type="button" // Importante: 'type="button"' para não submeter o form
                            onClick={() => setShowPassword(!showPassword)} // Lógica para trocar o estado
                            className="absolute inset-y-0 right-0 flex items-center pr-3
                                       text-[#3a773a] hover:text-[#2e622e]"
                        >
                            {/* Renderização condicional do ícone */}
                            {showPassword ? (
                                // Ícone "Olho Cortado" (senha visível)
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.770M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                                </svg>
                            ) : (
                                // Ícone "Olho" (senha oculta)
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.43-7.58a1.012 1.012 0 011.664 0l4.43 7.58a1.012 1.012 0 010 .639l-4.43 7.58a1.012 1.012 0 01-1.664 0l-4.43-7.58z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Botão de Entrar */}
                <button 
                    type="submit" 
                    className="mt-4 p-3 bg-[#3a773a] text-white font-semibold 
                               rounded-lg hover:bg-[#2e622e] transition duration-200"
                >
                    Entrar
                </button>
            </form>
            
        </div>
    );
}