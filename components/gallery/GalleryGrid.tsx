"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid, Eye } from "lucide-react";
import { Album } from "@/types/gallery";
import PhotoViewer from "./PhotoViewer";

interface GalleryGridProps {
  albums: Album[];
}

export default function GalleryGrid({ albums }: GalleryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  // Flatten photos with meta tags
  const allPhotos = albums.flatMap((album) =>
    album.photos.map((photo) => ({
      id: photo.id,
      imageUrl: photo.imageUrl,
      caption: photo.caption,
      albumId: album.id,
      albumTitle: album.title,
      category: album.category,
      familyGroup: album.familyGroup || "Full Family",
    }))
  );

  // Categories list
  const categories = ["All", "Weddings", "Birthdays", "Festivals", "Trips", "Recent"];
  // Family Groups list
  const groups = ["All", "Full Family", "Family A (Bangalore)", "Family B (Mangalore)"];

  // Filter photos
  const filteredPhotos = allPhotos.filter((photo) => {
    const categoryMatch = selectedCategory === "All" || photo.category === selectedCategory;
    const groupMatch =
      selectedGroup === "All" ||
      photo.familyGroup === selectedGroup ||
      (selectedGroup === "Full Family" && photo.familyGroup.includes("Full"));
    return categoryMatch && groupMatch;
  });

  return (
    <div className="space-y-12">
      {/* Filters Dashboard */}
      <div className="glass-panel border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row justify-between gap-6 shadow-xl">
        
        {/* Category Filters */}
        <div className="space-y-3">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
            Filter by Category
          </span>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-gold text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.15)]"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Group/Family Filters */}
        <div className="space-y-3">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
            Family Branch
          </span>
          <div className="flex flex-wrap gap-2">
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedGroup === grp
                    ? "bg-gold text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.15)]"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-white/5"
                }`}
              >
                {grp.replace(" (Bangalore)", "").replace(" (Mangalore)", "")}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Grid Display */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-20 bg-slate-950/20 border border-dashed border-white/5 rounded-2xl">
          <Grid size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-serif italic">No photos found matching your filter selection.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          <AnimatePresence>
            {filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="break-inside-avoid relative group glass-panel rounded-xl overflow-hidden shadow-lg border border-white/5 hover:border-gold/30 cursor-zoom-in transition-all"
                onClick={() => setViewerIndex(index)}
              >
                <div className="relative w-full aspect-auto min-h-[150px] overflow-hidden bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || "Family photo"}
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] uppercase tracking-wider font-semibold bg-gold text-black px-2 py-0.5 rounded">
                        {photo.category}
                      </span>
                      <Eye size={16} className="text-white opacity-80" />
                    </div>
                    
                    <div>
                      <p className="text-xs text-white leading-snug line-clamp-2 font-serif italic">
                        {photo.caption || "View Photo"}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest font-mono">
                        {photo.familyGroup}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Fullscreen Lightbox Photo Viewer */}
      {viewerIndex !== null && (
        <PhotoViewer
          photos={filteredPhotos}
          currentIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onNavigate={(index) => setViewerIndex(index)}
        />
      )}
    </div>
  );
}
