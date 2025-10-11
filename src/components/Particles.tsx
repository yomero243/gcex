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

const ParticlesInstance: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const { viewport, camera } = useThree();

  const particlesData = useRef<ParticlesData>({
    positions: new Float32Array(2000 * 3),
    velocities: new Float32Array(2000 * 3),
    lifetimes: new Float32Array(2000),
    colors: new Float32Array(2000 * 3),
    sizes: new Float32Array(2000),
    count: 2000,
  });

  useEffect(() => {
    for (let i = 0; i < particlesData.current.count; i++) {
      const i3 = i * 3;
      // Inicializar partículas en posiciones aleatorias
      particlesData.current.positions[i3] = (Math.random() - 0.5) * viewport.width;
      particlesData.current.positions[i3 + 1] = (Math.random() - 0.5) * viewport.height;
      particlesData.current.positions[i3 + 2] = (Math.random() - 0.5) * 5;

      particlesData.current.velocities[i3] = (Math.random() - 0.5) * 0.01;
      particlesData.current.velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
      particlesData.current.velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;

      // Color blanco para todas las partículas
      particlesData.current.colors[i3] = 1; // r
      particlesData.current.colors[i3 + 1] = 1; // g
      particlesData.current.colors[i3 + 2] = 1; // b

      particlesData.current.sizes[i] = Math.random() * 0.3 + 0.1;
      // Dar lifetime inicial para que las partículas sean visibles desde el inicio
      particlesData.current.lifetimes[i] = -Math.random() * 60;
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

  const mouse2D = useRef(new THREE.Vector2());
  const lastUpdate = useRef(0);

  useFrame((state) => {
    if (!particlesRef.current) return;

    const time = state.clock.getElapsedTime();
    if (time - lastUpdate.current < 1 / 30) { // Throttle to 30 FPS
      return;
    }
    lastUpdate.current = time;

    // Convert mouse position to 2D normalized coordinates
    mouse2D.current.set(
      (mouseState.x / window.innerWidth) * 2 - 1,
      -(mouseState.y / window.innerHeight) * 2 + 1
    );
    
    const mousePos = new THREE.Vector3();
    state.raycaster.setFromCamera(mouse2D.current, camera);
    state.raycaster.ray.at(4, mousePos);

    const { positions, velocities, lifetimes, count } = particlesData.current;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Si la partícula no tiene vida, regenerarla
      if (lifetimes[i] <= 0) {
        // 70% de probabilidad de regenerar desde la posición del mouse
        // 30% de probabilidad de regenerar en posición aleatoria
        if (Math.random() < 0.7 && mouseState.x !== 0 && mouseState.y !== 0) {
          positions[i3] = mousePos.x;
          positions[i3 + 1] = mousePos.y;
          positions[i3 + 2] = mousePos.z;
        } else {
          positions[i3] = (Math.random() - 0.5) * viewport.width;
          positions[i3 + 1] = (Math.random() - 0.5) * viewport.height;
          positions[i3 + 2] = (Math.random() - 0.5) * 5;
        }

        velocities[i3] = (Math.random() - 0.5) * 0.02;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

        lifetimes[i] = Math.random() * 60 + 30; // Lifetime más largo
      }

      // Mover las partículas
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // Reducir lifetime
      lifetimes[i] -= 1;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
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
        size={0.02}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
        map={textureRef.current}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        color={0x9bc70b}
      />
    </points>
  );
};

const Particles = React.memo(ParticlesInstance);
Particles.displayName = 'Particles';

export default Particles;