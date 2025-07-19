import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from './supabase-server'

export interface AuthenticatedUser {
  id: string
  email?: string
}

export async function authenticateUser(request?: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createServerSupabaseClient(request)
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export function createUnauthorizedResponse() {
  return NextResponse.json(
    { error: 'Não autorizado. Faça login para continuar.' },
    { status: 401 }
  )
}

export function createValidationErrorResponse(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  )
}

export function createServerErrorResponse(message: string = 'Erro interno do servidor') {
  return NextResponse.json(
    { error: message },
    { status: 500 }
  )
}

export function createNotFoundResponse(resource: string = 'Recurso') {
  return NextResponse.json(
    { error: `${resource} não encontrado` },
    { status: 404 }
  )
}

export function createSuccessResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, { status })
}

