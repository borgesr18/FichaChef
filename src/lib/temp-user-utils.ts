/**
 * Utilitários para lidar com usuário temporário em produção
 */

import { NextResponse } from 'next/server'
import { createSuccessResponse } from './auth'

/**
 * Verifica se é um usuário temporário de produção
 */
export function isTempUser(userId: string): boolean {
  return userId === 'temp-prod-user'
}

/**
 * Retorna dados vazios para usuário temporário
 */
export function getTempUserEmptyResponse(data: unknown[] = []) {
  return createSuccessResponse(data)
}

/**
 * Retorna dados de exemplo para usuário temporário
 */
export function getTempUserSampleData(type: string): unknown {
  switch (type) {
    case 'notificacoes':
      return []
    
    case 'fornecedores':
      return []
    
    case 'insumos':
      return []
    
    case 'produtos':
      return []
    
    case 'fichas-tecnicas':
      return []
    
    case 'producao':
      return []
    
    case 'perfil-usuario':
      return {
        userId: 'temp-prod-user',
        email: 'temp@fichachef.com',
        role: 'chef',
        nome: 'Usuário Temporário'
      }
    
    default:
      return []
  }
}

/**
 * Wrapper para APIs que precisam lidar com usuário temporário
 */
export function withTempUserHandling<T>(
  userId: string,
  dataType: string,
  callback: () => Promise<T>
): Promise<NextResponse> {
  if (isTempUser(userId)) {
    // Mostrar dados reais do banco para Produtos, mesmo para usuário temporário
    if (dataType === 'produtos') {
      return callback() as Promise<NextResponse>
    }
    const sampleData = getTempUserSampleData(dataType)
    return Promise.resolve(createSuccessResponse(sampleData))
  }
  
  return callback() as Promise<NextResponse>
}

