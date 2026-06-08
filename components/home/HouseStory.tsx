"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Tilt from "@/components/ui/Tilt";

export default function HouseStory() {
  const { data: session } = useSession();
  const [showMap, setShowMap] = useState(false);

  return (
    <section className="relative py-24 px-6 md:px-12 bg-gradient-to-b from-[#060913] to-[#04060c] overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Narrative Text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col space-y-6"
        >
          <span className="text-gold uppercase tracking-[0.2em] text-xs font-semibold">
            Our Home
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight">
            Madubana Sadasyaru: <br />
            <span className="text-gold">Where it All Began</span>
          </h2>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed font-light">
            Built in 2005 in the peaceful village of Navunda, this family home stands as a testament to the hard work and vision of Kelaginamane. Designed to provide comfort, space, and a strong sense of belonging, the house has been the heart of family gatherings and celebrations for many years.
          </p>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Over the years, it has witnessed countless memorable moments, from festivals and family functions to reunions that bring loved ones back home from cities such as Bangalore and Mumbai. More than just a building, the house represents the family's roots, traditions, and enduring bond. It continues to serve as a place where memories are created, stories are shared, and family values are passed on to future generations.
          </p>
          
          {session && (
            <div className="mt-4 p-5 rounded-xl bg-gold/5 border border-gold/20 backdrop-blur-sm space-y-3.5 animate-fade-in text-left">
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-xs font-bold uppercase tracking-widest text-gold flex items-center justify-between hover:text-amber-400 transition-colors w-full cursor-pointer"
              >
                <span>📍 House Location & Address</span>
                <span className="text-[10px] text-slate-400 font-sans normal-case font-normal">
                  {showMap ? "Hide Map ▲" : "View Map ▼"}
                </span>
              </button>
              
              <div className="space-y-1 text-sm text-slate-200">
                <p className="leading-relaxed font-light">
                  <strong>Address:</strong> Kelaginamane, Navunda, Kundapura Taluk, Udupi District, Karnataka - 576224
                </p>
                <p className="text-[10px] text-slate-400 italic font-mono pt-1">
                  * Note: Secured information visible to registered family members only.
                </p>
              </div>

              <AnimatePresence>
                {showMap && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 240 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full rounded-lg overflow-hidden border border-white/10 mt-3 shadow-inner"
                  >
                    <iframe
                      title="Ancestral House Map Location"
                      src="https://maps.google.com/maps?q=13.752446,74.645094&t=&z=15&ie=UTF8&iwloc=&output=embed"
                      width="100%"
                      height="100%"
                      style={{ 
                        border: 0, 
                        filter: "invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)" 
                      }}
                      allowFullScreen
                      loading="lazy"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Visual Frame */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Decorative Borders */}
          <div className="absolute -inset-4 border border-gold/20 rounded-2xl transform rotate-2 pointer-events-none" />
          
          {/* Main Card Frame */}
          <Tilt className="rounded-2xl w-full">
            <div className="relative glass-panel rounded-2xl p-4 overflow-hidden shadow-2xl border border-white/10 w-full">
              <div className="relative h-[300px] md:h-[450px] w-full rounded-lg overflow-hidden">
                <Image
                  src="https://utfs.io/f/M2LT7AGQyPTZrOl2lgpIsVeqpnS6LZ7gwlNHaAYzt8hkK9WF"
                  alt="Madubana"
                  fill
                  priority
                  className="object-cover transform hover:scale-105 transition-transform duration-700"
                  sizes="(max-w-768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                  <div>
                    <p className="font-serif italic text-gold text-lg">Madubana</p>
                    <p className="text-xs text-slate-300">Navunda, Karnataka, photographed in late afternoon sun.</p>
                  </div>
                </div>
              </div>
            </div>
          </Tilt>
        </motion.div>
      </div>
    </section>
  );
}
