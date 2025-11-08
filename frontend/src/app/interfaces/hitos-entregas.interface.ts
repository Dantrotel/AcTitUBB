// Interfaces para el sistema de hitos y entregas
export interface Hito {
  id: string;
  cronograma_id: string;
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_limite: string;
  peso_porcentual: number;
  tipo: 'entregable' | 'revision' | 'presentacion' | 'evaluacion';
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'retrasado' | 'cancelado';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  obligatorio: boolean;
  acepta_entregas: boolean;
  max_entregas_estudiante: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  creado_por: string;
  dependencias?: string[]; // IDs de hitos que deben completarse antes
}

export interface Entrega {
  id: string;
  hito_id: string;
  estudiante_rut: string;
  estudiante_nombre: string;
  archivo_nombre: string;
  archivo_url: string;
  archivo_tamano: number;
  comentarios: string;
  fecha_entrega: string;
  estado: 'entregado' | 'revisado' | 'aprobado' | 'rechazado' | 'reentrega_requerida';
  calificacion?: number;
  retroalimentacion?: string;
  fecha_revision?: string;
  revisado_por?: string;
  version: number;
  es_entrega_final: boolean;
}

export interface CriterioEvaluacion {
  id: string;
  hito_id: string;
  nombre: string;
  descripcion: string;
  peso_porcentual: number;
  puntaje_maximo: number;
  tipo: 'numerico' | 'cualitativo' | 'checkbox';
  opciones?: string[]; // Para criterios cualitativos
  requerido: boolean;
}

export interface EvaluacionHito {
  id: string;
  entrega_id: string;
  evaluador_rut: string;
  evaluador_nombre: string;
  criterios_evaluacion: {
    criterio_id: string;
    puntaje: number;
    comentario?: string;
  }[];
  puntaje_total: number;
  comentario_general: string;
  fecha_evaluacion: string;
  estado: 'borrador' | 'finalizada';
}

export interface CreateHitoRequest {
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_limite: string;
  peso_porcentual: number;
  tipo: Hito['tipo'];
  prioridad: Hito['prioridad'];
  obligatorio: boolean;
  acepta_entregas: boolean;
  max_entregas_estudiante: number;
  dependencias?: string[];
}

export interface UpdateHitoRequest {
  nombre?: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_limite?: string;
  peso_porcentual?: number;
  tipo?: Hito['tipo'];
  estado?: Hito['estado'];
  prioridad?: Hito['prioridad'];
  obligatorio?: boolean;
  acepta_entregas?: boolean;
  max_entregas_estudiante?: number;
  dependencias?: string[];
}

export interface CreateEntregaRequest {
  comentarios: string;
  es_entrega_final: boolean;
}

export interface RevisionEntregaRequest {
  estado: 'aprobado' | 'rechazado' | 'reentrega_requerida';
  calificacion?: number;
  retroalimentacion: string;
}

// Validaciones estrictas
export const HITO_CONSTRAINTS = {
  NOMBRE_MIN_LENGTH: 3,
  NOMBRE_MAX_LENGTH: 100,
  DESCRIPCION_MAX_LENGTH: 500,
  PESO_MIN: 0,
  PESO_MAX: 100,
  MAX_ENTREGAS_MIN: 1,
  MAX_ENTREGAS_MAX: 10,
  TIPOS_PERMITIDOS: ['entregable', 'revision', 'presentacion', 'evaluacion'] as const,
  PRIORIDADES_PERMITIDAS: ['baja', 'media', 'alta', 'critica'] as const
};

export const ENTREGA_CONSTRAINTS = {
  COMENTARIOS_MAX_LENGTH: 1000,
  ARCHIVO_MAX_SIZE: 50 * 1024 * 1024, // 50MB
  TIPOS_ARCHIVO_PERMITIDOS: ['.pdf', '.doc', '.docx', '.zip', '.rar', '.txt', '.jpg', '.png'],
  MAX_VERSIONES: 5
};

export const EVALUACION_CONSTRAINTS = {
  PUNTAJE_MIN: 0,
  PUNTAJE_MAX: 100,
  COMENTARIO_MAX_LENGTH: 2000,
  MIN_CRITERIOS: 1,
  MAX_CRITERIOS: 20
};

// Funciones de validación
export function validarHito(hito: CreateHitoRequest | UpdateHitoRequest): string[] {
  const errores: string[] = [];

  if ('nombre' in hito && hito.nombre) {
    if (hito.nombre.length < HITO_CONSTRAINTS.NOMBRE_MIN_LENGTH) {
      errores.push(`El nombre debe tener al menos ${HITO_CONSTRAINTS.NOMBRE_MIN_LENGTH} caracteres`);
    }
    if (hito.nombre.length > HITO_CONSTRAINTS.NOMBRE_MAX_LENGTH) {
      errores.push(`El nombre no puede exceder ${HITO_CONSTRAINTS.NOMBRE_MAX_LENGTH} caracteres`);
    }
  }

  if ('descripcion' in hito && hito.descripcion && hito.descripcion.length > HITO_CONSTRAINTS.DESCRIPCION_MAX_LENGTH) {
    errores.push(`La descripción no puede exceder ${HITO_CONSTRAINTS.DESCRIPCION_MAX_LENGTH} caracteres`);
  }

  if ('peso_porcentual' in hito && hito.peso_porcentual !== undefined) {
    if (hito.peso_porcentual < HITO_CONSTRAINTS.PESO_MIN || hito.peso_porcentual > HITO_CONSTRAINTS.PESO_MAX) {
      errores.push(`El peso porcentual debe estar entre ${HITO_CONSTRAINTS.PESO_MIN} y ${HITO_CONSTRAINTS.PESO_MAX}`);
    }
  }

  if ('fecha_inicio' in hito && 'fecha_limite' in hito && hito.fecha_inicio && hito.fecha_limite) {
    const fechaInicio = new Date(hito.fecha_inicio);
    const fechaLimite = new Date(hito.fecha_limite);
    if (fechaInicio >= fechaLimite) {
      errores.push('La fecha de inicio debe ser anterior a la fecha límite');
    }
  }

  if ('max_entregas_estudiante' in hito && hito.max_entregas_estudiante !== undefined) {
    if (hito.max_entregas_estudiante < HITO_CONSTRAINTS.MAX_ENTREGAS_MIN || 
        hito.max_entregas_estudiante > HITO_CONSTRAINTS.MAX_ENTREGAS_MAX) {
      errores.push(`El máximo de entregas debe estar entre ${HITO_CONSTRAINTS.MAX_ENTREGAS_MIN} y ${HITO_CONSTRAINTS.MAX_ENTREGAS_MAX}`);
    }
  }

  return errores;
}

export function validarEntrega(archivo: File, comentarios: string): string[] {
  const errores: string[] = [];

  if (archivo.size > ENTREGA_CONSTRAINTS.ARCHIVO_MAX_SIZE) {
    errores.push(`El archivo no puede exceder ${ENTREGA_CONSTRAINTS.ARCHIVO_MAX_SIZE / (1024 * 1024)}MB`);
  }

  const extension = '.' + archivo.name.split('.').pop()?.toLowerCase();
  if (!ENTREGA_CONSTRAINTS.TIPOS_ARCHIVO_PERMITIDOS.includes(extension)) {
    errores.push(`Tipo de archivo no permitido. Permitidos: ${ENTREGA_CONSTRAINTS.TIPOS_ARCHIVO_PERMITIDOS.join(', ')}`);
  }

  if (comentarios.length > ENTREGA_CONSTRAINTS.COMENTARIOS_MAX_LENGTH) {
    errores.push(`Los comentarios no pueden exceder ${ENTREGA_CONSTRAINTS.COMENTARIOS_MAX_LENGTH} caracteres`);
  }

  return errores;
}