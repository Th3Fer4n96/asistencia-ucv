import {
  Career,
  Course,
  Section,
  AcademicUnit,
  AcademicWeek,
  User,
  TeacherAssignment,
  Enrollment,
  AttendanceSession,
  AttendanceRecord,
  Justification,
  InstitutionalSettings,
} from '../types/academic';

export const INITIAL_SETTINGS: InstitutionalSettings = {
  nombreInstitucion: 'Universidad César Vallejo',
  siglas: 'UCV',
  toleranciaDefectoMinutos: 15,
  qrIntervaloSegundos: 10,
  limiteInasistenciaPorcentaje: 30, // 30% DPI UCV
  bloqueoInasistenciaActivo: true,
  zonaHoraria: 'America/Lima (UTC-5)',
  periodoVigente: '2026-II',
};

export const INITIAL_USERS: User[] = [
  {
    id: 'doc-1',
    codigo: 'DOC-84920',
    nombre: 'Carlos Manuel',
    apellidos: 'Mendoza Arévalo',
    email: 'carlos.mendoza@ucvvirtual.edu.pe',
    rol: 'docente',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    telefono: '+51 984 123 456',
  },
  {
    id: 'doc-2',
    codigo: 'DOC-91823',
    nombre: 'Patricia Elena',
    apellidos: 'Valdivia Campos',
    email: 'patricia.valdivia@ucvvirtual.edu.pe',
    rol: 'docente',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    telefono: '+51 976 543 210',
  },
  {
    id: 'alu-1',
    codigo: '73049182',
    nombre: 'Ana Lucía',
    apellidos: 'Ramos Vega',
    email: 'aramosv@ucvvirtual.edu.pe',
    rol: 'alumno',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    carreraId: 'car-1',
    telefono: '+51 991 223 344',
  },
  {
    id: 'alu-2',
    codigo: '74920193',
    nombre: 'Diego Alonso',
    apellidos: 'Paredes Rivas',
    email: 'dparedesr@ucvvirtual.edu.pe',
    rol: 'alumno',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    carreraId: 'car-1',
  },
  {
    id: 'alu-3',
    codigo: '75192038',
    nombre: 'Valeria Sofía',
    apellidos: 'Castro Huamán',
    email: 'vcastroh@ucvvirtual.edu.pe',
    rol: 'alumno',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    carreraId: 'car-1',
  },
  {
    id: 'alu-4',
    codigo: '76092184',
    nombre: 'Mateo Sebastián',
    apellidos: 'Silva Carranza',
    email: 'msilvac@ucvvirtual.edu.pe',
    rol: 'alumno',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    carreraId: 'car-1',
  },
  {
    id: 'alu-5',
    codigo: '77281902',
    nombre: 'Camila Fernanda',
    apellidos: 'Quispe Morales',
    email: 'cquispem@ucvvirtual.edu.pe',
    rol: 'alumno',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    carreraId: 'car-1',
  },
  {
    id: 'alu-6',
    codigo: '78910293',
    nombre: 'Joaquín Renato',
    apellidos: 'Díaz Espinoza',
    email: 'jdiaze@ucvvirtual.edu.pe',
    rol: 'alumno',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    carreraId: 'car-1',
  },
  {
    id: 'adm-1',
    codigo: 'ADM-1002',
    nombre: 'Dr. Roberto',
    apellidos: 'Alva Torres',
    email: 'ralvat@ucv.edu.pe',
    rol: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_CAREERS: Career[] = [
  {
    id: 'car-1',
    codigo: 'IS-UCV',
    nombre: 'Ingeniería de Sistemas',
    facultad: 'Facultad de Ingeniería y Arquitectura',
    campus: 'Campus Lima Norte',
    descripcion: 'Formación de líderes tecnológicos expertos en ingeniería de software, analítica de datos e inteligencia artificial.',
    activo: true,
    creado_en: '2026-01-10T08:00:00Z',
  },
  {
    id: 'car-2',
    codigo: 'MED-UCV',
    nombre: 'Medicina Humana',
    facultad: 'Facultad de Ciencias de la Salud',
    campus: 'Campus San Juan de Lurigancho',
    descripcion: 'Formación médica con sólida base científica y vocación humanística en centros hospitalarios.',
    activo: true,
    creado_en: '2026-01-10T08:00:00Z',
  },
  {
    id: 'car-3',
    codigo: 'DER-UCV',
    nombre: 'Derecho',
    facultad: 'Facultad de Derecho y Humanidades',
    campus: 'Campus Los Olivos',
    descripcion: 'Profesionales del derecho con ética, pensamiento crítico y destreza en litigación oral.',
    activo: true,
    creado_en: '2026-01-10T08:00:00Z',
  },
  {
    id: 'car-4',
    codigo: 'PSI-UCV',
    nombre: 'Psicología',
    facultad: 'Facultad de Ciencias de la Salud',
    campus: 'Campus Ate',
    descripcion: 'Evaluación, diagnóstico e intervención en psicología clínica, educativa y organizacional.',
    activo: true,
    creado_en: '2026-01-10T08:00:00Z',
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'cou-1',
    career_id: 'car-1',
    codigo: 'BD-401',
    nombre: 'Base de Datos',
    ciclo: 4,
    creditos: 4,
    descripcion: 'Diseño conceptual, modelo relacional, SQL avanzado, transacciones, optimización y NoSQL.',
    activo: true,
    creado_en: '2026-02-01T08:00:00Z',
  },
  {
    id: 'cou-2',
    career_id: 'car-1',
    codigo: 'DWI-502',
    nombre: 'Desarrollo Web Integrado',
    ciclo: 5,
    creditos: 4,
    descripcion: 'Arquitectura de aplicaciones modernas full-stack, APIs RESTful, seguridad web y microservicios.',
    activo: true,
    creado_en: '2026-02-01T08:00:00Z',
  },
  {
    id: 'cou-3',
    career_id: 'car-1',
    codigo: 'AS-601',
    nombre: 'Arquitectura de Software',
    ciclo: 6,
    creditos: 4,
    descripcion: 'Patrones de arquitectura, clean architecture, escalabilidad y despliegue en la nube.',
    activo: true,
    creado_en: '2026-02-01T08:00:00Z',
  },
  {
    id: 'cou-4',
    career_id: 'car-2',
    codigo: 'ANA-201',
    nombre: 'Anatomía Humana I',
    ciclo: 2,
    creditos: 5,
    descripcion: 'Estudio morfofuncional del cuerpo humano, osteología, miología y sistema vascular.',
    activo: true,
    creado_en: '2026-02-01T08:00:00Z',
  },
  {
    id: 'cou-5',
    career_id: 'car-3',
    codigo: 'DC-301',
    nombre: 'Derecho Constitucional',
    ciclo: 3,
    creditos: 4,
    descripcion: 'Principios fundamentales de la Constitución, derechos humanos y garantías jurisdiccionales.',
    activo: true,
    creado_en: '2026-02-01T08:00:00Z',
  },
  {
    id: 'cou-6',
    career_id: 'car-4',
    codigo: 'PC-102',
    nombre: 'Psicología Cognitiva',
    ciclo: 2,
    creditos: 4,
    descripcion: 'Procesos cognitivos: percepción, atención, memoria, lenguaje y pensamiento.',
    activo: true,
    creado_en: '2026-02-01T08:00:00Z',
  },
];

export const INITIAL_SECTIONS: Section[] = [
  {
    id: 'sec-1',
    course_id: 'cou-1', // Base de Datos
    codigo: 'A1',
    nombre: 'Sección A1 - Laboratorio 302',
    periodo_academico: '2026-II',
    activo: true,
  },
  {
    id: 'sec-2',
    course_id: 'cou-2', // Desarrollo Web
    codigo: 'B1',
    nombre: 'Sección B1 - Laboratorio 405',
    periodo_academico: '2026-II',
    activo: true,
  },
  {
    id: 'sec-3',
    course_id: 'cou-3', // Arquitectura Software
    codigo: 'C1',
    nombre: 'Sección C1 - Aula Magna',
    periodo_academico: '2026-II',
    activo: true,
  },
  {
    id: 'sec-4',
    course_id: 'cou-4', // Anatomía
    codigo: 'M1',
    nombre: 'Sección M1 - Anfiteatro Anatómico',
    periodo_academico: '2026-II',
    activo: true,
  },
  {
    id: 'sec-5',
    course_id: 'cou-5', // Derecho
    codigo: 'D1',
    nombre: 'Sección D1 - Sala de Audiencias',
    periodo_academico: '2026-II',
    activo: true,
  },
];

export const INITIAL_TEACHER_ASSIGNMENTS: TeacherAssignment[] = [
  { id: 'ta-1', teacher_id: 'doc-1', section_id: 'sec-1' }, // Carlos Mendoza -> Base de Datos A1
  { id: 'ta-2', teacher_id: 'doc-1', section_id: 'sec-2' }, // Carlos Mendoza -> Desarrollo Web B1
  { id: 'ta-3', teacher_id: 'doc-1', section_id: 'sec-5' }, // Carlos Mendoza -> Derecho D1 (Curso institucional)
  { id: 'ta-4', teacher_id: 'doc-2', section_id: 'sec-4' }, // Patricia Valdivia -> Anatomía M1
];

export const INITIAL_ENROLLMENTS: Enrollment[] = [
  { id: 'enr-1', student_id: 'alu-1', section_id: 'sec-1', estado: 'matriculado', matriculado_en: '2026-03-01' },
  { id: 'enr-2', student_id: 'alu-2', section_id: 'sec-1', estado: 'matriculado', matriculado_en: '2026-03-01' },
  { id: 'enr-3', student_id: 'alu-3', section_id: 'sec-1', estado: 'matriculado', matriculado_en: '2026-03-01' },
  { id: 'enr-4', student_id: 'alu-4', section_id: 'sec-1', estado: 'matriculado', matriculado_en: '2026-03-01' },
  { id: 'enr-5', student_id: 'alu-5', section_id: 'sec-1', estado: 'matriculado', matriculado_en: '2026-03-01' },
  { id: 'enr-6', student_id: 'alu-6', section_id: 'sec-1', estado: 'matriculado', matriculado_en: '2026-03-01' },
  // Ana Ramos also enrolled in Desarrollo Web
  { id: 'enr-7', student_id: 'alu-1', section_id: 'sec-2', estado: 'matriculado', matriculado_en: '2026-03-01' },
  { id: 'enr-8', student_id: 'alu-2', section_id: 'sec-2', estado: 'matriculado', matriculado_en: '2026-03-01' },
];

// Helper to generate the exact 3 units and 15 weeks for any course
export function generateCourseAcademicHierarchy(
  courseId: string,
  courseCode: string,
  startDateStr: string = '2026-08-18', // Tuesday
  startTime: string = '08:00',
  endTime: string = '10:30'
): { units: AcademicUnit[]; weeks: AcademicWeek[] } {
  const units: AcademicUnit[] = [
    {
      id: `unit-${courseId}-1`,
      course_id: courseId,
      numero_unidad: 1,
      nombre: 'Unidad 1: Fundamentos y Diseño Relacional',
      competencia: 'Aplica los principios teóricos del modelo relacional y la normalización de datos.',
    },
    {
      id: `unit-${courseId}-2`,
      course_id: courseId,
      numero_unidad: 2,
      nombre: 'Unidad 2: Lenguaje SQL y Lógica de Negocio',
      competencia: 'Construye consultas complejas, vistas, triggers y procedimientos almacenados.',
    },
    {
      id: `unit-${courseId}-3`,
      course_id: courseId,
      numero_unidad: 3,
      nombre: 'Unidad 3: Optimización, Seguridad y Bases NoSQL',
      competencia: 'Optimiza planes de ejecución y diseña almacenes de datos no relacionales para alta demanda.',
    },
  ];

  const weeksThemes: Record<string, string[]> = {
    'cou-1': [
      // Unidad 1 (Semanas 1 a 5)
      'Introducción a los Sistemas Gestores de Base de Datos y Modelo E/R',
      'Transformación del Modelo Conceptual al Modelo Lógico Relacional',
      'Álgebra Relacional y Operaciones Fundamentales',
      'Normalización de Tablas: 1FN, 2FN y 3FN',
      'Evaluación Parcial de Unidad 1 y Casos Prácticos',
      // Unidad 2 (Semanas 6 a 10)
      'DDL y DML en PostgreSQL: Creación de Esquemas y Restricciones',
      'Consultas Avanzadas: Subconsultas, Agrupamiento y Funciones de Ventana',
      'Vistas, Índices B-Tree y Optimización de Consultas (EXPLAIN ANALYZE)',
      'Transacciones ACID, Concurrencia y Niveles de Aislamiento',
      'Procedimientos Almacenados, Funciones y Triggers en PL/pgSQL',
      // Unidad 3 (Semanas 11 a 15)
      'Diseño Físico y Particionamiento de Tablas Masivas',
      'Seguridad en Bases de Datos: Roles, Permisos y Encriptación',
      'Introducción a Bases de Datos NoSQL y Documentales (MongoDB)',
      'Réplicas, Alta Disponibilidad y Respaldo Institucional',
      'Examen Final Integrador y Sustentación de Proyectos',
    ],
  };

  const defaultThemes = [
    'Semana 1: Introducción a la asignatura y marco conceptual',
    'Semana 2: Metodología y principios fundamentales',
    'Semana 3: Desarrollo de casos prácticos y aplicación',
    'Semana 4: Análisis comparativo y resolución de problemas',
    'Semana 5: Evaluación de la Unidad 1 y retroalimentación',
    'Semana 6: Inicio de la Unidad 2 y conceptos intermedios',
    'Semana 7: Implementación guiada en entornos controlados',
    'Semana 8: Talleres colaborativos y rúbrica de avance',
    'Semana 9: Integración de técnicas y experimentación',
    'Semana 10: Evaluación de la Unidad 2 y entregable',
    'Semana 11: Inicio de la Unidad 3 y conceptos avanzados',
    'Semana 12: Casos de estudio de impacto real en la industria',
    'Semana 13: Laboratorio especializado y buenas prácticas',
    'Semana 14: Ensayo de proyecto final y calibración',
    'Semana 15: Evaluación Final y cierre de actas académicas',
  ];

  const themes = weeksThemes[courseId] || defaultThemes;
  const weeks: AcademicWeek[] = [];

  const baseDate = new Date(startDateStr);

  for (let w = 1; w <= 15; w++) {
    const unitNumber: 1 | 2 | 3 = w <= 5 ? 1 : w <= 10 ? 2 : 3;
    const unitId = `unit-${courseId}-${unitNumber}`;

    // Add (w - 1) * 7 days
    const weekDate = new Date(baseDate);
    weekDate.setDate(baseDate.getDate() + (w - 1) * 7);
    const dateStr = weekDate.toISOString().split('T')[0];

    // Status: 1 to 6 finalizada, 7 pendiente/en_curso, 8 to 15 programada
    let status: AcademicWeek['estado'] = 'programada';
    if (courseId === 'cou-1') {
      if (w < 7) {
        status = 'finalizada';
      } else if (w === 7) {
        status = 'en_curso';
      } else {
        status = 'programada';
      }
    } else {
      if (w < 3) status = 'finalizada';
      else if (w === 3) status = 'en_curso';
      else status = 'programada';
    }

    weeks.push({
      id: `week-${courseId}-${w}`,
      academic_unit_id: unitId,
      numero_semana: w,
      numero_unidad: unitNumber,
      tema: themes[w - 1] || `Tema académico de la Semana ${w}`,
      fecha_clase: dateStr,
      hora_inicio: startTime,
      hora_fin: endTime,
      tolerancia_minutos: 15,
      estado: status,
      sesion_activa_id: w === 7 && courseId === 'cou-1' ? 'sess-cou1-w7' : undefined,
    });
  }

  return { units, weeks };
}

// Generate units and weeks for all initial courses
const course1Hierarchy = generateCourseAcademicHierarchy('cou-1', 'BD-401', '2026-08-18', '08:00', '10:30');
const course2Hierarchy = generateCourseAcademicHierarchy('cou-2', 'DWI-502', '2026-08-19', '10:45', '13:15');
const course3Hierarchy = generateCourseAcademicHierarchy('cou-3', 'AS-601', '2026-08-20', '14:00', '16:30');
const course4Hierarchy = generateCourseAcademicHierarchy('cou-4', 'ANA-201', '2026-08-18', '07:30', '11:00');
const course5Hierarchy = generateCourseAcademicHierarchy('cou-5', 'DC-301', '2026-08-21', '09:00', '11:30');
const course6Hierarchy = generateCourseAcademicHierarchy('cou-6', 'PC-102', '2026-08-22', '08:00', '10:30');

export const INITIAL_UNITS: AcademicUnit[] = [
  ...course1Hierarchy.units,
  ...course2Hierarchy.units,
  ...course3Hierarchy.units,
  ...course4Hierarchy.units,
  ...course5Hierarchy.units,
  ...course6Hierarchy.units,
];

export const INITIAL_WEEKS: AcademicWeek[] = [
  ...course1Hierarchy.weeks,
  ...course2Hierarchy.weeks,
  ...course3Hierarchy.weeks,
  ...course4Hierarchy.weeks,
  ...course5Hierarchy.weeks,
  ...course6Hierarchy.weeks,
];

// Initial sessions for Base de Datos (cou-1) Weeks 1 through 7
export const INITIAL_SESSIONS: AttendanceSession[] = [
  {
    id: 'sess-cou1-w1',
    academic_week_id: 'week-cou-1-1',
    section_id: 'sec-1',
    docente_id: 'doc-1',
    iniciada_en: '2026-08-18T08:00:00Z',
    finalizada_en: '2026-08-18T10:30:00Z',
    estado: 'finalizada',
  },
  {
    id: 'sess-cou1-w2',
    academic_week_id: 'week-cou-1-2',
    section_id: 'sec-1',
    docente_id: 'doc-1',
    iniciada_en: '2026-08-25T08:02:00Z',
    finalizada_en: '2026-08-25T10:30:00Z',
    estado: 'finalizada',
  },
  {
    id: 'sess-cou1-w3',
    academic_week_id: 'week-cou-1-3',
    section_id: 'sec-1',
    docente_id: 'doc-1',
    iniciada_en: '2026-09-01T08:01:00Z',
    finalizada_en: '2026-09-01T10:30:00Z',
    estado: 'finalizada',
  },
  {
    id: 'sess-cou1-w4',
    academic_week_id: 'week-cou-1-4',
    section_id: 'sec-1',
    docente_id: 'doc-1',
    iniciada_en: '2026-09-08T08:00:00Z',
    finalizada_en: '2026-09-08T10:30:00Z',
    estado: 'finalizada',
  },
  {
    id: 'sess-cou1-w5',
    academic_week_id: 'week-cou-1-5',
    section_id: 'sec-1',
    docente_id: 'doc-1',
    iniciada_en: '2026-09-15T08:05:00Z',
    finalizada_en: '2026-09-15T10:30:00Z',
    estado: 'finalizada',
  },
  {
    id: 'sess-cou1-w6',
    academic_week_id: 'week-cou-1-6',
    section_id: 'sec-1',
    docente_id: 'doc-1',
    iniciada_en: '2026-09-22T08:00:00Z',
    finalizada_en: '2026-09-22T10:30:00Z',
    estado: 'finalizada',
  },
  {
    id: 'sess-cou1-w7',
    academic_week_id: 'week-cou-1-7',
    section_id: 'sec-1',
    docente_id: 'doc-1',
    iniciada_en: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    estado: 'en_curso',
    codigo_qr_actual: 'UCV-BD401-W7-ACTIVE',
    qr_expira_en: new Date(Date.now() + 10 * 1000).toISOString(),
  },
];

// Pre-populate records for historical weeks 1..6 and week 7 in progress
export const INITIAL_RECORDS: AttendanceRecord[] = [
  // Week 1 (All attended)
  { id: 'rec-w1-1', attendance_session_id: 'sess-cou1-w1', academic_week_id: 'week-cou-1-1', student_id: 'alu-1', estado: 'presente', registrado_en: '2026-08-18T08:05:12Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w1-2', attendance_session_id: 'sess-cou1-w1', academic_week_id: 'week-cou-1-1', student_id: 'alu-2', estado: 'presente', registrado_en: '2026-08-18T08:06:40Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w1-3', attendance_session_id: 'sess-cou1-w1', academic_week_id: 'week-cou-1-1', student_id: 'alu-3', estado: 'presente', registrado_en: '2026-08-18T08:08:22Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w1-4', attendance_session_id: 'sess-cou1-w1', academic_week_id: 'week-cou-1-1', student_id: 'alu-4', estado: 'tardanza', registrado_en: '2026-08-18T08:22:10Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w1-5', attendance_session_id: 'sess-cou1-w1', academic_week_id: 'week-cou-1-1', student_id: 'alu-5', estado: 'presente', registrado_en: '2026-08-18T08:09:44Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w1-6', attendance_session_id: 'sess-cou1-w1', academic_week_id: 'week-cou-1-1', student_id: 'alu-6', estado: 'falta', registrado_en: '2026-08-18T10:30:00Z', metodo_registro: 'manual_docente' },

  // Week 2
  { id: 'rec-w2-1', attendance_session_id: 'sess-cou1-w2', academic_week_id: 'week-cou-1-2', student_id: 'alu-1', estado: 'presente', registrado_en: '2026-08-25T08:04:10Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w2-2', attendance_session_id: 'sess-cou1-w2', academic_week_id: 'week-cou-1-2', student_id: 'alu-2', estado: 'presente', registrado_en: '2026-08-25T08:05:30Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w2-3', attendance_session_id: 'sess-cou1-w2', academic_week_id: 'week-cou-1-2', student_id: 'alu-3', estado: 'justificado', registrado_en: '2026-08-25T08:00:00Z', metodo_registro: 'justificado', observacion: 'Cita médica certificada Essalud' },
  { id: 'rec-w2-4', attendance_session_id: 'sess-cou1-w2', academic_week_id: 'week-cou-1-2', student_id: 'alu-4', estado: 'presente', registrado_en: '2026-08-25T08:07:11Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w2-5', attendance_session_id: 'sess-cou1-w2', academic_week_id: 'week-cou-1-2', student_id: 'alu-5', estado: 'tardanza', registrado_en: '2026-08-25T08:19:50Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w2-6', attendance_session_id: 'sess-cou1-w2', academic_week_id: 'week-cou-1-2', student_id: 'alu-6', estado: 'presente', registrado_en: '2026-08-25T08:10:05Z', metodo_registro: 'qr_scanner' },

  // Week 3
  { id: 'rec-w3-1', attendance_session_id: 'sess-cou1-w3', academic_week_id: 'week-cou-1-3', student_id: 'alu-1', estado: 'presente', registrado_en: '2026-09-01T08:02:15Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w3-2', attendance_session_id: 'sess-cou1-w3', academic_week_id: 'week-cou-1-3', student_id: 'alu-2', estado: 'falta', registrado_en: '2026-09-01T10:30:00Z', metodo_registro: 'manual_docente' },
  { id: 'rec-w3-3', attendance_session_id: 'sess-cou1-w3', academic_week_id: 'week-cou-1-3', student_id: 'alu-3', estado: 'presente', registrado_en: '2026-09-01T08:06:20Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w3-4', attendance_session_id: 'sess-cou1-w3', academic_week_id: 'week-cou-1-3', student_id: 'alu-4', estado: 'presente', registrado_en: '2026-09-01T08:04:19Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w3-5', attendance_session_id: 'sess-cou1-w3', academic_week_id: 'week-cou-1-3', student_id: 'alu-5', estado: 'presente', registrado_en: '2026-09-01T08:08:44Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w3-6', attendance_session_id: 'sess-cou1-w3', academic_week_id: 'week-cou-1-3', student_id: 'alu-6', estado: 'presente', registrado_en: '2026-09-01T08:09:12Z', metodo_registro: 'qr_scanner' },

  // Week 4
  { id: 'rec-w4-1', attendance_session_id: 'sess-cou1-w4', academic_week_id: 'week-cou-1-4', student_id: 'alu-1', estado: 'presente', registrado_en: '2026-09-08T08:01:40Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w4-2', attendance_session_id: 'sess-cou1-w4', academic_week_id: 'week-cou-1-4', student_id: 'alu-2', estado: 'presente', registrado_en: '2026-09-08T08:03:10Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w4-3', attendance_session_id: 'sess-cou1-w4', academic_week_id: 'week-cou-1-4', student_id: 'alu-3', estado: 'presente', registrado_en: '2026-09-08T08:05:00Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w4-4', attendance_session_id: 'sess-cou1-w4', academic_week_id: 'week-cou-1-4', student_id: 'alu-4', estado: 'falta', registrado_en: '2026-09-08T10:30:00Z', metodo_registro: 'manual_docente' },
  { id: 'rec-w4-5', attendance_session_id: 'sess-cou1-w4', academic_week_id: 'week-cou-1-4', student_id: 'alu-5', estado: 'presente', registrado_en: '2026-09-08T08:06:55Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w4-6', attendance_session_id: 'sess-cou1-w4', academic_week_id: 'week-cou-1-4', student_id: 'alu-6', estado: 'tardanza', registrado_en: '2026-09-08T08:18:12Z', metodo_registro: 'qr_scanner' },

  // Week 5 (Examen Parcial Unidad 1)
  { id: 'rec-w5-1', attendance_session_id: 'sess-cou1-w5', academic_week_id: 'week-cou-1-5', student_id: 'alu-1', estado: 'presente', registrado_en: '2026-09-15T08:03:00Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w5-2', attendance_session_id: 'sess-cou1-w5', academic_week_id: 'week-cou-1-5', student_id: 'alu-2', estado: 'presente', registrado_en: '2026-09-15T08:02:40Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w5-3', attendance_session_id: 'sess-cou1-w5', academic_week_id: 'week-cou-1-5', student_id: 'alu-3', estado: 'presente', registrado_en: '2026-09-15T08:05:10Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w5-4', attendance_session_id: 'sess-cou1-w5', academic_week_id: 'week-cou-1-5', student_id: 'alu-4', estado: 'presente', registrado_en: '2026-09-15T08:04:15Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w5-5', attendance_session_id: 'sess-cou1-w5', academic_week_id: 'week-cou-1-5', student_id: 'alu-5', estado: 'presente', registrado_en: '2026-09-15T08:07:30Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w5-6', attendance_session_id: 'sess-cou1-w5', academic_week_id: 'week-cou-1-5', student_id: 'alu-6', estado: 'presente', registrado_en: '2026-09-15T08:06:50Z', metodo_registro: 'qr_scanner' },

  // Week 6
  { id: 'rec-w6-1', attendance_session_id: 'sess-cou1-w6', academic_week_id: 'week-cou-1-6', student_id: 'alu-1', estado: 'presente', registrado_en: '2026-09-22T08:02:11Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w6-2', attendance_session_id: 'sess-cou1-w6', academic_week_id: 'week-cou-1-6', student_id: 'alu-2', estado: 'presente', registrado_en: '2026-09-22T08:05:00Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w6-3', attendance_session_id: 'sess-cou1-w6', academic_week_id: 'week-cou-1-6', student_id: 'alu-3', estado: 'tardanza', registrado_en: '2026-09-22T08:17:40Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w6-4', attendance_session_id: 'sess-cou1-w6', academic_week_id: 'week-cou-1-6', student_id: 'alu-4', estado: 'presente', registrado_en: '2026-09-22T08:08:22Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w6-5', attendance_session_id: 'sess-cou1-w6', academic_week_id: 'week-cou-1-6', student_id: 'alu-5', estado: 'presente', registrado_en: '2026-09-22T08:09:12Z', metodo_registro: 'qr_scanner' },
  { id: 'rec-w6-6', attendance_session_id: 'sess-cou1-w6', academic_week_id: 'week-cou-1-6', student_id: 'alu-6', estado: 'falta', registrado_en: '2026-09-22T10:30:00Z', metodo_registro: 'manual_docente' },

  // Week 7 (Current active session) - 2 students already scanned
  { id: 'rec-w7-1', attendance_session_id: 'sess-cou1-w7', academic_week_id: 'week-cou-1-7', student_id: 'alu-2', estado: 'presente', registrado_en: new Date(Date.now() - 4 * 60 * 1000).toISOString(), metodo_registro: 'qr_scanner' },
  { id: 'rec-w7-2', attendance_session_id: 'sess-cou1-w7', academic_week_id: 'week-cou-1-7', student_id: 'alu-4', estado: 'presente', registrado_en: new Date(Date.now() - 2 * 60 * 1000).toISOString(), metodo_registro: 'qr_scanner' },
];

export const INITIAL_JUSTIFICATIONS: Justification[] = [
  {
    id: 'just-1',
    student_id: 'alu-3',
    academic_week_id: 'week-cou-1-2',
    attendance_record_id: 'rec-w2-3',
    motivo: 'Atención médica de urgencia en Policlínico UCV / Essalud. Se adjunta constancia de descanso médico emitido por médico colegiado.',
    documento_nombre: 'Descanso_Medico_ValeriaCastro.pdf',
    documento_adjunto_url: '#',
    estado: 'aprobada',
    solicitada_en: '2026-08-25T14:30:00Z',
    resuelta_en: '2026-08-26T10:15:00Z',
    resuelta_por: 'adm-1',
    comentario_resolucion: 'Justificación procedente según reglamento general de estudiantes UCV.',
  },
  {
    id: 'just-2',
    student_id: 'alu-6',
    academic_week_id: 'week-cou-1-6',
    attendance_record_id: 'rec-w6-6',
    motivo: 'Representación institucional en los Juegos Universitarios FEDUP - Selección de Básquetbol UCV.',
    documento_nombre: 'Oficio_Deportes_UCV_JoaquinDiaz.pdf',
    documento_adjunto_url: '#',
    estado: 'pendiente',
    solicitada_en: '2026-09-23T09:00:00Z',
  },
];
