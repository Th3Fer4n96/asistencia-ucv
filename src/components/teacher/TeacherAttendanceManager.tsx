import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Career,
  Course,
  Section,
  AcademicUnit,
  AcademicWeek,
  AttendanceSession,
  AttendanceRecord,
  AttendanceStatus,
} from '../../types/academic';
import { store } from '../../services/store';
import { QRCodeDisplay } from '../common/QRCodeDisplay';
import {
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  RefreshCw,
  PowerOff,
  UserCheck,
  AlertCircle,
  FileSpreadsheet,
  Info,
  UserX,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  ChevronLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TeacherAttendanceManagerProps {
  career: Career;
  course: Course;
  section: Section;
  unit: AcademicUnit;
  week: AcademicWeek;
  onBackToWeeks: () => void;
}

export const TeacherAttendanceManager: React.FC<TeacherAttendanceManagerProps> = ({
  career,
  course,
  section,
  unit,
  week,
  onBackToWeeks,
}) => {
  const currentUser = store.getCurrentUser();
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [qrToken, setQrToken] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(10);
  const [isAutoRenewActive, setIsAutoRenewActive] = useState<boolean>(true);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [selectedStudentForManual, setSelectedStudentForManual] = useState<string>('');
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('presente');
  const [manualObservacion, setManualObservacion] = useState<string>('');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Interval ref
  const timerRef = useRef<any>(null);

  // Get enrolled students
  const enrolledStudents = store.getSectionStudents(section.id);

  // Fetch session & records
  const updateSessionData = useCallback(() => {
    const existing = store.attendanceSessions.find(
      (s) => s.academic_week_id === week.id && s.section_id === section.id
    );

    if (existing) {
      setSession({ ...existing });
      if (existing.codigo_qr_actual) {
        setQrToken(existing.codigo_qr_actual);
      }
    } else {
      setSession(null);
      setQrToken('');
    }
  }, [week.id, section.id]);

  useEffect(() => {
    updateSessionData();
    const unsubscribe = store.subscribe(() => {
      updateSessionData();
    });
    return () => unsubscribe();
  }, [updateSessionData]);

  // Start or activate attendance session
  const handleStartSession = () => {
    const res = store.startOrGetAttendanceSession(week.id, section.id, currentUser.id);
    if (res.error) {
      alert(res.error);
      return;
    }
    setSession(res.session);
    setQrToken(res.session.codigo_qr_actual || '');
    setCountdown(10);
    setFeedbackNotice('Sesión de asistencia iniciada correctamente. El código QR dinámico se renovará cada 10 segundos.');
  };

  // Close attendance session
  const handleCloseSession = () => {
    if (!session) return;
    const confirmClose = window.confirm(
      '¿Estás seguro de cerrar la asistencia de esta semana? Los alumnos que no registraron su presencia serán marcados como FALTA automáticamente.'
    );
    if (!confirmClose) return;

    const res = store.closeAttendanceSession(session.id);
    if (res.success) {
      setFeedbackNotice(
        `Sesión de asistencia finalizada. Se registraron ${res.unrecordedMarkedAbsent} alumnos en estado FALTA.`
      );
      updateSessionData();
    }
  };

  // Manually refresh QR
  const handleRefreshQR = useCallback(() => {
    if (!session || session.estado !== 'en_curso') return;
    const newToken = store.refreshQRToken(session.id);
    if (newToken) {
      setQrToken(newToken);
      setCountdown(10);
    }
  }, [session]);

  // Auto-renewal every 10 seconds
  useEffect(() => {
    if (!session || session.estado !== 'en_curso' || !isAutoRenewActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleRefreshQR();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session, isAutoRenewActive, handleRefreshQR]);

  // Calculate live stats
  const records = session
    ? store.attendanceRecords.filter((r) => r.attendance_session_id === session.id)
    : [];

  const presentesCount = records.filter((r) => r.estado === 'presente').length;
  const tardanzasCount = records.filter((r) => r.estado === 'tardanza').length;
  const faltasCount = records.filter((r) => r.estado === 'falta').length;
  const justificadosCount = records.filter((r) => r.estado === 'justificado').length;
  const totalRegistrados = presentesCount + tardanzasCount + justificadosCount;
  const pendientesCount = Math.max(0, enrolledStudents.length - totalRegistrados - faltasCount);
  const attendanceRate =
    enrolledStudents.length > 0 ? Math.round((totalRegistrados / enrolledStudents.length) * 100) : 0;

  // Manual record submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !selectedStudentForManual) return;

    store.manualUpdateAttendance(
      session.id,
      selectedStudentForManual,
      week.id,
      manualStatus,
      manualObservacion
    );

    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    setShowManualModal(false);
    setSelectedStudentForManual('');
    setManualObservacion('');
    setFeedbackNotice('Registro manual actualizado satisfactoriamente.');
  };

  // Quick simulate student scan (for teacher demo convenience)
  const handleSimulateScan = () => {
    if (!session || session.estado !== 'en_curso' || !qrToken) return;

    // Find first student not yet registered
    const unregistered = enrolledStudents.find(
      (s) => !records.some((r) => r.student_id === s.id)
    );

    if (!unregistered) {
      alert('Todos los alumnos matriculados ya tienen asistencia registrada en esta sesión.');
      return;
    }

    const res = store.scanQRCode(unregistered.id, qrToken);
    if (res.success) {
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
      setFeedbackNotice(
        `¡Simulación exitosa! Asistencia registrada para ${unregistered.nombre} ${unregistered.apellidos}.`
      );
    } else {
      alert(res.message);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['Universidad César Vallejo - Reporte de Asistencia Semanal'],
      [`Carrera: ${career.nombre}`, `Código: ${career.codigo}`],
      [`Curso: ${course.nombre}`, `Código: ${course.codigo}`, `Sección: ${section.codigo}`],
      [`Unidad: ${unit.numero_unidad} - ${unit.nombre}`, `Semana: ${week.numero_semana}`],
      [`Fecha: ${week.fecha_clase}`, `Horario: ${week.hora_inicio} - ${week.hora_fin}`],
      [''],
      ['N°', 'Código Estudiante', 'Apellidos y Nombres', 'Correo UCV', 'Estado Asistencia', 'Hora Registro', 'Método', 'Observación'],
    ];

    enrolledStudents.forEach((student, index) => {
      const rec = records.find((r) => r.student_id === student.id);
      const estado = rec ? rec.estado.toUpperCase() : session?.estado === 'finalizada' ? 'FALTA' : 'PENDIENTE';
      const hora = rec ? new Date(rec.registrado_en).toLocaleTimeString('es-PE') : '-';
      const metodo = rec?.metodo_registro === 'qr_scanner' ? 'QR Dinámico' : rec?.metodo_registro === 'manual_docente' ? 'Manual Docente' : '-';
      rows.push([
        String(index + 1),
        student.codigo,
        `"${student.apellidos}, ${student.nombre}"`,
        student.email,
        estado,
        hora,
        metodo,
        `"${rec?.observacion || ''}"`,
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UCV_Asistencia_${course.codigo}_W${week.numero_semana}_${week.fecha_clase}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isSessionOpen = session?.estado === 'en_curso';

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {feedbackNotice && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs sm:text-sm text-blue-900 font-medium">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-700 shrink-0" />
            <span>{feedbackNotice}</span>
          </div>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-blue-600 hover:text-blue-900 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Institutional Top Bar: Full Academic Context */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs font-bold">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-950 text-white font-mono">
              {career.codigo}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-red-600 font-black uppercase tracking-wider">
              {career.nombre}
            </span>
            <span className="text-slate-300">•</span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              Sec. {section.codigo}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {course.nombre}
          </h2>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-semibold text-slate-600">
            <span className="bg-blue-50 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-200">
              Unidad {unit.numero_unidad}: {unit.nombre.replace(/^Unidad \d+:\s*/, '')}
            </span>
            <span className="bg-red-50 text-red-900 px-2.5 py-1 rounded-lg border border-red-200 font-bold">
              Semana {week.numero_semana}
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              {week.fecha_clase}
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {week.hora_inicio} - {week.hora_fin} (Tolerancia: {week.tolerancia_minutos} min)
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <button
            onClick={onBackToWeeks}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver a la unidad</span>
          </button>

          <button
            onClick={() => setShowSummaryModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4 text-blue-700" />
            <span>Resumen semanal</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Work Area: QR Presentation & Live Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Code Stage & Session Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5 text-center">
            {/* Session State Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Control de Asistencia
              </span>
              {isSessionOpen ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-xs animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  Sesión En Curso
                </span>
              ) : session?.estado === 'finalizada' ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Sesión Cerrada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Sesión No Iniciada
                </span>
              )}
            </div>

            {/* QR Visual Canvas */}
            {isSessionOpen ? (
              <div className="space-y-4">
                <QRCodeDisplay
                  value={qrToken}
                  size={260}
                  className="mx-auto"
                  subtitle="Apunta con la cámara de la app AsisQR UCV para registrar tu presencia institucional."
                />

                {/* 10-Second Countdown Bar */}
                <div className="space-y-1.5 px-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span className="flex items-center gap-1 text-slate-500">
                      <RefreshCw
                        className={`w-3.5 h-3.5 text-blue-900 ${
                          countdown <= 2 ? 'animate-spin' : ''
                        }`}
                      />
                      Renovación dinámica
                    </span>
                    <span className="font-mono text-red-600 font-extrabold text-sm">
                      {countdown}s
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-blue-900 transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${(countdown / 10) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    El código temporal previene capturas y suplantaciones de identidad.
                  </p>
                </div>

                {/* Session Action Buttons */}
                <div className="pt-2 flex flex-col gap-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleRefreshQR}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      title="Forzar nuevo código QR"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                      <span>Renovar ahora</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAutoRenewActive(!isAutoRenewActive)}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isAutoRenewActive
                          ? 'bg-blue-50 text-blue-900 border border-blue-200'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      <span>{isAutoRenewActive ? 'Pausar auto-reemplazo' : 'Reanudar'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseSession}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <PowerOff className="w-4 h-4" />
                    <span>Cerrar asistencia y registrar faltas</span>
                  </button>

                  {/* Demo Helper: Simulate scanning directly */}
                  <div className="mt-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleSimulateScan}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-slate-100 to-blue-50 hover:from-slate-200 hover:to-blue-100 text-blue-950 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-blue-700" />
                      <span>Simular escaneo de alumno (Demo)</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Session Not Active View */
              <div className="py-8 px-4 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-10 h-10 text-blue-900" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {session?.estado === 'finalizada'
                      ? 'Asistencia Finalizada'
                      : '¿Listo para iniciar la clase?'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    {session?.estado === 'finalizada'
                      ? 'La sesión de la semana fue concluida. Puedes consultar el resumen completo o reabrir la sesión si necesitas registrar a alumnos rezagados.'
                      : 'Pulsa el botón institucional para activar la sesión semanal y proyectar el QR rotativo a tus alumnos.'}
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
                  <button
                    type="button"
                    onClick={handleStartSession}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <PowerOff className="w-4 h-4 text-emerald-400" />
                    <span>
                      {session?.estado === 'finalizada' ? 'Reabrir sesión de asistencia' : 'Iniciar asistencia'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowManualModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Registro manual de alumno</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Statistics & Students Table (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Live Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Matriculados
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{enrolledStudents.length}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">Total sección</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold uppercase text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Presentes
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{presentesCount}</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Puntuales</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold uppercase text-amber-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Tardanzas
              </div>
              <div className="text-2xl font-black text-amber-700 mt-1">{tardanzasCount}</div>
              <div className="text-[11px] text-amber-600 font-medium mt-0.5">Con tolerancia</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <UserX className="w-3.5 h-3.5" />
                {session?.estado === 'finalizada' ? 'Faltas' : 'Pendientes'}
              </div>
              <div
                className={`text-2xl font-black mt-1 ${
                  session?.estado === 'finalizada' ? 'text-red-700' : 'text-slate-700'
                }`}
              >
                {session?.estado === 'finalizada' ? faltasCount : pendientesCount}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                {session?.estado === 'finalizada' ? 'Inasistencias' : 'Sin escanear'}
              </div>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span>Lista de Estudiantes</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold">
                    {records.length} registrados
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Actualización en tiempo real conforme los alumnos escanean el código QR institucional.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowManualModal(true)}
                  className="px-3 py-1.5 text-xs font-bold text-blue-900 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  + Registro manual
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Estudiante</th>
                    <th className="py-3 px-3">Código UCV</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3">Hora de Registro</th>
                    <th className="py-3 px-3">Método</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrolledStudents.map((student) => {
                    const record = records.find((r) => r.student_id === student.id);
                    const isRegistered = Boolean(record);
                    const isClosed = session?.estado === 'finalizada';

                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          record?.estado === 'presente'
                            ? 'bg-emerald-50/10'
                            : record?.estado === 'tardanza'
                            ? 'bg-amber-50/10'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {student.avatarUrl ? (
                              <img
                                src={student.avatarUrl}
                                alt={student.nombre}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-950 font-bold flex items-center justify-center text-xs">
                                {student.nombre[0]}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900">
                                {student.apellidos}, {student.nombre}
                              </div>
                              <div className="text-[11px] text-slate-400">{student.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono font-medium text-slate-600">
                          {student.codigo}
                        </td>

                        <td className="py-3 px-3">
                          {record ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                record.estado === 'presente'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : record.estado === 'tardanza'
                                  ? 'bg-amber-100 text-amber-800'
                                  : record.estado === 'justificado'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {record.estado === 'presente' && <CheckCircle2 className="w-3 h-3" />}
                              {record.estado === 'tardanza' && <Clock className="w-3 h-3" />}
                              {record.estado === 'justificado' && <Info className="w-3 h-3" />}
                              {record.estado === 'falta' && <AlertCircle className="w-3 h-3" />}
                              {record.estado.toUpperCase()}
                            </span>
                          ) : isClosed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                              <AlertCircle className="w-3 h-3" />
                              FALTA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                              Pendiente
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-600">
                          {record ? (
                            new Date(record.registrado_en).toLocaleTimeString('es-PE', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-slate-500">
                          {record?.metodo_registro === 'qr_scanner' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                              QR Móvil
                            </span>
                          ) : record?.metodo_registro === 'manual_docente' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              Docente
                            </span>
                          ) : record?.metodo_registro === 'justificado' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Justificado
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentForManual(student.id);
                              setManualStatus(record?.estado || 'presente');
                              setManualObservacion(record?.observacion || '');
                              setShowManualModal(true);
                            }}
                            className="text-xs text-blue-700 hover:text-blue-950 font-bold hover:underline cursor-pointer"
                          >
                            {isRegistered ? 'Modificar' : 'Marcar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Attendance Adjustment Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Registro Manual de Asistencia</h3>
            <p className="text-xs text-slate-500 mt-1">
              Permite registrar alumnos en contingencias (sin smartphone, problemas de red o justificaciones).
            </p>

            <form onSubmit={handleManualSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estudiante</label>
                <select
                  value={selectedStudentForManual}
                  onChange={(e) => setSelectedStudentForManual(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                >
                  <option value="">Selecciona un alumno...</option>
                  {enrolledStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.apellidos}, {s.nombre} ({s.codigo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estado de Asistencia
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['presente', 'tardanza', 'falta', 'justificado'] as AttendanceStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setManualStatus(st)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                          manualStatus === st
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo / Observación
                </label>
                <textarea
                  value={manualObservacion}
                  onChange={(e) => setManualObservacion(e.target.value)}
                  placeholder="Ej: Autorizado por docente por batería descargada."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedStudentForManual}
                  className="px-5 py-2 text-xs font-extrabold text-white bg-blue-900 hover:bg-blue-950 rounded-xl disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Guardar Asistencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weekly Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase">
                  Acta de Sesión Semanal
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  Resumen de la Semana {week.numero_semana}
                </h3>
                <p className="text-xs text-slate-500">{week.tema}</p>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400">Matriculados</div>
                <div className="text-xl font-black text-slate-900">{enrolledStudents.length}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                <div className="text-[10px] uppercase font-bold text-emerald-600">Presentes</div>
                <div className="text-xl font-black text-emerald-800">{presentesCount}</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-center border border-amber-100">
                <div className="text-[10px] uppercase font-bold text-amber-600">Tardanzas</div>
                <div className="text-xl font-black text-amber-800">{tardanzasCount}</div>
              </div>
              <div className="p-3 bg-red-50 rounded-xl text-center border border-red-100">
                <div className="text-[10px] uppercase font-bold text-red-600">Faltas</div>
                <div className="text-xl font-black text-red-800">{faltasCount}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-800" />
                <span>Auditoría de Sesión UCV</span>
              </div>
              <p className="text-[11px] text-blue-900/80">
                ID de Sesión: <code className="font-mono">{session?.id || 'No iniciada'}</code>
              </p>
              <p className="text-[11px] text-blue-900/80">
                Docente Responsable: {currentUser.nombre} {currentUser.apellidos} ({currentUser.codigo})
              </p>
              <p className="text-[11px] text-blue-900/80">
                Rango de Horario Oficial: {week.hora_inicio} a {week.hora_fin} (Tolerancia: {week.tolerancia_minutos} min)
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 cursor-pointer"
              >
                Descargar Acta CSV
              </button>
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-950 hover:bg-blue-900 rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
