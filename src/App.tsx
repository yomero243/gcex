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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
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
        },
      });
    }, mainRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="w-full font-orbitron">
      <div className="fixed top-0 left-0 w-full h-full z-2 pointer-events-none">
        <MouseEffect setMousePosition={setMousePosition} />
        <div className="absolute top-10 left-10">
          <h1 className="text-4xl font-bold text-primary" style={{ textShadow: '0 0 10px #ff9933' }}>Mi Portafolio 3D</h1>
          <p className="text-light">Hecho con R3F y Tailwind</p>
        </div>
        <button
          onClick={() => setMenuOpen(!isMenuOpen)}
          className="absolute top-10 right-10 z-20 p-2 text-primary bg-dark rounded-md hover:bg-primary hover:text-dark transition-colors shadow-lg shadow-primary/50 hover:shadow-secondary/50 pointer-events-auto"
        >
          {isMenuOpen ? 'Cerrar' : 'Menú'}
        </button>
        <Buttons isOpen={isMenuOpen} />
      </div>

      {/* Container for 3D Canvas and Scrollable Content */}
      <div className="fixed top-0 left-0 w-full h-screen">
        <Canvas className="w-full h-full" camera={{ position: [0, 2, 5], fov: 75 }}>
          <Experience mousePosition={mousePosition} scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      <ScrollableContent className="absolute top-0 left-0 w-full" />
    </div>
  );
}

export default App;
