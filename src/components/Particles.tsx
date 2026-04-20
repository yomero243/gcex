import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 4000;

const Particles: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const mouse = useRef(new THREE.Vector2());
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  
  // State for particles logic
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      temp.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        age: 0,
        lifespan: Math.random() * 2 + 1,
      });
    }
    return temp;
  }, []);

  useEffect(() => {
    const handleMove = (x: number, y: number) => {
      mouse.current.x = (x / window.innerWidth) * 2 - 1;
      mouse.current.y = -(y / window.innerHeight) * 2 + 1;
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', handleTouchMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };

    function handleTouchMove(e: TouchEvent) {
        if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, []);

  const { raycaster } = useThree();
  const plane = useMemo(() => new THREE.Plane(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const cameraDir = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    state.camera.getWorldDirection(cameraDir);
    plane.setFromNormalAndCoplanarPoint(cameraDir, new THREE.Vector3().copy(state.camera.position).addScaledVector(cameraDir, 5));
    raycaster.setFromCamera(mouse.current, state.camera);
    raycaster.ray.intersectPlane(plane, target);

    particles.forEach((particle, i) => {
      particle.age += delta;

      if (particle.age > particle.lifespan) {
        particle.age = 0;
        particle.position.copy(target);
        particle.velocity.set(
          (Math.random() - 0.5) * 0.5,
          Math.random() * 1 + 0.5,
          (Math.random() - 0.5) * 0.5
        );
      }

      particle.position.addScaledVector(particle.velocity, delta);

      // Update instance matrix
      const scale = (1.0 - particle.age / particle.lifespan) * 0.05; // Base scale 0.05 world units
      tempObject.position.copy(particle.position);
      tempObject.scale.setScalar(scale);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);

      // Update instance color
      const t = particle.age / particle.lifespan;
      // Interpolate between Yellow and Red
      tempColor.setRGB(1.0, 0.8 - t * 0.6, 0.2 - t * 0.2);
      meshRef.current.setColorAt(i, tempColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]} frustumCulled={false}>
      <circleGeometry args={[1, 8]} />
      <meshBasicMaterial transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
};

export default Particles;
