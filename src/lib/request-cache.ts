const requestCache = new Map<string, Promise<unknown>>()

export function withRequestDeduplication<T>(
  key: string,
  requestFn: () => Promise<T>,
  ttl: number = 5000
): Promise<T> {
  if (requestCache.has(key)) {
    return requestCache.get(key) as Promise<T>
  }

  const promise = requestFn().finally(() => {
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
