"use client";

import { useState } from "react";
import { ListFilter, Network } from "lucide-react";
import ScrollTree from "@/components/family/ScrollTree";
import InteractiveTree from "@/components/family/InteractiveTree";
import { FamilyMember } from "@/types/member";

interface TreeContainerProps {
  initialMembers: FamilyMember[];
}

export default function TreeContainer({ initialMembers }: TreeContainerProps) {
  const [viewMode, setViewMode] = useState<"scroll" | "interactive">("scroll");

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <span className="text-gold uppercase tracking-[0.2em] text-xs font-semibold">
            Visual Storytelling
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mt-2">
            Madubana Sadasyaru Tree
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl">
            Explore our heritage across four generations. Choose between the Storytelling Scroll or the Zoomable Diagram.
          </p>
        </div>

        {/* View Switcher Toggle Buttons */}
        <div className="flex items-center bg-slate-900/80 border border-white/10 p-1 rounded-lg shrink-0 backdrop-blur-sm">
          <button
            onClick={() => setViewMode("scroll")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === "scroll"
                ? "bg-gold text-black shadow-md font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ListFilter size={14} />
            Story Scroll
          </button>
          
          <button
            onClick={() => setViewMode("interactive")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === "interactive"
                ? "bg-gold text-black shadow-md font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Network size={14} />
            Interactive Diagram
          </button>
        </div>
      </div>

      {/* Render View Mode */}
      <div className="mt-8">
        {viewMode === "scroll" ? (
          <ScrollTree members={initialMembers} />
        ) : (
          <InteractiveTree members={initialMembers} />
        )}
      </div>
    </div>
  );
}
