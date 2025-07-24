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
      console.error('❌ Error in API route:', req.url, error)

      if (error instanceof ZodError) {
        return createValidationErrorResponse(error.errors.map(e => e.message).join(', '))
      }

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return createNotFoundResponse()
        }
        
        if (error.message.includes('Usuário não autenticado')) {
          console.error('🔧 PRODUÇÃO: Erro de autenticação - verifique variáveis Supabase no Vercel')
          return createServerErrorResponse('Erro de autenticação. Verifique a configuração do sistema.')
        }
      }

      // Prisma error codes
      if (typeof error === 'object' && error !== null && 'code' in error) {
        if (error.code === 'P2025') {
          return createNotFoundResponse()
        }
      }

      if (error instanceof Error && error.name === 'PrismaClientInitializationError') {
        console.error('🔧 PRODUÇÃO: Erro de conexão com banco - verifique DATABASE_URL no Vercel')
        console.error('Database connectivity error:', error.message)
        return createServerErrorResponse('Database temporarily unavailable. Please try again.')
      }

      console.error('🚨 PRODUÇÃO: Erro não tratado na API:', error)
      return createServerErrorResponse('Erro interno do servidor. Verifique a configuração das variáveis de ambiente.')
    }
  }
}
