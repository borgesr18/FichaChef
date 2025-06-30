CREATE TABLE IF NOT EXISTS perfis_usuarios (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'cozinha', 'estoque', 'financeiro')) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE OR REPLACE FUNCTION has_role(role_check TEXT) RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM perfis_usuarios
    WHERE user_id = auth.uid()::text AND role = role_check
  );
$$;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM perfis_usuarios
    WHERE user_id = auth.uid()::text AND role = 'admin'
  );
$$;

ALTER TABLE perfis_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades_medida ENABLE ROW LEVEL SECURITY;
ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_tecnicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE producoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON perfis_usuarios;
CREATE POLICY "Users can read own profile" ON perfis_usuarios
FOR SELECT USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert own profile" ON perfis_usuarios;
CREATE POLICY "Users can insert own profile" ON perfis_usuarios
FOR INSERT WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own profile" ON perfis_usuarios;
CREATE POLICY "Users can update own profile" ON perfis_usuarios
FOR UPDATE USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can read own categorias_insumos" ON categorias_insumos;
CREATE POLICY "Users can read own categorias_insumos" ON categorias_insumos
FOR SELECT USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert own categorias_insumos" ON categorias_insumos;
CREATE POLICY "Users can insert own categorias_insumos" ON categorias_insumos
FOR INSERT WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own categorias_insumos" ON categorias_insumos;
CREATE POLICY "Users can update own categorias_insumos" ON categorias_insumos
FOR UPDATE USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own categorias_insumos" ON categorias_insumos;
CREATE POLICY "Users can delete own categorias_insumos" ON categorias_insumos
FOR DELETE USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can read own insumos" ON insumos;
CREATE POLICY "Users can read own insumos" ON insumos
FOR SELECT USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert own insumos" ON insumos;
CREATE POLICY "Users can insert own insumos" ON insumos
FOR INSERT WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own insumos" ON insumos;
CREATE POLICY "Users can update own insumos" ON insumos
FOR UPDATE USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own insumos" ON insumos;
CREATE POLICY "Users can delete own insumos" ON insumos
FOR DELETE USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can read own fichas_tecnicas" ON fichas_tecnicas;
CREATE POLICY "Users can read own fichas_tecnicas" ON fichas_tecnicas
FOR SELECT USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can insert own fichas_tecnicas" ON fichas_tecnicas;
CREATE POLICY "Users can insert own fichas_tecnicas" ON fichas_tecnicas
FOR INSERT WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own fichas_tecnicas" ON fichas_tecnicas;
CREATE POLICY "Users can update own fichas_tecnicas" ON fichas_tecnicas
FOR UPDATE USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own fichas_tecnicas" ON fichas_tecnicas;
CREATE POLICY "Users can delete own fichas_tecnicas" ON fichas_tecnicas
FOR DELETE USING (user_id = auth.uid()::text);
