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
