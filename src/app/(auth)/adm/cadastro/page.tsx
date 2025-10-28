'use client';

import React, { useState } from 'react';
import './FormCadastro.css';

interface FormCadastroProps {
  onSearch: (identifier: string) => void;
  onBackToLogin: () => void;
}

const FormCadastro: React.FC<FormCadastroProps> = ({ onSearch, onBackToLogin }) => {
  const [identifier, setIdentifier] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(identifier);
  };

  return (
    <div className="container">
      <div className="img-container">

        <img src="/img.png" alt="Ilustração de pessoas com animais" />
      </div>

      {/* Lado direito */}
      <div className="back">
        <div className="login-wrapper">
          <div className="login-box">
            <h2>Seu primeiro acesso!!</h2>
            <p>Perfeito! Vamos primeiro buscar seu cadastro</p>

            <form onSubmit={handleSubmit}>
              <label htmlFor="cpf">CPF ou CRMV</label>
              <input
                type="text"
                id="cpf"
                placeholder="000.000.000-00 ou CRMV"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />

              <button type="submit" className="btn-buscar">Buscar Cadastro</button>
            </form>
          </div>

          <a href="#" className="voltar" onClick={(e) => { e.preventDefault(); onBackToLogin(); }}>
            Voltar para o login
          </a>
        </div>
      </div>
    </div>
  );
};

export default FormCadastro;
