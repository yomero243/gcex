import gsap from 'gsap';

export const SECTION_IDS = ['home', 'about-me', 'projects', 'skills', 'cv', 'contact'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export interface CameraWaypoint {
  x: number;
  y: number;
  z: number;
  lookX: number;
  lookY: number;
}

// Framing calibrated for the 75m Cycles-baked corridor (-Z) with editorial HUD on the left
export const CAMERA_WAYPOINTS: Record<SectionId, CameraWaypoint> = {
  home: { x: 0.35, y: 2.35, z: 2.0, lookX: -0.9, lookY: 2.15 },
  'about-me': { x: 1.05, y: 1.85, z: -6.5, lookX: -0.35, lookY: 1.9 },
  projects: { x: -0.35, y: 3.35, z: -18.5, lookX: 0.75, lookY: 2.55 },
  skills: { x: 1.1, y: 2.1, z: -32.0, lookX: -0.45, lookY: 2.2 },
  cv: { x: 0.15, y: 3.0, z: -45.0, lookX: 0.45, lookY: 2.35 },
  contact: { x: 0.65, y: 1.85, z: -57.0, lookX: -0.25, lookY: 2.0 },
};

export const getInterpolatedWaypoint = (p: number): CameraWaypoint => {
  const clamped = Math.max(0, Math.min(SECTION_IDS.length - 1, p));
  const i = Math.floor(clamped);
  const j = Math.min(i + 1, SECTION_IDS.length - 1);
  // Smoothstep easing between waypoints for cinematic glide
  const rawT = clamped - i;
  const t = rawT * rawT * (3 - 2 * rawT);

  const a = CAMERA_WAYPOINTS[SECTION_IDS[i]];
  const b = CAMERA_WAYPOINTS[SECTION_IDS[j]];

  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
    lookX: a.lookX + (b.lookX - a.lookX) * t,
    lookY: a.lookY + (b.lookY - a.lookY) * t,
  };
};

interface ScrollStore {
  targetProgress: number;    // Índice de sección objetivo (0 a 5)
  currentProgress: number;   // Posición suavizada por GSAP (0 a 5)
  isScrolling: boolean;
  maxProgress: number;
  motionPaused: boolean;     // Pausa animación ambiental (sway/polvo) — WCAG 2.2.2
  userPausedMotion: boolean; // Solo true si el usuario pulsó explícitamente "Pause motion"
  cameraZ: number;           // Telemetría en tiempo real de profundidad en el corredor
}

const getPrefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Prevent large frame-time jumps when returning from a background tab
gsap.ticker.lagSmoothing(500, 33);

export const scrollStore: ScrollStore = {
  targetProgress: 0,
  currentProgress: 0,
  isScrolling: false,
  maxProgress: SECTION_IDS.length - 1, // 6 secciones: home, about-me, projects, skills, cv, contact
  motionPaused: getPrefersReducedMotion(),
  userPausedMotion: false,
  cameraZ: 2,
};

let activeTween: gsap.core.Tween | null = null;
let snapCall: gsap.core.Tween | null = null;

const clampProgress = (value: number): number =>
  Math.max(0, Math.min(scrollStore.maxProgress, value));

export const cancelPendingSnap = () => {
  if (snapCall) {
    snapCall.kill();
    snapCall = null;
  }
};

interface ScrollTweenOptions {
  duration?: number;
  ease?: string;
}

/**
 * Anima suavemente scrollStore.currentProgress hacia un progreso objetivo usando GSAP.
 */
export const scrollToProgress = (target: number, options: ScrollTweenOptions = {}) => {
  cancelPendingSnap();

  const clamped = clampProgress(target);
  scrollStore.targetProgress = clamped;

  const reduced = getPrefersReducedMotion();
  const duration = reduced ? Math.min(options.duration ?? 0.28, 0.28) : (options.duration ?? 0.95);
  const ease = options.ease ?? 'power3.out';

  if (Math.abs(scrollStore.currentProgress - clamped) < 0.0005) {
    activeTween?.kill();
    activeTween = null;
    scrollStore.currentProgress = clamped;
    scrollStore.isScrolling = false;
    return;
  }

  scrollStore.isScrolling = true;
  activeTween = gsap.to(scrollStore, {
    currentProgress: clamped,
    duration,
    ease,
    overwrite: true,
    onComplete: () => {
      scrollStore.currentProgress = clamped;
      scrollStore.isScrolling = false;
      activeTween = null;
    },
  });
};

/**
 * Navega directamente a un índice de sección discreto (0..5) con glide cinematográfico GSAP.
 */
export const setScrollTarget = (index: number) => {
  scrollToProgress(Math.round(index), { duration: 1.0, ease: 'power3.out' });
};

/**
 * Navega directamente a una sección por su ID ('home', 'projects', etc.).
 */
export const scrollToSection = (sectionId: string) => {
  const idx = SECTION_IDS.indexOf(sectionId as SectionId);
  if (idx !== -1) {
    setScrollTarget(idx);
  }
};

/**
 * Incrementa o decrementa el objetivo continuo (rueda/touch) y agenda un snap suave al detenerse.
 */
export const updateScrollTarget = (delta: number) => {
  cancelPendingSnap();

  const nextTarget = clampProgress(scrollStore.targetProgress + delta);
  scrollStore.targetProgress = nextTarget;

  const reduced = getPrefersReducedMotion();
  scrollStore.isScrolling = true;

  activeTween = gsap.to(scrollStore, {
    currentProgress: nextTarget,
    duration: reduced ? 0.16 : 0.48,
    ease: 'power3.out',
    overwrite: true,
    onComplete: () => {
      scrollStore.isScrolling = false;
      activeTween = null;
    },
  });

  // Snap suave a la estación más cercana únicamente cuando termina el scroll del usuario
  snapCall = gsap.delayedCall(0.42, () => {
    snapCall = null;
    const nearest = Math.round(scrollStore.targetProgress);
    if (Math.abs(scrollStore.targetProgress - nearest) > 0.002) {
      scrollToProgress(nearest, { duration: 0.55, ease: 'power2.out' });
    }
  });
};

/**
 * Activa o pausa la animación ambiental de la escena 3D.
 */
export const setMotionPaused = (paused: boolean) => {
  scrollStore.motionPaused = paused;
  scrollStore.userPausedMotion = paused;
};
