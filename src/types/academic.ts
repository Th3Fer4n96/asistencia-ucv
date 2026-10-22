export type AttendanceStatus = 'presente' | 'tardanza' | 'falta' | 'justificado' | 'pendiente';

export type WeekStatus = 'programada' | 'pendiente' | 'en_curso' | 'finalizada' | 'cancelada';

export type UserRole = 'docente' | 'alumno' | 'admin';

export interface User {
  id: string;
  codigo: string; // e.g. UCV code or DNI
  nombre: string;
  apellidos: string;
  email: string;
  rol: UserRole;
  avatarUrl?: string;
  telefono?: string;
  carreraId?: string;
}

export interface Career {
  id: string;
  codigo: string; // e.g. "ING-SIS", "MED-HUM", "DER-UCV"
  nombre: string; // e.g. "Ingeniería de Sistemas"
  facultad: string;
  campus: string;
  descripcion: string;
  activo: boolean;
  creado_en: string;
}

export interface Course {
  id: string;
  career_id: string;
  codigo: string; // e.g. "BD-401"
  nombre: string; // e.g. "Base de Datos"
  ciclo: number; // 1 to 10
  creditos: number;
  descripcion: string;
  activo: boolean;
  creado_en: string;
}

export interface Section {
  id: string;
  course_id: string;
  codigo: string; // e.g. "A1", "B2"
  nombre: string;
  periodo_academico: string; // e.g. "2026-I"
  activo: boolean;
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  section_id: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  section_id: string;
  estado: 'matriculado' | 'retirado' | 'inhabilitado';
  matriculado_en: string;
}

export interface AcademicUnit {
  id: string;
  course_id: string;
  numero_unidad: 1 | 2 | 3;
  nombre: string; // e.g. "Unidad 1: Fundamentos y Diseño Relacional"
  competencia?: string;
}

export interface AcademicWeek {
  id: string;
  academic_unit_id: string;
  numero_semana: number; // 1 to 15
  numero_unidad: 1 | 2 | 3;
  tema: string; // e.g. "Normalización y Álgebra Relacional"
  fecha_clase: string; // YYYY-MM-DD
  hora_inicio: string; // HH:mm (e.g. "08:00")
  hora_fin: string; // HH:mm (e.g. "10:30")
  tolerancia_minutos: number; // e.g. 15 min
  estado: WeekStatus;
  sesion_activa_id?: string;
}

export interface AttendanceSession {
  id: string;
  academic_week_id: string;
  section_id: string;
  docente_id: string;
  iniciada_en: string;
  finalizada_en?: string;
  estado: 'en_curso' | 'finalizada' | 'cancelada';
  codigo_qr_actual?: string;
  qr_expira_en?: string; // ISO string
  qr_token?: string;
}

export interface AttendanceRecord {
  id: string;
  attendance_session_id: string;
  student_id: string;
  academic_week_id: string;
  estado: AttendanceStatus;
  registrado_en: string;
  metodo_registro: 'qr_scanner' | 'manual_docente' | 'justificado';
  observacion?: string;
  ip_or_device?: string;
}

export interface Justification {
  id: string;
  student_id: string;
  academic_week_id: string;
  attendance_record_id?: string;
  motivo: string;
  documento_adjunto_url?: string;
  documento_nombre?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  solicitada_en: string;
  resuelta_en?: string;
  resuelta_por?: string;
  comentario_resolucion?: string;
}

export interface InstitutionalSettings {
  nombreInstitucion: string;
  siglas: string;
  toleranciaDefectoMinutos: number;
  qrIntervaloSegundos: number;
  limiteInasistenciaPorcentaje: number; // 30% for DPI in UCV
  bloqueoInasistenciaActivo: boolean;
  zonaHoraria: string;
  periodoVigente: string;
}

export interface QRTokenPayload {
  sessionId: string;
  weekId: string;
  courseId: string;
  sectionId: string;
  timestamp: number;
  expiresAt: number;
  tokenHash: string;
}
