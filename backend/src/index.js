import 'dotenv/config';
import express from 'express';
import router  from './routes/login.route.js';
import {initializeDatabase}  from './db/connectionDB.js';
import routerRole from './routes/role.route.js';
import routerProject from './routes/project.route.js';
import routerProp from './routes/propuesta.routes.js';
import downloadRouter from './routes/download.route.js';
import adminRouter from './routes/admin.route.js';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'http://localhost:4200', // o '*' para permitir todos (menos seguro)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true // si usas cookies o auth con credenciales
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({extended: true}));

app.use('/api/v1/users', router);
app.use('/api/v1/roles', routerRole);
app.use('/api/v1/projects', routerProject);
app.use('/api/v1/propuestas', routerProp);
app.use('/api/v1/', downloadRouter);
app.use('/api/v1/admin', adminRouter);




const PORT = process.env.PORT || 3000;  

initializeDatabase();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});