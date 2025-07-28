#!/bin/bash

echo "🔧 CORREÇÃO RÁPIDA - FichaChef Modernizado"
echo "=========================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na pasta raiz do projeto FichaChef"
    echo "   Exemplo: cd FichaChef-main && bash corrigir-visual.sh"
    exit 1
fi

echo "✅ Diretório correto encontrado"
echo ""

# 1. Parar servidor se estiver rodando
echo "🛑 1. Parando servidor..."
pkill -f "next dev" 2>/dev/null || true
sleep 2
echo "✅ Servidor parado"
echo ""

# 2. Limpar cache
echo "🧹 2. Limpando cache..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc
echo "✅ Cache limpo"
echo ""

# 3. Reinstalar dependências
echo "📦 3. Reinstalando dependências..."
npm install --force
echo "✅ Dependências instaladas"
echo ""

# 4. Verificar e corrigir globals.css
echo "🎨 4. Verificando globals.css..."
if [ -f "src/app/globals.css" ]; then
    # Backup do arquivo original
    cp src/app/globals.css src/app/globals.css.backup
    
    # Aplicar CSS modernizado
    cat > src/app/globals.css << 'EOF'
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  --primary: #FF6B35;
  --primary-light: #FF8A65;
  --primary-dark: #E64A19;
  --secondary: #2E7D32;
  --secondary-light: #4CAF50;
  --secondary-dark: #1B5E20;
  --background: #FAFBFC;
  --surface: #FFFFFF;
  --surface-elevated: #F8F9FA;
  --border: #E5E7EB;
  --text-primary: #1F2937;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 25px rgba(0, 0, 0, 0.15);
}

body {
  background: var(--background);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, sans-serif;
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.card-modern {
  @apply bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 hover:scale-[1.01];
}

.btn-primary {
  @apply bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md active:scale-95;
}

.gradient-text {
  @apply bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent;
}

.hover-lift {
  @apply transition-transform duration-200 hover:-translate-y-1;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.animate-slide-in-up {
  animation: slideInUp 0.3s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

.animate-pulse-soft {
  animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
EOF
    echo "✅ globals.css atualizado"
else
    echo "❌ globals.css não encontrado"
fi
echo ""

# 5. Build da aplicação
echo "🔨 5. Fazendo build..."
npm run build
echo "✅ Build concluído"
echo ""

# 6. Instruções finais
echo "🎯 CORREÇÃO CONCLUÍDA!"
echo "====================="
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1. 🚀 Inicie o servidor:"
echo "   npm run dev"
echo ""
echo "2. 🌐 Abra o navegador em MODO INCÓGNITO:"
echo "   http://localhost:3000"
echo ""
echo "3. 🔄 Se ainda não funcionar:"
echo "   - Feche TODOS os navegadores"
echo "   - Abra novamente em modo incógnito"
echo "   - Pressione Ctrl+Shift+R (ou Cmd+Shift+R no Mac)"
echo ""
echo "4. 📱 Teste responsividade:"
echo "   - F12 > Toggle device toolbar"
echo "   - Teste em diferentes tamanhos"
echo ""
echo "⚠️  IMPORTANTE:"
echo "- SEMPRE use modo incógnito para testar"
echo "- Limpe cache do navegador se necessário"
echo "- Verifique console (F12) por erros"
echo ""
echo "🎉 Sistema modernizado pronto para uso!"

