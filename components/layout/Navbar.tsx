"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Menu, X, Shield, BookOpen, Users, Image as ImageIcon, LogOut, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Roots Tree", href: "/family-tree", icon: Users },
    { name: "Family Gallery", href: "/gallery", icon: ImageIcon },
    { name: "History Book", href: "/family-book", icon: BookOpen },
  ];

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
        scrolled
          ? "bg-[#060913]/90 backdrop-blur-md border-b border-white/5 py-3 shadow-lg"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col group">
          <span className="font-serif text-xl md:text-2xl font-bold tracking-wide text-gold group-hover:text-amber-400 transition-colors">
            ಮಧುಬನ
          </span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400 -mt-1 font-sans">
            ಸದಸ್ಯರು
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {session && navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium tracking-wide transition-colors duration-200",
                  isActive
                    ? "text-gold font-semibold"
                    : "text-slate-300 hover:text-gold"
                )}
              >
                <Icon size={16} className={cn("transition-colors", isActive ? "text-gold" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-2 text-sm font-medium tracking-wide transition-colors duration-200",
                pathname === "/admin" ? "text-gold font-semibold" : "text-slate-300 hover:text-gold"
              )}
            >
              <Shield size={16} className="text-amber-500" />
              Admin
            </Link>
          )}
        </div>

        {/* Desktop Login/Profile Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">
                Hi, <span className="text-gold font-medium">Member</span>
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-red-400 transition-all border border-white/10 hover:border-red-500/20 px-3 py-1.5 rounded bg-white/5 hover:bg-red-500/5 cursor-pointer"
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black bg-gold hover:bg-amber-400 px-4 py-2 rounded font-sans transition-all shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer"
            >
              <LogIn size={13} />
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-300 hover:text-gold p-2 cursor-pointer"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#070b17] border-b border-white/10 py-6 px-8 flex flex-col space-y-6 shadow-2xl animate-fade-in">
          {session && navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-lg font-medium text-slate-200 hover:text-gold"
              >
                <Icon size={20} className="text-slate-400" />
                {item.name}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-lg font-medium text-slate-200 hover:text-gold"
            >
              <Shield size={20} className="text-amber-500" />
              Admin Dashboard
            </Link>
          )}

          <hr className="border-white/5" />

          {session ? (
            <div className="flex flex-col gap-4">
              <span className="text-sm text-slate-400">
                Logged in as <span className="text-gold font-medium">Member</span>
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex items-center justify-center gap-2 w-full text-center text-sm font-semibold uppercase tracking-wider text-red-400 border border-red-500/20 py-2 rounded bg-red-500/5 cursor-pointer"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full text-center text-sm font-semibold uppercase tracking-wider text-black bg-gold py-2.5 rounded font-sans cursor-pointer"
            >
              <LogIn size={16} />
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
