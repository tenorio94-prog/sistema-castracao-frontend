// app/login/layout.tsx
import React from 'react';
import Image from 'next/image';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // .container: 
    // - h-screen: Ocupa a tela inteira.
    // - flex-col: Padrão mobile (imagem em cima, form embaixo).
    // - lg:flex-row: Em telas grandes, vira duas colunas.
    <main className="flex flex-col lg:flex-row h-screen">
      
      {/* .img-container: Lado da imagem */}
      {/* - bg-white: Fundo branco para a imagem.
        - lg:w-2/5: Em desktop, ocupa 40% da largura.
        - lg:h-full: Em desktop, ocupa 100% da altura.
        - Em mobile (padrão), é apenas um 'block' normal.
      */}
      <div className="w-full bg-white lg:w-2/5 lg:h-full">
        <Image
          src="/img.png" // Imagem em /public
          alt="Ilustração de Login"
          width={800} // Largura base
          height={1200} // Altura base
          // AQUI ESTÁ A MÁGICA:
          // - h-48: Em mobile, a imagem terá uma altura fixa (12rem).
          // - w-full: Ocupa 100% da largura.
          // - object-contain: Garante que a imagem caiba sem distorcer.
          // - lg:h-full: Em desktop, volta a ocupar a altura total do container.
          className="w-full h-48 object-contain lg:h-full"
          priority
        />
      </div>

      {/* .back: Lado direito (fundo verde) */}
      {/* - flex-1: ESSENCIAL. Faz este container ocupar o espaço
          restante (na vertical no mobile, na horizontal no desktop).
        - w-full: Garante 100% da largura (relevante no mobile).
        - bg-[#d8e4d0]: Seu fundo verde.
        - flex items-center justify-center p-4: Centraliza o {children}.
      */}
      <div className="w-full flex-1 bg-[#d8e4d0] flex items-center justify-center p-4">
        
        {/* O 'page.tsx' (com o LoginForm) será renderizado aqui */}
        {children}

      </div>
    </main>
  );
}