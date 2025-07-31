import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: [
      // Excluir dependencias problemáticas del optimizador
      'jwt-decode',
      'file-saver'
    ]
  },
  build: {
    rollupOptions: {
      external: [
        // Marcar como externas si es necesario
      ]
    }
  }
}); 