export type WoodColorOption = {
  id: string;
  name: string;
  hex: number;
  previewColor: string;
  roughness: number;
};

export const WOOD_COLORS: WoodColorOption[] = [
  { id: 'cetol', name: 'Madera Cálida / Cetol Roble', hex: 0xb46828, previewColor: '#b46828', roughness: 0.55 },
  { id: 'nogal', name: 'Madera Oscura / Nogal Intenso', hex: 0x422617, previewColor: '#422617', roughness: 0.6 },
  { id: 'pino', name: 'Madera Clara / Pino Natural', hex: 0xdfb482, previewColor: '#dfb482', roughness: 0.5 },
  { id: 'petiribi', name: 'Madera Premium / Petiribí', hex: 0x8d5c36, previewColor: '#8d5c36', roughness: 0.48 },
];

export type FloorStyleOption = 'blanco-pulido' | 'travertino' | 'cemento-claro';

export type CameraViewType = 'perspective' | 'front' | 'top' | 'inside' | 'bbq' | 'ceiling';

export interface TerraceConfig {
  ancho: number; // 3.0m - 10.0m
  profundidad: number; // 1.5m - 4.5m
  alto: number; // 2.0m - 3.5m
  macetas: number; // 0 - 6
  luces: boolean;
  jardinVertical: boolean;
  mostrarParrilla: boolean;
  maderaColor: number;
  floorStyle: FloorStyleOption;
  isNight: boolean;
  autoRotate: boolean;
  sunElevation: number; // 15 - 75 deg
  showFurniture: boolean;
}

export const DEFAULT_CONFIG: TerraceConfig = {
  ancho: 5.0,
  profundidad: 2.5,
  alto: 2.4,
  macetas: 2,
  luces: true,
  jardinVertical: true,
  mostrarParrilla: true,
  maderaColor: 0xb46828,
  floorStyle: 'blanco-pulido',
  isNight: false,
  autoRotate: true,
  sunElevation: 45,
  showFurniture: true,
};
