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
    const usuarios = await UserModel.findpersonAll();
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const actualizarUsuario = async (req, res) => {
  try {
    const { rut } = req.params;
    const { nombre, email } = req.body;
    
    const actualizado = await UserModel.actualizarUsuario(rut, { nombre, email });
    
    if (actualizado) {
      res.json({ message: 'Usuario actualizado correctamente' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
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
    console.error('Error al eliminar usuario:', error);
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
    console.error('Error al cambiar estado del usuario:', error);
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
    console.error('Error al cambiar rol del usuario:', error);
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
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const resetearPasswordUsuario = async (req, res) => {
  try {
    console.log('🔑 RESET PASSWORD - Inicio del controlador');
    console.log('📋 req.params:', req.params);
    console.log('📋 req.body:', req.body);
    console.log('👤 req.user:', req.user);
    
    const { rut } = req.params;
    const { nueva_password } = req.body;
    
    console.log(`🔍 RUT extraído: ${rut}`);
    console.log(`🔍 Nueva password: ${nueva_password ? nueva_password.substring(0, 5) + '...' : 'UNDEFINED'}`);
    
    if (!nueva_password) {
      console.log('❌ Nueva password no proporcionada');
      return res.status(400).json({ message: 'La nueva contraseña es requerida' });
    }
    
    // Obtener datos del usuario
    const usuario = await UserModel.obtenerUsuarioCompleto(rut);
    if (!usuario) {
      console.log('❌ Usuario no encontrado');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // 🔐 HASHEAR LA CONTRASEÑA CON BCRYPT
    console.log('� Hasheando contraseña con bcrypt...');
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nueva_password, salt);
    console.log(`✅ Contraseña hasheada: ${hashedPassword.substring(0, 20)}...`);
    
    console.log('📞 Llamando a UserModel.resetearPassword...');
    const actualizado = await UserModel.resetearPassword(rut, hashedPassword);
    
    console.log(`✅ Resultado de actualización: ${actualizado}`);
    
    if (actualizado) {
      // 📧 Enviar email con contraseña temporal
      try {
        const { sendPasswordResetEmail } = await import('../services/email.service.js');
        console.log('📧 Enviando email con contraseña temporal...');
        await sendPasswordResetEmail(usuario.email, usuario.nombre, nueva_password, usuario.rut);
        console.log('✅ Email enviado exitosamente');
      } catch (emailError) {
        console.error('⚠️  Error al enviar email:', emailError);
        // No fallar la operación si el email falla
      }
      
      console.log('✅ Contraseña reseteada exitosamente');
      res.json({ 
        success: true,
        message: 'Contraseña reseteada correctamente. Se ha enviado un email al usuario.',
        password_temporal: nueva_password // Enviar la contraseña SIN HASHEAR al admin
      });
    } else {
      console.log('❌ Error al actualizar contraseña');
      res.status(500).json({ message: 'Error al actualizar la contraseña' });
    }
  } catch (error) {
    console.error('❌ Error al resetear contraseña:', error);
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
    console.error('Error al obtener detalle del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ===== GESTIÓN DE PROFESORES =====
export const obtenerTodosLosProfesores = async (req, res) => {
  try {
    const profesores = await UserModel.obtenerUsuariosPorRol('profesor');
    res.json(profesores);
  } catch (error) {
    console.error('Error al obtener profesores:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const obtenerPropuestasAsignadasAProfesor = async (req, res) => {
  try {
    const { rut } = req.params;
    const propuestas = await obtenerPropuestasPorProfesor(rut);
    res.json(propuestas);
  } catch (error) {
    console.error('Error al obtener propuestas del profesor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const obtenerTodasLasAsignaciones = async (req, res) => {
  try {
    const asignaciones = await AdminModel.obtenerTodasLasAsignaciones();
    res.json(asignaciones);
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const crearAsignacion = async (req, res) => {
  try {
    const { propuesta_id, profesor_rut } = req.body;
    
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
    await asignarProfesor(propuesta_id, profesor_rut);
    
    res.status(201).json({ message: 'Asignación creada correctamente' });
  } catch (error) {
    console.error('Error al crear asignación:', error);
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
    console.error('Error al eliminar asignación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ===== ESTADÍSTICAS =====
export const obtenerEstadisticas = async (req, res) => {
  try {
    const estadisticas = await AdminModel.obtenerEstadisticasCompletas();
    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}; 