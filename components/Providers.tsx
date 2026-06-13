"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function SessionGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Synchronous client check to prevent flashing of protected contents on tab reopen
  const isClient = typeof window !== "undefined";
  const hasWasLoggedInCookie = isClient && document.cookie.includes("wasLoggedIn=true");
  const isTabActive = isClient && sessionStorage.getItem("tabSessionActive") === "true";
  const needsSignOut = hasWasLoggedInCookie && !isTabActive;

  useEffect(() => {
    if (needsSignOut) {
      setIsRedirecting(true);
      // Clear cookie immediately
      document.cookie = "wasLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
      
      const performSignOut = async () => {
        if (pathname.startsWith("/admin")) {
          await signOut({ callbackUrl: "/login" });
        } else {
          await signOut({ redirect: false });
          setIsRedirecting(false);
        }
      };
      performSignOut();
    }
  }, [needsSignOut, pathname]);

  useEffect(() => {
    if (status === "authenticated") {
      const isTabActive = sessionStorage.getItem("tabSessionActive") === "true";
      if (isTabActive) {
        document.cookie = "wasLoggedIn=true; path=/; SameSite=Lax";
      } else {
        setIsRedirecting(true);
        document.cookie = "wasLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
        if (pathname.startsWith("/admin")) {
          signOut({ callbackUrl: "/login" });
        } else {
          signOut({ redirect: false }).then(() => {
            setIsRedirecting(false);
          });
        }
      }
    } else if (status === "unauthenticated") {
      sessionStorage.removeItem("tabSessionActive");
      document.cookie = "wasLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    }
  }, [status, pathname]);

  if (isRedirecting || (isClient && needsSignOut)) {
    return (
      <div className="h-screen w-full bg-[#060913] flex flex-col items-center justify-center text-slate-400 font-sans z-[200] relative">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mb-4"></div>
        <span className="text-xs uppercase tracking-widest text-slate-500">Ending session...</span>
      </div>
    );
  }

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionGuard>{children}</SessionGuard>
    </SessionProvider>
  );
}

