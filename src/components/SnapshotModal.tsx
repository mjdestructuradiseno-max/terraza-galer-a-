import React from 'react';
import { Image as ImageIcon, X, Download } from 'lucide-react';

interface SnapshotModalProps {
  imageSrc: string | null;
  onClose: () => void;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({ imageSrc, onClose }) => {
  if (!imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 flex flex-col items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-4 flex flex-col gap-3 shadow-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Captura Renderizada 3D Terraza</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image Preview */}
        <div className="relative w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[260px] p-2">
          <img
            src={imageSrc}
            alt="Captura 3D Galería Terraza"
            className="max-h-[60vh] w-auto object-contain rounded-lg shadow-xl"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Cerrar
          </button>
          <a
            href={imageSrc}
            download="galeria_terraza_3d_render.png"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Imagen</span>
          </a>
        </div>
      </div>
    </div>
  );
};
