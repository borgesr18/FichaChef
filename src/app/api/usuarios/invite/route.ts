import { NextRequest } from 'next/server'
import { authenticateWithPermission, createSuccessResponse, createErrorResponse } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { z } from 'zod'

const inviteUserSchema = z.object({
  email: z.string().email('Email inválido')
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const body = await request.json()
  const { email } = inviteUserSchema.parse(body)

  let userCount = 0
  let isBootstrapMode = false
  
  try {
    const { prisma } = await import('@/lib/prisma')
    userCount = await prisma.perfilUsuario.count()
    console.log('📊 User count in database:', userCount)
    
    if (userCount > 0) {
      console.log('🔐 Users exist, requiring admin authentication')
      await authenticateWithPermission('usuarios', 'admin')
    } else {
      console.log('🚀 Bootstrap mode: Creating first admin user without authentication')
      isBootstrapMode = true
    }
  } catch (dbError) {
    console.error('Database error during user count check:', dbError)
    await authenticateWithPermission('usuarios', 'admin')
  }

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
    const { supabaseAdmin } = await import('@/lib/supabase-admin')
    
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
    })

    if (error) {
      return createErrorResponse(error.message, 400)
    }

    if (isBootstrapMode) {
      console.log('🔧 Creating first admin user profile for:', email)
    }

    return createSuccessResponse({
      message: `Convite enviado com sucesso para ${email}${isBootstrapMode ? ' (primeiro usuário admin)' : ''}`
    })
  } catch (error) {
    console.error('Error sending invite:', error)
    return createErrorResponse('Erro interno do servidor', 500)
  }
})
