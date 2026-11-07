import type { ImageMetadata } from 'astro';

export const angles = [
  { key: 'front', suffix: '_Front_Full_Body.jpg', aspect: '5 / 7', alt: 'front', label: 'Front, full body' },
  { key: 'back', suffix: '_Back_Full_Body.jpg', aspect: '5 / 7', alt: 'back', label: 'Back, full body' },
  { key: 'frontCrop', suffix: '_Front_Body_Crop.jpg', aspect: '4 / 5', alt: 'front body detail', label: 'Front, body close-up' },
  { key: 'backCrop', suffix: '_Back_Body_Crop.jpg', aspect: '4 / 5', alt: 'back body detail', label: 'Back, body close-up' },
  { key: 'side', suffix: '_Side_Body.jpg', aspect: '7 / 5', alt: 'side', label: 'Side of body' },
  { key: 'headstock', suffix: '_Headstocks.jpg', aspect: '5 / 7', alt: 'headstock', label: 'Headstock' },
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

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/guitars/**/*.jpg', { eager: true });

export function getPhoto(id: string, angle: AngleKey): Photo {
  const def = angles.find((a) => a.key === angle)!;
  return {
    angle,
    aspect: def.aspect,
    alt: `Dimo ${id} handmade electric guitar, ${def.alt}`,
    label: def.label,
    image: files[`/src/assets/guitars/${id}/${id}${def.suffix}`]?.default ?? null,
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
