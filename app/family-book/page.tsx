import prisma from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FlipBook from "@/components/book/FlipBook";
import { bookChaptersData } from "@/data/bookChapters";
import { StoryChapter } from "@/types/story";

export const dynamic = "force-dynamic";

export default async function FamilyBookPage() {
  let chapters: StoryChapter[] = [];

  try {
    const dbChapters = await prisma.storyChapter.findMany({
      orderBy: { chapter: "asc" },
    });
    
    chapters = dbChapters.map(c => ({
      id: c.id,
      chapter: c.chapter,
      title: c.title,
      content: c.content
    }));
  } catch (err) {
    console.error("Failed to query chapters from database, using static fallback:", err);
    chapters = bookChaptersData.map((c, i) => ({
      id: `static-${i}`,
      chapter: c.chapter,
      title: c.title,
      content: c.content
    }));
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#060913] pt-32 pb-24 px-6 md:px-12 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full text-center mb-12">
          <span className="text-gold uppercase tracking-[0.2em] text-xs font-semibold">
            Digital Chronicle
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mt-2">
            The Family History Book
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl mx-auto">
            Browse through the chapters documenting our origin, grandparents, migration paths, achievements, and future roots.
          </p>
        </div>

        <FlipBook chapters={chapters} />
      </main>
      <Footer />
    </>
  );
}
