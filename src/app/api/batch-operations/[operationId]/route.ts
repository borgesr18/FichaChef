import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { createSuccessResponse } from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { withErrorHandler } from '@/lib/api-helpers'

export const POST = withErrorHandler(async function POST(
  request: NextRequest,
  context: { params: Promise<{ operationId: string }> }
) {
  const { operationId } = await context.params
  const { selectedIds, fieldValues } = await request.json()

  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const result = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      switch (operationId) {
        case 'bulk-update-supplier':
          return await prisma.insumo.updateMany({
            where: { id: { in: selectedIds } },
            data: { fornecedorId: fieldValues.fornecedorId }
          })

        case 'bulk-update-category':
          return await prisma.insumo.updateMany({
            where: { id: { in: selectedIds } },
            data: { categoriaId: fieldValues.categoriaId }
          })

        case 'bulk-export-fichas':
          const fichas = await prisma.fichaTecnica.findMany({
            where: { id: { in: selectedIds } },
            include: {
              categoria: true,
              ingredientes: {
                include: { insumo: true }
              }
            }
          })
          
          if (fieldValues.format === 'pdf') {
          } else if (fieldValues.format === 'excel') {
          }
          
          return { count: fichas.length }

        case 'bulk-duplicate-products':
          const products = await prisma.produto.findMany({
            where: { id: { in: selectedIds } },
            include: { produtoFichas: true }
          })

          const duplicatedProducts = await Promise.all(
            products.map(async (product) => {
              return await prisma.produto.create({
                data: {
                  nome: `${fieldValues.namePrefix || 'Cópia de'} ${product.nome}`,
                  precoVenda: product.precoVenda,
                  margemLucro: product.margemLucro,
                  user_id: user.id,
                  produtoFichas: {
                    create: product.produtoFichas.map(ficha => ({
                      fichaTecnicaId: ficha.fichaTecnicaId,
                      quantidadeGramas: ficha.quantidadeGramas
                    }))
                  }
                }
              })
            })
          )

          return { count: duplicatedProducts.length }

        default:
          throw new Error('Operação não suportada')
      }
    })
  })

  return createSuccessResponse({
    message: `Operação executada com sucesso em ${selectedIds.length} item(s)`,
    result
  })
})
