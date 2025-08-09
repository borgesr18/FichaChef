# FichaChef - Sistema de Gestão Gastronômica

> **Versão 2.0** - Sistema robusto com correções de CSP, autenticação e Service Worker

## 🚀 Sobre o Projeto

FichaChef é um sistema completo de gestão gastronômica desenvolvido para restaurantes e cozinhas industriais. O sistema oferece controle de insumos, criação de fichas técnicas, gestão de produção e análise de custos.

## ✨ Principais Funcionalidades

- 📋 **Cadastro de Insumos** - Gestão completa de produtos e ingredientes
- 📝 **Fichas Técnicas** - Criação e gestão de receitas com cálculo automático de custos
- 🏭 **Controle de Produção** - Planejamento e acompanhamento da produção
- 📊 **Dashboard Analytics** - Relatórios e análises de performance
- 👥 **Gestão de Usuários** - Controle de acesso e permissões
- 📱 **PWA** - Funciona offline com Service Worker

## 🔧 Correções Implementadas (v2.0)

### ✅ Content Security Policy (CSP)
- Configuração dinâmica baseada no ambiente
- Suporte completo ao Vercel Live e ferramentas de desenvolvimento
- Headers de segurança aprimorados

### ✅ Sistema de Autenticação
- Middleware robusto com verificação de tokens Supabase
- Rate limiting para segurança
- Gestão inteligente de sessões

### ✅ Service Worker
- Cache inteligente com TTL configurável
- Tratamento robusto de erros de rede
- Suporte offline melhorado

### ✅ Sistema de Logging
- Logs estruturados com níveis configuráveis
- API centralizada para coleta de logs
- Integração com serviços de monitoramento

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Autenticação**: Supabase Auth
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **PWA**: Service Worker customizado
- **Testes**: Jest, Playwright
- **Linting**: ESLint, Prettier

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL (ou Supabase)

## 🚀 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <repository-url>
cd FichaChef-main
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database
DATABASE_URL=your_database_url

# App URLs (opcional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Environment
NODE_ENV=development
```

### 4. Configure o banco de dados
```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# (Opcional) Popular banco com dados de exemplo
npm run db:seed
```

### 5. Execute o health check
```bash
npm run health-check
```

### 6. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📝 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run health-check # Verifica saúde do sistema
```

### Qualidade de Código
```bash
npm run lint         # Executa ESLint
npm run lint:fix     # Corrige problemas do ESLint
npm run format       # Formata código com Prettier
npm run type-check   # Verifica tipos TypeScript
```

### Testes
```bash
npm test             # Executa testes unitários
npm run test:watch   # Executa testes em modo watch
npm run test:coverage # Executa testes com cobertura
npm run test:e2e     # Executa testes E2E
```

### Banco de Dados
```bash
npm run db:generate  # Gera cliente Prisma
npm run db:push      # Aplica mudanças no schema
npm run db:migrate   # Executa migrações
npm run db:studio    # Abre Prisma Studio
npm run db:seed      # Popula banco com dados
```

### Análise e Debug
```bash
npm run analyze      # Analisa bundle webpack
npm run build:debug  # Build com debug habilitado
npm run clean        # Limpa arquivos de build
```

## 🔒 Segurança

### Content Security Policy
O sistema implementa CSP dinâmico que:
- Permite recursos necessários em desenvolvimento
- Restringe acesso em produção
- Suporta Vercel Live e ferramentas de desenvolvimento

### Autenticação
- Tokens JWT via Supabase
- Rate limiting para prevenir ataques
- Middleware de verificação em todas as rotas protegidas
- Gestão automática de sessões

### Logging e Monitoramento
- Logs estruturados com sanitização de dados sensíveis
- API centralizada para coleta de logs
- Integração com serviços de monitoramento externos

## 📱 PWA (Progressive Web App)

O FichaChef funciona como PWA com:
- Service Worker para cache inteligente
- Funcionalidade offline
- Instalação no dispositivo
- Notificações push (futuro)

## 🧪 Testes

### Testes Unitários
```bash
npm test
```

### Testes E2E
```bash
npm run test:e2e
```

### Cobertura de Testes
```bash
npm run test:coverage
```

## 📊 Monitoramento

### Health Check
Execute regularmente para verificar a saúde do sistema:
```bash
npm run health-check
```

### Logs
Os logs são coletados automaticamente e podem ser visualizados:
- Console do navegador (desenvolvimento)
- API `/api/logs` (produção)
- Serviços de monitoramento externos

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Docker
```bash
# Build da imagem
docker build -t fichachef .

# Executar container
docker run -p 3000:3000 fichachef
```

### Manual
```bash
# Build para produção
npm run build

# Iniciar servidor
npm start
```

## 🔧 Configuração Avançada

### Webpack
Configurações personalizadas em `next.config.ts`:
- Otimizações para produção
- Análise de bundle
- Aliases para imports

### ESLint
Regras configuradas em `.eslintrc.json`:
- Padrões Next.js
- TypeScript strict
- Import ordering

### Prettier
Formatação configurada em `.prettierrc.json`:
- Padrões consistentes
- Integração com ESLint

## 📚 Estrutura do Projeto

```
FichaChef-main/
├── src/
│   ├── app/                 # App Router (Next.js 13+)
│   │   ├── api/            # API Routes
│   │   ├── dashboard/      # Dashboard pages
│   │   └── login/          # Auth pages
│   ├── components/         # React components
│   ├── hooks/             # Custom hooks
│   └── lib/               # Utilities and configs
├── public/                # Static assets
├── prisma/               # Database schema
├── scripts/              # Build and utility scripts
└── tests/                # Test files
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

### Problemas Comuns

#### Erro de CSP
Se encontrar erros de Content Security Policy:
1. Verifique se está usando a versão mais recente
2. Execute `npm run health-check`
3. Verifique as configurações em `next.config.ts`

#### Erro de Autenticação
Se APIs retornarem 401:
1. Verifique as variáveis de ambiente do Supabase
2. Confirme se o middleware está funcionando
3. Execute `npm run health-check`

#### Service Worker
Se o Service Worker não funcionar:
1. Limpe o cache do navegador
2. Verifique se `public/sw.js` existe
3. Abra DevTools > Application > Service Workers

### Logs e Debug
- Use `npm run health-check` para diagnóstico
- Verifique logs no console do navegador
- API de logs disponível em `/api/logs`

### Contato
- Issues: Use o sistema de issues do GitHub
- Documentação: Consulte este README e o CHANGELOG.md

---

**Desenvolvido com ❤️ para a comunidade gastronômica**

## Ícones e Manifest

- Os ícones ficam em `public/icons/`.
- Use `/icons/icon.png` para favicons, Apple touch icon e atalhos do PWA.
- O manifesto (`public/manifest.json`) não referencia mais SVG inexistente; se desejar usar SVG, mantenha também um `public/icons/icon.svg` válido.

