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
    title: 'Sobre Mí', 
    content: 'Front-End Developer y 3D Artist comprometido con la excelencia e innovación, especializado en transformar ideas en soluciones digitales de alto impacto. Experto en crear interfaces interactivas y visualizaciones 3D en tiempo real usando Three.js, WebGL y WebXR para entregar experiencias inmersivas y de alto rendimiento.' 
  },
  {
    id: 'proyectos',
    title: 'Experiencia y Proyectos',
    projects: [
      {
        title: 'Air Hockey 3D (Juego Web)',
        description: 'Juego de Air Hockey 3D con física de colisiones en tiempo real, hecho con Three.js.',
        livePreviewUrl: 'https://airhokey-3d.netlify.app/'
      },
      {
        title: 'Plataforma de Engagement 3D',
        description: 'Plataforma 3D interactiva para clientes usando Three.js para crear experiencias inmersivas.'
      },
      {
        title: 'Optimización de Arquitectura Front-End',
        description: 'Re-arquitectura de sistemas Front-End, logrando una reducción del 40% en tiempos de carga.'
      },
      {
        title: 'Artista 3D Freelance (Top Seller)',
        description: 'Artista 3D Top Seller en CGTrader, especializado en modelos de alta calidad para tiempo real.'
      }
    ]
  },
  { 
    id: 'habilidades', 
    title: 'Habilidades Técnicas',
    skills: {
      '3D Technologies': ['Three.js', 'WebXR', 'WebGL', 'Unreal Engine', '3D Modeling', 'Animation', 'Facial Mocap', 'Sequencer'],
      'Front-End': ['HTML5', 'CSS3', 'JavaScript', 'React', 'TailwindCSS'],
      'Tools': ['JIRA', 'SQL', 'PostgreSQL', 'Supabase', 'Git'],
      'Certifications': ['AWS Cloud Practitioner']
    }
  },
  {
    id: 'contacto',
    title: 'Contacto',
    email: 'yo_mero_yo@hotmail.com',
    phone: '+52 2223056478',
    socials: [
      { name: 'LinkedIn', url: 'https://linkedin.com/in/gabrielcerdio' },
      { name: 'GitHub', url: 'https://github.com/yomero243' },
      { name: 'ArtStation', url: 'https://www.artstation.com/yomero243' }
    ]
  },
  { 
    id: 'cv', 
    title: 'Educación',
    education: [
      {
        title: 'Unreal Epic Bootcamp 2023',
        institution: 'UT-HUB',
        date: '06/2023'
      },
      {
        title: 'Licenciatura en Arquitectura',
        institution: 'INSTITUTO DE ESTUDIOS SUPERIORES A.C',
        date: '2016-2020'
      }
    ],
    languages: [
      { lang: 'Español', level: 'Nativo' },
      { lang: 'Inglés', level: 'Proficient C1' }
    ],
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
      let transform, zIndex, filter, opacity, visibility;
      item.classList.remove('active');

      if (i === activeIndexRef.current) {
        transform = 'translateY(0) scale(1) perspective(16px)';
        zIndex = 1;
        filter = 'none';
        opacity = 1;
        visibility = 'visible';
        item.classList.add('active');
      } else {
        visibility = 'hidden';
        let stt;
        if (i > activeIndexRef.current) {
          stt = i - activeIndexRef.current;
          // Use a more gradual scaling factor
          let scale = 1 - 0.15 * stt;
          scale = Math.max(0, scale); // Ensure scale is not negative
          // Use rem for translateY to be independent of viewport height
          transform = `translateY(${stt * 8}rem) scale(${scale}) perspective(16px)`;
          zIndex = -stt;
          filter = `blur(${stt}px)`;
          opacity = stt > 2 ? 0 : 0.4;
        } else {
          stt = activeIndexRef.current - i;
          transform = `translateY(0) scale(${1 - 0.05 * stt}) perspective(16px)`;
          zIndex = -stt;
          filter = 'blur(5px)';
          opacity = 0;
        }
      }

      gsap.to(item, {
        transform,
        zIndex,
        filter,
        opacity,
        visibility,
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
      onDown: () => goToSlide(activeIndexRef.current - 1),
      onUp: () => goToSlide(activeIndexRef.current + 1)
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

  const isProjectsActive = activeSection === 'proyectos';
  const isSkillsActive = activeSection === 'habilidades';

  const getContainerClasses = () => {
    if (isProjectsActive) {
      return 'h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] w-[clamp(320px,95vw,700px)]';
    } else if (isSkillsActive) {
      return 'h-[60vh] sm:h-[55vh] md:h-[65vh] lg:h-[70vh] w-[clamp(280px,90vw,550px)]';
    } else {
      return 'h-[40vh] sm:h-[55vh] md:h-[65vh] lg:h-[70vh] w-[clamp(280px,90vw,550px)]';
    }
  };

  return (
    <div className={`${className} fixed inset-0 grid place-items-center pointer-events-auto`}>
      <div className="relative">
        <div 
          ref={sliderRef} 
          className={`
            ${getContainerClasses()}
            relative [perspective:500px] transition-all duration-500 ease-in-out
          `}
          style={{ cursor: 'none' }}
        >
          {sections.map((section, index) => (
            <div
              key={section.id}
              ref={el => { itemsRef.current[index] = el! }}
              className="item absolute top-0 left-0 w-full h-full flex flex-col items-center justify-start text-white opacity-0 pt-12 pb-6 px-4 sm:px-6 md:px-8 rounded-[15px] sm:rounded-[20px] md:rounded-[25px] border border-white/15 backdrop-blur-[8px] overflow-y-auto"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-4 flex-shrink-0">{section.title}</h2>
              
              <div className="w-full text-sm sm:text-base text-white/80 text-center flex-grow overflow-y-auto px-2">
                {(section as any).education ? (
                  <div>
                    <ul className="space-y-4">
                      {(section as any).education.map((edu: any, index: number) => (
                        <li key={index}>
                          <p className="font-semibold text-white">{edu.title}</p>
                          <p className="text-sm text-white/70">{edu.institution}</p>
                          <p className="text-xs text-white/50">{edu.date}</p>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <h3 className="font-bold text-white text-md sm:text-lg mb-2">Idiomas</h3>
                      <ul className="space-y-2 text-sm">
                        {(section as any).languages.map((lang: any, index: number) => (
                          <li key={index} className="flex justify-center space-x-2">
                            <span>{lang.lang}:</span>
                            <span className="font-semibold">{lang.level}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (section as any).skills ? (
                  <div className="w-full">
                    {Object.entries((section as any).skills).map(([category, skillsList]) => (
                      <div key={category} className="mb-4">
                        <h3 className="font-bold text-white text-center text-md sm:text-lg mb-3">{category}</h3>
                        <div className="flex flex-wrap justify-center gap-2">
                          {(skillsList as string[]).map((skill) => (
                            <span key={skill} className="bg-white/10 text-white px-3 py-1 rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (section as any).projects ? (
                  <div className="w-full">
                    {(section as any).projects.map((project: any, index: number) => (
                      <div key={index} className="mb-6 last:mb-0">
                        <h3 className="font-bold text-white text-center text-md sm:text-lg mb-2">{project.title}</h3>
                        <p className="text-center text-sm sm:text-base mb-3">{project.description}</p>
                        {project.livePreviewUrl && (
                          <div className="text-center mt-4">
                            <a
                              href={project.livePreviewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Ver Proyecto en Vivo
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (section as any).socials ? (
                  <div className="w-full">
                    <p className="mb-4">
                      <a href={`mailto:${(section as any).email}`} className="hover:text-white transition-colors">
                        {(section as any).email}
                      </a>
                    </p>
                    <p className="mb-6">
                      {(section as any).phone}
                    </p>
                    <div className="flex justify-center items-center gap-4 flex-wrap">
                      {(section as any).socials.map((social: any) => (
                        <a
                          key={social.name}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/25 backdrop-blur-sm transition-all duration-300 hover:scale-105 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {social.name}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p>{section.content}</p>
                )}
              </div>

              {'downloadLink' in section && (
                <div className="mt-auto pt-4 flex-shrink-0">
                  <a
                    href={(section as any).downloadLink}
                    download
                    className="mt-6 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📥 Descargar CV
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollableContent;