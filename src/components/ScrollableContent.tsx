import React from 'react';

const ScrollableContent: React.FC = ({ className }) => {
  return (
    <div className={`${className} flex flex-col items-center`}>
      <div className="h-[100vh] w-full flex items-center justify-center">
        <div className="w-1/2 p-10 rounded-lg bg-dark/50 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-light text-center">Sección 1</h2>
          <p className="text-light/80 mt-4 text-center">Contenido de la sección 1...</p>
        </div>
      </div>
      <div className="h-[100vh] w-full flex items-center justify-center">
        <div className="w-1/2 p-10 rounded-lg bg-dark/50 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-light text-center">Sección 2</h2>
          <p className="text-light/80 mt-4 text-center">Contenido de la sección 2...</p>
        </div>
      </div>
      <div className="h-[100vh] w-full flex items-center justify-center">
        <div className="w-1/2 p-10 rounded-lg bg-dark/50 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-light text-center">Sección 3</h2>
          <p className="text-light/80 mt-4 text-center">Contenido de la sección 3...</p>
        </div>
      </div>
    </div>
  );
};

export default ScrollableContent;
