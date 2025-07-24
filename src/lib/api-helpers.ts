import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import {
  createValidationErrorResponse,
  createServerErrorResponse,
  createNotFoundResponse
} from './auth'

type ApiHandler<T> = (req: NextRequest, context: T) => Promise<NextResponse>

export function withErrorHandler<T>(handler: ApiHandler<T>): ApiHandler<T> {
  return async (req: NextRequest, context: T) => {
    try {
      return await handler(req, context)
    } catch (error) {
      const url = req.url || 'unknown'
      const method = req.method || 'unknown'
      console.error(`❌ Error in API route [${method}] ${url}:`, error)

      if (error instanceof ZodError) {
        console.error('🔍 Validation error details:', error.errors)
        return createValidationErrorResponse(error.errors.map(e => e.message).join(', '))
      }

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return createNotFoundResponse()
        }
        
        if (error.message.includes('Usuário não autenticado') || error.message.includes('Authentication failed')) {
          console.error('🔧 PRODUÇÃO: Erro de autenticação - verifique variáveis Supabase no Vercel')
          console.error('Auth error details:', { message: error.message, stack: error.stack })
          return NextResponse.json({ 
            error: 'Erro de autenticação. Verifique a configuração do sistema.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          }, { status: 401 })
        }

        if (error.message.includes('Permission denied') || error.message.includes('Insufficient permissions')) {
          console.error('🔒 Permission error:', error.message)
          return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
        }
      }

      // Prisma error codes
      if (typeof error === 'object' && error !== null && 'code' in error) {
        console.error('🗄️ Database error code:', error.code)
        if (error.code === 'P2025') {
          return createNotFoundResponse()
        }
        if (error.code === 'P2002') {
          return NextResponse.json({ error: 'Registro duplicado' }, { status: 409 })
        }
      }

      if (error instanceof Error && error.name === 'PrismaClientInitializationError') {
        console.error('🔧 PRODUÇÃO: Erro de conexão com banco - verifique DATABASE_URL no Vercel')
        console.error('Database connectivity error:', error.message)
        return createServerErrorResponse('Database temporarily unavailable. Please try again.')
      }

      console.error('🚨 PRODUÇÃO: Erro não tratado na API:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        url,
        method
      })
      return createServerErrorResponse('Erro interno do servidor. Verifique a configuração das variáveis de ambiente.')
    }
  }
}
