import { render, screen, fireEvent } from '@testing-library/react';
import Buttons, { NAV_SECTIONS } from './Buttons';

describe('Buttons component', () => {
  it('should render all navigation sections', () => {
    render(<Buttons isOpen={true} activeSection="home" onNavigate={() => {}} />);

    NAV_SECTIONS.forEach((section) => {
      expect(screen.getByText(section.label)).toBeInTheDocument();
    });
  });

  it('should call onNavigate with the correct section id when clicked', () => {
    const onNavigate = vi.fn();
    render(<Buttons isOpen={true} activeSection="home" onNavigate={onNavigate} />);

    const projectsButton = screen.getByRole('button', { name: /Selected Work/i });
    fireEvent.click(projectsButton);

    expect(onNavigate).toHaveBeenCalledWith('projects');
  });

  it('should mark the active button with aria-current="location"', () => {
    render(<Buttons isOpen={true} activeSection="projects" onNavigate={() => {}} />);

    const projectsButton = screen.getByRole('button', { name: /Selected Work/i });
    expect(projectsButton).toHaveAttribute('aria-current', 'location');
  });

  it('should not mark inactive buttons as active', () => {
    render(<Buttons isOpen={true} activeSection="projects" onNavigate={() => {}} />);

    const homeButton = screen.getByRole('button', { name: /Overview/i });
    expect(homeButton).not.toHaveAttribute('aria-current');
  });
});
