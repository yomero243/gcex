import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticlesProps {
  mousePosition: { x: number; y: number };
}

interface ParticlesData {
  positions: Float32Array;
  velocities: Float32Array;
  lifetimes: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  count: number;
}

const ParticlesInstance: React.FC<ParticlesProps> = ({ mousePosition }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const { viewport, camera } = useThree();

  const particlesData = useRef<ParticlesData>({
    positions: new Float32Array(8000 * 3),
    velocities: new Float32Array(8000 * 3),
    lifetimes: new Float32Array(8000),
    colors: new Float32Array(8000 * 3),
    sizes: new Float32Array(8000),
    count: 8000,
  });

  useEffect(() => {
    for (let i = 0; i < particlesData.current.count; i++) {
      const i3 = i * 3;
      particlesData.current.positions[i3] = (Math.random() - 0.5) * viewport.width;
      particlesData.current.positions[i3 + 1] = (Math.random() - 0.5) * viewport.height;
      particlesData.current.positions[i3 + 2] = (Math.random() - 0.5) * 5;

      particlesData.current.velocities[i3] = 0;
      particlesData.current.velocities[i3 + 1] = 0;
      particlesData.current.velocities[i3 + 2] = 0;

      const hue = Math.random() * 360;
      const saturation = 0.7 + Math.random() * 0.3;
      const lightness = 0.5 + Math.random() * 0.5;
      const color = new THREE.Color().setHSL(hue / 360, saturation, lightness);
      particlesData.current.colors[i3] = color.r;
      particlesData.current.colors[i3 + 1] = color.g;
      particlesData.current.colors[i3 + 2] = color.b;

      particlesData.current.sizes[i] = Math.random() * 0.5 + 0.1;
      particlesData.current.lifetimes[i] = 0;
    }
  }, [viewport]);

  const textureRef = useRef<THREE.Texture | null>(null);
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');

    if (context) {
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 32, 32);

      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      textureRef.current = texture;
    }
  }, []);

  const mouse3D = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!particlesRef.current) return;

    // Convert mouse position to 3D space
    mouse3D.current.set(
      (mousePosition.x / window.innerWidth) * 2 - 1,
      -(mousePosition.y / window.innerHeight) * 2 + 1,
      0.5
    );
    mouse3D.current.unproject(camera);
    const dir = mouse3D.current.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));


    const { positions, velocities, lifetimes, count } = particlesData.current;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      if (lifetimes[i] <= 0) {
        positions[i3] = pos.x;
        positions[i3 + 1] = pos.y;
        positions[i3 + 2] = pos.z;

        velocities[i3] = (Math.random() - 0.5) * 0.02;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

        lifetimes[i] = Math.random() * 100;
      }

      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

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
        size={0.1}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.8}
        map={textureRef.current}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const Particles = React.memo(ParticlesInstance);
Particles.displayName = 'Particles';

export default Particles;
