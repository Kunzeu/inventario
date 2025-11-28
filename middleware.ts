import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Verificar que las variables de entorno estén configuradas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Si no están configuradas, permitir acceso a la página de setup y login
    if (req.nextUrl.pathname === '/setup' || req.nextUrl.pathname === '/auth/login' || req.nextUrl.pathname === '/') {
      return res
    }
    // Redirigir a setup si intenta acceder a otras rutas
    return NextResponse.redirect(new URL('/setup', req.url))
  }

  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/pos', '/products', '/inventory', '/sales', '/purchases', '/suppliers', '/customers', '/reports', '/crm', '/staff', '/woocommerce', '/settings']

  // Si no hay sesión y está intentando acceder a una ruta protegida
  if (!session && protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Si hay sesión y está en la página de login, redirigir al dashboard
  if (session && req.nextUrl.pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

