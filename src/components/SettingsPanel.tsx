import React from 'react';
import {
  Sliders,
  X,
  Flame,
  Leaf,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Layers,
  Armchair,
} from 'lucide-react';
import { TerraceConfig, WOOD_COLORS, FloorStyleOption } from '../types';

interface SettingsPanelProps {
  config: TerraceConfig;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onChangeConfig: (newConfig: Partial<TerraceConfig>) => void;
  onReset: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  config,
  isOpenMobile,
  onCloseMobile,
  onChangeConfig,
  onReset,
}) => {
  return (
    <div
      className={`${
        isOpenMobile ? 'flex' : 'hidden'
      } sm:flex absolute top-14 sm:top-20 right-2 sm:right-4 z-20 w-[calc(100vw-1rem)] sm:w-80 max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-6rem)] bg-slate-900/95 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xl overflow-y-auto custom-scrollbar flex-col gap-3 sm:gap-4 select-none`}
    >
      {/* Header */}
      <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>Ajustes de Terraza 3D</span>
          </h2>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
            Modifica dimensiones, acabados y vegetación.
          </p>
        </div>
        <button
          onClick={onCloseMobile}
          className="sm:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Dimension Sliders */}
      <div className="space-y-3">
        {/* Ancho */}
        <div>
          <div className="flex justify-between text-[11px] sm:text-xs mb-1">
            <span className="text-slate-300 font-medium">Ancho Total Terraza</span>
            <span className="text-amber-400 font-bold">{config.ancho.toFixed(1)} m</span>
          </div>
          <input
            type="range"
            min="3.0"
            max="10.0"
            step="0.2"
            value={config.ancho}
            onChange={(e) => onChangeConfig({ ancho: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2 sm:h-1.5 cursor-pointer"
          />
        </div>

        {/* Profundidad */}
        <div>
          <div className="flex justify-between text-[11px] sm:text-xs mb-1">
            <span className="text-slate-300 font-medium">Profundidad</span>
            <span className="text-amber-400 font-bold">{config.profundidad.toFixed(1)} m</span>
          </div>
          <input
            type="range"
            min="1.5"
            max="4.5"
            step="0.1"
            value={config.profundidad}
            onChange={(e) => onChangeConfig({ profundidad: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2 sm:h-1.5 cursor-pointer"
          />
        </div>

        {/* Alto */}
        <div>
          <div className="flex justify-between text-[11px] sm:text-xs mb-1">
            <span className="text-slate-300 font-medium">Alto de Galería</span>
            <span className="text-amber-400 font-bold">{config.alto.toFixed(1)} m</span>
          </div>
          <input
            type="range"
            min="2.0"
            max="3.5"
            step="0.1"
            value={config.alto}
            onChange={(e) => onChangeConfig({ alto: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2 sm:h-1.5 cursor-pointer"
          />
        </div>
      </div>

      {/* Visual Components / Toggles */}
      <div className="border-t border-slate-800 pt-3 space-y-2.5">
        <h3 className="text-[11px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Componentes de Terraza
        </h3>

        {/* Parrilla Exterior Exenta */}
        <label className="flex items-center justify-between p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-slate-700 transition cursor-pointer">
          <span className="text-[11px] sm:text-xs text-slate-300 flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Parrilla Exterior Exenta
          </span>
          <input
            type="checkbox"
            checked={config.mostrarParrilla}
            onChange={(e) => onChangeConfig({ mostrarParrilla: e.target.checked })}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </label>

        {/* Jardín Vertical */}
        <label className="flex items-center justify-between p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-slate-700 transition cursor-pointer">
          <span className="text-[11px] sm:text-xs text-slate-300 flex items-center gap-2">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Jardín Vertical en Pared
          </span>
          <input
            type="checkbox"
            checked={config.jardinVertical}
            onChange={(e) => onChangeConfig({ jardinVertical: e.target.checked })}
            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
          />
        </label>

        {/* Luces LED Spot */}
        <label className="flex items-center justify-between p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-slate-700 transition cursor-pointer">
          <span className="text-[11px] sm:text-xs text-slate-300 flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Luces LED Spot
          </span>
          <input
            type="checkbox"
            checked={config.luces}
            onChange={(e) => onChangeConfig({ luces: e.target.checked })}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </label>

        {/* Mobiliario Lounge */}
        <label className="flex items-center justify-between p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-slate-700 transition cursor-pointer">
          <span className="text-[11px] sm:text-xs text-slate-300 flex items-center gap-2">
            <Armchair className="w-3.5 h-3.5 text-sky-400" /> Sillón Lounge de Terraza
          </span>
          <input
            type="checkbox"
            checked={config.showFurniture}
            onChange={(e) => onChangeConfig({ showFurniture: e.target.checked })}
            className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
          />
        </label>

        {/* Maceteros */}
        <div className="pt-1">
          <div className="flex justify-between text-[11px] sm:text-xs mb-1">
            <span className="text-slate-300">Maceteros con Vegetación</span>
            <span className="text-emerald-400 font-bold">{config.macetas}</span>
          </div>
          <input
            type="range"
            min="0"
            max="6"
            step="1"
            value={config.macetas}
            onChange={(e) => onChangeConfig({ macetas: parseInt(e.target.value) })}
            className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2 sm:h-1.5 cursor-pointer"
          />
        </div>

        {/* Color de Madera */}
        <div className="pt-1">
          <label className="block text-[11px] sm:text-xs text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Color de Madera</span>
            <span className="text-[10px] text-slate-400">Pérgola / Listones</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {WOOD_COLORS.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => onChangeConfig({ maderaColor: w.hex })}
                className={`p-1.5 rounded-xl border text-[10px] text-left flex items-center gap-2 transition cursor-pointer ${
                  config.maderaColor === w.hex
                    ? 'border-amber-400 bg-amber-500/10 text-white font-medium'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/40 shadow-inner"
                  style={{ backgroundColor: w.previewColor }}
                />
                <span className="truncate">{w.name.split('/')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Acabado de Piso (Floor Style) */}
        <div className="pt-1">
          <label className="block text-[11px] sm:text-xs text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Material de Piso</span>
            <span className="text-[10px] text-slate-400">Placas 60x60</span>
          </label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'blanco-pulido' as FloorStyleOption, label: 'Blanco Pulido' },
              { id: 'travertino' as FloorStyleOption, label: 'Travertino' },
              { id: 'cemento-claro' as FloorStyleOption, label: 'Cemento Gris' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onChangeConfig({ floorStyle: f.id })}
                className={`p-1.5 rounded-lg border text-[10px] text-center transition cursor-pointer ${
                  config.floorStyle === f.id
                    ? 'border-sky-400 bg-sky-500/10 text-white font-medium'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="mt-1 sm:mt-2 w-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer shadow-lg"
      >
        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
        <span>Restablecer Vista</span>
      </button>
    </div>
  );
};
