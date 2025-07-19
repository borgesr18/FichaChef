# FichaChef - Sistema de Gestão Gastronômica

Sistema completo para gestão de fichas técnicas, controle de estoque e cálculo de custos para cozinhas profissionais.

## 🚀 Funcionalidades

### Core Features
- ✅ **Cadastro de Insumos**: Gestão completa de ingredientes com preços, fornecedores e unidades
- ✅ **Fichas Técnicas**: Criação de receitas com cálculo automático de custos
- ✅ **Controle de Estoque**: Movimentações de entrada e saída
- ✅ **Gestão de Produção**: Registro e controle de produções
- ✅ **Cálculo de Preços**: Análise de custos e margem de lucro
- ✅ **Dashboard Dinâmico**: Visão geral em tempo real
- ✅ **Sistema de Categorias**: Organização de insumos e receitas
- ✅ **Relatórios**: Exportação de dados e análises

### Características Técnicas
- 🔒 **Segurança**: Autenticação robusta e isolamento de dados por usuário
- 📱 **Responsivo**: Interface adaptada para desktop, tablet e mobile
- ⚡ **Performance**: Otimizado para uso em ambientes profissionais
- 🎨 **UX/UI**: Interface intuitiva e profissional
- 🔄 **Real-time**: Atualizações dinâmicas de dados

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: Supabase Auth
- **Estilização**: Tailwind CSS
- **Validação**: Zod
- **Ícones**: Lucide React
- **Deploy**: Vercel

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase (para banco e autenticação)

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/fichachef.git
cd fichachef
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@host:5432/database"
DIRECT_URL="postgresql://usuario:senha@host:5432/database"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anonima"

# NextAuth
NEXTAUTH_SECRET="seu-secret-super-seguro"
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

### 4. Configure o banco de dados
```bash
# Gerar o cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# (Opcional) Executar RLS no Supabase
psql -h seu-host -U usuario -d database -f rls_config.sql
```

### 5. Execute o projeto
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Executa em modo desenvolvimento
npm run build        # Build para produção
npm run start        # Executa build de produção
npm run lint         # Executa linting
npm run type-check   # Verifica tipos TypeScript
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── api/               # API Routes
│   │   ├── insumos/       # CRUD de insumos
│   │   ├── fichas-tecnicas/ # CRUD de fichas técnicas
│   │   └── ...            # Outras APIs
│   ├── dashboard/         # Páginas do dashboard
│   ├── login/             # Página de login
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── layout/           # Componentes de layout
│   └── ui/               # Componentes de UI
├── lib/                  # Utilitários e configurações
│   ├── prisma.ts         # Cliente Prisma
│   ├── supabase.ts       # Cliente Supabase
│   ├── validations.ts    # Schemas Zod
│   └── auth.ts           # Utilitários de autenticação
└── styles/               # Estilos globais
```

## 🔐 Segurança

### Medidas Implementadas
- ✅ Headers de segurança (CSP, X-Frame-Options, etc.)
- ✅ Validação robusta com Zod
- ✅ Autenticação via Supabase
- ✅ Row Level Security (RLS) no banco
- ✅ Sanitização de dados
- ✅ Rate limiting (recomendado para produção)

### Configuração de Produção
1. **Regenere todas as credenciais**
2. **Configure HTTPS**
3. **Ative rate limiting**
4. **Configure backup do banco**
5. **Monitore logs de segurança**

## 📱 Responsividade

O sistema é totalmente responsivo com breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### Características Mobile
- Menu lateral colapsável
- Cards adaptáveis
- Touch-friendly
- Performance otimizada

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras Plataformas
- **Netlify**: Suporte completo
- **Railway**: Ideal para full-stack
- **DigitalOcean**: App Platform

## 🧪 Testes

```bash
# Executar testes (quando implementados)
npm run test

# Testes E2E (quando implementados)  
npm run test:e2e
```

## 📊 Monitoramento

### Métricas Recomendadas
- Performance (Core Web Vitals)
- Erros de aplicação
- Uso de recursos
- Tempo de resposta das APIs

### Ferramentas Sugeridas
- Vercel Analytics
- Sentry (erros)
- LogRocket (sessões)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Documentação**: [Wiki do projeto](https://github.com/seu-usuario/fichachef/wiki)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/fichachef/issues)
- **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/fichachef/discussions)

## 🔄 Changelog

### v1.0.0 (Atual)
- ✅ Sistema base implementado
- ✅ Autenticação e segurança
- ✅ CRUD completo de insumos
- ✅ Dashboard responsivo
- ✅ Validação robusta
- ✅ Interface mobile-friendly

### Próximas Versões
- 🔄 Fichas técnicas completas
- 🔄 Sistema de relatórios
- 🔄 Exportação de dados
- 🔄 Notificações
- 🔄 PWA features

---

**Desenvolvido com ❤️ para cozinhas profissionais**
