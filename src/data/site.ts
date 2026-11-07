export type Page = { label: string; href: string; show: boolean };

// Header and footer render only `show: true` items, in this order.
// Hidden pages are noindex and excluded from the sitemap.
export const pages: Page[] = [
  { label: 'Home', href: '/', show: true },
  { label: 'About', href: '/about', show: true },
  { label: 'Guitars', href: '/guitars', show: false },
  { label: 'Workshop & Tools', href: '/workshop', show: false },
  { label: 'Jigs & Templates', href: '/jigs', show: false },
  { label: 'Contact', href: '/contact', show: false },
  { label: 'Store', href: '/store', show: true },
];

export const navPages = pages.filter((p) => p.show);

const hiddenHrefs = pages.filter((p) => !p.show).map((p) => p.href);

export function normalizePath(pathname: string): string {
  // At build time Astro.url ends in .html (build.format 'file').
  return pathname.replace(/(\/index)?\.html$/, '').replace(/\/+$/, '') || '/';
}

export function isHiddenPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return hiddenHrefs.some((href) => path === href || path.startsWith(`${href}/`));
}

export const site = {
  name: 'Dimo Guitars',
  tagline: 'The Spirit of Tradition. The Art of Originality.',
  description:
    'Handmade electric guitars shaped by the classical violin-making tradition, built one at a time by Dimo in his New York workshop.',
  email: 'dimoguitarsnyc@gmail.com',
  // EmailOctopus landing page; used until the inline embed is pasted into Newsletter.astro.
  newsletterUrl: 'https://dimoguitars.eo.page/newsletter',
  location: 'NY, NY',
  // Guitar whose photos illustrate the three signature sections on About.
  aboutGuitarId: 'D-105',
  // Social links render only once a URL is set.
  social: [
    { label: 'Instagram', href: '' },
    { label: 'YouTube', href: '' },
    { label: 'Facebook', href: '' },
  ],
};
