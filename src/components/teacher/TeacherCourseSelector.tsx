import React from 'react';
import { Career, Course, Section } from '../../types/academic';
import { BookOpen, Users, Calendar, ArrowRight, Layers, Percent } from 'lucide-react';

interface CourseWithMeta extends Course {
  section: Section;
  unitsCount: number;
  weeksCount: number;
  attendanceRate: number;
  totalStudents: number;
}

interface TeacherCourseSelectorProps {
  career: Career;
  courses: CourseWithMeta[];
  onSelectCourse: (course: CourseWithMeta) => void;
  onBack: () => void;
}

export const TeacherCourseSelector: React.FC<TeacherCourseSelectorProps> = ({
  career,
  courses,
  onSelectCourse,
  onBack,
}) => {
  return (
    <div className="space-y-6">
      {/* Header with Career Context */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              {career.facultad}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {career.codigo}
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{career.nombre}</h2>
          <p className="text-xs text-slate-500 mt-1">
            Selecciona el curso para gestionar sus 3 unidades y 15 semanas de clase.
          </p>
        </div>

        <button
          onClick={onBack}
          className="self-start sm:self-center px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          Cambiar de carrera
        </button>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No hay cursos asignados en esta carrera</h3>
          <p className="text-sm text-slate-500 mt-1">
            No se han encontrado secciones asignadas a tu usuario en {career.nombre}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const isHighAttendance = course.attendanceRate >= 80;
            const isMediumAttendance = course.attendanceRate >= 65 && course.attendanceRate < 80;

            return (
              <div
                key={`${course.id}-${course.section.id}`}
                className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-xl hover:border-blue-700/60 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Badge & Code */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 text-xs font-black font-mono rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
                      {course.codigo}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700">
                      Sec. {course.section.codigo}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-1">
                    {course.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Carrera: {career.nombre}
                  </p>

                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {course.descripcion}
                  </p>

                  {/* Structural Badges: 3 Units, 15 Weeks */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
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

                  {/* Attendance Rate */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-600 font-medium">
                        {course.totalStudents} matriculados
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-slate-400" />
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                          isHighAttendance
                            ? 'bg-emerald-100 text-emerald-800'
                            : isMediumAttendance
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {course.attendanceRate}% asistencia
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enter Button */}
                <button
                  type="button"
                  onClick={() => onSelectCourse(course)}
                  className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group-hover:bg-blue-900"
                >
                  <span>Ingresar al curso</span>
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
