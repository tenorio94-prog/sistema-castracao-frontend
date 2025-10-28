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

                {/* Campo Senha (Atualizado com SVGs OUTLINE) */}
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
                                       focus:outline-none"
                        >
                            {showPassword ? (
                                // Ícone "Olho Aberto" OUTLINE (baseado no que você enviou)
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            ) : (
                                // Ícone "Olho Cortado" OUTLINE (versão correspondente ao "outline")
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.981 7.757l-.001.001A2.25 2.25 0 001.5 9.75v3c0 1.034.626 1.94 1.501 2.328.112.052.232.109.358.18l3.429 2.062a2.25 2.25 0 002.183.336H16.5a2.25 2.25 0 002.244-2.071l-.138-.035L18.25 9.75v-.75m-8.625.108c1.325 0 2.502.5 3.397 1.342c.813.731 1.383 1.652 1.62 2.627v.001c.088.355.152.71.186 1.068.006.075.021.15.045.223h3.397A2.25 2.25 0 0021 12.75v-3a2.25 2.25 0 00-2.036-2.223A1.873 1.873 0 0116.5 6.75h-4.5V4.5A2.25 2.25 0 009.75 2.25L7.5 4.5V9C4.945 9 2.5 9.079 2.5 9.75v1.5c0 .38.258.714.625.861m6.75-2.613c1.33.204 2.548.874 3.528 1.872a4.5 4.5 0 01-3.957 5.728l-1.353-.298m0-.113A9.006 9.006 0 009 15.75c-1.332 0-2.584-.28-3.71-.806m.015-.028a4.5 4.5 0 01-.197-3.694l.799-.799c.945.046 1.876.177 2.787.398m-1.996.953l.002.002A2.25 2.25 0 0111.25 10.5h-1.5a.75.75 0 00-.75.75c0 .034.004.067.012.1m.789 2.775l-.002.002A2.25 2.25 0 019 13.5h1.5a.75.75 0 00.75-.75c0-.034-.004-.067-.012-.1M16.5 12.75v-.75m-4.5 0h-.008C12.001 12 12 12.034 12 12.067c0 .207.035.409.102.6m-4.5 0A9.006 9.006 0 003 15.75m.75-.083c-.097.166-.192.333-.284.5l-.234.35A.75.75 0 003.543 17H5.25v1.5a.75.75 0 00.75.75h1.5c.381 0 .736.216.902.56l.006.015c.012.029.027.058.044.085A.75.75 0 008.25 20.25h3.75a.75.75 0 00.75-.75V17.25H18a.75.75 0 00.75-.75V15h1.5a.75.75 0 00.75-.75V12.75c0-.662-.435-1.226-1.026-1.428" />
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