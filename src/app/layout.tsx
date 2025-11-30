// app/layout.tsx

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      {/* A tag <body> é obrigatória no layout raiz */}
      <body className="h-full antialiased">

        {/* A prop {children} é onde o Next.js vai renderizar 
          todas as suas outras páginas e layouts.
          Sem ela, seu site ficará em branco.
        */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}