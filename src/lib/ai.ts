import api from './api';
import type { AiDesign, AiQuota } from '@/types';

export interface GenerateInput {
  prompt: string;
  garmentType?: string;
  occasion?: string;
  fabric?: string;
  colour?: string;
  count?: number;
  aspectRatio?: '3:4' | '1:1' | '9:16';
}

/** Generation can take a while on Vertex — allow up to 2 minutes. */
export async function generateDesign(input: GenerateInput): Promise<AiDesign> {
  return (await api.post<AiDesign>('/ai-studio/generate', input, { timeout: 120000 })).data;
}

export async function getQuota(): Promise<AiQuota> {
  return (await api.get<AiQuota>('/ai-studio/quota')).data;
}

export async function listDesigns(params: { saved?: boolean; limit?: number; before?: string } = {}): Promise<AiDesign[]> {
  return (await api.get<AiDesign[]>('/ai-studio/designs', { params })).data;
}

export async function getDesign(id: string): Promise<AiDesign> {
  return (await api.get<AiDesign>(`/ai-studio/designs/${id}`)).data;
}

export async function updateDesign(id: string, input: { saved?: boolean; selectedIndex?: number }): Promise<AiDesign> {
  return (await api.patch<AiDesign>(`/ai-studio/designs/${id}`, input)).data;
}

export async function deleteDesign(id: string): Promise<void> {
  await api.delete(`/ai-studio/designs/${id}`);
}
