import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const path = request.nextUrl.pathname

  // Public routes
  const publicRoutes = ['/login', '/register', '/marketplace', '/products']
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // Auth routes
  const authRoutes = ['/login', '/register']

  // Redirect to login if accessing protected route without token
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to marketplace if accessing auth routes with token
  if (token && authRoutes.some(route => path.startsWith(route))) {
    return NextResponse.redirect(new URL('/marketplace', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico).*)',
  ],
}

