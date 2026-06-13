import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user && user.email) {
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() }
        });
        
        if (!dbUser) {
          const emailLower = user.email.toLowerCase();
          const isAdmin = emailLower === "shreyass0709@gmail.com" || emailLower === "madubana2005@poojari.com" || emailLower.includes("admin");
          
          dbUser = await prisma.user.create({
            data: {
              name: user.name || "Family Member",
              email: emailLower,
              password: "", // no password for Google OAuth
              role: isAdmin ? "ADMIN" : "MEMBER",
              photo: user.image
            }
          });
        }
        
        token.id = dbUser.id;
        token.role = dbUser.role;
      }
      // Handle session update if user edits their own profile
      if (trigger === "update" && session) {
        token.name = session.name;
        token.picture = session.photo;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const userSession = session.user as { id?: string; role?: string };
        userSession.id = token.id as string;
        userSession.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
