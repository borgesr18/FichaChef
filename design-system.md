# Sistema de Design Moderno - FichaChef

## Paleta de Cores

### Cores Primárias
- **Primary**: `#FF6B35` (Laranja vibrante - representa energia e apetite)
- **Primary Light**: `#FF8A65`
- **Primary Dark**: `#E64A19`

### Cores Secundárias
- **Secondary**: `#2E7D32` (Verde - representa frescor e natureza)
- **Secondary Light**: `#4CAF50`
- **Secondary Dark**: `#1B5E20`

### Cores Neutras
- **Background**: `#FAFBFC` (Branco quente)
- **Surface**: `#FFFFFF`
- **Surface Elevated**: `#F8F9FA`
- **Border**: `#E5E7EB`
- **Text Primary**: `#1F2937`
- **Text Secondary**: `#6B7280`
- **Text Muted**: `#9CA3AF`

### Cores de Status
- **Success**: `#10B981` (Verde esmeralda)
- **Warning**: `#F59E0B` (Âmbar)
- **Error**: `#EF4444` (Vermelho)
- **Info**: `#3B82F6` (Azul)

## Tipografia

### Font Stack
- **Primary**: Inter, system-ui, sans-serif
- **Monospace**: 'JetBrains Mono', Consolas, monospace

### Escala Tipográfica
- **Display**: 3.5rem (56px) - Títulos principais
- **H1**: 2.5rem (40px) - Cabeçalhos de página
- **H2**: 2rem (32px) - Seções principais
- **H3**: 1.5rem (24px) - Subsections
- **H4**: 1.25rem (20px) - Componentes
- **Body Large**: 1.125rem (18px) - Texto destacado
- **Body**: 1rem (16px) - Texto padrão
- **Body Small**: 0.875rem (14px) - Texto secundário
- **Caption**: 0.75rem (12px) - Legendas

## Espaçamento

### Sistema de Grid
- **Container**: max-width: 1280px
- **Gutter**: 24px
- **Columns**: 12 colunas

### Escala de Espaçamento
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px
- **3xl**: 64px

## Componentes

### Cards
- **Border Radius**: 12px
- **Shadow**: 0 1px 3px rgba(0, 0, 0, 0.1)
- **Shadow Hover**: 0 4px 12px rgba(0, 0, 0, 0.15)
- **Padding**: 24px

### Botões
- **Primary**: Background laranja, texto branco
- **Secondary**: Background transparente, borda, texto colorido
- **Ghost**: Background transparente, texto colorido
- **Border Radius**: 8px
- **Height**: 44px (touch-friendly)

### Inputs
- **Border Radius**: 8px
- **Border**: 1px solid #E5E7EB
- **Focus**: Border azul + shadow
- **Height**: 44px
- **Padding**: 12px 16px

### Sidebar
- **Width**: 280px
- **Background**: Gradiente sutil
- **Border**: Sem borda, shadow sutil
- **Item Height**: 48px

## Princípios de Design

### 1. Hierarquia Visual Clara
- Uso de tamanhos, cores e espaçamento para criar hierarquia
- Títulos destacados com gradientes sutis
- Informações importantes em destaque

### 2. Consistência
- Componentes reutilizáveis
- Padrões visuais consistentes
- Comportamentos previsíveis

### 3. Acessibilidade
- Contraste adequado (WCAG AA)
- Tamanhos de toque adequados (44px mínimo)
- Foco visível em elementos interativos

### 4. Responsividade
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px
- Componentes adaptáveis

### 5. Performance
- Animações suaves (60fps)
- Transições de 200-300ms
- Micro-interações significativas

## Animações e Transições

### Durações
- **Fast**: 150ms - Hover states
- **Normal**: 250ms - Transições padrão
- **Slow**: 350ms - Animações complexas

### Easing
- **Ease Out**: Para elementos que aparecem
- **Ease In**: Para elementos que desaparecem
- **Ease In Out**: Para transformações

### Micro-interações
- Hover states em botões e cards
- Loading states com skeletons
- Feedback visual em ações
- Transições suaves entre páginas

## Layout Moderno

### Dashboard
- Grid responsivo com cards
- Sidebar fixa com navegação
- Header com breadcrumbs e ações
- Área de conteúdo com padding adequado

### Cards de Estatísticas
- Gradientes sutis
- Ícones coloridos
- Animações no hover
- Informações hierarquizadas

### Formulários
- Campos agrupados logicamente
- Labels flutuantes
- Validação em tempo real
- Estados de loading

### Tabelas
- Header fixo
- Zebra striping sutil
- Ações inline
- Paginação moderna

## Implementação

### Tailwind CSS Classes Customizadas
```css
.card-modern {
  @apply bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200;
}

.btn-primary {
  @apply bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200;
}

.gradient-text {
  @apply bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent;
}
```

### Componentes React
- Componentes atômicos reutilizáveis
- Props tipadas com TypeScript
- Estados de loading e erro
- Acessibilidade integrada

## Inspirações Aplicadas

### Dashboard Moderno
- Cards com gradientes sutis
- Espaçamento generoso
- Tipografia hierárquica
- Cores vibrantes mas profissionais

### Sistema de Gestão Gastronômica
- Cores que remetem à alimentação
- Interface limpa e funcional
- Foco na usabilidade
- Informações organizadas

### Tendências 2024
- Bordas arredondadas
- Shadows sutis
- Micro-interações
- Design system consistente

