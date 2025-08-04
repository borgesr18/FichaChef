import { NextRequest } from 'next/server'
import { createSupabaseApiClient } from '@/lib/supabase-api'
import { 
  createSuccessResponse,
  createServerErrorResponse
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return createServerErrorResponse('Not available in production')
  }

  try {
    const { action, email, password } = await request.json()
    
    if (!email || !password) {
      return createServerErrorResponse('Email and password required')
    }

    const supabase = createSupabaseApiClient(request)
    
    if (action === 'create') {
      console.log('🔧 Dev Auth: Creating new user:', email)
      
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })

      if (error) {
        console.error('❌ Dev Auth: User creation failed:', error.message)
        return createServerErrorResponse(`User creation failed: ${error.message}`)
      }

      console.log('✅ Dev Auth: User created successfully:', data.user?.email)
      return createSuccessResponse({
        user: data.user,
        message: 'User created successfully'
      })
    }

    if (action === 'reset') {
      console.log('🔧 Dev Auth: Resetting password for existing user:', email)
      
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })

      if (error) {
        console.error('❌ Dev Auth: Password reset failed:', error.message)
        return createServerErrorResponse(`Password reset failed: ${error.message}`)
      }

      console.log('✅ Dev Auth: Password reset successful for:', data.user?.email)
      return createSuccessResponse({
        user: data.user,
        message: 'Password reset successful'
      })
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('❌ Dev Auth: Login failed:', error.message)
      return createServerErrorResponse(`Login failed: ${error.message}`)
    }

    if (data.user && data.session) {
      console.log('✅ Dev Auth: Login successful for:', data.user.email)
      
      const response = createSuccessResponse({
        user: data.user,
        session: data.session,
        message: 'Authentication successful'
      })

      const cookieOptions = {
        httpOnly: true,
        secure: false,
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      }

      response.cookies.set(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`, JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        token_type: data.session.token_type,
        user: data.user
      }), cookieOptions)

      return response
    }

    return createServerErrorResponse('Authentication failed - no user or session')

  } catch (error) {
    console.error('❌ Dev Auth: Unexpected error:', error)
    return createServerErrorResponse('Unexpected authentication error')
  }
}
