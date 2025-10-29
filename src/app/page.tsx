import Link from 'next/link';
import { PawPrint } from 'lucide-react'; // Ícone para dar um tema

export default function Home (){

  return(
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      
      {/* Card Principal */}
      <div className="bg-white shadow-xl rounded-lg p-10 max-w-lg w-full text-center border-t-4 border-green-600">
        
        <PawPrint className="w-16 h-16 mx-auto text-green-600 mb-4" />
        
        <h1 className="text-3xl font-bold text-green-800 mb-2">
          Sistema de Gestão
        </h1>
        <p className="text-gray-600 mb-8">
          Bem-vindo ao portal de gerenciamento.
        </p>

        {/* Botão de Login (Ação Principal) */}
        <Link 
          href="/login"
          className="block w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg text-lg hover:bg-green-700 transition-colors duration-200"
        >
          Fazer Login
        </Link>
      </div>

      {/* Links de Acesso Rápido (Perfis) */}
      <div className="mt-8 text-center max-w-lg w-full">
        <p className="text-sm text-gray-500 mb-4">
          Acesso rápido aos portais
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/adm"
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            ADM
          </Link>
          <Link 
            href="/medico"
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Médico
          </Link>
          <Link 
            href="/atendente"
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Atendente
          </Link>
          <Link 
            href="/responsavel"
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Responsável
          </Link>
        </div>
      </div>
    </main>
  )
}