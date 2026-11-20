import { useState, Suspense, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Experience from './components/Experience';
import Buttons from './components/Buttons';
import ScrollableContent from './components/ScrollableContent';
import { LoadingScreen } from './components/LoadingScreen';
import { scrollStore, setMotionPaused, scrollToSection } from './utils/scrollStore';

const CANVAS_DPR: [number, number] = [1, 2];
const CANVAS_GL = {
  powerPreference: 'high-performance' as const,
  antialias: true,
  toneMapping: THREE.ACESFilmicToneMapping,
  toneMappingExposure: 1.08,
};

const HOLD_PEEK_DELAY_MS = 180;
const HOLD_MOVE_TOLERANCE_PX = 10;
const INTERACTIVE_TARGET_SELECTOR =
  'a, button, input, textarea, select, label, summary, [role="button"], [role="link"]';

function App() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [started, setStarted] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [isMotionPaused, setIsMotionPaused] = useState(scrollStore.motionPaused);
  const [isScenePeek, setIsScenePeek] = useState(false);
  const isScenePeekRef = useRef(false);

  // Active navigation (Header logo, Drawer, CTA, Waypoint rail): updates highlight AND triggers GSAP scroll
  const handleNavigation = useCallback((section: string) => {
    setActiveSection(section);
    scrollToSection(section);
  }, []);

  // Passive sync from wheel/touch scrolling: updates UI highlight without fighting scrollStore
  const handleSectionSync = useCallback((section: string) => {
    setActiveSection(section);
  }, []);

  const handleStart = useCallback(() => {
    setStarted(true);
    window.setTimeout(() => {
      setShowLoader(false);
    }, 500);
  }, []);

  const handleToggleMotion = useCallback(() => {
    setIsMotionPaused((prev) => {
      const next = !prev;
      setMotionPaused(next);
      return next;
    });
  }, []);

  // Press-and-hold anywhere outside controls to fade out HUD panels & reveal the character/corridor
  useEffect(() => {
    if (showLoader || isMenuOpen) {
      isScenePeekRef.current = false;
      setIsScenePeek(false);
      return;
    }

    let holdTimer: number | null = null;
    let activePointerId: number | null = null;
    let activePointerType = '';
    let startX = 0;
    let startY = 0;

    const clearHoldTimer = () => {
      if (holdTimer !== null) {
        window.clearTimeout(holdTimer);
        holdTimer = null;
      }
    };

    const endPeek = () => {
      clearHoldTimer();
      activePointerId = null;
      activePointerType = '';
      if (isScenePeekRef.current) {
        isScenePeekRef.current = false;
        setIsScenePeek(false);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' ? event.button !== 0 : !event.isPrimary) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(INTERACTIVE_TARGET_SELECTOR)) return;

      clearHoldTimer();
      activePointerId = event.pointerId;
      activePointerType = event.pointerType;
      startX = event.clientX;
      startY = event.clientY;

      holdTimer = window.setTimeout(() => {
        holdTimer = null;
        if (activePointerId === null) return;
        isScenePeekRef.current = true;
        setIsScenePeek(true);
      }, HOLD_PEEK_DELAY_MS);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId || isScenePeekRef.current) return;
      if (Math.hypot(event.clientX - startX, event.clientY - startY) > HOLD_MOVE_TOLERANCE_PX) {
        endPeek();
      }
    };

    const handlePointerRelease = (event: PointerEvent) => {
      if (activePointerId === event.pointerId) {
        endPeek();
      }
    };

    const handleScrollWhilePending = () => {
      if (!isScenePeekRef.current && holdTimer !== null) {
        endPeek();
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      if (isScenePeekRef.current || (activePointerId !== null && activePointerType !== 'mouse')) {
        event.preventDefault();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerRelease, { passive: true });
    window.addEventListener('pointercancel', handlePointerRelease, { passive: true });
    window.addEventListener('scroll', handleScrollWhilePending, { capture: true, passive: true });
    window.addEventListener('blur', endPeek);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      endPeek();
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerRelease);
      window.removeEventListener('pointercancel', handlePointerRelease);
      window.removeEventListener('scroll', handleScrollWhilePending, true);
      window.removeEventListener('blur', endPeek);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [showLoader, isMenuOpen]);

  return (
    <div
      data-scene-peek={isScenePeek ? 'true' : 'false'}
      className="relative w-full h-dvh overflow-hidden bg-[#07080a] text-[#f4f4f6]"
    >
      {/* Real-time 3D Corridor Canvas */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <Canvas
          className="w-full h-full"
          dpr={CANVAS_DPR}
          gl={CANVAS_GL}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener(
              'webglcontextlost',
              (event) => {
                event.preventDefault();
              },
              false
            );
          }}
        >
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </Canvas>
      </div>

      {/* Subtle architectural vignette ensuring editorial contrast over the 3D scene */}
      <div
        className="viewport-vignette hud-peek-fade fixed inset-0 z-[5] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Architectural HUD Header */}
      <header className="hud-header hud-peek-fade fixed top-0 inset-x-0 z-30 pointer-events-none flex items-center justify-between gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => handleNavigation('home')}
          className="hud-btn pointer-events-auto group flex items-center gap-3 text-left cursor-pointer shrink-0 rounded-lg"
          aria-label="Gabriel Cerdio — back to overview"
        >
          <span className="flex size-10 sm:size-9 shrink-0 items-center justify-center rounded-lg border border-[#e8a85c]/55 bg-[#0a0d13]/80 font-mono text-xs font-semibold text-white group-hover:border-[#e8a85c] transition-colors">
            GC
          </span>
          <span className="hidden sm:block min-w-0">
            <span className="block font-display text-sm font-semibold tracking-wide text-white leading-tight">
              GABRIEL CERDIO
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
              Full-Stack · AI &amp; 3D Web
            </span>
          </span>
        </button>

        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="hidden lg:inline-flex items-center gap-2 rounded-full border border-white/12 bg-[#0a0d13]/75 backdrop-blur-md px-3.5 py-1.5 font-mono text-[11px] text-white/80 whitespace-nowrap">
            <span className="status-dot size-2 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
            <span>Available · Remote</span>
          </span>

          {/* WCAG 2.2.2 Pause / Play control for ambient 3D sway & particle motion */}
          <button
            type="button"
            onClick={handleToggleMotion}
            className="hidden md:inline-flex items-center justify-center hud-btn whitespace-nowrap shrink-0 rounded-lg border border-white/14 bg-[#0a0d13]/75 backdrop-blur-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white/75 hover:border-white/35 hover:text-white cursor-pointer"
          >
            {isMotionPaused ? 'Play motion' : 'Pause motion'}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-controls="navigation-drawer"
            className="hud-btn whitespace-nowrap shrink-0 rounded-lg border border-white/18 bg-[#0a0d13]/80 backdrop-blur-md px-3.5 sm:px-4 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-white hover:border-[#e8a85c]/65 cursor-pointer"
          >
            {isMenuOpen ? 'Close' : 'Index'}
          </button>
        </div>
      </header>

      {/* Slide-over Corridor Navigation Drawer */}
      <Buttons
        id="navigation-drawer"
        isOpen={isMenuOpen}
        activeSection={activeSection}
        onNavigate={handleNavigation}
        onClose={() => setMenuOpen(false)}
      />

      {/* Asymmetrical Editorial Content & Corridor Waypoints */}
      <ScrollableContent
        className="z-10 hud-peek-fade"
        onSectionChange={handleSectionSync}
        onNavigate={handleNavigation}
        onOpenMenu={() => setMenuOpen(true)}
        activeSection={activeSection}
      />

      {/* Branded Auto-Dismiss Preloader */}
      {showLoader && <LoadingScreen started={started} onStarted={handleStart} />}
    </div>
  );
}

export default App;
