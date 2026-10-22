import React, { useState } from 'react';
import { Career, Course, Section, AcademicUnit, AcademicWeek } from '../../types/academic';
import { store } from '../../services/store';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  QrCode,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface TeacherCourseUnitsViewProps {
  career: Career;
  course: Course;
  section: Section;
  units: AcademicUnit[];
  selectedUnitNumber?: 1 | 2 | 3;
  onSelectWeek: (week: AcademicWeek, unit: AcademicUnit) => void;
  onBackToCourses: () => void;
}

export const TeacherCourseUnitsView: React.FC<TeacherCourseUnitsViewProps> = ({
  career,
  course,
  section,
  units,
  selectedUnitNumber = 1,
  onSelectWeek,
  onBackToCourses,
}) => {
  const [activeUnitNumber, setActiveUnitNumber] = useState<1 | 2 | 3>(selectedUnitNumber);

  // Get active unit object
  const currentUnit = units.find((u) => u.numero_unidad === activeUnitNumber) || units[0];

  // Get weeks for current unit (exactly 5 weeks)
  const currentUnitWeeks = currentUnit ? store.getUnitWeeks(currentUnit.id) : [];

  // Helper for status badge
  const getStatusBadge = (status: AcademicWeek['estado']) => {
    switch (status) {
      case 'en_curso':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-xs animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            En curso (QR Activo)
          </span>
        );
      case 'finalizada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Finalizada
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pendiente de iniciar
          </span>
        );
      case 'cancelada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            Cancelada
          </span>
        );
      case 'programada':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            Programada
          </span>
        );
    }
  };

  // Helper to compute unit attendance progress
  const getUnitAttendanceRate = (unit: AcademicUnit) => {
    const weeks = store.getUnitWeeks(unit.id);
    const finishedWeeks = weeks.filter((w) => w.estado === 'finalizada');
    if (finishedWeeks.length === 0) return { rate: 0, completedCount: 0 };

    let totalPercentageSum = 0;
    for (const w of finishedWeeks) {
      const stats = store.getWeekStats(w.id, section.id);
      totalPercentageSum += stats.percentage;
    }

    return {
      rate: Math.round(totalPercentageSum / finishedWeeks.length),
      completedCount: finishedWeeks.length,
    };
  };

  return (
    <div className="space-y-6">
      {/* Course Context Header */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 rounded-2xl p-6 sm:p-7 text-white shadow-lg border border-blue-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-red-600 text-white text-xs font-black tracking-wide uppercase">
                {career.nombre}
              </span>
              <span className="text-blue-300 text-xs">•</span>
              <span className="text-xs font-mono font-semibold text-blue-200 bg-white/10 px-2 py-0.5 rounded">
                Sec. {section.codigo} ({section.periodo_academico})
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{course.nombre}</h2>
            <p className="text-blue-200/90 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Estructura curricular oficial: 3 Unidades académicas con 5 semanas cada una (15 semanas en total).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={onBackToCourses}
              className="px-3.5 py-2 text-xs font-bold text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer border border-white/15"
            >
              Cambiar de curso
            </button>
          </div>
        </div>
      </div>

      {/* Paso 3: Las 3 Unidades (Pestañas / Tarjetas Superiores) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {units.map((unit) => {
          const isActive = unit.numero_unidad === activeUnitNumber;
          const { rate, completedCount } = getUnitAttendanceRate(unit);
          const weeksRange =
            unit.numero_unidad === 1
              ? 'Semanas 1 – 5'
              : unit.numero_unidad === 2
              ? 'Semanas 6 – 10'
              : 'Semanas 11 – 15';

          return (
            <button
              key={unit.id}
              type="button"
              onClick={() => setActiveUnitNumber(unit.numero_unidad)}
              className={`text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-blue-900 shadow-md ring-2 ring-blue-900/20'
                  : 'bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                      isActive ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Unidad {unit.numero_unidad}
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-mono">{weeksRange}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1 mt-1">
                  {unit.nombre.replace(/^Unidad \d+:\s*/, '')}
                </h3>
              </div>

              {/* Progress Bar of Unit Attendance */}
              <div className="mt-4 pt-3 border-t border-slate-100 w-full">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium">
                    {completedCount} de 5 semanas cerradas
                  </span>
                  <span className="font-extrabold text-blue-950 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-red-600" />
                    {rate}% asist.
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-700 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Paso 4: Las 5 Semanas de la Unidad Seleccionada */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              <span>Programación Semanal</span>
              <span>•</span>
              <span>Unidad {currentUnit?.numero_unidad}</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {currentUnit?.nombre}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Haz clic en «Gestionar asistencia» para abrir la sesión y generar el código QR dinámico institucional.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 text-slate-700">
              5 semanas académicas
            </span>
          </div>
        </div>

        {/* List of the 5 Weeks */}
        <div className="space-y-3.5">
          {currentUnitWeeks.map((week) => {
            const stats = store.getWeekStats(week.id, section.id);
            const isCompleted = week.estado === 'finalizada';
            const isInProgress = week.estado === 'en_curso';

            return (
              <div
                key={week.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isInProgress
                    ? 'bg-emerald-50/40 border-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200'
                }`}
              >
                {/* Left: Week Number, Theme, Date & Time */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-blue-950 text-white text-xs font-black font-mono">
                      Semana {week.numero_semana}
                    </span>
                    {getStatusBadge(week.estado)}
                    <span className="text-xs text-slate-400 font-mono">•</span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Tolerancia: {week.tolerancia_minutos} min
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {week.tema}
                  </h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-900" />
                      Fecha:{' '}
                      <strong className="text-slate-800">
                        {new Date(week.fecha_clase + 'T00:00:00').toLocaleDateString('es-PE', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </strong>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-900" />
                      Horario:{' '}
                      <strong className="text-slate-800">
                        {week.hora_inicio} - {week.hora_fin}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Middle: Stats for this week (Enrolled, Present, Late, Absent, %) */}
                <div className="flex items-center gap-3 sm:gap-6 py-2 px-3 sm:px-4 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Matriculados</div>
                    <div className="text-sm font-black text-slate-900 flex items-center justify-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {stats.totalEnrolled}
                    </div>
                  </div>

                  <div className="h-6 w-px bg-slate-200" />

                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-emerald-600">Presentes</div>
                    <div className="text-sm font-black text-emerald-700">{stats.presentes}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-amber-600">Tardanzas</div>
                    <div className="text-sm font-black text-amber-700">{stats.tardanzas}</div>
                  </div>

                  {isCompleted && (
                    <div className="text-center">
                      <div className="text-[10px] uppercase font-bold text-red-600">Faltas</div>
                      <div className="text-sm font-black text-red-700">{stats.faltas}</div>
                    </div>
                  )}

                  <div className="h-6 w-px bg-slate-200" />

                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Asistencia</div>
                    <div
                      className={`text-sm font-black ${
                        stats.percentage >= 80
                          ? 'text-emerald-700'
                          : stats.percentage > 0
                          ? 'text-amber-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {stats.percentage}%
                    </div>
                  </div>
                </div>

                {/* Right: Action Button "Gestionar asistencia" */}
                <div className="shrink-0 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => onSelectWeek(week, currentUnit)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
                      isInProgress
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-blue-900 hover:bg-blue-950 text-white'
                    }`}
                  >
                    {isInProgress ? (
                      <>
                        <QrCode className="w-4 h-4 animate-spin-slow" />
                        <span>Ver QR en pantalla</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4" />
                        <span>Gestionar asistencia</span>
                      </>
                    )}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
