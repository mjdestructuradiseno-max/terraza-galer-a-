/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { TerraceEngine } from './scene/TerraceEngine';
import { DEFAULT_CONFIG, TerraceConfig, CameraViewType } from './types';
import { Header } from './components/Header';
import { CameraViews } from './components/CameraViews';
import { SettingsPanel } from './components/SettingsPanel';
import { BottomHud } from './components/BottomHud';
import { SnapshotModal } from './components/SnapshotModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<TerraceEngine | null>(null);

  const [config, setConfig] = useState<TerraceConfig>({ ...DEFAULT_CONFIG });
  const [activeView, setActiveView] = useState<CameraViewType>('perspective');
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
  const [snapshotImg, setSnapshotImg] = useState<string | null>(null);

  // Initialize 3D Engine on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new TerraceEngine(canvasRef.current, config);
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Update engine when config changes
  const handleConfigChange = (newValues: Partial<TerraceConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newValues };
      engineRef.current?.updateConfig(updated);
      return updated;
    });
  };

  // Auto rotate toggle
  const handleToggleRotate = () => {
    if (!engineRef.current) return;
    const newState = engineRef.current.toggleAutoRotate();
    setConfig((prev) => ({ ...prev, autoRotate: newState }));
  };

  // Day/Night toggle
  const handleToggleNight = () => {
    handleConfigChange({ isNight: !config.isNight });
  };

  // Camera presets
  const handleSelectView = (view: CameraViewType) => {
    setActiveView(view);
    engineRef.current?.setCameraView(view);
    setConfig((prev) => ({ ...prev, autoRotate: false }));
  };

  // Take snapshot
  const handleTakeSnapshot = () => {
    if (!engineRef.current) return;
    const dataUrl = engineRef.current.takeSnapshot();
    setSnapshotImg(dataUrl);
  };

  // Reset all defaults
  const handleReset = () => {
    const fresh = { ...DEFAULT_CONFIG };
    setConfig(fresh);
    setActiveView('perspective');
    engineRef.current?.resetDefaults(fresh);
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-slate-100 flex flex-col select-none touch-none overflow-hidden">
      {/* Superior Header Control Bar */}
      <Header
        isAutoRotating={config.autoRotate}
        isNight={config.isNight}
        onTakeSnapshot={handleTakeSnapshot}
        onToggleRotate={handleToggleRotate}
        onToggleNight={handleToggleNight}
        onToggleMobileSettings={() => setIsMobileSettingsOpen((prev) => !prev)}
      />

      {/* Main 3D Canvas Area */}
      <div className="relative w-full h-full flex-1 touch-none">
        {/* Full-bleed Three.js Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing block touch-none"
        />

        {/* Floating Camera Presets (Left) */}
        <CameraViews onSelectView={handleSelectView} activeView={activeView} />

        {/* Floating Settings Panel (Right / Mobile Drawer) */}
        <SettingsPanel
          config={config}
          isOpenMobile={isMobileSettingsOpen}
          onCloseMobile={() => setIsMobileSettingsOpen(false)}
          onChangeConfig={handleConfigChange}
          onReset={handleReset}
        />

        {/* Bottom Helper & HUD */}
        <BottomHud />
      </div>

      {/* High-res Snapshot Modal */}
      <SnapshotModal imageSrc={snapshotImg} onClose={() => setSnapshotImg(null)} />
    </div>
  );
}
