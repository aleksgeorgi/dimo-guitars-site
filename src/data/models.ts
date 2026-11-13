// Display order everywhere: D, M, R, RC, DH.
//
// `specs` are the model-level facts confirmed by Dimo (Nov 2026). They describe the model as a
// whole; individual guitars can differ (M-102, M-106 and M-108 have a traditional set-neck joint,
// and DH-005 has the R headstock). `href` links a spec to its section on /about.
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

const pickups: Spec = { label: 'Pickups', value: 'Dimo humbuckers' };
const asymmetricJoint = 'Asymmetric 22° set-neck';
const traditionalJoint = 'Traditional set-neck';

export const models = [
  {
    code: 'D',
    slug: 'd',
    fullName: 'Dimo D',
    showcase: 'D-105',
    description: '',
    specs: [
      { label: 'Neck joint', value: asymmetricJoint, href: '/about#neck-joint' },
      { label: 'Top', value: 'Inset carved maple', href: '/about#maple-top' },
      { label: 'Headstock', value: 'D design', href: '/about#headstock' },
      { label: 'Body', value: 'Single cut' },
      pickups,
    ],
  },
  {
    code: 'M',
    slug: 'm',
    fullName: 'Dimo M',
    showcase: 'M-103',
    description: '',
    specs: [
      { label: 'Neck joint', value: `${asymmetricJoint} on most instruments`, href: '/about#neck-joint' },
      { label: 'Headstock', value: 'Unique to the M' },
      { label: 'Body', value: 'Unique to the M' },
      pickups,
    ],
  },
  {
    code: 'R',
    slug: 'r',
    fullName: 'Dimo R',
    showcase: 'R-104',
    description: '',
    specs: [
      { label: 'Neck joint', value: asymmetricJoint, href: '/about#neck-joint' },
      { label: 'Headstock', value: 'R design' },
      { label: 'Body', value: 'Double cut' },
      pickups,
    ],
  },
  {
    code: 'RC',
    slug: 'rc',
    fullName: 'Dimo RC',
    showcase: 'RC-101',
    description: '',
    specs: [
      { label: 'Neck joint', value: traditionalJoint },
      { label: 'Headstock', value: 'R design' },
      { label: 'Body', value: 'Double cut' },
      pickups,
    ],
  },
  {
    code: 'DH',
    slug: 'dh',
    fullName: 'Dimo DH',
    showcase: 'DH-001',
    description: '',
    specs: [
      { label: 'Neck joint', value: traditionalJoint },
      { label: 'Headstock', value: 'D design', href: '/about#headstock' },
      { label: 'Body', value: 'Single cut' },
      pickups,
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
