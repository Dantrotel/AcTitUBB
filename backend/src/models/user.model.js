import { pool } from '../db/connectionDB.js';

const createPerson = async (rut, nombre, email, password) => {
    let nombreRol;
    if (email.endsWith('@alumnos.ubiobio.cl')) {
        nombreRol = 'estudiante';
    } else if (email.endsWith('@ubiobio.cl')) {
        nombreRol = 'profesor';
    } else {
        throw new Error('Email no pertenece a la organización');
    }

    const [roles] = await pool.execute(
        `SELECT id FROM roles WHERE nombre = ?`,
        [nombreRol]
    );

    if (roles.length === 0) {
        throw new Error(`Rol ${nombreRol} no encontrado`);
    }

    const rol_id = roles[0].id;

    const [result] = await pool.execute(
        `INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [rut, nombre, email, password, rol_id, false]
        );
        return { email, nombre, rol_id };
};

const findPersonByEmail = async (email) => {
    const [rows] = await pool.execute(
        `SELECT u.rut, u.nombre, u.email, u.password, u.rol_id, u.confirmado, u.debe_cambiar_password, r.nombre as rol_nombre
         FROM usuarios u
         LEFT JOIN roles r ON u.rol_id = r.id
         WHERE u.email = ?`,
        [email]
    );
    return rows[0];
};

const findPersonByRut = async (rut) => {
    const [rows] = await pool.execute(
        `SELECT u.rut, u.nombre, u.email, u.password, u.rol_id, u.confirmado, u.debe_cambiar_password, r.nombre as rol_nombre
         FROM usuarios u
         LEFT JOIN roles r ON u.rol_id = r.id
         WHERE u.rut = ?`,
        [rut]
    );
    return rows[0];
};

const findpersonAll = async () => {
    const [rows] = await pool.execute(`
        SELECT 
            u.rut, 
            u.nombre, 
            u.email, 
            u.confirmado, 
            u.rol_id,
            r.nombre as rol_nombre,
            ec.carrera_id,
            c.nombre as carrera_nombre,
            c.codigo as carrera_codigo,
            pd.departamento_id,
            d.nombre as departamento_nombre,
            d.codigo as departamento_codigo
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        LEFT JOIN estudiantes_carreras ec ON u.rut = ec.estudiante_rut AND ec.es_carrera_principal = TRUE
        LEFT JOIN carreras c ON ec.carrera_id = c.id
        LEFT JOIN profesores_departamentos pd ON u.rut = pd.profesor_rut AND pd.es_principal = TRUE AND pd.activo = TRUE
        LEFT JOIN departamentos d ON pd.departamento_id = d.id
        ORDER BY u.nombre
    `);
    return rows;
};

const confirmarCuentaPorEmail = async (email) =>{
  const query = 'UPDATE usuarios SET confirmado = 1 WHERE email = ?';
  const [result] = await pool.execute(query, [email]);
  return result;
}

const obtenerUsuariosPorRol = async (rolNombre) => {
    const [rows] = await pool.execute(`
        SELECT u.rut, u.nombre, u.email, u.rol_id, u.confirmado
        FROM usuarios u
        INNER JOIN roles r ON u.rol_id = r.id
        WHERE r.nombre = ?
        ORDER BY u.nombre
    `, [rolNombre]);
    return rows;
};

const obtenerUsuariosPorCarrera = async (carreraId) => {
    
    
    const [rows] = await pool.execute(`
        SELECT DISTINCT 
            u.rut, 
            u.nombre, 
            u.email, 
            u.confirmado, 
            u.rol_id,
            r.nombre as rol_nombre,
            ec.carrera_id,
            c.nombre as carrera_nombre,
            c.codigo as carrera_codigo,
            pd.departamento_id,
            d.nombre as departamento_nombre,
            d.codigo as departamento_codigo
        FROM usuarios u
        INNER JOIN roles r ON u.rol_id = r.id
        LEFT JOIN estudiantes_carreras ec ON u.rut = ec.estudiante_rut AND ec.es_carrera_principal = TRUE
        LEFT JOIN carreras c ON ec.carrera_id = c.id
        LEFT JOIN profesores_departamentos pd ON u.rut = pd.profesor_rut AND pd.es_principal = TRUE AND pd.activo = TRUE
        LEFT JOIN departamentos d ON pd.departamento_id = d.id
        WHERE u.rol_id IN (1, 2)  -- Solo estudiantes (1) y profesores (2)
        AND (
            -- Estudiantes de la carrera
            (u.rol_id = 1 AND ec.carrera_id = ?)
            OR
            -- Profesores cuyos departamentos están asociados a esta carrera (relación directa)
            (u.rol_id = 2 AND pd.departamento_id IN (
                SELECT departamento_id 
                FROM departamentos_carreras 
                WHERE carrera_id = ? AND activo = TRUE
            ))
        )
        ORDER BY u.nombre
    `, [carreraId, carreraId]);
    
    
    return rows;
};

const obtenerUsuariosPorCarreras = async (carreraIds) => {
    console.log(`🎓 Buscando usuarios por carreras: ${JSON.stringify(carreraIds)}`);
    
    if (!carreraIds || carreraIds.length === 0) {
        return [];
    }
    
    const placeholders = carreraIds.map(() => '?').join(',');
    
    const [rows] = await pool.execute(`
        SELECT DISTINCT 
            u.rut, 
            u.nombre, 
            u.email, 
            u.confirmado, 
            u.rol_id,
            r.nombre as rol_nombre,
            ec.carrera_id,
            c.nombre as carrera_nombre,
            c.codigo as carrera_codigo,
            pd.departamento_id,
            d.nombre as departamento_nombre,
            d.codigo as departamento_codigo
        FROM usuarios u
        INNER JOIN roles r ON u.rol_id = r.id
        LEFT JOIN estudiantes_carreras ec ON u.rut = ec.estudiante_rut AND ec.es_carrera_principal = TRUE
        LEFT JOIN carreras c ON ec.carrera_id = c.id
        LEFT JOIN profesores_departamentos pd ON u.rut = pd.profesor_rut AND pd.es_principal = TRUE AND pd.activo = TRUE
        LEFT JOIN departamentos d ON pd.departamento_id = d.id
        WHERE u.rol_id IN (1, 2)  -- Solo estudiantes (1) y profesores (2)
        AND (
            -- Estudiantes de alguna de las carreras
            (u.rol_id = 1 AND ec.carrera_id IN (${placeholders}))
            OR
            -- Profesores cuyos departamentos están asociados a alguna de estas carreras
            (u.rol_id = 2 AND pd.departamento_id IN (
                SELECT departamento_id 
                FROM departamentos_carreras 
                WHERE carrera_id IN (${placeholders}) AND activo = TRUE
            ))
        )
        ORDER BY u.nombre
    `, [...carreraIds, ...carreraIds]);
    
    
    return rows;
};

const actualizarUsuario = async (rut, datos) => {
    const { nombre, email, departamento_id, carrera_id, password } = datos;
    
    // Construir la consulta dinámicamente según los campos proporcionados
    const campos = [];
    const valores = [];
    
    if (nombre !== undefined) {
        campos.push('nombre = ?');
        valores.push(nombre);
    }
    if (email !== undefined) {
        campos.push('email = ?');
        valores.push(email);
    }
    if (password !== undefined) {
        campos.push('password = ?');
        valores.push(password);
    }
    
    // Siempre actualizar updated_at
    campos.push('updated_at = NOW()');
    
    // Agregar rut al final para el WHERE
    valores.push(rut);
    
    const query = `UPDATE usuarios SET ${campos.join(', ')} WHERE rut = ?`;
    const [result] = await pool.execute(query, valores);
    
    // Actualizar carrera si es estudiante (tabla estudiantes_carreras)
    if (carrera_id !== undefined) {
        // Primero verificar si ya existe una relación
        const [existing] = await pool.execute(
            'SELECT id FROM estudiantes_carreras WHERE estudiante_rut = ? AND es_carrera_principal = TRUE',
            [rut]
        );
        
        if (existing.length > 0) {
            // Actualizar la carrera existente
            await pool.execute(
                'UPDATE estudiantes_carreras SET carrera_id = ?, updated_at = NOW() WHERE estudiante_rut = ? AND es_carrera_principal = TRUE',
                [carrera_id, rut]
            );
        } else if (carrera_id !== null) {
            // Crear nueva relación
            await pool.execute(
                'INSERT INTO estudiantes_carreras (estudiante_rut, carrera_id, ano_ingreso, fecha_ingreso, es_carrera_principal) VALUES (?, ?, YEAR(NOW()), NOW(), TRUE)',
                [rut, carrera_id]
            );
        }
    }
    
    // Actualizar departamento si es profesor (tabla profesores_departamentos)
    if (departamento_id !== undefined) {
        // Primero desactivar todos los departamentos actuales
        await pool.execute(
            'UPDATE profesores_departamentos SET activo = FALSE WHERE profesor_rut = ?',
            [rut]
        );
        
        if (departamento_id !== null) {
            // Verificar si ya existe la relación
            const [existing] = await pool.execute(
                'SELECT id FROM profesores_departamentos WHERE profesor_rut = ? AND departamento_id = ?',
                [rut, departamento_id]
            );
            
            if (existing.length > 0) {
                // Reactivar la relación existente
                await pool.execute(
                    'UPDATE profesores_departamentos SET activo = TRUE, es_principal = TRUE WHERE profesor_rut = ? AND departamento_id = ?',
                    [rut, departamento_id]
    );
            } else {
                // Crear nueva relación
                await pool.execute(
                    'INSERT INTO profesores_departamentos (profesor_rut, departamento_id, es_principal, activo, fecha_ingreso) VALUES (?, ?, TRUE, TRUE, NOW())',
                    [rut, departamento_id]
                );
            }
        }
    }
    
    return result.affectedRows > 0;
};

const eliminarUsuario = async (rut) => {
    const [result] = await pool.execute(
        `DELETE FROM usuarios WHERE rut = ?`,
        [rut]
    );
    return result.affectedRows > 0;
};

// Cambiar estado de usuario (activar/desactivar)
const cambiarEstadoUsuario = async (rut, confirmado) => {
    const [result] = await pool.execute(
        `UPDATE usuarios SET confirmado = ?, updated_at = NOW() WHERE rut = ?`,
        [confirmado ? 1 : 0, rut]
    );
    return result.affectedRows > 0;
};

// Cambiar rol de usuario
const cambiarRolUsuario = async (rut, rol_id) => {
    const [result] = await pool.execute(
        `UPDATE usuarios SET rol_id = ?, updated_at = NOW() WHERE rut = ?`,
        [rol_id, rut]
    );
    return result.affectedRows > 0;
};

// Crear usuario desde admin (con todos los campos)
const crearUsuarioAdmin = async ({ rut, nombre, email, password, rol_id, confirmado = true }) => {
    const [result] = await pool.execute(
        `INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [rut, nombre, email, password, rol_id, confirmado ? 1 : 0]
    );
    return result.insertId;
};

// Resetear contraseña (generar contraseña temporal)
const resetearPassword = async (rut, nuevaPassword) => {
    const [result] = await pool.execute(
        `UPDATE usuarios SET password = ?, debe_cambiar_password = TRUE, updated_at = NOW() WHERE rut = ?`,
        [nuevaPassword, rut]
    );
    return result.affectedRows > 0;
};

// Cambiar contraseña del usuario (después del primer login con password temporal)
const cambiarPasswordPropia = async (rut, nuevaPassword) => {
    const [result] = await pool.execute(
        `UPDATE usuarios SET password = ?, debe_cambiar_password = FALSE, updated_at = NOW() WHERE rut = ?`,
        [nuevaPassword, rut]
    );
    return result.affectedRows > 0;
};

// Obtener usuario completo por RUT (con más detalles)
const obtenerUsuarioCompleto = async (rut) => {
    const [rows] = await pool.execute(
        `SELECT 
            u.rut, 
            u.nombre, 
            u.email, 
            u.rol_id, 
            u.confirmado, 
            u.created_at,
            u.updated_at,
            r.nombre as rol_nombre
         FROM usuarios u
         LEFT JOIN roles r ON u.rol_id = r.id
         WHERE u.rut = ?`,
        [rut]
    );
    return rows[0];
};

// Buscar usuario básico por email para forgot password (sin password)
const findUserBasicByEmail = async (email) => {
    const [rows] = await pool.execute(
        `SELECT u.rut, u.nombre, u.email, u.rol_id, u.confirmado
         FROM usuarios u
         WHERE u.email = ?`,
        [email]
    );
    return rows[0];
};

export const UserModel = {
    createPerson,
    findPersonByEmail,
    findPersonByRut,
    findpersonAll,
    confirmarCuentaPorEmail,
    obtenerUsuariosPorRol,
    obtenerUsuariosPorCarrera,
    actualizarUsuario,
    eliminarUsuario,
    cambiarEstadoUsuario,
    cambiarRolUsuario,
    crearUsuarioAdmin,
    resetearPassword,
    cambiarPasswordPropia,
    obtenerUsuarioCompleto,
    findUserBasicByEmail,
    obtenerUsuariosPorCarreras
};
