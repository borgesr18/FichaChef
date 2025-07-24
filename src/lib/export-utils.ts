import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { formatCurrency } from './utils'

export interface ExportTemplate {
  id?: string
  nome: string
  tipo: string
  configuracao: {
    cores: {
      primaria: string
      secundaria: string
      texto: string
    }
    fonte: {
      familia: string
      tamanho: number
    }
    layout: {
      margens: number
      espacamento: number
      logoEmpresa: boolean
    }
  }
}

export interface ReportData {
  type: string
  data: Record<string, unknown>
  summary: Record<string, unknown>
}

export function generatePDF(reportData: ReportData, template?: ExportTemplate | null): Blob {
  const doc = new jsPDF()
  const config = template?.configuracao || getDefaultTemplate().configuracao
  
  doc.setFontSize(20)
  doc.setTextColor(config.cores.primaria)
  doc.text('FichaChef - Relatório', 20, 30)
  
  doc.setFontSize(16)
  doc.setTextColor(config.cores.texto)
  const reportTitles = {
    custos: 'Análise de Custos',
    producao: 'Relatório de Produção',
    estoque: 'Controle de Estoque',
    fichas: 'Fichas Mais Utilizadas',
    rentabilidade: 'Relatório de Rentabilidade',
    'abc-insumos': 'Análise ABC de Insumos',
    desperdicio: 'Relatório de Desperdício'
  }
  doc.text(reportTitles[reportData.type as keyof typeof reportTitles] || 'Relatório', 20, 50)
  
  doc.setFontSize(10)
  const currentDate = new Date().toLocaleDateString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit'
  })
  doc.text(`Gerado em: ${currentDate}`, 20, 60)
  
  let yPosition = 80
  doc.setFontSize(14)
  doc.text('Resumo', 20, yPosition)
  yPosition += 10
  
  doc.setFontSize(10)
  Object.entries(reportData.summary).forEach(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    const formattedValue = typeof value === 'number' && (key.toLowerCase().includes('custo') || key.toLowerCase().includes('valor'))
      ? formatCurrency(value as number)
      : typeof value === 'number' 
        ? (value as number).toFixed(key.includes('media') ? 1 : 0)
        : String(value)
    doc.text(`${label}: ${formattedValue}`, 20, yPosition)
    yPosition += 8
    
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 30
    }
  })
  
  yPosition += 10
  doc.setFontSize(14)
  doc.text('Dados Detalhados', 20, yPosition)
  yPosition += 10
  
  doc.setFontSize(8)
  
  if (reportData.type === 'custos') {
    const costData = reportData.data as { produtos: Record<string, unknown>[], fichasTecnicas: Record<string, unknown>[] }
    if (costData.produtos?.length) {
      doc.text('Produtos:', 20, yPosition)
      yPosition += 8
      costData.produtos.slice(0, 10).forEach((produto) => {
        doc.text(`${produto.nome}: ${formatCurrency(produto.custoProducao as number)}`, 25, yPosition)
        yPosition += 6
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 30
        }
      })
    }
  } else if (reportData.type === 'rentabilidade') {
    const profitData = reportData.data as { produtos: Record<string, unknown>[] }
    if (profitData.produtos?.length) {
      doc.text('Top 10 Produtos por Rentabilidade:', 20, yPosition)
      yPosition += 8
      profitData.produtos.slice(0, 10).forEach((produto) => {
        doc.text(`${produto.nome}: ${(produto.margemLucroReal as number).toFixed(1)}%`, 25, yPosition)
        yPosition += 6
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 30
        }
      })
    }
  } else {
    doc.text('Para dados detalhados completos, utilize a exportação Excel.', 20, yPosition)
  }
  
  return new Blob([doc.output('blob')], { type: 'application/pdf' })
}

export function generateExcel(reportData: ReportData): Blob {
  const workbook = XLSX.utils.book_new()
  
  const summaryData = Object.entries(reportData.summary).map(([key, value]) => ({
    'Métrica': key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    'Valor': typeof value === 'number' && (key.toLowerCase().includes('custo') || key.toLowerCase().includes('valor'))
      ? formatCurrency(value as number)
      : String(value)
  }))
  
  const summarySheet = XLSX.utils.json_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo')
  
  if (reportData.type === 'custos') {
    const costData = reportData.data as { produtos: Record<string, unknown>[], fichasTecnicas: Record<string, unknown>[] }
    if (costData.produtos?.length) {
      const produtosFormatted = costData.produtos.map(p => ({
        'Nome': p.nome,
        'Custo Produção': formatCurrency(p.custoProducao as number),
        'Preço Venda': formatCurrency(p.precoVenda as number),
        'Margem Configurada': `${p.margemLucroConfigurada}%`,
        'Margem Real': `${(p.margemLucroReal as number).toFixed(1)}%`,
        'Peso Total (g)': p.pesoTotal,
        'Custo por Grama': formatCurrency(p.custoPorGrama as number)
      }))
      const produtosSheet = XLSX.utils.json_to_sheet(produtosFormatted)
      XLSX.utils.book_append_sheet(workbook, produtosSheet, 'Produtos')
    }
    if (costData.fichasTecnicas?.length) {
      const fichasFormatted = costData.fichasTecnicas.map(f => ({
        'Nome': f.nome,
        'Custo Total': formatCurrency(f.custoTotal as number),
        'Peso Final (g)': f.pesoFinal,
        'Custo por Grama': formatCurrency(f.custoPorGrama as number),
        'Custo por Porção': formatCurrency(f.custoPorPorcao as number),
        'Número Porções': f.numeroPorcoes
      }))
      const fichasSheet = XLSX.utils.json_to_sheet(fichasFormatted)
      XLSX.utils.book_append_sheet(workbook, fichasSheet, 'Fichas Técnicas')
    }
  } else if (reportData.type === 'producao') {
    const prodData = reportData.data as { fichas: Record<string, unknown>[], produtos: Record<string, unknown>[] }
    if (prodData.fichas?.length) {
      const fichasSheet = XLSX.utils.json_to_sheet(prodData.fichas)
      XLSX.utils.book_append_sheet(workbook, fichasSheet, 'Produção Fichas')
    }
    if (prodData.produtos?.length) {
      const produtosSheet = XLSX.utils.json_to_sheet(prodData.produtos)
      XLSX.utils.book_append_sheet(workbook, produtosSheet, 'Produção Produtos')
    }
  } else if (reportData.type === 'estoque') {
    const estoqueData = reportData.data as { insumos: Record<string, unknown>[], produtos: Record<string, unknown>[] }
    if (estoqueData.insumos?.length) {
      const insumosFormatted = estoqueData.insumos.map(i => ({
        'Nome': i.nome,
        'Saldo Atual': i.saldoAtual,
        'Entradas': i.entradas,
        'Saídas': i.saidas,
        'Preço Unidade': formatCurrency((i.precoUnidade as number) || 0),
        'Valor Estoque': formatCurrency(i.valorEstoque as number)
      }))
      const insumosSheet = XLSX.utils.json_to_sheet(insumosFormatted)
      XLSX.utils.book_append_sheet(workbook, insumosSheet, 'Estoque Insumos')
    }
    if (estoqueData.produtos?.length) {
      const produtosFormatted = estoqueData.produtos.map(p => ({
        'Nome': p.nome,
        'Saldo Atual': p.saldoAtual,
        'Entradas': p.entradas,
        'Saídas': p.saidas,
        'Preço Venda': formatCurrency((p.precoVenda as number) || 0),
        'Valor Estoque': formatCurrency(p.valorEstoque as number)
      }))
      const produtosSheet = XLSX.utils.json_to_sheet(produtosFormatted)
      XLSX.utils.book_append_sheet(workbook, produtosSheet, 'Estoque Produtos')
    }
  } else if (reportData.type === 'fichas') {
    const fichasData = reportData.data as { todasFichas: Record<string, unknown>[] }
    if (fichasData.todasFichas?.length) {
      const fichasFormatted = fichasData.todasFichas.map(f => ({
        'Nome': f.nome,
        'Categoria': f.categoria,
        'Número Produções': f.numeroProducoes,
        'Quantidade Total': f.quantidadeTotal,
        'Peso Final (g)': f.pesoFinal,
        'Número Porções': f.numeroPorcoes,
        'Custo Total': formatCurrency(f.custoTotal as number),
        'Custo por Porção': formatCurrency(f.custoPorPorcao as number),
        'Nível Dificuldade': f.nivelDificuldade,
        'Tempo Preparo (min)': f.tempoPreparo
      }))
      const fichasSheet = XLSX.utils.json_to_sheet(fichasFormatted)
      XLSX.utils.book_append_sheet(workbook, fichasSheet, 'Fichas Técnicas')
    }
  } else if (reportData.type === 'rentabilidade') {
    const profitData = reportData.data as { produtos: Record<string, unknown>[] }
    if (profitData.produtos?.length) {
      const produtosFormatted = profitData.produtos.map(p => ({
        'Nome': p.nome,
        'Custo Produção': formatCurrency(p.custoProducao as number),
        'Preço Venda': formatCurrency(p.precoVenda as number),
        'Margem Configurada': `${p.margemLucroConfigurada}%`,
        'Margem Real': `${(p.margemLucroReal as number).toFixed(1)}%`,
        'Quantidade Produzida': p.quantidadeProduzida,
        'Quantidade Vendida': p.quantidadeVendida,
        'Receita Total': formatCurrency(p.receitaTotal as number),
        'Custo Total': formatCurrency(p.custoTotal as number),
        'Lucro Total': formatCurrency(p.lucroTotal as number),
        'Rentabilidade': p.rentabilidade
      }))
      const produtosSheet = XLSX.utils.json_to_sheet(produtosFormatted)
      XLSX.utils.book_append_sheet(workbook, produtosSheet, 'Rentabilidade')
    }
  } else if (reportData.type === 'abc-insumos') {
    const abcData = reportData.data as { insumos: Record<string, unknown>[] }
    if (abcData.insumos?.length) {
      const insumosFormatted = abcData.insumos.map(i => ({
        'Nome': i.nome,
        'Uso Total': i.usoTotal,
        'Número Receitas': i.numeroReceitas,
        'Número Produções': i.numeroProducoes,
        'Valor Total': formatCurrency(i.valorTotal as number),
        'Preço Unidade': formatCurrency(i.precoUnidade as number),
        'Classificação': i.classificacao,
        'Percentual Valor': `${(i.percentualValor as number).toFixed(1)}%`,
        'Percentual Acumulado': `${(i.percentualAcumulado as number).toFixed(1)}%`
      }))
      const insumosSheet = XLSX.utils.json_to_sheet(insumosFormatted)
      XLSX.utils.book_append_sheet(workbook, insumosSheet, 'Análise ABC')
    }
  } else if (reportData.type === 'desperdicio') {
    const wasteData = reportData.data as { perdas: Record<string, unknown>[] }
    if (wasteData.perdas?.length) {
      const perdasFormatted = wasteData.perdas.map(p => ({
        'Nome': p.nome,
        'Tipo': p.tipo,
        'Quantidade': p.quantidade || p.saldo,
        'Valor Perda': formatCurrency(p.valorPerda as number),
        'Motivo': p.motivoPerda,
        'Data Vencimento': p.dataVencimento ? new Date(p.dataVencimento as string).toLocaleDateString('pt-BR', { 
          timeZone: 'America/Sao_Paulo',
          year: 'numeric',
          month: '2-digit', 
          day: '2-digit'
        }) : ''
      }))
      const perdasSheet = XLSX.utils.json_to_sheet(perdasFormatted)
      XLSX.utils.book_append_sheet(workbook, perdasSheet, 'Perdas e Desperdícios')
    }
  }
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function getDefaultTemplate(): ExportTemplate {
  return {
    nome: 'Padrão',
    tipo: 'default',
    configuracao: {
      cores: {
        primaria: '#2563eb',
        secundaria: '#64748b',
        texto: '#1f2937'
      },
      fonte: {
        familia: 'Arial',
        tamanho: 12
      },
      layout: {
        margens: 20,
        espacamento: 8,
        logoEmpresa: true
      }
    }
  }
}
