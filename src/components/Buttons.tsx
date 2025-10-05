import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";

interface ButtonItem {
  id: string;
  label: string;
  emoji: string;
}

interface ButtonsProps {
  isOpen: boolean;
}

const Buttons: React.FC<ButtonsProps> = ({ isOpen }) => {
  const [activeSection, setActiveSection] = useState<string>("inicio");
  const buttonsRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<HTMLButtonElement[]>([]);

  const handleNavigation = (section: string): void => {
    setActiveSection(section);
    
    // Emitir un evento personalizado que los componentes R3F pueden escuchar
    window.dispatchEvent(new CustomEvent('camera-navigation', { 
      detail: { section } 
    }));
  };

  const getButtonClasses = (section: string): string => {
    return `flex items-center justify-start w-full px-4 py-3 text-sm font-medium rounded-lg ${
      activeSection === section 
      ? "bg-primary text-dark shadow-lg shadow-primary/50 [text-shadow:0_0_10px_var(--tw-shadow-color)]" 
      : "text-light hover:bg-primary/50 hover:text-dark"
    }`;
  };

  const buttons: ButtonItem[] = [
    { id: "inicio", label: "Inicio", emoji: "🏠" },
    { id: "sobre-mi", label: "Sobre mí", emoji: "👨‍💻" },
    { id: "proyectos", label: "Proyectos", emoji: "🚀" },
    { id: "habilidades", label: "Habilidades", emoji: "💪" },
    { id: "contacto", label: "Contacto", emoji: "📧" },
    { id: "cv", label: "CV", emoji: "📄" }
  ];

  useEffect(() => {
    // Animación de entrada de los botones
    if (isOpen && buttonsRef.current && buttonRefs.current.length > 0) {
      gsap.fromTo(buttonRefs.current, 
        { 
          x: -100, 
          opacity: 0,
          scale: 0.8
        },
        { 
          x: 0, 
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          stagger: 0.1,
          delay: 0.2
        }
      );
    }
  }, [isOpen]);

  return (
    <div 
      ref={buttonsRef}
      className={`
        absolute top-0 left-0 h-screen flex flex-col justify-between w-64
        bg-dark/30 backdrop-blur-xl border-r border-primary/40 font-orbitron
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{ 
        pointerEvents: 'auto',
      }}
    >
      <div className="px-4 py-6">
        <span className={`
          grid place-content-center rounded-lg bg-primary/20 text-xs text-light
          h-12 w-full
        `}>
          GCEX
        </span>

        <ul className="mt-8 space-y-2">
          {buttons.map(({ id, label, emoji }, index) => (
            <li key={id}>
              <button
                ref={(el) => {
                  if (el) buttonRefs.current[index] = el;
                }}
                onClick={() => handleNavigation(id)}
                className={getButtonClasses(id)}
                aria-label={`Navigate to ${label}`}
              >
                <span className="text-2xl w-10 text-center">{emoji}</span>
                <span className="ml-4">
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sticky inset-x-0 bottom-0 border-t border-primary/20 p-4">
        {/* Contenido del footer si lo necesitas */}
      </div>
    </div>
  );
};

export default Buttons;