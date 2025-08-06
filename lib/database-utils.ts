interface RetryOptions {
  maxRetries: number
  delayMs: number
  backoffMultiplier: number
}

const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  delayMs: 1000,
  backoffMultiplier: 2
}

export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const { maxRetries, delayMs, backoffMultiplier } = { ...defaultRetryOptions, ...options }
  
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (!isConnectivityError(error)) {
        throw error
      }
      
      if (attempt === maxRetries) {
        console.error(`Database operation failed after ${maxRetries + 1} attempts:`, lastError.message)
        throw lastError
      }
      
      const delay = delayMs * Math.pow(backoffMultiplier, attempt)
      console.warn(`Database connectivity issue, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

function isConnectivityError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === 'PrismaClientInitializationError' ||
           error.name === 'PrismaClientKnownRequestError' ||
           error.name === 'PrismaClientUnknownRequestError' ||
           error.message.includes('Can\'t reach database server') ||
           error.message.includes('connection timeout') ||
           error.message.includes('Connection terminated') ||
           error.message.includes('Connection lost') ||
           error.message.includes('ECONNREFUSED') ||
           error.message.includes('ECONNRESET') ||
           error.message.includes('ETIMEDOUT') ||
           error.message.includes('Connection pool timeout') ||
           error.message.includes('Too many connections')
  }
  return false
}

export async function ensureHealthyConnection(): Promise<void> {
  try {
    const { prisma } = await import('./prisma')
    await prisma.$queryRaw`SELECT 1`
  } catch (error) {
    console.warn('Database connection unhealthy, attempting reconnection...', error)
    const { prisma } = await import('./prisma')
    await prisma.$disconnect()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await prisma.$connect()
  }
}

export async function withConnectionHealthCheck<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (isConnectivityError(error)) {
      console.warn('Connection error detected, ensuring healthy connection...')
      await ensureHealthyConnection()
      return await operation()
    }
    throw error
  }
}

export { isConnectivityError }
