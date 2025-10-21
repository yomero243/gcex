import { render, screen, fireEvent } from '@testing-library/react';
import Buttons from './Buttons';

describe('Buttons component', () => {
  const buttons = [
    { id: "inicio", label: "Inicio" },
    { id: "sobre-mi", label: "Sobre mí" },
    { id: "proyectos", label: "Proyectos" },
    { id: "habilidades", label: "Habilidades" },
    { id: "contacto", label: "Contacto" },
    { id: "cv", label: "CV" }
  ];

  it('should render all navigation buttons', () => {
    render(<Buttons isOpen={true} activeSection="inicio" onNavigate={() => {}} />);
    
    buttons.forEach(button => {
      expect(screen.getByText(button.label)).toBeInTheDocument();
    });
  });

  it('should call onNavigate with the correct section id when a button is clicked', () => {
    const onNavigate = vi.fn();
    render(<Buttons isOpen={true} activeSection="inicio" onNavigate={onNavigate} />);
    
    const proyectosButton = screen.getByText('Proyectos');
    fireEvent.click(proyectosButton);
    
    expect(onNavigate).toHaveBeenCalledWith('proyectos');
  });

  it('should apply active styles to the active button', () => {
    render(<Buttons isOpen={true} activeSection="proyectos" onNavigate={() => {}} />);
    
    const proyectosButton = screen.getByText('Proyectos');
    expect(proyectosButton.className).toContain('bg-white/25');
  });

  it('should not apply active styles to inactive buttons', () => {
    render(<Buttons isOpen={true} activeSection="proyectos" onNavigate={() => {}} />);
    
    const inicioButton = screen.getByText('Inicio');
    expect(inicioButton.className).not.toContain('bg-white/25');
  });
});
