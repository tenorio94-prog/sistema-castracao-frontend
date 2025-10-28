// @/components/forms/loginForm.tsx

"use client"; 

import React, { useState } from 'react';

export default function LoginForm() {
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
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

                {/* Campo Senha (Atualizado com SVGs SÓLIDOS) */}
                <div className="flex flex-col text-left">
                    <label htmlFor="senha" className="text-sm font-medium text-[#2f6b2f] mb-1">
                        Senha
                    </label>
                    <div className="relative">
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            id="senha" 
                            name="senha"
                            placeholder="Digite sua senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                            className="w-full p-3 border border-[#3a773a] rounded-lg outline-none text-[#2e622e]
                                       focus:border-[#2e622e] focus:ring-1 focus:ring-[#2e622e] transition duration-150
                                       pr-10" // Espaço para o ícone
                        />
                        <button
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute inset-y-0 right-0 flex items-center pr-3
                                       text-[#3a773a] hover:text-[#2e622e]
                                       focus:outline-none" // Adicionado para remover o anel de foco azul no clique
                        >
                            {showPassword ? (
                                // Ícone "Olho Aberto" SÓLIDO (para 'ver senha')
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.18l3.75-5.63A1.65 1.65 0 015.908 3h8.184a1.65 1.65 0 011.493.78l3.75 5.63a1.65 1.65 0 010 1.18l-3.75 5.63A1.65 1.65 0 0114.092 17H5.908a1.65 1.65 0 01-1.493-.78L.664 10.59zM10 15a5 5 0 100-10 5 5 0 000 10z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                // Ícone "Olho Cortado" SÓLIDO (para 'ocultar senha')
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M3.28 2.47a.75.75 0 00-1.06 1.06l14.25 14.25a.75.75 0 101.06-1.06L3.28 2.47zM8.28 9.22a2.5 2.5 0 003.5 3.5l1.65-1.65a.75.75 0 00-1.06-1.06l-1.65 1.65a.75.75 0 00-1.06-1.06l-1.38-1.38zM10 15a5 5 0 100-10 5 5 0 000 10z" clipRule="evenodd" />
                                    <path d="M1.664 10.59a1.651 1.651 0 010-1.18l3.75-5.63A1.65 1.65 0 015.908 3h8.184a1.65 1.65 0 011.493.78l.842 1.263a.75.75 0 001.06-1.06L16.63 2.73a3.15 3.15 0 00-2.853-1.48H5.908a3.15 3.15 0 00-2.853 1.48L.304 8.27a3.15 3.15 0 000 2.26l2.75 4.125a.75.75 0 001.06-1.06l-1.803-2.704a1.65 1.65 0 010-1.18l.842-1.263zM12.9 10.59a1.65 1.65 0 01-1.088 1.466l-2.002 2.002a5 5 0 01-5.5-5.5l2.002-2.002A1.65 1.65 0 0112.9 10.59z" />
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