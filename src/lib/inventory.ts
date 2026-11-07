import raw from '../data/inventory.csv?raw';
import { getModel, models, type Model } from '../data/models';

export const statuses = ['available', 'sold', 'hold', 'not-for-sale'] as const;
export type Status = (typeof statuses)[number];

export const specColumns = [
  { key: 'finish', label: 'Finish' },
  { key: 'top_wood', label: 'Top' },
  { key: 'body_wood', label: 'Body' },
  { key: 'neck_wood', label: 'Neck' },
  { key: 'fretboard', label: 'Fretboard' },
  { key: 'pickups', label: 'Pickups' },
] as const;

// Shown when the CSV cell is empty; a value in the CSV overrides it.
const specDefaults: Record<string, string> = { pickups: 'Dimo Humbucker Pickups' };

export type Guitar = {
  id: string;
  slug: string;
  model: Model;
  status: Status;
  price: number | null;
  reverbUrl: string;
  featured: boolean;
  specs: { label: string; value: string }[];
  specsPending: boolean;
  notes: string;
};

function parse(csv: string): Guitar[] {
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map((h) => h.trim());

  return lines
    .filter((line) => line.trim() !== '')
    .map((line, i) => {
      const cells = line.split(',').map((c) => c.trim());
      const row = Object.fromEntries(headers.map((h, j) => [h, cells[j] ?? '']));
      const where = `inventory.csv line ${i + 2} (${row.id || 'no id'})`;

      const model = getModel(row.model);
      if (!model) {
        throw new Error(
          `${where}: unknown model "${row.model}". Expected one of ${models.map((m) => m.code).join(', ')}.`,
        );
      }
      if (!(statuses as readonly string[]).includes(row.status)) {
        throw new Error(`${where}: unknown status "${row.status}". Expected one of ${statuses.join(', ')}.`);
      }
      if (row.price && !/^\d+$/.test(row.price)) {
        throw new Error(`${where}: price "${row.price}" must be whole USD with no symbols.`);
      }

      return {
        id: row.id,
        slug: row.id.toLowerCase(),
        model,
        status: row.status as Status,
        price: row.price ? Number(row.price) : null,
        reverbUrl: row.reverb_url,
        featured: row.featured === 'true',
        specs: specColumns
          .map((c) => ({ label: c.label, value: row[c.key] || specDefaults[c.key] }))
          .filter((s) => s.value),
        specsPending: specColumns.every((c) => !row[c.key]),
        notes: row.notes,
      };
    });
}

const modelOrder = models.map((m) => m.code) as string[];

export const guitars: Guitar[] = parse(raw).sort(
  (a, b) => modelOrder.indexOf(a.model.code) - modelOrder.indexOf(b.model.code) || a.id.localeCompare(b.id),
);

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function priceLabel(g: Guitar): string {
  if (g.status === 'sold') return 'Sold';
  if (g.status === 'not-for-sale') return 'Not for sale';
  return g.price === null ? 'Price on request' : usd.format(g.price);
}

export function countByModel(code: string): number {
  return guitars.filter((g) => g.model.code === code).length;
}

export function getGuitar(id: string): Guitar | undefined {
  return guitars.find((g) => g.id === id);
}

// Guitars marked `featured` in the CSV; until any are, the highest-priced available ones.
export function featuredGuitars(limit = 4): Guitar[] {
  const featured = guitars.filter((g) => g.featured);
  if (featured.length > 0) return featured.slice(0, limit);
  return guitars
    .filter((g) => g.status === 'available' && g.price !== null)
    .sort((a, b) => b.price! - a.price!)
    .slice(0, limit);
}

// Up to `limit` other guitars of the same model, starting after this one and wrapping around,
// so neighbouring pages don't all show the same four.
export function moreFromModel(guitar: Guitar, limit = 4): Guitar[] {
  const same = guitars.filter((g) => g.model.code === guitar.model.code);
  const i = same.findIndex((g) => g.id === guitar.id);
  return [...same.slice(i + 1), ...same.slice(0, i)].slice(0, limit);
}
