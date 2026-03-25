import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/jwt";
import { PERMISSIONS } from "@/lib/permissions";

// URLPattern is available in Next.js Edge Runtime but may need a type definition
declare global {
  class URLPattern {
    constructor(input: { pathname: string });
    test(input: { pathname: string }): boolean;
  }
}

// 1. Define route groups (using URLPattern syntax)
const protectedRoutes = [
  new URLPattern({ pathname: "/admin/:path*" }),
  new URLPattern({ pathname: "/orders/:path*" }),
  new URLPattern({ pathname: "/cart/:path*" }),
];
const authRoutes = [
  new URLPattern({ pathname: "/login" }),
  new URLPattern({ pathname: "/register" }),
];

// 2. Map route patterns to required permissions (using URLPattern syntax)
// :path* matches anything after the prefix; :id matches a single dynamic segment.
const routePermissions = [
  { pattern: new URLPattern({ pathname: "/admin/:path*" }), permission: PERMISSIONS.PRODUCT_CREATE },
  { pattern: new URLPattern({ pathname: "/orders/:path*" }), permission: PERMISSIONS.ORDER_VIEW },
  { pattern: new URLPattern({ pathname: "/cart/:path*" }), permission: PERMISSIONS.CART_VIEW },
  { pattern: new URLPattern({ pathname: "/products/:id" }), permission: PERMISSIONS.PRODUCT_VIEW },
];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 3. Check route groups
  const isProtectedRoute = protectedRoutes.some((p) => p.test({ pathname }));
  const isAuthRoute = authRoutes.some((p) => p.test({ pathname }));

  // 4. Get and verify session
  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  // 5. Redirect Logic

  // A. Accessing a protected route without a valid session -> Redirect to /login
  if (isProtectedRoute && !session?.userId) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.nextUrl));
  }

  // B. Accessing an auth route (login/register) WITH a session -> Redirect home
  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // C. Permission-based route check (using URLPattern matching)
  if (session) {
    const permissions = session.permissions ?? [];
    
    // Check if the current path matches any of our permission-gated patterns
    const matched = routePermissions.find((rp) => rp.pattern.test({ pathname }));
    
    if (matched && !permissions.includes(matched.permission)) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  return NextResponse.next();
}

// 6. Matcher configuration - optimizes performance by excluding static assets and APIs
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
