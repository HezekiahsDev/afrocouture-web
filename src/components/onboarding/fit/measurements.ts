import type { DrapeSilhouette, FitProfile, MeasurementUnit } from '@/types';

export type MeasurementKey = 'chest' | 'shoulderWidth' | 'sleeveLength' | 'kaftanLength' | 'waist' | 'neck';

export const MEASUREMENTS: {
  key: MeasurementKey;
  label: string;
  how: string;
  /** Typical adult range in inches, shown as a placeholder hint. */
  typicalIn: [number, number];
}[] = [
  {
    key: 'chest',
    label: 'Chest / bust',
    how: 'Around the fullest part of the chest, under the arms, tape level.',
    typicalIn: [32, 50],
  },
  {
    key: 'shoulderWidth',
    label: 'Shoulder width',
    how: 'Across the back, from one shoulder point to the other.',
    typicalIn: [15, 22],
  },
  {
    key: 'sleeveLength',
    label: 'Sleeve length',
    how: 'From the shoulder point down to the wrist bone, arm relaxed.',
    typicalIn: [22, 28],
  },
  {
    key: 'kaftanLength',
    label: 'Kaftan / agbada length',
    how: 'From the base of the neck at the back down to where the hem should fall.',
    typicalIn: [40, 62],
  },
  {
    key: 'waist',
    label: 'Waist',
    how: 'Around the natural waist, just above the navel. Keep one finger of ease.',
    typicalIn: [26, 46],
  },
  {
    key: 'neck',
    label: 'Neck',
    how: 'Around the base of the neck where a collar sits, one finger of ease.',
    typicalIn: [13, 19],
  },
];

export const SILHOUETTES: { id: DrapeSilhouette; title: string; tag: string; description: string }[] = [
  {
    id: 'slim_modern',
    title: 'Slim modern',
    tag: 'Close fit',
    description: 'Tapered cuts, fitted armholes and a sharp chest line. Suits modern senator wear.',
  },
  {
    id: 'classic_regal',
    title: 'Classic regal',
    tag: 'Generous drape',
    description: 'Flowing drape with room for agbada wings, babanriga folds and grand kaftans.',
  },
  {
    id: 'relaxed_casual',
    title: 'Relaxed casual',
    tag: 'Easy fit',
    description: 'Breathable ease and wider sleeves for linen and everyday Ankara pieces.',
  },
];

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta',
  'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

export const MIN_MEASURE = 5;
export const MAX_MEASURE = 200;
export const PHONE_PATTERN = /^\+?[0-9 ]{7,16}$/;

export const round1 = (n: number) => Math.round(n * 10) / 10;

/** Convert a typed value between units, keeping blanks blank. */
export function convert(value: string, from: MeasurementUnit, to: MeasurementUnit): string {
  if (from === to || value.trim() === '') return value;
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return String(round1(to === 'cm' ? n * 2.54 : n / 2.54));
}

export function typicalRange(range: [number, number], unit: MeasurementUnit): string {
  const [lo, hi] = unit === 'cm' ? range.map((n) => Math.round(n * 2.54)) : range;
  return `${lo}–${hi}`;
}

/** Error for one field, or '' when valid. Blank is allowed — measurements can be added later. */
export function measurementError(value: string): string {
  if (value.trim() === '') return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return 'Enter a number.';
  if (n < MIN_MEASURE || n > MAX_MEASURE) return `Enter a value between ${MIN_MEASURE} and ${MAX_MEASURE}.`;
  return '';
}

export type MeasurementValues = Record<MeasurementKey, string>;

export const emptyMeasurements = (): MeasurementValues => ({
  chest: '',
  shoulderWidth: '',
  sleeveLength: '',
  kaftanLength: '',
  waist: '',
  neck: '',
});

export function measurementsFrom(profile: FitProfile | null): MeasurementValues {
  const values = emptyMeasurements();
  if (!profile) return values;
  for (const { key } of MEASUREMENTS) {
    const v = profile[key];
    values[key] = v === null || v === undefined ? '' : String(v);
  }
  return values;
}
