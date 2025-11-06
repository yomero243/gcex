import { useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import Scene from './Scene';
import * as THREE from 'three';

const Experience: React.FC = () => {
  const { scene } = useThree();

  const fogParams = useMemo(() => ({
    color1: '#c5edc5',
    color2: '#b89575',
  }), []);

  const color1 = useMemo(() => new THREE.Color(fogParams.color1), [fogParams.color1]);
  const color2 = useMemo(() => new THREE.Color(fogParams.color2), [fogParams.color2]);

  useFrame(({ clock }) => {
    if (scene.fog) {
      const elapsedTime = clock.getElapsedTime();
      const factor = (Math.sin(elapsedTime * Math.PI) + 1) / 2;
      scene.fog.color.lerpColors(color1, color2, factor);
    }
  });

  return (
    <>
      {/* Luces y Entorno movidos a Scene.tsx para un control más centralizado */}
      
      {/* Controles de cámara movidos a Scene.tsx */}
      
      {/* Objetos 3D */}
      {/* <fog attach="fog" args={[fogParams.color1, 2, 40]} /> */}
      <Scene />
    </>
  );
};

export default Experience;
