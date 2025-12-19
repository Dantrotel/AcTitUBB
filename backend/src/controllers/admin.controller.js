import { UserModel } from '../models/user.model.js';
import { 
  obtenerPropuestasPorProfesor,
  asignarProfesor,
  desasignarProfesor
} from '../models/propuesta.model.js';
import * as AdminModel from '../models/admin.model.js';

// ===== GESTIÓN DE USUARIOS =====
export const obtenerTodosLosUsuarios = async (req, res) => {
  try {
    const { rol_id, carreras_administradas } = req.user || {};
    
    
    
    // Si es Admin de Carrera (rol 3), filtrar usuarios por TODAS sus carreras
    // Solo mostrar estudiantes (rol 1) y profesores (rol 2), excluir admins (rol 3) y super admins (rol 4)
    if (rol_id === 3 && carreras_administradas && carreras_administradas.length > 0) {
      console.log(`🎓 Admin de Carrera filtrando por carreras: ${JSON.stringify(carreras_administradas)}`);
      const usuarios = await UserModel.obtenerUsuariosPorCarreras(carreras_administradas);
      console.log(`👥 Usuarios encontrados: ${usuarios.length}`);
      
      // Verificar que no haya admins o super admins en los resultados
      const adminsEncontrados = usuarios.filter(u => u.rol_id === 3 || u.rol_id === 4);
      if (adminsEncontrados.length > 0) {
        console.warn('⚠️ Se encontraron admins en los resultados, filtrando...', adminsEncontrados.map(a => a.rut));
      }
      
      return res.json(usuarios);
    }
    
    // Super Admin (rol 4) ve todos los usuarios
    
    const usuarios = await UserModel.findpersonAll();
    
    res.json(usuarios);
  } catch (error) {
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const actualizarUsuario = async (req, res) => {
  try {
    const { rut } = req.params;
    const { nombre, email, departamento_id, carrera_id, password } = req.body;
    
    // Construir objeto de actualización solo con campos proporcionados
    const datosActualizar = { nombre, email };
    
    // Solo agregar campos opcionales si están presentes
    if (departamento_id !== undefined) {
      datosActualizar.departamento_id = departamento_id;
    }
    if (carrera_id !== undefined) {
      datosActualizar.carrera_id = carrera_id;
    }
    if (password) {
      datosActualizar.password = password;
    }
    
    const actualizado = await UserModel.actualizarUsuario(rut, datosActualizar);
    
    if (actualizado) {
      res.json({ message: 'Usuario actualizado correctamente' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const eliminarUsuario = async (req, res) => {
  try {
    const { rut } = req.params;
    
    const eliminado = await UserModel.eliminarUsuario(rut);
    
    if (eliminado) {
      res.json({ message: 'Usuario eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { rut } = req.params;
    const { confirmado } = req.body;
    
    if (confirmado === undefined) {
      return res.status(400).json({ message: 'El campo confirmado es requerido' });
    }
    
    const actualizado = await UserModel.cambiarEstadoUsuario(rut, confirmado);
    
    if (actualizado) {
      res.json({ 
        message: `Usuario ${confirmado ? 'activado' : 'desactivado'} correctamente` 
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const cambiarRolUsuario = async (req, res) => {
  try {
    const { rut } = req.params;
    const { rol_id } = req.body;
    
    if (!rol_id) {
      return res.status(400).json({ message: 'El campo rol_id es requerido' });
    }
    
    // Validar que el rol_id existe (1=estudiante, 2=profesor, 3=admin)
    if (![1, 2, 3].includes(parseInt(rol_id))) {
      return res.status(400).json({ message: 'Rol inválido' });
    }
    
    const actualizado = await UserModel.cambiarRolUsuario(rut, rol_id);
    
    if (actualizado) {
      res.json({ message: 'Rol de usuario actualizado correctamente' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const crearUsuario = async (req, res) => {
  try {
    const { rut, nombre, email, password, rol_id, confirmado } = req.body;
    
    // Validaciones
    if (!rut || !nombre || !email || !password || !rol_id) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos (rut, nombre, email, password, rol_id)' 
      });
    }
    
    // Validar formato de RUT (básico)
    if (!/^\d{7,8}-[0-9kK]$/.test(rut)) {
      return res.status(400).json({ message: 'Formato de RUT inválido (Ej: 12345678-9)' });
    }
    
    // Validar que el usuario no existe
    const usuarioExiste = await UserModel.findPersonByRut(rut);
    if (usuarioExiste) {
      return res.status(409).json({ message: 'El usuario ya existe' });
    }
    
    // Validar email único
    const emailExiste = await UserModel.findPersonByEmail(email);
    if (emailExiste) {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }
    
    // 🔐 HASHEAR LA CONTRASEÑA CON BCRYPT
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear usuario con contraseña hasheada
    const userId = await UserModel.crearUsuarioAdmin({
      rut,
      nombre,
      email,
      password: hashedPassword,
      rol_id: parseInt(rol_id),
      confirmado: confirmado !== undefined ? confirmado : true
    });
    
    res.status(201).json({ 
      message: 'Usuario creado correctamente',
      id: userId
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const resetearPasswordUsuario = async (req, res) => {
  try {
    
    
    
    
    
    const { rut } = req.params;
    const { nueva_password } = req.body;
    
    console.log(`🔑 Cambio de contraseña para RUT: ${rut}, password: ${nueva_password ? '***' + nueva_password.slice(-3) : 'UNDEFINED'}`);
    
    if (!nueva_password) {
      console.log('⚠️ Nueva contraseña no proporcionada');
      return res.status(400).json({ message: 'La nueva contraseña es requerida' });
    }
    
    // Obtener datos del usuario
    const usuario = await UserModel.obtenerUsuarioCompleto(rut);
    if (!usuario) {
      
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // 🔐 HASHEAR LA CONTRASEÑA CON BCRYPT
    
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nueva_password, salt);
    console.log('🔐 Contraseña hasheada correctamente');
    
    const actualizado = await UserModel.resetearPassword(rut, hashedPassword);
    
    
    
    if (actualizado) {
      // 📧 Enviar email con contraseña temporal
      try {
        const { sendPasswordResetEmail } = await import('../services/email.service.js');
        
        await sendPasswordResetEmail(usuario.email, usuario.nombre, nueva_password, usuario.rut);
        
      } catch (emailError) {
        
        // No fallar la operación si el email falla
      }
      
      
      res.json({ 
        success: true,
        message: 'Contraseña reseteada correctamente. Se ha enviado un email al usuario.',
        password_temporal: nueva_password // Enviar la contraseña SIN HASHEAR al admin
      });
    } else {
      
      res.status(500).json({ message: 'Error al actualizar la contraseña' });
    }
  } catch (error) {
    
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

export const obtenerDetalleUsuario = async (req, res) => {
  try {
    const { rut } = req.params;
    
    const usuario = await UserModel.obtenerUsuarioCompleto(rut);
    
    if (usuario) {
      res.json(usuario);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ===== GESTIÓN DE PROFESORES =====
// Nota: La gestión de profesores ahora se realiza a través de la gestión de usuarios

export const obtenerPropuestasAsignadasAProfesor = async (req, res) => {
  try {
    const { rut } = req.params;
    const propuestas = await obtenerPropuestasPorProfesor(rut);
    res.json(propuestas);
  } catch (error) {
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const obtenerTodasLasAsignaciones = async (req, res) => {
  try {
    const asignaciones = await AdminModel.obtenerTodasLasAsignaciones();
    res.json(asignaciones);
  } catch (error) {
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const crearAsignacion = async (req, res) => {
  try {
    const { propuesta_id, profesor_rut } = req.body;
    const asignado_por = req.rut; // RUT del usuario autenticado que hace la asignación
    
    // Verificar que la propuesta existe
    const propuestaExiste = await AdminModel.verificarPropuestaExiste(propuesta_id);
    if (!propuestaExiste) {
      return res.status(404).json({ message: 'Propuesta no encontrada' });
    }
    
    // Verificar que el profesor existe
    const profesorExiste = await AdminModel.verificarProfesorExiste(profesor_rut);
    if (!profesorExiste) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }
    
    // Verificar que no existe ya una asignación
    const asignacionExiste = await AdminModel.verificarAsignacionExiste(propuesta_id, profesor_rut);
    if (asignacionExiste) {
      return res.status(409).json({ message: 'La asignación ya existe' });
    }
    
    // Crear la asignación
    await asignarProfesor(propuesta_id, profesor_rut, asignado_por);
    
    res.status(201).json({ message: 'Asignación creada correctamente' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const eliminarAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener información de la asignación antes de eliminarla
    const asignacion = await AdminModel.obtenerAsignacionPorId(id);
    
    if (!asignacion) {
      return res.status(404).json({ message: 'Asignación no encontrada' });
    }
    
    // Eliminar la asignación
    await desasignarProfesor(
      asignacion.propuesta_id, 
      asignacion.profesor_rut
    );
    
    res.json({ message: 'Asignación eliminada correctamente' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ===== ESTADÍSTICAS =====
export const obtenerEstadisticas = async (req, res) => {
  try {
    const { rol_id, carrera_id } = req.user || {};
    
    // Si es admin/jefe de carrera (rol 3), filtrar por su carrera
    // Si es super admin (rol 4), ver estadísticas globales
    const carreraFiltro = (rol_id === 3 && carrera_id) ? carrera_id : null;
    
    const estadisticas = await AdminModel.obtenerEstadisticasCompletas(carreraFiltro);
    
    console.log('📊 Estadísticas obtenidas:', estadisticas);
    
    res.json(estadisticas);
  } catch (error) {
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ===== CARGA ADMINISTRATIVA DE PROFESORES =====
import { obtenerCargaProfesores, obtenerEstadisticasCarga } from '../models/project.model.js';

/**
 * Obtener la carga administrativa de todos los profesores
 * Muestra cuántos proyectos tiene cada profesor por rol
 * Visible para todos los usuarios (admin, profesores, estudiantes)
 */
export const obtenerCargaAdministrativa = async (req, res) => {
  try {
    const { rol_id, carrera_id } = req.user || {};
    
    // Si es admin/jefe de carrera (rol 3), filtrar por su carrera
    // Si es super admin (rol 4), ver todos los profesores
    const carreraFiltro = (rol_id === 3 && carrera_id) ? carrera_id : null;
    
    // Obtener carga de profesores (filtrada si aplica)
    const cargaProfesores = await obtenerCargaProfesores(carreraFiltro);
    
    // Obtener estadísticas (filtradas si aplica)
    const estadisticas = await obtenerEstadisticasCarga(carreraFiltro);
    
    console.log(`📊 Carga académica obtenida: ${cargaProfesores.length} profesores`);
    
    res.json({
      profesores: cargaProfesores,
      estadisticas: estadisticas || {
        total_profesores: 0,
        total_proyectos_activos: 0,
        promedio_proyectos_profesor: 0,
        max_proyectos_profesor: 0,
        min_proyectos_profesor: 0
      }
    });
  } catch (error) {
    
    res.status(500).json({ 
      message: 'Error al obtener carga administrativa',
      error: error.message 
    });
  }
}; 