import * as THREE from 'three';
import { TerraceConfig } from '../types';
import {
  createWoodTextures,
  createFloorTextures,
  createRefractoryBrickTexture,
  createPlasterTexture,
  createLeafTexture,
} from '../textures/proceduralTextures';

export class TerraceBuilder {
  private group: THREE.Group;
  private spotLights: THREE.SpotLight[] = [];
  private emberLight: THREE.PointLight | null = null;

  // Cached materials for efficiency
  private woodMaterials: Map<string, THREE.MeshStandardMaterial> = new Map();
  private leafMats: THREE.MeshStandardMaterial[] = [];
  private ironMat!: THREE.MeshStandardMaterial;
  private stainlessMat!: THREE.MeshStandardMaterial;
  private whitePlasterMat!: THREE.MeshStandardMaterial;
  private corrugatedRoofMat!: THREE.MeshPhysicalMaterial;
  private emberMat!: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.initSharedMaterials();
  }

  public getGroup(): THREE.Group {
    return this.group;
  }

  public getSpotLights(): THREE.SpotLight[] {
    return this.spotLights;
  }

  private initSharedMaterials() {
    // Powder-coated Satin Black Iron
    this.ironMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.85,
      roughness: 0.35,
    });

    // Satin Stainless Steel (for grill bars, handles, hardware)
    this.stainlessMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.22,
    });

    // White Stucco Plaster
    const plasterTex = createPlasterTexture();
    this.whitePlasterMat = new THREE.MeshStandardMaterial({
      color: 0xfbfbfd,
      roughness: 0.8,
      metalness: 0.02,
      bumpMap: plasterTex.bumpMap,
      bumpScale: 0.008,
      roughnessMap: plasterTex.roughnessMap,
    });

    // High quality corrugated polycarbonate roofing
    this.corrugatedRoofMat = new THREE.MeshPhysicalMaterial({
      color: 0xf1f5f9,
      transmission: 0.86,
      opacity: 0.94,
      transparent: true,
      roughness: 0.12,
      metalness: 0.04,
      ior: 1.48,
      reflectivity: 0.85,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      side: THREE.DoubleSide,
    });

    // Embers
    this.emberMat = new THREE.MeshStandardMaterial({
      color: 0xff3b00,
      emissive: 0xff4500,
      emissiveIntensity: 1.5,
      roughness: 0.9,
    });

    // Leaf variants
    this.leafMats = [
      new THREE.MeshStandardMaterial({
        map: createLeafTexture('dark'),
        roughness: 0.45,
        metalness: 0.05,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshStandardMaterial({
        map: createLeafTexture('bright'),
        roughness: 0.4,
        metalness: 0.05,
        side: THREE.DoubleSide,
      }),
      new THREE.MeshStandardMaterial({
        map: createLeafTexture('emerald'),
        roughness: 0.42,
        metalness: 0.05,
        side: THREE.DoubleSide,
      }),
    ];
  }

  private getWoodMaterial(colorHex: number): THREE.MeshStandardMaterial {
    const key = colorHex.toString(16);
    if (!this.woodMaterials.has(key)) {
      const tex = createWoodTextures(colorHex);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: tex.map,
        bumpMap: tex.bumpMap,
        bumpScale: 0.015,
        roughnessMap: tex.roughnessMap,
        roughness: 0.5,
        metalness: 0.05,
      });
      this.woodMaterials.set(key, mat);
    }
    return this.woodMaterials.get(key)!;
  }

  /**
   * Rebuild the entire 3D terrace scene based on current configuration
   */
  public build(config: TerraceConfig) {
    // Clear previous objects
    while (this.group.children.length > 0) {
      const obj = this.group.children[0];
      this.group.remove(obj);
    }
    this.spotLights = [];
    this.emberLight = null;

    const W = config.ancho;
    const D = config.profundidad;
    const H = config.alto;

    // BBQ width & layout calculation
    const bbqWidth = config.mostrarParrilla ? 1.35 : 0;
    // Gallery extends along the terrace, ending cleanly where the outdoor BBQ begins
    const galleryW = config.mostrarParrilla ? Math.max(1.8, W - bbqWidth - 0.25) : W;
    const galleryOffsetX = config.mostrarParrilla ? -W / 2 + galleryW / 2 : 0;

    const woodMat = this.getWoodMaterial(config.maderaColor);

    // 1. EXPANSIVE TERRACE FLOOR SLAB & PORCELAIN TILES
    this.buildFloor(W, D, config.floorStyle);

    // 2. BACK WALL & VERTICAL GARDEN
    this.buildBackWall(W, D, H, config.jardinVertical);

    // 3. FREESTANDING OUTDOOR BARBECUE (PARRILLA EXENTA)
    if (config.mostrarParrilla) {
      this.buildBarbecue(W, D, H, bbqWidth, config.isNight);
    }

    // 4. STEEL PERGOLA FRAMEWORK (COLUMNS, BEAMS, ANCHORS)
    this.buildPergolaSteel(galleryW, galleryOffsetX, D, H);

    // 5. WOODEN CEILING SLATS (CIELO RASO) & INTEGRATED SPOTS
    this.buildWoodenCeiling(galleryW, galleryOffsetX, D, H, woodMat, config.luces, config.isNight);

    // 6. CORRUGATED TRANSLUCENT POLYCARBONATE ROOF (CHAPA ACANALADA)
    this.buildCorrugatedRoof(galleryW, galleryOffsetX, D, H);

    // 7. DESIGNER PLANTERS & VEGETATION (MACETEROS)
    if (config.macetas > 0) {
      this.buildPlanters(config.macetas, galleryW, galleryOffsetX, D);
    }

    // 8. CONTEMPORARY OUTDOOR FURNITURE
    if (config.showFurniture) {
      this.buildLoungeFurniture(galleryOffsetX, D);
    }
  }

  // ==========================================
  // 1. FLOOR SLAB & PORCELAIN TILES (EXPANSIVE OPEN TERRACE)
  // ==========================================
  private buildFloor(W: number, D: number, style: TerraceConfig['floorStyle']) {
    const floorGroup = new THREE.Group();

    // Expansive terrace dimensions: The terrace is much broader than the covered gallery sector
    const terraceW = Math.max(W + 6.0, 14.0);
    const terraceD = Math.max(D + 5.5, 9.5);
    const centerZ = -D / 2 + terraceD / 2;

    const repeatX = Math.round(terraceW / 0.6); // 60x60cm tile scale
    const repeatY = Math.round(terraceD / 0.6);
    const floorTextures = createFloorTextures(style, repeatX, repeatY);

    const floorTileMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: floorTextures.map,
      bumpMap: floorTextures.bumpMap,
      bumpScale: 0.006,
      roughnessMap: floorTextures.roughnessMap,
      roughness: style === 'blanco-pulido' ? 0.15 : 0.35,
      metalness: style === 'blanco-pulido' ? 0.08 : 0.02,
    });

    const slabThickness = 0.22;
    const floorGeo = new THREE.BoxGeometry(terraceW, slabThickness, terraceD);
    const floorMesh = new THREE.Mesh(floorGeo, floorTileMat);
    floorMesh.position.set(0, -slabThickness / 2, centerZ);
    floorMesh.receiveShadow = true;
    floorGroup.add(floorMesh);

    // Perimeter white baseboard (zócalo perimetral) along the rear wall
    const baseboardMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.3,
    });
    const zocaloBackGeo = new THREE.BoxGeometry(W + 0.46, 0.08, 0.02);
    const zocaloBack = new THREE.Mesh(zocaloBackGeo, baseboardMat);
    zocaloBack.position.set(0, 0.04, -D / 2 - 0.02);
    floorGroup.add(zocaloBack);

    // Darker foundation rim below terrace
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const rimGeo = new THREE.BoxGeometry(terraceW + 0.2, 0.4, terraceD + 0.2);
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.set(0, -slabThickness - 0.2, centerZ);
    floorGroup.add(rimMesh);

    this.group.add(floorGroup);
  }

  // ==========================================
  // 2. BACK WALL & VERTICAL GARDEN
  // ==========================================
  private buildBackWall(W: number, D: number, H: number, hasGarden: boolean) {
    const wallGroup = new THREE.Group();
    const wallThickness = 0.25;
    const totalWallHeight = H + 0.85;

    // Structural concrete masonry wall
    const wallGeo = new THREE.BoxGeometry(W + 0.5, totalWallHeight, wallThickness);
    const baseWallMat = new THREE.MeshStandardMaterial({
      color: hasGarden ? 0x0f2b18 : 0xf8fafc,
      roughness: 0.85,
    });
    const wallMesh = new THREE.Mesh(wallGeo, baseWallMat);
    wallMesh.position.set(0, totalWallHeight / 2 - 0.1, -D / 2 - wallThickness / 2);
    wallMesh.receiveShadow = true;
    wallMesh.castShadow = true;
    wallGroup.add(wallMesh);

    // White architectural wall coping/crown (albardilla superior)
    const copingGeo = new THREE.BoxGeometry(W + 0.56, 0.08, wallThickness + 0.06);
    const copingMesh = new THREE.Mesh(copingGeo, this.whitePlasterMat);
    copingMesh.position.set(0, totalWallHeight - 0.06, -D / 2 - wallThickness / 2);
    wallGroup.add(copingMesh);

    if (hasGarden) {
      // Substrate dark moss backing panel
      const gardenBackGeo = new THREE.BoxGeometry(W + 0.38, totalWallHeight - 0.2, 0.05);
      const gardenBackMat = new THREE.MeshStandardMaterial({
        color: 0x092612,
        roughness: 0.95,
      });
      const gardenBack = new THREE.Mesh(gardenBackGeo, gardenBackMat);
      gardenBack.position.set(0, (totalWallHeight - 0.2) / 2, -D / 2 + 0.025);
      wallGroup.add(gardenBack);

      // Black vertical aluminum mounting profile grid
      const gridCount = Math.floor((W + 0.4) / 0.6);
      for (let i = 0; i <= gridCount; i++) {
        const x = -(W + 0.4) / 2 + (i / gridCount) * (W + 0.4);
        const railGeo = new THREE.BoxGeometry(0.025, totalWallHeight - 0.2, 0.03);
        const rail = new THREE.Mesh(railGeo, this.ironMat);
        rail.position.set(x, (totalWallHeight - 0.2) / 2, -D / 2 + 0.04);
        wallGroup.add(rail);
      }

      // HIGH-DENSITY ORGANIC FOLIAGE (Layered leaf clusters & ferns)
      const countX = Math.floor((W + 0.4) * 9);
      const countY = Math.floor((totalWallHeight - 0.2) * 7.5);

      // Varied leaf cluster shapes
      const clusterGeoA = new THREE.DodecahedronGeometry(0.12, 1);
      const clusterGeoB = new THREE.IcosahedronGeometry(0.15, 0);

      // Leaf blade geometry for Monstera / broadleaf plants
      const leafShape = new THREE.Shape();
      leafShape.moveTo(0, 0);
      leafShape.bezierCurveTo(-0.08, 0.08, -0.09, 0.22, 0, 0.32);
      leafShape.bezierCurveTo(0.09, 0.22, 0.08, 0.08, 0, 0);
      const singleLeafGeo = new THREE.ShapeGeometry(leafShape);

      for (let ix = 0; ix < countX; ix++) {
        for (let iy = 0; iy < countY; iy++) {
          const jitterX = Math.random() * 0.08 - 0.04;
          const jitterY = Math.random() * 0.08 - 0.04;
          const px = -(W + 0.35) / 2 + ((W + 0.35) / countX) * ix + jitterX;
          const py = 0.15 + ((totalWallHeight - 0.4) / countY) * iy + jitterY;
          const pz = -D / 2 + 0.09 + Math.random() * 0.08;

          const matIdx = (ix * 3 + iy * 5) % this.leafMats.length;
          const leafMat = this.leafMats[matIdx];

          if ((ix + iy) % 4 === 0) {
            // Broad tropical leaf angled naturally
            const leafMesh = new THREE.Mesh(singleLeafGeo, leafMat);
            leafMesh.position.set(px, py, pz);
            leafMesh.rotation.set(
              Math.random() * 0.5 - 0.25,
              Math.random() * 0.6 - 0.3,
              Math.random() * Math.PI * 2
            );
            const scale = 0.8 + Math.random() * 0.6;
            leafMesh.scale.set(scale, scale, scale);
            leafMesh.castShadow = true;
            wallGroup.add(leafMesh);
          } else {
            // Volumetric leaf cluster (fern/moss rosette)
            const geo = (ix + iy) % 2 === 0 ? clusterGeoA : clusterGeoB;
            const cluster = new THREE.Mesh(geo, leafMat);
            cluster.position.set(px, py, pz);
            cluster.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            const scale = 0.8 + Math.random() * 0.5;
            cluster.scale.set(scale, scale * (0.8 + Math.random() * 0.4), scale);
            cluster.castShadow = true;
            wallGroup.add(cluster);
          }
        }
      }
    }

    this.group.add(wallGroup);
  }

  // ==========================================
  // 3. FREESTANDING OUTDOOR BARBECUE (PARRILLA EXENTA)
  // ==========================================
  private buildBarbecue(W: number, D: number, H: number, bbqW: number, isNight: boolean) {
    const bbqGroup = new THREE.Group();
    const bbqDepth = 0.88;
    const posX = W / 2 - bbqW / 2;
    const posZ = -D / 2 + bbqDepth / 2 + 0.08;

    // A. Lower Storage Cabinet / Mampostería Blanca Inferior
    const baseH = 0.92;
    const baseGeo = new THREE.BoxGeometry(bbqW, baseH, bbqDepth);
    const baseMesh = new THREE.Mesh(baseGeo, this.whitePlasterMat);
    baseMesh.position.set(posX, baseH / 2, posZ);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    bbqGroup.add(baseMesh);

    // Matte black iron lower double doors (bajo parrilla)
    const doorW = (bbqW - 0.16) / 2;
    const doorH = baseH - 0.2;
    [-doorW / 2 - 0.015, doorW / 2 + 0.015].forEach((dx) => {
      const doorGeo = new THREE.BoxGeometry(doorW, doorH, 0.02);
      const doorMesh = new THREE.Mesh(doorGeo, this.ironMat);
      doorMesh.position.set(posX + dx, baseH / 2 - 0.02, posZ + bbqDepth / 2 + 0.012);
      doorMesh.castShadow = true;
      bbqGroup.add(doorMesh);

      // Stainless steel horizontal pull handle
      const handleGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.22, 12);
      const handle = new THREE.Mesh(handleGeo, this.stainlessMat);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(posX + dx, baseH / 2 + 0.1, posZ + bbqDepth / 2 + 0.035);
      bbqGroup.add(handle);
    });

    // B. Polished Granite / Countertop Slab
    const topThickness = 0.04;
    const topGeo = new THREE.BoxGeometry(bbqW + 0.06, topThickness, bbqDepth + 0.06);
    const topMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.2,
      metalness: 0.1,
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.set(posX, baseH + topThickness / 2, posZ);
    topMesh.castShadow = true;
    bbqGroup.add(topMesh);

    // C. Firebox Chamber & Refractory Brick Interior
    const cavityH = 0.72;
    const cavityW = bbqW - 0.22;
    const cavityD = bbqDepth - 0.14;
    const fireboxY = baseH + topThickness + cavityH / 2;

    // Refractory brick lining
    const brickTex = createRefractoryBrickTexture();
    const brickMat = new THREE.MeshStandardMaterial({
      map: brickTex.map,
      bumpMap: brickTex.bumpMap,
      bumpScale: 0.015,
      roughness: 0.85,
    });

    // Back refractory wall
    const brickBackGeo = new THREE.BoxGeometry(cavityW, cavityH, 0.04);
    const brickBack = new THREE.Mesh(brickBackGeo, brickMat);
    brickBack.position.set(posX, fireboxY, posZ - cavityD / 2 + 0.02);
    bbqGroup.add(brickBack);

    // Side refractory walls
    [-cavityW / 2 + 0.02, cavityW / 2 - 0.02].forEach((sx) => {
      const brickSideGeo = new THREE.BoxGeometry(0.04, cavityH, cavityD);
      const brickSide = new THREE.Mesh(brickSideGeo, brickMat);
      brickSide.position.set(posX + sx, fireboxY, posZ);
      bbqGroup.add(brickSide);
    });

    // Refractory floor hearth
    const brickFloorGeo = new THREE.BoxGeometry(cavityW, 0.04, cavityD);
    const brickFloor = new THREE.Mesh(brickFloorGeo, brickMat);
    brickFloor.position.set(posX, baseH + topThickness + 0.02, posZ);
    bbqGroup.add(brickFloor);

    // D. Stainless Steel V-Channel Grill & Drip Pan (Parrilla en V con grasero)
    const grillW = cavityW * 0.65;
    const grillD = cavityD - 0.1;
    const grillY = baseH + topThickness + 0.18;
    const grillCenterX = posX - cavityW * 0.15;

    // Front grease collector trough (grasero)
    const troughGeo = new THREE.BoxGeometry(grillW, 0.03, 0.04);
    const trough = new THREE.Mesh(troughGeo, this.stainlessMat);
    trough.position.set(grillCenterX, grillY - 0.01, posZ + grillD / 2);
    bbqGroup.add(trough);

    // Individual V-ribs
    const numRibs = 18;
    for (let r = 0; r < numRibs; r++) {
      const rx = grillCenterX - grillW / 2 + (r / numRibs) * grillW + 0.01;
      const ribGeo = new THREE.BoxGeometry(0.012, 0.015, grillD);
      const ribMesh = new THREE.Mesh(ribGeo, this.stainlessMat);
      ribMesh.position.set(rx, grillY, posZ);
      ribMesh.castShadow = true;
      bbqGroup.add(ribMesh);
    }

    // Side elevation crank wheel (malacate / manivela con cable)
    const crankStemGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.14, 12);
    const crankStem = new THREE.Mesh(crankStemGeo, this.stainlessMat);
    crankStem.rotation.z = Math.PI / 2;
    crankStem.position.set(posX - cavityW / 2 - 0.07, grillY + 0.15, posZ + 0.05);
    bbqGroup.add(crankStem);

    const crankWheelGeo = new THREE.TorusGeometry(0.065, 0.008, 12, 24);
    const crankWheel = new THREE.Mesh(crankWheelGeo, this.stainlessMat);
    crankWheel.rotation.y = Math.PI / 2;
    crankWheel.position.set(posX - cavityW / 2 - 0.14, grillY + 0.15, posZ + 0.05);
    bbqGroup.add(crankWheel);

    // E. Uruguayan Firebox Basket (Brasero uruguayo de varillas para leña/carbón)
    const basketW = cavityW * 0.28;
    const basketCenterX = posX + cavityW * 0.32;
    for (let b = 0; b < 6; b++) {
      const barGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.28, 8);
      const bar = new THREE.Mesh(barGeo, this.ironMat);
      bar.position.set(basketCenterX - basketW / 2 + (b / 5) * basketW, grillY + 0.1, posZ);
      bbqGroup.add(bar);
    }

    // Glowing embers / brasas incandescentes
    const emberBedGeo = new THREE.BoxGeometry(basketW + 0.04, 0.04, grillD * 0.7);
    const emberBed = new THREE.Mesh(emberBedGeo, this.emberMat);
    emberBed.position.set(basketCenterX, baseH + topThickness + 0.05, posZ);
    bbqGroup.add(emberBed);

    // Ember light
    this.emberLight = new THREE.PointLight(0xff5500, isNight ? 1.8 : 0.6, 2.5);
    this.emberLight.position.set(basketCenterX, baseH + topThickness + 0.18, posZ);
    bbqGroup.add(this.emberLight);

    // F. Architectural Tapered Hood & Chimney (Campana blanca con conducto)
    const hoodBaseY = baseH + topThickness + cavityH;
    const hoodH = 0.95;

    // Tapered hood geometry
    const hoodGeo = new THREE.BoxGeometry(bbqW, hoodH, bbqDepth);
    const hoodMesh = new THREE.Mesh(hoodGeo, this.whitePlasterMat);
    hoodMesh.position.set(posX, hoodBaseY + hoodH / 2, posZ);
    hoodMesh.castShadow = true;
    bbqGroup.add(hoodMesh);

    // Architectural extraction flue chimney / conducto superior
    const chimneyH = 0.65;
    const chimneyGeo = new THREE.BoxGeometry(0.48, chimneyH, 0.48);
    const chimneyMesh = new THREE.Mesh(chimneyGeo, this.whitePlasterMat);
    chimneyMesh.position.set(posX, hoodBaseY + hoodH + chimneyH / 2, posZ);
    chimneyMesh.castShadow = true;
    bbqGroup.add(chimneyMesh);

    // Chimney cap (sombrerete tipo spiro de hierro negro)
    const capGeo = new THREE.BoxGeometry(0.56, 0.05, 0.56);
    const capMesh = new THREE.Mesh(capGeo, this.ironMat);
    capMesh.position.set(posX, hoodBaseY + hoodH + chimneyH + 0.03, posZ);
    bbqGroup.add(capMesh);

    this.group.add(bbqGroup);
  }

  // ==========================================
  // 4. STEEL PERGOLA FRAMEWORK (COLUMNS, BEAMS, ANCHORS)
  // ==========================================
  private buildPergolaSteel(galleryW: number, galleryOffsetX: number, D: number, H: number) {
    const steelGroup = new THREE.Group();
    const colSize = 0.1; // 100x100mm structural tubing

    // Number of columns based on width
    const cantCols = galleryW > 5.5 ? 3 : 2;
    const colXs =
      cantCols === 2
        ? [-galleryW / 2 + colSize / 2 + 0.05, galleryW / 2 - colSize / 2 - 0.05]
        : [-galleryW / 2 + colSize / 2 + 0.05, 0, galleryW / 2 - colSize / 2 - 0.05];

    // Front Support Columns & Floor Baseplates
    colXs.forEach((rx) => {
      const cx = galleryOffsetX + rx;
      const cz = D / 2 - colSize / 2 - 0.02;

      // Vertical structural column
      const colGeo = new THREE.BoxGeometry(colSize, H, colSize);
      const colMesh = new THREE.Mesh(colGeo, this.ironMat);
      colMesh.position.set(cx, H / 2, cz);
      colMesh.castShadow = true;
      colMesh.receiveShadow = true;
      steelGroup.add(colMesh);

      // Floor anchor baseplate (placa base con 4 bulones)
      const baseplateGeo = new THREE.BoxGeometry(colSize + 0.08, 0.015, colSize + 0.08);
      const baseplate = new THREE.Mesh(baseplateGeo, this.ironMat);
      baseplate.position.set(cx, 0.008, cz);
      steelGroup.add(baseplate);

      // 4 hexagonal anchor bolts
      [
        [-0.05, -0.05],
        [0.05, -0.05],
        [-0.05, 0.05],
        [0.05, 0.05],
      ].forEach(([bx, bz]) => {
        const boltGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.02, 6);
        const bolt = new THREE.Mesh(boltGeo, this.stainlessMat);
        bolt.position.set(cx + bx, 0.02, cz + bz);
        steelGroup.add(bolt);
      });
    });

    // Wall Anchor Plates & Tiebacks (cartelas de anclaje amuradas a la pared trasera)
    [-galleryW / 2 + 0.1, galleryW / 2 - 0.1].forEach((rx) => {
      const wx = galleryOffsetX + rx;
      const wz = -D / 2 + 0.06;

      const plateGeo = new THREE.BoxGeometry(0.14, 0.28, 0.06);
      const plate = new THREE.Mesh(plateGeo, this.ironMat);
      plate.position.set(wx, H - 0.05, wz);
      steelGroup.add(plate);

      // 2 wall anchor studs
      [-0.07, 0.07].forEach((dy) => {
        const studGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.03, 6);
        const stud = new THREE.Mesh(studGeo, this.stainlessMat);
        stud.rotation.x = Math.PI / 2;
        stud.position.set(wx, H - 0.05 + dy, wz + 0.03);
        steelGroup.add(stud);
      });
    });

    // Perimeter Structural Beams (Viga frontal principal y vigas laterales)
    const beamH = 0.14;
    const beamW = 0.09;

    // Front Main Girder Beam (viga de carga frontal)
    const frontBeamGeo = new THREE.BoxGeometry(galleryW, beamH, beamW);
    const frontBeam = new THREE.Mesh(frontBeamGeo, this.ironMat);
    frontBeam.position.set(galleryOffsetX, H, D / 2 - beamW / 2 - 0.02);
    frontBeam.castShadow = true;
    steelGroup.add(frontBeam);

    // Front hidden gutter (canaleta de desagüe pluvial)
    const gutterGeo = new THREE.BoxGeometry(galleryW, 0.08, 0.05);
    const gutter = new THREE.Mesh(gutterGeo, this.ironMat);
    gutter.position.set(galleryOffsetX, H + 0.04, D / 2 + 0.03);
    steelGroup.add(gutter);

    // Downspout on the left column (caño de bajada pluvial)
    const downspoutGeo = new THREE.CylinderGeometry(0.025, 0.025, H, 16);
    const downspout = new THREE.Mesh(downspoutGeo, this.ironMat);
    downspout.position.set(galleryOffsetX - galleryW / 2 + 0.04, H / 2, D / 2 + 0.03);
    steelGroup.add(downspout);

    // Side Structural Beams
    [-galleryW / 2 + beamW / 2, galleryW / 2 - beamW / 2].forEach((rx) => {
      const sideBeamGeo = new THREE.BoxGeometry(beamW, beamH, D);
      const sideBeam = new THREE.Mesh(sideBeamGeo, this.ironMat);
      sideBeam.position.set(galleryOffsetX + rx, H, 0);
      sideBeam.castShadow = true;
      steelGroup.add(sideBeam);
    });

    // Transverse Structural Joists (Correas de hierro transversales)
    const numJoists = Math.max(3, Math.ceil(galleryW / 0.95));
    for (let j = 1; j < numJoists; j++) {
      const jx = -galleryW / 2 + (j / numJoists) * galleryW;
      const joistGeo = new THREE.BoxGeometry(0.06, 0.1, D);
      const joistMesh = new THREE.Mesh(joistGeo, this.ironMat);
      joistMesh.position.set(galleryOffsetX + jx, H - 0.02, 0);
      joistMesh.castShadow = true;
      steelGroup.add(joistMesh);
    }

    this.group.add(steelGroup);
  }

  // ==========================================
  // 5. WOODEN CEILING SLATS (CIELO RASO DE LISTONES) & SPOTS
  // ==========================================
  private buildWoodenCeiling(
    galleryW: number,
    galleryOffsetX: number,
    D: number,
    H: number,
    woodMat: THREE.MeshStandardMaterial,
    enableLights: boolean,
    isNight: boolean
  ) {
    const ceilingGroup = new THREE.Group();

    // Slat geometry parameters
    const slatW = galleryW - 0.12;
    const slatThickness = 0.028;
    const slatDepth = 0.065;
    const slatSpacing = 0.115; // pitch
    const numSlats = Math.floor(D / slatSpacing);

    const slatGeo = new THREE.BoxGeometry(slatW, slatThickness, slatDepth);

    for (let i = 0; i < numSlats; i++) {
      const sz = -D / 2 + i * slatSpacing + 0.08;
      const slatMesh = new THREE.Mesh(slatGeo, woodMat);
      slatMesh.position.set(galleryOffsetX, H - 0.055, sz);
      slatMesh.castShadow = true;
      slatMesh.receiveShadow = true;
      ceilingGroup.add(slatMesh);
    }

    // Modern Architectural Recessed Spotlights (Luminarias LED spot)
    if (enableLights) {
      const spotFixtureMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        metalness: 0.9,
        roughness: 0.2,
      });

      const spotLensMat = new THREE.MeshStandardMaterial({
        color: 0xfffbeb,
        emissive: isNight ? 0xffea9f : 0xffeeaa,
        emissiveIntensity: isNight ? 2.5 : 0.8,
        roughness: 0.1,
      });

      // Photometric spotlight positions
      const spotPositions = [
        { x: galleryOffsetX - galleryW * 0.28, z: -D * 0.22 },
        { x: galleryOffsetX, z: -D * 0.22 },
        { x: galleryOffsetX + galleryW * 0.28, z: -D * 0.22 },
        { x: galleryOffsetX - galleryW * 0.28, z: D * 0.22 },
        { x: galleryOffsetX, z: D * 0.22 },
        { x: galleryOffsetX + galleryW * 0.28, z: D * 0.22 },
      ];

      spotPositions.forEach((pos) => {
        // Outer cylindrical housing bezel
        const bezelGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.035, 24);
        const bezel = new THREE.Mesh(bezelGeo, spotFixtureMat);
        bezel.position.set(pos.x, H - 0.065, pos.z);
        ceilingGroup.add(bezel);

        // Center warm LED lens
        const lensGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.008, 24);
        const lens = new THREE.Mesh(lensGeo, spotLensMat);
        lens.position.set(pos.x, H - 0.078, pos.z);
        ceilingGroup.add(lens);

        // Real Three.js SpotLight casting warm pool onto white floor
        const spotLight = new THREE.SpotLight(
          0xffeedd,
          isNight ? 1.6 : 0.6,
          H + 1.5,
          Math.PI / 4.2,
          0.45,
          1.2
        );
        spotLight.position.set(pos.x, H - 0.08, pos.z);
        spotLight.target.position.set(pos.x, 0, pos.z);
        spotLight.castShadow = isNight;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.bias = -0.001;

        ceilingGroup.add(spotLight);
        ceilingGroup.add(spotLight.target);
        this.spotLights.push(spotLight);
      });
    }

    this.group.add(ceilingGroup);
  }

  // ==========================================
  // 6. CORRUGATED TRANSLUCENT ROOF (CHAPA ACANALADA TRASLÚCIDA)
  // ==========================================
  private buildCorrugatedRoof(galleryW: number, galleryOffsetX: number, D: number, H: number) {
    const roofGroup = new THREE.Group();
    const roofW = galleryW + 0.16;
    const roofD = D + 0.25;

    // High resolution continuous sinusoidal corrugated sheet
    const pitch = 0.095; // wavelength of wave
    const waveAmp = 0.022; // peak-to-peak amplitude
    const numX = 140;
    const numZ = 20;

    const roofGeo = new THREE.PlaneGeometry(roofW, roofD, numX, numZ);
    const posAttr = roofGeo.attributes.position;

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      // Sinusoidal crest and valley
      const zOffset = Math.sin((x / pitch) * Math.PI * 2) * waveAmp;
      posAttr.setZ(i, zOffset);
    }
    roofGeo.computeVertexNormals();

    const roofMesh = new THREE.Mesh(roofGeo, this.corrugatedRoofMat);
    roofMesh.rotation.x = -Math.PI / 2 + 0.035; // 2° drainage slope forward
    roofMesh.position.set(galleryOffsetX, H + 0.08, 0);
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    roofGroup.add(roofMesh);

    // Neoprene-washer fastening screws (tornillos autoperforantes con arandela de goma)
    const screwCountX = Math.ceil(roofW / 0.35);
    [-D * 0.4, 0, D * 0.4].forEach((sz) => {
      for (let s = 0; s <= screwCountX; s++) {
        const sx = -roofW / 2 + (s / screwCountX) * roofW;
        const screwGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.015, 6);
        const screw = new THREE.Mesh(screwGeo, this.stainlessMat);
        const crestY = H + 0.08 + waveAmp + 0.01 - (sz / D) * 0.02;
        screw.position.set(galleryOffsetX + sx, crestY, sz);
        roofGroup.add(screw);
      }
    });

    this.group.add(roofGroup);
  }

  // ==========================================
  // 7. DESIGNER PLANTERS & VEGETATION (MACETEROS)
  // ==========================================
  private buildPlanters(count: number, galleryW: number, galleryOffsetX: number, D: number) {
    const planterGroup = new THREE.Group();

    // Designer charcoal ribbed planter material
    const planterMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.6,
      metalness: 0.1,
    });

    // Dark soil & white river pebbles
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 });
    const pebbleMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });

    const planterPositions: { x: number; z: number; scale: number }[] = [
      { x: galleryOffsetX - galleryW / 2 + 0.45, z: D / 2 + 0.4, scale: 1.0 },
      { x: galleryOffsetX + galleryW / 2 + 0.8, z: D / 2 + 0.4, scale: 0.95 },
      { x: galleryOffsetX - galleryW / 2 - 0.9, z: D / 2 + 1.2, scale: 0.9 },
      { x: galleryOffsetX + galleryW / 2 + 1.8, z: 0.6, scale: 0.85 },
      { x: galleryOffsetX - galleryW / 2 - 1.4, z: 0.6, scale: 0.8 },
      { x: galleryOffsetX - 0.8, z: D + 1.6, scale: 0.9 },
    ];

    for (let i = 0; i < Math.min(count, planterPositions.length); i++) {
      const pos = planterPositions[i];
      const pScale = pos.scale;
      const potGroup = new THREE.Group();

      // Fluted conical pot
      const potH = 0.65 * pScale;
      const potTopR = 0.28 * pScale;
      const potBotR = 0.18 * pScale;
      const potGeo = new THREE.CylinderGeometry(potTopR, potBotR, potH, 32);
      const potMesh = new THREE.Mesh(potGeo, planterMat);
      potMesh.position.y = potH / 2;
      potMesh.castShadow = true;
      potMesh.receiveShadow = true;
      potGroup.add(potMesh);

      // Soil layer
      const soilGeo = new THREE.CylinderGeometry(potTopR - 0.02, potTopR - 0.02, 0.05, 24);
      const soilMesh = new THREE.Mesh(soilGeo, soilMat);
      soilMesh.position.y = potH - 0.03;
      potGroup.add(soilMesh);

      // White marble pebbles around plant base
      for (let p = 0; p < 8; p++) {
        const ang = (p / 8) * Math.PI * 2;
        const pr = (potTopR - 0.08) * Math.random();
        const pebbleGeo = new THREE.DodecahedronGeometry(0.02 * pScale);
        const pebble = new THREE.Mesh(pebbleGeo, pebbleMat);
        pebble.position.set(Math.cos(ang) * pr, potH - 0.015, Math.sin(ang) * pr);
        potGroup.add(pebble);
      }

      // Strelitzia / Fiddle Leaf Fig foliage
      const stemCount = 5 + Math.floor(Math.random() * 3);
      for (let s = 0; s < stemCount; s++) {
        const stemGroup = new THREE.Group();
        const sAngle = (s / stemCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
        const sHeight = (0.7 + Math.random() * 0.5) * pScale;

        // Curved green stem
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(Math.cos(sAngle) * 0.1, sHeight * 0.5, Math.sin(sAngle) * 0.1),
          new THREE.Vector3(Math.cos(sAngle) * 0.25, sHeight, Math.sin(sAngle) * 0.25)
        );
        const stemGeo = new THREE.TubeGeometry(curve, 12, 0.012 * pScale, 8, false);
        const stemMesh = new THREE.Mesh(stemGeo, this.leafMats[1]);
        stemMesh.castShadow = true;
        stemGroup.add(stemMesh);

        // Broad architectural leaf
        const leafW = 0.22 * pScale;
        const leafL = 0.45 * pScale;
        const leafShape = new THREE.Shape();
        leafShape.moveTo(0, 0);
        leafShape.bezierCurveTo(-leafW, leafL * 0.3, -leafW * 0.8, leafL * 0.8, 0, leafL);
        leafShape.bezierCurveTo(leafW * 0.8, leafL * 0.8, leafW, leafL * 0.3, 0, 0);
        const leafGeo = new THREE.ShapeGeometry(leafShape);

        const leafMesh = new THREE.Mesh(leafGeo, this.leafMats[s % this.leafMats.length]);
        leafMesh.position.copy(curve.getPoint(1));
        leafMesh.rotation.set(
          0.4 + Math.random() * 0.3,
          sAngle + Math.PI / 2,
          -0.3 + Math.random() * 0.6
        );
        leafMesh.castShadow = true;
        stemGroup.add(leafMesh);

        stemGroup.position.y = potH - 0.04;
        potGroup.add(stemGroup);
      }

      potGroup.position.set(pos.x, 0, pos.z);
      planterGroup.add(potGroup);
    }

    this.group.add(planterGroup);
  }

  // ==========================================
  // 8. CONTEMPORARY OUTDOOR FURNITURE (LOUNGE CHAIR)
  // ==========================================
  private buildLoungeFurniture(galleryOffsetX: number, D: number) {
    const furnGroup = new THREE.Group();

    // Natural teak wood slats for modern armchair
    const teakMat = this.getWoodMaterial(0x8d5c36);
    // Weather-resistant cream outdoor fabric cushion
    const fabricMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.85,
      metalness: 0.0,
    });

    const chairX = galleryOffsetX;
    const chairZ = 0.2;

    // Chair base frame
    const baseW = 0.85;
    const baseD = 0.85;
    const seatH = 0.35;

    // 4 legs
    [
      [-baseW / 2 + 0.04, -baseD / 2 + 0.04],
      [baseW / 2 - 0.04, -baseD / 2 + 0.04],
      [-baseW / 2 + 0.04, baseD / 2 - 0.04],
      [baseW / 2 - 0.04, baseD / 2 - 0.04],
    ].forEach(([lx, lz]) => {
      const legGeo = new THREE.CylinderGeometry(0.02, 0.015, seatH, 12);
      const leg = new THREE.Mesh(legGeo, this.ironMat);
      leg.position.set(lx, seatH / 2, lz);
      leg.castShadow = true;
      furnGroup.add(leg);
    });

    // Wooden slat seat deck
    const deckGeo = new THREE.BoxGeometry(baseW, 0.03, baseD);
    const deck = new THREE.Mesh(deckGeo, teakMat);
    deck.position.set(0, seatH, 0);
    deck.castShadow = true;
    furnGroup.add(deck);

    // Thick seat cushion
    const seatCushionGeo = new THREE.BoxGeometry(baseW - 0.06, 0.12, baseD - 0.06);
    const seatCushion = new THREE.Mesh(seatCushionGeo, fabricMat);
    seatCushion.position.set(0, seatH + 0.06, 0);
    seatCushion.castShadow = true;
    furnGroup.add(seatCushion);

    // Angled backrest
    const backGeo = new THREE.BoxGeometry(baseW - 0.06, 0.48, 0.1);
    const backCushion = new THREE.Mesh(backGeo, fabricMat);
    backCushion.position.set(0, seatH + 0.32, -baseD / 2 + 0.08);
    backCushion.rotation.x = -0.15;
    backCushion.castShadow = true;
    furnGroup.add(backCushion);

    furnGroup.position.set(chairX, 0, chairZ);
    furnGroup.rotation.y = -Math.PI / 6;
    this.group.add(furnGroup);
  }
}
