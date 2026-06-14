import prisma from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { User, Calendar, Briefcase, GraduationCap, Trophy, Clock, ArrowLeft } from "lucide-react";
import { TimelineEvent, Achievement, FamilyMember } from "@/types/member";

export const dynamic = "force-dynamic";

// Helper to calculate age relative to 2026
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

// Next.js App Router param types for dynamic parameters
interface MemberPageProps {
  params: Promise<{ id: string }>;
}

export default async function MemberProfilePage({ params }: MemberPageProps) {
  const { id } = await params;
  
  const dbMember = await prisma.familyMember.findUnique({
    where: { id },
  });

  if (!dbMember) {
    notFound();
  }

  const member: FamilyMember = {
    id: dbMember.id,
    name: dbMember.name,
    gender: dbMember.gender as "MALE" | "FEMALE",
    birthDate: dbMember.birthDate,
    deathDate: dbMember.deathDate,
    occupation: dbMember.occupation,
    education: dbMember.education,
    bio: dbMember.bio,
    photo: dbMember.photo,
    fatherId: dbMember.fatherId,
    motherId: dbMember.motherId,
    spouseId: dbMember.spouseId,
    timeline: dbMember.timeline ? JSON.parse(dbMember.timeline) : [],
    achievements: dbMember.achievements ? JSON.parse(dbMember.achievements) : [],
  };

  const age = calculateAge(member.birthDate, member.deathDate);
  const isDeceased = !!member.deathDate;
  
  // Format dates for readable display
  const birthFormatted = new Date(member.birthDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  
  const deathFormatted = member.deathDate 
    ? new Date(member.deathDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : null;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#060913] pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Back button */}
          <Link
            href="/family-tree"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-gold transition-colors text-sm font-semibold uppercase tracking-wider group cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Family Tree
          </Link>

          {/* Profile Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* LEFT COLUMN: Profile Info Card */}
            <div className="lg:col-span-1 flex flex-col items-center">
              <div className="w-full glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-2xl p-6 flex flex-col items-center text-center relative">
                
                {/* Decorative gold trim */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold/50 via-gold to-gold/50" />
                
                {/* Photo container */}
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-gold/30 shadow-xl bg-slate-800 mb-6 mt-4 shrink-0">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="192px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                      <User size={64} className="text-gold opacity-30" />
                    </div>
                  )}
                </div>

                <h2 className="font-serif text-3xl font-bold text-white tracking-wide leading-tight">
                  {member.name}
                </h2>
                
                <p className="text-gold font-mono text-xs uppercase tracking-widest mt-2 px-3 py-1 border border-gold/15 rounded-full bg-gold/5">
                  Generation {member.fatherId ? (member.name === "Shreyas Poojari" || member.name === "Priya Poojari" || member.name === "Rohan Poojari" || member.name === "Amit Nayak" || member.name === "Divya Nayak" ? "Three" : "Two") : "One"}
                </p>

                {isDeceased && (
                  <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded">
                    🕯️ In Loving Memory
                  </span>
                )}

                {/* Meta details list */}
                <div className="w-full text-left space-y-4 mt-8 border-t border-white/5 pt-6 text-sm text-slate-300">
                  
                  <div className="flex items-start gap-3.5">
                    <Calendar size={16} className="text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Born</p>
                      <p className="font-medium">{birthFormatted}</p>
                    </div>
                  </div>

                  {isDeceased && (
                    <div className="flex items-start gap-3.5">
                      <Calendar size={16} className="text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Passed Away</p>
                        <p className="font-medium">{deathFormatted}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3.5">
                    <Calendar size={16} className="text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Age</p>
                      <p className="font-medium">{age} Years Old {isDeceased ? "(Deceased)" : ""}</p>
                    </div>
                  </div>

                  {member.occupation && (
                    <div className="flex items-start gap-3.5">
                      <Briefcase size={16} className="text-gold shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Occupation</p>
                        <p className="font-medium">{member.occupation}</p>
                      </div>
                    </div>
                  )}

                  {member.education && (
                    <div className="flex items-start gap-3.5">
                      <GraduationCap size={16} className="text-gold shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Education</p>
                        <p className="font-medium">{member.education}</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Bio, Timeline, Achievements */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* About / Biography Section */}
              <div className="glass-panel border border-white/5 rounded-2xl p-8 space-y-4 shadow-xl">
                <h3 className="font-serif text-2xl font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
                  Biography & Life Story
                </h3>
                <p className="text-slate-300 leading-relaxed font-light text-base whitespace-pre-line">
                  {member.bio || `No detailed biography has been added for ${member.name} yet.`}
                </p>
              </div>

              {/* Timeline Section */}
              {member.timeline && member.timeline.length > 0 && (
                <div className="glass-panel border border-white/5 rounded-2xl p-8 shadow-xl">
                  <h3 className="font-serif text-2xl font-bold text-white border-b border-white/5 pb-6 flex items-center gap-2">
                    <Clock className="text-gold" size={20} />
                    Personal Timeline
                  </h3>
                  
                  {/* Vertical line timeline structure */}
                  <div className="relative border-l border-gold/20 ml-5 mt-8 space-y-10">
                    {member.timeline.map((event: TimelineEvent, idx: number) => (
                      <div key={idx} className="relative pl-8 group">
                        
                        {/* Interactive floating indicator dot */}
                        <div className="absolute -left-[8px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-gold group-hover:bg-gold transition-colors duration-300" />
                        
                        <div className="space-y-1.5">
                          <span className="font-mono text-xs font-bold uppercase tracking-wider text-gold">
                            {event.year}
                          </span>
                          <h4 className="font-serif text-lg font-bold text-white group-hover:text-gold transition-colors duration-200">
                            {event.title}
                          </h4>
                          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                            {event.description}
                          </p>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements Section */}
              {member.achievements && member.achievements.length > 0 && (
                <div className="glass-panel border border-white/5 rounded-2xl p-8 shadow-xl">
                  <h3 className="font-serif text-2xl font-bold text-white border-b border-white/5 pb-4 flex items-center gap-2">
                    <Trophy className="text-gold" size={20} />
                    Notable Achievements
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {member.achievements.map((ach: Achievement, idx: number) => (
                      <div
                        key={idx}
                        className="glass-panel p-5 rounded-xl border border-white/5 hover:border-gold/20 flex flex-col justify-between transition-colors shadow"
                      >
                        <div className="space-y-2">
                          <span className="font-mono text-[10px] font-bold text-gold/80 tracking-widest uppercase">
                            Achieved in {ach.year || "Lifetime"}
                          </span>
                          <h4 className="font-serif font-bold text-white text-base leading-snug">
                            {ach.title}
                          </h4>
                          <p className="text-xs text-slate-400 leading-normal">
                            {ach.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
