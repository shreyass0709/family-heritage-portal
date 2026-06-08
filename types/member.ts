export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

export interface Achievement {
  year: string;
  title: string;
  description: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate: string;
  deathDate?: string | null;
  occupation?: string | null;
  education?: string | null;
  bio?: string | null;
  photo?: string | null;
  fatherId?: string | null;
  motherId?: string | null;
  spouseId?: string | null;
  timeline: TimelineEvent[];
  achievements: Achievement[];
}
