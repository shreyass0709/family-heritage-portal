import prisma from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import { Album } from "@/types/gallery";

export const revalidate = 0; // Dynamic server side generation

export default async function GalleryPage() {
  const dbAlbums = await prisma.album.findMany({
    include: {
      photos: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { category: "asc" },
  });

  const albums: Album[] = dbAlbums.map((album) => ({
    id: album.id,
    title: album.title,
    category: album.category,
    familyGroup: album.familyGroup,
    createdAt: album.createdAt.toISOString(),
    updatedAt: album.updatedAt.toISOString(),
    photos: album.photos.map((photo) => ({
      id: photo.id,
      albumId: photo.albumId,
      imageUrl: photo.imageUrl,
      caption: photo.caption,
      createdAt: photo.createdAt.toISOString(),
    })),
  }));

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#060913] pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto w-full mb-12">
          <span className="text-gold uppercase tracking-[0.2em] text-xs font-semibold">
            Visual Gallery
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mt-2">
            The Family Gallery
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl">
            Browse memories categorized by functions, weddings, birthdays, and trips across all branches of the family.
          </p>
        </div>

        <GalleryGrid albums={albums} />
      </main>
      <Footer />
    </>
  );
}
