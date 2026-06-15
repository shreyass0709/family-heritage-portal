import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { comparePassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() }
        });

        if (!user) {
          throw new Error("No account found with this email");
        }

        // Only allow ADMIN role for credentials login
        if (user.role !== "ADMIN") {
          throw new Error("Only Administrators are permitted to sign in using credentials.");
        }

        const isValid = comparePassword(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.photo
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        const emailLower = user.email.toLowerCase();
        
        // Check if user is in the database
        let dbUser = await prisma.user.findUnique({
          where: { email: emailLower }
        });
        
        // If the email is not registered, create them with PENDING status and notify admin
        if (!dbUser) {
          const { sendAdminNotification } = await import("@/lib/email");
          
          dbUser = await prisma.user.create({
            data: {
              name: user.name || "Family Member",
              email: emailLower,
              password: "", // no password for Google OAuth
              role: "PENDING",
              photo: user.image
            }
          });
          
          // Send notification email asynchronously
          sendAdminNotification(dbUser.name, dbUser.email).catch(err => 
            console.error("Failed to trigger admin notification email:", err)
          );

          return "/login?error=PendingApproval";
        }

        // If user is pending approval, block access
        if (dbUser.role === "PENDING") {
          return "/login?error=PendingApproval";
        }

        // Admins should only login using Credentials provider, not Google
        if (dbUser.role === "ADMIN") {
          return "/login?error=AdminGoogleBlocked";
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        if (account?.provider === "credentials") {
          token.id = user.id;
          token.role = (user as { role?: string }).role;
        } else if (account?.provider === "google" && user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email.toLowerCase() }
          });
          
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        }
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
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
