-- CreateTable
CREATE TABLE "perfis_usuarios" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'cozinheiro',
    "nome" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfis_usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_insumos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_receitas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_receitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades_medida" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "simbolo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unidades_medida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insumos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "marca" TEXT,
    "fornecedor" TEXT,
    "fornecedor_id" TEXT,
    "categoria_id" TEXT NOT NULL,
    "unidade_compra_id" TEXT NOT NULL,
    "peso_liquido_gramas" DOUBLE PRECISION NOT NULL,
    "preco_unidade" DOUBLE PRECISION NOT NULL,
    "calorias_por_100g" DOUBLE PRECISION,
    "proteinas_por_100g" DOUBLE PRECISION,
    "carboidratos_por_100g" DOUBLE PRECISION,
    "gorduras_por_100g" DOUBLE PRECISION,
    "fibras_por_100g" DOUBLE PRECISION,
    "sodio_por_100g" DOUBLE PRECISION,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fichas_tecnicas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria_id" TEXT NOT NULL,
    "peso_final_gramas" DOUBLE PRECISION NOT NULL,
    "numero_porcoes" INTEGER NOT NULL,
    "tempo_preparo" INTEGER,
    "temperatura_forno" INTEGER,
    "modo_preparo" TEXT NOT NULL,
    "nivel_dificuldade" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fichas_tecnicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredientes" (
    "id" TEXT NOT NULL,
    "ficha_tecnica_id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "quantidade_gramas" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ingredientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producoes" (
    "id" TEXT NOT NULL,
    "ficha_tecnica_id" TEXT NOT NULL,
    "data_producao" TIMESTAMP(3) NOT NULL,
    "data_validade" TIMESTAMP(3) NOT NULL,
    "quantidade_produzida" DOUBLE PRECISION NOT NULL,
    "lote" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes_estoque" (
    "id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT NOT NULL,
    "lote" TEXT,
    "data_validade" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco_venda" DOUBLE PRECISION NOT NULL,
    "margem_lucro" DOUBLE PRECISION NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produto_ficha_tecnica" (
    "id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "ficha_tecnica_id" TEXT NOT NULL,
    "quantidade_gramas" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "produto_ficha_tecnica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes_produto" (
    "id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT NOT NULL,
    "lote" TEXT,
    "data_validade" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producoes_produto" (
    "id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "data_producao" TIMESTAMP(3) NOT NULL,
    "data_validade" TIMESTAMP(3) NOT NULL,
    "quantidade_produzida" DOUBLE PRECISION NOT NULL,
    "lote" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producoes_produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecedores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "razao_social" TEXT,
    "cnpj" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "contato" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecedor_precos" (
    "id" TEXT NOT NULL,
    "fornecedor_id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "data_vigencia" TIMESTAMP(3) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fornecedor_precos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes_alerta" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "item_tipo" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "limite_estoque_baixo" DOUBLE PRECISION,
    "dias_antes_vencimento" INTEGER,
    "margem_custo_maxima" DOUBLE PRECISION,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_alerta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "item_tipo" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "item_nome" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL DEFAULT 'media',
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "data_limite" TIMESTAMP(3),
    "valor_atual" DOUBLE PRECISION,
    "valor_limite" DOUBLE PRECISION,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menus" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_itens" (
    "id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "observacoes" TEXT,

    CONSTRAINT "menu_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_periodos" (
    "id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_periodos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorio_templates" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "configuracao" JSONB NOT NULL,
    "padrao" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relatorio_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorio_agendamentos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "template_id" TEXT,
    "formato" TEXT NOT NULL,
    "frequencia" TEXT NOT NULL,
    "dias_semana" TEXT,
    "dia_mes" INTEGER,
    "horario" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "proxima_execucao" TIMESTAMP(3) NOT NULL,
    "ultima_execucao" TIMESTAMP(3),
    "email" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relatorio_agendamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorio_execucoes" (
    "id" TEXT NOT NULL,
    "agendamento_id" TEXT NOT NULL,
    "data_execucao" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "arquivo" TEXT,
    "erro" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relatorio_execucoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_acoes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "item_id" TEXT,
    "item_tipo" TEXT,
    "detalhes" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_acoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "perfis_usuarios_user_id_key" ON "perfis_usuarios"("user_id");

-- AddForeignKey
ALTER TABLE "insumos" ADD CONSTRAINT "insumos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_insumos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insumos" ADD CONSTRAINT "insumos_unidade_compra_id_fkey" FOREIGN KEY ("unidade_compra_id") REFERENCES "unidades_medida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insumos" ADD CONSTRAINT "insumos_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichas_tecnicas" ADD CONSTRAINT "fichas_tecnicas_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_receitas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredientes" ADD CONSTRAINT "ingredientes_ficha_tecnica_id_fkey" FOREIGN KEY ("ficha_tecnica_id") REFERENCES "fichas_tecnicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredientes" ADD CONSTRAINT "ingredientes_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producoes" ADD CONSTRAINT "producoes_ficha_tecnica_id_fkey" FOREIGN KEY ("ficha_tecnica_id") REFERENCES "fichas_tecnicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto_ficha_tecnica" ADD CONSTRAINT "produto_ficha_tecnica_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto_ficha_tecnica" ADD CONSTRAINT "produto_ficha_tecnica_ficha_tecnica_id_fkey" FOREIGN KEY ("ficha_tecnica_id") REFERENCES "fichas_tecnicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_produto" ADD CONSTRAINT "movimentacoes_produto_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producoes_produto" ADD CONSTRAINT "producoes_produto_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedor_precos" ADD CONSTRAINT "fornecedor_precos_fornecedor_id_fkey" FOREIGN KEY ("fornecedor_id") REFERENCES "fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedor_precos" ADD CONSTRAINT "fornecedor_precos_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_itens" ADD CONSTRAINT "menu_itens_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_itens" ADD CONSTRAINT "menu_itens_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_periodos" ADD CONSTRAINT "menu_periodos_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorio_agendamentos" ADD CONSTRAINT "relatorio_agendamentos_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "relatorio_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorio_execucoes" ADD CONSTRAINT "relatorio_execucoes_agendamento_id_fkey" FOREIGN KEY ("agendamento_id") REFERENCES "relatorio_agendamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
