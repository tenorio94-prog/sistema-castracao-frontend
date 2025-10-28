// LoginForm.tsx

"use client"; // ESSENCIAL: Permite usar estados e eventos.

import React, { useState } from 'react';

export default function LoginForm() {
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        // ** Lógica de autenticação: **
        console.log('Formulário de login submetido com:', { 
            cpf: cpf, 
            senha: senha 
        });
        
        // Aqui você faria a chamada à API
    };

    return (
        // .login-box: Container principal com fundo branco semi-transparente, borda e padding
        <div className="p-8 w-full max-w-sm text-center 
                        bg-white/40 border-2 border-green-700 
                        rounded-lg text-green-800 backdrop-blur-sm">
            
            {/* Título (h2) */}
            <h2 className="text-2xl font-bold text-green-800 mb-1">
                Painel do Administrador
            </h2>
            
            {/* Subtítulo (p) */}
            <p className="mt-1 mb-4 text-gray-700">
                Insira os dados abaixo e acesse o sistema
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                
                {/* Campo CPF/CRMV */}
                <div className="flex flex-col text-left">
                    <label htmlFor="cpf" className="text-sm font-medium text-green-800 mb-1">
                        CPF/CRMV
                    </label>
                    <input 
                        type="text" 
                        id="cpf" 
                        name="cpf"
                        placeholder="000.000.000-00 ou NIS" 
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        required
                        // Estilos do input
                        className="p-3 border border-green-700 rounded-lg outline-none 
                                   focus:ring-2 focus:ring-green-800 transition duration-150"
                    />
                </div>

                {/* Campo Senha */}
                <div className="flex flex-col text-left">
                    <label htmlFor="senha" className="text-sm font-medium text-green-800 mb-1">
                        Senha
                    </label>
                    <input 
                        type="password" 
                        id="senha" 
                        name="senha"
                        placeholder="Digite sua senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        // Estilos do input
                        className="p-3 border border-green-700 rounded-lg outline-none 
                                   focus:ring-2 focus:ring-green-800 transition duration-150"
                    />
                </div>

                {/* Botão de Entrar (.btn-entrar) */}
                <button 
                    type="submit" 
                    // Estilos do botão
                    className="mt-4 p-3 bg-green-700 text-white font-semibold 
                               rounded-lg hover:bg-green-800 transition duration-200"
                >
                    Entrar
                </button>
            </form>

            {/* Separador (hr) */}
            <hr className="my-6 border-t border-gray-400" />

            {/* Botão de Primeiro Acesso (.btn-primeiro-acesso) */}
            <button 
                type="button" 
                // Estilos do botão secundário
                className="w-full p-3 bg-transparent text-green-700 
                           border border-green-700 rounded-lg font-medium 
                           hover:bg-green-100 transition duration-200"
            >
                Primeiro Acesso?
            </button>
        </div>
    );
}