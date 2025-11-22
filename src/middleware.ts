import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware desabilitado - proteção de rotas feita client-side
 * O middleware não consegue acessar localStorage onde os tokens estão salvos
 */
export function middleware(request: NextRequest) {
  // Permite todas as requisições passarem
  // A proteção é feita nos componentes client-side
  return NextResponse.next();
}

/**
 * Configuração do middleware
 * Define quais rotas devem passar pelo middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
