# 🍳 FichaChef - Sistema de Gestão Gastronômica

## 🎯 **Visão Geral**

O FichaChef é um sistema completo de gestão gastronômica desenvolvido para restaurantes e cozinhas profissionais. Combina funcionalidade robusta com design moderno e interface intuitiva.

## ✨ **Características Principais**

### **🔧 Funcionalidades Core**
- ✅ **Cadastro de Produtos** - Gestão completa de ingredientes e insumos
- ✅ **Fichas Técnicas** - Criação e gestão de receitas profissionais
- ✅ **Gestão de Usuários** - Sistema de permissões (Chef, Gerente, Cozinheiro)
- ✅ **Dashboard Inteligente** - Métricas e análises em tempo real
- ✅ **Sistema de Autenticação** - Login seguro com Supabase
- ✅ **Interface Responsiva** - Funciona perfeitamente em mobile e desktop

### **🎨 Design Moderno**
- ✅ **Sistema de Design Próprio** - Paleta gastronômica profissional
- ✅ **Componentes Modernos** - Cards com gradientes e animações
- ✅ **Micro-interações** - Hover effects e transições suaves
- ✅ **Tipografia Inter** - Máxima legibilidade e profissionalismo
- ✅ **Ícones Temáticos** - Elementos visuais gastronômicos

### **⚡ Performance e Tecnologia**
- ✅ **Next.js 14** - Framework React moderno
- ✅ **TypeScript** - Tipagem estática para maior confiabilidade
- ✅ **Supabase** - Backend como serviço com PostgreSQL
- ✅ **Tailwind CSS** - Estilização utilitária
- ✅ **Sistema Híbrido** - Funciona com ou sem banco de dados

## 🚀 **Instalação e Configuração**

### **Pré-requisitos**
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase (opcional)

### **Instalação**
```bash
# 1. Clonar o repositório
git clone [url-do-repositorio]
cd FichaChef-SISTEMA-COMPLETO

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local

# 4. Executar em desenvolvimento
npm run dev

# 5. Acessar o sistema
# http://localhost:3000
```

### **Configuração do Supabase (Opcional)**
```bash
# No arquivo .env.local
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 🎨 **Sistema de Design**

### **Paleta de Cores**
- **Laranja Primário**: `#FF6B35` - Energia e criatividade
- **Azul Secundário**: `#4299E1` - Confiança e tecnologia
- **Verde Sucesso**: `#48BB78` - Frescor e ingredientes naturais
- **Cinza Profissional**: `#2D3748` - Elegância e sofisticação

### **Componentes Disponíveis**
- **ModernCard** - Cards com gradientes e animações
- **AnimatedButton** - Botões com micro-interações
- **GradientText** - Textos com gradientes temáticos
- **StatCard** - Cards de estatísticas para dashboard
- **ActionCard** - Cards de ações rápidas

## 📁 **Estrutura do Projeto**

```
src/
├── app/                    # App Router do Next.js
│   ├── dashboard/         # Páginas do dashboard
│   ├── login/            # Página de login
│   └── globals.css       # Estilos globais
├── components/
│   ├── modern/           # Componentes modernos
│   ├── layout/           # Layouts e estrutura
│   ├── providers/        # Context providers
│   └── ui/              # Componentes de UI
├── styles/
│   └── design-system.css # Sistema de design
├── lib/                  # Utilitários e configurações
└── hooks/               # Custom hooks
```

## 👥 **Sistema de Usuários**

### **Tipos de Usuário**
- **👨‍🍳 Chef** - Acesso completo ao sistema
- **👔 Gerente** - Gestão operacional
- **👨‍🍳 Cozinheiro** - Acesso às fichas técnicas

### **Credenciais de Teste**
- **Email**: `rba1807@gmail.com`
- **Senha**: `rb080859a`
- **Role**: Chef (acesso completo)

## 🔧 **Scripts Disponíveis**

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start

# Linting
npm run lint

# Verificação de tipos
npm run type-check
```

## 📱 **Responsividade**

O sistema é totalmente responsivo e funciona perfeitamente em:
- **Desktop** (1024px+)
- **Tablet** (768px - 1024px)
- **Mobile** (< 768px)

## 🛡️ **Segurança e Autenticação**

### **Características de Segurança**
- ✅ **Autenticação JWT** via Supabase
- ✅ **Row Level Security (RLS)** no banco de dados
- ✅ **Validação de tipos** com TypeScript
- ✅ **Sanitização de inputs**
- ✅ **Proteção de rotas** baseada em roles

### **Sistema Híbrido**
- ✅ **Funciona offline** com fallbacks inteligentes
- ✅ **Cache local** para performance
- ✅ **Circuit breaker** para evitar loops infinitos
- ✅ **Recuperação automática** de erros

## 📊 **Funcionalidades Detalhadas**

### **Dashboard**
- Estatísticas em tempo real
- Ações rápidas
- Fichas recentes
- Tendências de custo
- Métricas de usuários

### **Gestão de Produtos**
- Cadastro completo de ingredientes
- Controle de estoque
- Gestão de fornecedores
- Cálculo de custos

### **Fichas Técnicas**
- Criação de receitas profissionais
- Cálculo automático de custos
- Controle de rendimento
- Modo de preparo detalhado
- Impressão padronizada

### **Gestão de Usuários (Chef)**
- Criação de usuários
- Definição de roles
- Convites por email
- Redefinição de senhas
- Controle de acesso

## 🚀 **Deploy**

### **Vercel (Recomendado)**
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Configurar variáveis de ambiente no dashboard
```

### **Outras Plataformas**
- **Netlify** - Suporte completo
- **Railway** - Deploy automático
- **Heroku** - Com buildpack Node.js

## 🔄 **Atualizações e Manutenção**

### **Versionamento**
- **Semantic Versioning** (SemVer)
- **Changelog** detalhado
- **Migrations** automáticas

### **Monitoramento**
- **Error tracking** integrado
- **Performance monitoring**
- **User analytics**

## 🤝 **Contribuição**

### **Como Contribuir**
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

### **Padrões de Código**
- **ESLint** para linting
- **Prettier** para formatação
- **TypeScript** obrigatório
- **Conventional Commits**

## 📞 **Suporte**

### **Documentação**
- **README.md** - Visão geral
- **GUIA_IMPLEMENTACAO_SEGURA.md** - Implementação
- **Comentários no código** - Detalhes técnicos

### **Contato**
- **Issues** - Para bugs e features
- **Discussions** - Para dúvidas gerais
- **Email** - Para suporte direto

## 📄 **Licença**

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🎉 **Agradecimentos**

- **Equipe de desenvolvimento** - Pela dedicação
- **Comunidade** - Pelo feedback valioso
- **Usuários** - Pela confiança no sistema

---

**FichaChef - Transformando a gestão gastronômica com tecnologia e design moderno** 🍳✨

