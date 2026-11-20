/* eslint-disable react/no-unknown-property */
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useFBX } from '@react-three/drei';
import * as THREE from 'three';
import { scrollStore, getInterpolatedWaypoint } from '../utils/scrollStore';

const MODEL_PATH = '/all/Start%20Walking.fbx';
// Corridor mesh is modeled at ~2.8x architectural scale (ceiling ~13u, step ~0.61u, railing ~2.68u),
// so a ~1.75m adult measures ~4.85 world units; the octagonal vault door sits at Z = -73.67.
const TARGET_HEIGHT = 4.85;
const LEAD_DISTANCE = 10.5;     // Third-person framing keeping full-body ground margin on every waypoint
const MIN_VAULT_Z = -68.5;      // Stops cleanly before the octagonal vault door (Z = -73.67)
const DEFAULT_FLOOR_Y = -2.054; // Exact baked corridor floor Y before first raycast sample
const VIEW_LOOK_DISTANCE = 8.5; // Matches CameraController lookTarget Z offset
const CHARACTER_LANE_OFFSET_X = 1.2;
// Stride calibration: f44..f96 Hips travel is 267.72 raw units / 378.48 bind height over 1.733s => ~1.98 u/s at 4.85u
const UNITS_PER_SEC_AT_1X = 2.02;

const computeTargetZ = (waypointZ: number): number =>
  Math.max(MIN_VAULT_Z, waypointZ - LEAD_DISTANCE);

const computeTargetX = (waypointX: number, lookX: number): number => {
  const viewCenterX = waypointX + (lookX - waypointX) * (LEAD_DISTANCE / VIEW_LOOK_DISTANCE);
  return Math.max(-0.5, Math.min(2.4, viewCenterX + CHARACTER_LANE_OFFSET_X));
};

const stripHorizontalRootMotion = (sourceClip: THREE.AnimationClip): THREE.AnimationClip => {
  const cloned = sourceClip.clone();
  for (const track of cloned.tracks) {
    if (!track.name.includes('Hips') || !track.name.endsWith('.position')) continue;
    const values = track.values;
    if (values.length < 3) continue;
    const startX = values[0];
    const startZ = values[2];
    for (let i = 0; i < values.length; i += 3) {
      // Keep natural vertical hip bounce (Y) and gentle lateral sway, lock forward Z travel
      values[i] = startX + (values[i] - startX) * 0.22;
      values[i + 2] = startZ;
    }
  }
  return cloned;
};

interface AnimRig {
  mixer: THREE.AnimationMixer;
  idleAction: THREE.AnimationAction;
  runAction: THREE.AnimationAction;
}

const RunnerCharacter: React.FC = () => {
  const fbx = useFBX(MODEL_PATH);
  const rootGroupRef = useRef<THREE.Group>(null);
  const rigRef = useRef<AnimRig | null>(null);
  const { scene } = useThree();

  const initialWp = getInterpolatedWaypoint(scrollStore.currentProgress);
  const initialX = computeTargetX(initialWp.x, initialWp.lookX);
  const initialZ = computeTargetZ(initialWp.z);
  const stateRef = useRef({
    x: initialX,
    z: initialZ,
    floorY: DEFAULT_FLOOR_Y,
    runBlend: 0,        // 0 = idle standing, 1 = full stride
    facingYaw: Math.PI, // PI = facing deeper into corridor (-Z), 0 = facing back (+Z)
    rayTimer: 0,
  });

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const rayOrigin = useMemo(() => new THREE.Vector3(), []);
  const downDir = useMemo(() => new THREE.Vector3(0, -1, 0), []);

  // Normalize scale to corridor human proportion and ground feet at local Y = 0
  const { modelScale, footOffsetY } = useMemo(() => {
    fbx.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(fbx);
    const size = new THREE.Vector3();
    box.getSize(size);
    const rawHeight = size.y > 0.001 ? size.y : 378.5;
    const scale = TARGET_HEIGHT / rawHeight;
    const offsetY = -box.min.y * scale;
    return { modelScale: scale, footOffsetY: offsetY };
  }, [fbx]);

  // Prevent SkinnedMesh frustum culling and clean up Mixamo hair/eyelash alpha sorting
  useEffect(() => {
    fbx.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.frustumCulled = false;
        child.castShadow = false;
        child.receiveShadow = false;

        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (const mat of mats) {
          if (!mat) continue;
          if (mat.transparent) {
            mat.alphaTest = 0.35;
            mat.depthWrite = true;
            mat.side = THREE.DoubleSide;
          }
          if ('shininess' in mat && typeof mat.shininess === 'number') {
            mat.shininess = Math.min(mat.shininess, 18);
          }
          mat.needsUpdate = true;
        }
      }
    });
  }, [fbx]);

  // Build synchronized Idle + Run actions from the same Mixamo clip
  useEffect(() => {
    const rawClip = fbx.animations?.find((clip) => clip.duration > 0);
    if (!rawClip) return;

    const inPlace = stripHorizontalRootMotion(rawClip);
    const hasFullTimeline = rawClip.duration > 3.2;

    // Frames 0..10: relaxed standing pose (ping-pong for subtle breathing)
    const idleClip = hasFullTimeline
      ? THREE.AnimationUtils.subclip(inPlace, 'CorridorIdle', 0, 10, 30)
      : inPlace;
    // Frames 44..96: full steady left+right stride loop
    const runClip = hasFullTimeline
      ? THREE.AnimationUtils.subclip(inPlace, 'CorridorRun', 44, 96, 30)
      : inPlace;

    const mixer = new THREE.AnimationMixer(fbx);

    const idleAction = mixer.clipAction(idleClip);
    idleAction.setLoop(THREE.LoopPingPong, Infinity);
    idleAction.timeScale = 0.45;
    idleAction.setEffectiveWeight(1);
    idleAction.play();

    const runAction = mixer.clipAction(runClip);
    runAction.setLoop(THREE.LoopRepeat, Infinity);
    runAction.timeScale = 1.6;
    runAction.setEffectiveWeight(0);
    runAction.play();

    mixer.update(0.016);
    rigRef.current = { mixer, idleAction, runAction };

    return () => {
      idleAction.stop();
      runAction.stop();
      mixer.stopAllAction();
      mixer.uncacheRoot(fbx);
      rigRef.current = null;
    };
  }, [fbx]);

  const sampleFloorY = (x: number, z: number): number | null => {
    const corridor = scene.getObjectByName('simplebake_Baked');
    if (!corridor) return null;
    rayOrigin.set(x, 5.5, z);
    raycaster.set(rayOrigin, downDir);
    raycaster.far = 12;
    const hits = raycaster.intersectObject(corridor, true);
    if (hits.length > 0) {
      const floorHit = hits.find((h) => h.point.y < 2.2);
      if (floorHit) return floorHit.point.y;
    }
    return null;
  };

  useFrame((_, delta) => {
    const group = rootGroupRef.current;
    if (!group) return;

    const dt = Math.min(Math.max(delta, 0.0001), 0.05);
    const s = stateRef.current;

    // Read the exact same waypoint trajectory as CameraController (no mouse parallax wobble)
    const wp = getInterpolatedWaypoint(scrollStore.currentProgress);
    const targetZ = computeTargetZ(wp.z);
    // Keep character framed cleanly in the open right-center corridor lane at LEAD_DISTANCE
    const targetX = computeTargetX(wp.x, wp.lookX);

    const prevZ = s.z;
    const prevX = s.x;

    // Follow waypoint smoothly in lockstep with the GSAP camera glide
    const followAlpha = 1 - Math.exp(-14 * dt);
    s.z += (targetZ - s.z) * followAlpha;
    s.x += (targetX - s.x) * followAlpha;

    // Measure actual world travel speed (units/sec) to drive stride animation 1:1
    const dz = s.z - prevZ;
    const dx = s.x - prevX;
    const speed = Math.hypot(dx, dz) / dt;
    const isMoving = speed > 0.14;

    // Smoothly blend Idle <-> Run based on camera travel velocity
    const targetBlend = isMoving ? Math.min(1, (speed - 0.1) / 1.4) : 0;
    const blendRate = targetBlend > s.runBlend ? 12.0 : 7.5;
    s.runBlend += (targetBlend - s.runBlend) * (1 - Math.exp(-blendRate * dt));
    if (s.runBlend < 0.005 && targetBlend === 0) s.runBlend = 0;

    // Orient toward direction of travel (-Z when advancing, +Z when scrolling back);
    // once stopped at a section, face forward down the corridor (-Z)
    if (Math.abs(dz) > 0.003) {
      s.facingYaw = dz < 0 ? Math.PI : 0;
    } else if (s.runBlend < 0.05) {
      s.facingYaw = Math.PI;
    }

    // Update animation mixer weights & speed in lockstep with floor speed
    const rig = rigRef.current;
    if (rig && !scrollStore.userPausedMotion) {
      rig.idleAction.setEffectiveWeight(1 - s.runBlend);
      rig.runAction.setEffectiveWeight(s.runBlend);
      // Match foot speed to ground speed (clamped for realistic brisk walk/run cadence)
      const strideRate = Math.max(0.9, Math.min(3.2, speed / UNITS_PER_SEC_AT_1X));
      rig.runAction.timeScale = strideRate;
      rig.mixer.update(dt);
    }

    // Snap feet cleanly to the exact corridor floor elevation
    s.rayTimer -= dt;
    if (s.rayTimer <= 0 || isMoving) {
      const hitY = sampleFloorY(s.x, s.z);
      if (hitY !== null) {
        s.floorY = hitY;
      }
      s.rayTimer = 0.15;
    }

    group.position.set(s.x, s.floorY, s.z);

    // Smooth yaw turn
    let yawDiff = s.facingYaw - group.rotation.y;
    while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
    while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
    group.rotation.y += yawDiff * (1 - Math.exp(-10 * dt));
  });

  return (
    <group
      ref={rootGroupRef}
      position={[initialX, DEFAULT_FLOOR_Y, initialZ]}
      rotation={[0, Math.PI, 0]}
    >
      <primitive object={fbx} scale={modelScale} position={[0, footOffsetY, 0]} />
      {/* Subtle rim light attached to the character for crisp separation in dark bays */}
      <pointLight position={[0, 5.1, 2.5]} intensity={20} distance={14} decay={1.8} color="#ffe0b5" />
    </group>
  );
};

export default RunnerCharacter;
