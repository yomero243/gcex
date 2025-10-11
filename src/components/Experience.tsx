// src/components/Experience.tsx
import { Box, Environment } from '@react-three/drei';
import Scene from './Scene';
import Particles from './Particles';
import { useFrame } from '@react-three/fiber';

interface ExperienceProps {
  scrollProgress: number;
}

const Experience: React.FC<ExperienceProps> = ({ scrollProgress }) => {
  return (
    <>
      {/* Luces y Entorno movidos a Scene.tsx para un control más centralizado */}
      
      {/* Controles de cámara movidos a Scene.tsx */}
      
      {/* Objetos 3D */}
      <Scene />
      <Particles />
    </>
  );
};

export default Experience;
