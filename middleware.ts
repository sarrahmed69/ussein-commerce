import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const { updateSession } = await import("@/lib/supabase/middleware");
    return await updateSession(request);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/user/:path*",
    "/vendor/:path*",
    "/cart/checkout",
  ],
};