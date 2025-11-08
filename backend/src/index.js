import 'dotenv/config';
import express from 'express';
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
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();

// Validar JWT Secret al inicio
if (!process.env.JWT_SECRET) {
    console.error('❌ ERROR: JWT_SECRET no está definido en las variables de entorno');
    console.error('💡 Agrega JWT_SECRET=tu_clave_secreta_muy_segura a tu archivo .env');
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
      console.warn(`🚫 CORS blocked origin: ${origin}`);
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




const PORT = process.env.PORT || 3000;  

initializeDatabase();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});