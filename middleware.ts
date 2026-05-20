// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow public routes
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }
  
  // Check for token in cookies
  const token = request.cookies.get('token')?.value;
  
  // Protect ALL dashboard routes (including admin)
  if (request.nextUrl.pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Optional: Add role-based redirect for admin routes
  // This prevents non-admins from accessing admin pages via URL
  if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
    const userRole = request.cookies.get('userRole')?.value;
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/customer', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};