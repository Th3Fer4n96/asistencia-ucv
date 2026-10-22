import React, { useState } from 'react';
import { Career, Course, Section, AcademicUnit, AcademicWeek, User } from '../../types/academic';
import { store } from '../../services/store';
import {
  Building2,
  BookOpen,
  Calendar,
  Users,
  Plus,
  Layers,
  Settings,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  FileCode,
  Copy,
  Check,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'carreras_cursos' | 'programacion' | 'reportes' | 'justificaciones' | 'sql'
  >('carreras_cursos');

  // Careers state
  const [showNewCareerModal, setShowNewCareerModal] = useState<boolean>(false);
  const [careerCode, setCareerCode] = useState<string>('');
  const [careerName, setCareerName] = useState<string>('');
  const [careerFacultad, setCareerFacultad] = useState<string>('Facultad de Ingeniería y Arquitectura');
  const [careerDesc, setCareerDesc] = useState<string>('');

  // Course wizard state
  const [showNewCourseModal, setShowNewCourseModal] = useState<boolean>(false);
  const [selectedCareerIdForCourse, setSelectedCareerIdForCourse] = useState<string>(
    store.careers[0]?.id || ''
  );
  const [courseCode, setCourseCode] = useState<string>('');
  const [courseName, setCourseName] = useState<string>('');
  const [courseCiclo, setCourseCiclo] = useState<number>(4);
  const [courseStartDate, setCourseStartDate] = useState<string>('2026-08-25');
  const [courseStartTime, setCourseStartTime] = useState<string>('08:00');
  const [courseEndTime, setCourseEndTime] = useState<string>('10:30');
  const [courseTeacherId, setCourseTeacherId] = useState<string>('doc-1');

  // Filter state for reports
  const [reportCareerId, setReportCareerId] = useState<string>('');
  const [reportCourseId, setReportCourseId] = useState<string>('');
  const [reportUnitFilter, setReportUnitFilter] = useState<string>('all');

  // SQL Copy feedback
  const [sqlCopied, setSqlCopied] = useState<boolean>(false);

  // Edit week modal
  const [editingWeek, setEditingWeek] = useState<AcademicWeek | null>(null);
  const [editWeekDate, setEditWeekDate] = useState<string>('');
  const [editWeekStart, setEditWeekStart] = useState<string>('');
  const [editWeekEnd, setEditWeekEnd] = useState<string>('');
  const [editWeekTolerance, setEditWeekTolerance] = useState<number>(15);
  const [editWeekTema, setEditWeekTema] = useState<string>('');

  // Read current data
  const careers = store.careers;
  const courses = store.courses;
  const teachers = store.users.filter((u) => u.rol === 'docente');
  const justifications = store.justifications;

  // Handle create Career
  const handleCreateCareer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerCode || !careerName) return;

    store.addCareer({
      codigo: careerCode.trim().toUpperCase(),
      nombre: careerName.trim(),
      facultad: careerFacultad,
      campus: 'Campus Lima Norte',
      descripcion: careerDesc,
      activo: true,
    });

    setShowNewCareerModal(false);
    setCareerCode('');
    setCareerName('');
    setCareerDesc('');
  };

  // Handle create Course with 3 Units & 15 Weeks auto-generation
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !courseName || !selectedCareerIdForCourse) return;

    store.addCourseWithUnitsAndWeeks(
      {
        career_id: selectedCareerIdForCourse,
        codigo: courseCode.trim().toUpperCase(),
        nombre: courseName.trim(),
        ciclo: Number(courseCiclo),
        creditos: 4,
        descripcion: `Asignatura obligatoria del Plan de Estudios UCV. 3 Unidades académicas y 15 semanas de clase.`,
        activo: true,
      },
      courseStartDate,
      courseStartTime,
      courseEndTime,
      courseTeacherId
    );

    setShowNewCourseModal(false);
    setCourseCode('');
    setCourseName('');
  };

  // Handle resolve justification
  const handleResolveJustification = (justId: string, status: 'aprobada' | 'rechazada') => {
    const comment = prompt(
      status === 'aprobada'
        ? 'Ingresa una resolución u observación de aprobación:'
        : 'Indica el motivo del rechazo de la justificación:'
    );
    if (comment === null) return;

    store.resolveJustification(justId, status, comment || 'Evaluado por Dirección Académica UCV', 'adm-1');
  };

  // Handle edit week schedule
  const handleSaveWeekEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWeek) return;

    store.updateWeek(editingWeek.id, {
      fecha_clase: editWeekDate,
      hora_inicio: editWeekStart,
      hora_fin: editWeekEnd,
      tolerancia_minutos: editWeekTolerance,
      tema: editWeekTema,
    });

    setEditingWeek(null);
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-600/90 text-white text-xs font-bold mb-2">
            <span>Dirección de Asuntos Académicos UCV</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Panel de Administración y Control Curricular
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Gestión institucional de carreras, cursos, estructura fija de 3 unidades y 15 semanas académicas, programación y auditoría de asistencias.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => store.resetToFactory()}
            className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer border border-white/10"
          >
            Restablecer Demo UCV
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <button
          onClick={() => setActiveTab('carreras_cursos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'carreras_cursos'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Carreras y Cursos (3U × 15S)</span>
        </button>

        <button
          onClick={() => setActiveTab('programacion')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'programacion'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Programación de Semanas</span>
        </button>

        <button
          onClick={() => setActiveTab('reportes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'reportes'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Reportes Jerárquicos y Faltas</span>
        </button>

        <button
          onClick={() => setActiveTab('justificaciones')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
            activeTab === 'justificaciones'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Justificaciones de Falta</span>
          {justifications.filter((j) => j.estado === 'pendiente').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'sql'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Esquema SQL Supabase</span>
        </button>
      </div>

      {/* Tab 1: Carreras y Cursos */}
      {activeTab === 'carreras_cursos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-slate-900">Estructura Curricular Institucional</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cada curso registrado genera automáticamente 3 unidades y 15 semanas garantizadas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewCareerModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Carrera</span>
              </button>

              <button
                onClick={() => setShowNewCourseModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-blue-900 hover:bg-blue-950 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Curso (3U + 15S)</span>
              </button>
            </div>
          </div>

          {/* Careers & Courses Accordion/List */}
          <div className="space-y-4">
            {careers.map((career) => {
              const careerCourses = courses.filter((c) => c.career_id === career.id);

              return (
                <div
                  key={career.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
                >
                  <div className="p-5 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                        {career.codigo.substring(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-red-600">
                            {career.codigo}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {career.facultad}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-900">{career.nombre}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">
                        {careerCourses.length} cursos registrados
                      </span>
                    </div>
                  </div>

                  {/* Courses Table under this Career */}
                  <div className="p-4 overflow-x-auto">
                    {careerCourses.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">
                        No hay cursos registrados en esta carrera universitaria.
                      </p>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-400 font-semibold border-b border-slate-100">
                            <th className="py-2.5 px-3">Código</th>
                            <th className="py-2.5 px-3">Nombre del Curso</th>
                            <th className="py-2.5 px-3">Ciclo</th>
                            <th className="py-2.5 px-3">Estructura</th>
                            <th className="py-2.5 px-3">Docente Asignado</th>
                            <th className="py-2.5 px-3 text-right">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {careerCourses.map((c) => {
                            const section = store.sections.find((s) => s.course_id === c.id);
                            const assignment = section
                              ? store.teacherAssignments.find((ta) => ta.section_id === section.id)
                              : null;
                            const teacher = assignment
                              ? store.users.find((u) => u.id === assignment.teacher_id)
                              : null;
                            const units = store.getCourseUnits(c.id);
                            const weeks = store.getAllCourseWeeks(c.id);

                            return (
                              <tr key={c.id} className="hover:bg-slate-50/70">
                                <td className="py-3 px-3 font-mono font-bold text-blue-900">
                                  {c.codigo}
                                </td>
                                <td className="py-3 px-3 font-bold text-slate-800">{c.nombre}</td>
                                <td className="py-3 px-3 text-slate-600">Ciclo {c.ciclo}</td>
                                <td className="py-3 px-3">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 font-bold text-[11px] border border-blue-200">
                                    <Layers className="w-3 h-3 text-blue-700" />
                                    {units.length} Unidades • {weeks.length} Semanas
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-slate-700 font-medium">
                                  {teacher ? `${teacher.nombre} ${teacher.apellidos}` : 'Sin asignar'}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                    Activo
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Programación de Semanas */}
      {activeTab === 'programacion' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              Gestor de Fechas y Horarios de Semanas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ajusta las fechas de clase, horas y márgenes de tolerancia de cualquiera de las 15 semanas del semestre.
            </p>
          </div>

          {/* Select Course Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Selecciona la Carrera
              </label>
              <select
                value={reportCareerId || careers[0]?.id}
                onChange={(e) => {
                  setReportCareerId(e.target.value);
                  setReportCourseId('');
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {careers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.codigo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Selecciona el Curso
              </label>
              <select
                value={
                  reportCourseId ||
                  courses.find((c) => c.career_id === (reportCareerId || careers[0]?.id))?.id ||
                  courses[0]?.id
                }
                onChange={(e) => setReportCourseId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {courses
                  .filter((c) => c.career_id === (reportCareerId || careers[0]?.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.codigo})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Table of all 15 weeks */}
          {(() => {
            const currentSelectedCourseId =
              reportCourseId ||
              courses.find((c) => c.career_id === (reportCareerId || careers[0]?.id))?.id ||
              courses[0]?.id;

            const weeks = store.getAllCourseWeeks(currentSelectedCourseId);

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Semana</th>
                      <th className="py-3 px-3">Unidad</th>
                      <th className="py-3 px-3">Tema Académico</th>
                      <th className="py-3 px-3">Fecha de Clase</th>
                      <th className="py-3 px-3">Horario</th>
                      <th className="py-3 px-3">Tolerancia</th>
                      <th className="py-3 px-3">Estado</th>
                      <th className="py-3 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {weeks.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-mono font-black text-blue-950">
                          Semana {w.numero_semana}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          Unidad {w.numero_unidad}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-900 max-w-xs truncate">
                          {w.tema}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">{w.fecha_clase}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {w.hora_inicio} - {w.hora_fin}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{w.tolerancia_minutos} min</td>
                        <td className="py-3 px-3 capitalize">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              w.estado === 'finalizada'
                                ? 'bg-slate-100 text-slate-700'
                                : w.estado === 'en_curso'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-50 text-blue-800'
                            }`}
                          >
                            {w.estado.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingWeek(w);
                              setEditWeekDate(w.fecha_clase);
                              setEditWeekStart(w.hora_inicio);
                              setEditWeekEnd(w.hora_fin);
                              setEditWeekTolerance(w.tolerancia_minutos);
                              setEditWeekTema(w.tema);
                            }}
                            className="text-blue-700 hover:text-blue-900 font-bold hover:underline cursor-pointer"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* Tab 3: Reportes Jerárquicos */}
      {activeTab === 'reportes' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              Reporte Consolidado de Asistencia y Faltas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisión de métricas según reglamento institucional UCV y monitoreo de riesgo de inhabilitación (DPI).
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Carreras</div>
              <div className="text-2xl font-black text-slate-900">{careers.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Cursos</div>
              <div className="text-2xl font-black text-slate-900">{courses.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="text-[10px] uppercase font-bold text-emerald-700">Asistencias Totales</div>
              <div className="text-2xl font-black text-emerald-800">
                {store.attendanceRecords.filter((r) => r.estado === 'presente' || r.estado === 'tardanza').length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-red-50 border border-red-100">
              <div className="text-[10px] uppercase font-bold text-red-700">Faltas Registradas</div>
              <div className="text-2xl font-black text-red-800">
                {store.attendanceRecords.filter((r) => r.estado === 'falta').length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Justificaciones */}
      {activeTab === 'justificaciones' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              Bandeja de Justificaciones de Inasistencia
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Las justificaciones aprobadas actualizan el cálculo del alumno sin borrar la auditoría original.
            </p>
          </div>

          <div className="space-y-3">
            {justifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No hay solicitudes de justificación registradas.
              </p>
            ) : (
              justifications.map((just) => {
                const student = store.users.find((u) => u.id === just.student_id);
                const week = store.academicWeeks.find((w) => w.id === just.academic_week_id);

                return (
                  <div
                    key={just.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {student?.apellidos}, {student?.nombre}
                        </span>
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {student?.codigo}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            just.estado === 'aprobada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : just.estado === 'rechazada'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {just.estado.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium">
                        Semana {week?.numero_semana}: {week?.tema} ({week?.fecha_clase})
                      </p>

                      <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                        <strong>Motivo:</strong> {just.motivo}
                      </p>

                      {just.documento_nombre && (
                        <div className="text-[11px] text-blue-900 font-mono flex items-center gap-1 mt-1">
                          <span>Adjunto: {just.documento_nombre}</span>
                        </div>
                      )}
                    </div>

                    {just.estado === 'pendiente' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleResolveJustification(just.id, 'aprobada')}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer shadow-2xs"
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveJustification(just.id, 'rechazada')}
                          className="px-3.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg cursor-pointer"
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Supabase SQL Schema Viewer */}
      {activeTab === 'sql' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Esquema de Base de Datos para Supabase
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                DDL con tablas jerárquicas (careers, courses, academic_units, academic_weeks, attendance_sessions, attendance_records), RLS policies e índices.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/supabase-schema.sql"
                download="supabase-schema.sql"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descargar .SQL</span>
              </a>
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl text-slate-200 text-xs font-mono max-h-96 overflow-y-auto leading-relaxed">
            <pre>
{`-- Consulta el archivo completo en /supabase-schema.sql
CREATE TABLE public.careers (...);
CREATE TABLE public.courses (...);
CREATE TABLE public.academic_units (...); -- EXACTAMENTE 3 UNIDADES (1, 2, 3)
CREATE TABLE public.academic_weeks (...); -- EXACTAMENTE 5 SEMANAS POR UNIDAD (1-15)
CREATE TABLE public.attendance_sessions (...); -- 1 SESIÓN POR SEMANA Y SECCIÓN
CREATE TABLE public.attendance_records (...); -- UNIQUE (session_id, student_id)
CREATE TABLE public.justifications (...);
CREATE TABLE public.audit_logs (...);`}
            </pre>
          </div>
        </div>
      )}

      {/* Modal: Nueva Carrera */}
      {showNewCareerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Registrar Carrera Universitaria</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Añade una nueva escuela profesional a la oferta académica UCV.
            </p>

            <form onSubmit={handleCreateCareer} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Código de la Carrera *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: CIV-UCV, ARQ-UCV"
                  value={careerCode}
                  onChange={(e) => setCareerCode(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre de la Carrera *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ingeniería Civil"
                  value={careerName}
                  onChange={(e) => setCareerName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Facultad</label>
                <input
                  type="text"
                  value={careerFacultad}
                  onChange={(e) => setCareerFacultad(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={careerDesc}
                  onChange={(e) => setCareerDesc(e.target.value)}
                  placeholder="Perfil profesional del egresado..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCareerModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 rounded-xl cursor-pointer"
                >
                  Crear Carrera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Curso con Generación Automática de 3 Unidades y 15 Semanas */}
      {showNewCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase">
                  Generador Curricular Automático
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Registrar Curso con 3 Unidades y 15 Semanas
                </h3>
              </div>
              <button
                onClick={() => setShowNewCourseModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              El sistema generará <strong>exactamente 3 unidades</strong> y sus{' '}
              <strong>15 semanas consecutivas</strong> con fechas y horarios programados de acuerdo a la normativa institucional.
            </p>

            <form onSubmit={handleCreateCourse} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Carrera a la que pertenece *
                </label>
                <select
                  value={selectedCareerIdForCourse}
                  onChange={(e) => setSelectedCareerIdForCourse(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                  required
                >
                  {careers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.codigo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre de la Asignatura *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Inteligencia Artificial"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Código *</label>
                  <input
                    type="text"
                    required
                    placeholder="IA-701"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha de Inicio de Clases (Semana 1) *
                  </label>
                  <input
                    type="date"
                    required
                    value={courseStartDate}
                    onChange={(e) => setCourseStartDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Docente Asignado *
                  </label>
                  <select
                    value={courseTeacherId}
                    onChange={(e) => setCourseTeacherId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre} {t.apellidos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora Inicio *</label>
                  <input
                    type="time"
                    required
                    value={courseStartTime}
                    onChange={(e) => setCourseStartTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora Fin *</label>
                  <input
                    type="time"
                    required
                    value={courseEndTime}
                    onChange={(e) => setCourseEndTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-800" />
                  Estructura generada de forma automática:
                </span>
                <p className="text-[11px] text-blue-800/80">
                  • 3 Unidades académicas (Unidad 1, Unidad 2, Unidad 3)
                  <br />
                  • 15 Semanas de clase programadas semanalmente a partir de la fecha seleccionada
                  <br />
                  • Sección A1 y matrícula de estudiantes para pruebas inmediatas
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCourseModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-blue-900 hover:bg-blue-950 rounded-xl cursor-pointer shadow-xs"
                >
                  Generar Curso y Semanas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Semana */}
      {editingWeek && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Modificar Semana {editingWeek.numero_semana}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unidad {editingWeek.numero_unidad} • Edición de programación
            </p>

            <form onSubmit={handleSaveWeekEdit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tema Académico
                </label>
                <input
                  type="text"
                  required
                  value={editWeekTema}
                  onChange={(e) => setEditWeekTema(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Clase</label>
                <input
                  type="date"
                  required
                  value={editWeekDate}
                  onChange={(e) => setEditWeekDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    required
                    value={editWeekStart}
                    onChange={(e) => setEditWeekStart(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    required
                    value={editWeekEnd}
                    onChange={(e) => setEditWeekEnd(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tolerancia de Tardanza (minutos)
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  required
                  value={editWeekTolerance}
                  onChange={(e) => setEditWeekTolerance(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingWeek(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-900 rounded-xl cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
