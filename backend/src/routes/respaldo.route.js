import express from 'express';
import * as respaldoController from '../controllers/respaldo.controller.js';
import { verifySession } from '../middlewares/verifySession.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verifySession);

// Realizar backup manual (Solo Super Admin)
router.post('/crear', respaldoController.realizarBackupManual);

// Listar backups disponibles (Solo Super Admin)
router.get('/listar', respaldoController.listarBackups);

// Obtener historial de backups (Solo Super Admin)
router.get('/historial', respaldoController.obtenerHistorialBackups);

// Restaurar un backup específico (Solo Super Admin)
router.post('/restaurar/:nombre', respaldoController.restaurarBackup);

// Eliminar un backup (Solo Super Admin)
router.delete('/:nombre', respaldoController.eliminarBackup);

export default router;
