import type { ImageMetadata } from 'astro';

// Gallery order: tallest frames first.
export const angles = [
  { key: 'front', suffix: '_Front_Full_Body.jpg', aspect: '5 / 7', alt: 'front', label: 'Front, full body' },
  { key: 'back', suffix: '_Back_Full_Body.jpg', aspect: '5 / 7', alt: 'back', label: 'Back, full body' },
  { key: 'headstock', suffix: '_Headstocks.jpg', aspect: '5 / 7', alt: 'headstock', label: 'Headstock' },
  { key: 'frontCrop', suffix: '_Front_Body_Crop.jpg', aspect: '4 / 5', alt: 'front body detail', label: 'Front, body close-up' },
  { key: 'backCrop', suffix: '_Back_Body_Crop.jpg', aspect: '4 / 5', alt: 'back body detail', label: 'Back, body close-up' },
  { key: 'side', suffix: '_Side_Body.jpg', aspect: '7 / 5', alt: 'side', label: 'Side of body' },
] as const;

export type AngleKey = (typeof angles)[number]['key'];

export type Photo = {
  angle: AngleKey;
  aspect: string;
  alt: string;
  label: string;
  // Null when the file hasn't been imported; render a --photo-bg placeholder instead.
  image: ImageMetadata | null;
};

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/guitars/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
});

// Each guitar's JSON names its photos by path (set by hand or uploaded through Pages CMS).
// Keys there are snake_case to match the other JSON fields.
const guitarFiles = import.meta.glob<{ photos?: Record<string, string> }>('/src/data/guitars/*.json', {
  eager: true,
  import: 'default',
});
const jsonKey: Record<AngleKey, string> = {
  front: 'front',
  back: 'back',
  headstock: 'headstock',
  frontCrop: 'front_crop',
  backCrop: 'back_crop',
  side: 'side',
};

function photoPath(id: string, angle: AngleKey): string {
  const set = guitarFiles[`/src/data/guitars/${id}.json`]?.photos?.[jsonKey[angle]];
  if (set) {
    const path = set.startsWith('/') ? set : `/${set}`;
    if (!files[path]) throw new Error(`src/data/guitars/${id}.json: photo "${set}" not found.`);
    return path;
  }
  // Blank in the JSON: fall back to the file name `npm run photos` writes.
  const def = angles.find((a) => a.key === angle)!;
  return `/src/assets/guitars/${id}/${id}${def.suffix}`;
}

export function getPhoto(id: string, angle: AngleKey): Photo {
  const def = angles.find((a) => a.key === angle)!;
  return {
    angle,
    aspect: def.aspect,
    alt: `Dimo ${id} handmade electric guitar, ${def.alt}`,
    label: def.label,
    image: files[photoPath(id, angle)]?.default ?? null,
  };
}

export function getPhotos(id: string): Photo[] {
  return angles.map((a) => getPhoto(id, a.key));
}

// Responsive widths capped at the source width, so small sources aren't upscaled.
export function widthsFor(image: ImageMetadata, candidates: number[]): number[] {
  const fits = candidates.filter((w) => w < image.width);
  return fits.length < candidates.length ? [...fits, image.width] : fits;
}
