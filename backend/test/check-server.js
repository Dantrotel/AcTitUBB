#!/usr/bin/env node
/**
 * Verifica que el servidor esté corriendo antes de ejecutar tests
 */
import { testConfig } from './setup.test.js';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};



try {
  const response = await fetch(`${testConfig.apiUrl.replace('/api/v1', '')}/health`, {
    method: 'GET'
  }).catch(() => null);

  if (response && response.ok) {
    
    process.exit(0);
  } else {
    
    
    process.exit(1);
  }
} catch (error) {
  
  
  process.exit(1);
}
