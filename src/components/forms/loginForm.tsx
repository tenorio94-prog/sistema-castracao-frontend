// @/components/forms/loginForm.tsx

"use client"; 

import React, { useState } from 'react';

export default function LoginForm() {
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    // [REMOVIDO] O estado 'showPassword' não é mais necessário

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

                {/* Campo Senha (Simplificado, sem toggle) */}
                <div className="flex flex-col text-left">
                    <label htmlFor="senha" className="text-sm font-medium text-[#2f6b2f] mb-1">
                        Senha
                    </label>
                    <input 
                        type="password" // <-- Definido permanentemente como 'password'
                        id="senha" 
                        name="senha"
                        placeholder="Digite sua senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        className="w-full p-3 border border-[#3a773a] rounded-lg outline-none text-[#2e622e]
                                   focus:border-[#2e622e] focus:ring-1 focus:ring-[#2e622e] transition duration-150"
                        // [REMOVIDO] A classe 'pr-10' e o 'div relative'
                    />
                    {/* [REMOVIDO] O botão com o ícone de olho foi retirado */}
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