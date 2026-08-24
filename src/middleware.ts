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
  let user = sessionCookie?.value ? await verifySessionToken(sessionCookie.value) : null;

  // Se houver token, mas o usuário NÃO for o admin mestre, verifica se ele ainda existe no banco
  if (user && user.email.toLowerCase().trim() !== 'rogervasques@gmail.com') {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mzkanjhapnqzdltqmitj.supabase.co';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Y61rQMjnZGTnrV7ucTggSg_bm8ELw5E';
      
      const checkRes = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user.id}&select=id,email`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        cache: 'no-store',
      });

      if (checkRes.ok) {
        const foundUsers = await checkRes.json();
        if (!foundUsers || foundUsers.length === 0) {
          // Usuário foi excluído do banco de dados! Invalida a sessão imediatamente
          user = null;
        }
      }
    } catch {
      // Em caso de falha de conexão, prossegue com verificação padrão
    }
  }

  const isAuthenticated = Boolean(user);

  const isAuthRoute =
    pathname === '/login' ||
    pathname.startsWith('/cadastrar') ||
    pathname.startsWith('/recuperar-senha') ||
    pathname.startsWith('/redefinir-senha');

  const isPublicLandingRoute =
    pathname === '/' ||
    pathname === '/home' ||
    pathname.startsWith('/imovel/') ||
    pathname.startsWith('/p/');

  // 4. Se o Usuário ESTIVER autenticado:
  if (isAuthenticated) {
    // Redireciona /login e /cadastrar para /dashboard
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Bloqueia acesso à tela /usuarios para quem não for admin
    if (pathname.startsWith('/usuarios') && user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  }

  // 5. Se o Usuário NÃO estiver autenticado:
  // Permite acesso às rotas públicas (Landing Page, /login, /cadastrar, /recuperar-senha, /redefinir-senha e páginas públicas do imóvel)
  if (isAuthRoute || isPublicLandingRoute) {
    return NextResponse.next();
  }

  // Redireciona obrigatoriamente qualquer outra rota para /login e limpa o cookie inválido
  const loginUrl = new URL('/login', req.url);
  if (pathname !== '/' && pathname !== '/home') {
    loginUrl.searchParams.set('from', pathname);
  }
  const response = NextResponse.redirect(loginUrl);
  if (sessionCookie) {
    response.cookies.delete(SESSION_COOKIE_NAME);
  }
  return response;
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
