// Display order everywhere: D, M, R, RC, DH.
//
// `specs` are model-level facts set by hand (headstock, body shape, the D's inset top).
// `href` links a spec to its section on /about. The neck joint is not here: it is set per guitar
// in src/data/guitars/, and /guitars works out each model's line from that.
// Specs that come from the inventory (woods, finish, hardware) are added to these on /guitars
// automatically, when every guitar of the model shares them: see commonSpecs in src/lib/inventory.ts.
// `showcase` is the guitar whose photos represent the model on /guitars.
// `description` is shown on /guitars once written; leave it empty until then.

type Spec = { label: string; value: string; href?: string };

type ModelDef = {
  code: string;
  slug: string;
  fullName: string;
  showcase: string;
  description: string;
  specs: readonly Spec[];
};


export const models = [
  {
    code: 'D',
    slug: 'd',
    fullName: 'Dimo D',
    showcase: 'D-105',
    description: '',
    specs: [
      { label: 'Top', value: 'Inset carved maple', href: '/about#maple-top' },
      { label: 'Headstock', value: 'D design', href: '/about#headstock' },
      { label: 'Body shape', value: 'Single cut' },
    ],
  },
  {
    code: 'M',
    slug: 'm',
    fullName: 'Dimo M',
    showcase: 'M-103',
    description: '',
    specs: [
      { label: 'Headstock', value: 'Unique to the M' },
      { label: 'Body shape', value: 'Unique to the M' },
    ],
  },
  {
    code: 'R',
    slug: 'r',
    fullName: 'Dimo R',
    showcase: 'R-104',
    description: '',
    specs: [
      { label: 'Headstock', value: 'R design' },
      { label: 'Body shape', value: 'Double cut' },
    ],
  },
  {
    code: 'RC',
    slug: 'rc',
    fullName: 'Dimo RC',
    showcase: 'RC-101',
    description: '',
    specs: [
      { label: 'Headstock', value: 'R design' },
      { label: 'Body shape', value: 'Double cut' },
    ],
  },
  {
    code: 'DH',
    slug: 'dh',
    fullName: 'Dimo DH',
    showcase: 'DH-001',
    description: '',
    specs: [
      { label: 'Headstock', value: 'D design', href: '/about#headstock' },
      { label: 'Body shape', value: 'Single cut' },
    ],
  },
] as const satisfies readonly ModelDef[];

export type Model = (typeof models)[number];
export type ModelCode = Model['code'];

export function getModel(code: string): Model | undefined {
  return models.find((m) => m.code === code);
}

// How the models are grouped on /guitars. RC and DH are the predecessors of R and D
// and are presented together.
type FamilyDef = { anchor: string; label: string; title: string; intro: string; models: readonly ModelCode[] };

export const families: readonly FamilyDef[] = [
  { anchor: 'd', label: 'D', title: '', intro: '', models: ['D'] },
  { anchor: 'm', label: 'M', title: '', intro: '', models: ['M'] },
  { anchor: 'r', label: 'R', title: '', intro: '', models: ['R'] },
  {
    anchor: 'heritage',
    label: 'Heritage: RC and DH',
    title: 'The RC and the DH',
    intro: 'The predecessors of the R and the D, built with a traditional set-neck joint.',
    models: ['RC', 'DH'],
  },
];
