#!/usr/bin/env node
/**
 * Script para ejecutar tests del frontend con diferentes configuraciones
 */
const { spawn } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const args = process.argv.slice(2);
const mode = args[0] || 'single';

console.log(`${colors.bright}${colors.cyan}╔═══════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}║     AcTitUBB - Frontend Test Runner              ║${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}╚═══════════════════════════════════════════════════╝${colors.reset}\n`);

let command, commandArgs;

switch (mode) {
  case 'watch':
    console.log(`${colors.yellow}Modo: Watch - Los tests se ejecutarán automáticamente al guardar${colors.reset}\n`);
    command = 'ng';
    commandArgs = ['test', '--watch=true', '--code-coverage=false'];
    break;
  
  case 'coverage':
    console.log(`${colors.yellow}Modo: Coverage - Generando reporte de cobertura${colors.reset}\n`);
    command = 'ng';
    commandArgs = ['test', '--watch=false', '--code-coverage=true', '--browsers=ChromeHeadless'];
    break;
  
  case 'ci':
    console.log(`${colors.yellow}Modo: CI - Ejecución para integración continua${colors.reset}\n`);
    command = 'ng';
    commandArgs = ['test', '--watch=false', '--code-coverage=true', '--browsers=ChromeHeadlessCI'];
    break;
  
  case 'single':
  default:
    console.log(`${colors.yellow}Modo: Single Run - Ejecución única de todos los tests${colors.reset}\n`);
    command = 'ng';
    commandArgs = ['test', '--watch=false', '--browsers=ChromeHeadless'];
    break;
}

const testProcess = spawn(command, commandArgs, {
  stdio: 'inherit',
  shell: true
});

testProcess.on('error', (error) => {
  console.error(`${colors.red}Error ejecutando tests:${colors.reset}`, error);
  process.exit(1);
});

testProcess.on('close', (code) => {
  if (code === 0) {
    console.log(`\n${colors.bright}${colors.green}✓ Tests completados exitosamente${colors.reset}`);
    if (mode === 'coverage') {
      console.log(`${colors.cyan}📊 Reporte de cobertura: ${colors.reset}frontend/coverage/index.html\n`);
    }
  } else {
    console.log(`\n${colors.bright}${colors.red}✗ Tests fallaron con código ${code}${colors.reset}\n`);
  }
  process.exit(code);
});
