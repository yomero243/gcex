import { useState, useLayoutEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
import Buttons from './components/Buttons';
import MouseEffect from './components/MouseEffect';
import ScrollableContent from './components/ScrollableContent';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentScrollSection, setCurrentScrollSection] = useState('inicio');
  const mainRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: mainRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
          
          // Mapear el progreso del scroll a las secciones de manera más precisa
          const sections = ['inicio', 'sobre-mi', 'proyectos', 'habilidades', 'contacto', 'cv'];
          const totalSections = sections.length;
          
          // Calcular el índice de la sección actual basado en el progreso
          let sectionIndex = Math.floor(self.progress * totalSections);
          
          // Asegurar que no excedamos el array
          sectionIndex = Math.min(sectionIndex, totalSections - 1);
          
          // Solo cambiar si es una sección diferente
          const currentSection = sections[sectionIndex];
          
          // Solo emitir evento si la sección cambió
          if (currentSection !== currentScrollSection) {
            setCurrentScrollSection(currentSection);
            
            // Emitir evento de navegación de cámara basado en scroll
            window.dispatchEvent(new CustomEvent('camera-navigation', { 
              detail: { section: currentSection } 
            }));
            
            // Debug: mostrar en consola
            console.log(`Scroll: ${(self.progress * 100).toFixed(1)}% → Sección: ${currentSection}`);
          }
        },
      });
    }, mainRef);
    return () => ctx.revert();
  }, [currentScrollSection]);

  return (
    <div ref={mainRef} className="w-full font-orbitron">
      <div className="fixed top-0 left-0 w-full h-full z-2 pointer-events-none">
        <MouseEffect />
        <div className="absolute top-10 left-0 w-full flex justify-between items-center px-10">
          <div>
            <h1 className="text-4xl font-bold text-primary" style={{ textShadow: '0 0 10px #ff9933' }}>Mi Portafolio 3D</h1>
            <p className="text-light">Hecho con R3F y Tailwind</p>
          </div>
          <button
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="z-20 p-2 text-primary bg-dark rounded-md hover:bg-primary hover:text-dark transition-colors shadow-lg shadow-primary/50 hover:shadow-secondary/50 pointer-events-auto"
          >
            {isMenuOpen ? 'Cerrar' : 'Menú'}
          </button>
        </div>
        <Buttons isOpen={isMenuOpen} />
      </div>

      {/* Container for 3D Canvas and Scrollable Content */}
      <div className="fixed top-0 left-0 w-full h-screen">
        <Canvas className="w-full h-full">
          <Experience scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      <ScrollableContent className="w-full" />
    </div>
  );
}

export default App;