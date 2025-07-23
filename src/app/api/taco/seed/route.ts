import { prisma } from '@/lib/prisma'
import { withDatabaseRetry, withConnectionHealthCheck } from '@/lib/database-utils'
import { createSuccessResponse } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api-helpers'
import { fetchTacoData, convertTacoToNumber } from '@/lib/taco-data'

export const POST = withErrorHandler(async function POST() {
  const tacoData = await fetchTacoData()
  
  const processedData = tacoData.map(item => ({
    id: item.id,
    description: item.description,
    category: item.category,
    humidityPercents: convertTacoToNumber(item.humidity_percents),
    energyKcal: convertTacoToNumber(item.energy_kcal),
    energyKj: convertTacoToNumber(item.energy_kj),
    proteinG: convertTacoToNumber(item.protein_g),
    lipidG: convertTacoToNumber(item.lipid_g),
    cholesterolMg: convertTacoToNumber(item.cholesterol_mg),
    carbohydrateG: convertTacoToNumber(item.carbohydrate_g),
    fiberG: convertTacoToNumber(item.fiber_g),
    ashesG: convertTacoToNumber(item.ashes_g),
    calciumMg: convertTacoToNumber(item.calcium_mg),
    magnesiumMg: convertTacoToNumber(item.magnesium_mg),
    manganeseMg: convertTacoToNumber(item.manganese_mg),
    phosphorusMg: convertTacoToNumber(item.phosphorus_mg),
    ironMg: convertTacoToNumber(item.iron_mg),
    sodiumMg: convertTacoToNumber(item.sodium_mg),
    potassiumMg: convertTacoToNumber(item.potassium_mg),
    copperMg: convertTacoToNumber(item.copper_mg),
    zincMg: convertTacoToNumber(item.zinc_mg),
    retinolMcg: convertTacoToNumber(item.retinol_mcg),
    thiamineMg: convertTacoToNumber(item.thiamine_mg),
    riboflavinMg: convertTacoToNumber(item.riboflavin_mg),
    pyridoxineMg: convertTacoToNumber(item.pyridoxine_mg),
    niacinMg: convertTacoToNumber(item.niacin_mg),
    vitaminCMg: convertTacoToNumber(item.vitaminC_mg)
  }))

  await withConnectionHealthCheck(async () => {
    return await withDatabaseRetry(async () => {
      await prisma.tacoAlimento.deleteMany()
      await prisma.tacoAlimento.createMany({ data: processedData })
    })
  })

  return createSuccessResponse({ message: 'TACO data seeded successfully', count: processedData.length })
})
