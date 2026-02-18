import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { cookies, nextUrl } = request;
  
  // Extract IP and use it as session identifier for consistent tracking
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  let sessionId = cookies.get('tsid')?.value;
  let isNewSession = false;

  // Use IP as session ID to group same IP users together
  if (!sessionId || sessionId !== ip) {
    sessionId = ip;
    isNewSession = true;
  }

  const response = NextResponse.next();

  if (isNewSession) {
    response.cookies.set('tsid', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false, // Accessible by client-side JS
    });
  }

  // Always track the hit (initial request trace)
  // This ensures we catch clicks even if page doesn't load
  const userAgent = request.headers.get('user-agent') || '';
   
  // Extract UTM params
  const utm = {
    source: nextUrl.searchParams.get('utm_source'),
    medium: nextUrl.searchParams.get('utm_medium'),
    campaign: nextUrl.searchParams.get('utm_campaign'),
    term: nextUrl.searchParams.get('utm_term'),
    content: nextUrl.searchParams.get('utm_content'),
  };

  // Prepare fallback data if UTMs are missing
  const hasUtm = Object.values(utm).some(v => !!v);

  // Send to backend (fire and forget)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:2008';
  
  // Only track on page requests, not static assets, APIs or admin routes
  const isPage = !nextUrl.pathname.startsWith('/_next') && 
                 !nextUrl.pathname.startsWith('/api') && 
                 !nextUrl.pathname.startsWith('/admin') &&
                 !nextUrl.pathname.includes('.');

  if (isPage) {
    fetch(`${backendUrl}/api/v1/u-sync/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        userAgent,
        ip,
        utm: hasUtm ? utm : undefined,
      }),
    }).catch(() => {}); // Ignore errors in middleware tracking
  }

  return response;
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
