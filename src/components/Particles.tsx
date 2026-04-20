import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  attribute float age;
  attribute float lifespan;
  varying float vAge;
  void main() {
    vAge = age / lifespan;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (1.0 - vAge) * 10.0;
  }
`;

const fragmentShader = `
  varying float vAge;
  void main() {
    vec3 color1 = vec3(1.0, 0.8, 0.2); // Yellow
    vec3 color2 = vec3(1.0, 0.2, 0.0); // Red
    vec3 finalColor = mix(color1, color2, vAge);
    gl_FragColor = vec4(finalColor, 1.0 - vAge);
  }
`;

// Constant defined outside component — never changes
const PARTICLE_COUNT = 5000;

const Particles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const mouse = useRef(new THREE.Vector2());

  // Pre-allocated temp vectors to avoid per-frame garbage collection
  const tempVec = useRef(new THREE.Vector3());
  const cameraDir = useRef(new THREE.Vector3());

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      temp.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        age: 0,
        lifespan: Math.random() * 2 + 1, // 1 to 3 seconds
      });
    }
    return temp;
  }, []);

  const positions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const ages = useMemo(() => new Float32Array(PARTICLE_COUNT), []);
  const lifespans = useMemo(() => new Float32Array(PARTICLE_COUNT), []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouse.current.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.current.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const { raycaster } = useThree();
  const plane = useMemo(() => new THREE.Plane(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Reuse pre-allocated vectors — no garbage per frame
      state.camera.getWorldDirection(cameraDir.current);
      tempVec.current.copy(state.camera.position).addScaledVector(cameraDir.current, 5);
      plane.setFromNormalAndCoplanarPoint(cameraDir.current, tempVec.current);

      raycaster.setFromCamera(mouse.current, state.camera);
      raycaster.ray.intersectPlane(plane, target);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const particle = particles[i];
        particle.age += delta;

        if (particle.age > particle.lifespan) {
          particle.age = 0;
          particle.position.copy(target);
          const speed = Math.random() * 1 + 0.5;
          particle.velocity.set(
            (Math.random() - 0.5) * 0.5,
            speed,
            (Math.random() - 0.5) * 0.5
          );
        }

        // Reuse tempVec to avoid allocating a new Vector3 per particle per frame
        tempVec.current.copy(particle.velocity).multiplyScalar(delta);
        particle.position.add(tempVec.current);

        const i3 = i * 3;
        positions[i3] = particle.position.x;
        positions[i3 + 1] = particle.position.y;
        positions[i3 + 2] = particle.position.z;

        ages[i] = particle.age;
        lifespans[i] = particle.lifespan;
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.age.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-age"
          count={ages.length}
          array={ages}
          itemSize={1}
          args={[ages, 1]}
        />
        <bufferAttribute
          attach="attributes-lifespan"
          count={lifespans.length}
          array={lifespans}
          itemSize={1}
          args={[lifespans, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        attach="material"
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={false}
      />
    </points>
  );
};

export default Particles;
