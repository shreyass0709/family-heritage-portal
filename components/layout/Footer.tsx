import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#03050c] border-t border-white/5 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="flex flex-col group">
            <span className="font-serif text-lg font-bold tracking-wide text-gold">
              ಮಧುಬನ
            </span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-slate-400 -mt-1 font-sans">
              ಸದಸ್ಯರು
            </span>
          </Link>
          <p className="text-xs text-slate-500 mt-2">
            © {currentYear} ಮಧುಬನ ಸದಸ್ಯರು. All rights reserved.
          </p>
        </div>

        <div className="text-center md:text-right">
          <p className="font-serif italic text-gold/80 text-sm md:text-base">
            "Rooted in History, Growing for Generations"
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Kelaginamane Navunda
          </p>
        </div>
      </div>
    </footer>
  );
}
