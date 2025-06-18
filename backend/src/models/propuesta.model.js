import { pool } from "../db/connectionDB.js";

export const crearPropuesta = async ({ titulo, descripcion, estudiante_rut, fecha_envio}) => {
  const [result] = await pool.execute(
    `INSERT INTO propuestas (titulo, descripcion, estudiante_rut, fecha_envio)
     VALUES (?, ?, ?, ?)`,
    [titulo, descripcion, estudiante_rut, fecha_envio]
  );
  return result.insertId;
};

export const actualizarPropuesta = async (id, { titulo, descripcion, fecha_envio }) => {
  const [result] = await pool.execute(
    `UPDATE propuestas SET titulo = ?, descripcion = ?, fecha_envio = ? WHERE id = ?`,
    [titulo, descripcion, fecha_envio, id]
  );
  return result.affectedRows > 0;
};

export const asignarProfesor = async (id, profesor_rut) => {
  const [result] = await pool.execute(
    `UPDATE propuestas SET profesor_rut = ? WHERE id = ?`,
    [profesor_rut, id]
  );
  return result.affectedRows > 0;
};

export const revisarPropuesta = async (id, { comentarios_profesor, estado }) => {
  const [result] = await pool.execute(
    `UPDATE propuestas SET comentarios_profesor = ?, estado = ?, fecha_revision = NOW() WHERE id = ?`,
    [comentarios_profesor, estado, id]
  );
  return result.affectedRows > 0;
};

export const obtenerPropuestas = async () => {
  const [rows] = await pool.execute(`SELECT * FROM propuestas`);
  return rows;
};

export const obtenerPropuestaPorId = async (id) => {
  const [rows] = await pool.execute(`SELECT * FROM propuestas WHERE id = ?`, [id]);
  return rows[0];
};

export const eliminarPropuesta = async (id) => {
  const [result] = await pool.execute(`DELETE FROM propuestas WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

export const obtenerPropuestasPorProfesor = async (profesor_rut) => {
  const [rows] = await pool.execute(
    `SELECT * FROM propuestas WHERE profesor_rut = ?`,
    [profesor_rut]
  );
  return rows;
};