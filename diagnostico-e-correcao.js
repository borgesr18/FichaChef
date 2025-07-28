#!/usr/bin/env node

/**
 * Script de Diagnóstico e Correção - FichaChef Modernizado
 * Este script identifica e corrige problemas comuns que impedem
 * as mudanças visuais de aparecerem no sistema.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 DIAGNÓSTICO E CORREÇÃO - FichaChef Modernizado\n');

// Função para verificar se um arquivo existe
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Função para ler conteúdo de arquivo
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Função para escrever arquivo
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`❌ Erro ao escrever arquivo ${filePath}:`, error.message);
    return false;
  }
}

// Função para executar comando
function runCommand(command, description) {
  try {
    console.log(`🔧 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} concluído\n`);
    return true;
  } catch (error) {
    console.error(`❌ Erro em ${description}:`, error.message);
    return false;
  }
}

// 1. Verificar estrutura de arquivos
console.log('📁 1. VERIFICANDO ESTRUTURA DE ARQUIVOS');
console.log('=====================================');

const requiredFiles = [
  'src/app/globals.css',
  'src/app/dashboard/page.tsx',
  'package.json',
  'next.config.ts'
];

let missingFiles = [];
requiredFiles.forEach(file => {
  if (fileExists(file)) {
    console.log(`✅ ${file} - OK`);
  } else {
    console.log(`❌ ${file} - AUSENTE`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log(`\n⚠️  Arquivos ausentes encontrados: ${missingFiles.join(', ')}`);
  console.log('Certifique-se de que extraiu o ZIP corretamente.\n');
}

// 2. Verificar e corrigir globals.css
console.log('🎨 2. VERIFICANDO E CORRIGINDO GLOBALS.CSS');
console.log('==========================================');

const globalsPath = 'src/app/globals.css';
const globalsContent = readFile(globalsPath);

if (globalsContent) {
  // Verificar se contém as classes modernizadas
  const hasModernClasses = globalsContent.includes('.card-modern') && 
                          globalsContent.includes('.btn-primary') &&
                          globalsContent.includes('--primary: #FF6B35');
  
  if (hasModernClasses) {
    console.log('✅ globals.css contém as classes modernizadas');
  } else {
    console.log('❌ globals.css não contém as classes modernizadas');
    console.log('🔧 Aplicando correção...');
    
    // Aplicar o CSS modernizado
    const modernCSS = `@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  /* Cores Primárias */
  --primary: #FF6B35;
  --primary-light: #FF8A65;
  --primary-dark: #E64A19;
  
  /* Cores Secundárias */
  --secondary: #2E7D32;
  --secondary-light: #4CAF50;
  --secondary-dark: #1B5E20;
  
  /* Cores Neutras */
  --background: #FAFBFC;
  --surface: #FFFFFF;
  --surface-elevated: #F8F9FA;
  --border: #E5E7EB;
  --text-primary: #1F2937;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  
  /* Cores de Status */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 25px rgba(0, 0, 0, 0.15);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--text-primary);
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', Consolas, monospace;
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

/* ===== SISTEMA DE DESIGN MODERNO ===== */

/* Componentes Base */
.card-modern {
  @apply bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 hover:scale-[1.01];
}

.card-stats {
  @apply bg-gradient-to-br p-6 rounded-2xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02];
}

.btn-primary {
  @apply bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md active:scale-95;
}

.btn-secondary {
  @apply bg-transparent hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-sm;
}

.btn-ghost {
  @apply bg-transparent hover:bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200;
}

.input-modern {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white;
}

.gradient-text {
  @apply bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent;
}

.gradient-primary {
  @apply bg-gradient-to-r from-orange-500 to-orange-600;
}

.gradient-secondary {
  @apply bg-gradient-to-r from-green-600 to-green-700;
}

/* Animações */
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse-soft {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
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

.hover-lift {
  @apply transition-transform duration-200 hover:-translate-y-1;
}

/* Mobile-first responsive utilities */
@media (max-width: 768px) {
  .mobile-stack {
    flex-direction: column !important;
  }
  
  .mobile-full-width {
    width: 100% !important;
  }
  
  .mobile-text-sm {
    font-size: 0.875rem !important;
  }
  
  .mobile-p-2 {
    padding: 0.5rem !important;
  }
  
  .mobile-gap-2 {
    gap: 0.5rem !important;
  }
  
  .mobile-grid-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
  }
}

/* Touch-friendly interactive elements */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Improved tap targets for mobile */
@media (hover: none) and (pointer: coarse) {
  button, .clickable {
    min-height: 44px;
    padding: 12px 16px;
  }
  
  input, select, textarea {
    min-height: 44px;
    padding: 12px 16px;
  }
  
  .sidebar-link {
    min-height: 48px;
    padding: 12px 16px;
  }
}

/* Enhanced mobile scrolling */
@media (max-width: 768px) {
  .mobile-scroll {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
  
  .mobile-no-scroll {
    overflow: hidden;
  }
}

/* PWA specific styles */
@media (display-mode: standalone) {
  .pwa-only {
    display: block;
  }
  
  .browser-only {
    display: none;
  }
}

@media not (display-mode: standalone) {
  .pwa-only {
    display: none;
  }
  
  .browser-only {
    display: block;
  }
}

@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}

.animate-shrink {
  animation: shrink linear forwards;
}

/* Mobile header spacing */
@media (max-width: 640px) {
  .mobile-header-spacing {
    margin-left: 3rem; /* Space for hamburger button */
  }
  
  .mobile-button-text {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
  }
  
  .mobile-title {
    font-size: 1.5rem;
    line-height: 2rem;
  }
}`;

    if (writeFile(globalsPath, modernCSS)) {
      console.log('✅ globals.css corrigido com sucesso');
    }
  }
} else {
  console.log('❌ Não foi possível ler globals.css');
}

// 3. Verificar next.config.ts
console.log('\n⚙️  3. VERIFICANDO NEXT.CONFIG.TS');
console.log('=================================');

const nextConfigPath = 'next.config.ts';
const nextConfigContent = readFile(nextConfigPath);

if (nextConfigContent) {
  console.log('✅ next.config.ts encontrado');
} else {
  console.log('❌ next.config.ts não encontrado');
}

// 4. Limpeza de cache
console.log('\n🧹 4. LIMPEZA DE CACHE');
console.log('=====================');

const cacheCommands = [
  { cmd: 'rm -rf .next', desc: 'Removendo cache do Next.js' },
  { cmd: 'rm -rf node_modules/.cache', desc: 'Removendo cache dos módulos' },
  { cmd: 'npm run build', desc: 'Reconstruindo aplicação' }
];

cacheCommands.forEach(({ cmd, desc }) => {
  runCommand(cmd, desc);
});

// 5. Verificar Tailwind CSS
console.log('\n🎨 5. VERIFICANDO TAILWIND CSS');
console.log('==============================');

const packageJsonContent = readFile('package.json');
if (packageJsonContent) {
  const packageJson = JSON.parse(packageJsonContent);
  const hasTailwind = packageJson.dependencies?.tailwindcss || packageJson.devDependencies?.tailwindcss;
  
  if (hasTailwind) {
    console.log('✅ Tailwind CSS encontrado no package.json');
  } else {
    console.log('❌ Tailwind CSS não encontrado');
    console.log('🔧 Instalando Tailwind CSS...');
    runCommand('npm install tailwindcss@latest', 'Instalando Tailwind CSS');
  }
}

// 6. Instruções finais
console.log('\n🎯 6. INSTRUÇÕES FINAIS');
console.log('=======================');

console.log(`
✅ DIAGNÓSTICO E CORREÇÃO CONCLUÍDOS!

📋 PRÓXIMOS PASSOS:

1. 🔄 Reinicie o servidor de desenvolvimento:
   npm run dev

2. 🌐 Abra o navegador em modo privado/incógnito:
   http://localhost:3000

3. 🧹 Se ainda não funcionar, limpe o cache do navegador:
   - Chrome: Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
   - Firefox: Ctrl+F5 (Windows) ou Cmd+Shift+R (Mac)
   - Safari: Cmd+Option+R

4. 📱 Teste em diferentes dispositivos:
   - Desktop
   - Mobile (modo responsivo do navegador)

5. 🔍 Verifique o console do navegador:
   - F12 > Console
   - Procure por erros em vermelho

⚠️  PROBLEMAS COMUNS:

- Cache do navegador não limpo
- Servidor não reiniciado após mudanças
- Tailwind CSS não compilado corretamente
- Arquivos não extraídos corretamente

🆘 SE AINDA NÃO FUNCIONAR:

1. Pare o servidor (Ctrl+C)
2. Execute: npm run clean (se disponível)
3. Execute: npm install
4. Execute: npm run build
5. Execute: npm run dev
6. Abra em modo incógnito

📞 SUPORTE:
Se o problema persistir, verifique:
- Console do navegador (F12)
- Terminal onde roda o npm run dev
- Arquivos foram extraídos corretamente
`);

console.log('🎉 Script de diagnóstico concluído!');
`;

