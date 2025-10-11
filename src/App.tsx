import { useState, useLayoutEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
import Buttons from './components/Buttons';
import MouseEffect from './components/MouseEffect';
import ScrollableContent from './components/ScrollableContent';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

function App() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, _setActiveSection] = useState('inicio');
  const mainRef = useRef(null);
  const isNavigating = useRef(false);
  const activeSectionRef = useRef(activeSection);

  const setActiveSection = (section: string) => {
    activeSectionRef.current = section;
    _setActiveSection(section);
  };

  const handleNavigation = (section: string) => {
    isNavigating.current = true;
    setActiveSection(section);

    window.dispatchEvent(new CustomEvent('camera-navigation', { 
      detail: { section: section } 
    }));

    gsap.to(window, { 
      scrollTo: { y: `#${section}`, offsetY: 70 }, 
      duration: 1, 
      ease: 'power2.inOut',
      onComplete: () => {
        isNavigating.current = false;
      }
    });
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: mainRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          if (isNavigating.current) return;

          setScrollProgress(self.progress);
          
          const sections = ['inicio', 'sobre-mi', 'proyectos', 'habilidades', 'contacto', 'cv'];
          const totalSections = sections.length;
          let sectionIndex = Math.floor(self.progress * totalSections);
          sectionIndex = Math.min(sectionIndex, totalSections - 1);
          
          const currentSection = sections[sectionIndex];
          
          if (currentSection !== activeSectionRef.current) {
            setActiveSection(currentSection);
            
            window.dispatchEvent(new CustomEvent('camera-navigation', { 
              detail: { section: currentSection } 
            }));
            
            console.log(`Scroll: ${(self.progress * 100).toFixed(1)}% → Sección: ${currentSection}`);
          }
        },
      });
    }, mainRef);
    return () => ctx.revert();
  }, []);

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
        <Buttons isOpen={isMenuOpen} activeSection={activeSection} onNavigate={handleNavigation} />
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