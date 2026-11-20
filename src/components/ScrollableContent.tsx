import React, { useEffect, useRef, useCallback, useId } from 'react';
import gsap from 'gsap';
import profilePic from '../assets/1764179662424.jpg';
import {
  scrollStore,
  updateScrollTarget,
  setScrollTarget,
  scrollToSection,
  cancelPendingSnap,
} from '../utils/scrollStore';
import { NAV_SECTIONS } from './Buttons';

// ===== TYPES =====

interface ProjectItem {
  title: string;
  role: string;
  period: string;
  impact: string;
  description: string;
  stack: string[];
  linkLabel?: string;
  linkUrl?: string;
}

interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  highlight: string;
}

interface EducationItem {
  title: string;
  institution: string;
  date: string;
}

interface SkillPillar {
  category: string;
  items: string[];
}

interface SocialLink {
  name: string;
  handle: string;
  url: string;
}

// ===== PORTFOLIO DATA =====

const HERO_METRICS = [
  { value: '-40%', label: 'Latency & Load Time' },
  { value: '+45%', label: 'PostgreSQL Queries' },
  { value: '92%', label: 'Automated Test Cov.' },
] as const;

const PROJECTS: ProjectItem[] = [
  {
    title: 'Duke Renders',
    role: 'Senior Full-Stack Engineer',
    period: '2024 — Current',
    impact: '-40% Latency · +45% SQL',
    description:
      'Built full-stack web apps and backend microservices in TypeScript, Next.js, React, Node.js, and Express. Cut API response and frontend load times by 40%, sped up PostgreSQL queries by 45% through indexing, and handled Kubernetes deployments with KEDA autoscaling, Headless Services, health checks, and observability. Also implemented custom MCP servers with pgvector RAG and CI/CD test suites (92% coverage).',
    stack: [
      'TypeScript',
      'Next.js',
      'Node.js',
      'Kubernetes / KEDA',
      'Headless Services',
      'Observability',
      'MCP Servers',
      'pgvector',
      'PostgreSQL',
    ],
  },
  {
    title: 'PhysicClaw-VEA',
    role: 'Creative Technologist & Platform Engineer',
    period: '2025 — 2026',
    impact: 'Multi-User WebGPU + AI',
    description:
      'Multi-user 3D web app with persistent per-user rooms, GraphQL mutations, and Supabase/PostgreSQL row-level security. Connected AI agents via an OpenClaw gateway (WhatsApp, Gemini embeddings, web search) with realtime state sync in Zustand and Three.js WebGPU.',
    stack: [
      'React',
      'TypeScript',
      'Three.js WebGPU',
      'Supabase',
      'PostgreSQL',
      'GraphQL',
      'Zustand',
    ],
    linkLabel: 'GitHub',
    linkUrl: 'https://github.com/yomero243',
  },
  {
    title: 'Interactive Financial Dashboard',
    role: 'Frontend & 3D Engineer',
    period: '2024',
    impact: 'WebXR + GLSL',
    description:
      'Real-time 3D financial dashboard pulling live data from REST APIs, built with modular TypeScript components, Three.js, WebXR support, and custom GLSL shaders.',
    stack: ['TypeScript', 'WebXR', 'Three.js', 'GLSL', 'REST API', 'GSAP'],
  },
  {
    title: 'CGTrader',
    role: 'Full-Stack & 3D Developer (Contract)',
    period: '2022 — 2023',
    impact: '-30% Processing Time',
    description:
      'Built automated TypeScript/Node.js data pipelines and Python validation scripts that cut processing cycles by 30%, along with React interfaces and web-optimized 3D PBR assets across U.S. time zones.',
    stack: ['TypeScript', 'Node.js', 'React', 'Python', 'REST APIs', 'Blender', 'glTF / PBR'],
    linkLabel: 'ArtStation',
    linkUrl: 'https://www.artstation.com/yomero243',
  },
];

const SKILL_PILLARS: SkillPillar[] = [
  {
    category: 'Backend, Kubernetes & AI',
    items: [
      'Kubernetes (Headless Services)',
      'KEDA',
      'Health Checks & Probes',
      'Observability',
      'Microservices',
      'MCP Servers',
      'LLM Tool Calling',
      'pgvector / RAG',
      'Node.js',
      'Express',
      'PostgreSQL',
      'Supabase (RLS)',
      'GraphQL',
      'REST APIs',
      'Python',
      'AWS (IAM, S3, EC2)',
    ],
  },
  {
    category: 'Frontend & Testing',
    items: [
      'TypeScript',
      'Next.js',
      'React',
      'Zustand',
      'Tailwind CSS',
      'Vite',
      'Flutter',
      'JWT / OAuth2',
      'Jest / Vitest',
      'React Testing Library',
      'CI/CD',
    ],
  },
  {
    category: '3D & Real-Time Web',
    items: [
      'Three.js',
      'React Three Fiber',
      'WebGPU',
      'WebGL',
      'WebXR',
      'GLSL',
      'GSAP',
      'Blender',
      'Unreal Engine',
      'Figma',
    ],
  },
];

const EXPERIENCE: ExperienceItem[] = [
  {
    role: 'Senior Full-Stack Engineer',
    company: 'Duke Renders · Remote',
    period: '2024 — Current',
    highlight:
      'TypeScript/Next.js/Node.js microservices (-40% latency & load time), Kubernetes deployments (KEDA, Headless Services, health checks & observability), custom MCP servers & pgvector RAG, PostgreSQL indexing (+45%), and CI/CD test suites (92% coverage).',
  },
  {
    role: 'Full-Stack & 3D Developer (Contract)',
    company: 'CGTrader (Freelance) · Remote',
    period: '2022 — 2023',
    highlight:
      'Automated TypeScript/Node.js pipelines (-30% processing time), React interfaces, Python validation scripts, and web-ready 3D asset workflows.',
  },
];

const EDUCATION: EducationItem[] = [
  {
    title: 'Bootcamp in Unreal Engine & Interactive Visualization',
    institution: 'UT-HUB',
    date: 'June 2023',
  },
  {
    title: "Bachelor's Degree in Architecture",
    institution: 'Instituto de Estudios Superiores A.C.',
    date: '2016 — 2020',
  },
];

const SOCIALS: SocialLink[] = [
  { name: 'GitHub', handle: '@yomero243', url: 'https://github.com/yomero243' },
  { name: 'LinkedIn', handle: '/in/gabrielcerdio', url: 'https://linkedin.com/in/gabrielcerdio' },
  { name: 'ArtStation', handle: '/yomero243', url: 'https://www.artstation.com/yomero243' },
];

const CONTACT_EMAIL = 'yo_mero_yo@hotmail.com';

// ===== ACCESSIBLE COPY ENGINE (Invoker Commands + Async Clipboard + VoiceOver dedup) =====

const copyTimers = new WeakMap<HTMLElement, number>();
let lastAnnouncement = '';

function reportCopyResult(button: HTMLElement, ok: boolean) {
  const tip = button.nextElementSibling as HTMLElement | null;
  const existingTimer = copyTimers.get(button);
  if (existingTimer) window.clearTimeout(existingTimer);

  button.removeAttribute('data-copied');
  button.removeAttribute('data-failed');

  let message = ok ? 'Copied' : 'Copy failed';
  // VoiceOver skips identical consecutive messages in the same live region
  if (message === lastAnnouncement) {
    message += '\u00A0';
  }
  lastAnnouncement = message;

  if (tip) tip.textContent = '';
  void button.offsetWidth;
  button.setAttribute(ok ? 'data-copied' : 'data-failed', '');

  if (tip) {
    window.requestAnimationFrame(() => {
      tip.textContent = message;
    });
  }

  copyTimers.set(
    button,
    window.setTimeout(() => {
      button.removeAttribute('data-copied');
      button.removeAttribute('data-failed');
      if (tip) tip.textContent = '';
    }, 2000)
  );
}

async function copyTargetText(button: HTMLElement, target: HTMLElement) {
  const text =
    target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
      ? target.value
      : (target.innerText || target.textContent || '').trim();
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    reportCopyResult(button, true);
  } catch {
    reportCopyResult(button, false);
  }
}

// ===== COMPONENT =====

interface ScrollableContentProps {
  className?: string;
  onSectionChange: (id: string) => void;
  onNavigate?: (id: string) => void;
  onOpenMenu?: () => void;
  activeSection: string;
}

const SECTION_IDS = NAV_SECTIONS.map((s) => s.id);

const ScrollableContent: React.FC<ScrollableContentProps> = ({
  className = '',
  onSectionChange,
  onNavigate,
  onOpenMenu,
  activeSection,
}) => {
  const itemsRef = useRef<(HTMLElement | null)[]>([]);
  const activeIndexRef = useRef(0);
  const depthReadoutRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const emailTargetId = useId();

  const goToSlide = useCallback((newIndex: number) => {
    const clampedIndex = gsap.utils.clamp(0, SECTION_IDS.length - 1, Math.round(newIndex));
    setScrollTarget(clampedIndex);
  }, []);

  const navigateToSection = useCallback(
    (id: string) => {
      if (onNavigate) {
        onNavigate(id);
      } else {
        scrollToSection(id);
        onSectionChange(id);
      }
    },
    [onNavigate, onSectionChange]
  );

  // Register Invoker Commands copy listener (with mutually-exclusive click fallback)
  useEffect(() => {
    const supportsInvokerCommands = 'CommandEvent' in window;

    if (supportsInvokerCommands) {
      const handleCommand = (event: Event) => {
        const cmdEvent = event as Event & {
          command?: string;
          source?: HTMLElement | null;
        };
        if (
          cmdEvent.command?.startsWith('--copy') &&
          cmdEvent.source instanceof HTMLElement &&
          cmdEvent.target instanceof HTMLElement
        ) {
          void copyTargetText(cmdEvent.source, cmdEvent.target);
        }
      };

      document.addEventListener('command', handleCommand, true);
      return () => document.removeEventListener('command', handleCommand, true);
    }

    const handleClickFallback = (event: MouseEvent) => {
      const targetEl = event.target;
      if (!(targetEl instanceof Element)) return;
      const button = targetEl.closest('button[command^="--copy"]');
      if (!(button instanceof HTMLElement)) return;
      const forId = button.getAttribute('commandfor');
      const copyTarget = forId ? document.getElementById(forId) : null;
      if (copyTarget) {
        void copyTargetText(button, copyTarget);
      }
    };

    document.addEventListener('click', handleClickFallback);
    return () => document.removeEventListener('click', handleClickFallback);
  }, []);

  // GSAP Ticker: syncs DOM section presentation & Z telemetry with GSAP-tweened scrollStore.currentProgress
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let lastRenderedProgress = Number.NaN;
    let lastRenderedZ = '';

    const updateFrame = () => {
      const p = scrollStore.currentProgress;

      // Live HUD telemetry without triggering React re-renders
      if (depthReadoutRef.current) {
        const z = scrollStore.cameraZ;
        const sign = z >= 0 ? '+' : '';
        const formattedZ = `Z ${sign}${z.toFixed(1)}m`;
        if (formattedZ !== lastRenderedZ) {
          lastRenderedZ = formattedZ;
          depthReadoutRef.current.textContent = formattedZ;
        }
      }

      // Skip redundant DOM style mutations when settled at the exact same progress
      if (Math.abs(p - lastRenderedProgress) < 0.00005) {
        return;
      }
      lastRenderedProgress = p;

      const currentIntIndex = Math.round(p);
      if (currentIntIndex !== activeIndexRef.current) {
        activeIndexRef.current = currentIntIndex;
        onSectionChange(SECTION_IDS[currentIntIndex]);
      }

      if (progressBarRef.current) {
        const ratio = p / (SECTION_IDS.length - 1);
        progressBarRef.current.style.transform = `scaleY(${Math.max(0.04, ratio).toFixed(4)})`;
      }

      // Compositor-only section presentation (transform + opacity only, crisp snap when resting)
      itemsRef.current.forEach((item, i) => {
        if (!item) return;
        const dist = i - p;
        const absDist = Math.abs(dist);
        const opacity = Math.max(0, 1 - absDist * 1.35);

        if (opacity <= 0.005) {
          item.style.opacity = '0';
          item.style.visibility = 'hidden';
          item.style.willChange = 'auto';
          item.dataset.active = 'false';
          item.setAttribute('aria-hidden', 'true');
          return;
        }

        const isInteractive = absDist < 0.35;
        const isSettled = absDist < 0.001;

        item.style.visibility = 'visible';
        item.dataset.active = isInteractive ? 'true' : 'false';
        item.style.zIndex = isInteractive ? '20' : '10';
        item.setAttribute('aria-hidden', isInteractive ? 'false' : 'true');

        if (isSettled) {
          item.style.opacity = '1';
          item.style.transform = 'none';
          item.style.willChange = 'auto';
        } else {
          const translateY = prefersReducedMotion ? 0 : dist * 32;
          const scale = prefersReducedMotion ? 1 : 1 - absDist * 0.03;
          item.style.opacity = opacity.toFixed(4);
          item.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
          item.style.willChange = 'transform, opacity';
        }
      });
    };

    // Paint initial frame immediately so Overview is visible without delay
    updateFrame();
    gsap.ticker.add(updateFrame);
    return () => {
      gsap.ticker.remove(updateFrame);
    };
  }, [onSectionChange]);

  // Smart wheel, touch, and keyboard navigation that respects scrollable card interiors
  useEffect(() => {
    let touchStartY = 0;

    const canInnerContainerScroll = (target: EventTarget | null, deltaY: number): boolean => {
      if (!(target instanceof Element)) return false;
      const scrollable = target.closest('.hud-scroll');
      if (!scrollable) return false;
      const maxScroll = scrollable.scrollHeight - scrollable.clientHeight;
      if (maxScroll <= 2) return false;
      if (deltaY > 0 && scrollable.scrollTop < maxScroll - 2) return true;
      if (deltaY < 0 && scrollable.scrollTop > 2) return true;
      return false;
    };

    const normalizeWheelDelta = (event: WheelEvent): number => {
      let delta = event.deltaY;
      if (event.deltaMode === 1) {
        delta *= 32; // DOM_DELTA_LINE
      } else if (event.deltaMode === 2) {
        delta *= window.innerHeight; // DOM_DELTA_PAGE
      }
      return Math.max(-180, Math.min(180, delta));
    };

    const handleWheel = (event: WheelEvent) => {
      const deltaY = normalizeWheelDelta(event);
      if (deltaY === 0) return;
      if (canInnerContainerScroll(event.target, deltaY)) return;
      event.preventDefault();
      updateScrollTarget(deltaY * 0.0014);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        touchStartY = event.touches[0].clientY;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const currentY = event.touches[0].clientY;
      const deltaY = touchStartY - currentY;
      touchStartY = currentY;
      if (canInnerContainerScroll(event.target, deltaY)) return;
      event.preventDefault();
      updateScrollTarget(deltaY * 0.0042);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault();
        goToSlide(Math.round(scrollStore.targetProgress) + 1);
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        goToSlide(Math.round(scrollStore.targetProgress) - 1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        goToSlide(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        goToSlide(SECTION_IDS.length - 1);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelPendingSnap();
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToSlide]);

  // Subtle ambient spotlight tracking on active HUD panel
  const handlePanelPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const panel = event.currentTarget;
    const rect = panel.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    panel.style.setProperty('--gradient-pos-x', `${x.toFixed(1)}%`);
    panel.style.setProperty('--gradient-pos-y', `${y.toFixed(1)}%`);
  }, []);

  const activeIdx = Math.max(0, SECTION_IDS.indexOf(activeSection));

  return (
    <main
      className={`${className} fixed inset-0 pointer-events-none`}
      aria-label="Portfolio sections"
    >
      {/* Bounded safe-area stage leaving top header, bottom mobile bar, and right 3D corridor clear */}
      <div className="relative w-full h-dvh">
        {/* ===== 01 · HERO / OVERVIEW (Unboxed editorial typography) ===== */}
        <section
          ref={(el) => {
            itemsRef.current[0] = el;
          }}
          aria-label="Overview"
          className="hud-stage-section lg:max-w-[36rem] opacity-0"
        >
          <div className="hud-scroll overflow-y-auto pr-1 space-y-3.5 sm:space-y-5">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#e8a85c]">
              <span className="whitespace-nowrap">01 // Overview</span>
              <span className="h-px w-6 sm:w-8 bg-[#e8a85c]/50 shrink-0" aria-hidden="true" />
              <span className="text-white/65 whitespace-nowrap">Mexico · Remote</span>
            </div>

            <h1
              className="font-display font-bold tracking-[-0.03em] text-white leading-[1.02]"
              style={{ fontSize: 'clamp(2rem, 1.25rem + 3.2vw, 4.5rem)' }}
            >
              Gabriel
              <br />
              <span className="text-white/75">Cerdio</span>
            </h1>

            <p className="text-sm sm:text-lg text-white/80 max-w-[48ch] leading-relaxed">
              <strong className="font-semibold text-white">
                Senior Full-Stack Engineer, Creative Technologist &amp; AI Platform Architect.
              </strong>{' '}
              6+ years building TypeScript, React, Next.js &amp; Node.js apps, Kubernetes services
              (KEDA, Headless, health checks &amp; observability), MCP/RAG tooling, and real-time
              3D with Three.js &amp; WebGPU.
            </p>

            {/* Proof-point telemetry strip */}
            <dl className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 border-t border-white/15 max-w-lg">
              {HERO_METRICS.map((metric) => (
                <div key={metric.label} className="space-y-0.5 min-w-0">
                  <dt className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-white/55 leading-tight">
                    {metric.label}
                  </dt>
                  <dd className="font-display text-sm sm:text-xl font-semibold text-white tabular-nums">
                    {metric.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Primary Actions */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigateToSection('projects')}
                className="hud-btn inline-flex items-center gap-2 rounded-lg bg-[#e8a85c] px-4 sm:px-5 py-2.5 text-sm font-semibold text-[#07080a] hover:bg-[#f2b974] cursor-pointer whitespace-nowrap"
              >
                <span>View Work</span>
                <span aria-hidden="true">→</span>
              </button>

              <a
                href="/GCO_CV.pdf"
                download
                className="hud-btn inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/6 px-4 sm:px-5 py-2.5 text-sm font-medium text-white hover:border-[#e8a85c]/60 hover:bg-white/10 whitespace-nowrap"
              >
                <span>Download CV</span>
                <span className="font-mono text-[11px] text-white/55">PDF</span>
              </a>
            </div>

            <p className="hidden md:block font-mono text-[11px] uppercase tracking-[0.18em] text-white/45 pt-1">
              Scroll or press ↑ / ↓ to traverse corridor
            </p>
          </div>
        </section>

        {/* ===== 02 · PROFILE / ABOUT ===== */}
        <section
          ref={(el) => {
            itemsRef.current[1] = el;
          }}
          aria-label="Profile"
          className="hud-stage-section lg:w-[34rem] opacity-0"
        >
          <article
            onPointerMove={handlePanelPointerMove}
            className="hud-panel rounded-2xl p-5 sm:p-8 flex flex-col gap-4 sm:gap-5"
          >
            <header className="flex items-start justify-between gap-3 sm:gap-4 border-b border-white/10 pb-3.5 sm:pb-4 shrink-0">
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8a85c]">
                  02 // Profile
                </p>
                <h2 className="mt-1 text-xl sm:text-3xl font-semibold text-white tracking-tight">
                  Background &amp; Focus
                </h2>
              </div>
              <img
                src={profilePic}
                alt="Gabriel Cerdio"
                width={56}
                height={56}
                className="size-12 sm:size-14 shrink-0 aspect-square rounded-full object-cover ring-2 ring-[#e8a85c]/40"
              />
            </header>

            <div className="hud-scroll overflow-y-auto pr-1 space-y-3.5 sm:space-y-4 text-sm sm:text-base text-white/80 max-w-[60ch]">
              <p>
                I studied <strong className="text-white font-medium">Architecture</strong> before
                spending the last 6+ years building web software. That mix led me to work on both
                clean frontend &amp; 3D interfaces (
                <strong className="text-white font-medium">TypeScript, React, Next.js, Three.js, WebGPU</strong>
                ) and solid backend services (
                <strong className="text-white font-medium">Node.js, PostgreSQL, REST &amp; GraphQL</strong>).
              </p>
              <p>
                Right now most of my time goes into backend and platform work: running microservices
                on <strong className="text-white font-medium">Kubernetes</strong> with{' '}
                <strong className="text-white font-medium">KEDA</strong> autoscaling,{' '}
                <strong className="text-white font-medium">Headless Services</strong>, proper{' '}
                <strong className="text-white font-medium">health checks</strong>, and{' '}
                <strong className="text-white font-medium">observability</strong>—alongside
                practical AI tooling like custom <strong className="text-white font-medium">MCP servers</strong>,
                tool calling, and <strong className="text-white font-medium">pgvector RAG</strong>.
              </p>
              <p>
                I care about keeping codebases straightforward, tested (Jest, Vitest, React Testing
                Library, CI/CD), and fast in production—whether it’s a backend API, a PostgreSQL
                query, or a 3D scene running smoothly in the browser.
              </p>
            </div>
          </article>
        </section>

        {/* ===== 03 · SELECTED WORK / PROJECTS ===== */}
        <section
          ref={(el) => {
            itemsRef.current[2] = el;
          }}
          aria-label="Selected Work"
          className="hud-stage-section lg:w-[37rem] opacity-0"
        >
          <article
            onPointerMove={handlePanelPointerMove}
            className="hud-panel rounded-2xl p-5 sm:p-7 flex flex-col gap-3.5 sm:gap-4"
          >
            <header className="flex items-end justify-between gap-3 border-b border-white/10 pb-3 sm:pb-3.5 shrink-0">
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8a85c]">
                  03 // Selected Work
                </p>
                <h2 className="mt-1 text-xl sm:text-3xl font-semibold text-white tracking-tight">
                  Projects &amp; Production Work
                </h2>
              </div>
              <span className="font-mono text-[11px] text-white/45 whitespace-nowrap shrink-0 tabular-nums">
                {PROJECTS.length} projects
              </span>
            </header>

            <div className="hud-scroll overflow-y-auto pr-1.5 sm:pr-2 space-y-3 sm:space-y-3.5">
              {PROJECTS.map((project) => (
                <div
                  key={project.title}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-4 space-y-2.5 hover:border-[#e8a85c]/35 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-white">
                        {project.title}
                      </h3>
                      <p className="font-mono text-[11px] text-white/55">
                        {project.role} · {project.period}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-[#e8a85c]/14 text-[#f2be7e] border border-[#e8a85c]/30 shrink-0 max-w-full">
                      {project.impact}
                    </span>
                  </div>

                  <p className="text-sm text-white/78 leading-relaxed">{project.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/6 text-white/75 border border-white/8"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {project.linkUrl && (
                      <a
                        href={project.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-[#7dd3fc] hover:text-white underline underline-offset-4 transition-colors shrink-0 whitespace-nowrap"
                      >
                        {project.linkLabel ?? 'View'} ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* ===== 04 · CAPABILITIES / SKILLS ===== */}
        <section
          ref={(el) => {
            itemsRef.current[3] = el;
          }}
          aria-label="Capabilities"
          className="hud-stage-section lg:w-[35rem] opacity-0"
        >
          <article
            onPointerMove={handlePanelPointerMove}
            className="hud-panel rounded-2xl p-5 sm:p-7 flex flex-col gap-4 sm:gap-5"
          >
            <header className="border-b border-white/10 pb-3 sm:pb-3.5 shrink-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8a85c]">
                04 // Capabilities
              </p>
              <h2 className="mt-1 text-xl sm:text-3xl font-semibold text-white tracking-tight">
                Tools &amp; Stack
              </h2>
            </header>

            <div className="hud-scroll overflow-y-auto pr-1 space-y-4 sm:space-y-5">
              {SKILL_PILLARS.map((pillar, idx) => (
                <div key={pillar.category} className="space-y-2">
                  <h3 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-white/70">
                    <span className="text-[#e8a85c] shrink-0 tabular-nums">0{idx + 1}</span>
                    <span>{pillar.category}</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {pillar.items.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-white/12 bg-white/[0.04] px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-white/88"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* ===== 05 · CREDENTIALS & CV ===== */}
        <section
          ref={(el) => {
            itemsRef.current[4] = el;
          }}
          aria-label="Credentials and CV"
          className="hud-stage-section lg:w-[35rem] opacity-0"
        >
          <article
            onPointerMove={handlePanelPointerMove}
            className="hud-panel rounded-2xl p-5 sm:p-7 flex flex-col gap-4 sm:gap-5"
          >
            <header className="border-b border-white/10 pb-3 sm:pb-3.5 shrink-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8a85c]">
                05 // Credentials & CV
              </p>
              <h2 className="mt-1 text-xl sm:text-3xl font-semibold text-white tracking-tight">
                Experience &amp; Education
              </h2>
            </header>

            <div className="hud-scroll overflow-y-auto pr-1 space-y-4 sm:space-y-5">
              <div className="space-y-3">
                <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-white/55">
                  Experience
                </h3>
                {EXPERIENCE.map((item) => (
                  <div
                    key={item.role}
                    className="border-l-2 border-[#e8a85c]/50 pl-3.5 space-y-1"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-semibold text-white text-sm sm:text-base">{item.role}</p>
                      <span className="font-mono text-[11px] text-white/50 whitespace-nowrap tabular-nums">
                        {item.period}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-[#e8a85c]/90">{item.company}</p>
                    <p className="text-sm text-white/75">{item.highlight}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-white/55">
                  Education
                </h3>
                <ul className="space-y-2.5">
                  {EDUCATION.map((edu) => (
                    <li key={edu.title} className="flex flex-wrap justify-between gap-1">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">{edu.title}</p>
                        <p className="text-xs text-white/65">{edu.institution}</p>
                      </div>
                      <span className="font-mono text-[11px] text-white/45 whitespace-nowrap tabular-nums">
                        {edu.date}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="font-mono text-xs text-[#7dd3fc]/90 pt-1">
                  Spanish (Native) · English (Upper-Intermediate) · Remote (UTC-6)
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
              <a
                href="/GCO_CV.pdf"
                download
                className="hud-btn inline-flex items-center gap-2 rounded-lg bg-[#e8a85c] px-4 sm:px-5 py-2.5 text-sm font-semibold text-[#07080a] hover:bg-[#f2b974] whitespace-nowrap"
              >
                <span>Download Full CV</span>
                <span className="font-mono text-[11px]">PDF</span>
              </a>
              <a
                href="/GCO_CV.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="hud-btn inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:border-white/40 whitespace-nowrap"
              >
                <span>Preview in Tab ↗</span>
              </a>
            </div>
          </article>
        </section>

        {/* ===== 06 · CONTACT ===== */}
        <section
          ref={(el) => {
            itemsRef.current[5] = el;
          }}
          aria-label="Contact"
          className="hud-stage-section lg:w-[34rem] opacity-0"
        >
          <article
            onPointerMove={handlePanelPointerMove}
            className="hud-panel rounded-2xl p-5 sm:p-8 flex flex-col gap-4 sm:gap-5"
          >
            <header className="border-b border-white/10 pb-3.5 sm:pb-4 shrink-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#e8a85c]">
                06 // Contact
              </p>
              <h2 className="mt-1 text-xl sm:text-3xl font-semibold text-white tracking-tight">
                Get in Touch
              </h2>
              <p className="mt-2 text-sm text-white/75">
                Open to Senior Full-Stack, AI / Platform (Kubernetes, KEDA, MCP), or Creative
                Technologist / 3D web roles — Remote or Hybrid (UTC-6).
              </p>
            </header>

            <div className="hud-scroll overflow-y-auto pr-1 space-y-4">
              {/* Email row with Invoker Commands accessible copy button */}
              <div className="rounded-xl border border-white/12 bg-white/[0.03] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-white/45">
                    Direct Email
                  </p>
                  <a
                    id={emailTargetId}
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="block text-sm sm:text-base font-medium text-white hover:text-[#e8a85c] transition-colors wrap-anywhere"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>

                <span className="copy-wrap shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    className="copy-btn hud-btn inline-flex items-center gap-1.5 rounded-lg border border-white/18 bg-white/8 px-3 py-1.5 font-mono text-xs text-white hover:border-[#e8a85c]/60 hover:bg-white/14 cursor-pointer whitespace-nowrap"
                    {...({ command: '--copy', commandfor: emailTargetId } as Record<string, string>)}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="copy-icon-default size-3.5 shrink-0"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      className="copy-icon-done size-3.5 shrink-0 text-emerald-400"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Copy email</span>
                  </button>
                  <span className="copy-tip" role="status" />
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-white/60 px-1">
                <span className="whitespace-nowrap">MEXICO · REMOTE / UTC-6</span>
                <span className="text-emerald-400 whitespace-nowrap">● IMMEDIATE AVAILABILITY</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {SOCIALS.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hud-btn flex flex-col justify-between rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2.5 sm:py-3 hover:border-[#e8a85c]/55 hover:bg-white/[0.08] min-w-0"
                  >
                    <span className="text-sm font-semibold text-white">{social.name} ↗</span>
                    <span className="font-mono text-[11px] text-white/50 truncate">
                      {social.handle}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </article>
        </section>
      </div>

      {/* ===== RIGHT-SIDE ARCHITECTURAL WAYPOINT RAIL (Desktop) ===== */}
      <nav
        aria-label="Corridor depth navigation"
        className="hidden md:flex fixed right-6 lg:right-10 top-1/2 -translate-y-1/2 z-20 flex-col items-end gap-4 pointer-events-auto"
      >
        <div className="flex items-center gap-3">
          <ul className="flex flex-col items-end gap-2.5">
            {NAV_SECTIONS.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    aria-current={isActive ? 'location' : undefined}
                    onClick={() => navigateToSection(section.id)}
                    className="group flex items-center gap-2.5 py-1 cursor-pointer text-right"
                  >
                    <span
                      className={`font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                        isActive
                          ? 'text-white font-semibold'
                          : 'text-white/40 group-hover:text-white/80'
                      }`}
                    >
                      {section.index} {section.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`block h-1.5 rounded-full transition-[width,background-color] duration-200 ${
                        isActive
                          ? 'w-6 bg-[#e8a85c]'
                          : 'w-2 bg-white/25 group-hover:w-3.5 group-hover:bg-white/60'
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Continuous depth progress hairline */}
          <div
            className="relative w-0.5 h-36 bg-white/12 rounded-full overflow-hidden"
            aria-hidden="true"
          >
            <div
              ref={progressBarRef}
              className="w-full h-full bg-[#e8a85c] origin-top"
              style={{ transform: 'scaleY(0.04)' }}
            />
          </div>
        </div>

        {/* Live Z-axis camera depth telemetry */}
        <span
          ref={depthReadoutRef}
          className="font-mono text-[11px] tracking-[0.14em] text-white/45 tabular-nums"
        >
          Z +2.0m
        </span>
      </nav>

      {/* ===== NATIVE-STYLE FLOATING MOBILE CAPSULE DOCK ===== */}
      <nav
        aria-label="Mobile section navigation"
        className="mobile-stepper flex md:hidden fixed z-20 items-center justify-between gap-1.5 rounded-full p-1.5 pointer-events-auto"
      >
        <button
          type="button"
          onClick={() => goToSlide(activeIdx - 1)}
          disabled={activeIdx === 0}
          aria-label="Previous section"
          className="mobile-dock-btn shrink-0 border border-white/10 bg-white/[0.06] text-white/85 disabled:opacity-25 cursor-pointer"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onOpenMenu}
          aria-label={`Current section: ${NAV_SECTIONS[activeIdx]?.label}. Open section index`}
          className="mobile-dock-center min-w-0 flex-1 flex flex-col items-center justify-center gap-1.5 px-3 py-1 cursor-pointer"
        >
          <span className="flex items-center justify-center gap-1.5 max-w-full">
            <span className="font-mono text-[10px] text-white/50 tabular-nums shrink-0">
              {String(activeIdx + 1).padStart(2, '0')}/{String(SECTION_IDS.length).padStart(2, '0')}
            </span>
            <span className="text-xs font-medium tracking-tight text-white truncate">
              {NAV_SECTIONS[activeIdx]?.label}
            </span>
          </span>

          <span className="flex items-center gap-1" aria-hidden="true">
            {NAV_SECTIONS.map((section, idx) => (
              <span
                key={section.id}
                className={`block h-1 rounded-full transition-[width,background-color] duration-200 ${
                  idx === activeIdx ? 'w-4 bg-[#e8a85c]' : 'w-1.5 bg-white/25'
                }`}
              />
            ))}
          </span>
        </button>

        <button
          type="button"
          onClick={() => goToSlide(activeIdx + 1)}
          disabled={activeIdx === SECTION_IDS.length - 1}
          aria-label="Next section"
          className="mobile-dock-btn shrink-0 border border-[#e8a85c]/40 bg-[#e8a85c]/16 text-[#f2be7e] disabled:border-white/10 disabled:bg-white/[0.05] disabled:text-white/40 disabled:opacity-30 cursor-pointer"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </nav>
    </main>
  );
};

export default ScrollableContent;
