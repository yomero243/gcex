import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(Observer);

const sections = [
  { id: 'inicio', title: '🏠 Entrada', content: 'Bienvenido al pasillo de mi portafolio 3D' },
  { id: 'sobre-mi', title: '👨‍💻 Sobre Mí', content: 'Primera estación: Conoce mi historia y experiencia' },
  { id: 'proyectos', title: '🚀 Proyectos', content: 'Segunda estación: Explora mis trabajos destacados' },
  { id: 'habilidades', title: '💪 Habilidades', content: 'Tercera estación: Mis tecnologías y competencias' },
  { id: 'contacto', title: '📧 Contacto', content: 'Cuarta estación: Conectemos y trabajemos juntos' },
  { id: 'cv', title: '📄 CV Completo', content: 'Final del pasillo: Descarga mi currículum completo' }
];

const ScrollableContent: React.FC<{ className?: string, onSectionChange: (id: string) => void, activeSection: string }> = ({ className, onSectionChange, activeSection }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);
  const activeIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);

  const goToSlide = useCallback((newIndex: number, duration = 0.8) => {
    const items = itemsRef.current;
    const totalItems = items.length;
    newIndex = gsap.utils.clamp(0, totalItems - 1, newIndex);

    if (isAnimatingRef.current && duration > 0) return;
    if (newIndex === activeIndexRef.current && duration > 0) return;

    isAnimatingRef.current = true;
    activeIndexRef.current = newIndex;
    onSectionChange(sections[newIndex].id);

    items.forEach((item, i) => {
      let transform, zIndex, filter, opacity;
      item.classList.remove('active');

      if (i === activeIndexRef.current) {
        transform = 'translateY(0) scale(1) perspective(16px) rotateY(0deg)';
        zIndex = 1;
        filter = 'none';
        opacity = 1;
        item.classList.add('active');
      } else {
        let stt;
        if (i > activeIndexRef.current) {
          stt = i - activeIndexRef.current;
          let scale = 1 - 0.3 * stt; // Default scale
          if (i === 4 || i === 5) {
            scale = 0.4; // Fixed smaller scale for "Contacto" and "CV"
          }
          scale = Math.max(0, scale); // Ensure scale is not negative
          transform = `translateY(${15 * stt}vh) scale(${scale}) perspective(16px) rotateY(-1deg)`;
          zIndex = -stt;
          filter = 'blur(5px)';
          opacity = stt > 2 ? 0 : 0.6;
        } else {
          stt = activeIndexRef.current - i;
          transform = `translateY(0) scale(${1 - 0.05 * stt}) perspective(16px) rotateY(0deg)`;
          zIndex = -stt;
          filter = 'blur(5px)';
          opacity = stt > 3 ? 0 : 0.4;
        }
      }

      gsap.to(item, {
        transform,
        zIndex,
        filter,
        opacity,
        duration,
        ease: "power3.inOut",
        onComplete: () => {
          if (i === totalItems - 1) {
            isAnimatingRef.current = false;
          }
        }
      });
    });
  }, [onSectionChange]);

  useEffect(() => {
    const componentRoot = document.querySelector<HTMLElement>(`.${className?.split(' ')[0]}`);
    const slider = sliderRef.current;
    const items = itemsRef.current;

    if (!slider || !items.length || !componentRoot) return;

    const observer = Observer.create({
      target: window, // Escuchar en toda la ventana
      type: "wheel,touch,pointer",
      preventDefault: true,
      onDown: () => goToSlide(activeIndexRef.current + 1),
      onUp: () => goToSlide(activeIndexRef.current - 1)
    });

    const handleMouseMove = (e: MouseEvent) => {
      const activeItem = items[activeIndexRef.current];
      if (!activeItem) return;
      const rect = activeItem.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      gsap.to(activeItem, {
        '--gradient-pos-x': `${(x / rect.width) * 100}%`,
        '--gradient-pos-y': `${(y / rect.height) * 100}%`,
        duration: 0.3,
        ease: "power1.out"
      });
    };

    const handleMouseLeave = () => {
      const activeItem = items[activeIndexRef.current];
      if (!activeItem) return;
      gsap.to(activeItem, {
        '--gradient-pos-x': '50%',
        '--gradient-pos-y': '50%',
        duration: 0.5,
        ease: "power2.out"
      });
    };

    componentRoot.addEventListener('mousemove', handleMouseMove);
    componentRoot.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      observer.kill();
      componentRoot.removeEventListener('mousemove', handleMouseMove);
      componentRoot.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [goToSlide, className]);

  useEffect(() => {
    goToSlide(0, 0);
  }, []); // Se ejecuta solo una vez al montar el componente

  useEffect(() => {
    const targetIndex = sections.findIndex(s => s.id === activeSection);
    if (targetIndex !== -1 && targetIndex !== activeIndexRef.current) {
      goToSlide(targetIndex);
    }
  }, [activeSection, goToSlide]);

  return (
    <div className={`${className} fixed inset-0 grid place-items-center z-10 pointer-events-auto`}>
      <div className="relative">
        <div ref={sliderRef} className="relative h-[30vh] sm:h-[55vh] md:h-[65vh] lg:h-[70vh] w-[clamp(320px,50vw,550px)] [perspective:1000px] cursor-grab">
          {sections.map((section, index) => (
            <div
              key={section.id}
              ref={el => { itemsRef.current[index] = el! }}
              className="item absolute top-0 left-0 w-full h-full grid place-items-center text-xl sm:text-2xl md:text-3xl text-white opacity-0 p-4 sm:p-6 md:p-10 rounded-[15px] sm:rounded-[20px] md:rounded-[25px] border border-white/25 backdrop-blur-[10px] backdrop-saturate-120 overflow-hidden"
            >
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center">{section.title}</h2>
              <p className="text-sm sm:text-base text-white/80 mt-4 text-center">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollableContent;