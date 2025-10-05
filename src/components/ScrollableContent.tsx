import React from 'react';

const ScrollableContent: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full z-10">
      <div className="h-[200vh] text-light text-center p-10">
        <h2 className="text-2xl font-bold">Sección 1</h2>
      </div>
      <div className="h-[200vh] text-light text-center p-10">
        <h2 className="text-2xl font-bold">Sección 2</h2>
      </div>
      <div className="h-[200vh] text-light text-center p-10">
        <h2 className="text-2xl font-bold">Sección 3</h2>
      </div>
    </div>
  );
};

export default ScrollableContent;
