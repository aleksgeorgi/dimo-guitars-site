import type { AngleKey } from '../lib/photos';

// Dimo's three signature contributions, in order. `anchor` is the section id on /about.
// Titles here are used on Home and on guitar pages; the About page takes its titles from DGPhilosophy.md.
export const signatures = [
  {
    numeral: 'I.',
    anchor: 'neck-joint',
    title: 'Asymmetric 22° Set-Neck Joint',
    short: 'The neck joint',
    summary:
      'Original engineering in the spirit of tradition: an asymmetric glued-in joint with precisely oriented 22° lateral surfaces.',
    angle: 'backCrop',
  },
  {
    numeral: 'II.',
    anchor: 'maple-top',
    title: 'Inset Carved Maple Top',
    short: 'The maple top',
    summary:
      'The natural beauty of wood, uninterrupted. Figured maple set flush into the body, framed by a border of natural wood instead of plastic binding.',
    angle: 'frontCrop',
  },
  {
    numeral: 'III.',
    anchor: 'headstock',
    title: 'Characteristic Headstock',
    short: 'The headstock',
    summary: "The crown of the instrument. A rounded silhouette with two ornamental openings and the maker's signature.",
    angle: 'headstock',
  },
] as const satisfies readonly { angle: AngleKey; [key: string]: string }[];

type Anchor = (typeof signatures)[number]['anchor'];

// Which signature contributions each model has, as confirmed by Dimo (Nov 2026).
// The headstock contribution describes the D headstock, which the DH shares.
const byModel: Record<string, readonly Anchor[]> = {
  D: ['neck-joint', 'maple-top', 'headstock'],
  M: ['neck-joint'],
  R: ['neck-joint'],
  RC: [],
  DH: ['headstock'],
};

// Individual guitars that differ from their model. A listed guitar gets exactly these.
const byGuitar: Record<string, readonly Anchor[]> = {
  // Traditional set-neck joint instead of the asymmetric one.
  'M-102': [],
  'M-106': [],
  'M-108': [],
  // Has the R headstock.
  'DH-005': [],
};

export function signaturesFor(guitarId: string, modelCode: string) {
  const anchors = byGuitar[guitarId] ?? byModel[modelCode] ?? [];
  return signatures.filter((s) => anchors.includes(s.anchor));
}
