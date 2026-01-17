/**
 * Utilitários para lidar com usuário temporário em produção
 */

import { NextResponse } from 'next/server'
import { createSuccessResponse } from './auth'

/**
 * Verifica se é um usuário temporário de produção
 */
export function isTempUser(userId: string): boolean {
  return userId === 'temp-prod-user'
}

/**
 * Retorna dados vazios para usuário temporário
 */
export function getTempUserEmptyResponse(data: unknown[] = []) {
  return createSuccessResponse(data)
}

/**
 * Retorna dados de exemplo para usuário temporário
 */
export function getTempUserSampleData(type: string): unknown {
  switch (type) {
    case 'notificacoes':
      return []
    
    case 'fornecedores':
      return []
    
    case 'insumos':
      return [
        {
          id: 'temp-insumo-1',
          nome: 'Farinha de Trigo',
          marca: 'Dona Benta',
          precoUnidade: 4.50,
          pesoLiquidoGramas: 1000,
          categoriaId: 'temp-cat-1',
          unidadeCompraId: 'temp-unid-1',
          userId: 'temp-prod-user',
          categoria: { id: 'temp-cat-1', nome: 'Farinhas' },
          unidadeCompra: { id: 'temp-unid-1', nome: 'Pacote', simbolo: 'pct' }
        },
        {
          id: 'temp-insumo-2',
          nome: 'Açúcar Cristal',
          marca: 'União',
          precoUnidade: 3.20,
          pesoLiquidoGramas: 1000,
          categoriaId: 'temp-cat-2',
          unidadeCompraId: 'temp-unid-1',
          userId: 'temp-prod-user',
          categoria: { id: 'temp-cat-2', nome: 'Açúcares' },
          unidadeCompra: { id: 'temp-unid-1', nome: 'Pacote', simbolo: 'pct' }
        }
      ]
    
    case 'produtos':
      return [
        {
          id: 'temp-produto-1',
          nome: 'Pizza Margherita',
          precoVenda: 25.90,
          margemLucro: 60.0,
          userId: 'temp-prod-user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          produtoFichas: [
            {
              id: 'temp-pf-1',
              produtoId: 'temp-produto-1',
              fichaTecnicaId: 'temp-ficha-1',
              quantidadeGramas: 350,
              fichaTecnica: {
                id: 'temp-ficha-1',
                nome: 'Massa Pizza Margherita',
                pesoFinalGramas: 350,
                categoriaId: 'temp-cat-pizza',
                numeroPorcoes: 1,
                userId: 'temp-prod-user',
                ingredientes: [
                  {
                    id: 'temp-ing-1',
                    quantidadeGramas: 200,
                    insumo: {
                      id: 'temp-insumo-1',
                      precoUnidade: 4.50,
                      pesoLiquidoGramas: 1000
                    }
                  },
                  {
                    id: 'temp-ing-2',
                    quantidadeGramas: 150,
                    insumo: {
                      id: 'temp-insumo-3',
                      precoUnidade: 12.00,
                      pesoLiquidoGramas: 400
                    }
                  }
                ]
              }
            }
          ]
        },
        {
          id: 'temp-produto-2',
          nome: 'Hambúrguer Artesanal',
          precoVenda: 18.50,
          margemLucro: 55.0,
          userId: 'temp-prod-user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          produtoFichas: [
            {
              id: 'temp-pf-2',
              produtoId: 'temp-produto-2',
              fichaTecnicaId: 'temp-ficha-2',
              quantidadeGramas: 250,
              fichaTecnica: {
                id: 'temp-ficha-2',
                nome: 'Pão de Hambúrguer + Carne',
                pesoFinalGramas: 250,
                categoriaId: 'temp-cat-burger',
                numeroPorcoes: 1,
                userId: 'temp-prod-user',
                ingredientes: [
                  {
                    id: 'temp-ing-3',
                    quantidadeGramas: 120,
                    insumo: {
                      id: 'temp-insumo-4',
                      precoUnidade: 16.00,
                      pesoLiquidoGramas: 500
                    }
                  },
                  {
                    id: 'temp-ing-4',
                    quantidadeGramas: 130,
                    insumo: {
                      id: 'temp-insumo-5',
                      precoUnidade: 3.50,
                      pesoLiquidoGramas: 100
                    }
                  }
                ]
              }
            }
          ]
        },
        {
          id: 'temp-produto-3',
          nome: 'Salada Caesar',
          precoVenda: 14.90,
          margemLucro: 70.0,
          userId: 'temp-prod-user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          produtoFichas: [
            {
              id: 'temp-pf-3',
              produtoId: 'temp-produto-3',
              fichaTecnicaId: 'temp-ficha-3',
              quantidadeGramas: 300,
              fichaTecnica: {
                id: 'temp-ficha-3',
                nome: 'Mix Salada Caesar',
                pesoFinalGramas: 300,
                categoriaId: 'temp-cat-salada',
                numeroPorcoes: 1,
                userId: 'temp-prod-user',
                ingredientes: [
                  {
                    id: 'temp-ing-5',
                    quantidadeGramas: 200,
                    insumo: {
                      id: 'temp-insumo-6',
                      precoUnidade: 2.50,
                      pesoLiquidoGramas: 150
                    }
                  },
                  {
                    id: 'temp-ing-6',
                    quantidadeGramas: 100,
                    insumo: {
                      id: 'temp-insumo-7',
                      precoUnidade: 8.90,
                      pesoLiquidoGramas: 200
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    
    case 'fichas-tecnicas':
      return [
        {
          id: 'temp-ficha-1',
          nome: 'Massa Pizza Margherita',
          pesoFinalGramas: 350,
          categoriaId: 'temp-cat-pizza',
          numeroPorcoes: 1,
          tempoPreparo: 30,
          temperaturaForno: 250,
          modoPreparo: 'Misturar ingredientes, sovar a massa, deixar descansar e abrir.',
          nivelDificuldade: 'Médio',
          userId: 'temp-prod-user',
          categoria: { nome: 'Pizzas' },
          ingredientes: []
        },
        {
          id: 'temp-ficha-2',
          nome: 'Pão de Hambúrguer + Carne',
          pesoFinalGramas: 250,
          categoriaId: 'temp-cat-burger',
          numeroPorcoes: 1,
          tempoPreparo: 20,
          temperaturaForno: 180,
          modoPreparo: 'Grelhar a carne, montar o hambúrguer com os ingredientes.',
          nivelDificuldade: 'Fácil',
          userId: 'temp-prod-user',
          categoria: { nome: 'Lanches' },
          ingredientes: []
        },
        {
          id: 'temp-ficha-3',
          nome: 'Mix Salada Caesar',
          pesoFinalGramas: 300,
          categoriaId: 'temp-cat-salada',
          numeroPorcoes: 1,
          tempoPreparo: 10,
          temperaturaForno: null,
          modoPreparo: 'Lavar e cortar a alface, adicionar molho caesar e croutons.',
          nivelDificuldade: 'Fácil',
          userId: 'temp-prod-user',
          categoria: { nome: 'Saladas' },
          ingredientes: []
        }
      ]
    
    case 'producao':
      return []
    
    case 'perfil-usuario':
      return {
        userId: 'temp-prod-user',
        email: 'temp@fichachef.com',
        role: 'chef',
        nome: 'Usuário Temporário'
      }
    
    default:
      return []
  }
}

/**
 * Wrapper para APIs que precisam lidar com usuário temporário
 */
export function withTempUserHandling<T>(
  userId: string,
  dataType: string,
  callback: () => Promise<T>
): Promise<NextResponse> {
  if (isTempUser(userId)) {
    const sampleData = getTempUserSampleData(dataType)
    return Promise.resolve(createSuccessResponse(sampleData))
  }
  
  return callback() as Promise<NextResponse>
}

