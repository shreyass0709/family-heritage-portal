"use client";

import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FamilyNode({ data }: any) {
  const isDeceased = !!data.deathDate;
  const birthYear = data.birthDate ? new Date(data.birthDate).getFullYear() : "";
  const deathYear = isDeceased ? new Date(data.deathDate).getFullYear() : "Present";

  return (
    <div className="glass-panel border border-gold/30 rounded-lg p-3 w-48 shadow-lg text-center hover:border-gold transition-colors">
      {/* Handles for React Flow connections */}
      {/* Top Handle - Parents link */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-gold border border-slate-900"
      />
      
      {/* Right Handle - Spouse right */}
      <Handle
        type="source"
        position={Position.Right}
        id="spouse-r"
        className="w-1.5 h-1.5 bg-amber-500 border border-slate-900"
      />

      {/* Left Handle - Spouse left */}
      <Handle
        type="target"
        position={Position.Left}
        id="spouse-l"
        className="w-1.5 h-1.5 bg-amber-500 border border-slate-900"
      />

      <Link href={`/member/${data.id}`} className="block">
        <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden mb-2 bg-slate-800 border-2 border-gold/40">
          {data.photo ? (
            <Image
              src={data.photo}
              alt={data.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
              <User size={24} className="text-gold opacity-50" />
            </div>
          )}
        </div>
        <h4 className="font-serif text-sm font-bold text-white leading-tight truncate">
          {data.name}
        </h4>
        {data.occupation && (
          <p className="text-[10px] text-slate-400 truncate mt-0.5">
            {data.occupation}
          </p>
        )}
        <p className="text-[9px] text-gold tracking-wider mt-1 font-mono">
          {birthYear} – {deathYear}
        </p>
      </Link>

      {/* Bottom Handle - Children link */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-gold border border-slate-900"
      />
    </div>
  );
}

export default memo(FamilyNode);
