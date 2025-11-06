import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mouseState } from '../utils/mouseState';

interface ParticlesData {
  positions: Float32Array;
  velocities: Float32Array;
  lifetimes: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  count: number;
}

const Particles: React.FC = React.memo(() => {
  const particlesRef = useRef<THREE.Points>(null);
  const { viewport, camera } = useThree();

  const particlesData = useRef<ParticlesData>({
    positions: new Float32Array(100 * 3),
    velocities: new Float32Array(100 * 3),
    lifetimes: new Float32Array(100),
    colors: new Float32Array(100 * 3),
    sizes: new Float32Array(100),
    count: 100,
  });

  useEffect(() => {
    for (let i = 0; i < particlesData.current.count; i++) {
      const i3 = i * 3;
      // Inicializar partículas en posiciones aleatorias
      particlesData.current.positions[i3] = (Math.random() - 0.5) * viewport.width;
      particlesData.current.positions[i3 + 1] = (Math.random() - 0.5) * viewport.height;
      particlesData.current.positions[i3 + 2] = (Math.random() - 0.5) * 5;

      particlesData.current.velocities[i3] = (Math.random() - 0.5) * 0.01;
      particlesData.current.velocities[i3 + 1] = Math.random() * 0.02 + 0.01;
      particlesData.current.velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;

      // Color anaranjado para el fuego
      const fireColor = new THREE.Color(0xffa500); // Naranja
      fireColor.r += (Math.random() - 0.5) * 0.5; // Variación hacia rojo/amarillo
      fireColor.g += (Math.random() - 0.5) * 0.2;
      
      particlesData.current.colors[i3] = fireColor.r;
      particlesData.current.colors[i3 + 1] = fireColor.g;
      particlesData.current.colors[i3 + 2] = fireColor.b;

      particlesData.current.sizes[i] = Math.random() * 0.3 + 0.1;
      particlesData.current.lifetimes[i] = 0;
    }
  }, [viewport]);

  const textureRef = useRef<THREE.Texture | null>(null);
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const context = canvas.getContext('2d');

    if (context) {
      const gradient = context.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 16, 16);

      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      textureRef.current = texture;
    }
  }, []);


  const lastUpdate = useRef(0);

  const mouse2D = useRef(new THREE.Vector2());
  const lastMousePos = useRef(new THREE.Vector2());
  const cachedMousePos = useRef(new THREE.Vector3());
  const lastMouseUpdate = useRef(0);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;

    const time = state.clock.getElapsedTime();

    // Update 3D mouse position only every 100ms
    if (time - lastMouseUpdate.current > 0.1) {
      mouse2D.current.set(
        (mouseState.x / window.innerWidth) * 2 - 1,
        -(mouseState.y / window.innerHeight) * 2 + 1
      );
      state.raycaster.setFromCamera(mouse2D.current, camera);
      state.raycaster.ray.at(4, cachedMousePos.current);
      lastMouseUpdate.current = time;
    }

    const { positions, velocities, lifetimes, sizes, count } = particlesData.current;

    const mouseMoved = lastMousePos.current.x !== mouseState.x || lastMousePos.current.y !== mouseState.y;

    if (mouseMoved) {
      let found = 0;
      for (let i = 0; i < count && found < 5; i++) {
        if (lifetimes[i] <= 0) {
          positions[i * 3] = cachedMousePos.current.x;
          positions[i * 3 + 1] = cachedMousePos.current.y;
          positions[i * 3 + 2] = cachedMousePos.current.z;

          velocities[i * 3] = (Math.random() - 0.5) * 0.02;
          velocities[i * 3 + 1] = Math.random() * 0.02 + 0.01;
          velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

          lifetimes[i] = Math.random() * 120 + 120;
          found++;
        }
      }
    }

    lastMousePos.current.set(mouseState.x, mouseState.y);

    for (let i = 0; i < count; i++) {
      if (lifetimes[i] > 0) {
        const i3 = i * 3;

        velocities[i3] += (Math.random() - 0.5) * 0.001;
        velocities[i3 + 2] += (Math.random() - 0.5) * 0.001;

        positions[i3] += velocities[i3];
        positions[i3 + 1] += velocities[i3 + 1];
        positions[i3 + 2] += velocities[i3 + 2];

        const lifeFactor = lifetimes[i] / 240;
        sizes[i] = (Math.sin(lifeFactor * Math.PI)) * 0.5;

        lifetimes[i] -= 1;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    particlesRef.current.geometry.attributes.size.needsUpdate = true;
  });

  return (
    <points ref={particlesRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesData.current.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particlesData.current.colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[particlesData.current.sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
        map={textureRef.current}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        color={0xffffff}        
      />
    </points>
  );
});

export default Particles;