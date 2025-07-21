import { prisma } from '@/lib/prisma'
import { 
  authenticateWithPermission, 
  createSuccessResponse 
} from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { logUserAction } from '@/lib/permissions'

export const POST = withErrorHandler(async function POST(request) {
  const user = await authenticateWithPermission('alertas', 'write')

  const alertasGerados = []

  const configEstoque = await prisma.configuracaoAlerta.findMany({
    where: { userId: user.id, tipo: 'estoque_baixo', ativo: true }
  })

  for (const config of configEstoque) {
    const saldoAtual = await calcularSaldoAtual(config.itemId, config.itemTipo, user.id)
    
    if (saldoAtual <= (config.limiteEstoqueBaixo || 0)) {
      const itemNome = await obterNomeItem(config.itemId, config.itemTipo)
      
      const notificacaoExistente = await prisma.notificacao.findFirst({
        where: {
          userId: user.id,
          tipo: 'estoque_baixo',
          itemId: config.itemId,
          lida: false,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      })

      if (!notificacaoExistente) {
        const notificacao = await prisma.notificacao.create({
          data: {
            tipo: 'estoque_baixo',
            titulo: 'Estoque Baixo',
            mensagem: `${itemNome} está com estoque baixo (${saldoAtual} unidades)`,
            itemTipo: config.itemTipo,
            itemId: config.itemId,
            itemNome,
            prioridade: saldoAtual <= 0 ? 'critica' : 'alta',
            valorAtual: saldoAtual,
            valorLimite: config.limiteEstoqueBaixo,
            userId: user.id
          }
        })
        alertasGerados.push(notificacao)
      }
    }
  }

  const configValidade = await prisma.configuracaoAlerta.findMany({
    where: { userId: user.id, tipo: 'validade_proxima', ativo: true }
  })

  for (const config of configValidade) {
    const itensVencendo = await obterItensVencendo(
      config.itemId, 
      config.itemTipo, 
      config.diasAntesVencimento || 7,
      user.id
    )

    for (const item of itensVencendo) {
      const notificacaoExistente = await prisma.notificacao.findFirst({
        where: {
          userId: user.id,
          tipo: 'validade_proxima',
          itemId: config.itemId,
          dataLimite: item.dataValidade,
          lida: false
        }
      })

      if (!notificacaoExistente) {
        const diasRestantes = Math.ceil((new Date(item.dataValidade).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        const notificacao = await prisma.notificacao.create({
          data: {
            tipo: 'validade_proxima',
            titulo: 'Validade Próxima',
            mensagem: `${item.nome} vence em ${diasRestantes} dias (Lote: ${item.lote || 'N/A'})`,
            itemTipo: config.itemTipo,
            itemId: config.itemId,
            itemNome: item.nome,
            prioridade: diasRestantes <= 1 ? 'critica' : diasRestantes <= 3 ? 'alta' : 'media',
            dataLimite: new Date(item.dataValidade),
            valorAtual: diasRestantes,
            valorLimite: config.diasAntesVencimento,
            userId: user.id
          }
        })
        alertasGerados.push(notificacao)
      }
    }
  }

  const configCusto = await prisma.configuracaoAlerta.findMany({
    where: { userId: user.id, tipo: 'custo_alto', ativo: true }
  })

  for (const config of configCusto) {
    if (config.itemTipo === 'produto') {
      const produto = await prisma.produto.findFirst({
        where: { id: config.itemId, userId: user.id },
        include: {
          produtoFichas: {
            include: {
              fichaTecnica: {
                include: {
                  ingredientes: {
                    include: { insumo: true }
                  }
                }
              }
            }
          }
        }
      })

      if (produto) {
        const custoTotal = produto.produtoFichas.reduce((total, produtoFicha) => {
          const fichaCusto = produtoFicha.fichaTecnica.ingredientes.reduce((fichaTotal, ing) => {
            const custoPorGrama = ing.insumo.precoUnidade / ing.insumo.pesoLiquidoGramas
            return fichaTotal + (custoPorGrama * ing.quantidadeGramas)
          }, 0)
          const custoPorGramaFicha = fichaCusto / produtoFicha.fichaTecnica.pesoFinalGramas
          return total + (custoPorGramaFicha * produtoFicha.quantidadeGramas)
        }, 0)

        const margemReal = produto.precoVenda > 0 ? ((produto.precoVenda - custoTotal) / produto.precoVenda) * 100 : 0
        
        if (margemReal < (config.margemCustoMaxima || 0)) {
          const notificacaoExistente = await prisma.notificacao.findFirst({
            where: {
              userId: user.id,
              tipo: 'custo_alto',
              itemId: config.itemId,
              lida: false,
              createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }
          })

          if (!notificacaoExistente) {
            const notificacao = await prisma.notificacao.create({
              data: {
                tipo: 'custo_alto',
                titulo: 'Margem de Lucro Baixa',
                mensagem: `${produto.nome} está com margem de ${margemReal.toFixed(1)}% (abaixo do limite de ${config.margemCustoMaxima}%)`,
                itemTipo: 'produto',
                itemId: config.itemId,
                itemNome: produto.nome,
                prioridade: margemReal <= 0 ? 'critica' : margemReal <= 10 ? 'alta' : 'media',
                valorAtual: margemReal,
                valorLimite: config.margemCustoMaxima,
                userId: user.id
              }
            })
            alertasGerados.push(notificacao)
          }
        }
      }
    }
  }

  await logUserAction(
    user.id,
    'create',
    'alertas',
    undefined,
    'processamento',
    { alertasGerados: alertasGerados.length },
    request
  )

  return createSuccessResponse({ 
    message: `${alertasGerados.length} alertas processados`,
    alertas: alertasGerados 
  })
})

async function calcularSaldoAtual(itemId: string, itemTipo: string, userId: string): Promise<number> {
  if (itemTipo === 'insumo') {
    const movimentacoes = await prisma.movimentacaoEstoque.findMany({
      where: { insumoId: itemId, userId }
    })
    return movimentacoes.reduce((saldo, mov) => {
      return saldo + (mov.tipo === 'entrada' ? mov.quantidade : -mov.quantidade)
    }, 0)
  } else {
    const movimentacoes = await prisma.movimentacaoProduto.findMany({
      where: { produtoId: itemId, userId }
    })
    return movimentacoes.reduce((saldo, mov) => {
      return saldo + (mov.tipo === 'entrada' ? mov.quantidade : -mov.quantidade)
    }, 0)
  }
}

async function obterNomeItem(itemId: string, itemTipo: string): Promise<string> {
  if (itemTipo === 'insumo') {
    const insumo = await prisma.insumo.findFirst({ where: { id: itemId } })
    return insumo?.nome || 'Item não encontrado'
  } else {
    const produto = await prisma.produto.findFirst({ where: { id: itemId } })
    return produto?.nome || 'Item não encontrado'
  }
}

async function obterItensVencendo(itemId: string, itemTipo: string, diasAntecedencia: number, userId: string) {
  const dataLimite = new Date()
  dataLimite.setDate(dataLimite.getDate() + diasAntecedencia)

  if (itemTipo === 'insumo') {
    const movimentacoes = await prisma.movimentacaoEstoque.findMany({
      where: {
        insumoId: itemId,
        userId,
        dataValidade: { lte: dataLimite, gte: new Date() }
      },
      include: { insumo: true }
    })
    return movimentacoes.map(mov => ({
      nome: mov.insumo.nome,
      dataValidade: mov.dataValidade!,
      lote: mov.lote
    }))
  } else {
    const movimentacoes = await prisma.movimentacaoProduto.findMany({
      where: {
        produtoId: itemId,
        userId,
        dataValidade: { lte: dataLimite, gte: new Date() }
      },
      include: { produto: true }
    })
    return movimentacoes.map(mov => ({
      nome: mov.produto.nome,
      dataValidade: mov.dataValidade!,
      lote: mov.lote
    }))
  }
}
