const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Clear database
  await prisma.user.deleteMany({});
  await prisma.photo.deleteMany({});
  await prisma.album.deleteMany({});
  await prisma.storyChapter.deleteMany({});
  await prisma.familyMember.deleteMany({});

  // 2. Create users
  const adminEmail = process.env.ADMIN_EMAIL || "madubana2005@poojari.com";
  const adminRawPassword = process.env.ADMIN_PASSWORD || "Madubana@01012005";
  const adminPassword = bcrypt.hashSync(adminRawPassword, 12);
  const memberPassword = bcrypt.hashSync("Sadasyaru@01012005", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Shreyas Poojari",
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: "ADMIN",
      photo: "/images/shreyas.png",
    },
  });

  const member = await prisma.user.create({
    data: {
      name: "Shridhar Poojari",
      email: "sadasyaru@poojari.com",
      password: memberPassword,
      role: "MEMBER",
      photo: null,
    },
  });

  console.log("Users created.");

  // 3. Create family members
  // Generation 1 (Grandparents)
  const g1_father = await prisma.familyMember.create({
    data: {
      name: "Kuppaya Poojari",
      gender: "MALE",
      birthDate: "1918-08-15",
      deathDate: "1998-12-05",
      occupation: "Agriculturalist & Community Leader",
      education: "Traditional Education",
      bio: "Patriarch of the Poojari family. Known for his hard work, devotion to ancestral lands, and community leadership in Mangalore. He laid the foundation of values, respect, and unity that bind the family together today.",
      photo: "https://utfs.io/f/M2LT7AGQyPTZRtWjko3zJSuR4Q1YG2jpT03eX9qc7UFwsC5B",
      timeline: JSON.stringify([
        { year: "1918", title: "Birth", description: "Born in Mangalore, Karnataka." },
        { year: "1938", title: "Madubana Foundation", description: "Supervised the construction of the family ancestral Madubana house." },
        { year: "1944", title: "Marriage", description: "Married Savithri K Poojari in a traditional coastal ceremony." },
        { year: "1978", title: "Panchayat Leader", description: "Recognized for community dispute resolution and leading rural developmental works." },
        { year: "1998", title: "Passing", description: "Passed away peacefully, leaving behind a rich legacy." }
      ]),
      achievements: JSON.stringify([
        { year: "1975", title: "Krishi Ratna Award", description: "Awarded by the State for innovations in organic farming." },
        { year: "1988", title: "Community Service Honor", description: "Recognized for establishing the local village healthcare center." }
      ])
    }
  });

  const g1_mother = await prisma.familyMember.create({
    data: {
      name: "Savithri K Poojari",
      gender: "FEMALE",
      birthDate: "1925-05-10",
      deathDate: "2012-04-18",
      occupation: "Homemaker",
      education: "Primary Education",
      bio: "Matriarch of the Poojari family. A warm-hearted, loving grandmother who kept our ancestral home alive with traditional Mangalorean recipes, stories of ancestors, and unconditional love for her children and grandchildren.",
      photo: "https://utfs.io/f/M2LT7AGQyPTZEb2PGBhFYGzqZtnVd9JDlxN35p8cWaCQPToy",
      spouseId: g1_father.id,
      timeline: JSON.stringify([
        { year: "1925", title: "Birth", description: "Born in Udupi, Karnataka." },
        { year: "1944", title: "Marriage", description: "Married Kuppaya Poojari and moved to Madubana." },
        { year: "1949", title: "First Child", description: "Gave birth to eldest son, Shridhar." },
        { year: "2002", title: "Ancestral Recipe Documentation", description: "Preserved over 100+ traditional Tulu recipes for the family." },
        { year: "2012", title: "Passing", description: "Passed away leaving a legacy of warmth and love." }
      ]),
      achievements: JSON.stringify([
        { year: "1994", title: "Cultural Custodian", description: "Documented oral histories and traditions of coastal Tulu Nadu." }
      ])
    }
  });

  // Connect father to mother
  await prisma.familyMember.update({
    where: { id: g1_father.id },
    data: { spouseId: g1_mother.id }
  });

  // Generation 2
  // Child 1: Shridhar Poojari + Prabhavathi
  const shridhar = await prisma.familyMember.create({
    data: {
      name: "Shridhar Poojari",
      gender: "MALE",
      birthDate: "1949-11-20",
      occupation: "Retired Senior Bank Manager",
      education: "B.Com from Mangalore University",
      bio: "Eldest son of Kuppaya & Savithri. Served in banking for over 35 years and led rural micro-financing initiatives. Now lives in Mangalore and looks after the family properties.",
      photo: null,
      fatherId: g1_father.id,
      motherId: g1_mother.id,
      timeline: JSON.stringify([
        { year: "1949", title: "Born", description: "Born in Madubana." },
        { year: "1972", title: "Banking Career", description: "Joined the State Cooperative Bank as Officer." },
        { year: "1978", title: "Marriage", description: "Married Prabhavathi." },
        { year: "2009", title: "Retirement", description: "Retired as Senior Bank Manager with community honors." }
      ]),
      achievements: JSON.stringify([
        { year: "2005", title: "Banking Excellence Award", description: "Recognized for rural micro-finance deployment." }
      ])
    }
  });

  const prabhavathi = await prisma.familyMember.create({
    data: {
      name: "Prabhavathi",
      gender: "FEMALE",
      birthDate: "1958-03-15",
      occupation: "Homemaker",
      education: "High School",
      bio: "Wife of Shridhar. A pillar of strength who loves gardening, classical music, and preparing traditional festive feasts.",
      photo: null,
      spouseId: shridhar.id,
      timeline: JSON.stringify([
        { year: "1958", title: "Born", description: "Born in Chikmagalur." },
        { year: "1978", title: "Marriage", description: "Married Shridhar Poojari." }
      ]),
      achievements: JSON.stringify([])
    }
  });

  await prisma.familyMember.update({
    where: { id: shridhar.id },
    data: { spouseId: prabhavathi.id }
  });

  // Child 2: Nirmala Poojari + Shankar Poojari
  const nirmala = await prisma.familyMember.create({
    data: {
      name: "Nirmala Poojari",
      gender: "FEMALE",
      birthDate: "1953-04-12",
      occupation: "Retired High School Principal",
      education: "M.A. in History, B.Ed",
      bio: "Eldest daughter of Kuppaya & Savithri. Dedicated her life to child education and women's literacy. Set up local scholarship funds.",
      photo: null,
      fatherId: g1_father.id,
      motherId: g1_mother.id,
      timeline: JSON.stringify([
        { year: "1953", title: "Born", description: "Born in Madubana." },
        { year: "1975", title: "Marriage", description: "Married Shankar Poojari." },
        { year: "1998", title: "Principal Promotion", description: "Promoted to Principal of Mangalore Girls School." },
        { year: "2013", title: "Retirement", description: "Retired after 38 years in public education." }
      ]),
      achievements: JSON.stringify([
        { year: "2010", title: "Best Teacher Award", description: "State-level citation for contributions to women's literacy." }
      ])
    }
  });

  const shankar = await prisma.familyMember.create({
    data: {
      name: "Shankar Poojari",
      gender: "MALE",
      birthDate: "1948-02-18",
      occupation: "Business Owner",
      education: "Diploma in Mechanical Engineering",
      bio: "Husband of Nirmala. Ran a successful logistics and transport enterprise in Mangalore for over three decades.",
      photo: null,
      spouseId: nirmala.id,
      timeline: JSON.stringify([
        { year: "1948", title: "Born", description: "Born in Hubli." },
        { year: "1975", title: "Marriage", description: "Married Nirmala Poojari." }
      ]),
      achievements: JSON.stringify([])
    }
  });

  await prisma.familyMember.update({
    where: { id: nirmala.id },
    data: { spouseId: shankar.id }
  });

  // Child 3: Kalpana Poojari + Shekar Billava
  const kalpana = await prisma.familyMember.create({
    data: {
      name: "Kalpana Poojari",
      gender: "FEMALE",
      birthDate: "1956-07-05",
      occupation: "Senior Bank Officer",
      education: "B.A. in Economics",
      bio: "Second daughter of Kuppaya & Savithri. Active in managing retail credit portfolios, currently living in Bangalore.",
      photo: null,
      fatherId: g1_father.id,
      motherId: g1_mother.id,
      timeline: JSON.stringify([
        { year: "1956", title: "Born", description: "Born in Mangalore." },
        { year: "1982", title: "Marriage", description: "Married Shekar Billava." }
      ]),
      achievements: JSON.stringify([])
    }
  });

  const shekar = await prisma.familyMember.create({
    data: {
      name: "Shekar Billava",
      gender: "MALE",
      birthDate: "1950-05-14",
      occupation: "Agricultural Consultant",
      education: "B.Sc in Agriculture",
      bio: "Husband of Kalpana. Specializes in soil science and sustainable crop rotation, assisting local farms in Karnataka.",
      photo: null,
      spouseId: kalpana.id,
      timeline: JSON.stringify([
        { year: "1950", title: "Born", description: "Born in Shimoga." },
        { year: "1982", title: "Marriage", description: "Married Kalpana Poojari." }
      ]),
      achievements: JSON.stringify([])
    }
  });

  await prisma.familyMember.update({
    where: { id: kalpana.id },
    data: { spouseId: shekar.id }
  });

  // Child 4: Jayanthi Poojari + Madhava Poojari
  const jayanthi = await prisma.familyMember.create({
    data: {
      name: "Jayanthi Poojari",
      gender: "FEMALE",
      birthDate: "1960-09-30",
      occupation: "Classical Musician & Teacher",
      education: "BFA in Carnatic Music",
      bio: "Third daughter of Kuppaya & Savithri. Performs classical vocal and teaches Carnatic music to local students in Udupi.",
      photo: null,
      fatherId: g1_father.id,
      motherId: g1_mother.id,
      timeline: JSON.stringify([
        { year: "1960", title: "Born", description: "Born in Mangalore." },
        { year: "1986", title: "Marriage", description: "Married Madhava Poojari." }
      ]),
      achievements: JSON.stringify([
        { year: "2015", title: "Sangeet Kala Award", description: "Awarded for teaching classical music to underprivileged children." }
      ])
    }
  });

  const madhava = await prisma.familyMember.create({
    data: {
      name: "Madhava Poojari",
      gender: "MALE",
      birthDate: "1955-08-11",
      occupation: "Civil Engineer",
      education: "B.E. in Civil Engineering",
      bio: "Husband of Jayanthi. Supervised infrastructure project developments in coastal districts.",
      photo: null,
      spouseId: jayanthi.id,
      timeline: JSON.stringify([
        { year: "1955", title: "Born", description: "Born in Mangalore." },
        { year: "1986", title: "Marriage", description: "Married Jayanthi Poojari." }
      ]),
      achievements: JSON.stringify([])
    }
  });

  await prisma.familyMember.update({
    where: { id: jayanthi.id },
    data: { spouseId: madhava.id }
  });

  // Child 5: Sakila Poojari + Bhaskar Billava
  const sakila = await prisma.familyMember.create({
    data: {
      name: "Sakila Poojari",
      gender: "FEMALE",
      birthDate: "1963-12-14",
      occupation: "Social Worker",
      education: "M.S.W. (Master of Social Work)",
      bio: "Fourth daughter of Kuppaya & Savithri. Works with local NGOs focusing on rural women self-help groups (SHG).",
      photo: null,
      fatherId: g1_father.id,
      motherId: g1_mother.id,
      timeline: JSON.stringify([
        { year: "1963", title: "Born", description: "Born in Mangalore." },
        { year: "1988", title: "Marriage", description: "Married Bhaskar Billava." }
      ]),
      achievements: JSON.stringify([])
    }
  });

  const bhaskar = await prisma.familyMember.create({
    data: {
      name: "Bhaskar Billava",
      gender: "MALE",
      birthDate: "1958-10-24",
      occupation: "Senior Government Officer",
      education: "M.A. in Public Administration",
      bio: "Husband of Sakila. Served in state administrative service managing revenue and land registrations.",
      photo: null,
      spouseId: sakila.id,
      timeline: JSON.stringify([
        { year: "1958", title: "Born", description: "Born in Kasaragod." },
        { year: "1988", title: "Marriage", description: "Married Sakila Poojari." }
      ]),
      achievements: JSON.stringify([])
    }
  });

  await prisma.familyMember.update({
    where: { id: sakila.id },
    data: { spouseId: bhaskar.id }
  });


  // Generation 3 (Grandchildren)
  // Shridhar's children: Shreyas, Shravya
  const shreyas = await prisma.familyMember.create({
    data: {
      name: "Shreyas Poojari",
      gender: "MALE",
      birthDate: "1995-02-14",
      occupation: "Lead Software Architect",
      education: "B.E. in Computer Science & Engineering",
      bio: "Son of Shridhar & Prabhavathi. Shreyas is a passionate software architect with deep interest in web applications, cloud architecture, and open source development. He built the Family Heritage Portal to preserve family memories.",
      photo: null,
      fatherId: shridhar.id,
      motherId: prabhavathi.id,
      timeline: JSON.stringify([
        { year: "1995", title: "Born", description: "Born in Mangalore, Karnataka." },
        { year: "2017", title: "Engineering Graduation", description: "Graduated with First Class Distinction in Computer Science." },
        { year: "2022", title: "Lead Architect Promotion", description: "Appointed Lead Software Architect in a multinational tech firm." }
      ]),
      achievements: JSON.stringify([
        { year: "2016", title: "National Hackathon Winner", description: "First place in National Smart India Hackathon." }
      ])
    }
  });

  const shravya = await prisma.familyMember.create({
    data: {
      name: "Shravya Poojari",
      gender: "FEMALE",
      birthDate: "1998-09-30",
      occupation: "Senior UX Designer",
      education: "B.Des in Product Design",
      bio: "Daughter of Shridhar & Prabhavathi. Specializes in designing interactive systems and digital solutions for healthcare startups.",
      photo: null,
      fatherId: shridhar.id,
      motherId: prabhavathi.id,
      timeline: JSON.stringify([
        { year: "1998", title: "Born", description: "Born in Mangalore." },
        { year: "2020", title: "Design Graduation", description: "Graduated with honors from National Institute of Design." }
      ]),
      achievements: JSON.stringify([])
    }
  });

  // Nirmala's children: Shilpa, Roopa
  const shilpa = await prisma.familyMember.create({
    data: {
      name: "Shilpa Poojari",
      gender: "FEMALE",
      birthDate: "1978-05-15",
      occupation: "Pediatrician",
      education: "M.D. in Pediatrics",
      bio: "Daughter of Nirmala & Shankar. Practicing pediatrician dedicated to child healthcare and developmental diagnostics.",
      photo: null,
      fatherId: shankar.id,
      motherId: nirmala.id,
      timeline: JSON.stringify([
        { year: "1978", title: "Born", description: "Born in Mangalore." },
        { year: "2003", title: "MD Graduation", description: "Completed Doctor of Medicine from Kasturba Medical College." },
        { year: "2005", title: "Marriage", description: "Married Mahesh Poojari." }
      ]),
      achievements: JSON.stringify([])
    }
  });

  const mahesh_shilpa = await prisma.familyMember.create({
    data: {
      name: "Mahesh Poojari",
      gender: "MALE",
      birthDate: "1974-06-12",
      occupation: "Cardiologist",
      education: "D.M. in Cardiology",
      bio: "Husband of Shilpa. Senior consulting cardiologist in Mangalore, active in community health camps.",
      photo: null,
      spouseId: shilpa.id,
      timeline: JSON.stringify([
        { year: "1974", title: "Born", description: "Born in Udupi." },
        { year: "2005", title: "Marriage", description: "Married Shilpa Poojari." }
      ]),
      achievements: JSON.stringify([])
    }
  });

  await prisma.familyMember.update({
    where: { id: shilpa.id },
    data: { spouseId: mahesh_shilpa.id }
  });

  const roopa = await prisma.familyMember.create({
    data: {
      name: "Roopa Poojari",
      gender: "FEMALE",
      birthDate: "1982-08-20",
      occupation: "High School Teacher",
      education: "B.Sc, B.Ed",
      bio: "Daughter of Nirmala & Shankar. Teaches physics and mathematics, passionate about STEM education for girls.",
      photo: null,
      fatherId: shankar.id,
      motherId: nirmala.id,
      timeline: JSON.stringify([
        { year: "1982", title: "Born", description: "Born in Mangalore." },
        { year: "2008", title: "Marriage", description: "Married Mahesh Poojari." }
      ]),
      achievements: JSON.stringify([])
    }
  });

  const mahesh_roopa = await prisma.familyMember.create({
    data: {
      name: "Mahesh Poojari",
      gender: "MALE",
      birthDate: "1978-02-14",
      occupation: "Mechanical Engineer",
      education: "B.E. in Mechanical Engineering",
      bio: "Husband of Roopa. Operations manager at a local manufacturing plant in Mangalore.",
      photo: null,
      spouseId: roopa.id,
      timeline: JSON.stringify([
        { year: "1978", title: "Born", description: "Born in Mangalore." },
        { year: "2008", title: "Marriage", description: "Married Roopa Poojari." }
      ]),
      achievements: JSON.stringify([])
    }
  });

  await prisma.familyMember.update({
    where: { id: roopa.id },
    data: { spouseId: mahesh_roopa.id }
  });

  // Kalpana's child: Vinayak Billava
  const vinayak = await prisma.familyMember.create({
    data: {
      name: "Vinayak Billava",
      gender: "MALE",
      birthDate: "1985-03-24",
      occupation: "Software Consultant",
      education: "M.C.A. (Master of Computer Applications)",
      bio: "Son of Kalpana & Shekar. Works as a consulting solutions architect for cloud migrations in Bangalore.",
      photo: null,
      fatherId: shekar.id,
      motherId: kalpana.id,
      timeline: JSON.stringify([
        { year: "1985", title: "Born", description: "Born in Bangalore." }
      ]),
      achievements: JSON.stringify([])
    }
  });

  // Jayanthi's child: Dhanya Poojari
  const dhanya = await prisma.familyMember.create({
    data: {
      name: "Dhanya Poojari",
      gender: "FEMALE",
      birthDate: "1990-12-11",
      occupation: "Assistant Professor",
      education: "Ph.D in English Literature",
      bio: "Daughter of Jayanthi & Madhava. Teaches at Mangalore University and conducts research on coastal folklore and oral narratives.",
      photo: null,
      fatherId: madhava.id,
      motherId: jayanthi.id,
      timeline: JSON.stringify([
        { year: "1990", title: "Born", description: "Born in Udupi." },
        { year: "2021", title: "PhD Completion", description: "Awarded Doctorate in English Literature." }
      ]),
      achievements: JSON.stringify([
        { year: "2023", title: "Research Grant Award", description: "Awarded national grant for tribal folklore preservation." }
      ])
    }
  });

  // Sakila's children: Sushanya, Suvish
  const sushanya = await prisma.familyMember.create({
    data: {
      name: "Sushanya Billava",
      gender: "FEMALE",
      birthDate: "1992-05-18",
      occupation: "Chartered Accountant",
      education: "CA, B.Com",
      bio: "Daughter of Sakila & Bhaskar. Operates her own audit consultancy in Mangalore.",
      photo: null,
      fatherId: bhaskar.id,
      motherId: sakila.id,
      timeline: JSON.stringify([
        { year: "1992", title: "Born", description: "Born in Kasaragod." },
        { year: "2016", title: "CA Qualification", description: "Qualified CA exam on first attempt." }
      ]),
      achievements: JSON.stringify([])
    }
  });

  const suvish = await prisma.familyMember.create({
    data: {
      name: "Suvish Billava",
      gender: "MALE",
      birthDate: "1996-10-04",
      occupation: "Operations Manager",
      education: "M.S. in Supply Chain Management",
      bio: "Son of Sakila & Bhaskar. Currently working in supply chain operations for a logistics firm in Germany.",
      photo: null,
      fatherId: bhaskar.id,
      motherId: sakila.id,
      timeline: JSON.stringify([
        { year: "1996", title: "Born", description: "Born in Mangalore." },
        { year: "2021", title: "Moved to Germany", description: "Relocated for postgraduate studies and career." }
      ]),
      achievements: JSON.stringify([])
    }
  });


  // Generation 4 (Great-grandchildren)
  // Shilpa & Mahesh's children: Shanvi, Shivam
  const shanvi = await prisma.familyMember.create({
    data: {
      name: "Shanvi Poojari",
      gender: "FEMALE",
      birthDate: "2008-11-15",
      occupation: "Student",
      education: "Secondary School",
      bio: "Daughter of Shilpa & Mahesh. Passionate swimmer competing at state levels.",
      photo: null,
      fatherId: mahesh_shilpa.id,
      motherId: shilpa.id,
      timeline: JSON.stringify([
        { year: "2008", title: "Born", description: "Born in Mangalore." }
      ]),
      achievements: JSON.stringify([
        { year: "2024", title: "State TT Bronze", description: "Won third place in 100m freestyle swimming." }
      ])
    }
  });

  const shivam = await prisma.familyMember.create({
    data: {
      name: "Shivam Poojari",
      gender: "MALE",
      birthDate: "2012-04-03",
      occupation: "Student",
      education: "Middle School",
      bio: "Son of Shilpa & Mahesh. Keen chess player and technology hobbyist.",
      photo: null,
      fatherId: mahesh_shilpa.id,
      motherId: shilpa.id,
      timeline: JSON.stringify([
        { year: "2012", title: "Born", description: "Born in Mangalore." }
      ]),
      achievements: JSON.stringify([])
    }
  });

  // Roopa & Mahesh's child: Adhya
  const adhya = await prisma.familyMember.create({
    data: {
      name: "Adhya Poojari",
      gender: "FEMALE",
      birthDate: "2014-06-25",
      occupation: "Student",
      education: "Elementary School",
      bio: "Daughter of Roopa & Mahesh. Learning classical Bharatnatyam dance and sketching.",
      photo: null,
      fatherId: mahesh_roopa.id,
      motherId: roopa.id,
      timeline: JSON.stringify([
        { year: "2014", title: "Born", description: "Born in Mangalore." }
      ]),
      achievements: JSON.stringify([])
    }
  });

  console.log("Family members seeded.");

  // 4. Create chapters
  const chapters = [
    {
      chapter: 1,
      title: "Origin of the Poojari Family",
      content: "The story of the Poojari family begins in the coastal region of Karnataka, Mangalore. Rooted in the rich cultural soil of Tulu Nadu, our ancestors were custodians of local heritage, values, and community. For generations, they lived in harmony with the sea breeze and the swaying coconut palms, carving out a reputation for honesty, resilience, and hard work.\n\nIn these early days, the family lived in a traditional ancestral home (Madubana), which served as the beating heart of all family gatherings, festivals, and discussions. Here, deep respect for elders, traditional rituals, and community service was passed down to each child."
    },
    {
      chapter: 2,
      title: "The Grandparents (Patriarch & Matriarch)",
      content: "Kuppaya Poojari and Savithri K Poojari were the pillars upon which our modern family was built. Born in the early 20th century, Kuppaya was a man of quiet determination and immense strength who supervised agricultural lands and led local community initiatives. Savithri managed the household with grace, warmth, and an open heart.\n\nTogether, they faced the challenges of raising five children (Shridhar, Nirmala, Kalpana, Jayanthi, and Sakila) in a changing world. They prioritized education above all else, ensuring that their children had the tools to build bright futures. Their home in Mangalore's Madubana was always filled with laughter, delicious traditional recipes, and the scent of fresh jasmine."
    },
    {
      chapter: 3,
      title: "The Second Generation Branches",
      content: "As the children grew, the family branched out into new roles and cities.\n\nShridhar Poojari, the eldest son, entered banking, maintaining a strong presence in Mangalore. Nirmala became a high school principal, guiding generations of young girls. Kalpana and Jayanthi built lives in banking and music, while Sakila committed herself to social work. Each established a new branch, marrying and raising children who would carry forward the values of Kuppaya & Savithri."
    },
    {
      chapter: 4,
      title: "Achievements Across Generations",
      content: "Over the decades, members of the Poojari family have made significant contributions across fields:\n\n- **Engineering & Architecture:** Shreyas Poojari graduated with top honors and became a Lead Software Architect, developing modern systems.\n- **Medical Science:** Dr. Shilpa and Dr. Mahesh serve coastal Karnataka in pediatric and cardiac healthcare.\n- **Design & Arts:** Shravya Poojari designs digital product user experiences. Dhanya Poojari preserves oral narratives and folklore of coastal Karnataka as a professor and scholar.\n- **Finance:** Sushanya Billava qualified as a Chartered Accountant, operating her audit consultancies."
    },
    {
      chapter: 5,
      title: "Current & Future Generations",
      content: "Today, the Poojari family spans multiple cities and countries, but the spirit of Mangalore's Madubana remains alive in every heart. The great-grandchildren, Shanvi, Shivam, and Adhya, represent the vibrant fourth generation, combining modern education with classical arts and athletics.\n\nAs we look to the future, we carry forward the legacy of Kuppaya and Savithri, standing tall like the coconut trees of Tulu Nadu, deeply rooted yet reaching for the skies:\n\n**\"Rooted in History, Growing for Generations.\"**"
    }
  ];

  for (const chap of chapters) {
    await prisma.storyChapter.create({
      data: chap
    });
  }

  console.log("Chapters seeded.");

  // 5. Create default photo albums
  const album1 = await prisma.album.create({
    data: {
      title: "Weddings & Ceremonies",
      category: "Weddings",
      familyGroup: "Full Family",
    }
  });

  const album2 = await prisma.album.create({
    data: {
      title: "Madubana Festivals",
      category: "Festivals",
      familyGroup: "Full Family",
    }
  });

  const album3 = await prisma.album.create({
    data: {
      title: "Family Get-Togethers",
      category: "Recent",
      familyGroup: "Full Family",
    }
  });

  // Seed default photos (referencing house.jpg as mock photo)
  await prisma.photo.createMany({
    data: [
      { albumId: album1.id, imageUrl: "https://utfs.io/f/M2LT7AGQyPTZrOl2lgpIsVeqpnS6LZ7gwlNHaAYzt8hkK9WF", caption: "Kuppaya & Savithri Golden Anniversary Celebration" },
      { albumId: album1.id, imageUrl: "https://utfs.io/f/M2LT7AGQyPTZrOl2lgpIsVeqpnS6LZ7gwlNHaAYzt8hkK9WF", caption: "Shridhar & Prabhavathi Wedding, 1978" },
      { albumId: album2.id, imageUrl: "https://utfs.io/f/M2LT7AGQyPTZrOl2lgpIsVeqpnS6LZ7gwlNHaAYzt8hkK9WF", caption: "Traditional Kola Festival at the Ancestral Village" },
      { albumId: album2.id, imageUrl: "https://utfs.io/f/M2LT7AGQyPTZrOl2lgpIsVeqpnS6LZ7gwlNHaAYzt8hkK9WF", caption: "Navratri Pooja decorations in Madubana" },
      { albumId: album3.id, imageUrl: "https://utfs.io/f/M2LT7AGQyPTZrOl2lgpIsVeqpnS6LZ7gwlNHaAYzt8hkK9WF", caption: "Family gathering at the ancestral grounds" }
    ]
  });

  console.log("Photo albums seeded.");
  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
