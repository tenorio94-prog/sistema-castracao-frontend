import "./globals.css";
import {Header} from '../components/dashboard/Header'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
      <Header/> 
        {children}
      </body>
    </html>
  );
}
