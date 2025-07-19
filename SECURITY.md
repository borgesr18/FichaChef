# Política de Segurança

## Versões Suportadas

| Versão | Suporte de Segurança |
| ------- | ------------------ |
| 1.0.x   | ✅ |

## Reportando Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança, por favor:

1. **NÃO** abra uma issue pública
2. Envie um email para: security@fichachef.com
3. Inclua o máximo de detalhes possível
4. Aguarde nossa resposta em até 48 horas

## Medidas de Segurança Implementadas

### Autenticação e Autorização
- ✅ Supabase Auth com JWT
- ✅ Row Level Security (RLS)
- ✅ Isolamento de dados por usuário
- ✅ Verificação de permissões em todas as APIs

### Validação de Dados
- ✅ Validação com Zod em todas as entradas
- ✅ Sanitização de dados
- ✅ Prevenção de SQL Injection
- ✅ Validação de tipos TypeScript

### Headers de Segurança
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection
- ✅ Referrer-Policy

### Configurações de Produção
- ✅ HTTPS obrigatório
- ✅ Secrets seguros
- ✅ Logs de segurança
- ✅ Rate limiting (recomendado)

## Configuração Segura

### Variáveis de Ambiente
```env
# NUNCA commite credenciais reais
NEXTAUTH_SECRET="use-openssl-rand-base64-32"
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

### Checklist de Deploy
- [ ] Regenerar todos os secrets
- [ ] Configurar HTTPS
- [ ] Ativar rate limiting
- [ ] Configurar backup do banco
- [ ] Monitorar logs de segurança
- [ ] Testar autenticação
- [ ] Verificar headers de segurança

## Boas Práticas

### Para Desenvolvedores
1. Sempre validar entrada de dados
2. Usar prepared statements (Prisma faz isso)
3. Implementar rate limiting
4. Logs de segurança adequados
5. Testes de segurança regulares

### Para Usuários
1. Use senhas fortes
2. Não compartilhe credenciais
3. Faça logout ao sair
4. Reporte atividades suspeitas

## Atualizações de Segurança

Mantenha sempre atualizado:
- Dependencies do npm
- Versão do Next.js
- Prisma e Supabase
- Node.js

```bash
npm audit
npm update
```

## Contato

Para questões de segurança: security@fichachef.com

