// src/App.jsx
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { PortfolioMenu } from './components/PortfolioMenu';

function App() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');

  const handleMenuItemClick = (item) => {
    setActiveItem(item);
    // Aquí puedes agregar lógica para cambiar la escena 3D
  };

  return (
    <div className="w-full h-screen bg-gray-900">
      {/* Interfaz de usuario con Tailwind */}
      <div className="absolute top-10 left-10 z-10">
        <h1 className="text-white text-4xl font-bold">Mi Portafolio 3D</h1>
        <p className="text-gray-400">Hecho con R3F y Tailwind</p>
      </div>

      {/* Botón para abrir/cerrar el menú */}
      <button
        onClick={() => setMenuOpen(!isMenuOpen)}
        className="absolute top-10 right-10 z-20 p-2 text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
      >
        {isMenuOpen ? 'Cerrar' : 'Menú'}
      </button>

      <PortfolioMenu
        isOpen={isMenuOpen}
        activeItem={activeItem}
        onMenuItemClick={handleMenuItemClick}
      />
      
      {/* Escena 3D con React Three Fiber */}
      <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
        {/* Luces y Entorno */}
        <ambientLight intensity={0.5} />
        <Environment preset="sunset" />
        
        {/* Controles de cámara */}
        <OrbitControls />
        
        {/* Objetos 3D */}
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="purple" />
        </mesh>
      </Canvas>
    </div>
  );
}

export default App;