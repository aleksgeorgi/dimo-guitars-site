// Display order everywhere: D, M, R, RC, DH.
export const models = [
  { code: 'D', slug: 'd', fullName: 'Dimo D' },
  { code: 'M', slug: 'm', fullName: 'Dimo M' },
  { code: 'R', slug: 'r', fullName: 'Dimo R' },
  { code: 'RC', slug: 'rc', fullName: 'Dimo RC' },
  { code: 'DH', slug: 'dh', fullName: 'Dimo DH' },
] as const;

export type Model = (typeof models)[number];
export type ModelCode = Model['code'];

export function getModel(code: string): Model | undefined {
  return models.find((m) => m.code === code);
}
