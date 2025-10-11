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
      {/* Luces y Entorno */}
      <ambientLight intensity={0.5} />
      <Environment preset="sunset" />
      
      {/* Controles de cámara movidos a Scene.tsx */}
      
      {/* Objetos 3D */}
      <Scene />
      <Particles />
    </>
  );
};

export default Experience;

// ...
// Ejemplo de una lámpara del techo
<Box args={[2, 0.1, 0.5]} position={[0, 3.9, -5]}>
  {/* Este material HACE que el objeto brille */}
  <meshStandardMaterial 
    color="#ff9933" 
    emissive="#ff9933" // El color que emite
    emissiveIntensity={2} // La fuerza del brillo
  />
</Box>
{/* Y esta es la LUZ REAL que proyecta sombras desde la lámpara */}
<pointLight color="#ff9933" position={[0, 3.5, -5]} intensity={5} distance={8} />

// Repite este patrón para cada lámpara
// ...