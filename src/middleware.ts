import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';

const locales = ['tr', 'en'];
const defaultLocale = 'tr';

function getLocaleFromCookies(request: NextRequest): string {
  const nextLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (nextLocale && locales.includes(nextLocale)) {
    return nextLocale;
  }

  const siteDefault = request.cookies.get('SITE_DEFAULT_LOCALE')?.value;
  if (siteDefault && locales.includes(siteDefault)) {
    return siteDefault;
  }

  return defaultLocale;
}

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
  const locale = getLocaleFromCookies(request);

  const pathname = request.nextUrl.pathname;
  const hasLocalePrefix = locales.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );

  if (!hasLocalePrefix) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return Response.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
