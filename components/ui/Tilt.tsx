"use client";

import React, { useRef, useState } from "react";

interface TiltProps {
  children: React.ReactNode;
  className?: string;
}

export default function Tilt({ children, className = "" }: TiltProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  const [glareStyle, setGlareStyle] = useState({ opacity: 0, left: 0, top: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to card center from -0.5 to 0.5
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;

    // Max rotation in degrees
    const maxRot = 10;
    const rotateX = -y * maxRot;
    const rotateY = x * maxRot;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    );

    const glareX = e.clientX - rect.left;
    const glareY = e.clientY - rect.top;

    setGlareStyle({
      opacity: 0.15,
      left: glareX,
      top: glareY,
    });
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlareStyle(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: "transform 0.15s ease-out, box-shadow 0.15s ease-out",
        transformStyle: "preserve-3d",
      }}
      className={`relative transition-all duration-300 hover:shadow-2xl hover:shadow-gold/10 overflow-hidden ${className}`}
    >
      {/* Glare/Sheen Reflection effect overlay */}
      <div
        className="absolute pointer-events-none rounded-full w-96 h-96 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300 blur-lg"
        style={{
          opacity: glareStyle.opacity,
          left: `${glareStyle.left}px`,
          top: `${glareStyle.top}px`,
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 80%)",
          mixBlendMode: "overlay",
          zIndex: 5,
        }}
      />

      {/* preserve-3d to enable nested depth elements */}
      <div style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </div>
  );
}
