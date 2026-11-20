import React, { useEffect, useRef } from 'react';
import { useProgress } from '@react-three/drei';
import './LoadingScreen.css';

interface LoadingScreenProps {
  started: boolean;
  onStarted: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ started, onStarted }) => {
  const { active, progress } = useProgress();
  const hasTriggeredRef = useRef(false);

  const clampedProgress = Math.round(Math.min(100, Math.max(0, progress)));

  useEffect(() => {
    if (hasTriggeredRef.current) return;

    // Auto-enter once the 3D scene finishes loading (no extra click gate)
    if (progress >= 100 || (!active && progress === 0)) {
      const delay = progress >= 100 ? 320 : 1200;
      const timer = window.setTimeout(() => {
        if (!hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          onStarted();
        }
      }, delay);
      return () => window.clearTimeout(timer);
    }
  }, [active, progress, onStarted]);

  return (
    <div
      className={`loading-screen ${started ? 'loading-screen--hidden' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading 3D environment"
    >
      <div className="loading-screen__container">
        <div className="loading-screen__header">
          <span className="loading-screen__brand">GC // CORRIDOR_01</span>
          <span className="loading-screen__percent">
            {String(clampedProgress).padStart(3, '0')}%
          </span>
        </div>

        <div className="progress-bar" aria-hidden="true">
          <div
            className="progress-bar__value"
            style={{ transform: `scaleX(${Math.max(0.06, clampedProgress / 100)})` }}
          />
        </div>

        <p className="loading-screen__meta">
          {clampedProgress >= 100
            ? 'Pipeline ready — entering spatial viewport'
            : 'Initializing real-time PBR corridor & shaders'}
        </p>
      </div>
    </div>
  );
};
