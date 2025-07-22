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
      console.error('Error in API route:', error)

      if (error instanceof ZodError) {
        return createValidationErrorResponse(error.errors.map(e => e.message).join(', '))
      }

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return createNotFoundResponse()
        }
      }

      // Prisma error codes
      if (typeof error === 'object' && error !== null && 'code' in error) {
        if (error.code === 'P2025') {
          return createNotFoundResponse()
        }
      }

      if (error instanceof Error && error.name === 'PrismaClientInitializationError') {
        console.error('Database connectivity error:', error.message)
        return createServerErrorResponse('Database temporarily unavailable. Please try again.')
      }

      return createServerErrorResponse()
    }
  }
}
