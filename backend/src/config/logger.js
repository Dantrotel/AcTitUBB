// Sprint 1: Sistema de logging profesional con Winston
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Formatos personalizados
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Agregar metadata si existe
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    
    return msg;
  })
);

// Transporte para archivos rotativos (errores)
const errorFileRotateTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '14d',
  format: customFormat
});

// Transporte para archivos rotativos (todos los niveles)
const combinedFileRotateTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: customFormat
});

// Transporte para archivos rotativos (autenticación)
const authFileRotateTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/auth-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'info',
  maxSize: '20m',
  maxFiles: '30d',
  format: customFormat
});

// Configuración del logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: [
    errorFileRotateTransport,
    combinedFileRotateTransport,
    authFileRotateTransport
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/exceptions.log') 
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/rejections.log') 
    })
  ]
});

// En desarrollo, también loguear a consola con colores
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Helpers para logging estructurado
export const logAuth = (action, user, details = {}) => {
  logger.info(`AUTH: ${action}`, {
    category: 'auth',
    user: user?.rut || 'unknown',
    role: user?.rol_id,
    ...details
  });
};

export const logError = (error, context = {}) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context
  });
};

export const logQuery = (query, duration, rows) => {
  logger.debug('DB Query executed', {
    category: 'database',
    query: query.substring(0, 100),
    duration: `${duration}ms`,
    rows
  });
};

export const logSecurity = (event, severity, details = {}) => {
  logger.warn(`SECURITY: ${event}`, {
    category: 'security',
    severity,
    ...details
  });
};

// Exportar logger tanto como named export como default
export { logger };
export default logger;
