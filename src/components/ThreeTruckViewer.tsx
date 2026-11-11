import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ShieldCheck, Zap, Compass, RotateCcw } from 'lucide-react';

interface ThreeTruckViewerProps {
  activeField?: string | null;
  portalType?: 'client' | 'driver' | 'admin';
}

export default function ThreeTruckViewer({
  activeField,
  portalType = 'client',
}: ThreeTruckViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isHeadlightBoost, setIsHeadlightBoost] = useState(false);

  // Sync headlight boost with active input focus
  useEffect(() => {
    setIsHeadlightBoost(!!activeField);
  }, [activeField]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080e1a, 0.015);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    // Dynamic isometric 3/4 front-quarter angle
    camera.position.set(7.5, 3.2, 7.8);
    camera.lookAt(0, 1.1, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.85);
    scene.add(hemisphereLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.8);
    keyLight.position.set(8, 12, 6);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 30;
      keyLight.shadow.bias = -0.0005;
      const d = 8;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x14b8a6, 2.2);
    rimLight.position.set(-8, 6, -6);
    scene.add(rimLight);

    // Headlights (glowing point lights on the truck)
    const headlightLeft = new THREE.PointLight(0x93c5fd, 3.0, 14);
    const headlightRight = new THREE.PointLight(0x93c5fd, 3.0, 14);
    headlightLeft.position.set(4.2, 0.85, 0.75);
    headlightRight.position.set(4.2, 0.85, -0.75);
    scene.add(headlightLeft);
    scene.add(headlightRight);

    // Materials Library
    const cabPaintMaterial = new THREE.MeshStandardMaterial({
      color: 0x091421, // Obsidian midnight teal
      metalness: 0.65,
      roughness: 0.22,
    });

    const cabAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0x0d9488, // Gallant Teal accent
      metalness: 0.5,
      roughness: 0.3,
    });

    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.95,
      roughness: 0.12,
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.2,
      roughness: 0.05,
      transparent: true,
      opacity: 0.82,
    });

    const tireMaterial = new THREE.MeshStandardMaterial({
      color: 0x171717,
      metalness: 0.08,
      roughness: 0.88,
    });

    const headlightGlassMaterial = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
    });

    const taillightMaterial = new THREE.MeshBasicMaterial({
      color: 0xef4444,
    });

    // Procedural Trailer Livery Texture
    const createTrailerTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 384;
      const ctx = canvas.getContext('2d')!;

      // Background crisp white composite with aerodynamic teal bottom stripe
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1024, 384);

      // Bottom dynamic teal speed swoosh
      ctx.fillStyle = '#0d9488';
      ctx.beginPath();
      ctx.moveTo(0, 310);
      ctx.lineTo(1024, 260);
      ctx.lineTo(1024, 384);
      ctx.lineTo(0, 384);
      ctx.closePath();
      ctx.fill();

      // Thin gold accent divider
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 307);
      ctx.lineTo(1024, 257);
      ctx.stroke();

      // Royal Crest Graphic
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(240, 150, 48, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(240, 150, 42, 0, Math.PI * 2);
      ctx.fill();

      // Brand Typography
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 54px sans-serif';
      ctx.fillText('Gallant line haul corp', 315, 145);

      ctx.fillStyle = '#b45309';
      ctx.font = '600 24px sans-serif';
      ctx.letterSpacing = '6px';
      ctx.fillText('DRIVE  •  DELIVER  •  EXCEL', 320, 190);

      // Fast Certified / Cross-Border Emblem
      ctx.fillStyle = '#0d9488';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('FAST & C-TPAT CERTIFIED  |  REFRIGERATED & DRY VAN', 320, 230);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    };

    const trailerSkinTexture = createTrailerTexture();
    const trailerMaterial = new THREE.MeshStandardMaterial({
      map: trailerSkinTexture,
      roughness: 0.35,
      metalness: 0.05,
    });

    // TRUCK RIG (Root Group)
    const truckGroup = new THREE.Group();
    scene.add(truckGroup);

    // Array to store wheels for continuous rotation
    const rotatingWheels: THREE.Mesh[] = [];

    // Helper: Wheel Assembly (rim + rubber tire)
    const createWheel = (x: number, y: number, z: number, isDual = false) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(x, y, z);

      // Outer Rubber Tire
      const tireGeo = new THREE.CylinderGeometry(0.48, 0.48, isDual ? 0.45 : 0.28, 24);
      tireGeo.rotateX(Math.PI / 2);
      const tireMesh = new THREE.Mesh(tireGeo, tireMaterial);
      tireMesh.castShadow = !isSoftwareGl;
      wheelGroup.add(tireMesh);

      // Chrome Rim
      const rimGeo = new THREE.CylinderGeometry(0.3, 0.3, isDual ? 0.47 : 0.3, 16);
      rimGeo.rotateX(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, chromeMaterial);
      wheelGroup.add(rimMesh);

      // Central Hub Axle Cap
      const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, isDual ? 0.49 : 0.32, 12);
      hubGeo.rotateX(Math.PI / 2);
      const hubMesh = new THREE.Mesh(hubGeo, cabAccentMaterial);
      wheelGroup.add(hubMesh);

      truckGroup.add(wheelGroup);
      rotatingWheels.push(tireMesh, rimMesh, hubMesh);
      return wheelGroup;
    };

    // 1. TRACTOR CABIN
    const tractorGroup = new THREE.Group();
    tractorGroup.position.set(2.2, 0, 0);
    truckGroup.add(tractorGroup);

    // Cab Lower Chassis Frame
    const chassisGeo = new THREE.BoxGeometry(4.2, 0.3, 1.6);
    const chassisMesh = new THREE.Mesh(
      chassisGeo,
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
    );
    chassisMesh.position.set(0, 0.55, 0);
    chassisMesh.castShadow = !isSoftwareGl;
    tractorGroup.add(chassisMesh);

    // Cab Main Engine Hood
    const hoodGeo = new THREE.BoxGeometry(1.6, 1.1, 1.7);
    const hoodMesh = new THREE.Mesh(hoodGeo, cabPaintMaterial);
    hoodMesh.position.set(1.2, 1.25, 0);
    hoodMesh.castShadow = !isSoftwareGl;
    tractorGroup.add(hoodMesh);

    // Front Chrome Grille
    const grilleGeo = new THREE.BoxGeometry(0.12, 0.85, 1.4);
    const grilleMesh = new THREE.Mesh(grilleGeo, chromeMaterial);
    grilleMesh.position.set(2.05, 1.2, 0);
    tractorGroup.add(grilleMesh);

    // Heavy Chrome Bull Bumper
    const bumperGeo = new THREE.BoxGeometry(0.3, 0.45, 1.95);
    const bumperMesh = new THREE.Mesh(bumperGeo, chromeMaterial);
    bumperMesh.position.set(2.05, 0.55, 0);
    bumperMesh.castShadow = !isSoftwareGl;
    tractorGroup.add(bumperMesh);

    // Sleeper Cab Body
    const sleeperGeo = new THREE.BoxGeometry(2.0, 1.85, 1.85);
    const sleeperMesh = new THREE.Mesh(sleeperGeo, cabPaintMaterial);
    sleeperMesh.position.set(-0.4, 1.65, 0);
    sleeperMesh.castShadow = !isSoftwareGl;
    tractorGroup.add(sleeperMesh);

    // High-Roof Aerodynamic Wind Deflector
    const roofCapGeo = new THREE.BoxGeometry(1.8, 0.55, 1.8);
    const roofCapMesh = new THREE.Mesh(roofCapGeo, cabAccentMaterial);
    roofCapMesh.position.set(-0.4, 2.75, 0);
    tractorGroup.add(roofCapMesh);

    // Windshield (Curved appearance via angled glass block)
    const windshieldGeo = new THREE.BoxGeometry(0.2, 0.75, 1.65);
    const windshieldMesh = new THREE.Mesh(windshieldGeo, glassMaterial);
    windshieldMesh.position.set(0.48, 2.05, 0);
    windshieldMesh.rotation.z = -0.32;
    tractorGroup.add(windshieldMesh);

    // Side Cab Windows
    const sideWindowGeo = new THREE.BoxGeometry(0.7, 0.5, 0.05);
    const leftWindow = new THREE.Mesh(sideWindowGeo, glassMaterial);
    leftWindow.position.set(0.1, 2.0, 0.93);
    const rightWindow = new THREE.Mesh(sideWindowGeo, glassMaterial);
    rightWindow.position.set(0.1, 2.0, -0.93);
    tractorGroup.add(leftWindow, rightWindow);

    // Dual Chrome Exhaust Stacks
    const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.8, 16);
    const leftExhaust = new THREE.Mesh(exhaustGeo, chromeMaterial);
    leftExhaust.position.set(-1.45, 2.4, 0.8);
    const rightExhaust = new THREE.Mesh(exhaustGeo, chromeMaterial);
    rightExhaust.position.set(-1.45, 2.4, -0.8);
    tractorGroup.add(leftExhaust, rightExhaust);

    // Dual Cylindrical Fuel Tanks
    const tankGeo = new THREE.CylinderGeometry(0.32, 0.32, 1.4, 16);
    tankGeo.rotateZ(Math.PI / 2);
    const leftTank = new THREE.Mesh(tankGeo, chromeMaterial);
    leftTank.position.set(0.3, 0.55, 0.95);
    const rightTank = new THREE.Mesh(tankGeo, chromeMaterial);
    rightTank.position.set(0.3, 0.55, -0.95);
    tractorGroup.add(leftTank, rightTank);

    // Front Headlight Blocks (LED Projectors)
    const headlampGeo = new THREE.BoxGeometry(0.1, 0.22, 0.32);
    const leftHeadlamp = new THREE.Mesh(headlampGeo, headlightGlassMaterial);
    leftHeadlamp.position.set(2.02, 0.85, 0.75);
    const rightHeadlamp = new THREE.Mesh(headlampGeo, headlightGlassMaterial);
    rightHeadlamp.position.set(2.02, 0.85, -0.75);
    tractorGroup.add(leftHeadlamp, rightHeadlamp);

    // Headlight Beams (Volumetric cones)
    const coneGeo = new THREE.ConeGeometry(0.85, 6, 16, 1, true);
    coneGeo.rotateZ(-Math.PI / 2);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const leftBeam = new THREE.Mesh(coneGeo, beamMaterial);
    leftBeam.position.set(5.1, 0.85, 0.75);
    const rightBeam = new THREE.Mesh(coneGeo, beamMaterial);
    rightBeam.position.set(5.1, 0.85, -0.75);
    tractorGroup.add(leftBeam, rightBeam);

    // 2. 53' TRAILER ASSEMBLY
    const trailerGroup = new THREE.Group();
    trailerGroup.position.set(-2.6, 0, 0);
    truckGroup.add(trailerGroup);

    // Trailer Box
    const trailerBoxGeo = new THREE.BoxGeometry(6.6, 2.6, 1.95);
    const trailerMesh = new THREE.Mesh(trailerBoxGeo, trailerMaterial);
    trailerMesh.position.set(0, 2.05, 0);
    trailerMesh.castShadow = !isSoftwareGl;
    trailerGroup.add(trailerMesh);

    // Trailer Rear Doors Frame & Taillights
    const rearBumperGeo = new THREE.BoxGeometry(0.2, 0.35, 1.95);
    const rearBumper = new THREE.Mesh(rearBumperGeo, chromeMaterial);
    rearBumper.position.set(-3.35, 0.65, 0);
    trailerGroup.add(rearBumper);

    // Rear Taillights (Red LED)
    const taillightGeo = new THREE.BoxGeometry(0.08, 0.15, 0.3);
    const leftTaillight = new THREE.Mesh(taillightGeo, taillightMaterial);
    leftTaillight.position.set(-3.38, 0.7, 0.75);
    const rightTaillight = new THREE.Mesh(taillightGeo, taillightMaterial);
    rightTaillight.position.set(-3.38, 0.7, -0.75);
    trailerGroup.add(leftTaillight, rightTaillight);

    // Trailer Landing Gear (support legs)
    const landingLegGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8);
    const leftLeg = new THREE.Mesh(landingLegGeo, chromeMaterial);
    leftLeg.position.set(1.5, 0.5, 0.75);
    const rightLeg = new THREE.Mesh(landingLegGeo, chromeMaterial);
    rightLeg.position.set(1.5, 0.5, -0.75);
    trailerGroup.add(leftLeg, rightLeg);

    // 3. WHEELS (10 Axle Assemblies)
    // Tractor Steer Axle (Front)
    createWheel(3.4, 0.48, 0.85);
    createWheel(3.4, 0.48, -0.85);

    // Tractor Drive Tandems (Rear)
    createWheel(1.8, 0.48, 0.85, true);
    createWheel(1.8, 0.48, -0.85, true);
    createWheel(0.6, 0.48, 0.85, true);
    createWheel(0.6, 0.48, -0.85, true);

    // Trailer Tandem Axles (Rear)
    createWheel(-4.2, 0.48, 0.9, true);
    createWheel(-4.2, 0.48, -0.9, true);
    createWheel(-5.4, 0.48, 0.9, true);
    createWheel(-5.4, 0.48, -0.9, true);

    // 4. HIGHWAY ASPHALT & MOVING ROAD DASHES
    const roadGroup = new THREE.Group();
    scene.add(roadGroup);

    // Dark Highway Surface
    const roadGeo = new THREE.PlaneGeometry(32, 6);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.92,
      metalness: 0.05,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.position.set(0, -0.02, 0);
    roadMesh.receiveShadow = !isSoftwareGl;
    roadGroup.add(roadMesh);

    // Soft Radial Ground Contact Shadow beneath truck
    const shadowGeo = new THREE.PlaneGeometry(12, 3.2);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.65,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(-0.5, 0.01, 0);
    scene.add(shadowMesh);

    // Animated Lane Dividers (moving dashes along highway)
    const dashCount = 14;
    const dashes: THREE.Mesh[] = [];
    const dashGeo = new THREE.PlaneGeometry(1.2, 0.15);
    dashGeo.rotateX(-Math.PI / 2);
    const dashMat = new THREE.MeshBasicMaterial({
      color: 0x14b8a6, // Glowing teal lane marking
      transparent: true,
      opacity: 0.75,
    });

    for (let i = 0; i < dashCount; i++) {
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.position.set(-14 + i * 2.4, 0.02, 1.8);
      roadGroup.add(dash);
      dashes.push(dash);
    }

    // Interactive Mouse Tilt & Parallax
    let targetRotY = 0.15;
    let targetRotX = 0;
    let currentRotY = 0.15;
    let currentRotX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetRotY = 0.15 + normX * 0.35;
      targetRotX = normY * 0.15;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Render & Animation Loop
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const speed = isRotating ? 8 : 0;

      // Rotate all wheels smoothly
      for (const wheel of rotatingWheels) {
        wheel.rotation.z -= speed * delta * 1.5;
      }

      // Move road dashes towards the rear to simulate high-speed hauling
      for (const dash of dashes) {
        dash.position.x -= speed * delta * 2.2;
        if (dash.position.x < -14) {
          dash.position.x += dashCount * 2.4;
        }
      }

      // Smooth camera/truck tilt interpolation
      currentRotY = THREE.MathUtils.damp(currentRotY, targetRotY, 5, delta);
      currentRotX = THREE.MathUtils.damp(currentRotX, targetRotX, 5, delta);
      truckGroup.rotation.y = currentRotY;
      truckGroup.rotation.x = currentRotX;

      // Subtle suspension vibration / float
      const elapsed = clock.getElapsedTime();
      truckGroup.position.y = Math.sin(elapsed * 6) * 0.015;

      // Headlight boost effect when activeField is set
      const targetIntensity = isHeadlightBoost ? 6.5 : 3.0;
      headlightLeft.intensity = THREE.MathUtils.damp(
        headlightLeft.intensity,
        targetIntensity,
        8,
        delta
      );
      headlightRight.intensity = headlightLeft.intensity;
      beamMaterial.opacity = isHeadlightBoost ? 0.35 : 0.18;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      trailerSkinTexture.dispose();
    };
  }, [isRotating, isHeadlightBoost]);

  return (
    <div className="relative w-full h-[540px] rounded-3xl overflow-hidden bg-radial from-slate-900/90 via-slate-950 to-slate-950 border border-slate-800/80 shadow-2xl flex flex-col justify-between p-6">
      {/* Top Spec Badges */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg text-xs font-semibold text-slate-200">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>FAST / C-TPAT Fleet #GL-408</span>
        </div>

        <button
          onClick={() => setIsRotating((prev) => !prev)}
          className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors shadow-lg cursor-pointer"
          title={isRotating ? 'Pause Road Motion' : 'Resume Road Motion'}
        >
          <RotateCcw className={`w-4 h-4 ${isRotating ? 'text-teal-400' : 'text-slate-500'}`} />
        </button>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        title="Interactive 3D Semi-Truck: Move mouse to tilt & inspect"
      />

      {/* Bottom Live Telemetry Overlay */}
      <div className="z-10 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-950/80 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>Class 8 Freightliner Cascadia</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono">
                LIVE 3D
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              53ft High-Cube Multi-Temp Reefer • Real-Time GPS Active
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-right">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Engine Telemetry</div>
            <div className="font-mono text-teal-400 font-bold">505 HP / 1,850 lb-ft</div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Headlight Radar</div>
            <div className="font-mono text-emerald-400 font-bold">
              {activeField ? 'ACTIVE BEAM' : 'STANDBY'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
