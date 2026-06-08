"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Position of the mouse/primary cursor
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth spring physics for the trailing ring
  const ringSpringConfig = { stiffness: 220, damping: 25, mass: 0.5 };
  const ringX = useSpring(mouseX, ringSpringConfig);
  const ringY = useSpring(mouseY, ringSpringConfig);

  // Additional trailing particles for the comet trail effect
  const trail1X = useSpring(mouseX, { stiffness: 180, damping: 22, mass: 0.4 });
  const trail1Y = useSpring(mouseY, { stiffness: 180, damping: 22, mass: 0.4 });

  const trail2X = useSpring(mouseX, { stiffness: 120, damping: 18, mass: 0.3 });
  const trail2Y = useSpring(mouseY, { stiffness: 120, damping: 18, mass: 0.3 });

  const trail3X = useSpring(mouseX, { stiffness: 80, damping: 14, mass: 0.2 });
  const trail3Y = useSpring(mouseY, { stiffness: 80, damping: 14, mass: 0.2 });

  useEffect(() => {
    // Detect touch capability
    const isTouch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    setIsTouchDevice(isTouch);

    // Hide default cursor on desktop only
    if (!isTouch) {
      document.body.classList.add("custom-cursor-active");
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        mouseX.set(touch.clientX);
        // Offset Y slightly above the finger so it's not hidden
        mouseY.set(touch.clientY - 45);
        if (!isVisible) setIsVisible(true);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const clientX = touch.clientX;
        const clientY = touch.clientY;

        mouseX.set(clientX);
        mouseY.set(clientY - 45); // Offset above the finger
        setIsVisible(true);

        // Add a tap ripple at the exact touch location (no offset)
        const newRipple = {
          id: Date.now() + Math.random(),
          x: clientX,
          y: clientY,
        };
        setRipples((prev) => [...prev, newRipple].slice(-3));
      }
    };

    const handleTouchEnd = () => {
      setIsVisible(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "A" ||
          target.tagName === "BUTTON" ||
          target.closest("a") ||
          target.closest("button") ||
          target.closest('[role="button"]') ||
          target.closest(".cursor-pointer"))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleTouchStartHover = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "A" ||
          target.tagName === "BUTTON" ||
          target.closest("a") ||
          target.closest("button") ||
          target.closest('[role="button"]') ||
          target.closest(".cursor-pointer"))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseover", handleMouseOver);

    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchstart", handleTouchStartHover, { passive: true });

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseover", handleMouseOver);

      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchstart", handleTouchStartHover);
    };
  }, [mouseX, mouseY, isVisible, isTouchDevice]);

  return (
    <>
      {/* 1. Trailing Outer Ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-gold pointer-events-none z-50 mix-blend-screen"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: isVisible ? (isTouchDevice ? 0.7 : 1) : 0,
          scale: isVisible ? (isHovered ? 1.5 : 1) : 0.4,
          backgroundColor: isHovered ? "rgba(212, 175, 55, 0.15)" : "rgba(212, 175, 55, 0)",
          borderColor: isHovered ? "rgba(212, 175, 55, 0.9)" : "rgba(212, 175, 55, 0.5)",
          boxShadow: isHovered ? "0 0 15px rgba(212, 175, 55, 0.3)" : "none",
        }}
        transition={{
          type: "spring",
          stiffness: isTouchDevice ? 250 : 350,
          damping: isTouchDevice ? 20 : 25,
          mass: 0.3,
        }}
      />

      {/* 2. Inner Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-gold rounded-full pointer-events-none z-50 mix-blend-screen shadow-[0_0_8px_#d4af37]"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? (isHovered ? 0.5 : 1) : 0.3,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 25,
        }}
      />

      {/* 3. Trailing Particles (Comet Trail) */}
      {/* Particle 1 */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-gold/70 rounded-full pointer-events-none z-40 mix-blend-screen shadow-[0_0_6px_rgba(212,175,55,0.4)]"
        style={{
          x: trail1X,
          y: trail1Y,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: isVisible ? 0.6 : 0,
          scale: isVisible ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 20,
        }}
      />

      {/* Particle 2 */}
      <motion.div
        className="fixed top-0 left-0 w-1 h-1 bg-gold/50 rounded-full pointer-events-none z-40 mix-blend-screen shadow-[0_0_4px_rgba(212,175,55,0.3)]"
        style={{
          x: trail2X,
          y: trail2Y,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: isVisible ? 0.4 : 0,
          scale: isVisible ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 160,
          damping: 16,
        }}
      />

      {/* Particle 3 */}
      <motion.div
        className="fixed top-0 left-0 w-0.5 h-0.5 bg-gold/30 rounded-full pointer-events-none z-40 mix-blend-screen"
        style={{
          x: trail3X,
          y: trail3Y,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: isVisible ? 0.2 : 0,
          scale: isVisible ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 12,
        }}
      />

      {/* 4. Tap Ripples (Centered at exact touch point) */}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="fixed top-0 left-0 w-16 h-16 rounded-full border-2 border-gold/60 pointer-events-none z-50 mix-blend-screen"
          style={{
            x: ripple.x,
            y: ripple.y,
            translateX: "-50%",
            translateY: "-50%",
            boxShadow: "0 0 10px rgba(212,175,55,0.2), inset 0 0 10px rgba(212,175,55,0.2)",
          }}
          initial={{ scale: 0.1, opacity: 0.9 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onAnimationComplete={() => {
            setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
          }}
        />
      ))}
    </>
  );
}

