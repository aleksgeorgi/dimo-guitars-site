import type { AngleKey } from '../lib/photos';

// The three signature elements, in order. `anchor` is the section id on /about.
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
    title: 'Sculpted Headstock',
    short: 'The headstock',
    summary: "The crown of the instrument. A rounded silhouette with two ornamental openings and the maker's signature.",
    angle: 'headstock',
  },
] as const satisfies readonly { angle: AngleKey; [key: string]: string }[];
