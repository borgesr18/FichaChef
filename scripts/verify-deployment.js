#!/usr/bin/env node

const https = require('https');

const PRODUCTION_URL = 'https://ficha-chef.vercel.app';

async function checkEndpoint(path, expectedStatus = 200) {
  return new Promise((resolve) => {
    const url = `${PRODUCTION_URL}${path}`;
    console.log(`🔍 Checking ${url}...`);
    
    https.get(url, (res) => {
      const success = res.statusCode === expectedStatus;
      console.log(`${success ? '✅' : '❌'} ${path}: ${res.statusCode}`);
      resolve(success);
    }).on('error', (err) => {
      console.log(`❌ ${path}: Error - ${err.message}`);
      resolve(false);
    });
  });
}

async function verifyDeployment() {
  console.log('🚀 Verificando deployment de produção...\n');
  
  const checks = [
    { path: '/login', status: 200 },
    { path: '/api/dashboard-stats', status: 200 },
    { path: '/api/insumos', status: 401 },
    { path: '/api/producao', status: 401 },
  ];
  
  let passed = 0;
  for (const check of checks) {
    const success = await checkEndpoint(check.path, check.status);
    if (success) passed++;
  }
  
  console.log(`\n📊 Resultado: ${passed}/${checks.length} checks passaram`);
  
  if (passed === checks.length) {
    console.log('✅ Deployment verificado com sucesso!');
  } else {
    console.log('❌ Deployment com problemas. Verifique as variáveis de ambiente no Vercel.');
  }
}

verifyDeployment();
