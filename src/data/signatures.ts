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

// Signature contributions every guitar of a model has, besides the neck joint.
// Every guitar has the headstock: each model's headstock is Dimo's own design.
const byModel: Record<string, readonly Anchor[]> = {
  D: ['maple-top', 'headstock'],
  M: ['headstock'],
  R: ['headstock'],
  RC: ['headstock'],
  DH: ['headstock'],
};

// The neck joint is set per guitar, in the `neck_joint` column of inventory.csv.
export function signaturesFor(modelCode: string, asymmetricJoint: boolean) {
  const anchors: Anchor[] = [...(asymmetricJoint ? (['neck-joint'] as const) : []), ...(byModel[modelCode] ?? [])];
  return signatures.filter((s) => anchors.includes(s.anchor));
}
