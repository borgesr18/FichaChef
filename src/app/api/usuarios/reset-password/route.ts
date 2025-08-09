import { NextRequest } from 'next/server'
import { createSuccessResponse, createErrorResponse, createForbiddenResponse, authenticateWithPermission } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-admin'

const resetPasswordSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres')
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  try {
    await authenticateWithPermission('usuarios', 'admin')
  } catch {
    return createForbiddenResponse('Acesso negado')
  }

  const body = await request.json()
  const { userId, newPassword } = resetPasswordSchema.parse(body)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const isDevMode = !supabaseUrl || !supabaseServiceKey || 
                    supabaseUrl === '' || supabaseServiceKey === '' ||
                    supabaseUrl.includes('placeholder') || 
                    supabaseServiceKey.includes('placeholder')

  if (isDevMode) {
    return createSuccessResponse({
      message: `Senha seria alterada para o usuário ${userId} (modo desenvolvimento)`
    })
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) {
      return createErrorResponse(error.message, 400)
    }

    return createSuccessResponse({
      message: 'Senha redefinida com sucesso'
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    return createErrorResponse('Erro interno do servidor', 500)
  }
})
