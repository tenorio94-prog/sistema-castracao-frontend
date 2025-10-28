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
        
        // Aqui você faria a chamada à API (ex: usando 'fetch' ou 'axios')
        // Exemplo: fetch('/api/login', { method: 'POST', body: JSON.stringify({ cpf, senha }) })
    };

    return (
        <div className="login-box">
            <h2>Painel do Administrador</h2>
            <p>Insira os dados abaixo e acesse o sistema</p>

            <form onSubmit={handleSubmit}>
                <label htmlFor="cpf">CPF/CRMV</label>
                <input 
                    type="text" 
                    id="cpf" 
                    name="cpf"
                    placeholder="000.000.000-00 ou NIS" 
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    required
                />

                <label htmlFor="senha">Senha</label>
                <input 
                    type="password" 
                    id="senha" 
                    name="senha"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                />

                <button type="submit" className="btn-entrar">
                    Entrar
                </button>
            </form>

            <hr />

            <button type="button" className="btn-primeiro-acesso">
                Primeiro Acesso?
            </button>
        </div>
    );
}