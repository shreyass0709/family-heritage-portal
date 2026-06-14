"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function EntranceReveal({ initialShow = false }: { initialShow?: boolean }) {
  const { status } = useSession();
  const pathname = usePathname();
  
  // Initialize gates to closed (show = true) if server says so or if cookie says so
  const [show, setShow] = useState(() => {
    if (typeof window !== "undefined") {
      return initialShow || document.cookie.includes("showReveal=true");
    }
    return initialShow;
  });

  useEffect(() => {
    if (pathname === "/login") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(false);
      // Clear cookie immediately if we go back to login page
      document.cookie = "showReveal=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
      return;
    }

    if (status === "unauthenticated") {
      document.cookie = "showReveal=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
      setShow(false);
      return;
    }

    if (show && status === "authenticated") {
      // Clear the cookie so it doesn't trigger again
      document.cookie = "showReveal=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
      sessionStorage.setItem("hasShownWelcome", "true");
      
      const animTimer = setTimeout(() => {
        setShow(false);
      }, 2600); // 1.4s delay + 1.0s animation + 0.2s buffer

      return () => clearTimeout(animTimer);
    }
  }, [status, pathname, show]);

  if (!show || pathname === "/login") return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-none select-none">
      {/* Left Gate Panel */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: "-100%" }}
        transition={{ duration: 1.0, ease: [0.77, 0, 0.175, 1], delay: 1.4 }}
        className="absolute top-0 left-0 w-1/2 h-full bg-[#060913] border-r border-gold/15 shadow-[15px_0_30px_rgba(0,0,0,0.85)] pointer-events-auto flex items-center justify-end"
      >
        {/* Subtle Panel Textures / Ornaments */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-[1px] h-32 bg-gradient-to-b from-transparent via-gold/10 to-transparent" />
      </motion.div>

      {/* Right Gate Panel */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: "100%" }}
        transition={{ duration: 1.0, ease: [0.77, 0, 0.175, 1], delay: 1.4 }}
        className="absolute top-0 right-0 w-1/2 h-full bg-[#060913] border-l border-gold/15 shadow-[-15px_0_30px_rgba(0,0,0,0.85)] pointer-events-auto flex items-center justify-start"
      >
        {/* Subtle Panel Textures / Ornaments */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 w-[1px] h-32 bg-gradient-to-b from-transparent via-gold/10 to-transparent" />
      </motion.div>

      {/* Center Cinematic Branding */}
      <div className="relative z-10 flex flex-col items-center text-center pointer-events-none px-6">
        {/* Golden Radial Glow */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.2, 0.8], opacity: [0, 0.5, 0] }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute w-72 h-72 bg-gradient-to-r from-gold/25 to-amber-500/10 rounded-full blur-3xl"
        />

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 25, filter: "blur(10px)" }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [25, 0, 0, -20],
            filter: ["blur(10px)", "blur(0px)", "blur(0px)", "blur(10px)"],
          }}
          transition={{ duration: 1.8, times: [0, 0.2, 0.8, 1], ease: "easeInOut" }}
          className="font-serif text-5xl md:text-7xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-200 to-gold drop-shadow-[0_4px_15px_rgba(212,175,55,0.25)]"
        >
          ಮಧುಬನ
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: [0, 0.9, 0.9, 0], y: [15, 0, 0, -10] }}
          transition={{ duration: 1.8, times: [0, 0.25, 0.8, 1], ease: "easeInOut", delay: 0.05 }}
          className="text-xs md:text-sm uppercase tracking-[0.35em] text-slate-300 font-sans mt-3.5"
        >
          ಸದಸ್ಯರು
        </motion.p>

        {/* Golden Divider */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: [0, 140, 140, 0], opacity: [0, 0.7, 0.7, 0] }}
          transition={{ duration: 1.8, times: [0, 0.2, 0.8, 1], ease: "easeInOut", delay: 0.1 }}
          className="h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mt-5"
        />
      </div>
    </div>
  );
}
