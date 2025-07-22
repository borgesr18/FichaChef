// Utilitário para verificação de variáveis de ambiente
export const env = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  DIRECT_URL: process.env.DIRECT_URL || '',
  
  // NextAuth
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
}

// Verificação de configuração
export function checkEnvironment() {
  const missing: string[] = []
  
  if (!env.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!env.DATABASE_URL) missing.push('DATABASE_URL')
  if (!env.NEXTAUTH_SECRET) missing.push('NEXTAUTH_SECRET')
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings: missing.length > 0 ? `Variáveis de ambiente faltando: ${missing.join(', ')}` : null
  }
}

// Verificação apenas em desenvolvimento
if (env.NODE_ENV === 'development') {
  const check = checkEnvironment()
  if (!check.isValid) {
    console.warn('⚠️', check.warnings)
    console.warn('📝 Copie o arquivo .env.example para .env e configure as variáveis necessárias')
  }
}

export default env

