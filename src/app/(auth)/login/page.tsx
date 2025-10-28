// page.tsx

import Link from 'next/link'; // Para navegação interna no Next.js
// ATENÇÃO: Use o componente 'Image' do Next.js para a imagem em um projeto real
// import Image from 'next/image'; 

import LoginForm from './LoginForm'; // Importa o componente cliente
import './login.css'; // Importa os estilos

// Este componente é um Server Component por padrão, o que é ótimo para performance inicial.
export default function LoginPage() {
    return (
        <div className="container">
            <div className="img-container">
                {/* * NOTA: Use o componente <Image /> do Next.js para otimização em um projeto de produção.
                  * Certifique-se de que a imagem 'img.png' esteja na pasta 'public/imgs/'.
                */}
               <img src="/imgs/img.png" alt="Ilustração" />
            </div>

            <div className="back">
                <div className="login-wrapper">
                    
                    {/* Renderiza o componente cliente que contém o formulário interativo */}
                    <LoginForm /> 
                    
                    {/* Use <Link> para navegação interna */}
                    <Link href="/" className="voltar">
                        Voltar para a página inicial
                    </Link>
                </div>
            </div>
        </div>
    );
}