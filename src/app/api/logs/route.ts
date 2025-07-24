/**
 * API para recebimento e processamento de logs do frontend
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  timestamp: string
  context?: Record<string, unknown>
  error?: string
  userId?: string
  sessionId?: string
  requestId?: string
  source?: string
  environment?: string
}

/**
 * Valida entrada de log
 */
function validateLogEntry(data: unknown): data is LogEntry {
  if (!data || typeof data !== 'object') {
    return false
  }

  const record = data as Record<string, unknown>
  const { level, message, timestamp } = record

  if (!level || typeof level !== 'string' || !['debug', 'info', 'warn', 'error'].includes(level)) {
    return false
  }

  if (!message || typeof message !== 'string') {
    return false
  }

  if (!timestamp || typeof timestamp !== 'string') {
    return false
  }

  return true
}

/**
 * Sanitiza dados de log para evitar vazamento de informações sensíveis
 */
function sanitizeLogEntry(entry: LogEntry): LogEntry {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization']
  
  const sanitizeObject = (obj: unknown): Record<string, unknown> => {
    if (!obj || typeof obj !== 'object') {
      return obj as Record<string, unknown>
    }

    const record = obj as Record<string, unknown>
    const sanitized = { ...record }
    
    for (const key in sanitized) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]'
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitizeObject(sanitized[key])
      }
    }

    return sanitized
  }

  return {
    ...entry,
    context: entry.context ? sanitizeObject(entry.context) as Record<string, unknown> : undefined
  }
}

/**
 * Determina se o log deve ser persistido baseado no nível e configurações
 */
function shouldPersistLog(entry: LogEntry): boolean {
  // Em desenvolvimento, não persistir logs de debug
  if (process.env.NODE_ENV === 'development' && entry.level === 'debug') {
    return false
  }

  // Sempre persistir erros e warnings
  if (entry.level === 'error' || entry.level === 'warn') {
    return true
  }

  // Para info, persistir apenas se for auditoria ou performance
  if (entry.level === 'info') {
    return entry.context?.type === 'audit' || entry.context?.type === 'performance'
  }

  return false
}

/**
 * Processa log recebido do frontend
 */
async function processLog(entry: LogEntry, request: NextRequest): Promise<void> {
  const sanitizedEntry = sanitizeLogEntry(entry)
  
  // Adicionar informações da requisição
  const enrichedEntry = {
    ...sanitizedEntry,
    context: {
      ...sanitizedEntry.context,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for'),
      referer: request.headers.get('referer'),
      receivedAt: new Date().toISOString()
    }
  }

  // Log no servidor
  switch (enrichedEntry.level) {
    case 'debug':
      logger.debug(`Frontend: ${enrichedEntry.message}`, enrichedEntry.context)
      break
    case 'info':
      logger.info(`Frontend: ${enrichedEntry.message}`, enrichedEntry.context)
      break
    case 'warn':
      logger.warn(`Frontend: ${enrichedEntry.message}`, enrichedEntry.context)
      break
    case 'error':
      logger.error(`Frontend: ${enrichedEntry.message}`, enrichedEntry.error, enrichedEntry.context)
      break
  }

  // Persistir em banco de dados se necessário
  if (shouldPersistLog(enrichedEntry)) {
    await persistLog(enrichedEntry)
  }

  // Enviar para serviços de monitoramento externos
  if (process.env.NODE_ENV === 'production') {
    await sendToMonitoringServices(enrichedEntry)
  }
}

/**
 * Persiste log em banco de dados
 */
async function persistLog(entry: LogEntry): Promise<void> {
  try {
    // Implementar persistência em banco de dados
    // Por exemplo, usando Prisma:
    /*
    await prisma.log.create({
      data: {
        level: entry.level,
        message: entry.message,
        timestamp: new Date(entry.timestamp),
        context: entry.context,
        error: entry.error,
        userId: entry.userId,
        sessionId: entry.sessionId,
        requestId: entry.requestId,
        source: entry.source,
        environment: entry.environment,
      }
    })
    */
    
    // Por enquanto, apenas log local
    logger.debug('Log persisted to database', { logId: entry.requestId })
  } catch (error) {
    logger.error('Failed to persist log to database', error as Error)
  }
}

/**
 * Envia logs para serviços de monitoramento externos
 */
async function sendToMonitoringServices(entry: LogEntry): Promise<void> {
  try {
    // Implementar integração com serviços como:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - New Relic
    
    // Exemplo para Sentry:
    /*
    if (entry.level === 'error') {
      Sentry.captureException(new Error(entry.message), {
        tags: {
          source: entry.source,
          environment: entry.environment,
        },
        extra: entry.context,
        user: {
          id: entry.userId,
        },
      })
    }
    */
    
    logger.debug('Log sent to monitoring services', { logId: entry.requestId })
  } catch (error) {
    logger.error('Failed to send log to monitoring services', error as Error)
  }
}

/**
 * Rate limiting para logs
 */
const logRateLimit = new Map<string, { count: number; lastReset: number }>()

function checkLogRateLimit(ip: string, maxLogs = 100, windowMs = 60000): boolean {
  const now = Date.now()
  const userLimit = logRateLimit.get(ip)

  if (!userLimit) {
    logRateLimit.set(ip, { count: 1, lastReset: now })
    return true
  }

  if (now - userLimit.lastReset > windowMs) {
    userLimit.count = 1
    userLimit.lastReset = now
    return true
  }

  if (userLimit.count >= maxLogs) {
    return false
  }

  userLimit.count++
  return true
}

/**
 * Handler para requisições POST
 */
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Rate limiting
    if (!checkLogRateLimit(ip, 100, 60000)) {
      return NextResponse.json(
        { error: 'Too many log requests' },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Suporte a log único ou array de logs
    const logEntries = Array.isArray(body) ? body : [body]
    
    // Validar todas as entradas
    for (const entry of logEntries) {
      if (!validateLogEntry(entry)) {
        return NextResponse.json(
          { error: 'Invalid log entry format' },
          { status: 400 }
        )
      }
    }

    // Processar todos os logs
    await Promise.all(
      logEntries.map(entry => processLog(entry, request))
    )

    return NextResponse.json({ 
      success: true, 
      processed: logEntries.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Failed to process log entries', error as Error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to process log entries'
      },
      { status: 500 }
    )
  }
}

/**
 * Handler para requisições GET - retorna estatísticas de logs
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação para acesso às estatísticas
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Retornar estatísticas básicas
    const stats = {
      rateLimitEntries: logRateLimit.size,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    }

    return NextResponse.json(stats)
  } catch (error) {
    logger.error('Failed to get log statistics', error as Error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Limpar rate limit a cada 5 minutos
setInterval(() => {
  const now = Date.now()
  const windowMs = 60000 // 1 minuto

  for (const [ip, data] of logRateLimit.entries()) {
    if (now - data.lastReset > windowMs) {
      logRateLimit.delete(ip)
    }
  }
}, 5 * 60 * 1000)

