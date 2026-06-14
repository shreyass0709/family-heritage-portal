import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const authMiddleware = withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const isEditingAdmin = req.nextUrl.pathname.startsWith("/admin");
    if (isEditingAdmin && token?.role !== "ADMIN") {
      // Redirect to homepage if they are not an administrator
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
  }
);

export const proxy = authMiddleware;
export default authMiddleware;

export const config = {
  matcher: [
    "/family-tree/:path*",
    "/family-book/:path*",
    "/gallery/:path*",
    "/member/:path*",
    "/admin/:path*",
  ],
};
