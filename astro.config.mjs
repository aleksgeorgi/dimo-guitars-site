// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { isHiddenPath } from './src/data/site.ts';

export default defineConfig({
  site: 'https://www.dimoguitars.com',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !isHiddenPath(new URL(page).pathname),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
