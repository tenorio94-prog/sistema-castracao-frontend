import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  trailingSlash: false,
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Adicione esta configuração de Proxy
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Quando o front chamar /api/...
        destination: 'https://sistema-castracao-backend.onrender.com/api/:path*', // O Next.js redireciona para o backend
      },
    ];
  },
};

export default nextConfig;