import React, { useEffect, useRef, useCallback, useState } from "react";
import "./MouseEffect.css";
import { mouseState } from "../utils/mouseState";

// Elementos que deberían activar efecto hover
const INTERACTIVE_ELEMENTS = new Set(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']);

/**
 * Componente que crea un efecto de cursor personalizado
 * @returns {JSX.Element | null} Componente de efecto de cursor o null en dispositivos táctiles
 */
const MouseEffect: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const isHovering = useRef(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Actualiza la posición del cursor con animación de interpolación
  const updateCursorPosition = useCallback(() => {
    if (cursorRef.current) {
      const currentX = mousePosition.current.x;
      const currentY = mousePosition.current.y;
      const targetX = targetPosition.current.x;
      const targetY = targetPosition.current.y;

      // Interpolación lineal (lerp) para un movimiento suave
      const lerpedX = currentX + (targetX - currentX) * 0.2; // Aumentado para más reactividad
      const lerpedY = currentY + (targetY - currentY) * 0.2;

      // Detener la animación si está lo suficientemente cerca para ahorrar rendimiento
      if (Math.abs(targetX - lerpedX) > 0.1 || Math.abs(targetY - lerpedY) > 0.1) {
        mousePosition.current = { x: lerpedX, y: lerpedY };
        cursorRef.current.style.transform = `translate3d(${lerpedX}px, ${lerpedY}px, 0)`;
      } else {
        mousePosition.current = { x: targetX, y: targetY };
        cursorRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }
    }
    rafId.current = requestAnimationFrame(updateCursorPosition);
  }, []);

  // Establece la posición inicial del cursor
  const initializePosition = useCallback(() => {
    const initialX = window.innerWidth / 2;
    const initialY = window.innerHeight / 2;
    mousePosition.current = { x: initialX, y: initialY };
    targetPosition.current = { x: initialX, y: initialY };
    if (cursorRef.current) {
      cursorRef.current.style.opacity = '0';
      cursorRef.current.style.transform = `translate3d(${initialX}px, ${initialY}px, 0)`;
      // Mostrar el cursor después de un breve retraso para evitar el parpadeo inicial
      setTimeout(() => {
        if (cursorRef.current) cursorRef.current.style.opacity = '1';
      }, 100);
    }
  }, []);

  // Actualiza la posición objetivo del ratón
  const handleMouseMove = useCallback((event: MouseEvent) => {
    targetPosition.current.x = event.clientX;
    targetPosition.current.y = event.clientY;
    mouseState.x = event.clientX;
    mouseState.y = event.clientY;
  }, []);

  // Detecta si el elemento hover es interactivo
  const handleInteraction = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const isInteractive = INTERACTIVE_ELEMENTS.has(target.tagName) || 
                         target.classList.contains('interactive') ||
                         !!target.closest('.interactive');

    if (isInteractive !== isHovering.current) {
      isHovering.current = isInteractive;
      cursorRef.current?.classList.toggle('hover', isInteractive);
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
    
    if (isTouchDevice) return;
    
    initializePosition();
    rafId.current = requestAnimationFrame(updateCursorPosition);

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleInteraction, { passive: true });
    document.documentElement.style.cursor = 'none';

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleInteraction);
      document.documentElement.style.cursor = '';
    };
  }, [isTouchDevice, detectTouchDevice, initializePosition, updateCursorPosition, handleMouseMove, handleInteraction]);

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