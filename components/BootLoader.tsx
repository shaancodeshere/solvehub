'use client';

import React, { useState, useEffect, useRef } from 'react';

const STAGE1_LINES = [
  '// MOUNTING SOLVHUB ENGINE...',
  '// CALIBRATING CURRENCY MATRICES...',
  '// INITIALIZING ZERO-FRICTION CANVAS...',
  '// SYNCING LIVE LEDGER PARSER...',
  '// PREPARING RECEIPT EXPORT MODULE...',
  '// VERIFYING WORKSPACE INTEGRITY...',
];

const TYPEWRITER_TEXT = `// HANG TIGHT, BUILDER. THE WORKSPACE\nIS INITIALIZING. ZERO SETUP FRICTION.\nINSTANT LEDGER MATH AHEAD..`;

export default function BootLoader() {
  const [isMounted, setIsMounted] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [visibleLineCount, setVisibleLineCount] = useState(1);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [centerOpacity, setCenterOpacity] = useState(0);
  const [centerText, setCenterText] = useState('( 00% )');
  const [typedCharCount, setTypedCharCount] = useState(0);

  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isExitingRef = useRef(false);

  useEffect(() => {
    // 1. Check if already booted in this session
    try {
      if (sessionStorage.getItem('solvehub_booted')) {
        setIsMounted(false);
        return;
      }
    } catch {
      // sessionStorage restricted / unavailable
    }

    // 2. Check for prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setVisibleLineCount(6);
      setActiveLineIndex(-1);
      setCenterOpacity(1);
      setCenterText('( DONE )');
      setTypedCharCount(TYPEWRITER_TEXT.length);

      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 300);

      const unmountTimer = setTimeout(() => {
        try {
          sessionStorage.setItem('solvehub_booted', 'true');
          document.documentElement.classList.add('solvehub-booted');
        } catch {}
        setIsMounted(false);
      }, 700);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(unmountTimer);
      };
    }

    // 3. Staggered 3-panel animation loop (~2.4s total)
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;

      // Stage 1: Left Column (0.0s - 1.2s)
      if (elapsed < 1100) {
        const lineIdx = Math.min(5, Math.floor(elapsed / 180));
        setVisibleLineCount(lineIdx + 1);
        setActiveLineIndex(lineIdx);
      } else {
        setVisibleLineCount(6);
        setActiveLineIndex(-1);
      }

      // Stage 2: Center Column (0.4s - 1.6s)
      if (elapsed < 400) {
        setCenterOpacity(0);
        setCenterText('( 00% )');
      } else if (elapsed < 1500) {
        setCenterOpacity(1);
        const progress = Math.min(100, Math.floor(((elapsed - 400) / 1100) * 100));
        const pad = progress < 10 ? `0${progress}` : `${progress}`;
        setCenterText(`( ${pad}% )`);
      } else if (elapsed < 1550) {
        setCenterOpacity(1);
        setCenterText('( 100% )');
      } else {
        setCenterOpacity(1);
        setCenterText('( DONE )');
      }

      // Stage 3: Right Column (0.8s - 2.0s)
      if (elapsed < 800) {
        setTypedCharCount(0);
      } else if (elapsed < 2000) {
        const charProgress = Math.min(
          TYPEWRITER_TEXT.length,
          Math.floor(((elapsed - 800) / 1200) * TYPEWRITER_TEXT.length)
        );
        setTypedCharCount(charProgress);
      } else {
        setTypedCharCount(TYPEWRITER_TEXT.length);
      }

      // Stage 4: Exit trigger at 2.2s (2200ms)
      if (elapsed >= 2200 && !isExitingRef.current) {
        isExitingRef.current = true;
        setIsExiting(true);
      }

      // Final unmount at 2.65s (2650ms)
      if (elapsed >= 2650) {
        try {
          sessionStorage.setItem('solvehub_booted', 'true');
          document.documentElement.classList.add('solvehub-booted');
        } catch {}
        setIsMounted(false);
        return;
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Allow user to skip immediately with Escape, Enter, or Space
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        if (!isExitingRef.current) {
          isExitingRef.current = true;
          setIsExiting(true);
          setTimeout(() => {
            try {
              sessionStorage.setItem('solvehub_booted', 'true');
              document.documentElement.classList.add('solvehub-booted');
            } catch {}
            setIsMounted(false);
          }, 400);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSkip = () => {
    if (!isExitingRef.current) {
      isExitingRef.current = true;
      setIsExiting(true);
      setTimeout(() => {
        try {
          sessionStorage.setItem('solvehub_booted', 'true');
          document.documentElement.classList.add('solvehub-booted');
        } catch {}
        setIsMounted(false);
      }, 400);
    }
  };

  if (!isMounted) return null;

  const currentTypedText = TYPEWRITER_TEXT.slice(0, typedCharCount);

  return (
    <div
      id="solvehub-bootloader"
      role="status"
      aria-label="System Initializing"
      aria-live="polite"
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999] bg-[#E8E2D5] text-[#1c5f27] flex items-center justify-center select-none overflow-hidden transition-all duration-400 ease-in-out cursor-default ${
        isExiting
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100 pointer-events-auto'
      }`}
    >
      <div className="w-full max-w-[1440px] mx-auto px-8 sm:px-16 grid grid-cols-1 md:grid-cols-3 items-center gap-8 py-6">
        {/* Stage 1 | Left Column: System Initialization Log */}
        <div className="flex flex-col gap-1 min-h-[140px] sm:min-h-[155px] justify-center text-left">
          {STAGE1_LINES.map((line, idx) => {
            const isVisible = visibleLineCount > idx;
            const isActive = activeLineIndex === idx;
            return (
              <div
                key={idx}
                className={`transition-opacity duration-150 ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <span
                  className={`font-mono text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1c5f27] text-[#E8E2D5] px-1.5 py-0.5 inline-block font-semibold shadow-xs'
                      : 'text-[#1c5f27] px-1.5 py-0.5 inline-block'
                  }`}
                >
                  {line}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stage 2 | Center Column: Progress Counter -> Status */}
        <div
          className="flex items-center justify-center min-h-[40px] transition-opacity duration-200 text-center font-mono font-bold text-sm sm:text-base tracking-widest text-[#1c5f27]"
          style={{ opacity: centerOpacity }}
        >
          <span>{centerText}</span>
        </div>

        {/* Stage 3 | Right Column: Typewriter Note + Blinking Block */}
        <div className="flex flex-col justify-center min-h-[64px] sm:min-h-[72px] text-left md:text-right">
          <p className="font-mono text-[11px] sm:text-xs leading-relaxed tracking-wider text-[#1c5f27] whitespace-pre-line">
            {currentTypedText}
            <span
              className="inline-block text-[#1c5f27] animate-pulse ml-0.5 font-bold"
              aria-hidden="true"
            >
              █
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
