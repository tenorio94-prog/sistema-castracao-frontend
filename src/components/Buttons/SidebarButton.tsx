//Component: Sidebar Button dos povs adm, atendente e médico//

"use client"; // Marque como "use client" se for usar hooks como usePathname

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  href: string;
  icon: React.ReactNode;
  label: string;
};

export default function SidebarButton({ href, icon, label }: Props) {
  const pathname = usePathname();
  
  // Lógica opcional para destacar o link ativo
  const isActive = pathname === href; 

  return (
    <Link 
      href={href} 
      className={`
        flex items-center space-x-2 text-white p-2 rounded
        hover:bg-green-600
        ${isActive ? 'bg-green-800 font-bold' : ''}
      `}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}