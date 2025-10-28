// page.tsx
import Link from 'next/link';
import Image from 'next/image';

import LoginForm from "@/components/forms/loginForm"; 
import './login.css';


export default function LoginPage() {
    return (
        <div className="container">
            <div className="img-container">

                <Image 
                    src="/img.png" 
                    alt="Ilustração de Login"
                    width={550}  
                    height={350} 
                    priority 
                />
            </div>

            <div className="back">
                <div className="login-wrapper">
                    
                    {/* Renderiza o componente cliente que contém o formulário interativo */}
                    <LoginForm /> 
                    
                    {/*<Link> para navegação interna */}
                    <Link href="/" className="voltar">
                        Voltar para a página inicial
                    </Link>
                </div>
            </div>
        </div>
    );
}