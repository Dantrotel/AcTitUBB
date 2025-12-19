// Archivo de configuración del entorno para producción
export const environment = {
  production: true,
  apiUrl: 'http://146.83.194.188:2242/api/v1',  // Usar URL relativa en producción
  wsUrl: window.location.origin
};
