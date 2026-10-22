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
  AttendanceStatus,
  QRTokenPayload,
} from '../types/academic';

import {
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_CAREERS,
  INITIAL_COURSES,
  INITIAL_SECTIONS,
  INITIAL_TEACHER_ASSIGNMENTS,
  INITIAL_ENROLLMENTS,
  INITIAL_UNITS,
  INITIAL_WEEKS,
  INITIAL_SESSIONS,
  INITIAL_RECORDS,
  INITIAL_JUSTIFICATIONS,
  generateCourseAcademicHierarchy,
} from '../data/initialData';

const STORAGE_KEYS = {
  SETTINGS: 'ucv_asisqr_settings_v2',
  USERS: 'ucv_asisqr_users_v2',
  CURRENT_USER_ID: 'ucv_asisqr_current_user_id_v2',
  CAREERS: 'ucv_asisqr_careers_v2',
  COURSES: 'ucv_asisqr_courses_v2',
  SECTIONS: 'ucv_asisqr_sections_v2',
  TEACHER_ASSIGNMENTS: 'ucv_asisqr_ta_v2',
  ENROLLMENTS: 'ucv_asisqr_enrollments_v2',
  UNITS: 'ucv_asisqr_units_v2',
  WEEKS: 'ucv_asisqr_weeks_v2',
  SESSIONS: 'ucv_asisqr_sessions_v2',
  RECORDS: 'ucv_asisqr_records_v2',
  JUSTIFICATIONS: 'ucv_asisqr_justifications_v2',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Error loading ${key} from storage:`, err);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export class AcademicStore {
  private static instance: AcademicStore;

  settings: InstitutionalSettings;
  users: User[];
  currentUserId: string;
  careers: Career[];
  courses: Course[];
  sections: Section[];
  teacherAssignments: TeacherAssignment[];
  enrollments: Enrollment[];
  academicUnits: AcademicUnit[];
  academicWeeks: AcademicWeek[];
  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  justifications: Justification[];

  private listeners: (() => void)[] = [];

  private constructor() {
    this.settings = loadFromStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    this.users = loadFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.currentUserId = loadFromStorage(STORAGE_KEYS.CURRENT_USER_ID, 'doc-1');
    this.careers = loadFromStorage(STORAGE_KEYS.CAREERS, INITIAL_CAREERS);
    this.courses = loadFromStorage(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    this.sections = loadFromStorage(STORAGE_KEYS.SECTIONS, INITIAL_SECTIONS);
    this.teacherAssignments = loadFromStorage(STORAGE_KEYS.TEACHER_ASSIGNMENTS, INITIAL_TEACHER_ASSIGNMENTS);
    this.enrollments = loadFromStorage(STORAGE_KEYS.ENROLLMENTS, INITIAL_ENROLLMENTS);
    this.academicUnits = loadFromStorage(STORAGE_KEYS.UNITS, INITIAL_UNITS);
    this.academicWeeks = loadFromStorage(STORAGE_KEYS.WEEKS, INITIAL_WEEKS);
    this.attendanceSessions = loadFromStorage(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    this.attendanceRecords = loadFromStorage(STORAGE_KEYS.RECORDS, INITIAL_RECORDS);
    this.justifications = loadFromStorage(STORAGE_KEYS.JUSTIFICATIONS, INITIAL_JUSTIFICATIONS);
  }

  public static getInstance(): AcademicStore {
    if (!AcademicStore.instance) {
      AcademicStore.instance = new AcademicStore();
    }
    return AcademicStore.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    // Save state
    saveToStorage(STORAGE_KEYS.SETTINGS, this.settings);
    saveToStorage(STORAGE_KEYS.USERS, this.users);
    saveToStorage(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
    saveToStorage(STORAGE_KEYS.CAREERS, this.careers);
    saveToStorage(STORAGE_KEYS.COURSES, this.courses);
    saveToStorage(STORAGE_KEYS.SECTIONS, this.sections);
    saveToStorage(STORAGE_KEYS.TEACHER_ASSIGNMENTS, this.teacherAssignments);
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, this.enrollments);
    saveToStorage(STORAGE_KEYS.UNITS, this.academicUnits);
    saveToStorage(STORAGE_KEYS.WEEKS, this.academicWeeks);
    saveToStorage(STORAGE_KEYS.SESSIONS, this.attendanceSessions);
    saveToStorage(STORAGE_KEYS.RECORDS, this.attendanceRecords);
    saveToStorage(STORAGE_KEYS.JUSTIFICATIONS, this.justifications);

    this.listeners.forEach((listener) => listener());
  }

  public resetToFactory(): void {
    localStorage.clear();
    this.settings = INITIAL_SETTINGS;
    this.users = INITIAL_USERS;
    this.currentUserId = 'doc-1';
    this.careers = INITIAL_CAREERS;
    this.courses = INITIAL_COURSES;
    this.sections = INITIAL_SECTIONS;
    this.teacherAssignments = INITIAL_TEACHER_ASSIGNMENTS;
    this.enrollments = INITIAL_ENROLLMENTS;
    this.academicUnits = INITIAL_UNITS;
    this.academicWeeks = INITIAL_WEEKS;
    this.attendanceSessions = INITIAL_SESSIONS;
    this.attendanceRecords = INITIAL_RECORDS;
    this.justifications = INITIAL_JUSTIFICATIONS;
    this.notify();
  }

  // --- Current User ---
  public getCurrentUser(): User {
    const user = this.users.find((u) => u.id === this.currentUserId);
    return user || this.users[0];
  }

  public setCurrentUser(userId: string): void {
    this.currentUserId = userId;
    this.notify();
  }

  // --- Teacher Queries ---
  public getTeacherCareers(teacherId: string): (Career & { coursesCount: number })[] {
    // 1. Find all sections assigned to this teacher
    const assignedSectionIds = this.teacherAssignments
      .filter((ta) => ta.teacher_id === teacherId)
      .map((ta) => ta.section_id);

    // 2. Find all courses corresponding to these sections
    const assignedCourseIds = this.sections
      .filter((sec) => assignedSectionIds.includes(sec.id) && sec.activo)
      .map((sec) => sec.course_id);

    // 3. Find unique careers for these courses
    const careerCourseCounts: Record<string, number> = {};
    for (const courseId of assignedCourseIds) {
      const course = this.courses.find((c) => c.id === courseId && c.activo);
      if (course) {
        careerCourseCounts[course.career_id] = (careerCourseCounts[course.career_id] || 0) + 1;
      }
    }

    // Return the careers
    return this.careers
      .filter((c) => c.activo && careerCourseCounts[c.id] > 0)
      .map((c) => ({
        ...c,
        coursesCount: careerCourseCounts[c.id] || 0,
      }));
  }

  public getTeacherCoursesByCareer(
    teacherId: string,
    careerId: string
  ): (Course & {
    section: Section;
    unitsCount: number;
    weeksCount: number;
    attendanceRate: number;
    totalStudents: number;
  })[] {
    const assignedSectionIds = this.teacherAssignments
      .filter((ta) => ta.teacher_id === teacherId)
      .map((ta) => ta.section_id);

    const result: (Course & {
      section: Section;
      unitsCount: number;
      weeksCount: number;
      attendanceRate: number;
      totalStudents: number;
    })[] = [];

    const careerCourses = this.courses.filter((c) => c.career_id === careerId && c.activo);

    for (const course of careerCourses) {
      const courseSections = this.sections.filter(
        (sec) => sec.course_id === course.id && sec.activo && assignedSectionIds.includes(sec.id)
      );

      for (const sec of courseSections) {
        const units = this.getCourseUnits(course.id);
        const weeks = this.getAllCourseWeeks(course.id);
        const enrolledStudents = this.getSectionStudents(sec.id);

        // Calculate attendance rate for completed sessions
        const pastSessions = this.attendanceSessions.filter(
          (s) => s.section_id === sec.id && s.estado === 'finalizada'
        );

        let totalExpected = pastSessions.length * enrolledStudents.length;
        let totalPresentOrJustified = 0;

        for (const sess of pastSessions) {
          const records = this.attendanceRecords.filter((r) => r.attendance_session_id === sess.id);
          for (const rec of records) {
            if (rec.estado === 'presente' || rec.estado === 'tardanza' || rec.estado === 'justificado') {
              totalPresentOrJustified++;
            }
          }
        }

        const attendanceRate = totalExpected > 0 ? Math.round((totalPresentOrJustified / totalExpected) * 100) : 100;

        result.push({
          ...course,
          section: sec,
          unitsCount: units.length,
          weeksCount: weeks.length,
          attendanceRate,
          totalStudents: enrolledStudents.length,
        });
      }
    }

    return result;
  }

  // --- Hierarchy Queries ---
  public getCourseUnits(courseId: string): AcademicUnit[] {
    return this.academicUnits
      .filter((u) => u.course_id === courseId)
      .sort((a, b) => a.numero_unidad - b.numero_unidad);
  }

  public getUnitWeeks(unitId: string): AcademicWeek[] {
    return this.academicWeeks
      .filter((w) => w.academic_unit_id === unitId)
      .sort((a, b) => a.numero_semana - b.numero_semana);
  }

  public getAllCourseWeeks(courseId: string): AcademicWeek[] {
    const units = this.getCourseUnits(courseId);
    const unitIds = units.map((u) => u.id);
    return this.academicWeeks
      .filter((w) => unitIds.includes(w.academic_unit_id))
      .sort((a, b) => a.numero_semana - b.numero_semana);
  }

  public getSectionStudents(sectionId: string): User[] {
    const studentIds = this.enrollments
      .filter((e) => e.section_id === sectionId && e.estado === 'matriculado')
      .map((e) => e.student_id);

    return this.users.filter((u) => studentIds.includes(u.id));
  }

  public getWeekStats(weekId: string, sectionId: string) {
    const week = this.academicWeeks.find((w) => w.id === weekId);
    const session = this.attendanceSessions.find(
      (s) => s.academic_week_id === weekId && s.section_id === sectionId
    );
    const enrolled = this.getSectionStudents(sectionId);

    if (!session) {
      return {
        totalEnrolled: enrolled.length,
        presentes: 0,
        tardanzas: 0,
        faltas: 0,
        justificados: 0,
        asistenciasRegistradas: 0,
        percentage: 0,
        session: undefined,
        week,
      };
    }

    const records = this.attendanceRecords.filter((r) => r.attendance_session_id === session.id);
    const presentes = records.filter((r) => r.estado === 'presente').length;
    const tardanzas = records.filter((r) => r.estado === 'tardanza').length;
    const faltas = records.filter((r) => r.estado === 'falta').length;
    const justificados = records.filter((r) => r.estado === 'justificado').length;
    const asistenciasRegistradas = presentes + tardanzas;

    const percentage = enrolled.length > 0
      ? Math.round(((presentes + tardanzas + justificados) / enrolled.length) * 100)
      : 0;

    return {
      totalEnrolled: enrolled.length,
      presentes,
      tardanzas,
      faltas,
      justificados,
      asistenciasRegistradas,
      percentage,
      session,
      week,
    };
  }

  // --- Attendance Sessions & QR Code ---
  public startOrGetAttendanceSession(
    weekId: string,
    sectionId: string,
    teacherId: string
  ): { session: AttendanceSession; error?: string } {
    // 1. Verify week exists
    const week = this.academicWeeks.find((w) => w.id === weekId);
    if (!week) return { session: null as any, error: 'Semana académica no encontrada.' };

    // 2. Verify teacher assignment
    const isAssigned = this.teacherAssignments.some(
      (ta) => ta.teacher_id === teacherId && ta.section_id === sectionId
    );
    if (!isAssigned) {
      return { session: null as any, error: 'El docente no está asignado a esta sección académica.' };
    }

    // 3. Check existing session for this week and section
    let existingSession = this.attendanceSessions.find(
      (s) => s.academic_week_id === weekId && s.section_id === sectionId
    );

    const now = Date.now();
    const expiresAt = now + (this.settings.qrIntervaloSegundos || 10) * 1000;
    const token = this.generateToken(weekId, sectionId, now, expiresAt);

    if (existingSession) {
      if (existingSession.estado === 'finalizada') {
        // Re-open if requested
        existingSession.estado = 'en_curso';
        existingSession.finalizada_en = undefined;
      }
      existingSession.codigo_qr_actual = token;
      existingSession.qr_expira_en = new Date(expiresAt).toISOString();
      existingSession.qr_token = token;

      // Update week status
      week.estado = 'en_curso';
      week.sesion_activa_id = existingSession.id;

      this.notify();
      return { session: existingSession };
    }

    // 4. Create new session
    const newSession: AttendanceSession = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      academic_week_id: weekId,
      section_id: sectionId,
      docente_id: teacherId,
      iniciada_en: new Date().toISOString(),
      estado: 'en_curso',
      codigo_qr_actual: token,
      qr_expira_en: new Date(expiresAt).toISOString(),
      qr_token: token,
    };

    week.estado = 'en_curso';
    week.sesion_activa_id = newSession.id;

    this.attendanceSessions.push(newSession);
    this.notify();
    return { session: newSession };
  }

  public refreshQRToken(sessionId: string): string | null {
    const session = this.attendanceSessions.find((s) => s.id === sessionId);
    if (!session || session.estado !== 'en_curso') return null;

    const now = Date.now();
    const expiresAt = now + (this.settings.qrIntervaloSegundos || 10) * 1000;
    const token = this.generateToken(session.academic_week_id, session.section_id, now, expiresAt);

    session.codigo_qr_actual = token;
    session.qr_expira_en = new Date(expiresAt).toISOString();
    session.qr_token = token;

    this.notify();
    return token;
  }

  public closeAttendanceSession(sessionId: string): { success: boolean; unrecordedMarkedAbsent: number } {
    const session = this.attendanceSessions.find((s) => s.id === sessionId);
    if (!session) return { success: false, unrecordedMarkedAbsent: 0 };

    session.estado = 'finalizada';
    session.finalizada_en = new Date().toISOString();
    session.codigo_qr_actual = undefined;
    session.qr_expira_en = undefined;

    const week = this.academicWeeks.find((w) => w.id === session.academic_week_id);
    if (week) {
      week.estado = 'finalizada';
      week.sesion_activa_id = undefined;
    }

    // Auto-mark enrolled students who didn't register as 'falta'
    const enrolledStudents = this.getSectionStudents(session.section_id);
    let markedCount = 0;

    for (const student of enrolledStudents) {
      const hasRecord = this.attendanceRecords.some(
        (r) => r.attendance_session_id === sessionId && r.student_id === student.id
      );

      if (!hasRecord) {
        this.attendanceRecords.push({
          id: `rec-abs-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          attendance_session_id: sessionId,
          academic_week_id: session.academic_week_id,
          student_id: student.id,
          estado: 'falta',
          registrado_en: new Date().toISOString(),
          metodo_registro: 'manual_docente',
          observacion: 'Inasistencia registrada automáticamente al cierre de la sesión semanal',
        });
        markedCount++;
      }
    }

    this.notify();
    return { success: true, unrecordedMarkedAbsent: markedCount };
  }

  // --- Student Scanning & Validation ---
  public scanQRCode(
    studentId: string,
    qrRawPayload: string
  ): {
    success: boolean;
    status?: AttendanceStatus;
    message: string;
    courseName?: string;
    weekNumber?: number;
    record?: AttendanceRecord;
  } {
    // 1. Parse token
    let payload: QRTokenPayload;
    try {
      const decoded = atob(qrRawPayload);
      payload = JSON.parse(decoded);
    } catch {
      // Fallback: check if raw string itself matches any active session code
      const directSession = this.attendanceSessions.find(
        (s) => s.codigo_qr_actual === qrRawPayload || s.qr_token === qrRawPayload
      );
      if (directSession) {
        payload = {
          sessionId: directSession.id,
          weekId: directSession.academic_week_id,
          courseId: '',
          sectionId: directSession.section_id,
          timestamp: Date.now() - 2000,
          expiresAt: Date.now() + 10000,
          tokenHash: 'direct',
        };
      } else {
        return {
          success: false,
          message: 'Código QR no válido o formato institucional irreconocible.',
        };
      }
    }

    // 2. Find session
    const session = this.attendanceSessions.find((s) => s.id === payload.sessionId);
    if (!session || session.estado !== 'en_curso') {
      return {
        success: false,
        message: 'La sesión de asistencia está cerrada, finalizada o no está disponible.',
      };
    }

    // 3. Expiration check with 5s network grace
    const now = Date.now();
    if (payload.expiresAt && now > payload.expiresAt + 5000) {
      return {
        success: false,
        message: 'El código QR ha expirado. Por favor, escanea el código actualizado en la pantalla del docente.',
      };
    }

    // 4. Enrollment check
    const isEnrolled = this.enrollments.some(
      (e) => e.student_id === studentId && e.section_id === payload.sectionId && e.estado === 'matriculado'
    );
    if (!isEnrolled) {
      return {
        success: false,
        message: 'No te encuentras matriculado en la sección académica correspondiente a esta sesión.',
      };
    }

    // 5. Duplicate check
    const existingRecord = this.attendanceRecords.find(
      (r) => r.attendance_session_id === session.id && r.student_id === studentId
    );

    const week = this.academicWeeks.find((w) => w.id === session.academic_week_id);
    const unit = week ? this.academicUnits.find((u) => u.id === week.academic_unit_id) : undefined;
    const course = unit ? this.courses.find((c) => c.id === unit.course_id) : undefined;

    if (existingRecord) {
      const timeStr = new Date(existingRecord.registrado_en).toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return {
        success: true,
        status: existingRecord.estado,
        message: `Ya registraste tu asistencia para esta sesión hoy a las ${timeStr}. Estado: ${existingRecord.estado.toUpperCase()}`,
        courseName: course?.nombre,
        weekNumber: week?.numero_semana,
        record: existingRecord,
      };
    }

    // 6. Calculate Presente vs Tardanza
    let status: AttendanceStatus = 'presente';
    if (week) {
      const [startHour, startMin] = week.hora_inicio.split(':').map(Number);
      const tolerance = week.tolerancia_minutos ?? this.settings.toleranciaDefectoMinutos ?? 15;

      const currentDate = new Date();
      const currentHour = currentDate.getHours();
      const currentMin = currentDate.getMinutes();

      const classStartTimeInMinutes = startHour * 60 + startMin;
      const currentTimeInMinutes = currentHour * 60 + currentMin;

      // If registered after start time + tolerance, it is a tardanza
      if (currentTimeInMinutes > classStartTimeInMinutes + tolerance) {
        status = 'tardanza';
      }
    }

    // 7. Save record
    const newRecord: AttendanceRecord = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      attendance_session_id: session.id,
      student_id: studentId,
      academic_week_id: session.academic_week_id,
      estado: status,
      registrado_en: new Date().toISOString(),
      metodo_registro: 'qr_scanner',
      observacion: status === 'tardanza' ? 'Registro fuera del rango de tolerancia reglamentaria' : undefined,
    };

    this.attendanceRecords.push(newRecord);
    this.notify();

    return {
      success: true,
      status,
      message:
        status === 'presente'
          ? '¡Asistencia registrada exitosamente! Estado: PRESENTE.'
          : 'Asistencia registrada con TARDANZA (superó el margen de tolerancia de la sesión).',
      courseName: course?.nombre,
      weekNumber: week?.numero_semana,
      record: newRecord,
    };
  }

  // --- Student Attendance History ---
  public getStudentCourses(studentId: string): (Course & {
    section: Section;
    attendanceRate: number;
    absencesCount: number;
    totalWeeks: number;
    isAtRisk: boolean;
  })[] {
    const studentEnrollments = this.enrollments.filter(
      (e) => e.student_id === studentId && e.estado === 'matriculado'
    );

    const result: (Course & {
      section: Section;
      attendanceRate: number;
      absencesCount: number;
      totalWeeks: number;
      isAtRisk: boolean;
    })[] = [];

    for (const enrollment of studentEnrollments) {
      const section = this.sections.find((s) => s.id === enrollment.section_id);
      if (!section) continue;

      const course = this.courses.find((c) => c.id === section.course_id);
      if (!course) continue;

      const weeks = this.getAllCourseWeeks(course.id);
      const finishedWeeks = weeks.filter((w) => w.estado === 'finalizada');

      // Count student attendance records
      let presentOrJustified = 0;
      let absences = 0;

      for (const w of finishedWeeks) {
        const record = this.attendanceRecords.find(
          (r) => r.academic_week_id === w.id && r.student_id === studentId
        );

        if (!record || record.estado === 'falta') {
          absences++;
        } else if (
          record.estado === 'presente' ||
          record.estado === 'tardanza' ||
          record.estado === 'justificado'
        ) {
          presentOrJustified++;
        }
      }

      const totalPast = finishedWeeks.length;
      const attendanceRate = totalPast > 0 ? Math.round((presentOrJustified / totalPast) * 100) : 100;
      const absenceRate = totalPast > 0 ? (absences / totalPast) * 100 : 0;
      const isAtRisk = absenceRate >= (this.settings.limiteInasistenciaPorcentaje || 30);

      result.push({
        ...course,
        section,
        attendanceRate,
        absencesCount: absences,
        totalWeeks: weeks.length,
        isAtRisk,
      });
    }

    return result;
  }

  public getStudentCourseWeeksWithStatus(
    studentId: string,
    courseId: string,
    sectionId: string
  ): (AcademicWeek & { record?: AttendanceRecord; displayStatus: AttendanceStatus })[] {
    const weeks = this.getAllCourseWeeks(courseId);

    return weeks.map((w) => {
      const record = this.attendanceRecords.find(
        (r) => r.academic_week_id === w.id && r.student_id === studentId
      );

      let displayStatus: AttendanceStatus = 'pendiente';
      if (record) {
        displayStatus = record.estado;
      } else if (w.estado === 'finalizada') {
        displayStatus = 'falta';
      } else {
        displayStatus = 'pendiente';
      }

      return {
        ...w,
        record,
        displayStatus,
      };
    });
  }

  // --- Manual Attendance Adjustment ---
  public manualUpdateAttendance(
    sessionId: string,
    studentId: string,
    weekId: string,
    status: AttendanceStatus,
    observacion?: string
  ): void {
    const existing = this.attendanceRecords.find(
      (r) => r.attendance_session_id === sessionId && r.student_id === studentId
    );

    if (existing) {
      existing.estado = status;
      existing.observacion = observacion || 'Actualizado manualmente por el docente titular';
      existing.metodo_registro = 'manual_docente';
    } else {
      this.attendanceRecords.push({
        id: `rec-man-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        attendance_session_id: sessionId,
        student_id: studentId,
        academic_week_id: weekId,
        estado: status,
        registrado_en: new Date().toISOString(),
        metodo_registro: 'manual_docente',
        observacion: observacion || 'Registrado manualmente por el docente titular',
      });
    }

    this.notify();
  }

  // --- Justifications ---
  public submitJustification(
    studentId: string,
    weekId: string,
    motivo: string,
    docName: string
  ): Justification {
    const justification: Justification = {
      id: `just-${Date.now()}`,
      student_id: studentId,
      academic_week_id: weekId,
      motivo,
      documento_nombre: docName || 'Documento_Sustento.pdf',
      documento_adjunto_url: '#',
      estado: 'pendiente',
      solicitada_en: new Date().toISOString(),
    };

    this.justifications.push(justification);
    this.notify();
    return justification;
  }

  public resolveJustification(
    justificationId: string,
    estado: 'aprobada' | 'rechazada',
    comentario: string,
    resolverId: string
  ): void {
    const just = this.justifications.find((j) => j.id === justificationId);
    if (!just) return;

    just.estado = estado;
    just.comentario_resolucion = comentario;
    just.resuelta_en = new Date().toISOString();
    just.resuelta_por = resolverId;

    if (estado === 'aprobada') {
      // Find or create attendance record for this week and mark as 'justificado'
      const existingRecord = this.attendanceRecords.find(
        (r) => r.academic_week_id === just.academic_week_id && r.student_id === just.student_id
      );

      if (existingRecord) {
        existingRecord.estado = 'justificado';
        existingRecord.observacion = `Justificación aprobada: ${comentario}`;
      } else {
        // Find session for this week
        const session = this.attendanceSessions.find((s) => s.academic_week_id === just.academic_week_id);
        if (session) {
          this.attendanceRecords.push({
            id: `rec-just-${Date.now()}`,
            attendance_session_id: session.id,
            academic_week_id: just.academic_week_id,
            student_id: just.student_id,
            estado: 'justificado',
            registrado_en: new Date().toISOString(),
            metodo_registro: 'justificado',
            observacion: `Justificación aprobada: ${comentario}`,
          });
        }
      }
    }

    this.notify();
  }

  // --- Admin Course & Weeks Creation Wizard ---
  public addCareer(career: Omit<Career, 'id' | 'creado_en'>): Career {
    const newCareer: Career = {
      ...career,
      id: `car-${Date.now()}`,
      creado_en: new Date().toISOString(),
    };
    this.careers.push(newCareer);
    this.notify();
    return newCareer;
  }

  public addCourseWithUnitsAndWeeks(
    courseData: Omit<Course, 'id' | 'creado_en'>,
    startDate: string,
    startTime: string,
    endTime: string,
    teacherId?: string
  ): Course {
    const courseId = `cou-${Date.now()}`;
    const newCourse: Course = {
      ...courseData,
      id: courseId,
      creado_en: new Date().toISOString(),
    };

    // 1. Create course
    this.courses.push(newCourse);

    // 2. Automatically generate the 3 units and 15 weeks
    const hierarchy = generateCourseAcademicHierarchy(courseId, newCourse.codigo, startDate, startTime, endTime);
    this.academicUnits.push(...hierarchy.units);
    this.academicWeeks.push(...hierarchy.weeks);

    // 3. Create default section A1
    const sectionId = `sec-${Date.now()}`;
    const newSection: Section = {
      id: sectionId,
      course_id: courseId,
      codigo: 'A1',
      nombre: `Sección A1 - ${newCourse.nombre}`,
      periodo_academico: this.settings.periodoVigente || '2026-II',
      activo: true,
    };
    this.sections.push(newSection);

    // 4. Assign teacher if provided
    if (teacherId) {
      this.teacherAssignments.push({
        id: `ta-${Date.now()}`,
        teacher_id: teacherId,
        section_id: sectionId,
      });
    }

    // 5. Enroll some sample students so attendance can be tested immediately
    const sampleStudents = this.users.filter((u) => u.rol === 'alumno');
    for (const stu of sampleStudents) {
      this.enrollments.push({
        id: `enr-${Date.now()}-${stu.id}`,
        student_id: stu.id,
        section_id: sectionId,
        estado: 'matriculado',
        matriculado_en: new Date().toISOString().split('T')[0],
      });
    }

    this.notify();
    return newCourse;
  }

  public updateWeek(weekId: string, updates: Partial<AcademicWeek>): void {
    const week = this.academicWeeks.find((w) => w.id === weekId);
    if (!week) return;
    Object.assign(week, updates);
    this.notify();
  }

  // --- Helpers ---
  private generateToken(weekId: string, sectionId: string, timestamp: number, expiresAt: number): string {
    const payload: QRTokenPayload = {
      sessionId: `sess-${weekId}-${sectionId}`,
      weekId,
      courseId: '',
      sectionId,
      timestamp,
      expiresAt,
      tokenHash: Math.random().toString(36).substring(2, 10).toUpperCase(),
    };
    return btoa(JSON.stringify(payload));
  }
}

export const store = AcademicStore.getInstance();
