// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { isHiddenPath } from './src/data/site.ts';

export default defineConfig({
  site: 'https://www.dimoguitars.com',
  output: 'static',
  // about.html instead of about/index.html, so Netlify serves /about without a redirect to /about/.
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      filter: (page) => !isHiddenPath(new URL(page).pathname),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
