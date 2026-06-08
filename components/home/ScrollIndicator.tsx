"use client";

import { motion } from "framer-motion";

export default function ScrollIndicator() {
  const handleScroll = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <div 
      onClick={handleScroll}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer group"
    >
      <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400 group-hover:text-gold transition-colors font-sans font-medium">
        Scroll Down
      </span>
      <div className="w-[24px] h-[40px] border-2 border-slate-500 group-hover:border-gold rounded-full flex justify-center p-1 transition-all">
        <motion.div
          animate={{
            y: [0, 12, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-[6px] h-[6px] bg-slate-400 group-hover:bg-gold rounded-full transition-colors"
        />
      </div>
    </div>
  );
}
