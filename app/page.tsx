import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import HouseStory from "@/components/home/HouseStory";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Hero />
        <HouseStory />
      </main>
      <Footer />
    </>
  );
}
