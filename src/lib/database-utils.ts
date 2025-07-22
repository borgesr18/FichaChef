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
           error.message.includes('Can\'t reach database server') ||
           error.message.includes('connection timeout') ||
           error.message.includes('ECONNREFUSED')
  }
  return false
}
