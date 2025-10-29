// app/layout.tsx

import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* A tag <body> é obrigatória no layout raiz */}
      <body>

        {/* A prop {children} é onde o Next.js vai renderizar 
          todas as suas outras páginas e layouts.
          Sem ela, seu site ficará em branco.
        */}
        {children}
      </body>
    </html>
  );
}