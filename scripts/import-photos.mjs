// Resizes original guitar photos into src/assets/guitars/<ID>/ and prints a report.
// Usage: npm run photos [-- <source dir>] [-- --force]
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const force = args.includes('--force');
const source = resolve(root, args.find((a) => !a.startsWith('--')) ?? '../Photos/InventoryPhotos');
const outDir = join(root, 'src/assets/guitars');
const csvPath = join(root, 'src/data/inventory.csv');

const MAX_EDGE = 2000;
const QUALITY = 82;
const CONCURRENCY = 4;

// Keep in sync with src/lib/photos.ts.
const angles = [
  '_Front_Full_Body.jpg',
  '_Back_Full_Body.jpg',
  '_Front_Body_Crop.jpg',
  '_Back_Body_Crop.jpg',
  '_Side_Body.jpg',
  '_Headstocks.jpg',
];

const logos = ['DimoSignature_BlackTransparent.png', 'DimoSignature_WhiteTransparent.png'];

if (!existsSync(source)) {
  console.error(`Source folder not found: ${source}`);
  process.exit(1);
}

const csvIds = (await readFile(csvPath, 'utf8'))
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((line) => line.split(',')[0].trim())
  .filter(Boolean);

const folders = (await readdir(source, { withFileTypes: true }))
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

const csvSet = new Set(csvIds);
const folderSet = new Set(folders);
const toImport = folders.filter((id) => csvSet.has(id));

const jobs = [];
const missing = {};
const extras = {};

for (const id of toImport) {
  // Subfolders (e.g. M-101/Old/ for earlier edits) are skipped.
  const files = (await readdir(join(source, id), { withFileTypes: true }))
    .filter((e) => e.isFile() && !e.name.startsWith('.'))
    .map((e) => e.name);
  const expected = angles.map((suffix) => `${id}${suffix}`);
  const absent = expected.filter((f) => !files.includes(f));
  const unexpected = files.filter((f) => !expected.includes(f));
  if (absent.length) missing[id] = absent;
  if (unexpected.length) extras[id] = unexpected;
  for (const file of expected.filter((f) => files.includes(f))) {
    jobs.push({ id, file, from: join(source, id, file), to: join(outDir, id, file) });
  }
}

let written = 0;
let skipped = 0;
let bytesIn = 0;
let bytesOut = 0;
const failures = [];

async function run(job) {
  try {
    const src = await stat(job.from);
    bytesIn += src.size;
    const out = existsSync(job.to) ? await stat(job.to) : null;
    if (!force && out && out.mtimeMs >= src.mtimeMs) {
      bytesOut += out.size;
      skipped++;
      return;
    }
    await mkdir(join(outDir, job.id), { recursive: true });
    const info = await sharp(job.from)
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(job.to);
    bytesOut += info.size;
    written++;
  } catch (err) {
    failures.push(`${job.file}: ${err.message}`);
  }
}

const queue = [...jobs];
let done = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      await run(queue.shift());
      done++;
      if (process.stdout.isTTY) process.stdout.write(`\r  Processing ${done}/${jobs.length}`);
    }
  }),
);
if (process.stdout.isTTY) process.stdout.write('\n');

const brandDir = join(root, 'src/assets/brand');
const logoSource = resolve(source, '..');
await mkdir(brandDir, { recursive: true });
const logoResults = [];
for (const logo of logos) {
  const from = join(logoSource, logo);
  if (existsSync(from)) {
    await copyFile(from, join(brandDir, logo));
    logoResults.push(`  copied   ${logo}`);
  } else {
    logoResults.push(`  MISSING  ${logo} (looked in ${relative(root, logoSource)})`);
  }
}

const complete = toImport.filter((id) => !missing[id]);
const notInCsv = folders.filter((id) => !csvSet.has(id));
const noFolder = csvIds.filter((id) => !folderSet.has(id));
const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;
const list = (items) => (items.length ? items.map((i) => `  ${i}`).join('\n') : '  none');

console.log(`
Photo report
============
Source:   ${relative(root, source)}
Output:   ${relative(root, outDir)}

Guitars in CSV:                ${csvIds.length}
Folders found:                 ${folders.length}
Guitars with all 6 photos:     ${complete.length}/${csvIds.length}
Photos resized:                ${written} written, ${skipped} unchanged (${jobs.length} total)
Size:                          ${mb(bytesIn)} originals → ${mb(bytesOut)} resized

Missing angles:
${list(Object.entries(missing).map(([id, files]) => `${id}: ${files.join(', ')}`))}

Unexpected files (not imported):
${list(Object.entries(extras).map(([id, files]) => `${id}: ${files.join(', ')}`))}

Folders not in the CSV (not imported):
${list(notInCsv)}

CSV rows without a folder:
${list(noFolder)}

Logos (src/assets/brand):
${logoResults.join('\n')}
${failures.length ? `\nFailures:\n${list(failures)}\n` : ''}`);

if (failures.length) process.exit(1);
