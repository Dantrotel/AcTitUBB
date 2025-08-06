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

// ===== CONTROLADORES PARA ADMIN =====

// Crear fecha global (solo admin)
export const crearFechaGlobalController = async (req, res) => {
    try {
        const { titulo, descripcion, fecha, tipo_fecha } = req.body;
        const creado_por_rut = req.user?.rut;

        if (!titulo || !fecha || !tipo_fecha) {
            return res.status(400).json({ 
                message: 'Faltan campos requeridos: titulo, fecha, tipo_fecha' 
            });
        }

        // Verificar que el usuario sea admin
        if (req.user?.rol !== 'admin') {
            return res.status(403).json({ 
                message: 'Solo los administradores pueden crear fechas globales' 
            });
        }

        const fechaId = await crearFechaGlobal({
            titulo,
            descripcion,
            fecha,
            tipo_fecha,
            creado_por_rut
        });

        res.status(201).json({
            ok: true,
            message: 'Fecha global creada exitosamente',
            fecha_id: fechaId
        });
    } catch (error) {
        console.error('Error al crear fecha global:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener todas las fechas globales
export const obtenerFechasGlobalesController = async (req, res) => {
    try {
        const fechas = await obtenerFechasGlobales();
        res.json(fechas);
    } catch (error) {
        console.error('Error al obtener fechas globales:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener estadísticas de fechas (solo admin)
export const obtenerEstadisticasFechasController = async (req, res) => {
    try {
        if (req.user?.rol !== 'admin') {
            return res.status(403).json({ 
                message: 'Solo los administradores pueden ver las estadísticas' 
            });
        }

        const estadisticas = await obtenerEstadisticasFechas();
        res.json(estadisticas);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// ===== CONTROLADORES PARA PROFESORES =====

// Crear fecha específica para un estudiante (solo profesores)
export const crearFechaEspecificaController = async (req, res) => {
    try {
        const { titulo, descripcion, fecha, tipo_fecha, estudiante_rut } = req.body;
        const profesor_rut = req.user?.rut;

        if (!titulo || !fecha || !tipo_fecha || !estudiante_rut) {
            return res.status(400).json({ 
                message: 'Faltan campos requeridos: titulo, fecha, tipo_fecha, estudiante_rut' 
            });
        }

        // Verificar que el usuario sea profesor
        if (req.user?.rol !== 'profesor') {
            return res.status(403).json({ 
                message: 'Solo los profesores pueden crear fechas específicas' 
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

        res.status(201).json({
            ok: true,
            message: 'Fecha específica creada exitosamente',
            fecha_id: fechaId
        });
    } catch (error) {
        console.error('Error al crear fecha específica:', error);
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
        console.error('Error al obtener fechas del profesor:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// ===== CONTROLADORES PARA ESTUDIANTES =====

// Obtener fechas visibles para un estudiante
export const obtenerFechasParaEstudianteController = async (req, res) => {
    try {
        const estudiante_rut = req.user?.rut;

        if (req.user?.rol !== 'estudiante') {
            return res.status(403).json({ 
                message: 'Solo los estudiantes pueden ver sus fechas' 
            });
        }

        const fechas = await obtenerFechasParaEstudiante(estudiante_rut);
        res.json(fechas);
    } catch (error) {
        console.error('Error al obtener fechas del estudiante:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener fechas próximas para un estudiante (específico para estudiantes)
export const obtenerFechasProximasEstudianteController = async (req, res) => {
    try {
        const estudiante_rut = req.user?.rut;
        const limite = parseInt(req.query.limite) || 5;

        console.log('🎯 Controller obtenerFechasProximasEstudianteController:');
        console.log('  - req.user:', req.user);
        console.log('  - estudiante_rut:', estudiante_rut);
        console.log('  - limite:', limite);

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
        console.log('  - Fechas obtenidas:', fechas.length);
        res.json(fechas);
    } catch (error) {
        console.error('Error al obtener fechas próximas:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener fechas próximas (GENERAL - para todos los roles)
export const obtenerFechasProximasController = async (req, res) => {
    try {
        const usuario_rut = req.user?.rut;
        const limite = parseInt(req.query.limite) || 5;

        console.log('🎯 Controller obtenerFechasProximasController (GENERAL):');
        console.log('  - req.user:', req.user);
        console.log('  - usuario_rut:', usuario_rut);
        console.log('  - limite:', limite);
        console.log('  - rol:', req.user?.rol);

        if (!usuario_rut) {
            return res.status(400).json({ 
                message: 'RUT del usuario es requerido' 
            });
        }

        // Este endpoint es accesible por todos los roles
        const fechas = await obtenerFechasProximas(usuario_rut, limite);
        console.log('  - Fechas globales obtenidas:', fechas.length);
        res.json(fechas);
    } catch (error) {
        console.error('Error al obtener fechas próximas:', error);
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
        console.error('Error al obtener fecha:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Actualizar fecha
export const actualizarFechaController = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, fecha, tipo_fecha } = req.body;
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        if (!titulo || !fecha || !tipo_fecha) {
            return res.status(400).json({ 
                message: 'Faltan campos requeridos: titulo, fecha, tipo_fecha' 
            });
        }

        // Verificar permisos
        const puedeEditar = await puedeEditarFecha(id, usuario_rut, rol_usuario);
        if (!puedeEditar) {
            return res.status(403).json({ 
                message: 'No tienes permisos para editar esta fecha' 
            });
        }

        const actualizada = await actualizarFecha(id, {
            titulo,
            descripcion,
            fecha,
            tipo_fecha
        });

        if (actualizada) {
            res.json({ 
                ok: true, 
                message: 'Fecha actualizada correctamente' 
            });
        } else {
            res.status(404).json({ message: 'Fecha no encontrada' });
        }
    } catch (error) {
        console.error('Error al actualizar fecha:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
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
        console.error('Error al eliminar fecha:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};