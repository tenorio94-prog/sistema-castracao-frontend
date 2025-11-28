// app/layout.tsx

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      {/* A tag <body> é obrigatória no layout raiz */}
      <body className="h-full overflow-hidden">

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