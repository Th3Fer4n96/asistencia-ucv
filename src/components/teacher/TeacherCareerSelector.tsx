import React from 'react';
import { Career } from '../../types/academic';
import { GraduationCap, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';

interface TeacherCareerSelectorProps {
  careers: (Career & { coursesCount: number })[];
  onSelectCareer: (career: Career) => void;
}

export const TeacherCareerSelector: React.FC<TeacherCareerSelectorProps> = ({
  careers,
  onSelectCareer,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-blue-800">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs mb-3 border border-white/10">
            <GraduationCap className="w-3.5 h-3.5 text-red-400" />
            <span>Paso 1: Estructura Académica UCV</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selecciona una Carrera Universitaria
          </h2>
          <p className="mt-2 text-blue-200/90 text-sm leading-relaxed">
            Visualiza las escuelas profesionales y facultades con cursos asignados a tu carga lectiva institucional para el presente periodo académico.
          </p>
        </div>
      </div>

      {/* Grid of Careers */}
      {careers.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No tienes carreras asignadas</h3>
          <p className="text-sm text-slate-500 mt-1">
            Comunícate con la Dirección Académica o revisa la vista de Administrador para asignar cursos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {careers.map((career) => (
            <div
              key={career.id}
              onClick={() => onSelectCareer(career)}
              className="group relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-700/60 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 border border-blue-100 flex items-center justify-center font-black group-hover:bg-blue-900 group-hover:text-white transition-colors duration-200">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 font-mono">
                      {career.codigo}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        career.activo
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {career.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                    {career.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{career.facultad}</p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {career.descripcion}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-900" />
                  <span className="text-xs font-semibold text-slate-700">
                    <strong className="text-slate-900 text-sm">{career.coursesCount}</strong>{' '}
                    {career.coursesCount === 1 ? 'curso asignado' : 'cursos asignados'}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 group-hover:text-red-600 transition-colors">
                  <span>Ver cursos</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
