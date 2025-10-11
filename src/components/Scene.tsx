/* eslint-disable react/no-unknown-property */
import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { 
  useGLTF,
  PerspectiveCamera
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

// Constantes para la animación de las luces
const lightAnimationConfig = {
  keyLight: {
    baseX: 3, y: 4, baseZ: 5,
    oscillationSpeed: 0.3,
    xAmplitude: 1,
    zAmplitude: 0.5,
    intensityBase: 1.2,
    intensitySpeed: 1.5,
    intensityAmplitude: 0.2,
  },
  fillLight: {
    intensityBase: 0.4, intensitySpeed: 0.8, intensityAmplitude: 0.1,
  },
  rimLight: {
    baseX: -4, oscillationSpeed: 0.4, xAmplitude: 0.5, intensityBase: 0.8, intensitySpeed: 2, intensityAmplitude: 0.3,
  },
  spotLight: {
    baseY: 6, ySpeed: 0.5, yAmplitude: 0.5, intensityBase: 0.6, intensitySpeed: 1.2, intensityAmplitude: 0.2,
  }
};

// Componente para las luces que resaltan tu figura
const LightsComponent: React.FC = () => {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);

  // Helpers para debugging (comentados para evitar errores de tipo)
  // useHelper(keyLightRef, THREE.DirectionalLightHelper, 1)
  // useHelper(spotLightRef, THREE.SpotLightHelper)


  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const { keyLight, fillLight, rimLight, spotLight } = lightAnimationConfig;
    
    // Luz principal que sigue tu figura
    if (keyLightRef.current) {
      keyLightRef.current.position.x = keyLight.baseX + Math.sin(time * keyLight.oscillationSpeed) * keyLight.xAmplitude;
      keyLightRef.current.position.y = keyLight.y;
      keyLightRef.current.position.z = keyLight.baseZ + Math.cos(time * keyLight.oscillationSpeed) * keyLight.zAmplitude;
      keyLightRef.current.intensity = keyLight.intensityBase + Math.sin(time * keyLight.intensitySpeed) * keyLight.intensityAmplitude;
    }
    
    // Luz de relleno suave
    if (fillLightRef.current) {
      fillLightRef.current.intensity = fillLight.intensityBase + Math.sin(time * fillLight.intensitySpeed) * fillLight.intensityAmplitude;
    }

    // Luz de contorno para crear silueta dramática
    if (rimLightRef.current) {
      rimLightRef.current.position.x = rimLight.baseX + Math.cos(time * rimLight.oscillationSpeed) * rimLight.xAmplitude;
      rimLightRef.current.intensity = rimLight.intensityBase + Math.sin(time * rimLight.intensitySpeed) * rimLight.intensityAmplitude;
    }

    // Spotlight dinámico desde arriba
    if (spotLightRef.current) {
      spotLightRef.current.intensity = spotLight.intensityBase + Math.sin(time * spotLight.intensitySpeed) * spotLight.intensityAmplitude;
      spotLightRef.current.position.y = spotLight.baseY + Math.sin(time * spotLight.ySpeed) * spotLight.yAmplitude;
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

// Posiciones de la cámara en un pasillo lineal
const cameraPositions: CameraPositions = {
  inicio:      { x: 0,  y: 1.5, z: 2 },    // Entrada del pasillo
  "sobre-mi":  { x: 0,  y: 1.5, z: -2 },   // Primera estación
  proyectos:   { x: 0,  y: 1.5, z: -8 },   // Segunda estación
  habilidades: { x: 0,  y: 1.5, z: -14 },  // Tercera estación
  contacto:    { x: 0,  y: 1.5, z: -20 },  // Cuarta estación
  cv:          { x: 0,  y: 1.5, z: -50 }   // Final del pasillo (más profundo)
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

      // Animación suave para navegación en pasillo
      gsap.to(camera.position, {
        x: position.x,
        y: position.y,
        z: position.z,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: () => {
          // La cámara mira hacia adelante en el pasillo
          camera.lookAt(camera.position.x, camera.position.y, camera.position.z - 5);
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
      <axesHelper args={[10]} />
      <gridHelper args={[50, 50]} />
      <PerspectiveCamera makeDefault position={[0, 1.5, 2]} fov={75} near={0.1} far={1000} />
      <Lights />
      <EnvironmentModel />
      <CameraController />
      {/* Efectos de post-procesamiento */}
      <fog attach="fog" args={['#101010', 20, 100]} />
    </>
  );
};

export default Scene;