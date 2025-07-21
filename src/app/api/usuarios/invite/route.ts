import { NextRequest } from 'next/server'
import { authenticateWithPermission, createSuccessResponse, createErrorResponse } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

const inviteUserSchema = z.object({
  email: z.string().email('Email inválido')
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  await authenticateWithPermission('usuarios', 'admin')

  const body = await request.json()
  const { email } = inviteUserSchema.parse(body)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const isDevMode = !supabaseUrl || !supabaseKey || 
                    supabaseUrl === '' || supabaseKey === '' ||
                    supabaseUrl.includes('placeholder') || 
                    supabaseKey.includes('placeholder')

  if (isDevMode) {
    return createSuccessResponse({
      message: `Convite seria enviado para ${email} (modo desenvolvimento)`
    })
  }

  try {
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
    })

    if (error) {
      return createErrorResponse(error.message, 400)
    }

    return createSuccessResponse({
      message: `Convite enviado com sucesso para ${email}`
    })
  } catch (error) {
    console.error('Error sending invite:', error)
    return createErrorResponse('Erro interno do servidor', 500)
  }
})
