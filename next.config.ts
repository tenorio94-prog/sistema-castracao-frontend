import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  // output: 'standalone',
  // reactStrictMode: true,
  // // Adiciona configuração específica para manipulação de rotas
  // async rewrites() {
  //   return [
  //     {
  //       source: '/adm/:path*',
  //       destination: '/adm/:path*',
  //     },
  //   ];
  // },
};

export default nextConfig;
