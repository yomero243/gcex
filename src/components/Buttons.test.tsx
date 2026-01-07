import { render, screen, fireEvent } from '@testing-library/react';
import Buttons from './Buttons';

describe('Buttons component', () => {
  const buttons = [
    { id: "home", label: "Home" },
    { id: "about-me", label: "About me" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "contact", label: "Contact" },
    { id: "cv", label: "CV" }
  ];

  it('should render all navigation buttons', () => {
    render(<Buttons isOpen={true} activeSection="home" onNavigate={() => { }} />);

    buttons.forEach(button => {
      expect(screen.getByText(button.label)).toBeInTheDocument();
    });
  });

  it('should call onNavigate with the correct section id when a button is clicked', () => {
    const onNavigate = vi.fn();
    render(<Buttons isOpen={true} activeSection="home" onNavigate={onNavigate} />);

    const projectsButton = screen.getByText('Projects');
    fireEvent.click(projectsButton);

    expect(onNavigate).toHaveBeenCalledWith('projects');
  });

  it('should apply active styles to the active button', () => {
    render(<Buttons isOpen={true} activeSection="projects" onNavigate={() => { }} />);

    const projectsButton = screen.getByText('Projects');
    expect(projectsButton.className).toContain('bg-white/25');
  });

  it('should not apply active styles to inactive buttons', () => {
    render(<Buttons isOpen={true} activeSection="projects" onNavigate={() => { }} />);

    const homeButton = screen.getByText('Home');
    expect(homeButton.className).not.toContain('bg-white/25');
  });
});
