#!/usr/bin/env node

/**
 * Script de health check para FichaChef
 * Verifica se todos os serviços estão funcionando corretamente
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

// Configurações
const CONFIG = {
  timeout: 10000,
  retries: 3,
  retryDelay: 2000,
  endpoints: {
    app: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    api: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    supabase: process.env.NEXT_PUBLIC_SUPABASE_URL,
  }
}

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

/**
 * Faz requisição HTTP com timeout e retry
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const isHttps = urlObj.protocol === 'https:'
    const client = isHttps ? https : http
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      timeout: CONFIG.timeout,
      headers: {
        'User-Agent': 'FichaChef-HealthCheck/1.0',
        ...options.headers
      }
    }

    const req = client.request(requestOptions, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        })
      })
    })

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    if (options.body) {
      req.write(options.body)
    }

    req.end()
  })
}

/**
 * Executa requisição com retry
 */
async function requestWithRetry(url, options = {}, retries = CONFIG.retries) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await makeRequest(url, options)
    } catch (error) {
      if (i === retries) {
        throw error
      }
      logWarning(`Tentativa ${i + 1} falhou para ${url}, tentando novamente...`)
      await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay))
    }
  }
}

/**
 * Verifica se arquivo existe
 */
function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath)
  } catch (error) {
    return false
  }
}

/**
 * Verifica arquivos essenciais
 */
function checkEssentialFiles() {
  logInfo('Verificando arquivos essenciais...')
  
  const essentialFiles = [
    'package.json',
    'next.config.ts',
    'tsconfig.json',
    'src/middleware.ts',
    'public/sw.js',
    'public/manifest.json',
    'prisma/schema.prisma'
  ]

  let allFilesExist = true

  essentialFiles.forEach(file => {
    if (checkFileExists(file)) {
      logSuccess(`${file} existe`)
    } else {
      logError(`${file} não encontrado`)
      allFilesExist = false
    }
  })

  return allFilesExist
}

/**
 * Verifica variáveis de ambiente
 */
function checkEnvironmentVariables() {
  logInfo('Verificando variáveis de ambiente...')
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'DATABASE_URL'
  ]

  const optionalEnvVars = [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_API_URL',
    'NODE_ENV'
  ]

  let allRequiredPresent = true

  // Verificar variáveis obrigatórias
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      logSuccess(`${envVar} configurada`)
    } else {
      logError(`${envVar} não configurada`)
      allRequiredPresent = false
    }
  })

  // Verificar variáveis opcionais
  optionalEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      logSuccess(`${envVar} configurada`)
    } else {
      logWarning(`${envVar} não configurada (opcional)`)
    }
  })

  return allRequiredPresent
}

/**
 * Verifica endpoint da aplicação
 */
async function checkAppEndpoint() {
  logInfo('Verificando endpoint da aplicação...')
  
  try {
    const response = await requestWithRetry(CONFIG.endpoints.app)
    
    if (response.statusCode === 200) {
      logSuccess(`Aplicação respondendo em ${CONFIG.endpoints.app}`)
      return true
    } else {
      logError(`Aplicação retornou status ${response.statusCode}`)
      return false
    }
  } catch (error) {
    logError(`Falha ao conectar com aplicação: ${error.message}`)
    return false
  }
}

/**
 * Verifica endpoint da API
 */
async function checkApiEndpoint() {
  logInfo('Verificando endpoint da API...')
  
  try {
    // Verificar endpoint de health da API
    const healthUrl = `${CONFIG.endpoints.api}/health`
    const response = await requestWithRetry(healthUrl)
    
    if (response.statusCode === 200 || response.statusCode === 404) {
      logSuccess(`API respondendo em ${CONFIG.endpoints.api}`)
      return true
    } else {
      logError(`API retornou status ${response.statusCode}`)
      return false
    }
  } catch (error) {
    logError(`Falha ao conectar com API: ${error.message}`)
    return false
  }
}

/**
 * Verifica conexão com Supabase
 */
async function checkSupabaseConnection() {
  logInfo('Verificando conexão com Supabase...')
  
  if (!CONFIG.endpoints.supabase) {
    logWarning('URL do Supabase não configurada')
    return false
  }

  try {
    const healthUrl = `${CONFIG.endpoints.supabase}/rest/v1/`
    const response = await requestWithRetry(healthUrl, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
      }
    })
    
    if (response.statusCode === 200 || response.statusCode === 401) {
      logSuccess('Supabase respondendo')
      return true
    } else {
      logError(`Supabase retornou status ${response.statusCode}`)
      return false
    }
  } catch (error) {
    logError(`Falha ao conectar com Supabase: ${error.message}`)
    return false
  }
}

/**
 * Verifica Service Worker
 */
function checkServiceWorker() {
  logInfo('Verificando Service Worker...')
  
  const swPath = 'public/sw.js'
  if (!checkFileExists(swPath)) {
    logError('Service Worker não encontrado')
    return false
  }

  try {
    const swContent = fs.readFileSync(swPath, 'utf8')
    
    // Verificar se contém as funções essenciais
    const requiredFunctions = [
      'addEventListener',
      'install',
      'activate',
      'fetch'
    ]

    const missingFunctions = requiredFunctions.filter(func => 
      !swContent.includes(func)
    )

    if (missingFunctions.length === 0) {
      logSuccess('Service Worker parece válido')
      return true
    } else {
      logError(`Service Worker está faltando: ${missingFunctions.join(', ')}`)
      return false
    }
  } catch (error) {
    logError(`Erro ao ler Service Worker: ${error.message}`)
    return false
  }
}

/**
 * Verifica dependências do Node.js
 */
function checkNodeDependencies() {
  logInfo('Verificando dependências do Node.js...')
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const nodeModulesExists = checkFileExists('node_modules')
    
    if (!nodeModulesExists) {
      logError('node_modules não encontrado. Execute: npm install')
      return false
    }

    // Verificar algumas dependências críticas
    const criticalDeps = ['next', 'react', '@supabase/supabase-js']
    let allDepsPresent = true

    criticalDeps.forEach(dep => {
      const depPath = path.join('node_modules', dep)
      if (checkFileExists(depPath)) {
        logSuccess(`${dep} instalado`)
      } else {
        logError(`${dep} não encontrado`)
        allDepsPresent = false
      }
    })

    return allDepsPresent
  } catch (error) {
    logError(`Erro ao verificar dependências: ${error.message}`)
    return false
  }
}

/**
 * Executa todos os checks
 */
async function runHealthCheck() {
  log('\n🏥 FichaChef Health Check\n', 'cyan')
  
  const checks = [
    { name: 'Arquivos Essenciais', fn: checkEssentialFiles },
    { name: 'Variáveis de Ambiente', fn: checkEnvironmentVariables },
    { name: 'Dependências Node.js', fn: checkNodeDependencies },
    { name: 'Service Worker', fn: checkServiceWorker },
    { name: 'Endpoint da Aplicação', fn: checkAppEndpoint },
    { name: 'Endpoint da API', fn: checkApiEndpoint },
    { name: 'Conexão Supabase', fn: checkSupabaseConnection }
  ]

  const results = []

  for (const check of checks) {
    log(`\n📋 ${check.name}`, 'magenta')
    try {
      const result = await check.fn()
      results.push({ name: check.name, success: result })
    } catch (error) {
      logError(`Erro durante verificação: ${error.message}`)
      results.push({ name: check.name, success: false })
    }
  }

  // Resumo
  log('\n📊 Resumo dos Resultados\n', 'cyan')
  
  const successful = results.filter(r => r.success).length
  const total = results.length

  results.forEach(result => {
    if (result.success) {
      logSuccess(result.name)
    } else {
      logError(result.name)
    }
  })

  log(`\n🎯 ${successful}/${total} verificações passaram`, 
    successful === total ? 'green' : 'yellow')

  if (successful === total) {
    log('\n🎉 Todos os sistemas estão funcionando!', 'green')
    process.exit(0)
  } else {
    log('\n⚠️  Alguns problemas foram encontrados. Verifique os logs acima.', 'yellow')
    process.exit(1)
  }
}

// Executar health check se chamado diretamente
if (require.main === module) {
  runHealthCheck().catch(error => {
    logError(`Erro fatal durante health check: ${error.message}`)
    process.exit(1)
  })
}

module.exports = {
  runHealthCheck,
  checkEssentialFiles,
  checkEnvironmentVariables,
  checkAppEndpoint,
  checkApiEndpoint,
  checkSupabaseConnection,
  checkServiceWorker,
  checkNodeDependencies
}

