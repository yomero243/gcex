import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(Observer);

const sections = [
  { 
    id: 'inicio', 
    title: 'Jose Gabriel Cerdio Oyarzabal', 
    content: 'Front-End Developer | 3D Artist | Three.js & WebXR Specialist' 
  },
  { 
    id: 'sobre-mi', 
    title: '👨‍💻 Sobre Mí', 
    content: 'Front-End Developer y 3D Artist comprometido con la excelencia e innovación, especializado en transformar ideas en soluciones digitales de alto impacto. Experto en crear interfaces interactivas y visualizaciones 3D en tiempo real usando Three.js, WebGL y WebXR para entregar experiencias inmersivas y de alto rendimiento.' 
  },
  { 
    id: 'proyectos', 
    title: '🚀 Experiencia', 
    content: 'Front End Developer (Actual) • 3D Engagement Revolution: Plataforma interactiva 3D con Three.js • Digital Efficiency: Arquitectura que redujo tiempos de carga 40% • UI Development: Interfaces para más de 40 aplicaciones con Three.js y WebXR • 3D Designer en Duke Renders (2024) • Freelance 3D Artist en CGTrader (Top Seller)' 
  },
  { 
    id: 'habilidades', 
    title: '💪 Habilidades Técnicas', 
    content: '3D Technologies: Three.js, WebXR, WebGL, Unreal Engine, 3D Modeling, Animation, Facial Mocap, Sequencer • Front-End: HTML5, CSS3, JavaScript • Tools: JIRA, SQL, PostgreSQL, Supabase • Certificación: AWS Cloud Practitioner' 
  },
  { 
    id: 'contacto', 
    title: '📧 Contacto', 
    content: '📞 +52 2223056478 • ✉️ yo_mero_yo@hotmail.com • 🔗 linkedin.com/in/gabrielcerdio' 
  },
  { 
    id: 'cv', 
    title: '📄 Educación', 
    content: 'Unreal Epic Bootcamp 2023 • UT-HUB (06/2023) • Licenciatura en Arquitectura • INSTITUTO DE ESTUDIOS SUPERIORES A.C (2016-2020) • Idiomas: Español (Nativo), Inglés (Competente)',
    downloadLink: '/ATS-Friendly CVEnglish.pdf'
  }
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
          // Use a more gradual scaling factor
          let scale = 1 - 0.15 * stt;
          scale = Math.max(0, scale); // Ensure scale is not negative
          // Use rem for translateY to be independent of viewport height
          transform = `translateY(${stt * 8}rem) scale(${scale}) perspective(16px) rotateY(-1deg)`;
          zIndex = -stt;
          filter = `blur(${stt * 2}px)`;
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
    <div className={`${className} fixed inset-0 grid place-items-center pointer-events-auto`}>
      <div className="relative">
        <div ref={sliderRef} className="relative h-[40vh] sm:h-[55vh] md:h-[65vh] lg:h-[70vh] w-[clamp(280px,90vw,550px)] [perspective:500px]" style={{ cursor: 'none' }}>
          {sections.map((section, index) => (
            <div
              key={section.id}
              ref={el => { itemsRef.current[index] = el! }}
              className="item absolute top-0 left-0 w-full h-full grid place-content-center text-xl sm:text-2xl md:text-3xl text-white opacity-0 p-4 sm:p-6 md:p-10 rounded-[15px] sm:rounded-[20px] md:rounded-[25px] border border-white/25 backdrop-blur-[10px] backdrop-saturate-120 overflow-hidden"
            >
              <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white text-center">{section.title}</h2>
              <p className="text-sm sm:text-base text-white/80 mt-4 text-center">{section.content}</p>
              {'downloadLink' in section && (
                <a
                  href={section.downloadLink}
                  download
                  className="mt-6 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                  onClick={(e) => e.stopPropagation()}
                >
                  📥 Descargar CV PDF
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollableContent;