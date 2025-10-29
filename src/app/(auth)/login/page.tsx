// app/login/page.tsx
import Link from 'next/link';
import LoginForm from "@/components/forms/loginForm"; // Você mantém seu componente

export default function LoginPage() {
    return (
        // .login-wrapper: Wrapper que centraliza a box e o link "voltar"
        <div className="flex flex-col items-center w-full">
            
            {/* Renderiza o componente cliente que contém o formulário */}
            <LoginForm /> 
            
            {/* .voltar: Link de voltar estilizado com Tailwind */}
            <Link 
              href="/" 
              className="mt-4 text-[#3a773a] no-underline text-sm text-center hover:underline"
            >
                Voltar para a página inicial
            </Link>
        </div>
    );
}