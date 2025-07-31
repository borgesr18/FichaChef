export function clearAuthCache() {
  console.log('🧹 Limpando cache de autenticação...')
  
  const keysToRemove = [
    'fichachef-user-role',
    'fichachef-user-email',
    'sb-access-token',
    'supabase-auth-token'
  ]
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
  })
  
  sessionStorage.clear()
  
  document.cookie.split(";").forEach(function(c) { 
    const cookieName = c.replace(/^ +/, "").split("=")[0]
    if (cookieName.includes('sb-') || cookieName.includes('supabase') || cookieName.includes('fichachef')) {
      document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
    }
  })
}
