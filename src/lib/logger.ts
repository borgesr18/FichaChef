/**
 * Sistema de logging estruturado para FichaChef
 * Suporte a diferentes níveis de log e integração com serviços de monitoramento
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  error?: Error | string
  userId?: string
  sessionId?: string
  requestId?: string
  source?: string
  environment?: string
}

export interface LoggerConfig {
  enableConsole: boolean
  enableRemote: boolean
  minLevel: LogLevel
  remoteEndpoint?: string
  maxRetries: number
  retryDelay: number
}

class Logger {
  private config: LoggerConfig
  private logQueue: LogEntry[] = []
  private isProcessingQueue = false
  private readonly isDevelopment = process.env.NODE_ENV === 'development'
  private readonly environment = process.env.NODE_ENV || 'unknown'

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      enableConsole: true,
      enableRemote: !this.isDevelopment,
      minLevel: this.isDevelopment ? 'debug' : 'info',
      remoteEndpoint: '/api/logs',
      maxRetries: 3,
      retryDelay: 1000,
      ...config
    }
  }

  /**
   * Determina se o log deve ser processado baseado no nível mínimo
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    }

    return levels[level] >= levels[this.config.minLevel]
  }

  /**
   * Formata entrada de log para exibição no console
   */
  private formatLogForConsole(entry: LogEntry): string {
    const { level, message, timestamp, context, error, source } = entry
    
    let logMessage = `[${timestamp}] ${level.toUpperCase()}`
    
    if (source) {
      logMessage += ` [${source}]`
    }
    
    logMessage += `: ${message}`
    
    if (context && Object.keys(context).length > 0) {
      logMessage += ` | Context: ${JSON.stringify(context, null, 2)}`
    }
    
    if (error) {
      const errorMessage = error instanceof Error ? error.message : error
      const errorStack = error instanceof Error ? error.stack : undefined
      logMessage += ` | Error: ${errorMessage}`
      if (errorStack && this.isDevelopment) {
        logMessage += ` | Stack: ${errorStack}`
      }
    }
    
    return logMessage
  }

  /**
   * Cria entrada de log estruturada
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error | string
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
      error,
      userId: context?.userId as string | undefined,
      sessionId: (context?.sessionId as string) || this.generateSessionId(),
      requestId: (context?.requestId as string) || this.generateRequestId(),
      source: (context?.source as string) || 'frontend',
      environment: this.environment,
    }
  }

  /**
   * Gera ID de sessão único
   */
  private generateSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('fichachef-session-id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('fichachef-session-id', sessionId)
      }
      return sessionId
    }
    return `server_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Gera ID de requisição único
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Processa entrada de log
   */
  private async processLogEntry(entry: LogEntry): Promise<void> {
    // Log no console se habilitado
    if (this.config.enableConsole) {
      const formattedMessage = this.formatLogForConsole(entry)
      
      switch (entry.level) {
        case 'debug':
          console.debug(formattedMessage)
          break
        case 'info':
          console.info(formattedMessage)
          break
        case 'warn':
          console.warn(formattedMessage)
          break
        case 'error':
          console.error(formattedMessage)
          break
      }
    }

    // Enviar para serviço remoto se habilitado
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.logQueue.push(entry)
      this.processQueue()
    }
  }

  /**
   * Processa fila de logs para envio remoto
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.logQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    while (this.logQueue.length > 0) {
      const entry = this.logQueue.shift()!
      
      try {
        await this.sendLogToRemote(entry)
      } catch {
        // Se falhar, recolocar na fila para retry
        this.logQueue.unshift(entry)
        break
      }
    }

    this.isProcessingQueue = false
  }

  /**
   * Envia log para serviço remoto
   */
  private async sendLogToRemote(entry: LogEntry, retryCount = 0): Promise<void> {
    try {
      const response = await fetch(this.config.remoteEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      if (retryCount < this.config.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay))
        return this.sendLogToRemote(entry, retryCount + 1)
      }
      
      // Se esgotar tentativas, log local apenas
      if (this.config.enableConsole) {
        console.error('Failed to send log to remote service:', error)
      }
      throw error
    }
  }

  /**
   * Log de debug
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return
    
    const entry = this.createLogEntry('debug', message, context)
    this.processLogEntry(entry)
  }

  /**
   * Log de informação
   */
  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return
    
    const entry = this.createLogEntry('info', message, context)
    this.processLogEntry(entry)
  }

  /**
   * Log de aviso
   */
  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return
    
    const entry = this.createLogEntry('warn', message, context)
    this.processLogEntry(entry)
  }

  /**
   * Log de erro
   */
  error(message: string, error?: Error | string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return
    
    const entry = this.createLogEntry('error', message, context, error)
    this.processLogEntry(entry)
  }

  /**
   * Log de performance
   */
  performance(operation: string, duration: number, context?: Record<string, unknown>): void {
    this.info(`Performance: ${operation}`, {
      ...context,
      duration,
      operation,
      type: 'performance'
    })
  }

  /**
   * Log de auditoria
   */
  audit(action: string, userId: string, context?: Record<string, unknown>): void {
    this.info(`Audit: ${action}`, {
      ...context,
      userId,
      action,
      type: 'audit'
    })
  }

  /**
   * Log de segurança
   */
  security(event: string, context?: Record<string, unknown>): void {
    this.warn(`Security: ${event}`, {
      ...context,
      event,
      type: 'security'
    })
  }

  /**
   * Configura contexto global para logs
   */
  setGlobalContext(): void {
    // Implementar contexto global se necessário
  }

  /**
   * Limpa fila de logs
   */
  clearQueue(): void {
    this.logQueue = []
  }

  /**
   * Obtém estatísticas do logger
   */
  getStats(): { queueSize: number; config: LoggerConfig } {
    return {
      queueSize: this.logQueue.length,
      config: this.config
    }
  }
}

// Instância singleton do logger
export const logger = new Logger()

// Hook para React para usar o logger
export function useLogger() {
  return logger
}

// Utilitários para timing de performance
export class PerformanceTimer {
  private startTime: number
  private operation: string

  constructor(operation: string) {
    this.operation = operation
    this.startTime = performance.now()
  }

  end(context?: Record<string, unknown>): number {
    const duration = performance.now() - this.startTime
    logger.performance(this.operation, duration, context)
    return duration
  }
}

// Decorator para logging automático de métodos
export function LogMethod(operation?: string) {
  return function (target: Record<string, unknown>, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      const timer = new PerformanceTimer(operation || `${target.constructor.name}.${propertyKey}`)
      
      try {
        const result = await originalMethod.apply(this, args)
        timer.end({ success: true })
        return result
      } catch (error) {
        timer.end({ success: false, error: error instanceof Error ? error.message : error })
        logger.error(`Method ${propertyKey} failed`, error as Error)
        throw error
      }
    }

    return descriptor
  }
}

// Tratamento global de erros não capturados
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.error('Uncaught error', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: 'uncaught-error'
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', event.reason, {
      type: 'unhandled-rejection'
    })
  })
}

