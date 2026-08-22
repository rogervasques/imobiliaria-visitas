import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Ignora arquivos estáticos, service worker, manifest e imagens
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/icons') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname.startsWith('/workbox-') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Rotas de API tratam sua própria autenticação
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 3. Verifica a existência e validade do cookie de sessão JWT
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
  const user = sessionCookie?.value ? await verifySessionToken(sessionCookie.value) : null;
  const isAuthenticated = Boolean(user);

  const isAuthRoute =
    pathname === '/login' ||
    pathname.startsWith('/cadastrar') ||
    pathname.startsWith('/recuperar-senha') ||
    pathname.startsWith('/redefinir-senha');

  // 4. Se o Usuário ESTIVER autenticado:
  if (isAuthenticated) {
    // Redireciona /login e /cadastrar para a página principal /
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Bloqueia acesso à tela /usuarios para quem não for admin
    if (pathname.startsWith('/usuarios') && user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  }

  // 5. Se o Usuário NÃO estiver autenticado:
  // Permite acesso apenas às rotas públicas (/login e /cadastrar)
  if (isAuthRoute) {
    return NextResponse.next();
  }

  // Redireciona obrigatoriamente qualquer outra rota (inclusive a home /) para /login
  const loginUrl = new URL('/login', req.url);
  if (pathname !== '/') {
    loginUrl.searchParams.set('from', pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Intercepta todas as rotas da aplicação exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (imagens otimizadas)
     * - favicon.ico, manifest.json, sw.js
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|workbox-).*)',
  ],
};
