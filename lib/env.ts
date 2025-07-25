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
  const warnings: string[] = []
  
  if (!env.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!env.DATABASE_URL) missing.push('DATABASE_URL')
  if (!env.NEXTAUTH_SECRET) missing.push('NEXTAUTH_SECRET')
  if (!env.SUPABASE_SERVICE_ROLE_KEY) warnings.push('SUPABASE_SERVICE_ROLE_KEY')
  if (!env.DIRECT_URL) warnings.push('DIRECT_URL')
  if (!env.NEXTAUTH_URL) warnings.push('NEXTAUTH_URL')
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings: missing.length > 0 ? `Variáveis críticas faltando: ${missing.join(', ')}` : 
             warnings.length > 0 ? `Variáveis opcionais faltando: ${warnings.join(', ')}` : null,
    hasAllRequired: missing.length === 0,
    hasAllOptional: warnings.length === 0
  }
}

// Verificação em produção também
if (typeof window === 'undefined') {
  const check = checkEnvironment()
  if (!check.isValid) {
    console.error('❌ PRODUCTION ERROR:', check.warnings)
    console.error('📝 Configure as variáveis de ambiente no painel do Vercel')
  }
}

export default env

