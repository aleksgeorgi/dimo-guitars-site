import raw from '../data/inventory.csv?raw';
import { getModel, models, type Model } from '../data/models';
import { signaturesFor } from '../data/signatures';

export const statuses = ['available', 'sold', 'hold', 'not-for-sale'] as const;
export type Status = (typeof statuses)[number];

// Shown as "The instrument" on a guitar page, grouped the way Dimo's spec sheet is.
export type SpecRow = { label: string; value: string; href?: string; list?: readonly string[] };
export type SpecGroup = { title: string; rows: SpecRow[] };

// True of every Dimo guitar, so they live here instead of in 46 CSV rows.
export const sharedSpecs = {
  frets: '22',
  scale: '25 3/16 in (640 mm)',
  radius: '12 in',
  headplate: 'Dimo signature',
  pickups: 'Dimo humbuckers, neck and bridge',
  controls: (kind: string) => `5-way ${kind} switch, 1 volume, 1 tone`,
  switching: [
    'Neck humbucker',
    'Neck single coil (south)',
    'Neck and bridge humbuckers',
    'Bridge single coil (south)',
    'Bridge humbucker',
  ],
} as const;

const switches = ['rotary', 'toggle'];

function specGroups(row: Record<string, string>, hasJoint: boolean): SpecGroup[] {
  const filled = ['body_wood', 'neck_wood', 'fretboard', 'bridge', 'tuners'].some((k) => row[k]);
  const groups: SpecGroup[] = [
    {
      title: 'Body',
      rows: [
        { label: 'Body wood', value: row.body_wood },
        { label: 'Back', value: row.back_wood },
        { label: 'Top', value: row.top_wood },
        { label: 'Finish', value: row.body_finish },
      ],
    },
    {
      title: 'Neck',
      rows: [
        { label: 'Neck wood', value: row.neck_wood },
        { label: 'Neck finish', value: row.neck_finish },
        { label: 'Fretboard', value: row.fretboard },
        { label: 'Frets', value: filled ? sharedSpecs.frets : '' },
        { label: 'Zero fret', value: row.zero_fret === 'yes' ? 'Yes' : '' },
        { label: 'Scale length', value: filled ? sharedSpecs.scale : '' },
        { label: 'Fretboard radius', value: filled ? sharedSpecs.radius : '' },
        { label: 'Headplate', value: filled ? sharedSpecs.headplate : '' },
        hasJoint
          ? { label: 'Neck joint', value: 'Asymmetric 22° set-neck', href: '/about#neck-joint' }
          : { label: 'Neck joint', value: 'Traditional set-neck' },
      ],
    },
    {
      title: 'Hardware',
      rows: [
        { label: 'Bridge', value: row.bridge },
        { label: 'Tailpiece', value: row.tailpiece },
        { label: 'Tuners', value: row.tuners },
      ],
    },
    {
      title: 'Electronics',
      rows: [
        { label: 'Pickups', value: sharedSpecs.pickups },
        { label: 'Controls', value: row.switch ? sharedSpecs.controls(row.switch) : '' },
        ...(row.switch ? [{ label: 'Switching', value: '5 positions', list: sharedSpecs.switching }] : []),
      ],
    },
  ];
  return groups.map((g) => ({ ...g, rows: g.rows.filter((r) => r.value) })).filter((g) => g.rows.length > 0);
}

export type Guitar = {
  id: string;
  slug: string;
  model: Model;
  status: Status;
  price: number | null;
  reverbUrl: string;
  featured: boolean;
  specGroups: SpecGroup[];
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
      if (row.switch && !switches.includes(row.switch)) {
        throw new Error(`${where}: switch "${row.switch}" must be ${switches.join(' or ')}, or blank.`);
      }
      if (row.zero_fret && row.zero_fret !== 'yes') {
        throw new Error(`${where}: zero_fret "${row.zero_fret}" must be yes or blank.`);
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
        specGroups: specGroups(row, signaturesFor(row.id, model.code).some((f) => f.anchor === 'neck-joint')),
        specsPending: !row.body_wood && !row.neck_wood,
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

// Model-level specs for the Guitars page, worked out from the guitars of that model.
// A spec every guitar shares is shown as is. A spec that takes two to four different values
// is shown as a range ("Ebony or Santos rosewood"), most common first. A spec with more
// variety than that, or one that only some guitars have, is left out. Wood grades (AAA, AAAA)
// are ignored when comparing. Rows that are the same for every Dimo guitar are left out too;
// the page lists those once.
const everyGuitar = new Set(['Frets', 'Scale length', 'Fretboard radius', 'Headplate', 'Pickups', 'Switching', 'Neck joint']);
const withoutGrade = (value: string) => value.replace(/\s+A{3,5}$/, '');
const maxRange = 4;

// Tuners differ guitar by guitar, so a range of them says little about the model.
const noRange = new Set(['Tuners']);

// "Chambered sapele, sapele or mahogany": later items start lower-case unless they are a name.
const names = /^(Honduran|Santos|Claro|Gotoh|Kluson|Grover|Wilkinson|Schaller|Nashville|Guyker|ABM|ABR)\b/;
function orList(values: string[]): string {
  const items = values.map((v, i) => (i === 0 || names.test(v) ? v : v.charAt(0).toLowerCase() + v.slice(1)));
  return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} or ${items.at(-1)}`;
}

export function commonSpecs(code: string): SpecRow[] {
  const group = guitars.filter((g) => g.model.code === code);
  if (group.length === 0) return [];
  const rowsOf = (g: Guitar) => g.specGroups.flatMap((sg) => sg.rows);
  const labels = rowsOf(group[0])
    .map((row) => row.label)
    .filter((label) => !everyGuitar.has(label));

  return labels.flatMap((label) => {
    const values = group.map((g) => rowsOf(g).find((r) => r.label === label)?.value);
    if (values.some((v) => !v)) return [];

    // Distinct values, most common first.
    const counts = new Map<string, number>();
    for (const v of values) counts.set(withoutGrade(v!), (counts.get(withoutGrade(v!)) ?? 0) + 1);
    const distinct = [...counts].sort((a, b) => b[1] - a[1]).map(([v]) => v);
    if (distinct.length > maxRange || (distinct.length > 1 && noRange.has(label))) return [];

    if (label === 'Controls' && distinct.length > 1) {
      const kinds = switches.filter((kind) => distinct.includes(sharedSpecs.controls(kind)));
      kinds.sort((a, b) => counts.get(sharedSpecs.controls(b))! - counts.get(sharedSpecs.controls(a))!);
      return [{ label, value: sharedSpecs.controls(orList(kinds)) }];
    }
    return [{ label, value: orList(distinct) }];
  });
}

// One line of facts about a model, e.g. "Single cut, inset carved maple top, high gloss nitro finish".
// Used under the model name on Home and in the strip on the Guitars page. Only specs the whole
// model shares are used, never a range.
const lowerFirst = (v: string) => (names.test(v) ? v : v.charAt(0).toLowerCase() + v.slice(1));

export function modelSummary(code: string): string {
  const own: readonly { label: string; value: string }[] = getModel(code)?.specs ?? [];
  const shared = commonSpecs(code).filter((spec) => !spec.value.includes(' or '));
  const find = (label: string) => (own.find((x) => x.label === label) ?? shared.find((x) => x.label === label))?.value;
  const shape = find('Body shape');
  const top = find('Top');
  const body = find('Body wood');
  const finish = find('Finish');
  const facts = [
    shape && !shape.startsWith('Unique') && shape,
    top && `${lowerFirst(top)} top`,
    body && `${lowerFirst(body)} body`,
    finish && `${lowerFirst(finish)} finish`,
  ].filter((fact): fact is string => Boolean(fact));
  const line = facts.slice(0, 3).join(', ');
  return line.charAt(0).toUpperCase() + line.slice(1);
}
