import React, { useEffect, useRef, useCallback, useState } from "react";
import "./MouseEffect.css";

// Elementos que deberían activar efecto hover
const INTERACTIVE_ELEMENTS = new Set(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']);

// Variables para el manejo del movimiento del ratón
let lastMouseX = 0;
let lastMouseY = 0;
let lastUpdateTime = performance.now();

interface MouseEffectProps {
  setMousePosition: (position: { x: number; y: number }) => void;
}

/**
 * Componente que crea un efecto de cursor personalizado
 * @returns {JSX.Element} Componente de efecto de cursor
 */
const MouseEffect: React.FC<MouseEffectProps> = ({ setMousePosition }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const isHovering = useRef(false);
  const isInitialized = useRef(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Actualiza la posición del cursor con animación
  const updateCursorPosition = useCallback(() => {
    if (!cursorRef.current) {
      rafId.current = requestAnimationFrame(updateCursorPosition);
      return;
    }
    
    cursorRef.current.style.transform = `translate3d(${mousePosition.current.x}px, ${mousePosition.current.y}px, 0)`;
    
    if (!isInitialized.current) {
      cursorRef.current.style.opacity = '1';
      isInitialized.current = true;
    }
    
    rafId.current = requestAnimationFrame(updateCursorPosition);
  }, []);

  // Establece la posición inicial del cursor
  const initializePosition = useCallback(() => {
    mousePosition.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
    if (cursorRef.current) {
      cursorRef.current.style.opacity = '0';
      cursorRef.current.style.transform = `translate3d(${mousePosition.current.x}px, ${mousePosition.current.y}px, 0)`;
    }
  }, []);

  // Maneja el movimiento del ratón con interpolación suave
  const handleMouseMove = useCallback((event: MouseEvent) => {
    const currentTime = performance.now();
    const timeDelta = currentTime - lastUpdateTime;

    // Actualiza la posición solo si ha pasado suficiente tiempo (60 FPS aproximadamente)
    if (timeDelta > 16) {
      const dx = event.clientX - lastMouseX;
      const dy = event.clientY - lastMouseY;
      
      // Interpolación suave del movimiento
      mousePosition.current = {
        x: lastMouseX + dx * 0.5,
        y: lastMouseY + dy * 0.5
      };

      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
      lastUpdateTime = currentTime;

      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  }, []);

  // Detecta si el elemento hover es interactivo
  const handleInteraction = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const isInteractive = INTERACTIVE_ELEMENTS.has(target.tagName) || 
                         target.classList.contains('interactive') ||
                         !!target.closest('.interactive');

    if (isInteractive !== isHovering.current) {
      isHovering.current = isInteractive;
      if (cursorRef.current) {
        cursorRef.current.classList.toggle('hover', isInteractive);
      }
    }
  }, []);

  // Detecta si es un dispositivo táctil
  const detectTouchDevice = useCallback(() => {
    const isTouchCapable = 'ontouchstart' in window || 
                          navigator.maxTouchPoints > 0 || 
                          (navigator as any).msMaxTouchPoints > 0;
                          
    setIsTouchDevice(isTouchCapable || !window.matchMedia('(hover: hover)').matches);
  }, []);

  // Efecto principal para inicializar y limpiar
  useEffect(() => {
    detectTouchDevice();
    
    // No mostrar cursor personalizado en dispositivos táctiles
    if (isTouchDevice) return;
    
    // Reiniciar valores de seguimiento
    lastMouseX = window.innerWidth / 2;
    lastMouseY = window.innerHeight / 2;
    lastUpdateTime = performance.now();
    
    initializePosition();
    rafId.current = requestAnimationFrame(updateCursorPosition);

    // Event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleInteraction, { passive: true });
    
    // Ocultar cursor predeterminado
    document.documentElement.style.cursor = 'none';

    // Limpieza
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleInteraction);
      document.documentElement.style.cursor = '';
    };
  }, [updateCursorPosition, handleMouseMove, handleInteraction, initializePosition, detectTouchDevice, isTouchDevice]);

  // No renderizar nada en dispositivos táctiles
  if (isTouchDevice) {
    return null;
  }

  return (
    <div 
      className="cursor" 
      ref={cursorRef} 
      style={{ opacity: 0 }}
      aria-hidden="true" 
      data-testid="custom-cursor"
    />
  );
};

export default React.memo(MouseEffect);
