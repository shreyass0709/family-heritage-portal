import prisma from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TreeContainer from "./TreeContainer";
import { FamilyMember } from "@/types/member";

export const revalidate = 0; // Dynamic server side generation

export default async function FamilyTreePage() {
  const dbMembers = await prisma.familyMember.findMany({
    orderBy: { birthDate: "asc" },
  });

  const members: FamilyMember[] = dbMembers.map((member) => ({
    id: member.id,
    name: member.name,
    gender: member.gender as any,
    birthDate: member.birthDate,
    deathDate: member.deathDate,
    occupation: member.occupation,
    education: member.education,
    bio: member.bio,
    photo: member.photo,
    fatherId: member.fatherId,
    motherId: member.motherId,
    spouseId: member.spouseId,
    timeline: member.timeline ? JSON.parse(member.timeline) : [],
    achievements: member.achievements ? JSON.parse(member.achievements) : [],
  }));

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#060913] pt-32 pb-24 px-6 md:px-12">
        <TreeContainer initialMembers={members} />
      </main>
      <Footer />
    </>
  );
}
