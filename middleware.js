import { NextResponse } from "next/server";

// مسار لوحة التحكم السري. لتغييره لاحقاً غيّر هذا السطر فقط.
const ADMIN_PATH = "/admin552255";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // المسار الجديد يفتح لوحة التحكم، ومنع محركات البحث من فهرستها
  if (pathname === ADMIN_PATH || pathname === ADMIN_PATH + "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    const res = NextResponse.rewrite(url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
    return res;
  }

  // المسار القديم /admin يعطي صفحة 404
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const url = req.nextUrl.clone();
    url.pathname = "/not-found-page";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/admin552255", "/admin552255/:path*"],
};
