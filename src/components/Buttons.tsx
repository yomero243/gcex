import React, { useEffect } from 'react';
import profilePic from '../assets/1764179662424.jpg';

export interface NavSectionItem {
  id: string;
  index: string;
  label: string;
  meta: string;
}

export const NAV_SECTIONS: NavSectionItem[] = [
  { id: 'home', index: '01', label: 'Overview', meta: 'Z +2.0m' },
  { id: 'about-me', index: '02', label: 'Profile', meta: 'Z -6.5m' },
  { id: 'projects', index: '03', label: 'Selected Work', meta: 'Z -18.5m' },
  { id: 'skills', index: '04', label: 'Capabilities', meta: 'Z -32.0m' },
  { id: 'cv', index: '05', label: 'Credentials & CV', meta: 'Z -45.0m' },
  { id: 'contact', index: '06', label: 'Contact', meta: 'Z -57.0m' },
];

interface ButtonsProps {
  id?: string;
  isOpen: boolean;
  activeSection: string;
  onNavigate: (section: string) => void;
  onClose?: () => void;
}

const Buttons: React.FC<ButtonsProps> = ({
  id = 'navigation-drawer',
  isOpen,
  activeSection,
  onNavigate,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = (sectionId: string) => {
    onNavigate(sectionId);
    onClose?.();
  };

  return (
    <>
      {/* Subtle scrim to dismiss drawer on outside click */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-20 bg-black/45 backdrop-blur-[2px] pointer-events-auto"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id={id}
        aria-label="Corridor section index"
        aria-hidden={!isOpen}
        className="hud-drawer fixed top-0 right-0 z-30 h-dvh w-[min(86dvw,20rem)] pointer-events-auto"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          visibility: isOpen ? 'visible' : 'hidden',
        }}
      >
        <div className="hud-drawer-inner hud-scroll flex h-dvh flex-col justify-between overflow-y-auto border-l border-white/12 bg-[#0a0d13]/92 backdrop-blur-xl shadow-[-24px_0_64px_rgba(0,0,0,0.65)]">
          <div className="px-5 pb-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45 mb-4 px-3">
              Corridor Index
            </p>

            <nav aria-label="Primary portfolio sections">
              <ul className="space-y-1.5">
                {NAV_SECTIONS.map(({ id: sectionId, index, label, meta }, idx) => {
                  const isActive = activeSection === sectionId;
                  return (
                    <li key={sectionId}>
                      <button
                        type="button"
                        tabIndex={isOpen ? 0 : -1}
                        aria-current={isActive ? 'location' : undefined}
                        onClick={() => handleSelect(sectionId)}
                        className={`group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left sidebar-btn cursor-pointer border ${
                          isActive
                            ? 'bg-[#e8a85c]/14 border-[#e8a85c]/45 text-white'
                            : 'border-transparent text-white/70 hover:bg-white/6 hover:text-white'
                        } ${isOpen ? 'sidebar-btn--open' : ''}`}
                        style={{
                          ['--delay' as string]: isOpen ? `${idx * 35}ms` : '0ms',
                        }}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span
                            className={`font-mono text-xs shrink-0 tabular-nums ${
                              isActive ? 'text-[#e8a85c]' : 'text-white/35 group-hover:text-white/65'
                            }`}
                          >
                            {index}
                          </span>
                          <span className="text-sm font-medium tracking-tight truncate">{label}</span>
                        </span>
                        <span className="font-mono text-[11px] text-white/35 shrink-0 whitespace-nowrap tabular-nums">
                          {meta}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="border-t border-white/10 p-5 space-y-4 shrink-0">
            <div className="flex items-center gap-3">
              <img
                alt="Gabriel Cerdio"
                src={profilePic}
                width={40}
                height={40}
                className="size-10 shrink-0 aspect-square rounded-full object-cover ring-1 ring-white/20"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">Gabriel Cerdio</p>
                <p className="font-mono text-[11px] text-white/55 truncate">
                  Full-Stack · AI &amp; 3D Web
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-white/55">
              <a
                href="https://github.com/yomero243"
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isOpen ? 0 : -1}
                className="hud-btn inline-flex items-center px-3 py-1.5 rounded border border-white/12 hover:border-[#e8a85c]/50 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/gabrielcerdio"
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isOpen ? 0 : -1}
                className="hud-btn inline-flex items-center px-3 py-1.5 rounded border border-white/12 hover:border-[#e8a85c]/50 hover:text-white transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="https://www.artstation.com/yomero243"
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isOpen ? 0 : -1}
                className="hud-btn inline-flex items-center px-3 py-1.5 rounded border border-white/12 hover:border-[#e8a85c]/50 hover:text-white transition-colors"
              >
                ArtStation
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Buttons;
