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
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'http://146.83.198.35:1715', // IP del servidor frontend (puerto 80)
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




const PORT = process.env.PORT || 3000;  

initializeDatabase();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});