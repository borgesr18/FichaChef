import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { authenticateWithPermission } from '@/lib/auth'
import { logUserAction } from '@/lib/permissions'
import { withErrorHandler } from '@/lib/api-helpers'

interface ProducaoItem {
  id: string
  nome: string
  quantidadeTotal: number
  numeroProducoes: number
  tipo: string
}

interface EstoqueItem {
  id: string
  nome: string
  saldoAtual: number
  entradas: number
  saidas: number
  precoUnidade?: number
  precoVenda?: number
  valorEstoque: number
}

export const GET = withErrorHandler(async function GET(request: NextRequest) {
  const user = await authenticateWithPermission('relatorios', 'read')

  const { searchParams } = new URL(request.url)
  const reportType = searchParams.get('type') || 'custos'

  let reportData = {}

  try {
    switch (reportType) {
      case 'custos':
        reportData = await generateCostReport(user.id)
        break
      case 'producao':
        reportData = await generateProductionReport(user.id)
        break
      case 'estoque':
        reportData = await generateInventoryReport(user.id)
        break
      case 'fichas':
        reportData = await generateRecipeReport(user.id)
        break
      case 'rentabilidade':
        reportData = await generateProfitabilityReport(user.id)
        break
      case 'abc-insumos':
        reportData = await generateAbcInsumosReport(user.id)
        break
      case 'desperdicio':
        reportData = await generateWasteReport(user.id)
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }
  } catch (reportError) {
    console.error(`Error generating ${reportType} report:`, reportError)
    
    reportData = {
      type: reportType,
      data: {},
      summary: {
        message: 'Nenhum dado disponível para este relatório no momento'
      }
    }
  }

  await logUserAction(
    user.id,
    'view',
    'relatorios',
    undefined,
    reportType,
    { reportType },
    request
  )

  return NextResponse.json(reportData)
})

async function generateCostReport(userId: string) {
  const produtos = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.produto.findMany({
        where: { userId },
        include: {
          produtoFichas: {
            include: {
              fichaTecnica: {
                include: {
                  ingredientes: {
                    include: {
                      insumo: true
                    }
                  }
                }
              }
            }
          }
        }
      })
    })
  })

  const fichasTecnicas = await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      return await prisma.fichaTecnica.findMany({
        where: { userId },
        include: {
          ingredientes: {
            include: {
              insumo: true
            }
          }
        }
      })
    })
  })

  const costAnalysis = {
    produtos: produtos.map(produto => {
      const custoTotal = produto.produtoFichas.reduce((total, produtoFicha) => {
        const fichaCusto = produtoFicha.fichaTecnica.ingredientes.reduce((fichaTotal, ing) => {
          const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
          return fichaTotal + (custoPorGrama * ing.quantidadeGramas)
        }, 0)
        const custoPorGramaFicha = fichaCusto / produtoFicha.fichaTecnica.pesoFinalGramas
        return total + (custoPorGramaFicha * produtoFicha.quantidadeGramas)
      }, 0)
      
      const pesoTotal = produto.produtoFichas.reduce((total, f) => total + f.quantidadeGramas, 0)
      const margemLucroReal = produto.precoVenda > 0 ? ((produto.precoVenda - custoTotal) / produto.precoVenda) * 100 : 0
      
      return {
        nome: produto.nome,
        custoProducao: custoTotal,
        precoVenda: produto.precoVenda,
        margemLucroConfigurada: produto.margemLucro,
        margemLucroReal: margemLucroReal,
        pesoTotal: pesoTotal,
        custoPorGrama: pesoTotal > 0 ? custoTotal / pesoTotal : 0
      }
    }),
    fichasTecnicas: fichasTecnicas.map(ficha => {
      const custoTotal = ficha.ingredientes.reduce((total, ing) => {
        const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
        return total + (custoPorGrama * ing.quantidadeGramas)
      }, 0)
      
      return {
        nome: ficha.nome,
        custoTotal: custoTotal,
        pesoFinal: ficha.pesoFinalGramas,
        custoPorGrama: custoTotal / ficha.pesoFinalGramas,
        custoPorPorcao: custoTotal / ficha.numeroPorcoes,
        numeroPorcoes: ficha.numeroPorcoes
      }
    })
  }

  return {
    type: 'custos',
    data: costAnalysis,
    summary: {
      totalProdutos: produtos.length,
      totalFichas: fichasTecnicas.length,
      custoMedioProduto: costAnalysis.produtos.reduce((sum, p) => sum + p.custoProducao, 0) / (produtos.length || 1),
      custoMedioFicha: costAnalysis.fichasTecnicas.reduce((sum, f) => sum + f.custoTotal, 0) / (fichasTecnicas.length || 1)
    }
  }
}

async function generateProductionReport(userId: string) {
  const whereClause: Record<string, unknown> = { userId }

  const [producoesFichas, producoesProdutos] = await Promise.all([
    withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.producao.findMany({
          where: whereClause,
          include: {
            fichaTecnica: true
          },
          orderBy: { dataProducao: 'desc' }
        })
      })
    }),
    withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.producaoProduto.findMany({
          where: whereClause,
          include: {
            produto: true
          },
          orderBy: { dataProducao: 'desc' }
        })
      })
    })
  ])

  const fichasProducao = producoesFichas.reduce((acc, prod) => {
    const existing = acc.find(item => item.id === prod.fichaTecnica.id)
    if (existing) {
      (existing as ProducaoItem).quantidadeTotal += prod.quantidadeProduzida;
      (existing as ProducaoItem).numeroProducoes += 1
    } else {
      acc.push({
        id: prod.fichaTecnica.id,
        nome: prod.fichaTecnica.nome,
        quantidadeTotal: prod.quantidadeProduzida,
        numeroProducoes: 1,
        tipo: 'ficha'
      })
    }
    return acc
  }, [] as ProducaoItem[])

  const produtosProducao = producoesProdutos.reduce((acc, prod) => {
    const existing = acc.find(item => item.id === prod.produto.id)
    if (existing) {
      (existing as ProducaoItem).quantidadeTotal += prod.quantidadeProduzida;
      (existing as ProducaoItem).numeroProducoes += 1
    } else {
      acc.push({
        id: prod.produto.id,
        nome: prod.produto.nome,
        quantidadeTotal: prod.quantidadeProduzida,
        numeroProducoes: 1,
        tipo: 'produto'
      })
    }
    return acc
  }, [] as ProducaoItem[])

  return {
    type: 'producao',
    data: {
      fichas: fichasProducao,
      produtos: produtosProducao,
      producoesFichas: producoesFichas,
      producoesProdutos: producoesProdutos
    },
    summary: {
      totalProducoesFichas: producoesFichas.length,
      totalProducoesProdutos: producoesProdutos.length,
      quantidadeTotalFichas: fichasProducao.reduce((sum, f) => sum + f.quantidadeTotal, 0),
      quantidadeTotalProdutos: produtosProducao.reduce((sum, p) => sum + p.quantidadeTotal, 0)
    }
  }
}

async function generateInventoryReport(userId: string) {
  const whereClause: Record<string, unknown> = { userId }

  const [movimentacoesInsumos, movimentacoesProdutos] = await Promise.all([
    withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.movimentacaoEstoque.findMany({
          where: whereClause,
          include: {
            insumo: true
          },
          orderBy: { createdAt: 'desc' }
        })
      })
    }),
    withConnectionHealthCheck(async () => {
      return await withDatabaseRetry(async () => {
        return await prisma.movimentacaoProduto.findMany({
          where: whereClause,
          include: {
            produto: true
          },
          orderBy: { createdAt: 'desc' }
        })
      })
    })
  ])

  const estoqueInsumos = movimentacoesInsumos.reduce((acc, mov) => {
    const existing = acc.find(item => item.id === mov.insumo.id)
    const quantidade = mov.tipo === 'entrada' ? mov.quantidade : -mov.quantidade
    
    if (existing) {
      (existing as EstoqueItem).saldoAtual += quantidade;
      (existing as EstoqueItem).entradas += mov.tipo === 'entrada' ? mov.quantidade : 0;
      (existing as EstoqueItem).saidas += mov.tipo === 'saida' ? mov.quantidade : 0
    } else {
      acc.push({
        id: mov.insumo.id,
        nome: mov.insumo.nome,
        saldoAtual: quantidade,
        entradas: mov.tipo === 'entrada' ? mov.quantidade : 0,
        saidas: mov.tipo === 'saida' ? mov.quantidade : 0,
        precoUnidade: mov.insumo.precoUnidade,
        valorEstoque: 0
      })
    }
    return acc
  }, [] as EstoqueItem[])

  estoqueInsumos.forEach(item => {
    item.valorEstoque = (item.saldoAtual / 1000) * (item.precoUnidade || 0)
  })

  const estoqueProdutos = movimentacoesProdutos.reduce((acc, mov) => {
    const existing = acc.find(item => item.id === mov.produto.id)
    const quantidade = mov.tipo === 'entrada' ? mov.quantidade : -mov.quantidade
    
    if (existing) {
      (existing as EstoqueItem).saldoAtual += quantidade;
      (existing as EstoqueItem).entradas += mov.tipo === 'entrada' ? mov.quantidade : 0;
      (existing as EstoqueItem).saidas += mov.tipo === 'saida' ? mov.quantidade : 0
    } else {
      acc.push({
        id: mov.produto.id,
        nome: mov.produto.nome,
        saldoAtual: quantidade,
        entradas: mov.tipo === 'entrada' ? mov.quantidade : 0,
        saidas: mov.tipo === 'saida' ? mov.quantidade : 0,
        precoVenda: mov.produto.precoVenda,
        valorEstoque: 0
      })
    }
    return acc
  }, [] as EstoqueItem[])

  estoqueProdutos.forEach(item => {
    item.valorEstoque = item.saldoAtual * (item.precoVenda || 0)
  })

  return {
    type: 'estoque',
    data: {
      insumos: estoqueInsumos,
      produtos: estoqueProdutos,
      movimentacoesInsumos: movimentacoesInsumos,
      movimentacoesProdutos: movimentacoesProdutos
    },
    summary: {
      totalInsumos: estoqueInsumos.length,
      totalProdutos: estoqueProdutos.length,
      valorTotalInsumos: estoqueInsumos.reduce((sum, i) => sum + i.valorEstoque, 0),
      valorTotalProdutos: estoqueProdutos.reduce((sum, p) => sum + p.valorEstoque, 0)
    }
  }
}

async function generateRecipeReport(userId: string) {
  const whereClause: Record<string, unknown> = { userId }

  const [fichasTecnicas, producoes] = await Promise.all([
    withDatabaseRetry(async () => {
      return await prisma.fichaTecnica.findMany({
        where: { userId },
        include: {
          categoria: true,
          ingredientes: {
            include: {
              insumo: true
            }
          }
        }
      })
    }),
    withDatabaseRetry(async () => {
      return await prisma.producao.findMany({
        where: whereClause,
        include: {
          fichaTecnica: true
        }
      })
    })
  ])

  const fichasComUso = fichasTecnicas.map(ficha => {
    const producoesFicha = producoes.filter(p => p.fichaTecnicaId === ficha.id)
    const quantidadeTotal = producoesFicha.reduce((sum, p) => sum + p.quantidadeProduzida, 0)
    
    const custoTotal = ficha.ingredientes.reduce((total, ing) => {
      const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
      return total + (custoPorGrama * ing.quantidadeGramas)
    }, 0)

    return {
      id: ficha.id,
      nome: ficha.nome,
      categoria: ficha.categoria.nome,
      numeroProducoes: producoesFicha.length,
      quantidadeTotal: quantidadeTotal,
      pesoFinal: ficha.pesoFinalGramas,
      numeroPorcoes: ficha.numeroPorcoes,
      custoTotal: custoTotal,
      custoPorPorcao: custoTotal / ficha.numeroPorcoes,
      nivelDificuldade: ficha.nivelDificuldade,
      tempoPreparo: ficha.tempoPreparo
    }
  })

  const fichasOrdenadas = fichasComUso.sort((a, b) => b.numeroProducoes - a.numeroProducoes)

  return {
    type: 'fichas',
    data: {
      fichasMaisUsadas: fichasOrdenadas.slice(0, 10),
      todasFichas: fichasOrdenadas,
      categorias: fichasTecnicas.reduce((acc, ficha) => {
        const categoria = ficha.categoria.nome
        const existing = acc.find(c => c.nome === categoria)
        if (existing) {
          (existing as { quantidade: number }).quantidade += 1
        } else {
          acc.push({ nome: categoria, quantidade: 1 })
        }
        return acc
      }, [] as Array<Record<string, unknown>>)
    },
    summary: {
      totalFichas: fichasTecnicas.length,
      totalProducoes: producoes.length,
      fichasMaisPopular: fichasOrdenadas[0]?.nome || 'Nenhuma',
      mediaProducoesPorFicha: producoes.length / (fichasTecnicas.length || 1)
    }
  }
}

async function generateProfitabilityReport(userId: string) {
  const produtos = await withDatabaseRetry(async () => {
    return await prisma.produto.findMany({
      where: { userId },
      include: {
        produtoFichas: {
          include: {
            fichaTecnica: {
              include: {
                ingredientes: {
                  include: {
                    insumo: true
                  }
                }
              }
            }
          }
        },
        producoesProduto: true,
        movimentacoesProduto: true
      }
    })
  })

  const produtosRentabilidade = produtos.map(produto => {
    const custoProducao = produto.produtoFichas.reduce((total, produtoFicha) => {
      const fichaCusto = produtoFicha.fichaTecnica.ingredientes.reduce((fichaTotal, ing) => {
        const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
        return fichaTotal + (custoPorGrama * ing.quantidadeGramas)
      }, 0)
      const custoPorGramaFicha = fichaCusto / produtoFicha.fichaTecnica.pesoFinalGramas
      return total + (custoPorGramaFicha * produtoFicha.quantidadeGramas)
    }, 0)

    const quantidadeProduzida = produto.producoesProduto.reduce((sum, p) => sum + p.quantidadeProduzida, 0)
    const quantidadeVendida = produto.movimentacoesProduto
      .filter(m => m.tipo === 'saida')
      .reduce((sum, m) => sum + m.quantidade, 0)
    
    const receitaTotal = quantidadeVendida * produto.precoVenda
    const custoTotal = quantidadeVendida * custoProducao
    const lucroTotal = receitaTotal - custoTotal
    const margemLucroReal = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0

    return {
      id: produto.id,
      nome: produto.nome,
      custoProducao,
      precoVenda: produto.precoVenda,
      margemLucroConfigurada: produto.margemLucro,
      margemLucroReal,
      quantidadeProduzida,
      quantidadeVendida,
      receitaTotal,
      custoTotal,
      lucroTotal,
      rentabilidade: margemLucroReal >= produto.margemLucro ? 'Alta' : margemLucroReal >= produto.margemLucro * 0.8 ? 'Média' : 'Baixa'
    }
  })

  const produtosOrdenados = produtosRentabilidade.sort((a, b) => b.margemLucroReal - a.margemLucroReal)

  return {
    type: 'rentabilidade',
    data: {
      produtos: produtosOrdenados,
      maisRentaveis: produtosOrdenados.slice(0, 5),
      menosRentaveis: produtosOrdenados.slice(-5).reverse()
    },
    summary: {
      totalProdutos: produtos.length,
      receitaTotal: produtosRentabilidade.reduce((sum, p) => sum + p.receitaTotal, 0),
      custoTotal: produtosRentabilidade.reduce((sum, p) => sum + p.custoTotal, 0),
      lucroTotal: produtosRentabilidade.reduce((sum, p) => sum + p.lucroTotal, 0),
      margemMediaReal: produtosRentabilidade.reduce((sum, p) => sum + p.margemLucroReal, 0) / (produtos.length || 1)
    }
  }
}

async function generateAbcInsumosReport(userId: string) {
  const insumos = await withDatabaseRetry(async () => {
    return await prisma.insumo.findMany({
      where: { userId },
      include: {
        ingredientes: {
          include: {
            fichaTecnica: {
              include: {
                producoes: true
              }
            }
          }
        }
      }
    })
  })

  const insumosAnalise = insumos.map(insumo => {
    const usoTotal = insumo.ingredientes.reduce((total, ingrediente) => {
      const producoes = ingrediente.fichaTecnica.producoes
      const quantidadeUsadaPorProducao = producoes.reduce((sum, producao) => {
        return sum + (ingrediente.quantidadeGramas * producao.quantidadeProduzida / ingrediente.fichaTecnica.pesoFinalGramas)
      }, 0)
      return total + quantidadeUsadaPorProducao
    }, 0)

    const numeroReceitas = insumo.ingredientes.length
    const numeroProducoes = insumo.ingredientes.reduce((sum, ing) => sum + ing.fichaTecnica.producoes.length, 0)
    const valorTotal = usoTotal * (insumo.precoUnidade / insumo.pesoLiquidoGramas)

    return {
      id: insumo.id,
      nome: insumo.nome,
      usoTotal,
      numeroReceitas,
      numeroProducoes,
      valorTotal,
      precoUnidade: insumo.precoUnidade,
      frequenciaUso: numeroProducoes
    }
  })

  const insumosOrdenados = insumosAnalise.sort((a, b) => b.valorTotal - a.valorTotal)
  
  const valorTotalGeral = insumosOrdenados.reduce((sum, i) => sum + i.valorTotal, 0)
  let valorAcumulado = 0
  const insumosClassificados = insumosOrdenados.map(insumo => {
    valorAcumulado += insumo.valorTotal
    const percentualAcumulado = (valorAcumulado / valorTotalGeral) * 100
    
    let classificacao: 'A' | 'B' | 'C' = 'C'
    if (percentualAcumulado <= 80) classificacao = 'A'
    else if (percentualAcumulado <= 95) classificacao = 'B'

    return {
      ...insumo,
      classificacao,
      percentualValor: (insumo.valorTotal / valorTotalGeral) * 100,
      percentualAcumulado
    }
  })

  return {
    type: 'abc-insumos',
    data: {
      insumos: insumosClassificados,
      classeA: insumosClassificados.filter(i => i.classificacao === 'A'),
      classeB: insumosClassificados.filter(i => i.classificacao === 'B'),
      classeC: insumosClassificados.filter(i => i.classificacao === 'C')
    },
    summary: {
      totalInsumos: insumos.length,
      valorTotalGeral,
      quantidadeA: insumosClassificados.filter(i => i.classificacao === 'A').length,
      quantidadeB: insumosClassificados.filter(i => i.classificacao === 'B').length,
      quantidadeC: insumosClassificados.filter(i => i.classificacao === 'C').length,
      percentualValorA: insumosClassificados.filter(i => i.classificacao === 'A').reduce((sum, i) => sum + i.percentualValor, 0)
    }
  }
}

async function generateWasteReport(userId: string) {
  const [movimentacoesInsumos, movimentacoesProdutos] = await Promise.all([
    prisma.movimentacaoEstoque.findMany({
      where: { userId },
      include: { insumo: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.movimentacaoProduto.findMany({
      where: { userId },
      include: { produto: true },
      orderBy: { createdAt: 'desc' }
    })
  ])

  const hoje = new Date()
  const itensVencidos = [
    ...movimentacoesInsumos.filter(m => m.dataValidade && m.dataValidade < hoje && m.tipo === 'entrada'),
    ...movimentacoesProdutos.filter(m => m.dataValidade && m.dataValidade < hoje && m.tipo === 'entrada')
  ]

  const saldosInsumos = movimentacoesInsumos.reduce((acc, mov) => {
    const existing = acc.find(item => item.id === mov.insumo.id)
    const quantidade = mov.tipo === 'entrada' ? mov.quantidade : -mov.quantidade
    
    if (existing) {
      existing.saldo += quantidade
      existing.movimentacoes.push(mov)
    } else {
      acc.push({
        id: mov.insumo.id,
        nome: mov.insumo.nome,
        tipo: 'insumo',
        saldo: quantidade,
        precoUnidade: mov.insumo.precoUnidade,
        movimentacoes: [mov]
      })
    }
    return acc
  }, [] as Array<{id: string, nome: string, tipo: string, saldo: number, precoUnidade: number, movimentacoes: Array<{id: string, quantidade: number, tipo: string, dataValidade?: Date | null, createdAt: Date}>}>)

  const saldosProdutos = movimentacoesProdutos.reduce((acc, mov) => {
    const existing = acc.find(item => item.id === mov.produto.id)
    const quantidade = mov.tipo === 'entrada' ? mov.quantidade : -mov.quantidade
    
    if (existing) {
      existing.saldo += quantidade
      existing.movimentacoes.push(mov)
    } else {
      acc.push({
        id: mov.produto.id,
        nome: mov.produto.nome,
        tipo: 'produto',
        saldo: quantidade,
        precoUnidade: mov.produto.precoVenda,
        movimentacoes: [mov]
      })
    }
    return acc
  }, [] as Array<{id: string, nome: string, tipo: string, saldo: number, precoUnidade: number, movimentacoes: Array<{id: string, quantidade: number, tipo: string, dataValidade?: Date | null, createdAt: Date}>}>)

  const itensComPerda = [...saldosInsumos, ...saldosProdutos].filter(item => item.saldo < 0)
  const perdas = itensComPerda.map(item => ({
    ...item,
    valorPerda: Math.abs(item.saldo) * item.precoUnidade,
    motivoPerda: 'Saldo Negativo'
  }))

  const perdasPorVencimento = itensVencidos.map(item => ({
    id: 'insumo' in item ? item.insumo.id : item.produto.id,
    nome: 'insumo' in item ? item.insumo.nome : item.produto.nome,
    tipo: 'insumo' in item ? 'insumo' : 'produto',
    quantidade: item.quantidade,
    valorPerda: item.quantidade * ('insumo' in item ? item.insumo.precoUnidade / item.insumo.pesoLiquidoGramas : item.produto.precoVenda),
    dataVencimento: item.dataValidade,
    motivoPerda: 'Vencimento'
  }))

  const todasPerdas = [...perdas, ...perdasPorVencimento]

  return {
    type: 'desperdicio',
    data: {
      perdas: todasPerdas,
      perdasPorSaldoNegativo: perdas,
      perdasPorVencimento: perdasPorVencimento,
      itensVencidos: itensVencidos.length,
      itensComSaldoNegativo: itensComPerda.length
    },
    summary: {
      totalPerdas: todasPerdas.length,
      valorTotalPerdas: todasPerdas.reduce((sum, p) => sum + p.valorPerda, 0),
      valorPerdasVencimento: perdasPorVencimento.reduce((sum, p) => sum + p.valorPerda, 0),
      valorPerdasSaldoNegativo: perdas.reduce((sum, p) => sum + p.valorPerda, 0),
      percentualPerdaVencimento: perdasPorVencimento.length / (todasPerdas.length || 1) * 100
    }
  }
}
