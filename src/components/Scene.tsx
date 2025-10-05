/* eslint-disable react/no-unknown-property */
import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { 
  Center, 
  PerspectiveCamera,
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
const Cube: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.2;
      meshRef.current.rotation.x = Math.sin(time * 0.8) * 0.2;
    }
  });

  return (
    <Center>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="#a855f7" roughness={0.5} metalness={0.8} />
      </mesh>
    </Center>
  );
};

// Componente para las luces que resaltan tu figura
const LightsComponent: React.FC = () => {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);

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
        color="#a855f7"
        angle={Math.PI / 6}
        penumbra={0.5}
        distance={20}
      />
      
      {/* Luz ambiental suave */}
      <ambientLight intensity={0.15} color="#4c1d95" />
      
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
  inicio: { x: 0, y: 1, z: 8 },        // Vista frontal de presentación
  "sobre-mi": { x: 4, y: 1.5, z: 6 },   // Vista ligeramente lateral para mostrar perfil
  proyectos: { x: -5, y: 2, z: 7 },     // Vista lateral izquierda, mostrando creatividad
  habilidades: { x: 2, y: 3, z: 5 },    // Vista elevada para mostrar habilidades
  contacto: { x: -3, y: 0.5, z: 6 },    // Vista más cercana e íntima
  cv: { x: 0, y: -1, z: 9 }              // Vista completa de cuerpo entero
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
          // Rotación dinámica hacia el modelo
          camera.lookAt(0, 0, 0);
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

// Componente para el fondo con gradiente animado
const AnimatedBackground: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (meshRef.current) {
      // Rotación lenta del fondo
      meshRef.current.rotation.z = time * 0.02;
      meshRef.current.rotation.x = Math.sin(time * 0.01) * 0.1;
    }
    
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = time;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -50]} scale={[100, 100, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          time: { value: 0 },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          varying vec2 vUv;
          
          void main() {
            vec2 uv = vUv;
            
            // Gradiente base con colores más vibrantes
            vec3 color1 = vec3(0.15, 0.1, 0.35);
            vec3 color2 = vec3(0.3, 0.15, 0.6);
            vec3 color3 = vec3(0.1, 0.2, 0.5);
            
            // Efectos ondulantes más complejos
            float wave1 = sin(uv.x * 8.0 + time * 0.8) * 0.15;
            float wave2 = cos(uv.y * 6.0 + time * 0.6) * 0.15;
            float wave3 = sin((uv.x + uv.y) * 4.0 + time * 0.4) * 0.1;
            
            vec3 color = mix(color1, color2, uv.y + wave1);
            color = mix(color, color3, uv.x + wave2 + wave3);
            
            // Añadir brillo sutil
            color += vec3(0.05) * sin(time * 2.0 + uv.x * 20.0) * sin(time * 1.5 + uv.y * 15.0);
            
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
};

const Scene: React.FC = () => {
  return (
    <>
      <AnimatedBackground />
      <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={75} near={0.1} far={1000} />
      <Lights />
      <Cube />
      <CameraController />
      {/* Efectos de post-procesamiento */}
      <fog attach="fog" args={['#1a1a2e', 20, 100]} />
    </>
  );
};

export default Scene;