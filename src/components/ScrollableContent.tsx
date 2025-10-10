import React from 'react';

const ScrollableContent: React.FC<{ className?: string }> = ({ className }) => {
  const sections = [
    { id: 'inicio', title: '🏠 Entrada', content: 'Bienvenido al pasillo de mi portafolio 3D' },
    { id: 'sobre-mi', title: '👨‍💻 Sobre Mí', content: 'Primera estación: Conoce mi historia y experiencia' },
    { id: 'proyectos', title: '🚀 Proyectos', content: 'Segunda estación: Explora mis trabajos destacados' },
    { id: 'habilidades', title: '💪 Habilidades', content: 'Tercera estación: Mis tecnologías y competencias' },
    { id: 'contacto', title: '📧 Contacto', content: 'Cuarta estación: Conectemos y trabajemos juntos' },
    { id: 'cv', title: '📄 CV Completo', content: 'Final del pasillo: Descarga mi currículum completo' }
  ];

  return (
    <div className={`${className} flex flex-col items-center`}>
      {sections.map((section) => (
        <div key={section.id} className="h-[100vh] w-full flex items-center justify-center">
          <div className="w-1/2 p-10 rounded-lg bg-dark/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-light text-center">{section.title}</h2>
            <p className="text-light/80 mt-4 text-center">{section.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScrollableContent;
