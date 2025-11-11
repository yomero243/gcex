import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './components/Experience';
import Buttons from './components/Buttons';

import ScrollableContent from './components/ScrollableContent';
import { LoadingScreen } from './components/LoadingScreen';

function App() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [started, setStarted] = useState(false);

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

      {/* This div is for the 2D UI overlay */}
      <div className="fixed top-0 left-0 w-full h-full z-20 pointer-events-none">
        <div className="absolute top-10 left-0 w-full flex justify-between items-center px-4 sm:px-10">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white" style={{ textShadow: '0 0 10px #FFD700' }}>My 3D Portfolio</h1>
            <p className="text-yellow-200/80">Made with R3F and Tailwind</p>
          </div>
          <button
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="z-20 p-2 text-white bg-black/20 rounded-md hover:bg-white/20 hover:text-black transition-colors shadow-lg pointer-events-auto"
          >
            {isMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        <Buttons isOpen={isMenuOpen} activeSection={activeSection} onNavigate={handleNavigation} />
      </div>

      {/* Container for the 3D Canvas */}
      <div className={`fixed top-0 left-0 w-full h-screen ${started ? 'z-1' : 'z-30'}`}>
        {started ? (
          <Suspense fallback={null}>
            <Canvas className="w-full h-full">
              <Experience />
            </Canvas>
          </Suspense>
        ) : (
          <LoadingScreen onStarted={() => setStarted(true)} />
        )}
      </div>

      {/* The new carousel-based scrollable content */}
      <ScrollableContent
        className="w-full z-10"
        onSectionChange={handleSectionChange}
        activeSection={activeSection}
      />

    </div>
  );
}

export default App;