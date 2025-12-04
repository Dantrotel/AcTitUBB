import * as documentoModel from '../models/documento.model.js';
import { pool } from '../db/connectionDB.js';
import path from 'path';
import fs from 'fs';

// Función auxiliar para verificar si el usuario tiene acceso al proyecto
const verificarAccesoProyecto = async (proyectoId, rut, rolId) => {
  try {
    // Admin y SuperAdmin tienen acceso a todo
    if (rolId === '3' || rolId === '4') return true;

    // Verificar si es estudiante del proyecto o profesor asignado
    const [rows] = await pool.execute(
      `SELECT p.id 
       FROM proyectos p
       LEFT JOIN asignaciones_proyectos a ON p.id = a.proyecto_id AND a.activo = TRUE
       WHERE p.id = ? AND (p.estudiante_rut = ? OR a.profesor_rut = ?)`,
      [proyectoId, rut, rut]
    );

    return rows.length > 0;
  } catch (error) {
    console.error('Error al verificar acceso:', error);
    return false;
  }
};

export const subirDocumento = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    const { tipo_documento, estado, comentarios } = req.body;
    const rut = req.user?.rut || req.rut;
    const rol_id = req.user?.role_id || req.rol_id;

    if (!req.file) {
      return res.status(400).json({ message: 'No se ha enviado ningún archivo' });
    }

    if (!tipo_documento) {
      return res.status(400).json({ message: 'El tipo de documento es requerido' });
    }

    // Verificar acceso al proyecto
    const tieneAcceso = await verificarAccesoProyecto(proyectoId, rut, String(rol_id));
    if (!tieneAcceso) {
      // Eliminar archivo subido si no tiene acceso
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: 'No tienes permiso para subir documentos a este proyecto' });
    }

    // Obtener la última versión del documento
    const ultimaVersion = await documentoModel.obtenerUltimaVersion(proyectoId, tipo_documento);
    const nuevaVersion = ultimaVersion + 1;

    const documentoData = {
      proyecto_id: proyectoId,
      tipo_documento,
      nombre_archivo: req.file.filename,
      nombre_original: req.file.originalname,
      ruta_archivo: req.file.path,
      tamanio_bytes: req.file.size,
      mime_type: req.file.mimetype,
      subido_por: rut,
      estado: estado || 'borrador',
      comentarios: comentarios || null
    };

    const documentoId = await documentoModel.subirDocumento(documentoData);

    res.status(201).json({
      message: 'Documento subido exitosamente',
      documentoId,
      version: nuevaVersion
    });
  } catch (error) {
    console.error('Error al subir documento:', error);
    res.status(500).json({ message: 'Error al subir el documento' });
  }
};

export const obtenerDocumentosProyecto = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    const { tipo_documento, estado } = req.query;
    const rut = req.user?.rut || req.rut;
    const rol_id = req.user?.role_id || req.rol_id;

    // Verificar acceso al proyecto
    const tieneAcceso = await verificarAccesoProyecto(proyectoId, rut, String(rol_id));
    if (!tieneAcceso) {
      return res.status(403).json({ message: 'No tienes permiso para ver los documentos de este proyecto' });
    }

    const filtros = {};
    if (tipo_documento) filtros.tipo_documento = tipo_documento;
    if (estado) filtros.estado = estado;

    const documentos = await documentoModel.obtenerDocumentosProyecto(proyectoId, filtros);

    res.json(documentos);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ message: 'Error al obtener los documentos' });
  }
};

export const obtenerDocumento = async (req, res) => {
  try {
    const { documentoId } = req.params;
    const rut = req.user?.rut || req.rut;
    const rol_id = req.user?.role_id || req.rol_id;

    const documento = await documentoModel.obtenerDocumento(documentoId);

    if (!documento) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    // Verificar acceso al proyecto del documento
    const tieneAcceso = await verificarAccesoProyecto(documento.proyecto_id, rut, String(rol_id));
    if (!tieneAcceso) {
      return res.status(403).json({ message: 'No tienes permiso para ver este documento' });
    }

    res.json(documento);
  } catch (error) {
    console.error('Error al obtener documento:', error);
    res.status(500).json({ message: 'Error al obtener el documento' });
  }
};

export const descargarDocumento = async (req, res) => {
  try {
    const { documentoId } = req.params;
    const rut = req.user?.rut || req.rut;
    const rol_id = req.user?.role_id || req.rol_id;

    const documento = await documentoModel.obtenerDocumento(documentoId);

    if (!documento) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    // Verificar acceso al proyecto del documento
    const tieneAcceso = await verificarAccesoProyecto(documento.proyecto_id, rut, String(rol_id));
    if (!tieneAcceso) {
      return res.status(403).json({ message: 'No tienes permiso para descargar este documento' });
    }

    const filePath = path.resolve(documento.ruta_archivo);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
    }

    res.download(filePath, documento.nombre_original);
  } catch (error) {
    console.error('Error al descargar documento:', error);
    res.status(500).json({ message: 'Error al descargar el documento' });
  }
};

export const actualizarEstadoDocumento = async (req, res) => {
  try {
    const { documentoId } = req.params;
    const { estado, comentarios } = req.body;
    const rut = req.user?.rut || req.rut;
    const rol_id = String(req.user?.role_id || req.rol_id);

    // Solo profesor (2) y admin (3) pueden cambiar estados
    if (rol_id !== '2' && rol_id !== '3') {
      return res.status(403).json({ message: 'No tienes permiso para cambiar el estado de documentos' });
    }

    if (!estado) {
      return res.status(400).json({ message: 'El estado es requerido' });
    }

    const estadosValidos = ['borrador', 'en_revision', 'aprobado', 'rechazado', 'archivado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    const documento = await documentoModel.obtenerDocumento(documentoId);
    if (!documento) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    // Verificar acceso al proyecto
    const tieneAcceso = await verificarAccesoProyecto(documento.proyecto_id, rut, rol_id);
    if (!tieneAcceso) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar este documento' });
    }

    const actualizado = await documentoModel.actualizarEstadoDocumento(documentoId, {
      estado,
      revisado_por: rut,
      comentarios: comentarios || null
    });

    if (!actualizado) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    res.json({ message: 'Estado actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ message: 'Error al actualizar el estado del documento' });
  }
};

export const eliminarDocumento = async (req, res) => {
  try {
    const { documentoId } = req.params;
    const rut = req.user?.rut || req.rut;
    const rol_id = String(req.user?.role_id || req.rol_id);

    const documento = await documentoModel.obtenerDocumento(documentoId);

    if (!documento) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    // Verificar permisos: Admin puede eliminar cualquiera, estudiante solo sus propios borradores
    if (rol_id === '1') {
      // Estudiante: solo puede eliminar sus documentos en borrador
      if (documento.subido_por !== rut) {
        return res.status(403).json({ message: 'No puedes eliminar documentos de otros usuarios' });
      }
      if (documento.estado !== 'borrador') {
        return res.status(403).json({ message: 'Solo puedes eliminar documentos en estado borrador' });
      }
    } else if (rol_id !== '3') {
      // Profesor no puede eliminar documentos
      return res.status(403).json({ message: 'No tienes permiso para eliminar documentos' });
    }

    // Admin (3) puede eliminar cualquier documento sin restricciones

    // Eliminar archivo físico
    const filePath = path.resolve(documento.ruta_archivo);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Eliminar registro de BD
    await documentoModel.eliminarDocumento(documentoId);

    res.json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ message: 'Error al eliminar el documento' });
  }
};

export const obtenerVersionesDocumento = async (req, res) => {
  try {
    const { proyectoId, tipoDocumento } = req.params;
    const rut = req.user?.rut || req.rut;
    const rol_id = req.user?.role_id || req.rol_id;

    // Verificar acceso al proyecto
    const tieneAcceso = await verificarAccesoProyecto(proyectoId, rut, String(rol_id));
    if (!tieneAcceso) {
      return res.status(403).json({ message: 'No tienes permiso para ver las versiones de este documento' });
    }

    const versiones = await documentoModel.obtenerVersionesDocumento(proyectoId, tipoDocumento);

    res.json(versiones);
  } catch (error) {
    console.error('Error al obtener versiones:', error);
    res.status(500).json({ message: 'Error al obtener las versiones del documento' });
  }
};
