// ========================================
// INTERFACES PARA ESTRUCTURA ACADÉMICA
// ========================================

export interface Facultad {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  telefono?: string;
  email?: string;
  ubicacion?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Departamento {
  id: number;
  facultad_id: number;
  facultad_nombre?: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  jefe_departamento_rut?: string;
  jefe_nombre?: string;
  jefe_email?: string;
  telefono?: string;
  email?: string;
  ubicacion?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Carrera {
  id: number;
  facultad_id: number;
  facultad_nombre?: string;
  facultad_codigo?: string;
  nombre: string;
  codigo: string;
  titulo_profesional: string;
  grado_academico?: string;
  duracion_semestres: number;
  jefe_carrera_rut?: string;
  jefe_carrera_nombre?: string;
  jefe_carrera_email?: string;
  descripcion?: string;
  modalidad: 'presencial' | 'semipresencial' | 'online';
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProfesorDepartamento {
  id?: number;
  profesor_rut: string;
  departamento_id: number;
  es_principal: boolean;
  fecha_ingreso?: string;
  fecha_salida?: string;
  activo: boolean;
  // Datos adicionales del profesor
  nombre?: string;
  email?: string;
}

export interface EstudianteCarrera {
  id?: number;
  estudiante_rut: string;
  carrera_id: number;
  ano_ingreso: number;
  semestre_actual: number;
  estado_estudiante: 'regular' | 'congelado' | 'egresado' | 'retirado' | 'titulado';
  fecha_ingreso: string;
  fecha_egreso?: string;
  fecha_titulacion?: string;
  promedio_acumulado?: number;
  creditos_aprobados: number;
  es_carrera_principal: boolean;
  observaciones?: string;
  // Datos adicionales del estudiante
  nombre?: string;
  email?: string;
}

export interface AprobacionJefeCarrera {
  id?: number;
  propuesta_id: number;
  jefe_carrera_rut: string;
  carrera_id: number;
  estado_aprobacion: 'pendiente' | 'aprobada' | 'rechazada' | 'observaciones';
  comentarios?: string;
  fecha_revision?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EstadisticasFacultad {
  id: number;
  nombre: string;
  codigo: string;
  total_departamentos: number;
  total_carreras: number;
  total_profesores: number;
  total_estudiantes: number;
}

export interface EstadisticasDepartamento {
  id: number;
  nombre: string;
  codigo: string;
  total_profesores: number;
  carreras_relacionadas: number;
}

export interface EstadisticasCarrera {
  id: number;
  nombre: string;
  codigo: string;
  total_estudiantes: number;
  estudiantes_activos: number;
  egresados: number;
  titulados: number;
  total_propuestas: number;
  total_proyectos: number;
}

// Usuario extendido con campos de jerarquía académica
export interface UsuarioExtendido {
  rut: string;
  nombre: string;
  email: string;
  rol_id: number;
  rol_nombre?: string;
  es_jefe_carrera?: boolean;
  carrera_administrada_id?: number;
  carrera_administrada_nombre?: string;
  es_super_admin?: boolean;
  confirmado?: boolean;
  debe_cambiar_password?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface FacultadesResponse {
  success: boolean;
  facultades: Facultad[];
}

export interface DepartamentosResponse {
  success: boolean;
  departamentos: Departamento[];
}

export interface CarrerasResponse {
  success: boolean;
  carreras: Carrera[];
}

export interface ProfesoresResponse {
  success: boolean;
  profesores: ProfesorDepartamento[];
}

export interface EstudiantesResponse {
  success: boolean;
  estudiantes: EstudianteCarrera[];
}
