import Link from 'next/link';
import LoginForm from "@/components/forms/loginForm"; 
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Cabeçalho do Form */}
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Bem-vindo de volta
                </h1>
                <p className="text-gray-500">
                    Insira suas credenciais para acessar o sistema.
                </p>
            </div>

            {/* Formulário */}
            <LoginForm /> 
            
            {/* Footer / Links */}
            <div className="text-center">
                <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 font-medium hover:underline transition-all"
                >
                    <ArrowLeft size={16} />
                    Voltar para a página inicial
                </Link>
            </div>
        </div>
    );
}