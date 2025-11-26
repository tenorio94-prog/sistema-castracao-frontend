import React from 'react';
import Image from 'next/image';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen w-full">
      
      {/* LADO ESQUERDO: Imagem 
        - hidden: Escondido por padrão (Mobile)
        - lg:flex: Aparece apenas em telas grandes (Desktop)
        - w-1/2: Ocupa metade da tela
        - bg-white: Fundo branco como solicitado
      */}
      <div className="hidden lg:flex w-1/2 bg-white items-center justify-center p-12 relative">
        <div className="relative w-full max-w-lg aspect-square">
          <Image
            src="/img.png" 
            alt="Ilustração de Login"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* LADO DIREITO: Formulário 
        - w-full: Ocupa tudo no mobile
        - lg:w-1/2: Ocupa metade no desktop
        - bg-gray-50: Fundo padrão do projeto (substituindo o verde)
      */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[400px]">
           {children}
        </div>
      </div>

    </main>
  );
}