import React from 'react';

interface ButtonsProps {
  isOpen: boolean;
  activeSection: string;
  onNavigate: (section: string) => void;
}

const Buttons: React.FC<ButtonsProps> = ({ isOpen, activeSection, onNavigate }) => {
  const getButtonClasses = (section: string): string => {
    return `block w-full text-left rounded-lg px-4 py-2 text-sm font-medium ${
      activeSection === section
  ? "bg-white/30 text-pakistan-green"
  : "text-gray-600 hover:bg-white/30 hover:text-pakistan-green"
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
      <div className="flex h-screen flex-col justify-between border-e border-gray-100 bg-white/30 backdrop-blur-[8px] w-64">
        <div className="px-4 py-6">
          <span className="grid h-10 w-32 place-content-center rounded-lg bg-gray-100/30 text-xs text-pakistan-green">
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

        <div className="sticky inset-x-0 bottom-0 border-t border-gray-100">
          <a href="#" className="flex items-center gap-2 bg-white/30 p-4 hover:bg-white/40">
            <img
              alt="Jose Gabriel Cerdio Oyarzabal"
              src="https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
              className="size-10 rounded-full object-cover"
            />

            <div>
              <p className="text-xs">
                <strong className="block font-medium">Jose Gabriel Cerdio Oyarzabal</strong>
                <span>j.g.cerdio@email.com</span>
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Buttons;
