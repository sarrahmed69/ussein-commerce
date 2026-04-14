import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PROTECTED_ROUTES } from "../constants";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: any }[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Email verifie = email_confirmed_at existe (plus fiable que identity_data)
  const emailVerified = !!user?.email_confirmed_at;

  const redirect = (path: string): NextResponse => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url);
  };

  const isAuthRoute = pathname.startsWith("/auth/");
  const isProtectedRoute = PROTECTED_ROUTES.some((path) => pathname.startsWith(path));

  // Utilisateur connecte et verifie -> pas besoin d aller sur auth
  if (user && emailVerified && isAuthRoute) {
    return redirect("/user/dashboard");
  }

  // Utilisateur connecte mais email non verifie
  if (user && !emailVerified) {
    if ((isAuthRoute && pathname !== "/auth/confirm-otp") || isProtectedRoute) {
      return redirect("/auth/confirm-otp");
    }
  }

  // Page confirm-otp
  if (pathname === "/auth/confirm-otp") {
    if (!user) return redirect("/auth/sign-in");
    if (emailVerified) return redirect("/user/dashboard");
  }

  // Non connecte sur route protegee
  if (!user && isProtectedRoute) {
    response.cookies.set("next_url", pathname, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return redirect("/auth/sign-in");
  }

  return response;
}