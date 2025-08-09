import { NextRequest } from 'next/server'
import { createSuccessResponse, createErrorResponse, createForbiddenResponse, authenticateWithPermission } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const sendPasswordResetSchema = z.object({
  email: z.string().email('Email inválido')
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  try {
    await authenticateWithPermission('usuarios', 'admin')
  } catch {
    return createForbiddenResponse('Acesso negado')
  }

  const body = await request.json()
  const { email } = sendPasswordResetSchema.parse(body)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const isDevMode = !supabaseUrl || !supabaseKey || 
                    supabaseUrl === '' || supabaseKey === '' ||
                    supabaseUrl.includes('placeholder') || 
                    supabaseKey.includes('placeholder')

  if (isDevMode) {
    return createSuccessResponse({
      message: `Email de redefinição seria enviado para ${email} (modo desenvolvimento)`
    })
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`
    })

    if (error) {
      return createErrorResponse(error.message, 400)
    }

    return createSuccessResponse({
      message: `Email de redefinição enviado para ${email}`
    })
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return createErrorResponse('Erro interno do servidor', 500)
  }
})
