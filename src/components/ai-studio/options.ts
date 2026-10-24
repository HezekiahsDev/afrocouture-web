import type { AiDesign } from '@/types';

export const GARMENT_TYPES = [
  'Agbada',
  'Kaftan',
  'Senator',
  'Aso Ebi gown',
  'Iro & buba',
  'Dashiki',
  'Suit',
  'Jumpsuit',
];
export const OCCASIONS = ['Wedding', 'Traditional engagement', 'Owambe party', 'Church / Jumat', 'Office', 'Everyday'];
export const FABRICS = ['Ankara', 'Aso Oke', 'Lace', 'Brocade', 'Adire', 'Voile', 'Silk'];
export const COLOURS = ['Royal blue', 'Emerald', 'Wine', 'Gold', 'Ivory', 'Black', 'Coral', 'Earth tones'];

export const ASPECT_RATIOS: { id: AiDesign['aspectRatio']; label: string }[] = [
  { id: '3:4', label: 'Portrait 3:4' },
  { id: '1:1', label: 'Square' },
  { id: '9:16', label: 'Tall 9:16' },
];

export const EXAMPLE_PROMPTS = [
  'A flowing royal blue agbada with hand-stitched gold embroidery around the neckline, for a groom',
  'A fitted emerald lace Aso Ebi gown with a mermaid hem and off-shoulder sleeves',
  'A relaxed linen kaftan in earth tones with subtle Adire panels for everyday wear',
  'A modern two-piece senator suit in charcoal with tonal embroidery on the placket',
];

export const PROMPT_MIN = 10;
export const PROMPT_MAX = 400;

/** CSS aspect-ratio value for a design's ratio string. */
export const ratioCss = (ratio: string) => ratio.replace(':', ' / ');
