// Fails the build if an em dash (U+2014) or en dash (U+2013) appears in src/ or content/.
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const scanDirs = ['src', 'content'];
const binaryExtensions = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.svgz',
  '.woff', '.woff2', '.ttf', '.otf', '.mp4', '.mov', '.webm', '.pdf',
]);
const dashes = { '\u2014': 'em dash', '\u2013': 'en dash' };
const pattern = /[\u2013\u2014]/g;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (!binaryExtensions.has(extname(entry.name).toLowerCase())) yield path;
  }
}

const problems = [];

for (const dir of scanDirs) {
  const abs = join(root, dir);
  if (!existsSync(abs)) continue;
  for await (const file of walk(abs)) {
    const lines = (await readFile(file, 'utf8')).split('\n');
    lines.forEach((line, i) => {
      for (const match of line.matchAll(pattern)) {
        problems.push(`  ${relative(root, file)}:${i + 1}:${match.index + 1}  ${dashes[match[0]]}`);
      }
    });
  }
}

if (problems.length > 0) {
  console.error(`Dash check failed: ${problems.length} em/en dash(es) found. Use a colon, comma, period or parentheses.`);
  console.error(problems.join('\n'));
  process.exit(1);
}

console.log(`Dash check passed: no em or en dashes in ${scanDirs.join('/, ')}/.`);
