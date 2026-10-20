import * as THREE from 'three';
import { FloorStyleOption } from '../types';

// Helper to create a canvas texture with proper color space
function finalizeCanvasTexture(
  canvas: HTMLCanvasElement,
  isColor = true,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  if (isColor) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  return texture;
}

/**
 * Procedural Wood Textures: Diffuse and Bump maps
 */
export function createWoodTextures(baseHex: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const width = 1024;
  const height = 256;

  // Diffuse Canvas
  const dCanvas = document.createElement('canvas');
  dCanvas.width = width;
  dCanvas.height = height;
  const dCtx = dCanvas.getContext('2d')!;

  // Bump Canvas
  const bCanvas = document.createElement('canvas');
  bCanvas.width = width;
  bCanvas.height = height;
  const bCtx = bCanvas.getContext('2d')!;

  // Roughness Canvas
  const rCanvas = document.createElement('canvas');
  rCanvas.width = width;
  rCanvas.height = height;
  const rCtx = rCanvas.getContext('2d')!;

  // Parse color
  const baseCol = new THREE.Color(baseHex);
  const hsl = { h: 0, s: 0, l: 0 };
  baseCol.getHSL(hsl);

  // Fill base
  dCtx.fillStyle = `hsl(${hsl.h * 360}, ${hsl.s * 100}%, ${hsl.l * 100}%)`;
  dCtx.fillRect(0, 0, width, height);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, width, height);

  rCtx.fillStyle = '#909090';
  rCtx.fillRect(0, 0, width, height);

  // Draw natural grain fibers
  for (let y = 0; y < height; y += 1.5) {
    // Subtle wave
    const wave = Math.sin(y * 0.08) * 4 + Math.sin(y * 0.02) * 8;
    const darkness = (Math.sin(y * 0.3 + wave * 0.1) * 0.5 + 0.5) * 0.25;
    const grainL = Math.max(0.1, hsl.l - darkness * 0.35 + (Math.random() * 0.04 - 0.02));

    dCtx.fillStyle = `hsla(${hsl.h * 360 + (Math.random() * 4 - 2)}, ${hsl.s * 100}%, ${grainL * 100}%, 0.45)`;
    dCtx.fillRect(0, y, width, 1.8);

    const bumpVal = Math.floor(128 + (darkness - 0.12) * 160);
    bCtx.fillStyle = `rgb(${bumpVal},${bumpVal},${bumpVal})`;
    bCtx.fillRect(0, y, width, 1.8);
  }

  // Micro grain lines along length
  for (let i = 0; i < 400; i++) {
    const y = Math.random() * height;
    const len = 60 + Math.random() * 300;
    const x = Math.random() * (width - len);
    const alpha = 0.08 + Math.random() * 0.12;

    dCtx.strokeStyle = `rgba(30, 15, 5, ${alpha})`;
    dCtx.lineWidth = 0.8 + Math.random() * 1.2;
    dCtx.beginPath();
    dCtx.moveTo(x, y);
    dCtx.bezierCurveTo(x + len * 0.3, y + Math.random() * 2 - 1, x + len * 0.7, y + Math.random() * 2 - 1, x + len, y);
    dCtx.stroke();
  }

  // Wood pore speckles
  for (let i = 0; i < 1500; i++) {
    const px = Math.random() * width;
    const py = Math.random() * height;
    dCtx.fillStyle = 'rgba(20, 10, 5, 0.15)';
    dCtx.fillRect(px, py, 2.5, 0.8);

    rCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    rCtx.fillRect(px, py, 2.5, 0.8);
  }

  return {
    map: finalizeCanvasTexture(dCanvas, true, 2, 1),
    bumpMap: finalizeCanvasTexture(bCanvas, false, 2, 1),
    roughnessMap: finalizeCanvasTexture(rCanvas, false, 2, 1),
  };
}

/**
 * Procedural Porcelain Floor Tiles Texture (White/Porcelanato Blanco Pulido, Travertino, Cemento)
 */
export function createFloorTextures(
  style: FloorStyleOption,
  repeatX = 8,
  repeatY = 8
): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 1024;
  const dCanvas = document.createElement('canvas');
  dCanvas.width = size;
  dCanvas.height = size;
  const dCtx = dCanvas.getContext('2d')!;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext('2d')!;

  const rCanvas = document.createElement('canvas');
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext('2d')!;

  const tileSize = size / 4; // 4x4 tiles in map
  const groutWidth = 4; // 2-3mm joints

  // Base background
  let baseColor = '#f8fafc';
  let groutColor = '#cbd5e1';

  if (style === 'travertino') {
    baseColor = '#f5efe6';
    groutColor = '#d6ccc2';
  } else if (style === 'cemento-claro') {
    baseColor = '#e2e8f0';
    groutColor = '#94a3b8';
  }

  dCtx.fillStyle = groutColor;
  dCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#606060'; // recessed grout
  bCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#b0b0b0'; // matte grout
  rCtx.fillRect(0, 0, size, size);

  for (let tx = 0; tx < 4; tx++) {
    for (let ty = 0; ty < 4; ty++) {
      const x = tx * tileSize + groutWidth / 2;
      const y = ty * tileSize + groutWidth / 2;
      const w = tileSize - groutWidth;
      const h = tileSize - groutWidth;

      // Slight tone shift per tile for hyperrealism
      const tileNoise = (Math.sin(tx * 3.7 + ty * 5.1) * 0.5 + 0.5) * 6 - 3;
      dCtx.fillStyle = baseColor;
      dCtx.fillRect(x, y, w, h);

      // Micro marbling or travertine veins
      dCtx.save();
      dCtx.beginPath();
      dCtx.rect(x, y, w, h);
      dCtx.clip();

      if (style === 'blanco-pulido') {
        // Subtle statuario veins
        const veinAlpha = 0.035 + Math.random() * 0.025;
        dCtx.strokeStyle = `rgba(148, 163, 184, ${veinAlpha})`;
        dCtx.lineWidth = 3 + Math.random() * 4;
        dCtx.beginPath();
        dCtx.moveTo(x + Math.random() * w, y);
        dCtx.bezierCurveTo(
          x + Math.random() * w,
          y + h * 0.3,
          x + Math.random() * w,
          y + h * 0.7,
          x + Math.random() * w,
          y + h
        );
        dCtx.stroke();

        // Soft cloud specular
        const grad = dCtx.createRadialGradient(
          x + w * 0.5,
          y + h * 0.5,
          10,
          x + w * 0.5,
          y + h * 0.5,
          w * 0.6
        );
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        grad.addColorStop(1, 'rgba(240, 244, 248, 0.1)');
        dCtx.fillStyle = grad;
        dCtx.fillRect(x, y, w, h);
      } else if (style === 'travertino') {
        // Horizontal porous lines
        for (let l = 0; l < 25; l++) {
          const ly = y + (l / 25) * h + Math.random() * 4;
          dCtx.fillStyle = `rgba(180, 160, 140, ${0.05 + Math.random() * 0.08})`;
          dCtx.fillRect(x + Math.random() * 20, ly, w * (0.3 + Math.random() * 0.7), 2);
        }
      }

      dCtx.restore();

      // Bump elevation for tile face
      bCtx.fillStyle = '#ffffff';
      bCtx.fillRect(x, y, w, h);

      // Roughness (very smooth & shiny for porcelain)
      const tileRough = style === 'blanco-pulido' ? 35 : 60;
      rCtx.fillStyle = `rgb(${tileRough},${tileRough},${tileRough})`;
      rCtx.fillRect(x, y, w, h);
    }
  }

  return {
    map: finalizeCanvasTexture(dCanvas, true, repeatX, repeatY),
    bumpMap: finalizeCanvasTexture(bCanvas, false, repeatX, repeatY),
    roughnessMap: finalizeCanvasTexture(rCanvas, false, repeatX, repeatY),
  };
}

/**
 * Refractory Brick Texture for BBQ grill interior
 */
export function createRefractoryBrickTexture(): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 512;
  const dCanvas = document.createElement('canvas');
  dCanvas.width = size;
  dCanvas.height = size;
  const dCtx = dCanvas.getContext('2d')!;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext('2d')!;

  dCtx.fillStyle = '#262626'; // Mortar joint dark
  dCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#505050';
  bCtx.fillRect(0, 0, size, size);

  const rows = 8;
  const brickH = size / rows;
  const brickW = size / 4;

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (brickW * 0.5);
    for (let c = -1; c < 5; c++) {
      const bx = c * brickW + offset + 2;
      const by = r * brickH + 2;
      const bw = brickW - 4;
      const bh = brickH - 4;

      // Warm terracotta / ocre tone variations
      const toneR = 190 + Math.floor(Math.random() * 45);
      const toneG = 110 + Math.floor(Math.random() * 35);
      const toneB = 65 + Math.floor(Math.random() * 30);

      dCtx.fillStyle = `rgb(${toneR},${toneG},${toneB})`;
      dCtx.fillRect(bx, by, bw, bh);

      // Soot / heat speckles
      for (let s = 0; s < 40; s++) {
        dCtx.fillStyle = `rgba(20, 20, 20, ${Math.random() * 0.3})`;
        dCtx.fillRect(bx + Math.random() * bw, by + Math.random() * bh, 4, 4);
      }

      bCtx.fillStyle = '#e0e0e0';
      bCtx.fillRect(bx, by, bw, bh);
    }
  }

  return {
    map: finalizeCanvasTexture(dCanvas, true, 2, 2),
    bumpMap: finalizeCanvasTexture(bCanvas, false, 2, 2),
  };
}

/**
 * Architectural Plaster / White Stucco texture for BBQ and exterior columns
 */
export function createPlasterTexture(): {
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 512;
  const bCanvas = document.createElement('canvas');
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext('2d')!;

  const rCanvas = document.createElement('canvas');
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext('2d')!;

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = '#a0a0a0';
  rCtx.fillRect(0, 0, size, size);

  // Micro stucco grains
  for (let i = 0; i < 15000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const b = 100 + Math.floor(Math.random() * 60);
    bCtx.fillStyle = `rgb(${b},${b},${b})`;
    bCtx.fillRect(x, y, 1.5, 1.5);
  }

  return {
    bumpMap: finalizeCanvasTexture(bCanvas, false, 3, 3),
    roughnessMap: finalizeCanvasTexture(rCanvas, false, 3, 3),
  };
}

/**
 * Lush Leaf Texture for Vertical Garden and Planter vegetation
 */
export function createLeafTexture(variant: 'dark' | 'bright' | 'emerald'): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  let mainGreen = '#166534';
  let lightGreen = '#22c55e';

  if (variant === 'bright') {
    mainGreen = '#15803d';
    lightGreen = '#4ade80';
  } else if (variant === 'emerald') {
    mainGreen = '#065f46';
    lightGreen = '#10b981';
  }

  // Radial leaf gradient
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, lightGreen);
  grad.addColorStop(0.6, mainGreen);
  grad.addColorStop(1, '#052e16');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Central vein
  ctx.strokeStyle = lightGreen;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(size / 2, size);
  ctx.lineTo(size / 2, 0);
  ctx.stroke();

  // Lateral veins
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  for (let y = size * 0.2; y < size; y += 24) {
    ctx.beginPath();
    ctx.moveTo(size / 2, y);
    ctx.lineTo(size * 0.1, y - 20);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(size / 2, y);
    ctx.lineTo(size * 0.9, y - 20);
    ctx.stroke();
  }

  return finalizeCanvasTexture(canvas, true);
}
