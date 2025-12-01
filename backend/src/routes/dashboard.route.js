import express from 'express';
import { verifySession } from '../middlewares/verifySession.js';
import { 
    getDashboardEstudiante, 
    getDashboardProfesor, 
    getDashboardAdmin 
} from '../controllers/dashboard.controller.js';

const router = express.Router();

// Aplicar middleware de verificación de sesión a todas las rutas
router.use(verifySession);

// Dashboard Estudiante (rol_id = 1)
// Super Admin (4) y Admin (3) también pueden acceder
router.get('/estudiante', (req, res, next) => {
    const rolId = Number(req.rol_id);
    if (rolId !== 1 && rolId !== 3 && rolId !== 4) {
        return res.status(403).json({ 
            success: false,
            message: 'Acceso denegado. Solo estudiantes, administradores y super administradores pueden acceder a este dashboard.' 
        });
    }
    next();
}, getDashboardEstudiante);

// Dashboard Profesor (rol_id = 2)
// Super Admin (4) y Admin (3) también pueden acceder
router.get('/profesor', (req, res, next) => {
    const rolId = Number(req.rol_id);
    if (rolId !== 2 && rolId !== 3 && rolId !== 4) {
        return res.status(403).json({ 
            success: false,
            message: 'Acceso denegado. Solo profesores, administradores y super administradores pueden acceder a este dashboard.' 
        });
    }
    next();
}, getDashboardProfesor);

// Dashboard Admin (rol_id = 3)
// Super Admin (4) también puede acceder
router.get('/admin', (req, res, next) => {
    const rolId = Number(req.rol_id);
    if (rolId !== 3 && rolId !== 4) {
        return res.status(403).json({ 
            success: false,
            message: 'Acceso denegado. Solo administradores y super administradores pueden acceder a este dashboard.' 
        });
    }
    next();
}, getDashboardAdmin);

export default router;
