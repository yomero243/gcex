/* eslint-disable react/no-unknown-property */
import React, { Suspense, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { scrollStore, getInterpolatedWaypoint } from '../utils/scrollStore';
import Particles from './Particles';
import RunnerCharacter from './RunnerCharacter';

const EnvironmentModel: React.FC = () => {
  const { scene } = useGLTF('/variosuvs3-opt.glb');
  const { gl } = useThree();

  useEffect(() => {
    let maxAnisotropy = 1;
    try {
      maxAnisotropy = Math.min(gl?.capabilities?.getMaxAnisotropy?.() ?? 1, 8);
    } catch {
      maxAnisotropy = 1;
    }

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Cycles lighting & shadows are already baked into the combined texture —
        // disabling real-time self-shadowing avoids frustum cutoff triangles and shadow acne.
        child.castShadow = false;
        child.receiveShadow = false;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const rawMat of materials) {
          if (!rawMat || !(rawMat instanceof THREE.MeshStandardMaterial)) continue;

          rawMat.envMapIntensity = 0.45;
          rawMat.dithering = true;
          if (rawMat.normalScale) {
            rawMat.normalScale.set(0.65, 0.65);
          }

          const textures = [
            rawMat.map,
            rawMat.normalMap,
            rawMat.roughnessMap,
            rawMat.metalnessMap,
            rawMat.aoMap,
          ];
          for (const tex of textures) {
            if (tex) {
              tex.anisotropy = maxAnisotropy;
              tex.needsUpdate = true;
            }
          }
          rawMat.needsUpdate = true;
        }
      }
    });
  }, [scene, gl]);

  return <primitive object={scene} scale={1} position={[-1.5, 1, 0]} rotation={[0, 0, 0]} />;
};

useGLTF.preload('/variosuvs3-opt.glb');

// Procedural IBL lightformers (zero external HDR fetch)
const ProceduralIBL: React.FC = () => {
  return (
    <Environment resolution={256} frames={1}>
      {/* Overhead cool architectural strip */}
      <Lightformer
        form="rect"
        intensity={1.6}
        color="#8da8f8"
        position={[0, 10, -18]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[6, 40, 1]}
      />
      {/* Warm tungsten bounce accent */}
      <Lightformer
        form="rect"
        intensity={2.2}
        color="#f5b971"
        position={[8, 4, -8]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[14, 3, 1]}
      />
      {/* Deep indigo rim light */}
      <Lightformer
        form="rect"
        intensity={1.2}
        color="#6366f1"
        position={[-8, 3, -24]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[18, 2.5, 1]}
      />
    </Environment>
  );
};

interface CorridorBayLight {
  position: [number, number, number];
  maxIntensity: number;
  distance: number;
  color: string;
  triggerAt: number; // scroll progress (0..5) where this bay's motion sensor switches ON
}

// Motion-sensor corridor bay lights: each bay starts OFF in the dark ahead and clicks ON
// sequentially as the camera advances through the hallway (and turns OFF when retreating).
const CORRIDOR_BAYS: CorridorBayLight[] = [
  { position: [1.4, 4.9, -1.5], maxIntensity: 28, distance: 20, color: '#f5a962', triggerAt: -1.0 },
  { position: [-0.6, 4.7, -10.5], maxIntensity: 68, distance: 24, color: '#ffcb91', triggerAt: 0.45 },
  { position: [1.0, 5.0, -22.5], maxIntensity: 82, distance: 28, color: '#dbeafe', triggerAt: 1.4 },
  { position: [-0.5, 4.9, -35.0], maxIntensity: 88, distance: 28, color: '#ffc88a', triggerAt: 2.35 },
  { position: [0.8, 4.8, -47.0], maxIntensity: 92, distance: 30, color: '#bae6fd', triggerAt: 3.35 },
  { position: [-0.3, 4.6, -55.0], maxIntensity: 96, distance: 30, color: '#ffd29d', triggerAt: 4.25 },
  { position: [0.4, 4.3, -60.5], maxIntensity: 112, distance: 34, color: '#ffe3bd', triggerAt: 4.55 },
];

const LightsComponent: React.FC = () => {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const bayRefs = useRef<(THREE.PointLight | null)[]>([]);
  // Track discrete ON/OFF latch with hysteresis per bay + smoothly damped current brightness
  const bayStateRef = useRef<boolean[]>(CORRIDOR_BAYS.map((_, idx) => idx === 0));
  const bayLevelsRef = useRef<number[]>(CORRIDOR_BAYS.map((_, idx) => (idx === 0 ? 1 : 0)));
  const simTimeRef = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(Math.max(delta, 0.0001), 0.05);
    if (!scrollStore.motionPaused) {
      simTimeRef.current += dt;
    }
    const t = simTimeRef.current;
    const p = scrollStore.currentProgress;

    // Sequentially latch each corridor bay light ON as you pass its motion sensor
    let activeSum = 0;
    const latched = bayStateRef.current;
    const levels = bayLevelsRef.current;

    for (let i = 0; i < CORRIDOR_BAYS.length; i++) {
      const bay = CORRIDOR_BAYS[i];
      if (i === 0) {
        latched[i] = true;
      } else if (!latched[i] && p >= bay.triggerAt) {
        latched[i] = true;
      } else if (latched[i] && p < bay.triggerAt - 0.12) {
        latched[i] = false;
      }

      const targetLevel = latched[i] ? 1 : 0;
      // Snappy ~200ms relay switch-on, slightly gentler fade-out when backing away
      const lambda = targetLevel > levels[i] ? 13.0 : 7.0;
      levels[i] += (targetLevel - levels[i]) * (1 - Math.exp(-lambda * dt));
      if (Math.abs(targetLevel - levels[i]) < 0.001) {
        levels[i] = targetLevel;
      }
      activeSum += levels[i];

      const light = bayRefs.current[i];
      if (light) {
        const subtleBreath =
          !scrollStore.motionPaused && levels[i] > 0.9
            ? Math.sin(t * (1.1 + i * 0.17) + i) * 1.6
            : 0;
        light.intensity = Math.max(0, bay.maxIntensity * levels[i] + subtleBreath);
      }
    }

    // Bounced global light & fog clarity rise naturally with how many bays are switched ON
    const litRatio = Math.max(0, Math.min(1, (activeSum - 1) / (CORRIDOR_BAYS.length - 1)));

    if (ambientRef.current) {
      ambientRef.current.intensity = 0.14 + litRatio * 0.44;
    }
    if (hemiRef.current) {
      hemiRef.current.intensity = 0.2 + litRatio * 0.52;
    }
    if (keyLightRef.current) {
      const pulse = scrollStore.motionPaused ? 0 : Math.sin(t * 0.7) * 0.06;
      keyLightRef.current.intensity = 0.5 + litRatio * 0.8 + pulse;
    }

    if (state.scene?.fog instanceof THREE.FogExp2) {
      state.scene.fog.density = 0.025 - litRatio * 0.0135;
    }
    if (state.gl && 'toneMappingExposure' in state.gl) {
      state.gl.toneMappingExposure = 1.0 + litRatio * 0.3;
    }
  });

  return (
    <group>
      {/* Moody low ambient at entrance; rises as more corridor bays switch ON */}
      <ambientLight ref={ambientRef} intensity={0.14} color="#d8e2f0" />
      <hemisphereLight ref={hemiRef} args={['#b8c7ff', '#261a12', 0.2]} />

      {/* Entrance key light (no shadow map — lighting is baked in Cycles) */}
      <directionalLight
        ref={keyLightRef}
        position={[4, 9, 6]}
        intensity={0.5}
        color="#ffd8a8"
      />

      {/* Motion-sensor corridor bay lights that switch ON sequentially as the camera advances */}
      {CORRIDOR_BAYS.map((bay, idx) => (
        <pointLight
          key={bay.position[2]}
          ref={(el) => {
            bayRefs.current[idx] = el;
          }}
          position={bay.position}
          intensity={idx === 0 ? bay.maxIntensity : 0}
          distance={bay.distance}
          decay={1.7}
          color={bay.color}
        />
      ))}
    </group>
  );
};

const Lights = React.memo(LightsComponent);
Lights.displayName = 'Lights';

const CameraControllerComponent: React.FC = () => {
  const stateRef = useRef({
    mouseX: 0,
    mouseY: 0,
    movementFactor: 0,
    lastProgress: scrollStore.currentProgress,
    swayPhase: 0,
  });

  const mousePosRef = useRef({ x: 0, y: 0 });
  const lookTargetRef = useRef(new THREE.Vector3());

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      stateRef.current.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      stateRef.current.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  useFrame((state, delta) => {
    const { camera } = state;
    const p = scrollStore.currentProgress;
    const paused = scrollStore.motionPaused;

    const clampedDelta = Math.min(Math.max(delta, 0.0001), 0.05);

    // Continuous velocity in sections/second (frame-rate independent, no binary threshold jitter)
    const velocity = Math.abs(p - stateRef.current.lastProgress) / clampedDelta;
    stateRef.current.lastProgress = p;

    const targetFactor = paused ? 0.0 : Math.min(1.0, velocity / 0.9);
    const mfAlpha = 1 - Math.exp(-5.0 * clampedDelta);
    stateRef.current.movementFactor += (targetFactor - stateRef.current.movementFactor) * mfAlpha;

    const waypoint = getInterpolatedWaypoint(p);

    // Subtle organic gimbal sway via continuous phase integration (prevents FM-chirp vibration)
    let swayX = 0;
    let swayY = 0;
    if (!paused) {
      const mf = stateRef.current.movementFactor;
      const speed = 0.95 * (1 - mf) + 2.35 * mf;
      stateRef.current.swayPhase = (stateRef.current.swayPhase + speed * clampedDelta) % (Math.PI * 200);
      const phase = stateRef.current.swayPhase;
      const ampX = 0.032 * (1 - mf) + 0.055 * mf;
      const ampY = 0.02 * (1 - mf) + 0.035 * mf;
      swayX = Math.sin(phase) * ampX;
      swayY = Math.cos(phase * 2) * ampY;
    }

    // Frame-rate-independent damped mouse parallax
    const targetMx = paused ? 0 : stateRef.current.mouseX;
    const targetMy = paused ? 0 : stateRef.current.mouseY;
    const mouseAlpha = 1 - Math.exp(-3.6 * clampedDelta);
    mousePosRef.current.x += (targetMx - mousePosRef.current.x) * mouseAlpha;
    mousePosRef.current.y += (targetMy - mousePosRef.current.y) * mouseAlpha;

    const parallaxX = mousePosRef.current.x * 0.42;
    const parallaxY = mousePosRef.current.y * 0.22;

    camera.position.set(
      waypoint.x + swayX + parallaxX,
      waypoint.y + swayY + parallaxY,
      waypoint.z
    );

    lookTargetRef.current.set(
      waypoint.lookX + parallaxX * 0.35,
      waypoint.lookY + parallaxY * 0.35,
      waypoint.z - 8.5
    );
    camera.lookAt(lookTargetRef.current);
    // Sync matrixWorld immediately so cursor fire raycasting reads the current frame's camera
    camera.updateMatrixWorld();

    // Expose live corridor Z depth for the architectural HUD telemetry without React rerenders
    scrollStore.cameraZ = camera.position.z;
  });

  return null;
};

const CameraController = React.memo(CameraControllerComponent);
CameraController.displayName = 'CameraController';

const Scene: React.FC = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0.35, 2.35, 2]} fov={60} near={0.1} far={180} />
      <Suspense fallback={null}>
        <ProceduralIBL />
      </Suspense>
      <Lights />
      <Suspense fallback={null}>
        <EnvironmentModel />
      </Suspense>
      <Suspense fallback={null}>
        <RunnerCharacter />
      </Suspense>
      <CameraController />
      <Particles />
    </>
  );
};

export default Scene;
