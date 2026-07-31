import { Inter } from 'next/font/google';

// Inter - self-hosted variable font (modern, clean, excellent Turkish support)
export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

// IBM Plex Sans - self-hosted alternative (professional, great readability)
// Uncomment if you want to use it as alternative or for headings
// export const ibmPlexSans = localFont({
//   src: [
//     { path: '../../public/fonts/IBMPlexSans-Variable.woff2', weight: '100 700', style: 'normal' },
//     { path: '../../public/fonts/IBMPlexSans-Italic-Variable.woff2', weight: '100 700', style: 'italic' },
//   ],
//   variable: '--font-ibm-plex-sans',
//   display: 'swap',
//   preload: true,
//   fallback: ['system-ui', 'sans-serif'],
// });
