import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry } from '@/lib/database-utils'
import { 
  authenticateWithPermission, 
  createValidationErrorResponse, 
  createSuccessResponse 
} from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'
import { categoriaSchema } from '@/lib/validations'

export const GET = withErrorHandler(async function GET() {
  const user = await authenticateWithPermission('insumos', 'read')

  const categorias = await withDatabaseRetry(async () => {
    return await prisma.categoriaInsumo.findMany({
      where: { userId: user.id },
      orderBy: { nome: 'asc' },
    })
  })

  return createSuccessResponse(categorias)
})

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const user = await authenticateWithPermission('insumos', 'write')

  const body = await request.json()
  const parsedBody = categoriaSchema.safeParse(body)

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const { nome, descricao } = parsedBody.data

  const categoria = await withDatabaseRetry(async () => {
    return await prisma.categoriaInsumo.create({
      data: {
        nome,
        descricao,
        userId: user.id,
      },
    })
  })

  await logUserAction(user.id, 'create', 'insumos', categoria.id, 'categoria', { nome, descricao }, request)

  return createSuccessResponse(categoria, 201)
})
