# Guia de Deploy - FichaChef

## Configuração de Variáveis de Ambiente no Vercel

### Problema Comum: "Modo Desenvolvimento" em Produção

Se o sistema mostra "Modo Desenvolvimento" em produção, as variáveis de ambiente não estão configuradas corretamente no Vercel.

### Solução: Configurar Variáveis no Painel Vercel

1. Acesse o [painel do Vercel](https://vercel.com/dashboard)
2. Selecione o projeto FichaChef
3. Vá em **Settings** > **Environment Variables**
4. Adicione as seguintes variáveis:

#### Variáveis Obrigatórias:
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
DATABASE_URL=postgresql://usuario:senha@host:5432/database
DIRECT_URL=postgresql://usuario:senha@host:5432/database
NEXTAUTH_SECRET=seu-secret-super-seguro
NEXTAUTH_URL=https://ficha-chef.vercel.app
NODE_ENV=production
```

#### Importante:
- Marque todas as variáveis para **Production**, **Preview** e **Development**
- As variáveis `NEXT_PUBLIC_*` são expostas no browser e devem começar com `NEXT_PUBLIC_`
- Após adicionar as variáveis, faça um novo deploy para aplicar as mudanças

### Verificação

Após configurar as variáveis:
1. Faça um novo deploy ou force redeploy
2. Acesse https://ficha-chef.vercel.app/login
3. O aviso "Modo Desenvolvimento" deve desaparecer
4. O login deve funcionar normalmente

### Troubleshooting

Se ainda houver problemas:
1. Verifique se todas as variáveis estão definidas no Vercel
2. Confirme que as credenciais do Supabase estão corretas
3. Force um novo deploy após adicionar variáveis
4. Verifique o console do browser para erros específicos

## Como Obter as Credenciais do Supabase

### 1. Acesse o Painel do Supabase
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto FichaChef

### 2. Encontre as Credenciais
1. No painel do projeto, vá em **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL**: Esta é sua `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: Esta é sua `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role**: Esta é sua `SUPABASE_SERVICE_ROLE_KEY` (mantenha secreta!)

### 3. Configure no Vercel
1. Cole essas credenciais nas variáveis de ambiente do Vercel
2. Certifique-se de marcar todas as opções (Production, Preview, Development)
3. Faça um novo deploy

## Verificação Final

Para confirmar que tudo está funcionando:

1. **Teste o Console do Browser**:
   ```javascript
   // Abra o console do browser em https://ficha-chef.vercel.app/login
   console.log('Environment check:', {
     hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
     hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
   })
   ```

2. **Verifique a Interface**:
   - O aviso "Modo Desenvolvimento" deve desaparecer
   - Os campos de login devem estar habilitados
   - O login deve funcionar com credenciais válidas

3. **Teste o Login**:
   - Use as credenciais de usuário configuradas no Supabase
   - Após login bem-sucedido, deve redirecionar para o dashboard
   - O menu lateral deve mostrar as opções corretas para cada perfil

## Troubleshooting Deployment Pipeline

### Problema: Mudanças não aparecem em produção

Se você fez merge de PRs mas as mudanças não aparecem em https://ficha-chef.vercel.app:

1. **Verifique se o Vercel está configurado para auto-deploy**:
   - Acesse [Vercel Dashboard](https://vercel.com/dashboard)
   - Vá em Settings > Git
   - Certifique-se que "Production Branch" está definido como `main`
   - Verifique se "Auto-deploy" está habilitado

2. **Force um novo deployment**:
   - No painel do Vercel, vá em "Deployments"
   - Clique em "Redeploy" no último deployment
   - Ou faça um commit vazio: `git commit --allow-empty -m "Force redeploy" && git push`

3. **Verifique logs de build**:
   - No Vercel, clique no deployment que falhou
   - Verifique os logs de "Build" e "Function" para erros
   - Procure por erros relacionados a variáveis de ambiente

### Problema: Build failures

Se o build falha no Vercel:

1. **Teste localmente primeiro**:
   ```bash
   npm run build
   ```

2. **Verifique variáveis de ambiente**:
   - Todas as variáveis `NEXT_PUBLIC_*` devem estar definidas
   - `DATABASE_URL` deve estar configurado
   - `NEXTAUTH_SECRET` deve estar definido

3. **Logs comuns de erro**:
   - `Cannot read property of undefined`: Variável de ambiente faltando
   - `PrismaClientInitializationError`: DATABASE_URL incorreto
   - `Supabase client error`: Credenciais Supabase incorretas

### Verificação de Deployment

Para confirmar que o deployment funcionou:

1. **Verifique a versão do código**:
   - Abra https://ficha-chef.vercel.app/login
   - Verifique se a mensagem de erro mudou para a nova versão
   - Console do browser deve mostrar logs de diagnóstico

2. **Teste APIs**:
   - Abra https://ficha-chef.vercel.app/api/dashboard-stats
   - Deve retornar JSON ao invés de erro 500

3. **Verifique autenticação**:
   - Login deve funcionar sem mostrar "Modo Desenvolvimento"
   - Dashboard deve carregar sem erros 500

## Suporte

Se ainda houver problemas após seguir este guia:
1. Verifique os logs do Vercel para erros de deploy
2. Confirme que todas as variáveis estão definidas corretamente
3. Teste localmente primeiro para garantir que as credenciais funcionam
4. Entre em contato com o suporte se necessário
