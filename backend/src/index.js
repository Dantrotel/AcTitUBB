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
import cors from 'cors';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:4200', 
    'http://localhost', 
    'http://localhost:80',
    'http://146.83.194.188:8090',
    'https://146.83.194.188:8453',
    'http://146.83.194.188',
    'https://146.83.194.188'
  ], // Múltiples orígenes permitidos incluyendo el servidor
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true // si usas cookies o auth con credenciales
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({extended: true}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'AcTitUBB Backend'
    });
});

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




const PORT = process.env.PORT || 3000;  

initializeDatabase();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});