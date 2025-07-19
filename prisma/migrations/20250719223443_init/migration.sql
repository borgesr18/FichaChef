-- CreateTable
CREATE TABLE "perfis_usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'editor',
    "nome" TEXT,
    "email" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "categorias_insumos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "categorias_receitas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "unidades_medida" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "simbolo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "insumos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "marca" TEXT,
    "fornecedor" TEXT,
    "categoria_id" TEXT NOT NULL,
    "unidade_compra_id" TEXT NOT NULL,
    "peso_liquido_gramas" REAL NOT NULL,
    "preco_unidade" REAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "insumos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_insumos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "insumos_unidade_compra_id_fkey" FOREIGN KEY ("unidade_compra_id") REFERENCES "unidades_medida" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fichas_tecnicas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "categoria_id" TEXT NOT NULL,
    "peso_final_gramas" REAL NOT NULL,
    "numero_porcoes" INTEGER NOT NULL,
    "tempo_preparo" INTEGER,
    "temperatura_forno" INTEGER,
    "modo_preparo" TEXT NOT NULL,
    "nivel_dificuldade" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "fichas_tecnicas_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_receitas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ingredientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ficha_tecnica_id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "quantidade_gramas" REAL NOT NULL,
    CONSTRAINT "ingredientes_ficha_tecnica_id_fkey" FOREIGN KEY ("ficha_tecnica_id") REFERENCES "fichas_tecnicas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ingredientes_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "producoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ficha_tecnica_id" TEXT NOT NULL,
    "data_producao" DATETIME NOT NULL,
    "data_validade" DATETIME NOT NULL,
    "quantidade_produzida" REAL NOT NULL,
    "lote" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "producoes_ficha_tecnica_id_fkey" FOREIGN KEY ("ficha_tecnica_id") REFERENCES "fichas_tecnicas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "movimentacoes_estoque" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "insumo_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" REAL NOT NULL,
    "motivo" TEXT NOT NULL,
    "lote" TEXT,
    "data_validade" DATETIME,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "movimentacoes_estoque_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "ficha_tecnica_id" TEXT NOT NULL,
    "preco_venda" REAL NOT NULL,
    "margem_lucro" REAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "produtos_ficha_tecnica_id_fkey" FOREIGN KEY ("ficha_tecnica_id") REFERENCES "fichas_tecnicas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "perfis_usuarios_user_id_key" ON "perfis_usuarios"("user_id");
