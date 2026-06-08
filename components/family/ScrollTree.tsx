"use client";

import { motion } from "framer-motion";
import MemberCard from "./MemberCard";
import { FamilyMember } from "@/types/member";
import { useMemo } from "react";

interface ScrollTreeProps {
  members: FamilyMember[];
}

interface FamilyUnit {
  id: string;
  primary: FamilyMember;
  spouse?: FamilyMember;
  children: FamilyUnit[];
  level: number;
}

// Recursive branch node component
function FamilyBranchNode({ unit }: { unit: FamilyUnit }) {
  const { primary, spouse, children } = unit;

  // Reveal animations
  const nodeVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as any }
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Couple Card Container */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={nodeVariants}
        className="flex flex-col sm:flex-row gap-4 items-center justify-center relative z-10"
      >
        <MemberCard member={primary} />
        {spouse && <MemberCard member={spouse} />}
      </motion.div>

      {/* Children Connection Lines & Child Nodes */}
      {children.length > 0 && (
        <div className="flex flex-col items-center w-full mt-6">
          {/* Vertical line from parent couple */}
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: 28 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" as any }}
            className="w-0.5 bg-gradient-to-b from-gold to-gold/50"
          />

          {/* Children horizontal distribution / vertical stack on mobile */}
          <div className="flex flex-col md:flex-row justify-center items-center md:items-start w-full relative gap-10 md:gap-4 mt-1">
            {children.map((child, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === children.length - 1;
              const isSingle = children.length === 1;

              return (
                <div key={child.id} className="flex flex-col items-center relative px-2 md:px-4 w-full md:w-auto">
                  {/* Horizontal line segment - visible only on desktop */}
                  {!isSingle && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 hidden md:flex">
                      <div className={`w-1/2 ${isFirst ? 'transparent' : 'bg-gold/50'}`} />
                      <div className={`w-1/2 ${isLast ? 'transparent' : 'bg-gold/50'}`} />
                    </div>
                  )}

                  {/* Vertical line down to this child */}
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: 20 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, ease: "easeOut" as any, delay: 0.2 }}
                    className="w-0.5 bg-gold/50"
                  />

                  {/* Recursive branch node */}
                  <FamilyBranchNode unit={child} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScrollTree({ members }: ScrollTreeProps) {
  // Build recursive family units from flat list
  const familyForest = useMemo(() => {
    const visited = new Set<string>();
    const units: FamilyUnit[] = [];

    const findSpouseOf = (m: FamilyMember) => {
      if (m.spouseId) {
        return members.find(other => other.id === m.spouseId);
      }
      return members.find(other => other.spouseId === m.id);
    };

    const buildUnit = (primary: FamilyMember, level: number): FamilyUnit => {
      visited.add(primary.id);
      const spouse = findSpouseOf(primary);
      if (spouse) {
        visited.add(spouse.id);
      }

      // Children are members whose motherId or fatherId links to primary or spouse
      const childMembers = members.filter(m => 
        !visited.has(m.id) && (
          (m.fatherId === primary.id || (spouse && m.fatherId === spouse.id)) ||
          (m.motherId === primary.id || (spouse && m.motherId === spouse.id))
        )
      );

      // Sort children by birthDate (oldest first)
      childMembers.sort((a, b) => {
        return new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime();
      });

      const childrenUnits = childMembers.map(child => buildUnit(child, level + 1));

      return {
        id: `${primary.id}-${spouse?.id || 'none'}`,
        primary,
        spouse,
        children: childrenUnits,
        level
      };
    };

    // Determine roots: members who have no parents in this members list,
    // and whose spouse also has no parents in this members list (to keep couples together at root level).
    const isRoot = (m: FamilyMember) => {
      const hasFather = m.fatherId && members.some(p => p.id === m.fatherId);
      const hasMother = m.motherId && members.some(p => p.id === m.motherId);
      if (hasFather || hasMother) return false;

      const spouse = findSpouseOf(m);
      if (spouse) {
        const spouseHasFather = spouse.fatherId && members.some(p => p.id === spouse.fatherId);
        const spouseHasMother = spouse.motherId && members.some(p => p.id === spouse.motherId);
        if (spouseHasFather || spouseHasMother) return false;
      }

      return true;
    };

    // Sort: put males first to start the root node as the patriarch (Kuppaya Poojari)
    const roots = members.filter(isRoot).sort((a, b) => {
      if (a.gender === 'MALE' && b.gender !== 'MALE') return -1;
      if (a.gender !== 'MALE' && b.gender === 'MALE') return 1;
      return 0;
    });

    roots.forEach(root => {
      if (!visited.has(root.id)) {
        units.push(buildUnit(root, 0));
      }
    });

    // Fallback: pick up any disconnected components
    members.forEach(m => {
      if (!visited.has(m.id)) {
        units.push(buildUnit(m, 0));
      }
    });

    return units;
  }, [members]);

  // Extract the root patriarch + matriarch couple
  const rootUnit = familyForest[0];

  // Reveal animation configs
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as any }
    }
  };

  if (!rootUnit) {
    return (
      <div className="text-center py-12 text-slate-400">
        No family records found.
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 py-8 space-y-24">
      
      {/* GENERATION 1: The Founders */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="relative flex flex-col items-center"
      >
        <span className="text-gold uppercase tracking-[0.25em] text-xs font-semibold mb-6">
          First Generation • The Roots
        </span>
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-center text-white mb-12">
          Patriarch & Matriarch
        </h2>

        <div className="flex flex-col sm:flex-row gap-6 md:gap-8 justify-center items-center w-full">
          <MemberCard member={rootUnit.primary} />
          {rootUnit.spouse && <MemberCard member={rootUnit.spouse} />}
        </div>

        {/* Central timeline trunk going down from Founders */}
        {rootUnit.children.length > 0 && (
          <div className="w-full h-24 flex justify-center items-center overflow-visible mt-8">
            <svg className="w-1 h-full overflow-visible" viewBox="0 0 10 100">
              <motion.line
                x1="5"
                y1="0"
                x2="5"
                y2="100"
                stroke="#d4af37"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeInOut" as any }}
              />
            </svg>
          </div>
        )}
      </motion.section>

      {/* GENERATION 2: Sibling Branches */}
      {rootUnit.children.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="relative flex flex-col items-center space-y-16"
        >
          <div className="text-center">
            <span className="text-gold uppercase tracking-[0.25em] text-xs font-semibold mb-6 block">
              Second Generation • The Growth
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-center text-white">
              The Sibling Branches
            </h2>
            <p className="text-slate-400 text-sm mt-3 max-w-xl mx-auto">
              Follow each descendant of Kuppaya & Savithri to explore their growing families across generations.
            </p>
          </div>

          {/* List Sibling Branches Vertically to fit screen widths and make scroll smooth */}
          <div className="w-full space-y-28">
            {rootUnit.children.map((siblingUnit, idx) => (
              <div 
                key={siblingUnit.id}
                className="w-full border-t border-white/5 pt-16 flex flex-col items-center"
              >
                <div className="mb-10 text-center">
                  <span className="text-gold/60 text-[10px] uppercase tracking-widest font-mono font-bold block mb-1">
                    Branch {idx + 1}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    {siblingUnit.primary.name.split(" ")[0]}'s Family Branch
                  </h3>
                </div>

                <FamilyBranchNode unit={siblingUnit} />
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
