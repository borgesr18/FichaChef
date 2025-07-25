import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import {
  createValidationErrorResponse,
  createSuccessResponse,
} from '@/lib/auth'
import { requireApiAuthentication } from '@/lib/supabase-api'
import { withErrorHandler } from '@/lib/api-helpers'
import { analiseTemporalSchema } from '@/lib/validations'
import { 
  calculateLinearTrend, 
  projectFutureCosts, 
  groupPricesByPeriod,
  calculatePriceVolatility,
  type PricePoint 
} from '@/lib/utils'

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const body = await request.json()
  const parsedBody = analiseTemporalSchema.safeParse({
    ...body,
    dataInicio: body.dataInicio ? new Date(body.dataInicio) : undefined,
    dataFim: body.dataFim ? new Date(body.dataFim) : undefined
  })

  if (!parsedBody.success) {
    return createValidationErrorResponse(parsedBody.error.message)
  }

  const { insumoId, fornecedorId, dataInicio, dataFim, periodo, mesesProjecao } = parsedBody.data

  const where: {
    userId: string
    dataVigencia: { gte: Date; lte: Date }
    insumoId?: string
    fornecedorId?: string
  } = {
    userId: user.id,
    dataVigencia: {
      gte: dataInicio,
      lte: dataFim
    }
  }

  if (insumoId) where.insumoId = insumoId
  if (fornecedorId) where.fornecedorId = fornecedorId

  const priceHistory = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.fornecedorPreco.findMany({
        where,
        include: {
          insumo: {
            select: { id: true, nome: true }
          },
          fornecedor: {
            select: { id: true, nome: true }
          }
        },
        orderBy: { dataVigencia: 'asc' }
      })
    })
  })

  if (priceHistory.length === 0) {
    return createSuccessResponse({
      message: 'Nenhum histórico de preços encontrado para o período selecionado',
      data: {
        priceHistory: [],
        trendAnalysis: null,
        projections: [],
        groupedData: [],
        volatilityAnalysis: null
      }
    })
  }

  interface InsumoData {
    insumo: { id: string; nome: string }
    prices: Array<PricePoint & { fornecedor: { nome: string } }>
  }

  const pricesByInsumo = priceHistory.reduce((acc, price) => {
    const insumoId = price.insumo.id
    if (!acc[insumoId]) {
      acc[insumoId] = {
        insumo: price.insumo,
        prices: []
      }
    }
    acc[insumoId].prices.push({
      date: price.dataVigencia,
      price: price.preco,
      fornecedor: price.fornecedor
    })
    return acc
  }, {} as Record<string, InsumoData>)

  const analysisResults = Object.entries(pricesByInsumo).map(([, data]) => {
    const pricePoints: PricePoint[] = data.prices.map(p => ({
      date: p.date,
      price: p.price
    }))

    const trendAnalysis = calculateLinearTrend(pricePoints)
    const projections = projectFutureCosts(pricePoints, mesesProjecao)
    
    const englishPeriod = periodo === 'mensal' ? 'monthly' : 
                         periodo === 'trimestral' ? 'quarterly' : 
                         periodo === 'anual' ? 'yearly' : periodo
    
    const groupedData = groupPricesByPeriod(pricePoints, englishPeriod as 'monthly' | 'quarterly' | 'yearly')
    const volatilityAnalysis = calculatePriceVolatility(pricePoints)

    return {
      insumo: data.insumo,
      priceHistory: data.prices,
      trendAnalysis,
      projections,
      groupedData,
      volatilityAnalysis,
      statistics: {
        totalPricePoints: pricePoints.length,
        priceRange: {
          min: Math.min(...pricePoints.map(p => p.price)),
          max: Math.max(...pricePoints.map(p => p.price))
        },
        averagePrice: pricePoints.reduce((sum, p) => sum + p.price, 0) / pricePoints.length,
        latestPrice: pricePoints[pricePoints.length - 1]?.price || 0
      }
    }
  })

  return createSuccessResponse({
    data: analysisResults,
    summary: {
      totalInsumos: analysisResults.length,
      totalPricePoints: priceHistory.length,
      dateRange: { dataInicio, dataFim },
      analysisDate: new Date()
    }
  })
})

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const auth = await requireApiAuthentication(request)
  
  if (!auth.authenticated) {
    return auth.response!
  }
  
  const user = auth.user!

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (type === 'insumos') {
    const insumosWithPrices = await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.insumo.findMany({
          where: {
            userId: user.id,
            fornecedorPrecos: {
              some: {}
            }
          },
          select: {
            id: true,
            nome: true,
            _count: {
              select: {
                fornecedorPrecos: true
              }
            }
          },
          orderBy: { nome: 'asc' }
        })
      })
    })

    return createSuccessResponse(insumosWithPrices)
  }

  if (type === 'fornecedores') {
    const fornecedoresWithPrices = await withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.fornecedor.findMany({
          where: {
            userId: user.id,
            ativo: true,
            precos: {
              some: {}
            }
          },
          select: {
            id: true,
            nome: true,
            _count: {
              select: {
                precos: true
              }
            }
          },
          orderBy: { nome: 'asc' }
        })
      })
    })

    return createSuccessResponse(fornecedoresWithPrices)
  }

  const [insumos, fornecedores] = await Promise.all([
    withDatabaseRetry(async () => {
      return await prisma.insumo.findMany({
        where: {
          userId: user.id,
          fornecedorPrecos: { some: {} }
        },
        select: { id: true, nome: true },
        orderBy: { nome: 'asc' }
      })
    }),
    withDatabaseRetry(async () => {
      return await prisma.fornecedor.findMany({
        where: {
          userId: user.id,
          ativo: true,
          precos: { some: {} }
        },
        select: { id: true, nome: true },
        orderBy: { nome: 'asc' }
      })
    })
  ])

  return createSuccessResponse({ insumos, fornecedores })
})
