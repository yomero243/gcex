/* eslint-disable react/no-unknown-property */
import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { 
  useGLTF,
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
  const { scene } = useGLTF('/Environment2.glb');
  return <primitive object={scene} />;
};

useGLTF.preload('/Environment2.glb');

// Configuración para la animación de las luces principales que iluminan el modelo 3D
// Estas luces crean un efecto cinematográfico con movimiento dinámico
const lightAnimationConfig = {
  // Luz principal (Key Light) - La luz más importante que define la forma del objeto
  keyLight: {
    baseX: 3, y: 4, baseZ: 5,           // Posición base de la luz
    oscillationSpeed: 0.3,              // Velocidad de oscilación en el eje X
    xAmplitude: 1,                      // Amplitud de movimiento en X
    zAmplitude: 0.5,                    // Amplitud de movimiento en Z
    intensityBase: 1.2,                 // Intensidad base de la luz
    intensitySpeed: 1.5,                // Velocidad de cambio de intensidad
    intensityAmplitude: 0.2,            // Amplitud de variación de intensidad
  },
  // Luz de relleno (Fill Light) - Suaviza las sombras duras de la luz principal
  fillLight: {
    intensityBase: 0.4,                 // Intensidad base (más suave que la key light)
    intensitySpeed: 0.8,                // Velocidad de cambio de intensidad
    intensityAmplitude: 0.1,            // Variación sutil de intensidad
  },
  // Luz de contorno (Rim Light) - Crea un halo de luz alrededor del objeto
  rimLight: {
    baseX: -4,                          // Posición base en X (lado opuesto)
    oscillationSpeed: 0.4,              // Velocidad de movimiento horizontal
    xAmplitude: 0.5,                    // Amplitud de movimiento en X
    intensityBase: 0.8,                 // Intensidad base
    intensitySpeed: 2,                  // Velocidad de cambio de intensidad
    intensityAmplitude: 0.3,            // Variación de intensidad
  },
  // Luz de acento (Spot Light) - Luz direccional desde arriba
  spotLight: {
    baseY: 6,                           // Altura base
    ySpeed: 0.5,                        // Velocidad de movimiento vertical
    yAmplitude: 0.5,                    // Amplitud de movimiento en Y
    intensityBase: 0.6,                 // Intensidad base
    intensitySpeed: 1.2,                // Velocidad de cambio de intensidad
    intensityAmplitude: 0.2,            // Variación de intensidad
  }
};

// Componente principal que maneja todas las luces de la escena
// Incluye luces animadas para el modelo 3D y luces estáticas para el pasillo
const LightsComponent: React.FC = () => {
  // Referencias para las luces animadas del modelo 3D (sistema de iluminación cinematográfica)
  const keyLightRef = useRef<THREE.DirectionalLight>(null);    // Luz principal
  const fillLightRef = useRef<THREE.DirectionalLight>(null);   // Luz de relleno
  const rimLightRef = useRef<THREE.DirectionalLight>(null);    // Luz de contorno
  const spotLightRef = useRef<THREE.SpotLight>(null);          // Luz de acento

  // Referencias para los spotlights del pasillo (uno por cada sección de navegación)
  const hallwaySpotlight1 = useRef<THREE.SpotLight>(null!);    // Sección: Inicio
  const hallwaySpotlight2 = useRef<THREE.SpotLight>(null!);    // Sección: Sobre mí
  const hallwaySpotlight3 = useRef<THREE.SpotLight>(null!);    // Sección: Proyectos
  const hallwaySpotlight4 = useRef<THREE.SpotLight>(null!);    // Sección: Habilidades
  const hallwaySpotlight5 = useRef<THREE.SpotLight>(null!);    // Sección: Contacto

  // Helpers visuales para debugging - muestran el cono de luz de cada spotlight
  // Útiles para ajustar posiciones y ángulos durante el desarrollo
  useHelper(hallwaySpotlight1, THREE.SpotLightHelper, 'white');
  useHelper(hallwaySpotlight2, THREE.SpotLightHelper, 'white');
  useHelper(hallwaySpotlight3, THREE.SpotLightHelper, 'white');
  useHelper(hallwaySpotlight4, THREE.SpotLightHelper, 'white');
  useHelper(hallwaySpotlight5, THREE.SpotLightHelper, 'white');


  // Hook que se ejecuta en cada frame para animar las luces del modelo 3D
  // Crea un efecto cinematográfico con luces que se mueven y cambian de intensidad
  useFrame((state) => {
    const time = state.clock.getElapsedTime(); // Tiempo transcurrido desde el inicio
    const { keyLight, fillLight, rimLight, spotLight } = lightAnimationConfig;
    
    // Animación de la luz principal (Key Light)
    // Se mueve en un patrón circular y varía su intensidad para crear dinamismo
    if (keyLightRef.current) {
      keyLightRef.current.position.x = keyLight.baseX + Math.sin(time * keyLight.oscillationSpeed) * keyLight.xAmplitude;
      keyLightRef.current.position.y = keyLight.y; // Altura fija
      keyLightRef.current.position.z = keyLight.baseZ + Math.cos(time * keyLight.oscillationSpeed) * keyLight.zAmplitude;
      keyLightRef.current.intensity = keyLight.intensityBase + Math.sin(time * keyLight.intensitySpeed) * keyLight.intensityAmplitude;
    }
    
    // Animación de la luz de relleno (Fill Light)
    // Solo varía la intensidad para suavizar las sombras de manera sutil
    if (fillLightRef.current) {
      fillLightRef.current.intensity = fillLight.intensityBase + Math.sin(time * fillLight.intensitySpeed) * fillLight.intensityAmplitude;
    }

    // Animación de la luz de contorno (Rim Light)
    // Se mueve horizontalmente y cambia intensidad para crear siluetas dramáticas
    if (rimLightRef.current) {
      rimLightRef.current.position.x = rimLight.baseX + Math.cos(time * rimLight.oscillationSpeed) * rimLight.xAmplitude;
      rimLightRef.current.intensity = rimLight.intensityBase + Math.sin(time * rimLight.intensitySpeed) * rimLight.intensityAmplitude;
    }

    // Animación del spotlight de acento
    // Se mueve verticalmente y varía intensidad para efectos dinámicos desde arriba
    if (spotLightRef.current) {
      spotLightRef.current.intensity = spotLight.intensityBase + Math.sin(time * spotLight.intensitySpeed) * spotLight.intensityAmplitude;
      spotLightRef.current.position.y = spotLight.baseY + Math.sin(time * spotLight.ySpeed) * spotLight.yAmplitude;
    }
  });

  return (
    <group>
      {/* ===== SISTEMA DE ILUMINACIÓN CINEMATOGRÁFICA PARA EL MODELO 3D ===== */}
      
      {/* Luz principal (Key Light) - Define la forma y volumen del objeto */}
      <directionalLight 
        ref={keyLightRef}
        position={[3, 4, 5]}              // X: 3 (derecha), Y: 4 (altura media), Z: 5 (delante)
        intensity={1.5}                   // Intensidad: 1.5 (luz principal, más fuerte)
        color="#ffffff"                   // Color: Blanco puro
        castShadow                        // Propiedad: Proyecta sombras
        shadow-mapSize-width={2048}       // Propiedad: Resolución de sombras (ancho)
        shadow-mapSize-height={2048}      // Propiedad: Resolución de sombras (alto)
      />
      
      {/* Luz de relleno (Fill Light) - Suaviza las sombras duras */}
      <directionalLight 
        ref={fillLightRef}
        position={[-2, 2, 3]}             // X: -2 (izquierda), Y: 2 (altura baja), Z: 3 (delante)
        intensity={0.8}                   // Intensidad: 0.8 (más suave que la key light)
        color="#ffffff"                   // Color: Blanco puro
      />
      
      {/* Luz de contorno (Rim Light) - Crea halo de luz alrededor del objeto */}
      <directionalLight 
        ref={rimLightRef}
        position={[-4, 3, -2]}            // X: -4 (izquierda), Y: 3 (altura media), Z: -2 (atrás)
        intensity={1.2}                   // Intensidad: 1.2 (fuerte para crear contraste)
        color="#ffffff"                   // Color: Blanco puro
      />
      
      {/* Spotlight Volumétrico 1 - Luz direccional roja desde arriba */}
      <spotLight
        ref={spotLightRef}
        position={[0, 8, -10]}            // X: 0 (centro), Y: 8 (muy alto), Z: -10 (atrás)
        target-position={[0, 0, -10]}     // Propiedad: Hacia dónde apunta la luz
        intensity={2}                     // Intensidad: 2 (muy fuerte)
        color="#FF0000"                   // Color: Rojo puro
        angle={Math.PI / 8}               // Propiedad: Ángulo del cono de luz (22.5 grados)
        penumbra={0.7}                    // Propiedad: Suavizado de bordes del cono
        distance={30}                     // Propiedad: Distancia máxima de la luz
        castShadow                        // Propiedad: Proyecta sombras
      />

      {/* Spotlight Volumétrico 2 - Luz direccional naranja lateral */}
      <spotLight
        position={[5, 6, -20]}            // X: 5 (derecha), Y: 6 (alto), Z: -20 (muy atrás)
        target-position={[0, 0, -20]}     // Propiedad: Hacia dónde apunta la luz
        intensity={2}                     // Intensidad: 2 (muy fuerte)
        color="#FFA500"                   // Color: Naranja
        angle={Math.PI / 9}               // Propiedad: Ángulo del cono de luz (20 grados)
        penumbra={0.8}                    // Propiedad: Suavizado de bordes del cono
        distance={10}                     // Propiedad: Distancia máxima de la luz
      />
      
      {/* ===== ILUMINACIÓN AMBIENTAL ===== */}
      
      {/* Luz ambiental - Ilumina toda la escena uniformemente */}
      <ambientLight 
        intensity={0.1}                   // Intensidad: 0.1 (muy tenue, solo para evitar negros absolutos)
        color="#4d2a00"                   // Color: Marrón oscuro
      /> 
      
      {/* Luz hemisférica - Crea gradiente de color en sombras */}
      <hemisphereLight 
        args={["#FFA500", "#FF4500", 0.4]} // Color arriba: Naranja, Color abajo: Rojo-naranja, Intensidad: 0.4
      />

      {/* ===== SISTEMA DE ILUMINACIÓN DEL PASILLO (SPOTLIGHTS POR SECCIÓN) ===== */}
      
      {/* Spotlight 1: Sección INICIO */}
      <spotLight
        ref={hallwaySpotlight1}
        position={[0, 10, 2]}              // X: 0 (centro), Y: 10 (alto), Z: 2 (entrada del pasillo)
        target-position={[0, 2, 2]}        // Propiedad: Apunta hacia Y: 2 (no pasa por debajo de la malla)
        intensity={50}                     // Propiedad: Intensidad alta para verse claramente en el suelo
        color="#CCCCFF"                    // Propiedad: Color lavanda místico
        angle={Math.PI / 20}               // Propiedad: Ángulo del cono (9 grados) - muy enfocado
        penumbra={0.8}                     // Propiedad: Suavizado de bordes (80%)
        distance={35}                      // Propiedad: Alcance máximo de 35 unidades
        castShadow                         // Propiedad: Proyecta sombras
      />
      
      {/* Spotlight 2: Sección SOBRE MÍ */}
      <spotLight
        ref={hallwaySpotlight2}
        position={[0, 10, -2]}             // X: 0 (centro), Y: 10 (alto), Z: -2 (primera estación)
        target-position={[0, 2, -2]}       // Propiedad: Apunta hacia Y: 2 (no pasa por debajo de la malla)
        intensity={50}                     // Propiedad: Intensidad alta para verse claramente en el suelo
        color="#CCCCFF"                    // Propiedad: Color lavanda místico
        angle={Math.PI / 20}               // Propiedad: Ángulo del cono (9 grados) - muy enfocado
        penumbra={0.8}                     // Propiedad: Suavizado de bordes (80%)
        distance={35}                      // Propiedad: Alcance máximo de 35 unidades
        castShadow                         // Propiedad: Proyecta sombras
      />
      
      {/* Spotlight 3: Sección PROYECTOS */}
      <spotLight
        ref={hallwaySpotlight3}
        position={[3, 10, -8]}             // X: 3 (derecha), Y: 10 (alto), Z: -8 (segunda estación)
        target-position={[0, 2, -8]}       // Propiedad: Apunta hacia Y: 2 (no pasa por debajo de la malla)
        intensity={50}                     // Propiedad: Intensidad alta para verse claramente en el suelo
        color="#CCCCFF"                    // Propiedad: Color lavanda místico
        angle={Math.PI / 20}               // Propiedad: Ángulo del cono (9 grados) - muy enfocado
        penumbra={0.8}                     // Propiedad: Suavizado de bordes (80%)
        distance={35}                      // Propiedad: Alcance máximo de 35 unidades
        castShadow                         // Propiedad: Proyecta sombras
      />
      
      {/* Spotlight 4: Sección HABILIDADES */}
      <spotLight
        ref={hallwaySpotlight4}
        position={[0, 10, -20]}            // X: 0 (centro), Y: 10 (alto), Z: -20 (tercera estación)
        target-position={[0, 2, -20]}      // Propiedad: Apunta hacia Y: 2 (no pasa por debajo de la malla)
        intensity={60}                     // Propiedad: Intensidad muy alta para verse claramente en el suelo
        color="#CCCCFF"                    // Propiedad: Color lavanda místico
        angle={Math.PI / 18}               // Propiedad: Ángulo del cono (10 grados) - más amplio
        penumbra={0.9}                     // Propiedad: Suavizado de bordes (90%) - más suave
        distance={40}                      // Propiedad: Alcance máximo de 40 unidades - más lejos
        castShadow                         // Propiedad: Proyecta sombras
      />
      
      {/* Spotlight 5: Sección CONTACTO */}
      <spotLight
        ref={hallwaySpotlight5}
        position={[0, 10, -33]}            // X: 0 (centro), Y: 10 (alto), Z: -33 (cuarta estación)
        target-position={[0, 2, -33]}      // Propiedad: Apunta hacia Y: 2 (no pasa por debajo de la malla)
        intensity={70}                     // Propiedad: Intensidad extrema para verse claramente en el suelo
        color="#CCCCFF"                    // Propiedad: Color lavanda místico
        angle={Math.PI / 18}               // Propiedad: Ángulo del cono (10 grados) - más amplio
        penumbra={0.9}                     // Propiedad: Suavizado de bordes (90%) - más suave
        distance={40}                      // Propiedad: Alcance máximo de 40 unidades - más lejos
        castShadow                         // Propiedad: Proyecta sombras
      />
      
      {/* Spotlight 6: Sección CV */}
      <spotLight
        position={[0, 8, -60]}            // X: 0 (centro), Y: 8 (alto), Z: -60 (final del pasillo)aña
        target-position={[0, 2, -60]}      // Propiedad: Apunta hacia Y: 2 (no pasa por debajo de la malla)
        intensity={1500}                  // Propiedad: Intensidad máxima para verse claramente en el suelo
        color="#CCCCFF"                    // Propiedad: Color lavanda místico
        angle={Math.PI / 18}               // Propiedad: Ángulo del cono (10 grados)
        penumbra={0.9}                     // Propiedad: Suavizado de bordes (90%)
        distance={13}                      // Propiedad: Alcance reducido (13 unidades) - muy concentrado
        castShadow                         // Propiedad: Proyecta sombras
      />
    </group>
  );
};

const Lights = React.memo(LightsComponent);
Lights.displayName = 'Lights';

// ===== CONFIGURACIÓN DE POSICIONES DE LA CÁMARA =====
// Define dónde se posiciona la cámara para cada sección del pasillo
// Todas las posiciones están a altura de persona (y: 1.5) y centradas (x: 0)
const cameraPositions: CameraPositions = {
  inicio:      { x: 0,  y: 1.5, z: 2 },    // X: 0 (centro), Y: 1.5 (altura persona), Z: 2 (entrada del pasillo)
  "sobre-mi":  { x: 0,  y: 1.5, z: -2 },   // X: 0 (centro), Y: 1.5 (altura persona), Z: -2 (primera estación)
  proyectos:   { x: 0,  y: 1.5, z: -8 },   // X: 0 (centro), Y: 1.5 (altura persona), Z: -8 (segunda estación)
  habilidades: { x: 0,  y: 1.5, z: -20 },  // X: 0 (centro), Y: 1.5 (altura persona), Z: -20 (tercera estación)
  contacto:    { x: 0,  y: 1.5, z: -50 },  // X: 0 (centro), Y: 1.5 (altura persona), Z: -50 (cuarta estación)
  cv:          { x: 0,  y: 1.5, z: -50 }   // X: 0 (centro), Y: 1.5 (altura persona), Z: -50 (final del pasillo)
};

// ===== CONTROLADOR DE CÁMARA =====
// Componente que escucha eventos de navegación y mueve la cámara entre secciones
const CameraControllerComponent: React.FC = () => {
  const { camera } = useThree(); // Hook para acceder a la cámara de Three.js

  useEffect(() => {
    // Función que maneja los eventos de navegación de la cámara
    const handleCameraNavigation = (event: Event) => {
      const customEvent = event as CameraNavigationEvent;
      const { section } = customEvent.detail; // Obtiene el nombre de la sección
      const position = cameraPositions[section]; // Busca la posición correspondiente
      
      if (!position) return; // Si no existe la sección, no hace nada

      // Animación suave de la cámara usando GSAP
      gsap.to(camera.position, {
        x: position.x,                    // Propiedad: Posición X final
        y: position.y,                    // Propiedad: Posición Y final  
        z: position.z,                    // Propiedad: Posición Z final
        duration: 1.2,                    // Propiedad: Duración de la animación (1.2 segundos)
        ease: "power2.inOut",             // Propiedad: Curva de suavizado (aceleración y desaceleración)
        onUpdate: () => {
          // Función que se ejecuta en cada frame de la animación
          // Hace que la cámara siempre mire hacia adelante en el pasillo
          camera.lookAt(camera.position.x, camera.position.y, camera.position.z - 5);
        }
      });
    };

    // Registra el listener para el evento personalizado 'camera-navigation'
    window.addEventListener('camera-navigation', handleCameraNavigation);
    
    // Función de limpieza que se ejecuta cuando el componente se desmonta
    return () => {
      window.removeEventListener('camera-navigation', handleCameraNavigation);
    };
  }, [camera]); // Dependencia: se ejecuta cuando cambia la cámara

  return null; // Este componente no renderiza nada visual
};

const CameraController = React.memo(CameraControllerComponent);
CameraController.displayName = 'CameraController';

const Scene: React.FC = () => {
  return (
    <>

      <PerspectiveCamera makeDefault position={[0, 1.5, 2]} fov={75} near={0.1} far={1000} />
      <Lights />
      <EnvironmentModel />
      <CameraController />
      {/* Efectos de post-procesamiento */}

    </>
  );
};

export default Scene;