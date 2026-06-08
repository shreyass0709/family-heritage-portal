"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Briefcase, GraduationCap, Calendar } from "lucide-react";
import { FamilyMember } from "@/types/member";
import Tilt from "@/components/ui/Tilt";

interface MemberCardProps {
  member: FamilyMember;
}

export default function MemberCard({ member }: MemberCardProps) {
  // Calculate age based on 2026 current date
  const calculateAge = (birthDateStr: string, deathDateStr?: string | null) => {
    const birth = new Date(birthDateStr);
    const end = deathDateStr ? new Date(deathDateStr) : new Date(2026, 5, 5);
    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(member.birthDate, member.deathDate);
  const isDeceased = !!member.deathDate;

  // Formatted birth/death years
  const birthYear = new Date(member.birthDate).getFullYear();
  const deathYear = member.deathDate ? new Date(member.deathDate).getFullYear() : null;

  return (
    <Tilt className="w-full max-w-sm rounded-xl">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full glass-panel glass-panel-hover rounded-xl overflow-hidden shadow-xl border border-white/10 hover:border-gold/30 transition-all duration-300"
      >
      <Link href={`/member/${member.id}`} className="block">
        {/* Photo Container */}
        <div className="relative h-60 w-full overflow-hidden bg-slate-800">
          {member.photo ? (
            <Image
              src={member.photo}
              alt={member.name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-110"
              sizes="(max-w-768px) 100vw, 384px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-slate-500">
              <User size={64} className="opacity-20 text-gold" />
            </div>
          )}
          
          {/* Deceased Badge */}
          {isDeceased && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded text-[10px] uppercase tracking-wider text-slate-300">
              In Loving Memory
            </div>
          )}

          {/* Generational Accent Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/50 via-gold to-gold/50" />
        </div>

        {/* Info Content */}
        <div className="p-6 flex flex-col space-y-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-white tracking-wide group-hover:text-gold transition-colors">
              {member.name}
            </h3>
            <p className="text-xs text-gold uppercase tracking-widest mt-1 flex items-center gap-1.5 font-medium">
              <Calendar size={12} />
              {birthYear} – {isDeceased ? deathYear : "Present"} ({age} yrs)
            </p>
          </div>

          <div className="space-y-2 text-sm text-slate-300">
            {member.occupation && (
              <div className="flex items-start gap-2.5">
                <Briefcase size={14} className="text-slate-400 mt-1 shrink-0" />
                <span className="line-clamp-1">{member.occupation}</span>
              </div>
            )}
            
            {member.education && (
              <div className="flex items-start gap-2.5">
                <GraduationCap size={14} className="text-slate-400 mt-1 shrink-0" />
                <span className="line-clamp-1 text-slate-400">{member.education}</span>
              </div>
            )}
          </div>

          {member.bio && (
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 pt-2 border-t border-white/5">
              {member.bio}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
    </Tilt>
  );
}
