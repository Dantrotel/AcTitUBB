import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import router  from './routes/login.route.js';
import {initializeDatabase}  from './db/connectionDB.js';
import routerRole from './routes/role.route.js';
import routerProject from './routes/project.route.js';
import routerProp from './routes/propuesta.routes.js';
import downloadRouter from './routes/download.route.js';
import adminRouter from './routes/admin.route.js';
import calendarioRouter from './routes/calendario.route.js';
import fechasImportantesRouter from './routes/fechas-importantes.route.js';
import asignacionesProfesoresRouter from './routes/asignaciones-profesores.route.js';
import calendarioMatchingRouter from './routes/calendario-matching.route.js';
import sistemaReservasRouter from './routes/sistema-reservas.route.js';
import documentoRouter from './routes/documento.routes.js';
import comisionRouter from './routes/comision.route.js';
import extensionRouter from './routes/extension.route.js';
import reunionesRouter from './routes/reuniones.route.js';
import fechasLimiteRouter from './routes/fechas-limite.route.js';
import periodoPropuestasRouter from './routes/periodo-propuestas.route.js';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Sprint 1, 2, 3: Importar nuevos módulos
import logger, { logAuth, logError, logSecurity } from './config/logger.js';
import { initializeBlacklist } from './middlewares/blacklist.js';
import { initializeSocketIO } from './config/socket.js';
import cache from './config/cache.js';

const app = express();
const httpServer = createServer(app);

// Validar JWT Secret al inicio
if (!process.env.JWT_SECRET) {
    logger.error('JWT_SECRET no está definido en las variables de entorno');
    logger.error('Agrega JWT_SECRET=tu_clave_secreta_muy_segura a tu archivo .env');
    process.exit(1);
}

// Configuración segura de CORS usando variables de entorno
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
  : [
      'http://localhost:4200', 
      'http://localhost:3000', 
      'http://localhost:80',
      'http://127.0.0.1:4200'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logSecurity('CORS blocked', 'medium', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200 // Para compatibilidad con browsers legacy
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({extended: true}));

// Rate Limiting - Protección contra ataques de fuerza bruta
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // máximo 1000 requests por IP cada 15 minutos (aumentado para desarrollo)
    message: {
        error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos.',
        retryAfter: '15 minutos'
    },
    standardHeaders: true, // Devuelve rate limit info en headers `RateLimit-*`
    legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
});

// Rate limiting específico para login (más restrictivo)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos de login por IP cada 15 minutos
    message: {
        error: 'Demasiados intentos de login fallidos. Intenta de nuevo en 15 minutos.',
        retryAfter: '15 minutos'
    },
    skipSuccessfulRequests: true, // No contar requests exitosos
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting para registro (moderado)
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // máximo 3 registros por IP cada hora
    message: {
        error: 'Demasiados intentos de registro. Intenta de nuevo en 1 hora.',
        retryAfter: '1 hora'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Aplicar rate limiting general a todas las rutas
app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'AcTitUBB Backend'
    });
});

// Aplicar rate limiting específico a rutas de autenticación
app.use('/api/v1/users/login', loginLimiter);
app.use('/api/v1/users/register', registerLimiter);

app.use('/api/v1/users', router);
app.use('/api/v1/roles', routerRole);
app.use('/api/v1/projects', routerProject);
app.use('/api/v1/propuestas', routerProp);
app.use('/api/v1/', downloadRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/calendario', calendarioRouter);
app.use('/api/v1/fechas-importantes', fechasImportantesRouter);
app.use('/api/v1/asignaciones-profesores', asignacionesProfesoresRouter);
app.use('/api/v1/calendario-matching', calendarioMatchingRouter);
app.use('/api/v1/sistema-reservas', sistemaReservasRouter);
app.use('/api/v1/documentos', documentoRouter);
app.use('/api/v1/comision', comisionRouter);
app.use('/api/v1/extensiones', extensionRouter);
app.use('/api/v1/reuniones', reunionesRouter);
app.use('/api/v1/fechas-limite', fechasLimiteRouter);
app.use('/api/v1/periodo-propuestas', periodoPropuestasRouter);




// Sprint 3: Endpoint de estadísticas de caché (solo para admins)
app.get('/api/v1/admin/cache-stats', (req, res) => {
    const stats = cache.getStats();
    res.json({ stats });
});

// Sprint 3: Endpoint para limpiar caché (solo para admins)
app.post('/api/v1/admin/cache-flush', (req, res) => {
    cache.flushAll();
    logger.info('Todos los caches flushed por admin', { admin: req.rut });
    res.json({ message: 'Todos los caches limpiados' });
});

app.post('/api/v1/admin/cache-flush/:categoria', (req, res) => {
    const { categoria } = req.params;
    cache.flush(categoria);
    logger.info('Cache flushed por admin', { categoria, admin: req.rut });
    res.json({ message: `Cache ${categoria} limpiado` });
});

const PORT = process.env.PORT || 3000;  

// Sprint 1, 2, 3: Inicializar sistemas
const initializeSystems = async () => {
    try {
        logger.info('🚀 Iniciando servidor AcTitUBB...');
        
        // 1. Inicializar base de datos
        await initializeDatabase();
        logger.info('✅ Base de datos inicializada');
        
        // 2. Sprint 1: Inicializar blacklist persistente
        await initializeBlacklist();
        logger.info('✅ Sistema de blacklist inicializado');
        
        // 3. Sprint 3: Inicializar WebSockets
        logger.info('🔧 Inicializando Socket.IO...');
        const socketIO = initializeSocketIO(httpServer, allowedOrigins);
        logger.info('✅ WebSocket server inicializado');
        
        // 4. Iniciar servidor HTTP
        logger.info(`🔧 Iniciando servidor HTTP en puerto ${PORT}...`);
        await new Promise((resolve, reject) => {
            httpServer.listen(PORT, (error) => {
                if (error) {
                    logger.error('Error al iniciar servidor HTTP', { error: error.message });
                    reject(error);
                } else {
                    logger.info(`✅ Servidor corriendo en puerto ${PORT}`);
                    logger.info(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
                    logger.info(`🌐 CORS habilitado para: ${allowedOrigins.join(', ')}`);
                    resolve();
                }
            });
        });
        
    } catch (error) {
        logger.error('Error fatal al iniciar servidor:', { error: error.message, stack: error.stack });
        process.exit(1);
    }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
    logger.info('SIGTERM recibido, cerrando servidor...');
    httpServer.close(() => {
        logger.info('Servidor cerrado correctamente');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT recibido, cerrando servidor...');
    httpServer.close(() => {
        logger.info('Servidor cerrado correctamente');
        process.exit(0);
    });
});

// Iniciar sistemas
initializeSystems();