// ========================================
// INTERFACES PARA SISTEMA UNIFICADO DE HITOS
// Compatible con backend/SISTEMA_HITOS_UNIFICADO.md
// ========================================

export interface Hito {
  id: number;
  cronograma_id: number;
  proyecto_id: number;
  nombre_hito: string;
  descripcion: string;
  tipo_hito: 'entrega_documento' | 'revision_avance' | 'reunion_seguimiento' | 'evaluacion' | 'defensa';
  fecha_limite: string;
  fecha_entrega: string | null;
  estado: 'pendiente' | 'en_progreso' | 'entregado' | 'revisado' | 'aprobado' | 'rechazado' | 'retrasado';
  porcentaje_avance: number;
  
  // 🆕 NUEVOS CAMPOS DEL SISTEMA UNIFICADO
  peso_en_proyecto: number;        // Peso porcentual (0-100%)
  es_critico: boolean;              // Hito crítico
  hito_predecesor_id: number | null; // Dependencia
  hito_predecesor_nombre?: string | null;
  creado_por_rut: string | null;
  creado_por_nombre?: string | null;
  actualizado_por_rut: string | null;
  actualizado_por_nombre?: string | null;
  
  // Archivos y retroalimentación
  archivo_entrega: string | null;
  nombre_archivo_original: string | null;
  comentarios_estudiante: string | null;
  comentarios_profesor: string | null;
  calificacion: number | null;
  
  // Control de cumplimiento
  cumplido_en_fecha: boolean | null;
  dias_retraso: number;
  
  // Estados calculados (del backend)
  estado_real?: string;
  dias_retraso_calculado?: number;
  
  created_at: string;
  updated_at: string;
  
  // 🔄 COMPATIBILIDAD CON CÓDIGO LEGACY
  nombre?: string;                  // Alias para nombre_hito
  fecha_inicio?: string;            // Para componentes que lo usan
  peso_porcentual?: number;         // Alias para peso_en_proyecto
  prioridad?: 'baja' | 'media' | 'alta' | 'critica'; // Calculado desde es_critico
  obligatorio?: boolean;            // Todos son obligatorios por defecto
  acepta_entregas?: boolean;        // Todos aceptan entregas
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
  nombre_hito: string;
  descripcion: string;
  tipo_hito: 'entrega_documento' | 'revision_avance' | 'reunion_seguimiento' | 'evaluacion' | 'defensa';
  fecha_limite: string;
  peso_en_proyecto?: number;        // Opcional, default 0
  es_critico?: boolean;              // Opcional, default false
  hito_predecesor_id?: number | null; // Opcional
  
  // 🔄 COMPATIBILIDAD (se mapean automáticamente)
  nombre?: string;                   // Se convierte a nombre_hito
  fecha_inicio?: string;             // Ignorado por el backend
  peso_porcentual?: number;          // Se convierte a peso_en_proyecto
  tipo?: 'entregable' | 'revision' | 'presentacion' | 'evaluacion'; // Se mapea a tipo_hito
}

export interface UpdateHitoRequest {
  nombre_hito?: string;
  descripcion?: string;
  fecha_limite?: string;
  peso_en_proyecto?: number;
  tipo_hito?: 'entrega_documento' | 'revision_avance' | 'reunion_seguimiento' | 'evaluacion' | 'defensa';
  estado?: 'pendiente' | 'en_progreso' | 'entregado' | 'revisado' | 'aprobado' | 'rechazado' | 'retrasado';
  es_critico?: boolean;
  hito_predecesor_id?: number | null;
  
  // 🔄 COMPATIBILIDAD
  nombre?: string;                   // Se convierte a nombre_hito
  peso_porcentual?: number;          // Se convierte a peso_en_proyecto
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

// ========================================
// VALIDACIONES Y CONSTANTES
// ========================================

export const HITO_CONSTRAINTS = {
  NOMBRE_MIN_LENGTH: 3,
  NOMBRE_MAX_LENGTH: 255,
  DESCRIPCION_MAX_LENGTH: 1000,
  PESO_MIN: 0,
  PESO_MAX: 100,
  MAX_ENTREGAS_MIN: 1,
  MAX_ENTREGAS_MAX: 10,
  TIPOS_PERMITIDOS: ['entrega_documento', 'revision_avance', 'reunion_seguimiento', 'evaluacion', 'defensa'] as const,
  // Tipos legacy (se mapean automáticamente)
  TIPOS_LEGACY: {
    'entregable': 'entrega_documento',
    'revision': 'revision_avance',
    'presentacion': 'evaluacion',
    'evaluacion': 'evaluacion'
  } as const
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

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

/**
 * Mapea tipo legacy a tipo del sistema unificado
 */
export function mapearTipoHito(tipoLegacy: string): string {
  const mapa: Record<string, string> = {
    'entregable': 'entrega_documento',
    'revision': 'revision_avance',
    'presentacion': 'evaluacion',
    'evaluacion': 'evaluacion',
    'documento': 'entrega_documento',
    'codigo': 'entrega_documento',
    'reunion': 'reunion_seguimiento'
  };
  return mapa[tipoLegacy] || 'entrega_documento';
}

/**
 * Mapea tipo del sistema unificado a tipo legacy (para UI)
 */
export function mapearTipoHitoLegacy(tipo: string): string {
  const mapa: Record<string, string> = {
    'entrega_documento': 'entregable',
    'revision_avance': 'revision',
    'reunion_seguimiento': 'reunion',
    'evaluacion': 'evaluacion',
    'defensa': 'evaluacion'
  };
  return mapa[tipo] || 'entregable';
}

/**
 * Calcula prioridad basado en es_critico y días restantes
 */
export function calcularPrioridad(hito: Hito): 'baja' | 'media' | 'alta' | 'critica' {
  if (hito.es_critico) return 'critica';
  
  const diasRestantes = Math.ceil((new Date(hito.fecha_limite).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  if (diasRestantes < 0) return 'critica';
  if (diasRestantes <= 3) return 'alta';
  if (diasRestantes <= 7) return 'media';
  return 'baja';
}

/**
 * Normaliza hito del backend para compatibilidad con componentes legacy
 */
export function normalizarHito(hito: any): Hito {
  return {
    ...hito,
    nombre: hito.nombre_hito || hito.nombre,
    peso_porcentual: hito.peso_en_proyecto || hito.peso_porcentual || 0,
    prioridad: calcularPrioridad(hito),
    obligatorio: true,
    acepta_entregas: true,
    fecha_inicio: hito.created_at
  };
}

// Funciones de validación
export function validarHito(hito: CreateHitoRequest | UpdateHitoRequest): string[] {
  const errores: string[] = [];

  const nombre = (hito as any).nombre_hito || (hito as any).nombre;
  if (nombre) {
    if (nombre.length < HITO_CONSTRAINTS.NOMBRE_MIN_LENGTH) {
      errores.push(`El nombre debe tener al menos ${HITO_CONSTRAINTS.NOMBRE_MIN_LENGTH} caracteres`);
    }
    if (nombre.length > HITO_CONSTRAINTS.NOMBRE_MAX_LENGTH) {
      errores.push(`El nombre no puede exceder ${HITO_CONSTRAINTS.NOMBRE_MAX_LENGTH} caracteres`);
    }
  }

  if ('descripcion' in hito && hito.descripcion && hito.descripcion.length > HITO_CONSTRAINTS.DESCRIPCION_MAX_LENGTH) {
    errores.push(`La descripción no puede exceder ${HITO_CONSTRAINTS.DESCRIPCION_MAX_LENGTH} caracteres`);
  }

  const peso = (hito as any).peso_en_proyecto || (hito as any).peso_porcentual;
  if (peso !== undefined) {
    if (peso < HITO_CONSTRAINTS.PESO_MIN || peso > HITO_CONSTRAINTS.PESO_MAX) {
      errores.push(`El peso debe estar entre ${HITO_CONSTRAINTS.PESO_MIN} y ${HITO_CONSTRAINTS.PESO_MAX}`);
    }
  }

  if ('fecha_limite' in hito && hito.fecha_limite) {
    const fechaLimite = new Date(hito.fecha_limite);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaLimite < hoy) {
      errores.push('La fecha límite no puede estar en el pasado');
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