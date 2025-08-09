import { NextRequest, NextResponse } from 'next/server'

function getAuthCookieName(): string {
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]
  return `sb-${projectRef}-auth-token`
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const hasBearer = authHeader.startsWith('Bearer ')
    const body = await request.json().catch(() => ({})) as {
      refresh_token?: string
      expires_at?: number
      token_type?: string
      user?: unknown
    }

    const accessToken = hasBearer ? authHeader.substring(7) : undefined
    const refreshToken = body.refresh_token

    if (!accessToken) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 400 })
    }

    const cookieName = getAuthCookieName()

    const payload = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: body.expires_at,
      token_type: body.token_type || 'bearer',
      user: body.user || null,
    }

    const response = NextResponse.json({ ok: true })

    response.cookies.set(cookieName, JSON.stringify(payload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Failed to sync auth:', error)
    return NextResponse.json({ error: 'Failed to sync auth' }, { status: 500 })
  }
}

export async function DELETE() {
  const cookieName = getAuthCookieName()
  const response = NextResponse.json({ ok: true })
  response.cookies.set(cookieName, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}