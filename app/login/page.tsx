"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowLeft, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        sessionStorage.setItem("showReveal", "true");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10 space-y-6">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-gold transition-colors text-xs font-semibold uppercase tracking-wider group cursor-pointer"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Home
      </Link>

      {/* Login Card */}
      <div className="glass-panel border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/30 via-gold to-gold/30" />
        
        <div className="text-center space-y-2 mb-8">
          <h2 className="font-serif text-3xl font-bold text-white tracking-wide">
            Login
          </h2>
          <p className="text-xs text-slate-400 font-sans tracking-wide">
            Enter your credentials to access the family portal database
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-4.5 rounded-lg mb-6 animate-fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block ml-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sadasyaru@poojari.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-white/5 focus:border-gold/50 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all font-sans"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block ml-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-950/40 border border-white/5 focus:border-gold/50 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-gold transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 text-black bg-gold hover:bg-amber-400 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer mt-8"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Verifying...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>


      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[#060913] flex items-center justify-center pt-28 pb-16 px-6">
        
        {/* Starry/glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        <Suspense fallback={
          <div className="w-full max-w-md glass-panel border border-white/10 rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
            <Loader2 className="animate-spin text-gold mr-2" size={24} />
            <span className="text-xs text-slate-400">Loading sign-in form...</span>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
