import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry } from '@/lib/database-utils'
import { fornecedorSchema } from '@/lib/validations'
import { 
  authenticateWithPermission, 
  createValidationErrorResponse, 
  createSuccessResponse 
} from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'

export const GET = withErrorHandler(async function GET() {
  const user = await authenticateWithPermission('fornecedores', 'read')

  const fornecedores = await withDatabaseRetry(async () => {
    return await prisma.fornecedor.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { insumos: true, precos: true }
        }
      },
      orderBy: { nome: 'asc' },
    })
  })

  return createSuccessResponse(fornecedores)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateWithPermission('fornecedores', 'write')

  const body = await request.json()
  const parsedBody = fornecedorSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const data = parsedBody.data

  const fornecedor = await withDatabaseRetry(async () => {
    return await prisma.fornecedor.create({
      data: {
        ...data,
        userId: user.id,
      },
      include: {
        _count: {
          select: { insumos: true, precos: true }
        }
      },
    })
  })

  const { logUserAction } = await import('@/lib/permissions')
  await logUserAction(user.id, 'create', 'fornecedores', fornecedor.id, 'fornecedor', { nome: fornecedor.nome }, request)

  return createSuccessResponse(fornecedor, 201)
})
