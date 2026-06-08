"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Users, ImageIcon, BookOpen } from "lucide-react";
import ScrollIndicator from "./ScrollIndicator";

export default function Hero() {
  const { data: session } = useSession();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as any,
        stiffness: 50,
        damping: 15,
      },
    },
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://utfs.io/f/M2LT7AGQyPTZrOl2lgpIsVeqpnS6LZ7gwlNHaAYzt8hkK9WF"
          alt="Madubana Background"
          fill
          priority
          className="object-cover transform scale-105"
          style={{ filter: "brightness(0.4) contrast(1.1)" }}
        />
      </div>
      
      {/* Radial and Linear Gradients for Premium Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060913]/60 to-[#060913]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,9,19,0.1)_0%,rgba(6,9,19,0.9)_100%)]" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Subtitle */}
          <motion.span 
            variants={itemVariants}
            className="text-gold uppercase tracking-[0.3em] text-xs md:text-sm font-semibold mb-4 px-3 py-1 border border-gold/20 rounded-full bg-gold/5 backdrop-blur-sm"
          >
            Est. 2005 • Navunda
          </motion.span>

          {/* Title */}
          <motion.h1 
            variants={itemVariants}
            className="font-serif text-5xl md:text-8xl font-bold tracking-tight text-white mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          >
            Madubana <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-200 to-amber-500">
              Sadasyaru
            </span>
          </motion.h1>

          {/* Slogan */}
          <motion.p 
            variants={itemVariants}
            className="text-slate-300 text-lg md:text-2xl font-light tracking-wide max-w-2xl mb-12 font-serif italic"
          >
            "Rooted in History, Growing for Generations"
          </motion.p>

          {/* Call-to-actions */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md sm:max-w-none px-4"
          >
            {session ? (
              <>
                <Link
                  href="/family-tree"
                  className="flex items-center justify-center gap-3 w-full sm:w-auto text-black bg-gold hover:bg-amber-400 text-sm font-bold uppercase tracking-wider px-8 py-4 rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all cursor-pointer font-sans"
                >
                  <Users size={18} />
                  Explore Family Tree
                </Link>
                
                <Link
                  href="/gallery"
                  className="flex items-center justify-center gap-3 w-full sm:w-auto text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-gold/30 text-sm font-bold uppercase tracking-wider px-8 py-4 rounded-lg backdrop-blur-sm transition-all cursor-pointer font-sans"
                >
                  <ImageIcon size={18} className="text-amber-400" />
                  View Gallery
                </Link>

                <Link
                  href="/family-book"
                  className="flex items-center justify-center gap-3 w-full sm:w-auto text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-gold/30 text-sm font-bold uppercase tracking-wider px-8 py-4 rounded-lg backdrop-blur-sm transition-all cursor-pointer font-sans"
                >
                  <BookOpen size={18} className="text-amber-400" />
                  Family History
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center gap-3 w-full sm:w-auto text-black bg-gold hover:bg-amber-400 text-sm font-bold uppercase tracking-wider px-10 py-4 rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all cursor-pointer font-sans"
              >
                Login
              </Link>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Scroll Indicator */}
      <ScrollIndicator />
    </div>
  );
}
