"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Settings, ChevronUp } from "lucide-react";
import Link from "next/link";

export function ProfileButton() {
  const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userData ? (() => {
    try {
      const u = JSON.parse(userData);
      return { name: u.email?.split('@')[0] || 'Usuário', email: u.email || '' };
    } catch {
      return { name: 'Usuário', email: '' };
    }
  })() : { name: 'Usuário', email: '' };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            
            {/* O botão que você vê, com o estilo verde que já definimos */}
            <SidebarMenuButton className="text-base text-white hover:bg-green-600 justify-between">
              
              {/* Parte da esquerda: Avatar e Nome */}
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  {/* <AvatarImage src="URL_DA_FOTO" /> */}
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{user.name}</span>
              </div>
              
              {/* Seta da direita */}
              <ChevronUp className="h-4 w-4" />

            </SidebarMenuButton>
          </DropdownMenuTrigger>
          
          {/* O menu que abre ao clicar */}
          <DropdownMenuContent
            side="top" // Faz o menu abrir para CIMA
            align="start"
            className="mb-2 w-[--radix-popper-anchor-width]" // Faz o menu ter a largura do botão
          >
            {/* Item "Conta" */}
            <DropdownMenuItem asChild>
              <Link href="/adm/conta"> {/* TODO: Ajuste o link da página de Conta */}
                <Settings className="mr-2 h-4 w-4" />
                <span>Conta</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />

            {/* Item "Log out" */}
            <DropdownMenuItem asChild>
              <Link href="/login" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}