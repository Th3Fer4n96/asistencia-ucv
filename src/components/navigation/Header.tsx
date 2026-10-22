import React from 'react';
import { User, UserRole } from '../../types/academic';
import { store } from '../../services/store';
import { UserCheck, GraduationCap, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  onOpenScanner?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onSelectUser, onOpenScanner }) => {
  const users = store.users;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Left: UCV Logo & App Identity */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white shadow-md shadow-red-500/20 ring-2 ring-red-100">
              <span className="font-black text-sm tracking-tighter">UCV</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-blue-950 tracking-tight flex items-center gap-1.5">
                  <span>AsisQR</span>
                  <span className="text-red-600 font-black">UCV</span>
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-900 border border-blue-200">
                  {store.settings.periodoVigente}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Estructura Curricular: Carreras • Cursos • 3 Unidades • 15 Semanas
              </p>
            </div>
          </div>

          {/* Right: Role Switcher & User Selector */}
          <div className="flex items-center gap-3">
            {/* Quick Role Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => {
                  const doc = users.find((u) => u.rol === 'docente');
                  if (doc) onSelectUser(doc);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentUser.rol === 'docente'
                    ? 'bg-white text-blue-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-900" />
                <span className="hidden md:inline">Docente</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const alu = users.find((u) => u.rol === 'alumno');
                  if (alu) onSelectUser(alu);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentUser.rol === 'alumno'
                    ? 'bg-white text-blue-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden md:inline">Alumno</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const adm = users.find((u) => u.rol === 'admin');
                  if (adm) onSelectUser(adm);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentUser.rol === 'admin'
                    ? 'bg-white text-blue-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                <span className="hidden md:inline">Admin</span>
              </button>
            </div>

            {/* User Profile Card */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.nombre}
                  className="w-9 h-9 rounded-full object-cover border-2 border-blue-900 shadow-2xs"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-950 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser.nombre[0]}
                </div>
              )}

              <div className="hidden lg:block text-left">
                <div className="text-xs font-black text-slate-900 leading-tight">
                  {currentUser.nombre} {currentUser.apellidos.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                  <span className="capitalize">{currentUser.rol}</span> • {currentUser.codigo}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
