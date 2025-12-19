import {
    crearFechaGlobal,
    crearFechaEspecifica,
    obtenerFechasGlobales,
    obtenerFechasPorProfesor,
    obtenerFechasParaEstudiante,
    obtenerFechaPorId,
    actualizarFecha,
    eliminarFecha,
    obtenerFechasProximas,
    obtenerEstadisticasFechas,
    puedeEditarFecha
} from '../models/calendario.model.js';
import { sendFechaPublicadaEmail } from '../services/email.service.js';
import { UserModel } from '../models/user.model.js';
import { logger } from '../config/logger.js';
import { pool } from '../db/connectionDB.js';

// ===== CONTROLADORES PARA ADMIN =====

// Crear fecha global (solo admin)
export const crearFechaGlobalController = async (req, res) => {
    try {
        
        
        
        
        const { titulo, descripcion, fecha_inicio, hora_inicio, fecha, hora_limite, tipo_fecha, es_global } = req.body;
        const creado_por_rut = req.user?.rut;

        // Validar campos requeridos
        if (!titulo || !fecha || !tipo_fecha) {
            
            return res.status(400).json({ 
                message: 'Faltan campos requeridos: titulo, fecha (fin), tipo_fecha' 
            });
        }

        // Validar que el usuario esté autenticado
        if (!req.user || !creado_por_rut) {
            
            return res.status(401).json({ 
                message: 'Usuario no autenticado' 
            });
        }

        // Verificar que el usuario sea admin o super admin
        const rolUsuario = req.user.rol_id || req.user.rol;
        const esAdmin = rolUsuario === 3 || req.user.rol === 'admin';
        const esSuperAdmin = rolUsuario === 4 || req.user.rol === 'superadmin';
        
        
        if (!esAdmin && !esSuperAdmin) {
            
            return res.status(403).json({ 
                message: 'Solo los administradores pueden crear fechas globales',
                debug: {
                    rolRecibido: req.user.rol,
                    rolIdRecibido: req.user.rol_id,
                    rolEsperado: 'admin o superadmin'
                }
            });
        }

        // Validar formato de fecha fin (obligatoria)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            
            return res.status(400).json({ 
                message: 'Formato de fecha fin inválido. Use YYYY-MM-DD' 
            });
        }

        // Validar fecha_inicio si existe
        if (fecha_inicio) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_inicio)) {
                
                return res.status(400).json({ 
                    message: 'Formato de fecha inicio inválido. Use YYYY-MM-DD' 
                });
            }

            // Validar que fecha_inicio + hora_inicio sea antes de fecha_fin + hora_limite
            const horaInicioValue = hora_inicio || '00:00:00';
            const horaLimiteValue = hora_limite || '23:59:59';
            const fechaHoraInicio = new Date(fecha_inicio + 'T' + horaInicioValue);
            const fechaHoraFin = new Date(fecha + 'T' + horaLimiteValue);
            if (fechaHoraInicio >= fechaHoraFin) {
                return res.status(400).json({ 
                    message: 'La fecha y hora de inicio deben ser anteriores a la fecha y hora fin' 
                });
            }

            // Validar que fecha_inicio no sea en el pasado (permite hoy)
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const fechaInicioDate = new Date(fecha_inicio + 'T00:00:00');
            fechaInicioDate.setHours(0, 0, 0, 0);
            if (fechaInicioDate < hoy) {
                return res.status(400).json({ 
                    message: 'La fecha de inicio no puede ser anterior a hoy' 
                });
            }
        }

        // Validar que fecha_fin no sea en el pasado (permite hoy)
        const fechaFinDate = new Date(fecha + 'T00:00:00');
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        fechaFinDate.setHours(0, 0, 0, 0);
        if (fechaFinDate < hoy) {
            return res.status(400).json({ 
                message: 'La fecha fin no puede ser anterior a hoy' 
            });
        }

        
        const fechaId = await crearFechaGlobal({
            titulo,
            descripcion,
            fecha_inicio: fecha_inicio || null,
            hora_inicio: hora_inicio || '00:00:00',
            fecha,
            hora_limite: hora_limite || '23:59:59',
            tipo_fecha,
            es_global: es_global || false,
            creado_por_rut
        });

        

        // 📧 Enviar emails a todos los profesores y estudiantes (excepto admins)
        try {
            const [usuarios] = await pool.query(
                'SELECT email, nombre FROM usuarios WHERE rol_id IN (1, 2) AND email IS NOT NULL'
            );
            
            if (usuarios.length > 0) {
                const emails = usuarios.map(u => u.email);
                await sendFechaPublicadaEmail(
                    emails,
                    titulo,
                    descripcion || '',
                    fecha,
                    tipo_fecha
                );
                logger.info('Emails de fecha global enviados', { 
                    fecha_id: fechaId, 
                    destinatarios: emails.length 
                });
            }
        } catch (emailError) {
            logger.error('Error al enviar emails de fecha global', { error: emailError.message });
            // No falla el proceso
        }

        res.status(201).json({
            ok: true,
            message: 'Fecha global creada exitosamente',
            fecha_id: fechaId
        });
    } catch (error) {
        
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

// Obtener todas las fechas globales
export const obtenerFechasGlobalesController = async (req, res) => {
    try {
        const rolUsuario = req.user?.rol_id || req.user?.rol;
        const esSuperAdmin = rolUsuario === 4 || req.user?.rol === 'superadmin';
        
        // Si es super admin, obtener TODAS las fechas globales creadas por admins (rol 3) y super admins (rol 4)
        // Esto asegura que el super admin vea todas las fechas que publican los admins de todas las carreras
        if (esSuperAdmin) {
            
            const [fechas] = await pool.execute(`
                SELECT f.*, 
                       u.nombre AS nombre_creador,
                       u.rol_id AS creador_rol_id,
                       u.rut AS creador_rut
                FROM fechas f
                LEFT JOIN usuarios u ON f.creado_por_rut = u.rut
                WHERE f.es_global = TRUE 
                AND f.activa = TRUE
                AND (u.rol_id = 3 OR u.rol_id = 4)  -- Fechas creadas por admins (rol 3) o super admins (rol 4)
                ORDER BY f.fecha ASC
            `);
            
            return res.json(fechas);
        }
        
        // Para admin normal, obtener todas las fechas globales (sin filtro de creador)
        const fechas = await obtenerFechasGlobales();
        res.json(fechas);
    } catch (error) {
        
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener estadísticas de fechas (admin y super admin)
export const obtenerEstadisticasFechasController = async (req, res) => {
    try {
        // Validar autenticación
        if (!req.user) {
            return res.status(401).json({ 
                message: 'Usuario no autenticado' 
            });
        }

        // Permitir acceso a admin (rol 3) y super admin (rol 4)
        const rolUsuario = req.user.rol_id || req.user.rol;
        if (rolUsuario !== 3 && rolUsuario !== 4 && req.user.rol !== 'admin' && req.user.rol !== 'superadmin') {
            return res.status(403).json({ 
                message: 'Solo los administradores pueden ver las estadísticas' 
            });
        }

        const estadisticas = await obtenerEstadisticasFechas();
        res.json(estadisticas);
    } catch (error) {
        
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// ===== CONTROLADORES PARA PROFESORES =====

// Crear fecha específica para un estudiante (solo profesores)
export const crearFechaEspecificaController = async (req, res) => {
    try {
        const { titulo, descripcion, fecha, tipo_fecha, estudiante_rut } = req.body;
        const profesor_rut = req.user?.rut;

        // Validar campos requeridos
        if (!titulo || !fecha || !tipo_fecha || !estudiante_rut) {
            return res.status(400).json({ 
                message: 'Faltan campos requeridos: titulo, fecha, tipo_fecha, estudiante_rut' 
            });
        }

        // Validar autenticación
        if (!req.user || !profesor_rut) {
            return res.status(401).json({ 
                message: 'Usuario no autenticado' 
            });
        }

        // Verificar que el usuario sea profesor
        if (req.user.rol !== 'profesor') {
            return res.status(403).json({ 
                message: 'Solo los profesores pueden crear fechas específicas' 
            });
        }

        // Validar formato de fecha
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return res.status(400).json({ 
                message: 'Formato de fecha inválido. Use YYYY-MM-DD' 
            });
        }

        // Validar formato de RUT del estudiante
        if (!/^\d{7,8}-[\dkK]$/.test(estudiante_rut)) {
            return res.status(400).json({ 
                message: 'Formato de RUT del estudiante inválido' 
            });
        }

        // Verificar que el profesor tenga asignado a este estudiante
        // (implementar validación si es necesario)

        const fechaId = await crearFechaEspecifica({
            titulo,
            descripcion,
            fecha,
            tipo_fecha,
            profesor_rut,
            estudiante_rut
        });

        // 📧 Enviar email al estudiante específico
        try {
            const estudiante = await UserModel.findPersonByRut(estudiante_rut);
            if (estudiante && estudiante.email && estudiante.rol_id !== 3) {
                await sendFechaPublicadaEmail(
                    [estudiante.email],
                    titulo,
                    descripcion || '',
                    fecha,
                    tipo_fecha
                );
                logger.info('Email de fecha específica enviado', { 
                    fecha_id: fechaId, 
                    estudiante_email: estudiante.email 
                });
            }
        } catch (emailError) {
            logger.error('Error al enviar email de fecha específica', { error: emailError.message });
        }

        res.status(201).json({
            ok: true,
            message: 'Fecha específica creada exitosamente',
            fecha_id: fechaId
        });
    } catch (error) {
        
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener fechas creadas por un profesor
export const obtenerFechasPorProfesorController = async (req, res) => {
    try {
        const profesor_rut = req.user?.rut;

        if (req.user?.rol !== 'profesor') {
            return res.status(403).json({ 
                message: 'Solo los profesores pueden ver sus fechas' 
            });
        }

        const fechas = await obtenerFechasPorProfesor(profesor_rut);
        res.json(fechas);
    } catch (error) {
        
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// ===== CONTROLADORES PARA ESTUDIANTES =====

// Obtener fechas visibles para un estudiante
export const obtenerFechasParaEstudianteController = async (req, res) => {
    try {
        const estudiante_rut = req.user?.rut;

        // Validar autenticación
        if (!req.user || !estudiante_rut) {
            return res.status(401).json({ 
                message: 'Usuario no autenticado' 
            });
        }

        if (req.user.rol !== 'estudiante') {
            return res.status(403).json({ 
                message: 'Solo los estudiantes pueden ver sus fechas' 
            });
        }

        const fechas = await obtenerFechasParaEstudiante(estudiante_rut);
        res.json(fechas);
    } catch (error) {
        
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener fechas próximas para un estudiante (específico para estudiantes)
export const obtenerFechasProximasEstudianteController = async (req, res) => {
    try {
        const estudiante_rut = req.user?.rut;
        const limite = parseInt(req.query.limite) || 5;

        
        
        
        

        if (req.user?.rol !== 'estudiante') {
            return res.status(403).json({ 
                message: 'Solo los estudiantes pueden ver sus fechas próximas' 
            });
        }

        if (!estudiante_rut) {
            return res.status(400).json({ 
                message: 'RUT del estudiante es requerido' 
            });
        }

        const fechas = await obtenerFechasProximas(estudiante_rut, limite);
        
        res.json(fechas);
    } catch (error) {
        
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener fechas próximas (GENERAL - para todos los roles)
export const obtenerFechasProximasController = async (req, res) => {
    try {
        const usuario_rut = req.user?.rut;
        const limite = parseInt(req.query.limite) || 5;

        console.log('📅 Obteniendo fechas próximas para:', usuario_rut);

        // Validar autenticación
        if (!req.user || !usuario_rut) {
            return res.status(401).json({ 
                message: 'Usuario no autenticado' 
            });
        }

        // Validar límite
        if (limite < 1 || limite > 50) {
            return res.status(400).json({ 
                message: 'Límite debe estar entre 1 y 50' 
            });
        }

        // Este endpoint es accesible por todos los roles autenticados
        const fechas = await obtenerFechasProximas(usuario_rut, limite);
        
        res.json(fechas);
    } catch (error) {
        
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// ===== CONTROLADORES GENERALES =====

// Obtener fecha por ID
export const obtenerFechaPorIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const fecha = await obtenerFechaPorId(id);

        if (!fecha) {
            return res.status(404).json({ message: 'Fecha no encontrada' });
        }

        // Verificar permisos de acceso
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        let tieneAcceso = false;

        if (rol_usuario === 'admin') {
            tieneAcceso = true;
        } else if (rol_usuario === 'profesor' && fecha.creado_por_rut === usuario_rut) {
            tieneAcceso = true;
        } else if (rol_usuario === 'estudiante') {
            // El estudiante puede ver la fecha si es global o si está dirigida a él
            if (fecha.es_global || fecha.estudiante_rut === usuario_rut) {
                tieneAcceso = true;
            }
        }

        if (!tieneAcceso) {
            return res.status(403).json({ message: 'No tienes acceso a esta fecha' });
        }

        res.json(fecha);
    } catch (error) {
        
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Actualizar fecha
export const actualizarFechaController = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, fecha_inicio, hora_inicio, fecha, fecha_limite, hora_limite, tipo_fecha, habilitada, es_global } = req.body;
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol || req.user?.rol_id; // Usar rol o rol_id

        
        
        

        // Validar autenticación
        if (!req.user || !usuario_rut) {
            return res.status(401).json({ 
                message: 'Usuario no autenticado' 
            });
        }

        // Validar ID de la fecha
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ 
                message: 'ID de fecha inválido' 
            });
        }

        // Validar campos requeridos
        const fechaParaValidar = fecha || fecha_limite;
        if (!titulo || !fechaParaValidar) {
            return res.status(400).json({ 
                message: 'Faltan campos requeridos: titulo, fecha fin' 
            });
        }

        // Validar formato de fecha fin
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaParaValidar)) {
            return res.status(400).json({ 
                message: 'Formato de fecha fin inválido. Use YYYY-MM-DD' 
            });
        }

        // Validar fecha_inicio si existe
        if (fecha_inicio) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_inicio)) {
                return res.status(400).json({ 
                    message: 'Formato de fecha inicio inválido. Use YYYY-MM-DD' 
                });
            }

            // Validar que fecha_inicio + hora_inicio sea antes de fecha_fin + hora_limite
            const horaInicioValue = hora_inicio || '00:00:00';
            const horaLimiteValue = hora_limite || '23:59:59';
            const fechaHoraInicio = new Date(fecha_inicio + 'T' + horaInicioValue);
            const fechaHoraFin = new Date(fechaParaValidar + 'T' + horaLimiteValue);
            if (fechaHoraInicio >= fechaHoraFin) {
                return res.status(400).json({ 
                    message: 'La fecha y hora de inicio deben ser anteriores a la fecha y hora fin' 
                });
            }

            // Validar que fecha_inicio no sea en el pasado (permite hoy)
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const fechaInicioDate = new Date(fecha_inicio + 'T00:00:00');
            fechaInicioDate.setHours(0, 0, 0, 0);
            if (fechaInicioDate < hoy) {
                return res.status(400).json({ 
                    message: 'La fecha de inicio no puede ser anterior a hoy' 
                });
            }
        }

        // Validar que fecha_fin no sea en el pasado (permite hoy)
        const fechaFinDate = new Date(fechaParaValidar + 'T00:00:00');
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        fechaFinDate.setHours(0, 0, 0, 0);
        if (fechaFinDate < hoy) {
            return res.status(400).json({ 
                message: 'La fecha fin no puede ser anterior a hoy' 
            });
        }

        // Verificar permisos
        const puedeEditar = await puedeEditarFecha(id, usuario_rut, rol_usuario);
        if (!puedeEditar) {
            return res.status(403).json({ 
                message: 'No tienes permisos para editar esta fecha' 
            });
        }

        // Preparar datos para actualizar
        const datosActualizar = {
            titulo,
            descripcion,
            fecha_inicio: fecha_inicio || null,
            hora_inicio: hora_inicio || '00:00:00',
            fecha: fechaParaValidar,
            hora_limite: hora_limite || '23:59:59',
            tipo_fecha,
            habilitada,
            es_global
        };

        

        // El modelo ahora maneja todo en la tabla unificada 'fechas'
        const actualizada = await actualizarFecha(id, datosActualizar);

        if (actualizada) {
            res.json({ 
                ok: true, 
                message: 'Fecha actualizada correctamente' 
            });
        } else {
            res.status(404).json({ message: 'Fecha no encontrada' });
        }
    } catch (error) {
        
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

// Eliminar fecha
export const eliminarFechaController = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        // Verificar permisos
        const puedeEditar = await puedeEditarFecha(id, usuario_rut, rol_usuario);
        if (!puedeEditar) {
            return res.status(403).json({ 
                message: 'No tienes permisos para eliminar esta fecha' 
            });
        }

        const eliminada = await eliminarFecha(id);

        if (eliminada) {
            res.json({ 
                ok: true, 
                message: 'Fecha eliminada correctamente' 
            });
        } else {
            res.status(404).json({ message: 'Fecha no encontrada' });
        }
    } catch (error) {
        
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};