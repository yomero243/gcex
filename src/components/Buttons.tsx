import React from 'react';

interface ButtonsProps {
  isOpen: boolean;
  activeSection: string;
  onNavigate: (section: string) => void;
}

const Buttons: React.FC<ButtonsProps> = ({ isOpen, activeSection, onNavigate }) => {
  const getButtonClasses = (section: string): string => {
    return `block w-full text-left rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-300 ${
      activeSection === section
        ? "bg-white/25 border border-white/40 text-white" // Active state with more emphasis
        : "text-white/70 hover:bg-white/10 hover:text-white border border-transparent"
    }`;
  };

  const buttons = [
    { id: "inicio", label: "Inicio" },
    { id: "sobre-mi", label: "Sobre mí" },
    { id: "proyectos", label: "Proyectos" },
    { id: "habilidades", label: "Habilidades" },
    { id: "contacto", label: "Contacto" },
    { id: "cv", label: "CV" }
  ];

  return (
    <div
      className={`
        absolute top-0 right-0 h-screen
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
      style={{
        pointerEvents: 'auto',
      }}
    >
      {/* Applying liquid glass style here */}
      <div className="flex h-screen flex-col justify-between border-l border-white/25 bg-white/5 backdrop-blur-[25px] w-64 shadow-[0_15px_50px_rgba(0,0,0,0.4)]">
        <div className="px-4 py-6">
          <span className="grid h-10 w-32 place-content-center rounded-lg bg-white/10 text-xs text-white">
            GCEX
          </span>

          <ul className="mt-6 space-y-1">
            {buttons.map(({ id, label }) => (
              <li key={id}>
                <button
                  onClick={() => onNavigate(id)}
                  className={getButtonClasses(id)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="sticky inset-x-0 bottom-0 border-t border-white/25">
          <a href="#" className="flex items-center gap-2 p-4 hover:bg-white/10">
            <img
              alt="Jose Gabriel Cerdio Oyarzabal"
              src="https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
              className="size-10 rounded-full object-cover"
            />

            <div>
              <p className="text-xs text-white">
                <strong className="block font-medium">Jose Gabriel Cerdio Oyarzabal</strong>
                <span className="text-white/70">j.g.cerdio@email.com</span>
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Buttons;
