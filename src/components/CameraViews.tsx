import React from 'react';
import { Eye, LayoutGrid, Layers, Home, Flame, ArrowUpCircle } from 'lucide-react';
import { CameraViewType } from '../types';

interface CameraViewsProps {
  onSelectView: (view: CameraViewType) => void;
  activeView?: CameraViewType;
}

export const CameraViews: React.FC<CameraViewsProps> = ({ onSelectView, activeView }) => {
  return (
    <div className="absolute top-14 sm:top-20 left-2 sm:left-4 z-10 flex flex-col gap-1.5 sm:gap-2 max-w-[125px] sm:max-w-none select-none">
      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 bg-slate-950/80 rounded self-start border border-slate-800">
        Vistas
      </span>

      {/* Perspectiva */}
      <button
        onClick={() => onSelectView('perspective')}
        className={`bg-slate-900/90 hover:bg-slate-800 active:scale-95 border text-slate-300 p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs transition flex items-center gap-1.5 sm:gap-2 shadow-lg group cursor-pointer ${
          activeView === 'perspective' ? 'border-amber-500 bg-slate-800/95 text-white' : 'border-slate-800/90'
        }`}
      >
        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:scale-110 transition" />
        <span>Perspectiva</span>
      </button>

      {/* Frontal */}
      <button
        onClick={() => onSelectView('front')}
        className={`bg-slate-900/90 hover:bg-slate-800 active:scale-95 border text-slate-300 p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs transition flex items-center gap-1.5 sm:gap-2 shadow-lg group cursor-pointer ${
          activeView === 'front' ? 'border-sky-500 bg-slate-800/95 text-white' : 'border-slate-800/90'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 group-hover:scale-110 transition" />
        <span>Frontal</span>
      </button>

      {/* Superior */}
      <button
        onClick={() => onSelectView('top')}
        className={`bg-slate-900/90 hover:bg-slate-800 active:scale-95 border text-slate-300 p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs transition flex items-center gap-1.5 sm:gap-2 shadow-lg group cursor-pointer ${
          activeView === 'top' ? 'border-emerald-500 bg-slate-800/95 text-white' : 'border-slate-800/90'
        }`}
      >
        <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 group-hover:scale-110 transition" />
        <span>Superior</span>
      </button>

      {/* Interior */}
      <button
        onClick={() => onSelectView('inside')}
        className={`bg-slate-900/90 hover:bg-slate-800 active:scale-95 border text-slate-300 p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs transition flex items-center gap-1.5 sm:gap-2 shadow-lg group cursor-pointer ${
          activeView === 'inside' ? 'border-purple-500 bg-slate-800/95 text-white' : 'border-slate-800/90'
        }`}
      >
        <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 group-hover:scale-110 transition" />
        <span>Interior</span>
      </button>

      {/* Parrilla Close-up */}
      <button
        onClick={() => onSelectView('bbq')}
        className={`bg-slate-900/90 hover:bg-slate-800 active:scale-95 border text-slate-300 p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs transition flex items-center gap-1.5 sm:gap-2 shadow-lg group cursor-pointer ${
          activeView === 'bbq' ? 'border-rose-500 bg-slate-800/95 text-white' : 'border-slate-800/90'
        }`}
      >
        <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 group-hover:scale-110 transition" />
        <span>Parrilla</span>
      </button>

      {/* Pérgola Ceiling view */}
      <button
        onClick={() => onSelectView('ceiling')}
        className={`bg-slate-900/90 hover:bg-slate-800 active:scale-95 border text-slate-300 p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs transition flex items-center gap-1.5 sm:gap-2 shadow-lg group cursor-pointer ${
          activeView === 'ceiling' ? 'border-amber-400 bg-slate-800/95 text-white' : 'border-slate-800/90'
        }`}
      >
        <ArrowUpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 group-hover:scale-110 transition" />
        <span>Cielo Raso</span>
      </button>
    </div>
  );
};
