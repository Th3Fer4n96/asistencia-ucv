import React, { useState } from 'react';
import { Course, Section, AcademicUnit, AcademicWeek, AttendanceStatus } from '../../types/academic';
import { store } from '../../services/store';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  FileText,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
} from 'lucide-react';

interface StudentCourseDetailProps {
  studentId: string;
  course: Course;
  section: Section;
  onBack: () => void;
  onOpenScanner: () => void;
}

export const StudentCourseDetail: React.FC<StudentCourseDetailProps> = ({
  studentId,
  course,
  section,
  onBack,
  onOpenScanner,
}) => {
  const [activeUnitNumber, setActiveUnitNumber] = useState<1 | 2 | 3>(1);
  const [justifyingWeek, setJustifyingWeek] = useState<AcademicWeek | null>(null);
  const [justificationMotivo, setJustificationMotivo] = useState<string>('');
  const [justificationDoc, setJustificationDoc] = useState<string>('Certificado_Medico.pdf');
  const [justificationSent, setJustificationSent] = useState<boolean>(false);

  const units = store.getCourseUnits(course.id);
  const currentUnit = units.find((u) => u.numero_unidad === activeUnitNumber) || units[0];

  // Get weeks for current unit with student attendance status
  const allWeeksWithStatus = store.getStudentCourseWeeksWithStatus(studentId, course.id, section.id);
  const currentUnitWeeks = allWeeksWithStatus.filter(
    (w) => w.academic_unit_id === currentUnit?.id
  );

  // Overall attendance calculation
  const totalCompletedWeeks = allWeeksWithStatus.filter((w) => w.estado === 'finalizada').length;
  const attendedWeeks = allWeeksWithStatus.filter(
    (w) =>
      w.displayStatus === 'presente' ||
      w.displayStatus === 'tardanza' ||
      w.displayStatus === 'justificado'
  ).length;
  const absences = allWeeksWithStatus.filter((w) => w.displayStatus === 'falta').length;

  const attendanceRate =
    totalCompletedWeeks > 0 ? Math.round((attendedWeeks / totalCompletedWeeks) * 100) : 100;
  const maxAbsenceLimit = store.settings.limiteInasistenciaPorcentaje || 30;
  const isAtRisk = totalCompletedWeeks > 0 && (absences / totalCompletedWeeks) * 100 >= maxAbsenceLimit;

  // Status badge helper
  const getAttendanceStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'presente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Presente
          </span>
        );
      case 'tardanza':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Tardanza
          </span>
        );
      case 'justificado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Justificado
          </span>
        );
      case 'falta':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            Falta
          </span>
        );
      case 'pendiente':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Pendiente
          </span>
        );
    }
  };

  const handleSendJustification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justifyingWeek || !justificationMotivo) return;

    store.submitJustification(
      studentId,
      justifyingWeek.id,
      justificationMotivo,
      justificationDoc
    );

    setJustificationSent(true);
    setTimeout(() => {
      setJustifyingWeek(null);
      setJustificationSent(false);
      setJustificationMotivo('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Course Context Header */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 rounded-2xl p-6 sm:p-7 text-white shadow-lg border border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-red-600 text-white text-xs font-black tracking-wide uppercase">
                {course.codigo}
              </span>
              <span className="text-blue-300 text-xs">•</span>
              <span className="text-xs font-mono font-semibold text-blue-200 bg-white/10 px-2 py-0.5 rounded">
                Sección {section.codigo} • Ciclo {course.ciclo}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{course.nombre}</h2>
            <p className="text-blue-200/90 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Consulta tus 15 semanas divididas en 3 unidades y verifica tus asistencias reglamentarias.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onBack}
              className="px-3.5 py-2.5 text-xs font-bold text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer border border-white/15"
            >
              <ChevronLeft className="w-4 h-4 inline mr-1" />
              Mis cursos
            </button>

            <button
              onClick={onOpenScanner}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 animate-bounce" />
              <span>Escanear QR de Clase</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Attendance Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-slate-400">Porcentaje Asistencia</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{attendanceRate}%</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              {attendedWeeks} de {totalCompletedWeeks} clases asistidas
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6 text-blue-900" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-slate-400">Inasistencias (Faltas)</div>
            <div className="text-2xl font-black text-red-600 mt-1">{absences}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Límite DPI: máx. {maxAbsenceLimit}% ({Math.ceil(15 * (maxAbsenceLimit / 100))} faltas)
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border shadow-2xs flex items-center justify-between ${
            isAtRisk
              ? 'bg-red-50/70 border-red-200 text-red-900'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          }`}
        >
          <div>
            <div className="text-xs font-bold uppercase opacity-75">Estado Académico</div>
            <div className="text-lg font-black mt-1">
              {isAtRisk ? 'Riesgo de Inhabilitación (DPI)' : 'Condición Regular'}
            </div>
            <div className="text-xs opacity-80 font-medium mt-0.5">
              {isAtRisk
                ? 'Has superado el límite de faltas permitido por reglamento UCV.'
                : 'Cumples con el reglamento de asistencia mínima.'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-xs">
            {isAtRisk ? (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            )}
          </div>
        </div>
      </div>

      {/* Las 3 Unidades (Tabs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {units.map((unit) => {
          const isActive = unit.numero_unidad === activeUnitNumber;
          const weeksRange =
            unit.numero_unidad === 1
              ? 'Semanas 1 – 5'
              : unit.numero_unidad === 2
              ? 'Semanas 6 – 10'
              : 'Semanas 11 – 15';

          const unitWeeks = allWeeksWithStatus.filter((w) => w.academic_unit_id === unit.id);
          const attendedInUnit = unitWeeks.filter(
            (w) =>
              w.displayStatus === 'presente' ||
              w.displayStatus === 'tardanza' ||
              w.displayStatus === 'justificado'
          ).length;

          return (
            <button
              key={unit.id}
              type="button"
              onClick={() => setActiveUnitNumber(unit.numero_unidad)}
              className={`text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-white border-blue-900 shadow-md ring-2 ring-blue-900/20'
                  : 'bg-white/80 hover:bg-white border-slate-200'
              }`}
            >
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

              <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1">
                {unit.nombre.replace(/^Unidad \d+:\s*/, '')}
              </h3>

              <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                <span>Asistencia en unidad:</span>
                <span className="font-bold text-blue-950">
                  {attendedInUnit} de 5 semanas
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Las 5 Semanas de la Unidad Seleccionada */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase">
              Programación de Unidad {currentUnit?.numero_unidad}
            </span>
            <h3 className="text-xl font-black text-slate-900">{currentUnit?.nombre}</h3>
          </div>

          <button
            onClick={onOpenScanner}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-blue-800" />
            <span>Registrar asistencia con QR</span>
          </button>
        </div>

        {/* 5 Weeks List */}
        <div className="space-y-3">
          {currentUnitWeeks.map((week) => {
            const hasRecord = Boolean(week.record);
            const isAbsent = week.displayStatus === 'falta';

            return (
              <div
                key={week.id}
                className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-950 text-white text-xs font-black font-mono">
                      Semana {week.numero_semana}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                      Sesión Regular
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {week.fecha_clase}
                    </span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {week.hora_inicio} - {week.hora_fin}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900">{week.tema}</h4>

                  {hasRecord && (
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>
                        Registrado a las{' '}
                        <strong>
                          {new Date(week.record!.registrado_en).toLocaleTimeString('es-PE', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </strong>
                      </span>
                      <span>•</span>
                      <span className="capitalize">
                        Método: {week.record!.metodo_registro === 'qr_scanner' ? 'QR Dinámico' : 'Docente'}
                      </span>
                      {week.record!.observacion && (
                        <>
                          <span>•</span>
                          <span className="italic text-slate-600 font-medium">
                            "{week.record!.observacion}"
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Status and Justify Option */}
                <div className="flex items-center gap-3 shrink-0">
                  {getAttendanceStatusBadge(week.displayStatus)}

                  {isAbsent && (
                    <button
                      type="button"
                      onClick={() => setJustifyingWeek(week)}
                      className="px-3 py-1.5 text-xs font-bold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Justificar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Justification Request Modal */}
      {justifyingWeek && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Solicitar Justificación de Inasistencia
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Semana {justifyingWeek.numero_semana}: {justifyingWeek.tema} ({justifyingWeek.fecha_clase})
            </p>

            {justificationSent ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900">¡Solicitud enviada a Dirección Académica!</h4>
                <p className="text-xs text-slate-500">
                  Tu justificación será evaluada según el reglamento de estudiantes UCV.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendJustification} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Motivo detallado de la falta *
                  </label>
                  <textarea
                    required
                    value={justificationMotivo}
                    onChange={(e) => setJustificationMotivo(e.target.value)}
                    rows={3}
                    placeholder="Ej: Cita médica de urgencia, trámite institucional o fuerza mayor..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Documento de sustento (PDF o imagen)
                  </label>
                  <input
                    type="text"
                    value={justificationDoc}
                    onChange={(e) => setJustificationDoc(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 font-mono text-slate-600"
                    placeholder="Nombre del archivo adjunto..."
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setJustifyingWeek(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-extrabold text-white bg-blue-900 hover:bg-blue-950 rounded-xl cursor-pointer"
                  >
                    Enviar Solicitud
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
