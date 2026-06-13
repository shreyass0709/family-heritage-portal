import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import FloatingParticles from "@/components/ui/FloatingParticles";
import CustomCursor from "@/components/ui/CustomCursor";
import EntranceReveal from "@/components/ui/EntranceReveal";
import { cookies } from "next/headers";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Madubana Sadasyaru | Family Heritage Portal",
  description: "Rooted in History, Growing for Generations. A digital space to connect, explore our ancestral roots, share photographs, and read our migration history.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const showReveal = cookieStore.get("showReveal")?.value === "true";

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#060913] text-slate-100 font-sans relative">
        <FloatingParticles />
        <CustomCursor />
        <Providers>
          <EntranceReveal initialShow={showReveal} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
