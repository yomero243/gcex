/* eslint-disable react/no-unknown-property */
import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { 
  useGLTF,
  Center, 
  PerspectiveCamera,
  useHelper
} from '@react-three/drei';
import * as THREE from 'three';
import gsap from "gsap";

// Interfaces
interface CameraNavigationEvent extends Event {
  detail: {
    section: string;
  };
}

interface CameraPosition {
  x: number;
  y: number;
  z: number;
}

interface CameraPositions {
  [key: string]: CameraPosition;
}

// Componente para el Cubo
const EnvironmentModel: React.FC = () => {
  const { scene } = useGLTF('/Environment1.glb');
  return <primitive object={scene} />;
};

useGLTF.preload('/Environment1.glb');


// Componente para las luces que resaltan tu figura
const LightsComponent: React.FC = () => {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);

  useHelper(keyLightRef, THREE.DirectionalLightHelper, 1, 'red')
  useHelper(spotLightRef, THREE.SpotLightHelper, 'cyan')


  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Luz principal que sigue tu figura
    if (keyLightRef.current) {
      keyLightRef.current.position.x = 3 + Math.sin(time * 0.3) * 1;
      keyLightRef.current.position.y = 4;
      keyLightRef.current.position.z = 5 + Math.cos(time * 0.3) * 0.5;
      keyLightRef.current.intensity = 1.2 + Math.sin(time * 1.5) * 0.2;
    }
    
    // Luz de relleno suave
    if (fillLightRef.current) {
      fillLightRef.current.intensity = 0.4 + Math.sin(time * 0.8) * 0.1;
    }

    // Luz de contorno para crear silueta dramática
    if (rimLightRef.current) {
      rimLightRef.current.position.x = -4 + Math.cos(time * 0.4) * 0.5;
      rimLightRef.current.intensity = 0.8 + Math.sin(time * 2) * 0.3;
    }

    // Spotlight dinámico desde arriba
    if (spotLightRef.current) {
      spotLightRef.current.intensity = 0.6 + Math.sin(time * 1.2) * 0.2;
      spotLightRef.current.position.y = 6 + Math.sin(time * 0.5) * 0.5;
    }
  });

  return (
    <group>
      {/* Luz principal (Key Light) */}
      <directionalLight 
        ref={keyLightRef}
        position={[3, 4, 5]} 
        intensity={1.2} 
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Luz de relleno (Fill Light) */}
      <directionalLight 
        ref={fillLightRef}
        position={[-2, 2, 3]} 
        intensity={0.4} 
        color="#e0e7ff"
      />
      
      {/* Luz de contorno (Rim Light) */}
      <directionalLight 
        ref={rimLightRef}
        position={[-4, 3, -2]} 
        intensity={0.8} 
        color="#fbbf24"
      />
      
      {/* Spotlight desde arriba */}
      <spotLight
        ref={spotLightRef}
        position={[0, 6, 2]}
        target-position={[0, 0, 0]}
        intensity={0.6}
        color="#ffffff"
        angle={Math.PI / 6}
        penumbra={0.5}
        distance={20}
      />
      
      {/* Luz ambiental suave */}
      <ambientLight intensity={0.15} color="#808080" />
      
      {/* Luz hemisférica para ambiente natural */}
      <hemisphereLight 
        args={["#ddd6fe", "#1e1b4b", 0.2]}
      />
    </group>
  );
};

const Lights = React.memo(LightsComponent);
Lights.displayName = 'Lights';

// Posiciones de la cámara enfocadas en tu persona 3D
const cameraPositions: CameraPositions = {
  inicio:      { x: 0,  y: 1.5, z: 25 }, // Frontal
  "sobre-mi":  { x: 2,  y: 1.5, z: 8 },  // Right
  proyectos:   { x: -2, y: 1.5, z: 4 },  // Left
  habilidades: { x: 0,  y: 1.5, z: 0 },  // Center
  contacto:    { x: 0,  y: 1.5, z: -4 }, // Frontal
  cv:          { x: 0,  y: 1.5, z: -8 }  // End of the hall
};

// Componente que escucha los eventos de navegación y mueve la cámara
const CameraControllerComponent: React.FC = () => {
  const { camera } = useThree();

  useEffect(() => {
    const handleCameraNavigation = (event: Event) => {
      const customEvent = event as CameraNavigationEvent;
      const { section } = customEvent.detail;
      const position = cameraPositions[section];
      
      if (!position) return;

      // Animación más dramática con rotación de cámara
      gsap.to(camera.position, {
        x: position.x,
        y: position.y,
        z: position.z,
        duration: 2,
        ease: "power3.inOut",
        onUpdate: () => {
          // Forzar a la cámara a mirar siempre hacia adelante en el eje Z
          camera.lookAt(camera.position.x, camera.position.y, camera.position.z - 1);
        }
      });
    };

    window.addEventListener('camera-navigation', handleCameraNavigation);
    
    return () => {
      window.removeEventListener('camera-navigation', handleCameraNavigation);
    };
  }, [camera]);

  return null;
};

const CameraController = React.memo(CameraControllerComponent);
CameraController.displayName = 'CameraController';

const Scene: React.FC = () => {
  return (
    <>
      <axesHelper args={[5]} />
      <gridHelper args={[20, 20]} />
      <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={75} near={0.1} far={1000} />
      <Lights />
      <EnvironmentModel />
      <CameraController />
      {/* Efectos de post-procesamiento */}
      <fog attach="fog" args={['#101010', 20, 100]} />
    </>
  );
};

export default Scene;
