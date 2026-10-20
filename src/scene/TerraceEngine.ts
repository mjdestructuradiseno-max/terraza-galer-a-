import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { TerraceConfig, CameraViewType } from '../types';
import { TerraceBuilder } from './TerraceBuilder';

export class TerraceEngine {
  private canvas: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private builder: TerraceBuilder;

  // Lights
  private ambientLight!: THREE.AmbientLight;
  private hemiLight!: THREE.HemisphereLight;
  private sunLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;
  private nightPointLight!: THREE.PointLight;

  // Horizon & Sky elements
  private skyBackdropGroup: THREE.Group = new THREE.Group();

  // Animation & Transition state
  private isDestroyed = false;
  private isSoftwareGl = false;
  private animFrameId = 0;
  private isAutoRotating = true;

  // Smooth camera interpolation targets
  private targetCameraPos = new THREE.Vector3(8.2, 5.0, 9.2);
  private targetLookAt = new THREE.Vector3(0, 1.2, 1.2);
  private isTransitioningCamera = false;

  private currentConfig: TerraceConfig;

  constructor(canvas: HTMLCanvasElement, initialConfig: TerraceConfig) {
    this.canvas = canvas;
    this.currentConfig = { ...initialConfig };
    this.isAutoRotating = initialConfig.autoRotate;

    this.checkSoftwareGl();
    this.initScene();
    this.initRenderer();
    this.initCamera();
    this.initControls();
    this.initLighting();
    this.initSkyBackdrop();

    this.builder = new TerraceBuilder();
    this.scene.add(this.builder.getGroup());
    this.builder.build(this.currentConfig);

    this.updateAtmosphere(this.currentConfig.isNight);
    this.startRenderLoop();

    window.addEventListener('resize', this.onResize);
  }

  private checkSoftwareGl() {
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) {
        this.isSoftwareGl = true;
        return;
      }
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      this.isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } catch {
      this.isSoftwareGl = false;
    }
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.025);
  }

  private initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false);
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );

    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Studio Environment map via RoomEnvironment for realistic PBR reflections
    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (e) {
      console.warn('RoomEnvironment fallback', e);
    }
  }

  private initCamera() {
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight || 1;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 120);
    this.camera.position.set(8.2, 5.0, 9.2);
    this.camera.lookAt(0, 1.2, 1.2);
  }

  private initControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.08; // Allow viewing slightly from below floor
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 35.0;
    this.controls.target.set(0, 1.2, 1.2);

    this.controls.addEventListener('start', () => {
      // User is manually controlling
      this.isTransitioningCamera = false;
    });
  }

  private initLighting() {
    // Hemisphere light: cool sky + warm ground bounce
    this.hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.65);
    this.scene.add(this.hemiLight);

    // Warm Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xfffbeb, 0.45);
    this.scene.add(this.ambientLight);

    // Sun directional key light (casting soft sharp shadows)
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.6);
    this.sunLight.position.set(9, 16, 11);
    this.sunLight.castShadow = !this.isSoftwareGl;

    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 45;
    this.sunLight.shadow.camera.left = -14;
    this.sunLight.shadow.camera.right = 14;
    this.sunLight.shadow.camera.top = 14;
    this.sunLight.shadow.camera.bottom = -10;
    this.sunLight.shadow.bias = -0.0004;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight);

    // Subtle cool rim light from opposite angle
    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    this.rimLight.position.set(-10, 8, -8);
    this.scene.add(this.rimLight);

    // Night atmospheric light
    this.nightPointLight = new THREE.PointLight(0x60a5fa, 0.1, 30);
    this.nightPointLight.position.set(0, 6, 2);
    this.scene.add(this.nightPointLight);
  }

  private initSkyBackdrop() {
    // Distant urban horizon silhouettes & subtle ground ring
    this.skyBackdropGroup = new THREE.Group();

    // Large ambient ground plane beyond terrace
    const groundGeo = new THREE.PlaneGeometry(120, 120);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x070c18,
      roughness: 0.95,
      metalness: 0.1,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.25;
    groundMesh.receiveShadow = true;
    this.skyBackdropGroup.add(groundMesh);

    // Distant city rooftop silhouettes
    const cityCount = 28;
    for (let i = 0; i < cityCount; i++) {
      const angle = (i / cityCount) * Math.PI * 2;
      const dist = 35 + Math.random() * 15;
      const bW = 4 + Math.random() * 6;
      const bD = 4 + Math.random() * 6;
      const bH = 6 + Math.random() * 16;

      const buildingGeo = new THREE.BoxGeometry(bW, bH, bD);
      const buildingMat = new THREE.MeshStandardMaterial({
        color: 0x0c1527,
        roughness: 0.9,
      });
      const bMesh = new THREE.Mesh(buildingGeo, buildingMat);
      bMesh.position.set(Math.cos(angle) * dist, bH / 2 - 2, Math.sin(angle) * dist);
      this.skyBackdropGroup.add(bMesh);
    }

    this.scene.add(this.skyBackdropGroup);
  }

  private updateAtmosphere(isNight: boolean) {
    if (isNight) {
      this.scene.background = new THREE.Color(0x020617);
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color = new THREE.Color(0x020617);
        this.scene.fog.density = 0.035;
      }
      this.hemiLight.color.setHex(0x1e1b4b);
      this.hemiLight.groundColor.setHex(0x030712);
      this.hemiLight.intensity = 0.25;

      this.ambientLight.color.setHex(0x312e81);
      this.ambientLight.intensity = 0.12;

      this.sunLight.intensity = 0.05;
      this.sunLight.color.setHex(0x818cf8);

      this.rimLight.intensity = 0.2;
      this.rimLight.color.setHex(0x3b82f6);

      this.nightPointLight.intensity = 1.2;
      this.nightPointLight.color.setHex(0x38bdf8);

      this.renderer.toneMappingExposure = 1.0;
    } else {
      this.scene.background = new THREE.Color(0x0f172a);
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color = new THREE.Color(0x0f172a);
        this.scene.fog.density = 0.022;
      }
      this.hemiLight.color.setHex(0xdbeafe);
      this.hemiLight.groundColor.setHex(0x1e293b);
      this.hemiLight.intensity = 0.65;

      this.ambientLight.color.setHex(0xfffbeb);
      this.ambientLight.intensity = 0.45;

      this.sunLight.intensity = 1.6;
      this.sunLight.color.setHex(0xfffaed);

      this.rimLight.intensity = 0.4;
      this.rimLight.color.setHex(0x38bdf8);

      this.nightPointLight.intensity = 0.05;

      this.renderer.toneMappingExposure = 1.15;
    }
  }

  public updateConfig(newConfig: TerraceConfig) {
    const nightChanged = this.currentConfig.isNight !== newConfig.isNight;
    const rotateChanged = this.currentConfig.autoRotate !== newConfig.autoRotate;

    this.currentConfig = { ...newConfig };
    this.isAutoRotating = newConfig.autoRotate;

    if (nightChanged) {
      this.updateAtmosphere(newConfig.isNight);
    }

    if (rotateChanged) {
      this.isAutoRotating = newConfig.autoRotate;
    }

    // Rebuild 3D geometry and materials
    this.builder.build(this.currentConfig);
  }

  public toggleAutoRotate(): boolean {
    this.isAutoRotating = !this.isAutoRotating;
    this.currentConfig.autoRotate = this.isAutoRotating;
    return this.isAutoRotating;
  }

  public setCameraView(view: CameraViewType) {
    this.isAutoRotating = false;
    this.currentConfig.autoRotate = false;
    this.isTransitioningCamera = true;

    const W = this.currentConfig.ancho;
    const D = this.currentConfig.profundidad;
    const H = this.currentConfig.alto;
    const bbqWidth = this.currentConfig.mostrarParrilla ? 1.35 : 0;
    const galleryW = this.currentConfig.mostrarParrilla ? Math.max(1.8, W - bbqWidth - 0.25) : W;
    const galleryOffsetX = this.currentConfig.mostrarParrilla ? -W / 2 + galleryW / 2 : 0;

    switch (view) {
      case 'perspective':
        this.targetCameraPos.set(8.5, 5.2, 9.8);
        this.targetLookAt.set(0, 1.2, 1.2);
        break;
      case 'front':
        this.targetCameraPos.set(0, 2.6, 12.8);
        this.targetLookAt.set(0, 1.4, 1.2);
        break;
      case 'top':
        this.targetCameraPos.set(0, 15.0, 2.5);
        this.targetLookAt.set(0, 0, 2.5);
        break;
      case 'inside':
        this.targetCameraPos.set(galleryOffsetX, 1.45, -D / 2 + 0.5);
        this.targetLookAt.set(galleryOffsetX, 1.35, D + 3.0);
        break;
      case 'bbq':
        this.targetCameraPos.set(W / 2 - 0.2, 1.6, 3.0);
        this.targetLookAt.set(W / 2 - 0.65, 1.4, -D / 2 + 0.5);
        break;
      case 'ceiling':
        this.targetCameraPos.set(galleryOffsetX, 0.9, 0.5);
        this.targetLookAt.set(galleryOffsetX, H, 0.5);
        break;
    }
  }

  public resetDefaults(defaultConfig: TerraceConfig) {
    this.updateConfig(defaultConfig);
    this.setCameraView('perspective');
  }

  public takeSnapshot(): string {
    // Render current frame explicitly
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  private onResize = () => {
    if (!this.canvas || !this.renderer || !this.camera) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private startRenderLoop() {
    let lastTime = performance.now();

    const tick = (now: number) => {
      if (this.isDestroyed) return;

      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Auto rotation
      if (this.isAutoRotating && !this.isTransitioningCamera) {
        this.builder.getGroup().rotation.y += 0.0035;
      }

      // Smooth camera interpolation
      if (this.isTransitioningCamera) {
        // Exponential damping
        this.camera.position.lerp(this.targetCameraPos, 0.055);
        this.controls.target.lerp(this.targetLookAt, 0.055);

        if (this.camera.position.distanceTo(this.targetCameraPos) < 0.04) {
          this.camera.position.copy(this.targetCameraPos);
          this.controls.target.copy(this.targetLookAt);
          this.isTransitioningCamera = false;
        }
      }

      this.controls.update();
      this.renderer.render(this.scene, this.camera);

      this.animFrameId = requestAnimationFrame(tick);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
    this.controls?.dispose();
    this.renderer?.dispose();
  }
}
