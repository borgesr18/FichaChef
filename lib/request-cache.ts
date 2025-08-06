const requestCache = new Map<string, Promise<unknown>>()
const MAX_CACHE_SIZE = 100
const CLEANUP_INTERVAL = 300000 // 5 minutes

if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    if (requestCache.size > MAX_CACHE_SIZE) {
      console.log(`Cleaning up request cache (size: ${requestCache.size})`)
      requestCache.clear()
    }
  }, CLEANUP_INTERVAL)
}

export function withRequestDeduplication<T>(
  key: string,
  requestFn: () => Promise<T>,
  ttl: number = 5000
): Promise<T> {
  if (requestCache.has(key)) {
    return requestCache.get(key) as Promise<T>
  }

  if (requestCache.size >= MAX_CACHE_SIZE) {
    const firstKey = requestCache.keys().next().value
    if (firstKey) requestCache.delete(firstKey)
  }

  const promise = requestFn().then(async (result) => {
    if (result instanceof Response) {
      return result.clone() as T
    }
    return result
  }).finally(() => {
    setTimeout(() => {
      requestCache.delete(key)
    }, ttl)
  })

  requestCache.set(key, promise)
  return promise
}

export function clearRequestCache(key?: string) {
  if (key) {
    requestCache.delete(key)
  } else {
    requestCache.clear()
  }
}

export function getCacheStats() {
  return {
    size: requestCache.size,
    keys: Array.from(requestCache.keys())
  }
}
