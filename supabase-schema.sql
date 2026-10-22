-- ==============================================================================
-- SISTEMA ASISQR UCV: ESTRUCTURA ACADÉMICA JERÁRQUICA Y CONTROL DE ASISTENCIA
-- Base de Datos para Supabase / PostgreSQL con Políticas RLS, Índices y Restricciones
-- ==============================================================================

-- Extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: CARRERAS UNIVERSITARIAS (careers)
CREATE TABLE IF NOT EXISTS public.careers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    facultad VARCHAR(150),
    campus VARCHAR(100) DEFAULT 'Campus Lima Norte',
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA: CURSOS (courses)
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    career_id UUID NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    ciclo SMALLINT CHECK (ciclo BETWEEN 1 AND 12),
    creditos SMALLINT DEFAULT 4,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_career_course_code UNIQUE (career_id, codigo)
);

-- 3. TABLA: SECCIONES (sections)
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    codigo VARCHAR(10) NOT NULL, -- Ej: 'A1', 'B2'
    nombre VARCHAR(100) NOT NULL,
    periodo_academico VARCHAR(20) NOT NULL, -- Ej: '2026-I'
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_course_section_period UNIQUE (course_id, codigo, periodo_academico)
);

-- 4. TABLA: ASIGNACIONES DE DOCENTES (teacher_assignments)
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL, -- Referencia a auth.users o public.users
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    asignado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_teacher_section UNIQUE (teacher_id, section_id)
);

-- 5. TABLA: MATRÍCULAS (enrollments)
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL, -- Referencia a auth.users o public.users
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    estado VARCHAR(20) DEFAULT 'matriculado' CHECK (estado IN ('matriculado', 'retirado', 'inhabilitado')),
    matriculado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_student_section UNIQUE (student_id, section_id)
);

-- 6. TABLA: UNIDADES ACADÉMICAS (academic_units)
-- REGLA DE NEGOCIO: Cada curso tiene exactamente 3 unidades (1, 2 y 3)
CREATE TABLE IF NOT EXISTS public.academic_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    numero_unidad SMALLINT NOT NULL CHECK (numero_unidad IN (1, 2, 3)),
    nombre VARCHAR(150) NOT NULL,
    competencia TEXT,
    CONSTRAINT uq_course_unit_number UNIQUE (course_id, numero_unidad)
);

-- 7. TABLA: SEMANAS ACADÉMICAS (academic_weeks)
-- REGLA DE NEGOCIO: Cada unidad tiene 5 semanas (1-5 para Unidad 1, 6-10 para Unidad 2, 11-15 para Unidad 3)
CREATE TABLE IF NOT EXISTS public.academic_weeks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_unit_id UUID NOT NULL REFERENCES public.academic_units(id) ON DELETE CASCADE,
    numero_semana SMALLINT NOT NULL CHECK (numero_semana BETWEEN 1 AND 15),
    tema VARCHAR(200) NOT NULL,
    fecha_clase DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    tolerancia_minutos SMALLINT DEFAULT 15 CHECK (tolerancia_minutos >= 0),
    estado VARCHAR(20) DEFAULT 'programada' CHECK (estado IN ('programada', 'pendiente', 'en_curso', 'finalizada', 'cancelada')),
    CONSTRAINT uq_unit_week_number UNIQUE (academic_unit_id, numero_semana)
);

-- 8. TABLA: SESIONES DE ASISTENCIA (attendance_sessions)
-- REGLA DE NEGOCIO: Solo una sesión por semana y sección. No duplicar asistencias.
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_week_id UUID NOT NULL REFERENCES public.academic_weeks(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    docente_id UUID NOT NULL,
    iniciada_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    finalizada_en TIMESTAMP WITH TIME ZONE,
    estado VARCHAR(20) DEFAULT 'en_curso' CHECK (estado IN ('en_curso', 'finalizada', 'cancelada')),
    codigo_qr_actual TEXT,
    qr_expira_en TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_session_week_section UNIQUE (academic_week_id, section_id)
);

-- 9. TABLA: REGISTROS DE ASISTENCIA (attendance_records)
-- REGLA DE NEGOCIO: Un único registro por alumno y sesión de asistencia
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    academic_week_id UUID NOT NULL REFERENCES public.academic_weeks(id) ON DELETE CASCADE,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('presente', 'tardanza', 'falta', 'justificado', 'pendiente')),
    registrado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metodo_registro VARCHAR(30) DEFAULT 'qr_scanner' CHECK (metodo_registro IN ('qr_scanner', 'manual_docente', 'justificado')),
    observacion TEXT,
    ip_or_device VARCHAR(100),
    CONSTRAINT uq_record_session_student UNIQUE (attendance_session_id, student_id)
);

-- 10. TABLA: JUSTIFICACIONES DE INASISTENCIA (justifications)
CREATE TABLE IF NOT EXISTS public.justifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    academic_week_id UUID NOT NULL REFERENCES public.academic_weeks(id) ON DELETE CASCADE,
    attendance_record_id UUID REFERENCES public.attendance_records(id) ON DELETE SET NULL,
    motivo TEXT NOT NULL,
    documento_adjunto_url TEXT,
    documento_nombre VARCHAR(255),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
    solicitada_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resuelta_en TIMESTAMP WITH TIME ZONE,
    resuelta_por UUID,
    comentario_resolucion TEXT
);

-- 11. TABLA: AUDITORÍA (audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(50) NOT NULL,
    entidad_id UUID,
    detalles JSONB,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ÍNDICES DE RENDIMIENTO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_courses_career ON public.courses(career_id);
CREATE INDEX IF NOT EXISTS idx_sections_course ON public.sections(course_id);
CREATE INDEX IF NOT EXISTS idx_units_course ON public.academic_units(course_id);
CREATE INDEX IF NOT EXISTS idx_weeks_unit ON public.academic_weeks(academic_unit_id);
CREATE INDEX IF NOT EXISTS idx_weeks_semana ON public.academic_weeks(numero_semana);
CREATE INDEX IF NOT EXISTS idx_sessions_week ON public.attendance_sessions(academic_week_id);
CREATE INDEX IF NOT EXISTS idx_records_session ON public.attendance_records(attendance_session_id);
CREATE INDEX IF NOT EXISTS idx_records_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_records_week ON public.attendance_records(academic_week_id);

-- ==============================================================================
-- FUNCIÓN: Cierre de Sesión y Marcado de Faltas Automático
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.fn_close_attendance_session(p_session_id UUID)
RETURNS VOID AS $$
DECLARE
    v_section_id UUID;
    v_week_id UUID;
BEGIN
    SELECT section_id, academic_week_id INTO v_section_id, v_week_id
    FROM public.attendance_sessions
    WHERE id = p_session_id;

    -- 1. Marcar sesión como finalizada
    UPDATE public.attendance_sessions
    SET estado = 'finalizada', finalizada_en = now()
    WHERE id = p_session_id;

    -- 2. Marcar la semana como finalizada
    UPDATE public.academic_weeks
    SET estado = 'finalizada'
    WHERE id = v_week_id;

    -- 3. Insertar 'falta' para aquellos estudiantes matriculados que no registraron asistencia
    INSERT INTO public.attendance_records (
        attendance_session_id,
        student_id,
        academic_week_id,
        estado,
        registrado_en,
        metodo_registro,
        observacion
    )
    SELECT 
        p_session_id,
        e.student_id,
        v_week_id,
        'falta',
        now(),
        'manual_docente',
        'Inasistencia registrada automáticamente al cierre de sesión'
    FROM public.enrollments e
    WHERE e.section_id = v_section_id
      AND e.estado = 'matriculado'
      AND NOT EXISTS (
          SELECT 1 FROM public.attendance_records ar
          WHERE ar.attendance_session_id = p_session_id
            AND ar.student_id = e.student_id
      );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- POLÍTICAS RLS (Row Level Security)
-- ==============================================================================
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Lectura pública para usuarios autenticados
CREATE POLICY "Lectura carreras para usuarios autenticados" ON public.careers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lectura cursos para usuarios autenticados" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lectura unidades para usuarios autenticados" ON public.academic_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lectura semanas para usuarios autenticados" ON public.academic_weeks FOR SELECT TO authenticated USING (true);

-- Alumnos solo ven sus registros
CREATE POLICY "Alumnos ven sus asistencias" ON public.attendance_records
    FOR SELECT TO authenticated
    USING (student_id = auth.uid());

-- Alumnos pueden insertar su registro vía validación QR
CREATE POLICY "Alumnos insertan asistencia propia" ON public.attendance_records
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid());
