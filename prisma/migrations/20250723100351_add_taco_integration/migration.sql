-- AlterTable
ALTER TABLE "insumos" ADD COLUMN     "codigo_taco" INTEGER,
ADD COLUMN     "fonte_dados" TEXT NOT NULL DEFAULT 'manual';

-- CreateTable
CREATE TABLE "taco_alimentos" (
    "id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "humidity_percents" DOUBLE PRECISION,
    "energy_kcal" DOUBLE PRECISION,
    "energy_kj" DOUBLE PRECISION,
    "protein_g" DOUBLE PRECISION,
    "lipid_g" DOUBLE PRECISION,
    "cholesterol_mg" DOUBLE PRECISION,
    "carbohydrate_g" DOUBLE PRECISION,
    "fiber_g" DOUBLE PRECISION,
    "ashes_g" DOUBLE PRECISION,
    "calcium_mg" DOUBLE PRECISION,
    "magnesium_mg" DOUBLE PRECISION,
    "manganese_mg" DOUBLE PRECISION,
    "phosphorus_mg" DOUBLE PRECISION,
    "iron_mg" DOUBLE PRECISION,
    "sodium_mg" DOUBLE PRECISION,
    "potassium_mg" DOUBLE PRECISION,
    "copper_mg" DOUBLE PRECISION,
    "zinc_mg" DOUBLE PRECISION,
    "retinol_mcg" DOUBLE PRECISION,
    "thiamine_mg" DOUBLE PRECISION,
    "riboflavin_mg" DOUBLE PRECISION,
    "pyridoxine_mg" DOUBLE PRECISION,
    "niacin_mg" DOUBLE PRECISION,
    "vitaminC_mg" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taco_alimentos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "insumos" ADD CONSTRAINT "insumos_codigo_taco_fkey" FOREIGN KEY ("codigo_taco") REFERENCES "taco_alimentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
