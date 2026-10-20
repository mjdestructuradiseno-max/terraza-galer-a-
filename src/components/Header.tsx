import React from 'react';
import { Camera, RefreshCw, Moon, Sun, SlidersHorizontal, Home, Play } from 'lucide-react';

interface HeaderProps {
  isAutoRotating: boolean;
  isNight: boolean;
  onTakeSnapshot: () => void;
  onToggleRotate: () => void;
  onToggleNight: () => void;
  onToggleMobileSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAutoRotating,
  isNight,
  onTakeSnapshot,
  onToggleRotate,
  onToggleNight,
  onToggleMobileSettings,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 p-2 sm:p-4 flex justify-between items-center bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent pointer-events-none select-none">
      {/* Brand & Subtitle */}
      <div className="flex items-center space-x-2 sm:space-x-3 pointer-events-auto">
        <div className="bg-amber-500 text-slate-900 p-2 sm:p-2.5 rounded-xl font-bold shadow-lg shadow-amber-500/20 flex items-center justify-center">
          <Home className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
        </div>
        <div>
          <h1 className="text-xs sm:text-lg font-bold leading-none text-white drop-shadow">
            Visor 3D Galería Terraza
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 hidden sm:block">
            Pared con jardín vertical verde, parrilla exenta al aire libre y piso blanco
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 pointer-events-auto">
        {/* Snapshot */}
        <button
          onClick={onTakeSnapshot}
          className="bg-sky-600 hover:bg-sky-500 active:scale-95 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition shadow-lg flex items-center gap-1.5 cursor-pointer"
          title="Capturar renderizado 3D en alta resolución"
        >
          <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Generar Imagen 3D</span>
        </button>

        {/* Auto Rotate Toggle */}
        <button
          onClick={onToggleRotate}
          className={`active:scale-95 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition shadow-lg flex items-center gap-1.5 cursor-pointer ${
            isAutoRotating
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
          title="Alternar rotación automática de cámara"
        >
          {isAutoRotating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              <span className="hidden sm:inline">Pausar Rotación</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400" />
              <span className="hidden sm:inline">Girar Automáticamente</span>
            </>
          )}
        </button>

        {/* Night / Day Toggle */}
        <button
          onClick={onToggleNight}
          className="bg-slate-800/90 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-200 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition shadow-lg flex items-center gap-1.5 cursor-pointer"
          title="Alternar modo noche / iluminación nocturna"
        >
          {isNight ? (
            <>
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="hidden sm:inline">Modo Día</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
              <span className="hidden sm:inline">Modo Noche</span>
            </>
          )}
        </button>

        {/* Mobile Settings Toggle */}
        <button
          onClick={onToggleMobileSettings}
          className="sm:hidden bg-slate-800/90 active:scale-95 border border-slate-700 text-amber-400 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition shadow-lg flex items-center gap-1.5 cursor-pointer"
          title="Abrir ajustes"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
