export type UserRole = 'chef' | 'cozinheiro' | 'gerente'
export type ModulePermission = 'read' | 'write' | 'admin'

const ROLE_PERMISSIONS: Record<UserRole, Record<string, ModulePermission[]>> = {
  chef: {
    'dashboard': ['read', 'write', 'admin'],
    'configuracoes': ['read', 'write', 'admin'],
    'alertas': ['read', 'write', 'admin'],
    'fornecedores': ['read', 'write', 'admin'],
    'insumos': ['read', 'write', 'admin'],
    'fichas-tecnicas': ['read', 'write', 'admin'],
    'producao': ['read', 'write', 'admin'],
    'estoque': ['read', 'write', 'admin'],
    'produtos': ['read', 'write', 'admin'],
    'cardapios': ['read', 'write', 'admin'],
    'calculo-preco': ['read', 'write', 'admin'],
    'analise-temporal': ['read', 'write', 'admin'],
    'impressao': ['read', 'write', 'admin'],
    'relatorios': ['read', 'write', 'admin'],
    'usuarios': ['read', 'write', 'admin'],
    'auditoria': ['read', 'write', 'admin']
  },
  gerente: {
    'dashboard': ['read', 'write'],
    'configuracoes': ['read'],
    'alertas': ['read', 'write'],
    'fornecedores': ['read', 'write'],
    'insumos': ['read', 'write'],
    'fichas-tecnicas': ['read', 'write'],
    'producao': ['read', 'write'],
    'estoque': ['read', 'write'],
    'produtos': ['read', 'write'],
    'cardapios': ['read', 'write'],
    'calculo-preco': ['read', 'write'],
    'analise-temporal': ['read', 'write'],
    'impressao': ['read', 'write'],
    'relatorios': ['read', 'write'],
    'usuarios': [],
    'auditoria': ['read']
  },
  cozinheiro: {
    'dashboard': ['read'],
    'configuracoes': [],
    'alertas': ['read'],
    'fornecedores': ['read'],
    'insumos': ['read'],
    'fichas-tecnicas': ['read', 'write'],
    'producao': ['read', 'write'],
    'estoque': ['read'],
    'produtos': ['read'],
    'cardapios': ['read'],
    'calculo-preco': ['read'],
    'analise-temporal': ['read'],
    'impressao': ['read', 'write'],
    'relatorios': ['read'],
    'usuarios': [],
    'auditoria': []
  }
}

export function hasPermission(
  userRole: UserRole | undefined,
  module: string,
  permission: ModulePermission
): boolean {
  if (!userRole) return false
  const modulePermissions = ROLE_PERMISSIONS[userRole]?.[module] || []
  return modulePermissions.includes(permission)
}

export function requirePermission(
  userRole: UserRole | undefined,
  module: string,
  permission: ModulePermission
) {
  if (!hasPermission(userRole, module, permission)) {
    throw new Error(`Acesso negado. Permissão '${permission}' necessária para o módulo '${module}'`)
  }
}

export async function logUserAction(
  userId: string,
  acao: string,
  modulo: string,
  itemId?: string,
  itemTipo?: string,
  detalhes?: Record<string, unknown>,
  request?: Request
) {
  try {
    const { prisma } = await import('./prisma')
    
    await prisma.auditoriaAcao.create({
      data: {
        userId,
        acao,
        modulo,
        itemId,
        itemTipo,
        detalhes: detalhes ? JSON.stringify(detalhes) : undefined,
        ipAddress: request?.headers.get('x-forwarded-for') || 
                  request?.headers.get('x-real-ip') || 
                  'unknown',
        userAgent: request?.headers.get('user-agent') || 'unknown'
      }
    })
  } catch (error) {
    console.error('Error logging user action:', error)
  }
}
