import React from 'react';
import { Course, Section } from '../../types/academic';
import { store } from '../../services/store';
import { BookOpen, QrCode, ArrowRight, AlertTriangle, CheckCircle2, Percent, Layers, Calendar } from 'lucide-react';

interface EnrolledCourseWithStats extends Course {
  section: Section;
  attendanceRate: number;
  absencesCount: number;
  totalWeeks: number;
  isAtRisk: boolean;
}

interface StudentCoursesViewProps {
  studentId: string;
  courses: EnrolledCourseWithStats[];
  onSelectCourse: (course: Course, section: Section) => void;
  onOpenScanner: () => void;
}

export const StudentCoursesView: React.FC<StudentCoursesViewProps> = ({
  studentId,
  courses,
  onSelectCourse,
  onOpenScanner,
}) => {
  const currentUser = store.getCurrentUser();

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-blue-800">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs mb-3 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Portal del Estudiante UCV • {store.settings.periodoVigente}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hola, {currentUser.nombre}
            </h2>
            <p className="mt-1 text-blue-200/90 text-xs sm:text-sm leading-relaxed">
              Código institucional: <strong className="font-mono text-white">{currentUser.codigo}</strong>.
              Monitorea tus asistencias en cada una de las 15 semanas y 3 unidades de tus asignaturas.
            </p>
          </div>

          <button
            onClick={onOpenScanner}
            className="self-start sm:self-center shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <QrCode className="w-5 h-5 animate-pulse" />
            <span>Escanear Asistencia QR</span>
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No tienes asignaturas matriculadas</h3>
          <p className="text-sm text-slate-500 mt-1">
            Consulta en la Dirección de Registros Académicos UCV.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const isHighAttendance = course.attendanceRate >= 80;

            return (
              <div
                key={`${course.id}-${course.section.id}`}
                className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-xl hover:border-blue-700/60 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 text-xs font-black font-mono rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
                      {course.codigo}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700">
                      Sec. {course.section.codigo}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                    {course.nombre}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <Layers className="w-4 h-4 text-blue-700 shrink-0" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Estructura</div>
                        <div className="text-xs font-bold text-slate-800">3 Unidades</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <Calendar className="w-4 h-4 text-blue-700 shrink-0" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Total</div>
                        <div className="text-xs font-bold text-slate-800">15 Semanas</div>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Rate & Risk Status */}
                  <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Asistencia acumulada:</span>
                      <span
                        className={`font-black px-2 py-0.5 rounded-full ${
                          isHighAttendance
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {course.attendanceRate}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHighAttendance ? 'bg-emerald-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${course.attendanceRate}%` }}
                      />
                    </div>

                    {course.isAtRisk ? (
                      <div className="text-[11px] font-bold text-red-600 flex items-center gap-1 pt-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>En riesgo de inhabilitación por inasistencias</span>
                      </div>
                    ) : (
                      <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Asistencia reglamentaria al día</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCourse(course, course.section)}
                  className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <span>Ver 3 Unidades y 15 Semanas</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
