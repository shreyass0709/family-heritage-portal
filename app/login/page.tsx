"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, Lock, Mail, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const authError = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Clear any residual legacy admin credentials from localStorage if present
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminPassword");
      localStorage.removeItem("adminCredentials");
      localStorage.removeItem("credentials");
    }
  }, []);
  const [error, setError] = useState<string | null>(
    authError === "AccessDenied"
      ? "Your Google account is not authorized. Only pre-approved family members can access this portal."
      : authError === "AdminGoogleBlocked"
      ? "Administrators must sign in using credentials. Please use the Administrator login option below."
      : authError === "PendingApproval"
      ? "Your Google account has been registered. Access is pending administrator approval. Please wait until the administrator approves your request."
      : authError
      ? "An error occurred during sign-in. Please try again."
      : null
  );

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl });
    } catch (err) {
      setError("Failed to initialize Google sign-in. Please try again.");
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
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
      <div className="glass-panel border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/30 via-gold to-gold/30" />
        
        <div className="text-center space-y-2 mb-8">
          <h2 className="font-serif text-3xl font-bold text-white tracking-wide">
            {showAdminLogin ? "Admin Login" : "Access Portal"}
          </h2>
          <p className="text-xs text-slate-400 font-sans tracking-wide">
            {showAdminLogin
              ? "Enter your administrator credentials to manage the family database"
              : "Sign in with your Google account to access the family heritage database"}
          </p>
        </div>

        {/* Error Message */}
        {error && (!showAdminLogin || (error !== "PendingApproval" && !error.includes("pending") && !error.includes("Google"))) && (
          <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-4.5 rounded-lg mb-6 w-full animate-fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed font-semibold">{error}</p>
          </div>
        )}

        {!showAdminLogin ? (
          <>
            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gold/35 py-3.5 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(0,0,0,0.3)] cursor-pointer relative group"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-gold" />
                  <span>Redirecting to Google...</span>
                </>
              ) : (
                <>
                  {/* Custom SVG Google Icon in Gold theme */}
                  <svg className="w-5 h-5 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 0, 0)">
                      <path d="M21.35,11.1H12v2.7h5.38C16.88,16.29,14.67,18,12,18c-3.31,0-6-2.69-6-6s2.69-6,6-6c1.45,0,2.78,0.52,3.82,1.38l2.03-2.03C16.2,3.82,14.24,3,12,3C7.03,3,3,7.03,3,12s4.03,9,9,9c4.75,0,8.75-3.41,8.75-9C20.75,11.69,21.35,11.1,21.35,11.1z" fill="#D4AF37"/>
                      <path d="M12,18c-3.31,0-6-2.69-6-6s2.69-6,6-6c1.45,0,2.78,0.52,3.82,1.38l2.03-2.03C16.2,3.82,14.24,3,12,3" fill="#D4AF37" opacity="0.15"/>
                    </g>
                  </svg>
                  <span className="group-hover:text-gold transition-colors">Continue with Google</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setShowAdminLogin(true);
                setError(null);
              }}
              className="mt-6 text-xs text-slate-500 hover:text-gold transition-colors underline cursor-pointer"
            >
              Sign in as Administrator
            </button>
          </>
        ) : (
          <form onSubmit={handleCredentialsSubmit} className="space-y-5 w-full">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block ml-1">
                Admin Email
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
                  placeholder="admin@poojari.com"
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
                  Verifying Admin...
                </>
              ) : (
                "Login as Admin"
              )}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAdminLogin(false);
                  setError(null);
                }}
                className="text-xs text-slate-400 hover:text-gold transition-colors cursor-pointer"
              >
                ← Return to Google Sign-In
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center border-t border-white/5 pt-4 w-full">
          <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
            Authorized family members only. If you are a member, please sign in with your Google account.
          </p>
        </div>
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
