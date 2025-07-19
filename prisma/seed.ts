import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Populando banco de dados...')

  // Criar usuário de desenvolvimento
  const devUser = await prisma.perfilUsuario.upsert({
    where: { userId: 'dev-user-id' },
    update: {},
    create: {
      userId: 'dev-user-id',
      role: 'admin',
      nome: 'Usuário Desenvolvimento',
      email: 'dev@fichachef.com'
    }
  })

  // Criar categorias de insumos
  const categoriaFarinhas = await prisma.categoriaInsumo.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      nome: 'Farinhas',
      descricao: 'Farinhas e derivados',
      userId: 'dev-user-id'
    }
  })

  const categoriaAcucares = await prisma.categoriaInsumo.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      nome: 'Açúcares',
      descricao: 'Açúcares e adoçantes',
      userId: 'dev-user-id'
    }
  })

  const categoriaProteinas = await prisma.categoriaInsumo.upsert({
    where: { id: '3' },
    update: {},
    create: {
      id: '3',
      nome: 'Proteínas',
      descricao: 'Ovos, carnes e proteínas',
      userId: 'dev-user-id'
    }
  })

  // Criar unidades de medida
  const unidadePacote = await prisma.unidadeMedida.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      nome: 'Pacote',
      simbolo: 'pct',
      tipo: 'unidade',
      userId: 'dev-user-id'
    }
  })

  const unidadeDuzia = await prisma.unidadeMedida.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      nome: 'Dúzia',
      simbolo: 'dz',
      tipo: 'unidade',
      userId: 'dev-user-id'
    }
  })

  const unidadeGrama = await prisma.unidadeMedida.upsert({
    where: { id: '3' },
    update: {},
    create: {
      id: '3',
      nome: 'Grama',
      simbolo: 'g',
      tipo: 'peso',
      userId: 'dev-user-id'
    }
  })

  // Criar categorias de receitas
  const categoriaBolos = await prisma.categoriaReceita.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      nome: 'Bolos',
      descricao: 'Bolos e tortas',
      userId: 'dev-user-id'
    }
  })

  const categoriaPaes = await prisma.categoriaReceita.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      nome: 'Pães',
      descricao: 'Pães e massas',
      userId: 'dev-user-id'
    }
  })

  // Criar insumos
  const farinha = await prisma.insumo.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      nome: 'Farinha de Trigo',
      marca: 'Dona Benta',
      precoUnidade: 4.50,
      pesoLiquidoGramas: 1000,
      categoriaId: '1',
      unidadeCompraId: '1',
      userId: 'dev-user-id'
    }
  })

  const acucar = await prisma.insumo.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      nome: 'Açúcar Cristal',
      marca: 'União',
      precoUnidade: 3.20,
      pesoLiquidoGramas: 1000,
      categoriaId: '2',
      unidadeCompraId: '1',
      userId: 'dev-user-id'
    }
  })

  const ovos = await prisma.insumo.upsert({
    where: { id: '3' },
    update: {},
    create: {
      id: '3',
      nome: 'Ovos',
      marca: 'Granja Mantiqueira',
      precoUnidade: 8.90,
      pesoLiquidoGramas: 720,
      categoriaId: '3',
      unidadeCompraId: '2',
      userId: 'dev-user-id'
    }
  })

  console.log('✅ Banco de dados populado com sucesso!')
  console.log(`👤 Usuário: ${devUser.nome}`)
  console.log(`📦 Categorias: ${categoriaFarinhas.nome}, ${categoriaAcucares.nome}, ${categoriaProteinas.nome}`)
  console.log(`📏 Unidades: ${unidadePacote.nome}, ${unidadeDuzia.nome}, ${unidadeGrama.nome}`)
  console.log(`🍰 Receitas: ${categoriaBolos.nome}, ${categoriaPaes.nome}`)
  console.log(`🥄 Insumos: ${farinha.nome}, ${acucar.nome}, ${ovos.nome}`)
}

main()
  .catch((e) => {
    console.error('❌ Erro ao popular banco:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

