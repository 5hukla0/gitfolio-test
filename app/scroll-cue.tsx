"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const FADE_DISTANCE = 64;

function getScrollOffset() {
  return Math.max(
    window.scrollY,
    document.documentElement.scrollTop,
    document.body.scrollTop,
  );
}

export default function ScrollCue() {
  const [opacity, setOpacity] = useState(1);
  const frameRef = useRef<number | null>(null);
  const touchYRef = useRef<number | null>(null);

  useEffect(() => {
    const updateOpacity = () => {
      frameRef.current = null;
      setOpacity(Math.max(0, 1 - getScrollOffset() / FADE_DISTANCE));
    };

    const scheduleUpdate = () => {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(updateOpacity);
      }
    };

    const beginHiding = () => {
      setOpacity((current) => Math.min(current, 0.75));
      scheduleUpdate();
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 0) beginHiding();
      scheduleUpdate();
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY;
      if (
        currentY !== undefined &&
        touchYRef.current !== null &&
        currentY < touchYRef.current
      ) {
        beginHiding();
      }
      touchYRef.current = currentY ?? null;
      scheduleUpdate();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", "End", " "].includes(event.key)) {
        beginHiding();
      }
    };

    const observer = new IntersectionObserver(scheduleUpdate, {
      threshold: [0, 1],
    });
    const sentinel = document.querySelector("[data-scroll-cue-sentinel]");
    if (sentinel) observer.observe(sentinel);

    updateOpacity();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    document.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      document.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isHidden = opacity <= 0;

  return (
    <>
      <style>{`
        @keyframes scroll-cue-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-0.625rem); }
        }

        @keyframes scroll-cue-native-fade {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .scroll-cue-visibility {
          opacity: var(--scroll-cue-opacity, 1);
        }

        .scroll-cue-visibility[data-hidden="true"] {
          pointer-events: none;
          visibility: hidden;
        }

        .scroll-cue-motion {
          animation: scroll-cue-float 2.6s ease-in-out infinite;
        }

        @supports (animation-timeline: scroll()) {
          .scroll-cue-visibility {
            animation: scroll-cue-native-fade linear both;
            animation-timeline: scroll(root block);
            animation-range: 0 4rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scroll-cue-motion {
            animation: none;
          }
        }
      `}</style>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 size-px"
        data-scroll-cue-sentinel
      />
      <Link
        href="#work"
        aria-label="Scroll to projects"
        aria-hidden={isHidden}
        tabIndex={isHidden ? -1 : undefined}
        data-hidden={isHidden}
        data-scroll-cue
        className="scroll-cue-visibility group fixed bottom-4 right-3 z-40 flex items-center justify-center border border-cyan-500/30 bg-[#050510]/80 px-2 py-3 font-mono text-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.16)] backdrop-blur-sm transition-[border-color,box-shadow] hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400 sm:bottom-6 sm:right-5 md:bottom-8 md:right-8"
        style={
          {
            "--scroll-cue-opacity": opacity,
          } as React.CSSProperties
        }
      >
        <span className="scroll-cue-motion flex flex-col items-center gap-2">
          <span className="rotate-180 text-[10px] font-bold tracking-[0.28em] [writing-mode:vertical-rl]">
            SCROLL
          </span>
          <ArrowDownIcon className="size-4 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] transition-transform group-hover:translate-y-0.5" />
        </span>
      </Link>
    </>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}
