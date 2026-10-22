import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { User, Career, Course, Section, AcademicUnit, AcademicWeek } from './types/academic';
import { Header } from './components/navigation/Header';
import { Breadcrumbs, BreadcrumbItem } from './components/navigation/Breadcrumbs';
import { TeacherCareerSelector } from './components/teacher/TeacherCareerSelector';
import { TeacherCourseSelector } from './components/teacher/TeacherCourseSelector';
import { TeacherCourseUnitsView } from './components/teacher/TeacherCourseUnitsView';
import { TeacherAttendanceManager } from './components/teacher/TeacherAttendanceManager';
import { StudentCoursesView } from './components/student/StudentCoursesView';
import { StudentCourseDetail } from './components/student/StudentCourseDetail';
import { StudentQRScanner } from './components/student/StudentQRScanner';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GraduationCap, BookOpen, Layers, QrCode } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(store.getCurrentUser());
  const [, setTick] = useState<number>(0);

  // Docente flow navigation state
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<AcademicUnit | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<AcademicWeek | null>(null);

  // Student flow state
  const [studentSelectedCourse, setStudentSelectedCourse] = useState<{
    course: Course;
    section: Section;
  } | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
      setTick((t) => t + 1);
    });
    return () => unsubscribe();
  }, []);

  // Handle switching user from header
  const handleSelectUser = (user: User) => {
    store.setCurrentUser(user.id);
    setCurrentUser(user);

    // Reset drill-downs on role change
    setSelectedCareer(null);
    setSelectedCourse(null);
    setSelectedSection(null);
    setSelectedUnit(null);
    setSelectedWeek(null);
    setStudentSelectedCourse(null);
  };

  // Build breadcrumbs for Docente flow
  const getTeacherBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      {
        label: 'Mis Carreras',
        onClick: () => {
          setSelectedCareer(null);
          setSelectedCourse(null);
          setSelectedSection(null);
          setSelectedUnit(null);
          setSelectedWeek(null);
        },
      },
    ];

    if (selectedCareer) {
      items.push({
        label: selectedCareer.nombre,
        onClick: () => {
          setSelectedCourse(null);
          setSelectedSection(null);
          setSelectedUnit(null);
          setSelectedWeek(null);
        },
      });
    }

    if (selectedCourse) {
      items.push({
        label: `${selectedCourse.nombre} (${selectedSection?.codigo || 'A1'})`,
        onClick: () => {
          setSelectedWeek(null);
        },
      });
    }

    if (selectedUnit) {
      items.push({
        label: `Unidad ${selectedUnit.numero_unidad}`,
        onClick: () => {
          setSelectedWeek(null);
        },
      });
    }

    if (selectedWeek) {
      items.push({
        label: `Semana ${selectedWeek.numero_semana}`,
        badge: selectedWeek.estado === 'en_curso' ? 'En Vivo' : undefined,
      });
      items.push({
        label: 'Asistencia QR',
      });
    }

    return items;
  };

  const getTeacherBackAction = () => {
    if (selectedWeek) {
      return {
        label: `Volver a Unidad ${selectedUnit?.numero_unidad || ''}`,
        action: () => setSelectedWeek(null),
      };
    }
    if (selectedCourse) {
      return {
        label: `Volver a cursos de ${selectedCareer?.codigo || 'Carrera'}`,
        action: () => {
          setSelectedCourse(null);
          setSelectedSection(null);
          setSelectedUnit(null);
        },
      };
    }
    if (selectedCareer) {
      return {
        label: 'Volver a Mis Carreras',
        action: () => setSelectedCareer(null),
      };
    }
    return null;
  };

  const teacherBackInfo = getTeacherBackAction();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Institutional Header */}
      <Header
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ======================================================== */}
        {/* 1. DOCENTE VIEW                                          */}
        {/* ======================================================== */}
        {currentUser.rol === 'docente' && (
          <div className="space-y-6">
            {/* Breadcrumb Navigation */}
            <Breadcrumbs
              items={getTeacherBreadcrumbs()}
              onBack={teacherBackInfo ? teacherBackInfo.action : undefined}
              backLabel={teacherBackInfo ? teacherBackInfo.label : undefined}
            />

            {/* Step 5: Gestionar Asistencia Semanal con QR Dinámico */}
            {selectedCareer && selectedCourse && selectedSection && selectedUnit && selectedWeek ? (
              <TeacherAttendanceManager
                career={selectedCareer}
                course={selectedCourse}
                section={selectedSection}
                unit={selectedUnit}
                week={selectedWeek}
                onBackToWeeks={() => setSelectedWeek(null)}
              />
            ) : /* Step 3 & 4: Visualizar las 3 Unidades y 15 Semanas */
            selectedCareer && selectedCourse && selectedSection ? (
              <TeacherCourseUnitsView
                career={selectedCareer}
                course={selectedCourse}
                section={selectedSection}
                units={store.getCourseUnits(selectedCourse.id)}
                selectedUnitNumber={selectedUnit?.numero_unidad || 1}
                onSelectWeek={(week, unit) => {
                  setSelectedUnit(unit);
                  setSelectedWeek(week);
                }}
                onBackToCourses={() => {
                  setSelectedCourse(null);
                  setSelectedSection(null);
                  setSelectedUnit(null);
                }}
              />
            ) : /* Step 2: Seleccionar Curso de la Carrera */
            selectedCareer ? (
              <TeacherCourseSelector
                career={selectedCareer}
                courses={store.getTeacherCoursesByCareer(currentUser.id, selectedCareer.id)}
                onSelectCourse={(courseWithMeta) => {
                  setSelectedCourse(courseWithMeta);
                  setSelectedSection(courseWithMeta.section);
                  const units = store.getCourseUnits(courseWithMeta.id);
                  if (units.length > 0) setSelectedUnit(units[0]);
                }}
                onBack={() => setSelectedCareer(null)}
              />
            ) : (
              /* Step 1: Seleccionar Carrera */
              <TeacherCareerSelector
                careers={store.getTeacherCareers(currentUser.id)}
                onSelectCareer={(career) => setSelectedCareer(career)}
              />
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. ALUMNO VIEW                                           */}
        {/* ======================================================== */}
        {currentUser.rol === 'alumno' && (
          <div className="space-y-6">
            {studentSelectedCourse ? (
              <StudentCourseDetail
                studentId={currentUser.id}
                course={studentSelectedCourse.course}
                section={studentSelectedCourse.section}
                onBack={() => setStudentSelectedCourse(null)}
                onOpenScanner={() => setIsScannerOpen(true)}
              />
            ) : (
              <StudentCoursesView
                studentId={currentUser.id}
                courses={store.getStudentCourses(currentUser.id)}
                onSelectCourse={(course, section) =>
                  setStudentSelectedCourse({ course, section })
                }
                onOpenScanner={() => setIsScannerOpen(true)}
              />
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. ADMINISTRADOR VIEW                                    */}
        {/* ======================================================== */}
        {currentUser.rol === 'admin' && <AdminDashboard />}
      </main>

      {/* Floating QR Scanner Modal for Students */}
      {isScannerOpen && (
        <StudentQRScanner
          studentId={currentUser.id}
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={() => {
            // refresh data
            setTick((t) => t + 1);
          }}
        />
      )}

      {/* Institutional Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-blue-950">Universidad César Vallejo</span>
            <span>•</span>
            <span>Sistema Institucional AsisQR UCV</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Reglamento de Asistencia y Tolerancia</span>
            <span>•</span>
            <span>3 Unidades • 15 Semanas Obligatorias</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">Estado: Operativo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
