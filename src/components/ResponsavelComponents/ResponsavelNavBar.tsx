"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Menu, X, LayoutDashboard, Dog, Calendar, 
  User, Bell, LogOut, Info, AlertTriangle, CheckCircle 
} from 'lucide-react';
import ViewModal from '@/components/modals/ViewModal';

// --- Mocks de Notificações para o Modal ---
const allNotifications = [
  { id: 1, title: 'Vacina de Rex próxima', desc: 'A vacina V10 do Rex vence em 15 dias. Agende um horário.', type: 'warning', date: 'Há 2 horas' },
  { id: 2, title: 'Resultado de Exame Disponível', desc: 'O hemograma da Mel já está disponível no portal.', type: 'info', date: 'Ontem' },
  { id: 3, title: 'Agendamento Confirmado', desc: 'Sua consulta para Thor foi confirmada para 14/01.', type: 'success', date: '12/11/2025' },
  { id: 4, title: 'Campanha de Castração', desc: 'Participe da nossa campanha de conscientização neste sábado.', type: 'info', date: '10/11/2025' },
];

export default function ResponsibleNavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Início', href: '/responsavel', icon: LayoutDashboard },
    { label: 'Meus Animais', href: '/responsavel/animais', icon: Dog },
    { label: 'Consultas', href: '/responsavel/consultas', icon: Calendar },
  ];

  const isActive = (path: string) => pathname === path;

  // --- Handlers ---
  const handleProfileClick = () => {
    router.push('/responsavel/perfil');
  };

  const handleLogout = () => {
    toast('Deseja realmente sair?', {
      action: {
        label: 'Sair',
        onClick: () => {
          // Limpar autenticação
          localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Redirecionar para login
          router.push('/login');
          
          // Toast de sucesso
          toast.success('Logout realizado com sucesso!');
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {},
      },
    });
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Esquerda: Logo e Menu Hambúrguer */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Menu size={24} />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="relative flex aspect-square items-center justify-center rounded-full overflow-hidden bg-white shadow-sm border-2 border-green-100">
                  <Image
                    src="/unipet.png"
                    alt="Logo UNIPET"
                    width={50}
                    height={50}
                    className="object-contain p-1"
                    priority
                  />
                </div>
                <div className="relative flex aspect-square items-center justify-center rounded-full overflow-hidden bg-white shadow-sm border-2 border-green-100">
                  <Image
                      src="/hospital.png"
                      alt="UFRPE - Departamento de Medicina Veterinária"
                      width={50}
                      height={50}
                      className="object-contain"
                      priority
                    />
                </div>
                <div className="flex justify-center">
                  <div className="relative w-full h-14 bg-white rounded-lg p-2.5 shadow-sm">
                    <Image
                      src="/semas.png"
                      alt="Governo de Pernambuco"
                      width={120}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Centro: Links Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Direita: Ações */}
            <div className="flex items-center gap-3">
              
              {/* Botão de Notificações (Abre Modal) */}
              <button 
                onClick={() => setIsNotificationsOpen(true)}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors relative"
                title="Notificações"
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              
              {/* Botão de Perfil (Redireciona) */}
              <button 
                onClick={handleProfileClick}
                className="h-9 w-9 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm border border-green-200 hover:bg-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                title="Meu Perfil"
              >
                <User size={20} />
              </button>

              {/* Botão de Logout */}
              <button 
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                title="Sair"
              >
                <LogOut size={18} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MENU MOBILE (Drawer) --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
             <div className="p-5 flex justify-between items-center border-b border-gray-100">
                <span className="font-bold text-lg text-gray-900">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24}/>
                </button>
             </div>
             <div className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
               {navItems.map(item => (
                 <Link 
                   key={item.href} 
                   href={item.href} 
                   onClick={() => setIsMobileMenuOpen(false)} 
                   className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                     isActive(item.href) ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
                   }`}
                 >
                    <item.icon size={20}/> 
                    {item.label}
                 </Link>
               ))}
               <div className="h-px bg-gray-100 my-2 mx-4"></div>
               <Link 
                 href="/responsavel/perfil" 
                 onClick={() => setIsMobileMenuOpen(false)} 
                 className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
               >
                 <User size={20}/> Meu Perfil
               </Link>
             </div>
             <div className="p-4 border-t border-gray-100">
               <button 
                 onClick={handleLogout}
                 className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
               >
                 <LogOut size={20}/> Sair
               </button>
             </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE NOTIFICAÇÕES --- */}
      <ViewModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        title="Central de Notificações"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          {allNotifications.length > 0 ? (
            allNotifications.map((notif) => {
              // Definição de ícones e cores baseado no tipo
              let Icon = Info;
              let colorClass = 'bg-blue-50 text-blue-600 border-blue-100';
              
              if (notif.type === 'warning') {
                Icon = AlertTriangle;
                colorClass = 'bg-amber-50 text-amber-600 border-amber-100';
              } else if (notif.type === 'success') {
                Icon = CheckCircle;
                colorClass = 'bg-green-50 text-green-600 border-green-100';
              }

              return (
                <div key={notif.id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                  <div className={`p-2 h-fit rounded-lg border ${colorClass}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-gray-900">{notif.title}</h4>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{notif.date}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.desc}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center">
              <div className="bg-gray-50 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="text-gray-300" size={20} />
              </div>
              <p className="text-gray-500 text-sm">Você não tem novas notificações.</p>
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t border-gray-100 flex justify-center">
          <button 
            onClick={() => setIsNotificationsOpen(false)}
            className="text-xs font-bold text-green-700 hover:underline"
          >
            Marcar todas como lidas
          </button>
        </div>
      </ViewModal>
    </>
  );
}