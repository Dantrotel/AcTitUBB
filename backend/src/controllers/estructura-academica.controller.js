import * as FacultadModel from '../models/facultad.model.js';
import * as DepartamentoModel from '../models/departamento.model.js';
import * as CarreraModel from '../models/carrera.model.js';

// ========== CONTROLADORES DE FACULTADES ==========

const obtenerFacultades = async (req, res) => {
    try {
        const soloActivas = req.query.activas === 'true';
        const facultades = await FacultadModel.obtenerFacultades(soloActivas);
        res.json({ success: true, facultades });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al obtener facultades' });
    }
};

const obtenerFacultadPorId = async (req, res) => {
    try {
        const facultad = await FacultadModel.obtenerFacultadPorId(req.params.id);
        if (!facultad) {
            return res.status(404).json({ success: false, message: 'Facultad no encontrada' });
        }
        res.json({ success: true, facultad });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al obtener facultad' });
    }
};

const crearFacultad = async (req, res) => {
    try {
        const { nombre, codigo } = req.body;
        
        if (!nombre || !codigo) {
            return res.status(400).json({ success: false, message: 'Nombre y código son requeridos' });
        }
        
        const id = await FacultadModel.crearFacultad(req.body);
        res.status(201).json({ success: true, message: 'Facultad creada exitosamente', id });
    } catch (error) {
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Ya existe una facultad con ese código o nombre' });
        }
        res.status(500).json({ success: false, message: 'Error al crear facultad' });
    }
};

const actualizarFacultad = async (req, res) => {
    try {
        const actualizado = await FacultadModel.actualizarFacultad(req.params.id, req.body);
        if (!actualizado) {
            return res.status(404).json({ success: false, message: 'Facultad no encontrada' });
        }
        res.json({ success: true, message: 'Facultad actualizada exitosamente' });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al actualizar facultad' });
    }
};

const eliminarFacultad = async (req, res) => {
    try {
        const eliminado = await FacultadModel.eliminarFacultad(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ success: false, message: 'Facultad no encontrada' });
        }
        res.json({ success: true, message: 'Facultad desactivada exitosamente (soft delete)' });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al eliminar facultad' });
    }
};

const reactivarFacultad = async (req, res) => {
    try {
        const reactivado = await FacultadModel.reactivarFacultad(req.params.id);
        if (!reactivado) {
            return res.status(404).json({ success: false, message: 'Facultad no encontrada' });
        }
        return res.json({ success: true, message: 'Facultad reactivada exitosamente' });
    } catch (error) {
        
        return res.status(500).json({ success: false, message: 'Error al reactivar facultad' });
    }
};

const eliminarFacultadPermanente = async (req, res) => {
    try {
        const eliminado = await FacultadModel.eliminarFacultadPermanente(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ success: false, message: 'Facultad no encontrada' });
        }
        return res.json({ success: true, message: 'Facultad eliminada permanentemente' });
    } catch (error) {
        
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede eliminar la facultad porque tiene departamentos o carreras asociadas. Elimine primero las relaciones.' 
            });
        }
        return res.status(500).json({ success: false, message: 'Error al eliminar facultad permanentemente' });
    }
};

const obtenerEstadisticasFacultad = async (req, res) => {
    try {
        const estadisticas = await FacultadModel.obtenerEstadisticasFacultad(req.params.id);
        res.json({ success: true, estadisticas });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
    }
};

// ========== CONTROLADORES DE DEPARTAMENTOS ==========

const obtenerDepartamentos = async (req, res) => {
    try {
        const soloActivos = req.query.activos === 'true';
        const facultadId = req.query.facultad_id;
        const departamentos = await DepartamentoModel.obtenerDepartamentos(soloActivos, facultadId);
        res.json({ success: true, departamentos });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al obtener departamentos' });
    }
};

const obtenerDepartamentoPorId = async (req, res) => {
    try {
        const departamento = await DepartamentoModel.obtenerDepartamentoPorId(req.params.id);
        if (!departamento) {
            return res.status(404).json({ success: false, message: 'Departamento no encontrado' });
        }
        res.json({ success: true, departamento });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al obtener departamento' });
    }
};

const crearDepartamento = async (req, res) => {
    try {
        const { facultad_id, nombre, codigo } = req.body;
        
        if (!facultad_id || !nombre || !codigo) {
            return res.status(400).json({ success: false, message: 'Facultad, nombre y código son requeridos' });
        }
        
        const id = await DepartamentoModel.crearDepartamento(req.body);
        res.status(201).json({ success: true, message: 'Departamento creado exitosamente', id });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al crear departamento' });
    }
};

const actualizarDepartamento = async (req, res) => {
    try {
        const actualizado = await DepartamentoModel.actualizarDepartamento(req.params.id, req.body);
        if (!actualizado) {
            return res.status(404).json({ success: false, message: 'Departamento no encontrado' });
        }
        res.json({ success: true, message: 'Departamento actualizado exitosamente' });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al actualizar departamento' });
    }
};

const eliminarDepartamento = async (req, res) => {
    try {
        const eliminado = await DepartamentoModel.eliminarDepartamento(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ success: false, message: 'Departamento no encontrado' });
        }
        res.json({ success: true, message: 'Departamento desactivado exitosamente (soft delete)' });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al eliminar departamento' });
    }
};

const reactivarDepartamento = async (req, res) => {
    try {
        const reactivado = await DepartamentoModel.reactivarDepartamento(req.params.id);
        if (!reactivado) {
            return res.status(404).json({ success: false, message: 'Departamento no encontrado' });
        }
        return res.json({ success: true, message: 'Departamento reactivado exitosamente' });
    } catch (error) {
        
        return res.status(500).json({ success: false, message: 'Error al reactivar departamento' });
    }
};

const eliminarDepartamentoPermanente = async (req, res) => {
    try {
        const eliminado = await DepartamentoModel.eliminarDepartamentoPermanente(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ success: false, message: 'Departamento no encontrado' });
        }
        return res.json({ success: true, message: 'Departamento eliminado permanentemente' });
    } catch (error) {
        
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede eliminar el departamento porque tiene profesores o relaciones con carreras. Elimine primero las relaciones.' 
            });
        }
        return res.status(500).json({ success: false, message: 'Error al eliminar departamento permanentemente' });
    }
};

const removerProfesorDepartamento = async (req, res) => {
    try {
        await DepartamentoModel.removerProfesorDepartamento(req.params.profesorRut, req.params.id);
        res.json({ success: true, message: 'Profesor removido del departamento exitosamente' });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al remover profesor del departamento' });
    }
};

const asignarProfesorDepartamento = async (req, res) => {
    try {
        const { profesor_rut, es_principal, fecha_ingreso } = req.body;
        
        if (!profesor_rut) {
            return res.status(400).json({ success: false, message: 'RUT del profesor es requerido' });
        }
        
        await DepartamentoModel.asignarProfesorDepartamento(profesor_rut, req.params.id, es_principal, fecha_ingreso);
        res.json({ success: true, message: 'Profesor asignado al departamento exitosamente' });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al asignar profesor al departamento' });
    }
};

const obtenerProfesoresDepartamento = async (req, res) => {
    try {
        const profesores = await DepartamentoModel.obtenerProfesoresDepartamento(req.params.id);
        res.json({ success: true, profesores });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al obtener profesores del departamento' });
    }
};

// ========== CONTROLADORES DE CARRERAS ==========

const obtenerCarreras = async (req, res) => {
    try {
        const soloActivas = req.query.activas === 'true';
        const facultadId = req.query.facultad_id;
        const carreras = await CarreraModel.obtenerCarreras(soloActivas, facultadId);
        res.json({ success: true, carreras });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al obtener carreras' });
    }
};

const obtenerCarreraPorId = async (req, res) => {
    try {
        const carrera = await CarreraModel.obtenerCarreraPorId(req.params.id);
        if (!carrera) {
            return res.status(404).json({ success: false, message: 'Carrera no encontrada' });
        }
        res.json({ success: true, carrera });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al obtener carrera' });
    }
};

const crearCarrera = async (req, res) => {
    try {
        const { facultad_id, nombre, codigo, titulo_profesional } = req.body;
        
        if (!facultad_id || !nombre || !codigo || !titulo_profesional) {
            return res.status(400).json({ 
                success: false, 
                message: 'Facultad, nombre, código y título profesional son requeridos' 
            });
        }
        
        const id = await CarreraModel.crearCarrera(req.body);
        res.status(201).json({ success: true, message: 'Carrera creada exitosamente', id });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al crear carrera' });
    }
};

const actualizarCarrera = async (req, res) => {
    try {
        const actualizado = await CarreraModel.actualizarCarrera(req.params.id, req.body);
        if (!actualizado) {
            return res.status(404).json({ success: false, message: 'Carrera no encontrada' });
        }
        res.json({ success: true, message: 'Carrera actualizada exitosamente' });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al actualizar carrera' });
    }
};

const eliminarCarrera = async (req, res) => {
    try {
        const eliminado = await CarreraModel.eliminarCarrera(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ success: false, message: 'Carrera no encontrada' });
        }
        res.json({ success: true, message: 'Carrera desactivada exitosamente (soft delete)' });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al eliminar carrera' });
    }
};

const reactivarCarrera = async (req, res) => {
    try {
        const reactivado = await CarreraModel.reactivarCarrera(req.params.id);
        if (!reactivado) {
            return res.status(404).json({ success: false, message: 'Carrera no encontrada' });
        }
        return res.json({ success: true, message: 'Carrera reactivada exitosamente' });
    } catch (error) {
        
        return res.status(500).json({ success: false, message: 'Error al reactivar carrera' });
    }
};

const eliminarCarreraPermanente = async (req, res) => {
    try {
        const eliminado = await CarreraModel.eliminarCarreraPermanente(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ success: false, message: 'Carrera no encontrada' });
        }
        return res.json({ success: true, message: 'Carrera eliminada permanentemente' });
    } catch (error) {
        
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede eliminar la carrera porque tiene estudiantes o relaciones con departamentos. Elimine primero las relaciones.' 
            });
        }
        return res.status(500).json({ success: false, message: 'Error al eliminar carrera permanentemente' });
    }
};

const removerEstudianteCarrera = async (req, res) => {
    try {
        await CarreraModel.removerEstudianteCarrera(req.params.estudianteRut, req.params.id);
        res.json({ success: true, message: 'Estudiante removido de la carrera exitosamente' });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al remover estudiante de carrera' });
    }
};

const asignarJefeCarrera = async (req, res) => {
    try {
        const { profesor_rut } = req.body;
        
        if (!profesor_rut) {
            return res.status(400).json({ success: false, message: 'RUT del profesor es requerido' });
        }
        
        await CarreraModel.asignarJefeCarrera(req.params.id, profesor_rut);
        res.json({ success: true, message: 'Jefe de carrera asignado exitosamente' });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al asignar jefe de carrera' });
    }
};

const removerJefeCarrera = async (req, res) => {
    try {
        await CarreraModel.removerJefeCarrera(req.params.id);
        res.json({ success: true, message: 'Jefe de carrera removido exitosamente' });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al remover jefe de carrera' });
    }
};

const asignarEstudianteCarrera = async (req, res) => {
    try {
        const { estudiante_rut, ...datosAcademicos } = req.body;
        
        if (!estudiante_rut) {
            return res.status(400).json({ success: false, message: 'RUT del estudiante es requerido' });
        }
        
        await CarreraModel.asignarEstudianteCarrera(estudiante_rut, req.params.id, datosAcademicos);
        res.json({ success: true, message: 'Estudiante asignado a la carrera exitosamente' });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al asignar estudiante a la carrera' });
    }
};

const obtenerEstudiantesCarrera = async (req, res) => {
    try {
        const estudiantes = await CarreraModel.obtenerEstudiantesCarrera(req.params.id);
        res.json({ success: true, estudiantes });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al obtener estudiantes de la carrera' });
    }
};

const obtenerEstadisticasCarrera = async (req, res) => {
    try {
        const estadisticas = await CarreraModel.obtenerEstadisticasCarrera(req.params.id);
        res.json({ success: true, estadisticas });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
    }
};

const obtenerPropuestasPendientes = async (req, res) => {
    try {
        const propuestas = await CarreraModel.obtenerPropuestasPendientesAprobacion(req.params.id);
        res.json({ success: true, propuestas });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al obtener propuestas pendientes' });
    }
};

// ========== MÉTODOS PÚBLICOS (SIN AUTENTICACIÓN) PARA REGISTRO ==========

// Obtener carreras activas para registro público
const obtenerCarrerasPublicas = async (req, res) => {
    try {
        // Solo devolver carreras activas
        const carreras = await CarreraModel.obtenerCarreras(true);
        res.json({ success: true, carreras });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al obtener carreras' });
    }
};

// Obtener departamentos activos para registro público
const obtenerDepartamentosPublicos = async (req, res) => {
    try {
        // Solo devolver departamentos activos
        const departamentos = await DepartamentoModel.obtenerDepartamentos(true);
        res.json({ success: true, departamentos });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error al obtener departamentos' });
    }
};

export {
    // Facultades
    obtenerFacultades,
    obtenerFacultadPorId,
    crearFacultad,
    actualizarFacultad,
    eliminarFacultad,
    reactivarFacultad,
    eliminarFacultadPermanente,
    obtenerEstadisticasFacultad,
    
    // Departamentos
    obtenerDepartamentos,
    obtenerDepartamentoPorId,
    crearDepartamento,
    actualizarDepartamento,
    eliminarDepartamento,
    reactivarDepartamento,
    eliminarDepartamentoPermanente,
    asignarProfesorDepartamento,
    removerProfesorDepartamento,
    obtenerProfesoresDepartamento,
    
    // Carreras
    obtenerCarreras,
    obtenerCarreraPorId,
    crearCarrera,
    actualizarCarrera,
    eliminarCarrera,
    reactivarCarrera,
    eliminarCarreraPermanente,
    removerEstudianteCarrera,
    asignarJefeCarrera,
    removerJefeCarrera,
    asignarEstudianteCarrera,
    obtenerEstudiantesCarrera,
    obtenerEstadisticasCarrera,
    obtenerPropuestasPendientes,
    
    // Métodos públicos (sin autenticación) para registro
    obtenerCarrerasPublicas,
    obtenerDepartamentosPublicos
};