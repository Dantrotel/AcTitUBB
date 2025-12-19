#!/usr/bin/env node
/**
 * Script para ejecutar todos los tests
 * Uso: node test/run-tests.js
 */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};





const testFiles = [
  'auth.test.js',
  'propuestas.test.js',
  'admin.test.js',
  'integration.test.js'
];

let totalPassed = 0;
let totalFailed = 0;
let currentTest = 0;

async function runTest(testFile) {
  return new Promise((resolve) => {
    currentTest++;
    
    
    const testPath = join(__dirname, testFile);
    // Escapar la ruta para Windows
    const escapedPath = `"${testPath}"`;
    const testProcess = spawn('node', ['--test', escapedPath], {
      stdio: 'pipe',
      shell: true,
      windowsVerbatimArguments: true
    });

    let output = '';
    let passed = 0;
    let failed = 0;

    testProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      // Contar tests pasados y fallados
      const passMatches = text.match(/✔/g);
      const failMatches = text.match(/✖/g);
      if (passMatches) passed += passMatches.length;
      if (failMatches) failed += failMatches.length;
      
      process.stdout.write(text);
    });

    testProcess.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stderr.write(text);
    });

    testProcess.on('close', (code) => {
      totalPassed += passed;
      totalFailed += failed;
      
      if (code === 0) {
        
      } else {
        
      }
      
      resolve({ code, passed, failed });
    });
  });
}

async function runAllTests() {
  const startTime = Date.now();
  
  
  
  for (const testFile of testFiles) {
    await runTest(testFile);
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  
  
  
  
  
  
  
  
  if (totalFailed === 0) {
    
    process.exit(0);
  } else {
    
    process.exit(1);
  }
}

runAllTests().catch((error) => {
  
  process.exit(1);
});
