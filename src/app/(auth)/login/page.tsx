import Link from 'next/link';
import LoginForm from "@/components/forms/loginForm"; 

export default function LoginPage() {
    return (
    
        <div className="flex flex-col items-center w-full">
            
            <LoginForm /> 
            
            <Link 
              href="/" 
              className="mt-4 text-[#3a773a] no-underline text-sm text-center hover:underline"
            >
                Voltar para a página inicial
            </Link>
        </div>
    );
}