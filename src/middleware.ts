import { NextResponse } from 'next/server'

export function middleware() {
  // Por enquanto, apenas repassa a requisição
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/:path*',
}
