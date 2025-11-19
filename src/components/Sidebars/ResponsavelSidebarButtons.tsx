// @/components/Sidebars/ResponsavelSidebarButtons.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Dog, User, Settings } from 'lucide-react';

const sidebarItems = [
  { label: 'Início', href: '/responsavel', icon: Home },
  { label: 'Consultas', href: '/responsavel/consultas', icon: ClipboardList },
  { label: 'Meus Animais', href: '/responsavel/animais', icon: Dog },
  { label: 'Perfil', href: '/responsavel/perfil', icon: User },
];

export default function ResponsavelSidebarButtons() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2 p-4">
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-green-100 text-green-700 font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}