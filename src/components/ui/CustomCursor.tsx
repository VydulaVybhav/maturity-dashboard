'use client';

import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Check if hovering over clickable element
      const target = e.target as HTMLElement;
      const isClickable = target.closest('a, button, input, textarea, select') !== null;
      setIsHovering(isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Mouse glow effect */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.15), transparent 40%)`
        }}
      />

      {/* Custom cursor */}
      <div
        className="pointer-events-none fixed z-[9999]"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Small dot - always visible */}
        <div className={`rounded-full transition-all duration-200 ${
          isHovering ? 'opacity-0 scale-0' : 'w-2 h-2 bg-emerald-400'
        }`} />

        {/* Large circle - visible on hover */}
        <div className={`rounded-full border-2 border-emerald-400 bg-emerald-400/20 absolute inset-0 transition-all duration-200 ${
          isHovering ? 'w-12 h-12 -translate-x-5 -translate-y-5' : 'w-0 h-0 opacity-0'
        }`} />
      </div>
    </>
  );
}
