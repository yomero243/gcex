import React, { useEffect, useRef, useCallback } from 'react';
import profilePic from '../assets/1764179662424.jpg';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(Observer);

// ===== TYPES =====

interface Project {
  title: string;
  description: string;
  livePreviewUrl?: string;
}

interface Education {
  title: string;
  institution: string;
  date: string;
}

interface Language {
  lang: string;
  level: string;
}

interface Social {
  name: string;
  url: string;
}

interface BaseSection {
  id: string;
  title: string;
}

interface HomeSection extends BaseSection {
  id: 'home';
  content: string;
}

interface AboutSection extends BaseSection {
  id: 'about-me';
  content: string;
}

interface ProjectsSection extends BaseSection {
  id: 'projects';
  projects: Project[];
}

interface SkillsSection extends BaseSection {
  id: 'skills';
  skills: Record<string, string[]>;
}

interface ContactSection extends BaseSection {
  id: 'contact';
  email: string;
  phone: string;
  socials: Social[];
}

interface CVSection extends BaseSection {
  id: 'cv';
  education: Education[];
  languages: Language[];
  downloadLink: string;
}

type Section =
  | HomeSection
  | AboutSection
  | ProjectsSection
  | SkillsSection
  | ContactSection
  | CVSection;

// ===== DATA =====

const sections: Section[] = [
  {
    id: 'home',
    title: 'Jose Gabriel Cerdio Oyarzabal',
    content: 'Front-End Developer | 3D Artist | Three.js & WebXR Specialist'
  },
  {
    id: 'about-me',
    title: 'About Me',
    content: 'Front-End Developer and 3D Artist committed to excellence and innovation, specialized in transforming ideas into high-impact digital solutions. Expert in creating interactive interfaces and real-time 3D visualizations using Three.js, WebGL, and WebXR to deliver immersive, high-performance experiences.'
  },
  {
    id: 'projects',
    title: 'Experience and Projects',
    projects: [
      {
        title: 'Air Hockey 3D (Web Game)',
        description: '3D Air Hockey game with real-time collision physics, made with Three.js.',
        livePreviewUrl: 'https://airhokey-3d.netlify.app/'
      },
      {
        title: '3D Engagement Platform',
        description: 'Interactive 3D platform for clients using Three.js to create immersive experiences.'
      },
      {
        title: 'Front-End Architecture Optimization',
        description: 'Re-architecture of Front-End systems, achieving a 40% reduction in loading times.'
      },
      {
        title: 'Freelance 3D Artist (Top Seller)',
        description: 'Top Seller 3D Artist on CGTrader, specializing in high-quality models for real-time applications.'
      }
    ]
  },
  {
    id: 'skills',
    title: 'Technical Skills',
    skills: {
      '3D Technologies': ['Three.js', 'WebXR', 'WebGL', 'Unreal Engine', '3D Modeling', 'Animation', 'Facial Mocap', 'Sequencer'],
      'Front-End': ['HTML5', 'CSS3', 'JavaScript', 'React', 'TailwindCSS'],
      'Tools': ['JIRA', 'SQL', 'PostgreSQL', 'Supabase', 'Git'],
      'Certifications': ['AWS Cloud Practitioner']
    }
  },
  {
    id: 'contact',
    title: 'Contact',
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
    title: 'Education',
    education: [
      {
        title: 'Unreal Epic Bootcamp 2023',
        institution: 'UT-HUB',
        date: '06/2023'
      },
      {
        title: 'Bachelor of Architecture',
        institution: 'INSTITUTO DE ESTUDIOS SUPERIORES A.C',
        date: '2016-2020'
      }
    ],
    languages: [
      { lang: 'Spanish', level: 'Native' },
      { lang: 'English', level: 'Proficient C1' }
    ],
    downloadLink: '/ATS-Friendly CVEnglish.pdf'
  }
];

// ===== SECTION RENDERERS =====

const renderSectionContent = (section: Section) => {
  if (section.id === 'cv') {
    return (
      <div>
        <ul className="space-y-4">
          {section.education.map((edu, index) => (
            <li key={index}>
              <p className="font-semibold text-white">{edu.title}</p>
              <p className="text-base sm:text-lg text-white/70">{edu.institution}</p>
              <p className="text-sm text-white/50">{edu.date}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <h3 className="font-bold text-white text-lg sm:text-xl mb-2">Languages</h3>
          <ul className="space-y-2 text-base sm:text-lg">
            {section.languages.map((lang, index) => (
              <li key={index} className="flex justify-center space-x-2">
                <span>{lang.lang}:</span>
                <span className="font-semibold">{lang.level}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (section.id === 'skills') {
    return (
      <div className="w-full">
        {Object.entries(section.skills).map(([category, skillsList]) => (
          <div key={category} className="mb-4">
            <h3 className="font-bold text-white text-center text-lg sm:text-xl mb-3">{category}</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {skillsList.map((skill) => (
                <span key={skill} className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (section.id === 'projects') {
    return (
      <div className="w-full">
        {section.projects.map((project, index) => (
          <div key={index} className="mb-6 last:mb-0">
            <h3 className="font-bold text-white text-center text-lg sm:text-xl mb-2">{project.title}</h3>
            <p className="text-center text-base sm:text-lg mb-3">{project.description}</p>
            {project.livePreviewUrl && (
              <div className="text-center mt-4">
                <a
                  href={project.livePreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 text-base sm:text-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  Live Preview
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (section.id === 'contact') {
    return (
      <div className="w-full">
        <p className="mb-4">
          <a href={`mailto:${section.email}`} className="hover:text-white transition-colors">
            {section.email}
          </a>
        </p>
        <p className="mb-6">{section.phone}</p>
        <div className="flex justify-center items-center gap-4 flex-wrap">
          {section.socials.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/25 backdrop-blur-sm transition-all duration-300 hover:scale-105 text-base sm:text-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {social.name}
            </a>
          ))}
        </div>
      </div>
    );
  }

  return <p>{section.content}</p>;
};

// ===== COMPONENT =====

interface ScrollableContentProps {
  className?: string;
  onSectionChange: (id: string) => void;
  activeSection: string;
}

const ScrollableContent: React.FC<ScrollableContentProps> = ({ className, onSectionChange, activeSection }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);
  const activeIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);

  const goToSlide = useCallback((newIndex: number, duration = 1.0) => {
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
          let scale = 1 - 0.15 * stt;
          scale = Math.max(0, scale);
          transform = `translateY(${stt * 8}rem) scale(${scale}) perspective(16px)`;
          zIndex = -stt;
          filter = `blur(${stt * 0.5}px)`;
          opacity = stt > 2 ? 0 : 0.4;
        } else {
          stt = activeIndexRef.current - i;
          transform = `translateY(0) scale(${1 - 0.05 * stt}) perspective(16px)`;
          zIndex = -stt;
          filter = 'blur(2px)';
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
        ease: "power2.out",
        onComplete: () => {
          if (i === totalItems - 1) {
            isAnimatingRef.current = false;
          }
        }
      });
    });
  }, [onSectionChange]);

  useEffect(() => {
    const componentRoot = containerRef.current;
    const slider = sliderRef.current;
    const items = itemsRef.current;

    if (!slider || !items.length || !componentRoot) return;

    const observer = Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      preventDefault: true,
      tolerance: 15,
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
  }, [goToSlide]);

  useEffect(() => {
    goToSlide(0, 0);
  }, [goToSlide]);

  useEffect(() => {
    const targetIndex = sections.findIndex(s => s.id === activeSection);
    if (targetIndex !== -1 && targetIndex !== activeIndexRef.current) {
      goToSlide(targetIndex);
    }
  }, [activeSection, goToSlide]);

  const isProjectsActive = activeSection === 'projects';
  const isSkillsActive = activeSection === 'skills';

  const getContainerClasses = () => {
    if (isProjectsActive) {
      return 'h-[70vh] sm:h-[75vh] md:h-[80vh] lg:h-[85vh] w-[clamp(300px,90vw,700px)]';
    } else if (isSkillsActive) {
      return 'h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh] w-[clamp(280px,85vw,550px)]';
    } else {
      return 'h-[50vh] sm:h-[55vh] md:h-[65vh] lg:h-[70vh] w-[clamp(280px,85vw,550px)]';
    }
  };

  return (
    <div ref={containerRef} className={`${className} fixed inset-0 grid place-items-center pointer-events-auto`}>
      <div className="relative flex flex-col md:flex-row items-center">
        {/* Main Content Slider */}
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
              ref={el => { if (el) itemsRef.current[index] = el; }}
              className="item absolute top-0 left-0 w-full h-full flex flex-col items-center justify-start text-white opacity-0 pt-8 sm:pt-12 pb-6 px-4 sm:px-6 md:px-8 rounded-[15px] sm:rounded-[20px] md:rounded-[25px] border border-white/15 backdrop-blur-[4px] overflow-y-auto"
            >
              {section.id === 'home' && (
                <img
                  src={profilePic}
                  alt={section.title}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white/20 shadow-lg mb-6 flex-shrink-0"
                />
              )}
              <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4 flex-shrink-0">{section.title}</h2>

              <div className="w-full text-base sm:text-lg text-white/80 text-center flex-grow overflow-y-auto px-2">
                {renderSectionContent(section)}
              </div>

              {section.id === 'cv' && (
                <div className="mt-auto pt-4 flex-shrink-0">
                  <a
                    href={section.downloadLink}
                    download
                    className="mt-6 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 text-base sm:text-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Download CV
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Scroll Progress Bar (Responsive Dots) */}
        <div className="mt-8 md:mt-0 md:ml-10 flex flex-row md:flex-col items-center justify-center gap-6 py-4 px-6 md:py-10 md:px-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md z-30 pointer-events-auto shadow-2xl transition-all duration-300 hover:bg-white/10 hover:border-white/20">
          {sections.map((section, index) => (
            <button
              key={`dot-${section.id}`}
              onClick={() => goToSlide(index)}
              className="group relative flex items-center justify-center transition-all duration-200 active:scale-90"
              aria-label={`Go to ${section.title}`}
            >
              {/* Liquid Dot */}
              <div
                className={`
                  w-2 h-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
                  ${activeSection === section.id 
                    ? 'bg-white scale-[2.2] shadow-[0_0_20px_rgba(255,255,255,1)] blur-[0.2px]' 
                    : 'bg-white/20 group-hover:bg-white/90 group-hover:scale-[1.8] group-hover:blur-[0.5px]'}
                `}
              />
              
              {/* Liquid Label */}
              <span className="absolute bottom-full mb-4 md:bottom-auto md:left-full md:ml-6 px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 translate-y-2 md:translate-y-0 md:-translate-x-4 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300 pointer-events-none border border-white/20 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
                {section.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scroll Hint Indicator */}
      <div 
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/80 pointer-events-none transition-all duration-700 ${activeSection === sections[0].id ? 'opacity-100' : 'opacity-0 translate-y-4'}`}
        style={{ animation: activeSection === sections[0].id ? 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none' }}
      >
        <span className="text-[11px] uppercase tracking-[0.5em] font-black drop-shadow-lg">Scroll</span>
        <svg 
          className="w-6 h-6 drop-shadow-lg" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
};

export default ScrollableContent;
