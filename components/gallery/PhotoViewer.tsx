"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoItem {
  id: string;
  imageUrl: string;
  caption?: string | null;
}

interface PhotoViewerProps {
  photos: PhotoItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function PhotoViewer({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: PhotoViewerProps) {
  const currentPhoto = photos[currentIndex];

  const handlePrev = useCallback(() => {
    onNavigate((currentIndex - 1 + photos.length) % photos.length);
  }, [currentIndex, onNavigate, photos.length]);

  const handleNext = useCallback(() => {
    onNavigate((currentIndex + 1) % photos.length);
  }, [currentIndex, onNavigate, photos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, handlePrev, handleNext]);

  if (!currentPhoto) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
        {/* Close overlay click */}
        <div className="absolute inset-0 cursor-zoom-out" onClick={onClose} />

        {/* Top Header Actions */}
        <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-center pointer-events-none">
          <span className="text-slate-400 text-sm font-mono tracking-wider">
            {currentIndex + 1} / {photos.length}
          </span>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer pointer-events-auto"
          >
            <X size={20} />
          </button>
        </div>

        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-2 md:left-6 p-2.5 md:p-4 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors z-10 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Active Image Card */}
        <motion.div
          key={currentPhoto.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-5xl max-h-[80vh] w-[90vw] h-[80vh] flex items-center justify-center pointer-events-none"
        >
          <Image
            src={currentPhoto.imageUrl}
            alt={currentPhoto.caption || "Family photo"}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </motion.div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-2 md:right-6 p-2.5 md:p-4 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors z-10 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Bottom Caption Overlay */}
        {currentPhoto.caption && (
          <div className="absolute bottom-4 md:bottom-10 left-4 md:left-6 right-4 md:right-6 text-center max-w-2xl mx-auto z-10 pointer-events-none">
            <span className="inline-block px-4 md:px-5 py-2 md:py-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-xs md:text-sm text-slate-200 shadow-2xl">
              {currentPhoto.caption}
            </span>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}
