import api from './api';
import type {
  Fabric,
  FitProfile,
  MerchantProfile,
  SavedItem,
  SavedItemType,
  Style,
  Tailor,
  TailorProfile,
  UploadedAsset,
  UploadPurpose,
} from '@/types';

export const naira = (value: number) => `₦${value.toLocaleString('en-NG')}`;

/** Nest serialises a `null` return as an empty body; normalise that to null. */
const orNull = <T>(data: T | '' | null | undefined): T | null => (data ? data : null);

// ── Public catalogue ──

export async function getStyles(): Promise<Style[]> {
  return (await api.get<Style[]>('/styles')).data;
}

export async function getTailors(params: { city?: string; q?: string } = {}): Promise<Tailor[]> {
  return (await api.get<Tailor[]>('/tailors', { params })).data;
}

export async function getTailor(id: string): Promise<Tailor> {
  return (await api.get<Tailor>(`/tailors/${id}`)).data;
}

export async function getFabrics(params: { category?: string; q?: string } = {}): Promise<Fabric[]> {
  return (await api.get<Fabric[]>('/fabrics', { params })).data;
}

export async function getFabric(id: string): Promise<Fabric> {
  return (await api.get<Fabric>(`/fabrics/${id}`)).data;
}

export async function getFabricCategories(): Promise<string[]> {
  return (await api.get<string[]>('/fabrics/categories')).data;
}

// ── Saved artisans and fabric selection ──

export async function getSaved(): Promise<SavedItem[]> {
  return (await api.get<SavedItem[]>('/saved')).data;
}

export async function saveItem(itemType: SavedItemType, itemId: string, quantity?: number): Promise<SavedItem> {
  return (await api.put<SavedItem>(`/saved/${itemType}/${itemId}`, quantity ? { quantity } : {})).data;
}

export async function unsaveItem(itemType: SavedItemType, itemId: string): Promise<void> {
  await api.delete(`/saved/${itemType}/${itemId}`);
}

// ── Onboarding profiles ──

export async function getMyFitProfile(): Promise<FitProfile | null> {
  return orNull((await api.get<FitProfile | ''>('/measurements/me')).data);
}

export async function saveMyFitProfile(input: Partial<Omit<FitProfile, 'id' | 'updatedAt'>>): Promise<FitProfile> {
  return (await api.put<FitProfile>('/measurements/me', input)).data;
}

export async function getMyTailorProfile(): Promise<TailorProfile | null> {
  return orNull((await api.get<TailorProfile | ''>('/tailors/me/profile')).data);
}

export async function saveMyTailorProfile(input: Partial<TailorProfile>): Promise<TailorProfile> {
  return (await api.put<TailorProfile>('/tailors/me/profile', input)).data;
}

export async function submitMyTailorProfile(): Promise<TailorProfile> {
  return (await api.post<TailorProfile>('/tailors/me/submit')).data;
}

export async function getMyMerchantProfile(): Promise<MerchantProfile | null> {
  return orNull((await api.get<MerchantProfile | ''>('/merchants/me/profile')).data);
}

export async function saveMyMerchantProfile(input: Partial<MerchantProfile>): Promise<MerchantProfile> {
  return (await api.put<MerchantProfile>('/merchants/me/profile', input)).data;
}

export async function submitMyMerchantProfile(): Promise<MerchantProfile> {
  return (await api.post<MerchantProfile>('/merchants/me/submit')).data;
}

// ── Uploads (stored on Cloudinary by the API) ──

export async function uploadFile(
  file: File,
  purpose: UploadPurpose,
  onProgress?: (percent: number) => void,
): Promise<UploadedAsset> {
  const body = new FormData();
  body.append('file', file);
  const { data } = await api.post<UploadedAsset>('/uploads', body, {
    params: { purpose },
    timeout: 120000,
    onUploadProgress: (event) => {
      if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  return data;
}
