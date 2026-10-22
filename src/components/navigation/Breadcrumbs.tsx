import React from 'react';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
  badge?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onBack?: () => void;
  backLabel?: string;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  onBack,
  backLabel = 'Regresar',
  className = '',
}) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex flex-wrap items-center justify-between gap-3 py-3 px-4 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-xs mb-6 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-medium">
        <button
          onClick={items[0]?.onClick}
          className="flex items-center gap-1 text-slate-500 hover:text-blue-900 transition-colors p-1 rounded-md hover:bg-slate-100"
          title="Inicio"
        >
          <Home className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Portal UCV</span>
        </button>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {isLast || !item.onClick ? (
                <span
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${
                    isLast
                      ? 'text-blue-950 font-bold bg-blue-50/80 border border-blue-200/50'
                      : 'text-slate-600'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  <span className="truncate max-w-[180px] sm:max-w-[260px]">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700">
                      {item.badge}
                    </span>
                  )}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="truncate max-w-[150px] sm:max-w-[220px] text-slate-600 hover:text-blue-900 hover:bg-slate-100 px-2 py-0.5 rounded-md transition-colors"
                >
                  {item.label}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {onBack && (
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-red-700 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-2.5 py-1.5 rounded-lg transition-all shadow-2xs shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{backLabel}</span>
        </button>
      )}
    </nav>
  );
};
