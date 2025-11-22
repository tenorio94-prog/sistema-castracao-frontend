import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  trailingSlash: true,
  // Define o diretório raiz do projeto para evitar conflitos com múltiplos lockfiles
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
  
  // Configurações de imagem (se necessário no futuro)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
