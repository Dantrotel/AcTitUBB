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
        console.log('📅 Intentando crear fecha global...');
        console.log('  - Body:', req.body);
        console.log('  - Usuario:', req.user);
        
        const { titulo, descripcion, fecha, tipo_fecha, es_global } = req.body;
        const creado_por_rut = req.user?.rut;

        // Validar campos requeridos
        if (!titulo || !fecha || !tipo_fecha) {
            console.error('❌ Faltan campos requeridos');
            return res.status(400).json({ 
                message: 'Faltan campos requeridos: titulo, fecha, tipo_fecha' 
            });
        }

        // Validar que el usuario esté autenticado
        if (!req.user || !creado_por_rut) {
            console.error('❌ Usuario no autenticado');
            return res.status(401).json({ 
                message: 'Usuario no autenticado' 
            });
        }

        // Verificar que el usuario sea admin
        console.log('  - Rol del usuario:', req.user.rol);
        if (req.user.rol !== 'admin') {
            console.error('❌ Usuario no es admin, rol:', req.user.rol);
            return res.status(403).json({ 
                message: 'Solo los administradores pueden crear fechas globales',
                debug: {
                    rolRecibido: req.user.rol,
                    rolEsperado: 'admin'
                }
            });
        }

        // Validar formato de fecha
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            console.error('❌ Formato de fecha inválido:', fecha);
            return res.status(400).json({ 
                message: 'Formato de fecha inválido. Use YYYY-MM-DD' 
            });
        }

        console.log('✅ Validaciones OK, creando fecha en BD...');
        const fechaId = await crearFechaGlobal({
            titulo,
            descripcion,
            fecha,
            tipo_fecha,
            es_global: es_global || false,
            creado_por_rut
        });

        console.log('✅ Fecha creada exitosamente, ID:', fechaId);
        res.status(201).json({
            ok: true,
            message: 'Fecha global creada exitosamente',
            fecha_id: fechaId
        });
    } catch (error) {
        console.error('❌ Error al crear fecha global:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
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
        // Validar autenticación
        if (!req.user) {
            return res.status(401).json({ 
                message: 'Usuario no autenticado' 
            });
        }

        if (req.user.rol !== 'admin') {
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
        if (!titulo || !fecha || !tipo_fecha) {
            return res.status(400).json({ 
                message: 'Faltan campos requeridos: titulo, fecha, tipo_fecha' 
            });
        }

        // Validar formato de fecha
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return res.status(400).json({ 
                message: 'Formato de fecha inválido. Use YYYY-MM-DD' 
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