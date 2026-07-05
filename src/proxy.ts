import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./lib/session";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Quick check for protected vs public routes prefix
  const isProtected = protectedRoutes.some((route) => path.startsWith(route));
  const isPublic = publicRoutes.some((route) => path.startsWith(route));

  if (!isProtected && !isPublic) {
    // If accessing root "/", redirect to dashboard
    if (path === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    return NextResponse.next();
  }

  const session = await getSession();

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublic && session) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
