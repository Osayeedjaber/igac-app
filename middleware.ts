import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip maintenance check for admin routes, API routes, static files, and maintenance page itself
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/maintenance" ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|css|js)$/)
  ) {
    return NextResponse.next();
  }

  try {
    // Check maintenance mode from database
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!baseUrl || !serviceKey) {
      return NextResponse.next();
    }

    const response = await fetch(`${baseUrl}/rest/v1/site_settings?id=eq.main`, {
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const settings = data[0];
      
      if (settings?.maintenance_mode === true) {
        const url = request.nextUrl.clone();
        url.pathname = "/maintenance";
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    console.error("Maintenance check failed:", error);
    // If check fails, continue normally (fail open)
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};