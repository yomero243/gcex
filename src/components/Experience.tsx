import { useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import GUI from 'lil-gui';
import { Box, Environment } from '@react-three/drei';
import Scene from './Scene';
import Particles from './Particles';
import * as THREE from 'three';

interface ExperienceProps {
  scrollProgress: number;
}

const Experience: React.FC<ExperienceProps> = ({ scrollProgress }) => {
  const { scene } = useThree();

  const fogParams = useMemo(() => ({
    color1: '#629362',
    color2: '#b29238',
  }), []);

  const color1 = useMemo(() => new THREE.Color(), []);
  const color2 = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    if (scene.fog) {
      color1.set(fogParams.color1);
      color2.set(fogParams.color2);

      const gui = new GUI();
      const fogFolder = gui.addFolder('Fog');
      fogFolder.add(scene.fog, 'near', 0, 100).name('Near');
      fogFolder.add(scene.fog, 'far', 0, 200).name('Far');
      fogFolder.addColor(fogParams, 'color1').name('Color 1').onChange((value: string) => {
        color1.set(value);
      });
      fogFolder.addColor(fogParams, 'color2').name('Color 2').onChange((value: string) => {
        color2.set(value);
      });
      
      return () => {
        gui.destroy();
      };
    }
  }, [scene, fogParams, color1, color2]);

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
      <fog attach="fog" args={[fogParams.color1, 2, 40]} />
      <Scene />
      <Particles />
    </>
  );
};

export default Experience;
