// Sprint 1: Validadores centralizados con Joi
import Joi from 'joi';
import logger from '../config/logger.js';

/**
 * Middleware genérico de validación
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Retornar todos los errores
      stripUnknown: true // Remover campos no definidos
    });

    if (error) {
      const errores = error.details.map(detail => ({
        campo: detail.path.join('.'),
        mensaje: detail.message
      }));

      logger.warn('Validación fallida', { 
        ruta: req.path,
        errores 
      });

      return res.status(400).json({
        message: 'Errores de validación',
        errores
      });
    }

    // Reemplazar con valores validados y sanitizados
    req[property] = value;
    next();
  };
};

/**
 * Schema: Registro de usuario
 */
export const registerSchema = Joi.object({
  rut: Joi.string()
    .pattern(/^\d{7,8}-[0-9kK]{1}$/)
    .required()
    .messages({
      'string.pattern.base': 'RUT debe tener formato válido (ej: 12345678-9)',
      'any.required': 'RUT es requerido'
    }),
  nombre: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nombre debe tener al menos 3 caracteres',
      'string.max': 'Nombre no puede exceder 100 caracteres'
    }),
  email: Joi.string()
    .email()
    .pattern(/@(alumnos\.)?ubiobio\.cl$/)
    .required()
    .messages({
      'string.email': 'Email debe ser válido',
      'string.pattern.base': 'Email debe ser institucional (@ubiobio.cl o @alumnos.ubiobio.cl)'
    }),
  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.min': 'Contraseña debe tener al menos 6 caracteres'
    })
});

/**
 * Schema: Login
 */
export const loginSchema = Joi.object({
  rut: Joi.string()
    .pattern(/^\d{7,8}-[0-9kK]{1}$/)
    .optional(),
  email: Joi.string()
    .email()
    .optional(),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Contraseña es requerida'
    })
})
.or('rut', 'email')
.messages({
  'object.missing': 'Debe proporcionar RUT o Email'
});

/**
 * Schema: Crear propuesta
 */
export const crearPropuestaSchema = Joi.object({
  titulo: Joi.string()
    .min(10)
    .max(200)
    .required()
    .messages({
      'string.min': 'Título debe tener al menos 10 caracteres',
      'string.max': 'Título no puede exceder 200 caracteres'
    }),
  descripcion: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Descripción debe tener al menos 10 caracteres',
      'any.required': 'descripcion es requerida'
    }),
  fecha_envio: Joi.date()
    .required()
    .messages({
      'any.required': 'fecha_envio es requerida'
    }),
  modalidad: Joi.string()
    .valid('desarrollo_software', 'investigacion')
    .required()
    .messages({
      'any.only': 'modalidad debe ser "desarrollo_software" o "investigacion"',
      'any.required': 'modalidad es requerida'
    }),
  area_tematica: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Área temática debe tener al menos 3 caracteres',
      'any.required': 'area_tematica es requerida'
    }),
  objetivos_generales: Joi.string()
    .min(50)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Objetivos generales deben tener al menos 50 caracteres'
    }),
  objetivos_especificos: Joi.string()
    .min(50)
    .max(2000)
    .required(),
  metodologia_propuesta: Joi.string()
    .min(50)
    .max(3000)
    .required(),
  resultados_esperados: Joi.string()
    .max(2000)
    .optional()
    .allow('', null),
  complejidad_estimada: Joi.string()
    .valid('baja', 'media', 'alta')
    .required(),
  numero_estudiantes: Joi.number()
    .integer()
    .min(1)
    .max(3)
    .required(),
  estudiantes_adicionales: Joi.alternatives()
    .try(
      Joi.array()
        .items(Joi.string().pattern(/^\d{7,8}-[0-9kK]{1}$/))
        .max(2),
      Joi.string().allow('', null)
    )
    .optional()
    .messages({
      'array.max': 'Máximo 2 estudiantes adicionales',
      'string.pattern.base': 'Cada RUT debe tener formato válido (ej: 12345678-9)'
    }),
  justificacion_complejidad: Joi.string()
    .when('numero_estudiantes', {
      is: 2,
      then: Joi.when('complejidad_estimada', {
        is: 'baja',
        then: Joi.string().min(100).required()
          .messages({
            'any.required': 'Justificación es requerida para 2 estudiantes con complejidad baja',
            'string.min': 'Justificación debe tener al menos 100 caracteres'
          }),
        otherwise: Joi.optional().allow('', null)
      }),
      otherwise: Joi.optional().allow('', null)
    }),
  duracion_estimada_semestres: Joi.number()
    .integer()
    .min(1)
    .max(4)
    .required(),
  profesor_guia_rut: Joi.string()
    .pattern(/^\d{7,8}-[0-9kK]{1}$/)
    .optional()
    .allow('', null),
  palabras_clave: Joi.string()
    .max(500)
    .optional()
    .allow('', null),
  referencias_bibliograficas: Joi.string()
    .max(2000)
    .optional()
    .allow('', null),
  recursos_necesarios: Joi.string()
    .max(2000)
    .optional()
    .allow('', null),
  bibliografia: Joi.string()
    .max(2000)
    .optional()
    .allow('', null)
});

/**
 * Schema: Actualizar propuesta (sin fecha_envio que no debe cambiar)
 */
export const actualizarPropuestaSchema = Joi.object({
  titulo: Joi.string()
    .min(10)
    .max(200)
    .required()
    .messages({
      'string.min': 'Título debe tener al menos 10 caracteres',
      'string.max': 'Título no puede exceder 200 caracteres'
    }),
  descripcion: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Descripción debe tener al menos 10 caracteres',
      'any.required': 'descripcion es requerida'
    }),
  modalidad: Joi.string()
    .valid('desarrollo_software', 'investigacion')
    .required()
    .messages({
      'any.only': 'modalidad debe ser "desarrollo_software" o "investigacion"',
      'any.required': 'modalidad es requerida'
    }),
  area_tematica: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Área temática debe tener al menos 3 caracteres',
      'any.required': 'area_tematica es requerida'
    }),
  objetivos_generales: Joi.string()
    .min(50)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Objetivos generales deben tener al menos 50 caracteres'
    }),
  objetivos_especificos: Joi.string()
    .min(50)
    .max(2000)
    .required(),
  metodologia_propuesta: Joi.string()
    .min(50)
    .max(3000)
    .required(),
  complejidad_estimada: Joi.string()
    .valid('baja', 'media', 'alta')
    .required(),
  numero_estudiantes: Joi.number()
    .integer()
    .min(1)
    .max(3)
    .required(),
  estudiantes_adicionales: Joi.alternatives()
    .try(
      Joi.array()
        .items(Joi.string().pattern(/^\d{7,8}-[0-9kK]{1}$/))
        .max(2),
      Joi.string().allow('', null)
    )
    .optional()
    .messages({
      'array.max': 'Máximo 2 estudiantes adicionales',
      'string.pattern.base': 'Cada RUT debe tener formato válido (ej: 12345678-9)'
    }),
  justificacion_complejidad: Joi.string()
    .when('numero_estudiantes', {
      is: 2,
      then: Joi.when('complejidad_estimada', {
        is: 'baja',
        then: Joi.string().min(100).required()
          .messages({
            'any.required': 'Justificación es requerida para 2 estudiantes con complejidad baja',
            'string.min': 'Justificación debe tener al menos 100 caracteres'
          }),
        otherwise: Joi.optional().allow('', null)
      }),
      otherwise: Joi.optional().allow('', null)
    }),
  duracion_estimada_semestres: Joi.number()
    .integer()
    .min(1)
    .max(4)
    .required(),
  recursos_necesarios: Joi.string()
    .max(2000)
    .optional()
    .allow('', null),
  bibliografia: Joi.string()
    .max(2000)
    .optional()
    .allow('', null)
});

/**
 * Schema: Revisar propuesta
 */
export const revisarPropuestaSchema = Joi.object({
  comentarios_profesor: Joi.string()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Comentarios deben tener al menos 10 caracteres',
      'any.required': 'Comentarios son requeridos'
    }),
  estado: Joi.string()
    .valid('pendiente', 'en_revision', 'correcciones', 'aprobada', 'rechazada')
    .required()
    .messages({
      'any.only': 'Estado debe ser: pendiente, en_revision, correcciones, aprobada o rechazada'
    })
});

/**
 * Schema: Asignación de profesor
 */
export const asignacionProfesorSchema = Joi.object({
  proyecto_id: Joi.number()
    .integer()
    .positive()
    .required(),
  profesor_rut: Joi.string()
    .pattern(/^\d{7,8}-[0-9kK]{1}$/)
    .required(),
  rol_profesor_id: Joi.number()
    .integer()
    .positive()
    .required()
});

// Schema para asignar profesor a propuesta (el id viene en params, no en body)
export const asignarProfesorSchema = Joi.object({
  profesor_rut: Joi.string()
    .pattern(/^\d{7,8}-[0-9kK]{1}$/)
    .optional() // Opcional porque puede venir del token de sesión (req.rut)
});

/**
 * Schema: Crear proyecto
 */
export const crearProyectoSchema = Joi.object({
  propuesta_id: Joi.number()
    .integer()
    .positive()
    .required(),
  nombre_proyecto: Joi.string()
    .min(10)
    .max(200)
    .optional(),
  descripcion: Joi.string()
    .min(50)
    .max(3000)
    .optional()
});

/**
 * Schema: Disponibilidad calendario
 */
export const disponibilidadSchema = Joi.object({
  fecha: Joi.date()
    .iso()
    .min('now')
    .required()
    .messages({
      'date.min': 'Fecha debe ser futura'
    }),
  hora_inicio: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      'string.pattern.base': 'Hora inicio debe tener formato HH:mm'
    }),
  hora_fin: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      'string.pattern.base': 'Hora fin debe tener formato HH:mm'
    }),
  proyecto_id: Joi.number()
    .integer()
    .positive()
    .optional()
}).custom((value, helpers) => {
  // Validar que hora_fin > hora_inicio
  if (value.hora_inicio >= value.hora_fin) {
    return helpers.error('any.invalid', {
      message: 'Hora fin debe ser posterior a hora inicio'
    });
  }
  return value;
});

/**
 * Schema: Solicitud de reunión
 */
export const solicitudReunionSchema = Joi.object({
  profesor_rut: Joi.string()
    .pattern(/^\d{7,8}-[0-9kK]{1}$/)
    .required(),
  proyecto_id: Joi.number()
    .integer()
    .positive()
    .required(),
  motivo: Joi.string()
    .min(10)
    .max(500)
    .required(),
  fecha_propuesta: Joi.date()
    .iso()
    .min('now')
    .optional(),
  hora_inicio: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .when('fecha_propuesta', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  hora_fin: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .when('fecha_propuesta', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional()
    })
});

/**
 * Schema: Cambiar contraseña
 */
export const cambiarPasswordSchema = Joi.object({
  password_actual: Joi.string()
    .required(),
  password_nueva: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nueva contraseña debe tener al menos 6 caracteres'
    })
}).custom((value, helpers) => {
  if (value.password_actual === value.password_nueva) {
    return helpers.error('any.invalid', {
      message: 'Nueva contraseña debe ser diferente a la actual'
    });
  }
  return value;
});

/**
 * Schema: Actualizar perfil
 */
export const actualizarPerfilSchema = Joi.object({
  nombre: Joi.string()
    .min(3)
    .max(100)
    .optional(),
  email: Joi.string()
    .email()
    .pattern(/@(alumnos\.)?ubiobio\.cl$/)
    .optional(),
  telefono: Joi.string()
    .pattern(/^\+?[0-9]{8,15}$/)
    .optional()
    .allow('', null),
  carrera: Joi.string()
    .max(100)
    .optional()
    .allow('', null),
  matricula: Joi.string()
    .max(20)
    .optional()
    .allow('', null)
});

export default {
  validate,
  registerSchema,
  loginSchema,
  crearPropuestaSchema,
  revisarPropuestaSchema,
  asignacionProfesorSchema,
  crearProyectoSchema,
  disponibilidadSchema,
  solicitudReunionSchema,
  cambiarPasswordSchema,
  actualizarPerfilSchema
};
