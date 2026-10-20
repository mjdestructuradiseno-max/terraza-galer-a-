import React from 'react';
import { MousePointer } from 'lucide-react';

export const BottomHud: React.FC = () => {
  return (
    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 z-10 pointer-events-none flex justify-between items-end gap-2 select-none">
      {/* Legend */}
      <div className="bg-slate-900/90 border border-slate-800/90 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] text-slate-300 space-y-0.5 sm:space-y-1 pointer-events-auto shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-600 rounded-sm inline-block shadow-sm"></span>
          <span>Pared Jardín Vertical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-100 rounded-sm inline-block border border-slate-400 shadow-sm"></span>
          <span>Parrilla Blanca Exenta</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-100 rounded-sm inline-block border border-slate-300 shadow-sm"></span>
          <span>Piso Blanco Terraza</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-zinc-800 rounded-sm inline-block border border-zinc-600 shadow-sm"></span>
          <span>Estructura de Hierro</span>
        </div>
      </div>

      {/* Interaction gesture helper */}
      <div className="bg-slate-900/90 border border-slate-800/90 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] text-slate-400 shadow-xl flex items-center gap-1.5 pointer-events-auto">
        <MousePointer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="hidden sm:inline">Desliza para rotar | Pinza / Rueda para zoom | Clic derecho para desplazar</span>
        <span className="sm:hidden">Toca y arrastra en 3D</span>
      </div>
    </div>
  );
};
