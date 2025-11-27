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
router.get('/estudiante', (req, res, next) => {
    if (req.rol_id !== 1) {
        return res.status(403).json({ 
            success: false,
            message: 'Acceso denegado. Solo estudiantes pueden acceder a este dashboard.' 
        });
    }
    next();
}, getDashboardEstudiante);

// Dashboard Profesor (rol_id = 2)
router.get('/profesor', (req, res, next) => {
    if (req.rol_id !== 2) {
        return res.status(403).json({ 
            success: false,
            message: 'Acceso denegado. Solo profesores pueden acceder a este dashboard.' 
        });
    }
    next();
}, getDashboardProfesor);

// Dashboard Admin (rol_id = 3)
router.get('/admin', (req, res, next) => {
    if (req.rol_id !== 3) {
        return res.status(403).json({ 
            success: false,
            message: 'Acceso denegado. Solo administradores pueden acceder a este dashboard.' 
        });
    }
    next();
}, getDashboardAdmin);

export default router;
