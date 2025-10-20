import { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
import Buttons from './components/Buttons';
import MouseEffect from './components/MouseEffect';
import ScrollableContent from './components/ScrollableContent';

function App() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  const handleNavigation = (section: string) => {
    setActiveSection(section);
    window.dispatchEvent(new CustomEvent('camera-navigation', { 
      detail: { section: section } 
    }));
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    window.dispatchEvent(new CustomEvent('camera-navigation', { 
      detail: { section: section } 
    }));
  };

  return (
    <div className="w-full font-orbitron">
      <MouseEffect />
      {/* This div is for the 2D UI overlay */}
      <div className="fixed top-0 left-0 w-full h-full z-20 pointer-events-none">
        <div className="absolute top-10 left-0 w-full flex justify-between items-center px-10">
          <div>
            <h1 className="text-4xl font-bold text-white" style={{ textShadow: '0 0 10px #c5edc5' }}>Mi Portafolio 3D</h1>
            <p className="text-white/80">Hecho con R3F y Tailwind</p>
          </div>
          <button
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="z-20 p-2 text-white bg-black/20 rounded-md hover:bg-white/20 hover:text-black transition-colors shadow-lg pointer-events-auto"
          >
            {isMenuOpen ? 'Cerrar' : 'Menú'}
          </button>
        </div>
        <Buttons isOpen={isMenuOpen} activeSection={activeSection} onNavigate={handleNavigation} />
      </div>

      {/* Container for the 3D Canvas */}
      <div className="fixed top-0 left-0 w-full h-screen">
        <Canvas className="w-full h-full">
          <Experience />
        </Canvas>
      </div>

      {/* The new carousel-based scrollable content */}
      <ScrollableContent 
        className="w-full" 
        onSectionChange={handleSectionChange} 
        activeSection={activeSection} 
      />
    </div>
  );
}

export default App;