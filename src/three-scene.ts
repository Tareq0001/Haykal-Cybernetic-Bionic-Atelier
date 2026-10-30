import * as THREE from 'three';
import { gsap } from 'gsap';
import { audioEngine } from './audio';

export type ChassisFinish = 'carbon' | 'titanium' | 'anodized' | 'obsidian';
export type GripPreset = 'fist' | 'pinch' | 'point' | 'hook' | 'peace' | 'neutral';

export interface FingerJoints {
  mcp: THREE.Group;
  pip?: THREE.Group;
  dip: THREE.Group;
  tipMesh: THREE.Mesh;
  armorPlates: THREE.Mesh[];
  baseRotX: number;
}

export class BionicScene {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  // Root arm & hand hierarchy
  private armRoot: THREE.Group;
  private wristYawGroup: THREE.Group;
  private wristPitchGroup: THREE.Group;
  private palmGroup: THREE.Group;

  // Finger articulation references
  private fingers: {
    thumb: FingerJoints;
    index: FingerJoints;
    middle: FingerJoints;
    ring: FingerJoints;
    pinky: FingerJoints;
  };

  // Armor meshes for explode view
  private allArmorPlates: { mesh: THREE.Mesh; originalPos: THREE.Vector3; explodeDir: THREE.Vector3 }[] = [];
  private isExploded: boolean = false;
  private isWireframe: boolean = false;
  private isAutoRotating: boolean = false;

  // Materials dictionary
  private materials: {
    armor: THREE.MeshStandardMaterial;
    innerChassis: THREE.MeshStandardMaterial;
    joints: THREE.MeshStandardMaterial;
    pistons: THREE.MeshStandardMaterial;
    glowingFiber: THREE.MeshStandardMaterial;
    tipSensors: THREE.MeshStandardMaterial[];
  };

  // Interaction / Orbit state
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private spherical = { radius: 11, phi: Math.PI / 2.3, theta: Math.PI / 3.8 };
  private targetSpherical = { radius: 11, phi: Math.PI / 2.3, theta: Math.PI / 3.8 };

  // Current finger values (0 to 100)
  public fingerValues = {
    thumb: 0,
    index: 0,
    middle: 0,
    ring: 0,
    pinky: 0,
    wristPitch: 0,
    wristYaw: 0
  };

  // Callbacks
  private onTelemetryUpdate?: (angles: { gripAngle: number; totalTorque: number }) => void;

  constructor(container: HTMLElement, canvas: HTMLCanvasElement) {
    this.container = container;
    this.canvas = canvas;

    // 1. Setup Three.js scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x020617, 0.035);

    // 2. Setup Camera
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.updateCameraPosition();

    // 3. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    // 4. Lighting Setup
    this.setupLighting();

    // 5. Materials
    this.materials = this.initMaterials();

    // 6. Build Articulated Hierarchy
    this.armRoot = new THREE.Group();
    this.wristYawGroup = new THREE.Group();
    this.wristPitchGroup = new THREE.Group();
    this.palmGroup = new THREE.Group();

    // Placeholder init for fingers before building
    const dummyJoint = (): FingerJoints => ({
      mcp: new THREE.Group(),
      dip: new THREE.Group(),
      tipMesh: new THREE.Mesh(),
      armorPlates: [],
      baseRotX: 0
    });
    this.fingers = {
      thumb: dummyJoint(),
      index: dummyJoint(),
      middle: dummyJoint(),
      ring: dummyJoint(),
      pinky: dummyJoint()
    };

    this.buildArmAndHand();
    this.scene.add(this.armRoot);

    // 7. Background cyber grid floor
    this.createCyberFloor();

    // 8. Event Listeners
    this.setupEventListeners();
    this.onResize();

    // 9. Start Render Loop
    this.animate();
  }

  private initMaterials() {
    const armor = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.65,
      roughness: 0.35,
      envMapIntensity: 1.2
    });

    const innerChassis = new THREE.MeshStandardMaterial({
      color: 0x030712,
      metalness: 0.85,
      roughness: 0.5
    });

    const joints = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.2
    });

    const pistons = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 1.0,
      roughness: 0.08
    });

    const glowingFiber = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.2,
      roughness: 0.1
    });

    const tipSensors: THREE.MeshStandardMaterial[] = [];
    for (let i = 0; i < 5; i++) {
      tipSensors.push(
        new THREE.MeshStandardMaterial({
          color: 0x84cc16,
          emissive: 0x84cc16,
          emissiveIntensity: 0.8,
          roughness: 0.3
        })
      );
    }

    return { armor, innerChassis, joints, pistons, glowingFiber, tipSensors };
  }

  private setupLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);

    // Key light (Cyan tinted)
    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    keyLight.position.set(6, 10, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    this.scene.add(keyLight);

    // Rim light (Neon Lime tinted)
    const rimLight = new THREE.DirectionalLight(0x84cc16, 2.2);
    rimLight.position.set(-8, 5, -6);
    this.scene.add(rimLight);

    // Warm underside bounce light
    const fillLight = new THREE.PointLight(0xa855f7, 1.5, 20);
    fillLight.position.set(0, -6, 3);
    this.scene.add(fillLight);
  }

  private createCyberFloor() {
    const grid = new THREE.GridHelper(24, 24, 0x00f0ff, 0x1e293b);
    grid.position.y = -5.0;
    (grid.material as THREE.Material).opacity = 0.25;
    (grid.material as THREE.Material).transparent = true;
    this.scene.add(grid);

    // Radial shadow receiver
    const discGeo = new THREE.RingGeometry(0.1, 7, 32);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      opacity: 0.45,
      transparent: true,
      side: THREE.DoubleSide
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = -4.95;
    this.scene.add(disc);
  }

  private buildArmAndHand() {
    // 1. Forearm chassis / socket
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0, -2.8, 0);

    // Carbon sleeve cylinder
    const sleeveGeo = new THREE.CylinderGeometry(1.3, 1.5, 4.2, 16);
    const sleeve = new THREE.Mesh(sleeveGeo, this.materials.armor);
    sleeve.castShadow = true;
    sleeve.receiveShadow = true;
    forearmGroup.add(sleeve);
    this.registerArmorPlate(sleeve, new THREE.Vector3(0, 0, 1.2));

    // Inner mechanical core
    const coreGeo = new THREE.CylinderGeometry(1.0, 1.1, 4.3, 12);
    const core = new THREE.Mesh(coreGeo, this.materials.innerChassis);
    forearmGroup.add(core);

    // Dual Hydraulic Piston Rods on Forearm
    for (const offset of [-0.9, 0.9]) {
      const pistonPillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 3.8, 8),
        this.materials.pistons
      );
      pistonPillar.position.set(offset, 0, 0.9);
      forearmGroup.add(pistonPillar);

      const collar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.4, 8),
        this.materials.joints
      );
      collar.position.set(offset, 1.2, 0.9);
      forearmGroup.add(collar);
    }

    // Glowing Optical Fiber Lines on forearm
    const fiberStrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 3.6, 0.08),
      this.materials.glowingFiber
    );
    fiberStrip.position.set(0, 0, 1.48);
    forearmGroup.add(fiberStrip);

    this.armRoot.add(forearmGroup);

    // 2. Wrist Gimbal (Yaw -> Pitch)
    this.wristYawGroup.position.set(0, -0.6, 0);
    this.armRoot.add(this.wristYawGroup);

    // Wrist ring joint
    const wristRingGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 16);
    const wristRing = new THREE.Mesh(wristRingGeo, this.materials.joints);
    wristRing.castShadow = true;
    this.wristYawGroup.add(wristRing);

    this.wristPitchGroup.position.set(0, 0.35, 0);
    this.wristYawGroup.add(this.wristPitchGroup);

    // 3. Palm Base Group
    this.palmGroup.position.set(0, 0, 0);
    this.wristPitchGroup.add(this.palmGroup);

    // Palm carbon chassis shell
    const palmShellGeo = new THREE.BoxGeometry(2.4, 2.2, 0.9);
    const palmShell = new THREE.Mesh(palmShellGeo, this.materials.armor);
    palmShell.position.set(0, 1.1, 0);
    palmShell.castShadow = true;
    palmShell.receiveShadow = true;
    this.palmGroup.add(palmShell);
    this.registerArmorPlate(palmShell, new THREE.Vector3(0, 0, 1.4));

    // Palm internal servo block
    const palmCore = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 1.8, 0.7),
      this.materials.innerChassis
    );
    palmCore.position.set(0, 1.1, 0);
    this.palmGroup.add(palmCore);

    // Palm central HUD hex conduit
    const hexConduit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.1, 6),
      this.materials.glowingFiber
    );
    hexConduit.rotation.x = Math.PI / 2;
    hexConduit.position.set(0, 1.1, 0.48);
    this.palmGroup.add(hexConduit);

    // Knuckle Hinge Bar across top of palm
    const knuckleBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 2.3, 12),
      this.materials.joints
    );
    knuckleBar.rotation.z = Math.PI / 2;
    knuckleBar.position.set(0, 2.2, 0);
    this.palmGroup.add(knuckleBar);

    // 4. Build Articulated Fingers
    // Palm top is at Y=2.2. Fingers span X: Index (-0.75), Middle (-0.25), Ring (0.25), Pinky (0.75)
    // Note: Thumb branches from the side at X=-1.2, Y=0.8
    this.fingers.thumb = this.createThumb();
    this.fingers.index = this.createFinger(-0.75, 2.25, 0.9, 0.7, 0.55, 0, 1);
    this.fingers.middle = this.createFinger(-0.25, 2.3, 1.05, 0.8, 0.6, 1, 2);
    this.fingers.ring = this.createFinger(0.25, 2.25, 0.95, 0.72, 0.55, 2, 3);
    this.fingers.pinky = this.createFinger(0.75, 2.15, 0.75, 0.55, 0.45, 3, 4);
  }

  /**
   * Builds an articulated 3-phalanx finger (Index, Middle, Ring, Pinky)
   */
  private createFinger(
    x: number,
    y: number,
    len1: number,
    len2: number,
    len3: number,
    _idx: number,
    sensorIdx: number
  ): FingerJoints {
    const armorPlates: THREE.Mesh[] = [];

    // MCP Joint (Metacarpophalangeal)
    const mcp = new THREE.Group();
    mcp.position.set(x, y, 0);
    this.palmGroup.add(mcp);

    // MCP joint sphere / cylinder
    const mcpPivot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.32, 10),
      this.materials.joints
    );
    mcpPivot.rotation.z = Math.PI / 2;
    mcp.add(mcpPivot);

    // Proximal Phalanx
    const p1 = this.createPhalanxMesh(len1, 0.22, 0.18);
    p1.position.set(0, len1 / 2, 0);
    mcp.add(p1);
    armorPlates.push(p1);
    this.registerArmorPlate(p1, new THREE.Vector3(0, 0, 1.0));

    // PIP Joint (Proximal Interphalangeal)
    const pip = new THREE.Group();
    pip.position.set(0, len1, 0);
    mcp.add(pip);

    const pipPivot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.28, 10),
      this.materials.joints
    );
    pipPivot.rotation.z = Math.PI / 2;
    pip.add(pipPivot);

    // Intermediate Phalanx
    const p2 = this.createPhalanxMesh(len2, 0.18, 0.15);
    p2.position.set(0, len2 / 2, 0);
    pip.add(p2);
    armorPlates.push(p2);
    this.registerArmorPlate(p2, new THREE.Vector3(0, 0, 0.9));

    // DIP Joint (Distal Interphalangeal)
    const dip = new THREE.Group();
    dip.position.set(0, len2, 0);
    pip.add(dip);

    const dipPivot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.24, 10),
      this.materials.joints
    );
    dipPivot.rotation.z = Math.PI / 2;
    dip.add(dipPivot);

    // Distal Phalanx & Fingertip Sensor
    const p3 = this.createPhalanxMesh(len3, 0.15, 0.1);
    p3.position.set(0, len3 / 2, 0);
    dip.add(p3);
    armorPlates.push(p3);
    this.registerArmorPlate(p3, new THREE.Vector3(0, 0, 0.8));

    // Fingertip Tactile Sensor Pad
    const tipSensorMat = this.materials.tipSensors[sensorIdx];
    const tipGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const tipMesh = new THREE.Mesh(tipGeo, tipSensorMat);
    tipMesh.scale.set(1.1, 0.8, 1.4);
    tipMesh.position.set(0, len3, 0.04);
    dip.add(tipMesh);

    return {
      mcp,
      pip,
      dip,
      tipMesh,
      armorPlates,
      baseRotX: 0
    };
  }

  /**
   * Builds the articulated Thumb with opposable ball-and-socket kinematics
   */
  private createThumb(): FingerJoints {
    const armorPlates: THREE.Mesh[] = [];

    // Thumb Base / MCP Mount
    const mcp = new THREE.Group();
    mcp.position.set(-1.1, 0.85, 0.25);
    mcp.rotation.z = 0.45;
    mcp.rotation.y = -0.35;
    this.palmGroup.add(mcp);

    // Ball socket joint
    const socket = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 12, 12),
      this.materials.joints
    );
    mcp.add(socket);

    // Thumb Metacarpal / Proximal segment
    const len1 = 0.8;
    const p1 = this.createPhalanxMesh(len1, 0.24, 0.2);
    p1.position.set(0, len1 / 2, 0);
    mcp.add(p1);
    armorPlates.push(p1);
    this.registerArmorPlate(p1, new THREE.Vector3(-1.0, 0, 0.8));

    // Thumb IP Joint
    const dip = new THREE.Group();
    dip.position.set(0, len1, 0);
    mcp.add(dip);

    const ipPivot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.3, 10),
      this.materials.joints
    );
    ipPivot.rotation.z = Math.PI / 2;
    dip.add(ipPivot);

    // Distal segment
    const len2 = 0.7;
    const p2 = this.createPhalanxMesh(len2, 0.2, 0.14);
    p2.position.set(0, len2 / 2, 0);
    dip.add(p2);
    armorPlates.push(p2);
    this.registerArmorPlate(p2, new THREE.Vector3(-0.8, 0, 0.7));

    // Thumb tactile sensor tip
    const tipSensorMat = this.materials.tipSensors[0];
    const tipGeo = new THREE.SphereGeometry(0.14, 8, 8);
    const tipMesh = new THREE.Mesh(tipGeo, tipSensorMat);
    tipMesh.scale.set(1.2, 0.9, 1.4);
    tipMesh.position.set(0, len2, 0.05);
    dip.add(tipMesh);

    return {
      mcp,
      dip,
      tipMesh,
      armorPlates,
      baseRotX: 0
    };
  }

  private createPhalanxMesh(length: number, width: number, depth: number): THREE.Mesh {
    const geo = new THREE.BoxGeometry(width, length, depth);
    const mesh = new THREE.Mesh(geo, this.materials.armor);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Add a glowing micro-strip on the dorsal aspect of the phalanx
    const dorsalLight = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.3, length * 0.7, 0.04),
      this.materials.glowingFiber
    );
    dorsalLight.position.set(0, 0, -depth / 2 - 0.015);
    mesh.add(dorsalLight);

    return mesh;
  }

  private registerArmorPlate(mesh: THREE.Mesh, explodeDir: THREE.Vector3) {
    this.allArmorPlates.push({
      mesh,
      originalPos: mesh.position.clone(),
      explodeDir: explodeDir.normalize()
    });
  }

  /**
   * Kinematic Flexion Controller
   * Value: 0% to 100%
   */
  public setFingerFlexion(fingerKey: 'thumb' | 'index' | 'middle' | 'ring' | 'pinky', value: number) {
    this.fingerValues[fingerKey] = value;
    const norm = value / 100;
    const finger = this.fingers[fingerKey];

    if (fingerKey === 'thumb') {
      // Anatomical thumb opposition and flexion
      finger.mcp.rotation.x = -norm * 0.9;
      finger.mcp.rotation.y = -0.35 + norm * 0.65;
      finger.mcp.rotation.z = 0.45 - norm * 0.3;
      finger.dip.rotation.x = -norm * 1.1;
    } else {
      // 3-joint coordinated finger flexion
      const mcpMax = 1.35; // ~77 degrees
      const pipMax = 1.55; // ~89 degrees
      const dipMax = 1.05; // ~60 degrees

      finger.mcp.rotation.x = -norm * mcpMax;
      if (finger.pip) {
        finger.pip.rotation.x = -norm * pipMax;
      }
      finger.dip.rotation.x = -norm * dipMax;
    }

    // Dynamic sensory glow intensity on fingertip based on pressure
    const sensorMat = this.materials.tipSensors[
      fingerKey === 'thumb' ? 0 :
      fingerKey === 'index' ? 1 :
      fingerKey === 'middle' ? 2 :
      fingerKey === 'ring' ? 3 : 4
    ];
    sensorMat.emissiveIntensity = 0.6 + norm * 2.8;

    this.notifyTelemetry();
  }

  public setWristPitch(degrees: number) {
    this.fingerValues.wristPitch = degrees;
    const rad = THREE.MathUtils.degToRad(degrees);
    this.wristPitchGroup.rotation.x = rad;
  }

  public setWristYaw(degrees: number) {
    this.fingerValues.wristYaw = degrees;
    const rad = THREE.MathUtils.degToRad(degrees);
    this.wristYawGroup.rotation.y = rad;
  }

  /**
   * Apply Smooth Kinematic Grip Preset via GSAP
   */
  public applyPreset(preset: GripPreset) {
    let targets: { thumb: number; index: number; middle: number; ring: number; pinky: number; wristPitch?: number; wristYaw?: number };

    switch (preset) {
      case 'fist': // Full power fist
        targets = { thumb: 95, index: 100, middle: 100, ring: 100, pinky: 100, wristPitch: -8, wristYaw: 0 };
        break;
      case 'pinch': // Precision Pinch
        targets = { thumb: 68, index: 72, middle: 20, ring: 10, pinky: 5, wristPitch: 4, wristYaw: 5 };
        break;
      case 'point': // Pointing / Touchscreen
        targets = { thumb: 80, index: 0, middle: 95, ring: 95, pinky: 95, wristPitch: 0, wristYaw: 0 };
        break;
      case 'hook': // Hook / Carrier grip
        targets = { thumb: 15, index: 75, middle: 80, ring: 80, pinky: 75, wristPitch: -12, wristYaw: 0 };
        break;
      case 'peace': // Victory / Cyber V
        targets = { thumb: 85, index: 0, middle: 0, ring: 95, pinky: 95, wristPitch: 5, wristYaw: 0 };
        break;
      case 'neutral': // Relaxed full extension
      default:
        targets = { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0, wristPitch: 0, wristYaw: 0 };
        break;
    }

    // Play servo acoustic sound
    audioEngine.playServoSound(0.85, 450);

    // Tween each finger smoothly with GSAP
    gsap.to(this.fingerValues, {
      thumb: targets.thumb,
      index: targets.index,
      middle: targets.middle,
      ring: targets.ring,
      pinky: targets.pinky,
      wristPitch: targets.wristPitch ?? 0,
      wristYaw: targets.wristYaw ?? 0,
      duration: 0.65,
      ease: 'power2.out',
      onUpdate: () => {
        this.setFingerFlexion('thumb', this.fingerValues.thumb);
        this.setFingerFlexion('index', this.fingerValues.index);
        this.setFingerFlexion('middle', this.fingerValues.middle);
        this.setFingerFlexion('ring', this.fingerValues.ring);
        this.setFingerFlexion('pinky', this.fingerValues.pinky);
        this.setWristPitch(this.fingerValues.wristPitch);
        this.setWristYaw(this.fingerValues.wristYaw);
      },
      onComplete: () => {
        if (preset === 'fist' || preset === 'pinch') {
          audioEngine.playLatchSound();
        }
      }
    });
  }

  /**
   * Explode View (Chassis Inspection)
   */
  public toggleExplode() {
    this.isExploded = !this.isExploded;
    audioEngine.playUIClick(true);

    const dist = this.isExploded ? 0.9 : 0;
    this.allArmorPlates.forEach((item) => {
      const target = item.originalPos.clone().add(item.explodeDir.clone().multiplyScalar(dist));
      gsap.to(item.mesh.position, {
        x: target.x,
        y: target.y,
        z: target.z,
        duration: 0.7,
        ease: 'back.out(1.2)'
      });
    });

    return this.isExploded;
  }

  /**
   * Hologram X-Ray Wireframe Mode
   */
  public toggleWireframe(): boolean {
    this.isWireframe = !this.isWireframe;
    audioEngine.playUIClick(true);

    const mats = [this.materials.armor, this.materials.innerChassis, this.materials.joints];
    mats.forEach((m) => {
      m.wireframe = this.isWireframe;
      if (this.isWireframe) {
        m.transparent = true;
        m.opacity = 0.55;
      } else {
        m.transparent = false;
        m.opacity = 1.0;
      }
    });

    return this.isWireframe;
  }

  /**
   * Switch Chassis Finish Material
   */
  public setChassisFinish(finish: ChassisFinish) {
    audioEngine.playUIClick();
    switch (finish) {
      case 'carbon':
        this.materials.armor.color.setHex(0x111827);
        this.materials.armor.metalness = 0.65;
        this.materials.armor.roughness = 0.35;
        this.materials.glowingFiber.color.setHex(0x00f0ff);
        this.materials.glowingFiber.emissive.setHex(0x00f0ff);
        break;
      case 'titanium':
        this.materials.armor.color.setHex(0xd1d5db);
        this.materials.armor.metalness = 0.95;
        this.materials.armor.roughness = 0.22;
        this.materials.glowingFiber.color.setHex(0x84cc16);
        this.materials.glowingFiber.emissive.setHex(0x84cc16);
        break;
      case 'anodized':
        this.materials.armor.color.setHex(0x581c87);
        this.materials.armor.metalness = 0.88;
        this.materials.armor.roughness = 0.18;
        this.materials.glowingFiber.color.setHex(0xfacc15);
        this.materials.glowingFiber.emissive.setHex(0xfacc15);
        break;
      case 'obsidian':
        this.materials.armor.color.setHex(0x020617);
        this.materials.armor.metalness = 0.4;
        this.materials.armor.roughness = 0.6;
        this.materials.glowingFiber.color.setHex(0xf97316);
        this.materials.glowingFiber.emissive.setHex(0xf97316);
        break;
    }
  }

  /**
   * Camera Angle Presets
   */
  public setCameraView(view: 'front' | 'top' | 'side' | 'iso') {
    audioEngine.playUIClick();
    let target = { radius: 11, phi: Math.PI / 2.3, theta: Math.PI / 3.8 };

    switch (view) {
      case 'front':
        target = { radius: 10.5, phi: Math.PI / 2, theta: Math.PI / 2 };
        break;
      case 'top':
        target = { radius: 11.5, phi: 0.18, theta: Math.PI / 2 };
        break;
      case 'side':
        target = { radius: 11.0, phi: Math.PI / 2, theta: 0 };
        break;
      case 'iso':
      default:
        target = { radius: 11.5, phi: Math.PI / 2.6, theta: Math.PI / 3.4 };
        break;
    }

    gsap.to(this.targetSpherical, {
      radius: target.radius,
      phi: target.phi,
      theta: target.theta,
      duration: 0.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.spherical.radius = this.targetSpherical.radius;
        this.spherical.phi = this.targetSpherical.phi;
        this.spherical.theta = this.targetSpherical.theta;
        this.updateCameraPosition();
      }
    });
  }

  public toggleAutoRotate(): boolean {
    this.isAutoRotating = !this.isAutoRotating;
    audioEngine.playUIClick();
    return this.isAutoRotating;
  }

  public registerTelemetryCallback(cb: (data: { gripAngle: number; totalTorque: number }) => void) {
    this.onTelemetryUpdate = cb;
  }

  private notifyTelemetry() {
    if (!this.onTelemetryUpdate) return;
    const avgFlex =
      (this.fingerValues.thumb +
        this.fingerValues.index +
        this.fingerValues.middle +
        this.fingerValues.ring +
        this.fingerValues.pinky) /
      5;

    // Approximate grip angle in degrees
    const gripAngle = Number((avgFlex * 0.85).toFixed(1));
    // Approximate torque based on flexion & motor stiffness (0 to 12 N·m)
    const totalTorque = Number(((avgFlex / 100) * 11.4).toFixed(1));

    this.onTelemetryUpdate({ gripAngle, totalTorque });
  }

  private updateCameraPosition() {
    this.camera.position.x =
      this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
    this.camera.position.y = this.spherical.radius * Math.cos(this.spherical.phi);
    this.camera.position.z =
      this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);
    this.camera.lookAt(0, 0.4, 0);
  }

  private setupEventListeners() {
    window.addEventListener('resize', () => this.onResize());

    // Mouse drag for smooth orbit
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.spherical.theta -= deltaX * 0.007;
      this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi - deltaY * 0.007));
      this.targetSpherical.theta = this.spherical.theta;
      this.targetSpherical.phi = this.spherical.phi;

      this.updateCameraPosition();
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch orbit for mobile / tablets
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

      this.spherical.theta -= deltaX * 0.007;
      this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi - deltaY * 0.007));
      this.updateCameraPosition();
      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    this.canvas.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Mouse wheel zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.spherical.radius = Math.max(5.5, Math.min(22, this.spherical.radius + e.deltaY * 0.01));
      this.targetSpherical.radius = this.spherical.radius;
      this.updateCameraPosition();
    }, { passive: false });
  }

  private onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    if (this.isAutoRotating && !this.isDragging) {
      this.spherical.theta += 0.008;
      this.targetSpherical.theta = this.spherical.theta;
      this.updateCameraPosition();
    }

    // Subtle breathing pulsation on glowing optical fibers
    const time = performance.now() * 0.003;
    const pulse = 1.6 + Math.sin(time) * 0.6;
    this.materials.glowingFiber.emissiveIntensity = pulse;

    this.renderer.render(this.scene, this.camera);
  };
}
