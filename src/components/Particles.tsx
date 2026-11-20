/* eslint-disable react/no-unknown-property */
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollStore } from '../utils/scrollStore';

// ===== 1. INTERACTIVE MOUSE FIRE PARTICLES =====

const FIRE_PARTICLE_COUNT = 2600;

const fireVertexShader = /* glsl */ `
  uniform float uPixelRatio;

  attribute float age;
  attribute float lifespan;
  attribute float aSize;

  varying float vAge;

  void main() {
    vAge = clamp(age / max(lifespan, 0.001), 0.0, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // Taper smoothly as sparks rise and burn out
    float sizeCurve = (1.0 - vAge) * (0.45 + 0.55 * smoothstep(0.0, 0.12, vAge));
    gl_PointSize = clamp(sizeCurve * aSize * uPixelRatio, 1.0, 26.0);
  }
`;

const fireFragmentShader = /* glsl */ `
  varying float vAge;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Hot incandescent core fading softly to radial ember glow
    float radial = smoothstep(0.5, 0.0, dist);
    float core = pow(radial, 1.6);

    vec3 hotCore = vec3(1.0, 0.94, 0.55);   // Bright yellow-white core
    vec3 midFlame = vec3(1.0, 0.58, 0.10);  // Warm fiery orange
    vec3 deepEmber = vec3(0.95, 0.14, 0.0); // Crimson ember

    vec3 flameColor = vAge < 0.35
      ? mix(hotCore, midFlame, vAge / 0.35)
      : mix(midFlame, deepEmber, (vAge - 0.35) / 0.65);

    float alpha = (1.0 - vAge) * core * 0.46;
    gl_FragColor = vec4(flameColor, alpha);
  }
`;

interface FireParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  age: number;
  lifespan: number;
}

const MouseFireParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const hasInitializedTarget = useRef(false);

  // Pre-allocated temp vectors to avoid per-frame GC pressure
  const tempVec = useRef(new THREE.Vector3());
  const cameraDir = useRef(new THREE.Vector3());
  const plane = useRef(new THREE.Plane());
  const target = useRef(new THREE.Vector3());
  const prevTarget = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());

  const { gl } = useThree();

  const { particles, positions, ages, lifespans, sizes } = useMemo(() => {
    const list: FireParticle[] = [];
    const pos = new Float32Array(FIRE_PARTICLE_COUNT * 3);
    const ag = new Float32Array(FIRE_PARTICLE_COUNT);
    const life = new Float32Array(FIRE_PARTICLE_COUNT);
    const sz = new Float32Array(FIRE_PARTICLE_COUNT);

    for (let i = 0; i < FIRE_PARTICLE_COUNT; i++) {
      const lifespan = Math.random() * 1.6 + 0.7; // 0.7s to 2.3s
      const initialAge = Math.random() * lifespan; // Staggered for continuous flame stream
      list.push({
        position: new THREE.Vector3(0, -1000, 0), // Hidden until first spawn at cursor
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.55,
          Math.random() * 1.15 + 0.55,
          (Math.random() - 0.5) * 0.55
        ),
        age: initialAge,
        lifespan,
      });

      const i3 = i * 3;
      pos[i3] = 0;
      pos[i3 + 1] = -1000;
      pos[i3 + 2] = 0;

      ag[i] = initialAge;
      life[i] = lifespan;
      sz[i] = 9.0 + Math.random() * 9.0;
    }

    return { particles: list, positions: pos, ages: ag, lifespans: life, sizes: sz };
  }, []);

  const uniforms = useMemo(
    () => ({
      uPixelRatio: { value: Math.min(gl?.getPixelRatio?.() ?? 1, 2) },
    }),
    [gl]
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const dt = Math.min(delta, 0.05);

    // Project pointer onto a plane 5 units in front of the active camera
    state.camera.getWorldDirection(cameraDir.current);
    tempVec.current.copy(state.camera.position).addScaledVector(cameraDir.current, 5);
    plane.current.setFromNormalAndCoplanarPoint(cameraDir.current, tempVec.current);

    raycaster.current.setFromCamera(mouseRef.current, state.camera);
    const hit = raycaster.current.ray.intersectPlane(plane.current, target.current);
    if (!hit) return;

    if (!hasInitializedTarget.current) {
      prevTarget.current.copy(target.current);
      hasInitializedTarget.current = true;
    }

    const posAttr = points.geometry.attributes.position as THREE.BufferAttribute;
    const ageAttr = points.geometry.attributes.age as THREE.BufferAttribute;

    for (let i = 0; i < FIRE_PARTICLE_COUNT; i++) {
      const particle = particles[i];
      particle.age += dt;

      if (particle.age >= particle.lifespan) {
        particle.age = particle.age % particle.lifespan;
        // Interpolate between previous and current cursor position for silky fast sweeps
        const t = Math.random();
        particle.position.lerpVectors(prevTarget.current, target.current, t);
        // Organic emitter spread so the flame core glows smoothly without white clipping
        particle.position.x += (Math.random() - 0.5) * 0.11;
        particle.position.y += (Math.random() - 0.5) * 0.07;
        particle.position.z += (Math.random() - 0.5) * 0.11;

        const riseSpeed = Math.random() * 1.15 + 0.55;
        particle.velocity.set(
          (Math.random() - 0.5) * 0.55,
          riseSpeed,
          (Math.random() - 0.5) * 0.55
        );
      }

      // Gentle upward buoyancy + subtle flame flicker
      const flicker = Math.sin(particle.age * 6.5 + i * 0.37) * 0.14;
      particle.position.x += (particle.velocity.x + flicker) * dt;
      particle.position.y += particle.velocity.y * dt;
      particle.position.z += particle.velocity.z * dt;

      const i3 = i * 3;
      positions[i3] = particle.position.x;
      positions[i3 + 1] = particle.position.y;
      positions[i3 + 2] = particle.position.z;
      ages[i] = particle.age;
    }

    prevTarget.current.copy(target.current);
    posAttr.needsUpdate = true;
    ageAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false} renderOrder={10}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-age" args={[ages, 1]} />
        <bufferAttribute attach="attributes-lifespan" args={[lifespans, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={fireVertexShader}
        fragmentShader={fireFragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={false}
      />
    </points>
  );
};

// ===== 2. AMBIENT CORRIDOR DUST PARTICLES =====

const DUST_COUNT = 700;

const dustVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;

  attribute float aScale;
  attribute float aPhase;
  attribute float aTint;

  varying float vAlpha;
  varying float vTint;

  void main() {
    vec3 pos = position;

    float drift = uTime * 0.18 + aPhase;
    pos.x += sin(drift * 0.9 + pos.z * 0.12) * 0.32;
    pos.y += cos(drift * 0.7 + pos.x * 0.2) * 0.24;
    pos.z += sin(drift * 0.5 + pos.y * 0.25) * 0.22;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float depth = max(1.5, -mvPosition.z);
    gl_PointSize = clamp(aScale * uPixelRatio * (120.0 / depth), 1.5, 18.0);

    float nearFade = smoothstep(1.2, 4.5, depth);
    float farFade = 1.0 - smoothstep(22.0, 56.0, depth);
    float twinkle = 0.65 + 0.35 * sin(uTime * 1.1 + aPhase * 2.0);

    vAlpha = nearFade * farFade * twinkle * 0.55;
    vTint = aTint;
  }
`;

const dustFragmentShader = /* glsl */ `
  varying float vAlpha;
  varying float vTint;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;

    float strength = smoothstep(0.5, 0.04, dist);
    strength = pow(strength, 1.8);

    vec3 warmAmber = vec3(0.95, 0.72, 0.42);
    vec3 coolIce = vec3(0.56, 0.78, 0.98);
    vec3 color = mix(warmAmber, coolIce, vTint);

    gl_FragColor = vec4(color, strength * vAlpha);
  }
`;

const AmbientDustParticles: React.FC = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const simTimeRef = useRef(0);
  const { gl } = useThree();

  const { positions, scales, phases, tints } = useMemo(() => {
    const pos = new Float32Array(DUST_COUNT * 3);
    const scl = new Float32Array(DUST_COUNT);
    const phs = new Float32Array(DUST_COUNT);
    const tnt = new Float32Array(DUST_COUNT);

    let seed = 421337;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    for (let i = 0; i < DUST_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (rand() - 0.44) * 16;
      pos[i3 + 1] = rand() * 9.5 - 0.5;
      pos[i3 + 2] = 4 - rand() * 72;

      scl[i] = 0.45 + rand() * 1.35;
      phs[i] = rand() * Math.PI * 2;
      tnt[i] = rand() > 0.35 ? 0.0 : 1.0;
    }

    return { positions: pos, scales: scl, phases: phs, tints: tnt };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(gl?.getPixelRatio?.() ?? 1, 2) },
    }),
    [gl]
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    if (!scrollStore.motionPaused) {
      simTimeRef.current += Math.min(delta, 0.05);
    }
    materialRef.current.uniforms.uTime.value = simTimeRef.current;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aTint" args={[tints, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={dustVertexShader}
        fragmentShader={dustFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// ===== EXPORTED COMBINED PARTICLE SYSTEM =====

const Particles: React.FC = () => {
  return (
    <group>
      <AmbientDustParticles />
      <MouseFireParticles />
    </group>
  );
};

export default Particles;
