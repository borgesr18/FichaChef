import { NextRequest } from 'next/server'
import { authenticateWithPermission, createSuccessResponse, createErrorResponse } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-admin'

const inviteUserSchema = z.object({
  email: z.string().email('Email inválido')
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  await authenticateWithPermission('usuarios', 'admin')

  const body = await request.json()
  const { email } = inviteUserSchema.parse(body)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const isDevMode = !supabaseUrl || !supabaseServiceKey || 
                    supabaseUrl === '' || supabaseServiceKey === '' ||
                    supabaseUrl.includes('placeholder') || 
                    supabaseServiceKey.includes('placeholder')

  if (isDevMode) {
    return createSuccessResponse({
      message: `Convite seria enviado para ${email} (modo desenvolvimento)`
    })
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
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
